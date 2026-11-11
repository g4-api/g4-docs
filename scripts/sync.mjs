import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import MarkdownIt from 'markdown-it';

const root = fileURLToPath(new URL('../', import.meta.url));
const parser = new MarkdownIt({ html: true });
const invokeGit = promisify(execFile);
const assetExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.ico', '.pdf', '.mp4']);

/** Read Markdown tokens and HTML image attributes without interpreting links inside code fences. */
function getMediaLinks(text) {
    const links = [];

    for (const token of parser.parse(text, {})) {
        for (const child of token.children ?? []) {
            const destination = child.attrGet('src') ?? child.attrGet('href');

            if (destination) {
                links.push(destination);
            }
        }

        const html = token.type === 'html_block' ? token.content : '';

        for (const attribute of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
            links.push(attribute[1]);
        }
    }

    return links;
}

/** Resolve the branch to a commit rather than mistaking GitHub's root tree SHA for a commit. */
async function getSourceCommit(source) {
    const { stdout } = await invokeGit('git', ['ls-remote', `https://github.com/${source.repository}.git`,
        `refs/heads/${source.ref}`, `refs/tags/${source.ref}`, `refs/tags/${source.ref}^{}`]);
    const lines = stdout.trim().split('\n');
    const reference = lines.at(-1).split(/\s+/)[0];

    if (!/^[a-f\d]{40}$/.test(reference)) {
        throw new Error(`Cannot resolve ${source.repository}@${source.ref}`);
    }

    return reference;
}

/** Keep concurrent downloads bounded so large plugin catalogs do not overwhelm GitHub. */
async function invokePool(items, action) {
    const results = new Array(items.length);
    let cursor = 0;

    async function invokeWorker() {
        while (cursor < items.length) {
            const index = cursor++;
            results[index] = await action(items[index]);
        }
    }

    await Promise.all(Array.from({ length: Math.min(6, items.length) }, invokeWorker));
    return results;
}

/** Decode a GitHub inventory only after HTTP errors have been rejected. */
async function requestJson(url) {
    return (await requestResponse(url)).json();
}

/** Retry transient network failures while keeping credentials restricted to the GitHub API host. */
async function requestResponse(url) {
    const headers = { 'User-Agent': 'g4-docs-importer' };

    if (process.env.GITHUB_TOKEN && new URL(url).hostname === 'api.github.com') {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await fetch(url, { headers, signal: AbortSignal.timeout(45000) });

            if (response.ok) {
                return response;
            }

            if (response.status < 500) {
                throw new Error(`HTTP ${response.status}: ${url}`);
            }
        } catch (error) {
            if (attempt === 2 || error.message.startsWith('HTTP ')) {
                throw error;
            }
        }
    }

    throw new Error(`Download failed: ${url}`);
}

/** Retrieve UTF-8 source documents without changing upstream Markdown. */
async function requestText(url) {
    return (await requestResponse(url)).text();
}

/** Contain every repository path inside staging before writing downloaded bytes. */
async function saveFile(directory, path, content) {
    const target = resolve(directory, path);
    const isContained = target.startsWith(`${directory}/`) || target.startsWith(`${directory}\\`);

    if (!isContained) {
        throw new Error(`Unsafe source path: ${path}`);
    }

    await mkdir(resolve(target, '..'), { recursive: true });
    await writeFile(target, content);
}

/** Generate a complete repository index, including intentionally linked and retired projects. */
async function saveIndex(staging, manifest, lock) {
    const lines = ['# Repository index', '',
        'Browse every registered source. Imported pages retain their original repository paths.', '',
        '| Repository | Area | Documentation | Status |', '| --- | --- | --- | --- |'];

    for (const source of manifest.sources) {
        const imported = lock.sources.find(item => item.repository === source.repository);
        const upstream = `https://github.com/${source.repository}`;
        const label = imported ? `${imported.documents.length} pages` : 'Source repository';
        const destination = imported ? `./products/${source.slug}/README.md` : upstream;
        lines.push(`| [${source.title}](${upstream}) | ${source.area} | [${label}](${destination}) | ${source.status} |`);
    }

    await writeFile(resolve(staging, 'repositories.md'), `${lines.join('\n')}\n`);
}

/**
 * Download approved source documents into a staging directory before replacing imports.
 * A network or integrity failure leaves the existing published collection intact.
 * Locked mode replays recorded revisions; normal mode follows manifest refs.
 */
