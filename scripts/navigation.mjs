import { readFileSync } from 'node:fs';
import { posix, resolve } from 'node:path';

import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt();

/** Build a consistent folder hierarchy while retaining source paths and stable public URLs. */
export function getNavigation(source, contentRoot) {
    const directory = resolve(contentRoot, 'products', source.slug);

    // Group source folders into learning paths and reference sections instead of showing raw filenames.
    function getItems(paths, prefix = '') {
        const files = paths.filter(path => !path.slice(prefix.length).includes('/'));
        const folders = [...new Set(paths.filter(path => path.slice(prefix.length).includes('/'))
            .map(path => path.slice(prefix.length).split('/')[0]))].sort();
        const items = files.sort(comparePages).map(path => ({
            text: posix.basename(path) === 'README.md' ? 'Overview' : getPageTitle(readFileSync(resolve(directory, path), 'utf8'), path),
            link: `/products/${source.slug}/${path.replace(/\.md$/, '')}`
        }));

        for (const folder of folders) {
            const childPrefix = `${prefix}${folder}/`;
            const children = paths.filter(path => path.startsWith(childPrefix));
            const overview = children.find(path => path === `${childPrefix}README.md`);
            const title = overview ? getPageTitle(readFileSync(resolve(directory, overview), 'utf8'), overview) : getFolderTitle(folder);
            const nested = getItems(children, childPrefix);

            // Source storage folders have no reader-facing meaning; expose their sections directly.
            if (['docs', 'resources.docs', 'src'].includes(folder)) {
                items.push(...nested);
            } else {
                items.push({ text: title, collapsed: true, items: nested });
            }
        }

        return items;
    }

    return getItems(source.documents);
}

/** Derive reader-facing titles from the document heading, preserving product and API identifiers. */
export function getPageTitle(text, path) {
    const tokens = parser.parse(text, {});
    const heading = tokens.findIndex(token => token.type === 'heading_open' && token.tag === 'h1');
    let title = heading >= 0 ? tokens[heading + 1].children
        .filter(token => ['text', 'code_inline'].includes(token.type)).map(token => token.content).join('') : getFolderTitle(posix.basename(path, '.md'));

    // Remove decorative branding consistently without altering the imported document itself.
    title = title.replace(/[\p{Extended_Pictographic}\uFE0F™®]/gu, '').replace(/\s+/g, ' ').trim();
    const module = /^(\d+)-/.exec(posix.basename(path));

    if (module) {
        title = title.replace(/^Module\s+\d+\s*:\s*/i, '');
        return `${module[1]} · ${title}`;
    }

    return title;
}

/** Keep overview first, numbered modules in order, and troubleshooting last. */
function comparePages(first, second) {
    function getRank(path) {
        const name = posix.basename(path);
        if (name === 'README.md') return 0;
        if (/^\d+-/.test(name)) return 1;
        if (name === 'troubleshooting.md') return 3;
        return 2;
    }

    return getRank(first) - getRank(second) || first.localeCompare(second, 'en', { numeric: true });
}

/** Convert storage slugs to sentence-case section names with known technical acronyms preserved. */
function getFolderTitle(value) {
    const words = value.replaceAll('-', ' ').replaceAll('_', ' ');
    return (words.charAt(0).toUpperCase() + words.slice(1)).replace(/\b(api|sdk|mcp|uia|sap|sql)\b/gi, word => word.toUpperCase());
}
