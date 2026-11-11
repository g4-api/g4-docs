import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'content/.vitepress/dist');

/** Return portable output paths; generated asset directories contain no pages to audit. */
async function getHtmlFiles(directory) {
    const paths = [];

    for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.isDirectory() && entry.name !== 'assets') {
            const children = await getHtmlFiles(resolve(directory, entry.name));
            paths.push(...children.map(child => `${entry.name}/${child}`));
        } else if (entry.name.endsWith('.html')) {
            paths.push(entry.name);
        }
    }

    return paths;
}
/** Audit actual generated anchors, including duplicate heading suffixes and URL decoding. */
async function testOutput() {
    const pages = new Map();
    const warnings = [];
    const errors = [];

    // Inspect generated HTML rather than guessing how VitePress slugifies source headings.
    for (const path of await getHtmlFiles(output)) {
        const html = await readFile(resolve(output, path), 'utf8');
        const identifiers = new Set([...html.matchAll(/\bid="([^"]*)"/g)].map(match => match[1]));
        const links = [...html.matchAll(/\bhref="([^"]*)"/g)].map(match => match[1]);
        pages.set(path, { identifiers, links });
    }

    for (const [path, page] of pages) {
        for (const destination of page.links) {
            const isExternal = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(destination);

            if (isExternal || !destination.includes('#')) {
                continue;
            }

            const [pathname, fragment] = destination.split('#');

            if (!fragment) {
                continue;
            }

            const relative = pathname.startsWith('/g4-docs/') ? pathname.slice('/g4-docs/'.length) : posix.join(posix.dirname(path), pathname);
            let target = pathname.length === 0 ? path : relative.split('?')[0];

            if (target.endsWith('/')) {
                target += 'index.html';
            }

            const targetPage = pages.get(decodeURIComponent(target));

            if (!targetPage || targetPage.identifiers.has(decodeURIComponent(fragment))) {
                continue;
            }

            const issue = { page: path, destination, message: 'Heading anchor does not exist in generated page' };
            const issues = path.startsWith('products/') ? warnings : errors;
            issues.push(issue);
        }
    }

    // Preserve upstream defects as reviewable diagnostics while centrally authored broken anchors block release.
    await mkdir(resolve(root, '.cache'), { recursive: true });
    await writeFile(resolve(root, '.cache/anchor-report.json'), JSON.stringify({ errors, sourceDefects: warnings }, null, 2) + '\n');

    if (errors.length > 0) {
        throw new Error(JSON.stringify(errors, null, 2));
    }

    console.log(`Audited ${pages.size} built pages; ${warnings.length} upstream anchor defects recorded in .cache/anchor-report.json.`);
}

// Generated output checks run only after a successful site build.
testOutput().catch(error => {
    console.error(error instanceof Error ? error.message : 'Output validation failed');
    process.exitCode = 1;
});
