import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import MarkdownIt from 'markdown-it';

import { resolveLink } from './links.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const parser = new MarkdownIt({ html: false });

/** Walk imported files only; the caller checks ownership against the lock. */
async function getFiles(directory) {
    const files = [];

    for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            const children = await getFiles(resolve(directory, entry.name));
            files.push(...children.map(child => `${entry.name}/${child}`));
        } else {
            files.push(entry.name);
        }
    }

    return files;
}

/** Read parser-recognized links while ignoring illustrative URLs inside fenced code. */
function getLinks(text) {
    const links = [];

    for (const token of parser.parse(text, {})) {
        for (const child of token.children ?? []) {
            const destination = child.attrGet('href') ?? child.attrGet('src');

            if (destination) {
                links.push(destination);
            }
        }
    }

    return links;
}
/** Verify committed imports and authored links without fetching source repositories. */
async function testCollection() {
    const manifest = JSON.parse(await readFile(resolve(root, 'sources.json'), 'utf8'));
    const lock = JSON.parse(await readFile(resolve(root, 'sources.lock.json'), 'utf8'));
    const warnings = [];
    const errors = [];
    const expectedFiles = new Set();

    // Enforce a one-to-one source contract so removing an allowlist entry cannot publish stale content.
    for (const source of manifest.sources.filter(item => item.mode === 'import')) {
        const imported = lock.sources.find(item => item.repository === source.repository);

        if (!imported || imported.slug !== source.slug || imported.ref !== source.ref) {
            errors.push(`Run docs:sync after changing ${source.repository}`);
            continue;
        }

        if (Object.keys(source).some(key => JSON.stringify(source[key]) !== JSON.stringify(imported[key]))) {
            errors.push(`Source settings changed; run docs:sync: ${source.repository}`);
        }

        if (!/^[a-f\d]{40}$/.test(imported.commit) || !imported.documents.includes('README.md')) {
            errors.push(`Invalid source lock or missing landing page: ${source.repository}`);
        }

        const inventory = [...imported.documents, ...imported.assets];

        for (const path of inventory) {
            const relative = `products/${source.slug}/${path}`;
            expectedFiles.add(relative);
            const file = resolve(root, 'content', relative);
            const isContained = file.startsWith(resolve(root, 'content/products') + '/')
                || file.startsWith(resolve(root, 'content/products') + '\\');

            if (!isContained) {
                errors.push(`Unsafe inventory path: ${relative}`);
                continue;
            }

            try {
                const bytes = await readFile(file);
                const digest = createHash('sha256').update(bytes).digest('hex');

                if (imported.hashes?.[path] !== digest) {
                    errors.push(`Imported bytes differ from lock: ${relative}`);
                }
            } catch {
                errors.push(`Missing imported file: ${relative}`);
                continue;
            }

            if (!imported.documents.includes(path)) {
                continue;
            }

            const text = await readFile(file, 'utf8');

            for (const destination of getLinks(text)) {
                const result = resolveLink({ destination, page: path, source: imported, inventory });

                if (result.warning) {
                    warnings.push({ page: relative, destination, message: result.warning, resolved: result.url });
                }
            }
        }
    }

    // Detect extra files as well as missing files so excluded imports do not leak into search.
    for (const path of await getFiles(resolve(root, 'content/products'))) {
        if (!expectedFiles.has(`products/${path}`)) {
            errors.push(`Unregistered imported file: ${path}`);
        }
    }

    for (const source of lock.sources) {
        if (!manifest.sources.some(item => item.repository === source.repository && item.mode === 'import')) {
            errors.push(`Source no longer approved: ${source.repository}`);
        }
    }

    // Authored links are defects in this repository and therefore block the build.
    for (const path of ['README.md', 'content/index.md', 'content/get-started.md', 'content/maintaining.md', 'content/repositories.md']) {
        const file = resolve(root, path);

        for (const destination of getLinks(await readFile(file, 'utf8'))) {
            if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(destination)) {
                continue;
            }

            const target = decodeURIComponent(destination.split(/[?#]/)[0]);

            try {
                await stat(resolve(dirname(file), target));
            } catch {
                errors.push(`${path}: missing target ${destination}`);
            }
        }
    }

    await mkdir(resolve(root, '.cache'), { recursive: true });
    await writeFile(resolve(root, '.cache/link-report.json'), JSON.stringify({ errors, upstreamReferences: warnings }, null, 2) + '\n');

    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }

    console.log(`Verified ${expectedFiles.size} imported files. ${warnings.length} references remain upstream; see .cache/link-report.json.`);
}

// Fail checks predictably so both local builds and GitHub Actions use the same gate.
testCollection().catch(error => {
    console.error(error instanceof Error ? error.message : 'Collection validation failed');
    process.exitCode = 1;
});