async function syncSources() {
    // Read the allowlist before network access so unlisted repositories cannot enter a public build.
    const manifest = JSON.parse(await readFile(resolve(root, 'sources.json'), 'utf8'));
    const slugs = manifest.sources.map(source => source.slug);

    if (new Set(slugs).size !== slugs.length || manifest.sources.some(source => !/^[a-z\d-]+$/.test(source.slug))) {
        throw new Error('Source slugs must be unique, lowercase directory names.');
    }
    const isLocked = process.argv.includes('--locked');
    let previous = { sources: [] };

    if (isLocked) {
        previous = JSON.parse(await readFile(resolve(root, 'sources.lock.json'), 'utf8'));
    }

    const staging = resolve(root, '.sync-staging');
    await rm(staging, { recursive: true, force: true });
    await mkdir(resolve(staging, 'products'), { recursive: true });
    const sources = [];

    // Process repositories sequentially while file downloads use a bounded worker pool.
    for (const source of manifest.sources) {
        if (source.mode !== 'import') {
            continue;
        }

        const locked = previous.sources.find(item => item.repository === source.repository);

        if (isLocked && !locked) {
            throw new Error(`No locked revision for ${source.repository}`);
        }

        const reference = isLocked ? locked.commit : await getSourceCommit(source);
        const tree = await requestJson(`https://api.github.com/repos/${source.repository}/git/trees/${reference}?recursive=1`);

        if (tree.truncated || !Array.isArray(tree.tree)) {
            throw new Error(`Incomplete inventory for ${source.repository}`);
        }

        const blobs = tree.tree.filter(item => item.type === 'blob' && item.mode !== '120000');
        const documents = blobs.filter(item => testDocument(item.path, source));
        const commit = reference;
        const directory = resolve(staging, 'products', source.slug);
        const contents = await invokePool(documents, async item => {
            const text = await requestText(`https://raw.githubusercontent.com/${source.repository}/${commit}/${encodeURI(item.path)}`);
            await saveFile(directory, item.path, text);
            return { path: item.path, text };
        });

        // Copy only referenced media so large runtime packages never inflate the documentation repository.
        const assets = new Set();

        for (const document of contents) {
            for (const destination of getMediaLinks(document.text)) {
                const pathname = destination.split(/[?#]/)[0];

                if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(pathname)) {
                    continue;
                }

                let decoded;

                try {
                    decoded = decodeURIComponent(pathname);
                } catch {
                    continue;
                }

                const relative = posix.join(posix.dirname(document.path), decoded);
                const target = decoded.startsWith('/') ? decoded.slice(1) : relative;
                const isMedia = assetExtensions.has(posix.extname(target).toLowerCase());

                if (isMedia && blobs.some(item => item.path === target)) {
                    assets.add(target);
                }
            }
        }

        await invokePool([...assets], async path => {
            const response = await requestResponse(`https://raw.githubusercontent.com/${source.repository}/${commit}/${encodeURI(path)}`);
            await saveFile(directory, path, Buffer.from(await response.arrayBuffer()));
        });

        // Bind committed bytes to their import so accidental local edits fail validation.
        const hashes = {};

        for (const path of [...documents.map(item => item.path), ...assets].sort()) {
            hashes[path] = createHash('sha256').update(await readFile(resolve(directory, path))).digest('hex');
        }

        // Record exact file ownership and revisions so builds work offline and edits route upstream.
        sources.push({ ...source, url: `https://github.com/${source.repository}`, commit,
            documents: documents.map(item => item.path).sort(), assets: [...assets].sort(), hashes });
        console.log(`${source.repository}: ${documents.length} pages, ${assets.size} assets`);
    }

    const lock = { version: 1, sources };
    await writeFile(resolve(staging, 'sources.lock.json'), `${JSON.stringify(lock, null, 2)}\n`);
    await saveIndex(staging, manifest, lock);

    // Promote only fully downloaded imports; authored guides and legacy files are outside this directory.
    const promotions = [
        ['products', 'content/products'],
        ['sources.lock.json', 'sources.lock.json'],
        ['repositories.md', 'content/repositories.md']
    ];
    const completed = [];

    try {
        for (const [name, destination] of promotions) {
            const target = resolve(root, destination);
            const backup = resolve(staging, `previous-${name}`);
            let isBackupAvailable = false;

            try {
                await rename(target, backup);
                isBackupAvailable = true;
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    throw error;
                }
            }

            completed.push({ target, backup, isBackupAvailable });
            await rename(resolve(staging, name), target);
        }
    } catch (error) {
        // Restore metadata and content together if any promotion fails midway through the transaction.
        for (const item of completed.reverse()) {
            await rm(item.target, { recursive: true, force: true });

            if (item.isBackupAvailable) {
                await rename(item.backup, item.target);
            }
        }

        throw error;
    }

    await rm(staging, { recursive: true, force: true });
    console.log(`Imported ${sources.reduce((total, source) => total + source.documents.length, 0)} pages.`);
}

/** Apply explicit source roots and exclusions; executable skills and test records stay upstream. */
function testDocument(path, source) {
    const isMarkdown = path.toLowerCase().endsWith('.md');
    const isIncluded = source.paths.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
    const isExcluded = source.exclude.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
    return isMarkdown && isIncluded && !isExcluded;
}

// Run the command once and surface failures to CI without exposing environment credentials.
syncSources().catch(error => {
    console.error(error instanceof Error ? error.message : 'Documentation import failed');
    process.exitCode = 1;
});
