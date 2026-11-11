import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { slug } from 'github-slugger';
import { defineConfig } from 'vitepress';

import { resolveLink } from '../../scripts/links.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const lock = JSON.parse(readFileSync(`${root}/sources.lock.json`, 'utf8'));
const groups = [...new Set(lock.sources.map(source => source.area))];

/** Rewrite rendered tokens without modifying source Markdown or interpreting prose as Vue. */
function registerSourceLinks(markdown) {
    markdown.core.ruler.after('inline', 'g4-source-links', state => {
        const relative = state.env.relativePath ?? '';
        const source = lock.sources.find(item => relative.startsWith(`products/${item.slug}/`));

        if (!source) {
            return;
        }

        const page = relative.slice(`products/${source.slug}/`.length);
        const inventory = [...source.documents, ...source.assets];

        // Normalize repository-relative links before VitePress applies the deployment base.
        for (const token of state.tokens) {
            if (token.type === 'fence') {
                token.info = token.info.replace(/^none\b/, 'text').replace(/^pwsh\b/, 'powershell').replace(/^env\b/, 'dotenv');
            }

            for (const child of token.children ?? []) {
                for (const attribute of ['href', 'src']) {
                    const destination = child.attrGet(attribute);

                    if (destination) {
                        const result = resolveLink({ destination, page, source, inventory });
                        child.attrSet(attribute, result.url);

                        if (child.type === 'image' && result.warning) {
                            child.attrSet('data-source-missing', 'true');
                        }
                    }
                }
            }
        }

        // Keep the pinned source visible alongside the contribution link to the active branch.
        const path = page.split('/').map(encodeURIComponent).join('/');
        const provenance = `\n\n---\n\nSource: [${source.repository}@${source.commit.slice(0, 7)}](${source.url}/blob/${source.commit}/${path}).\n`;
        state.tokens.push(...state.md.parse(provenance, {}));
    });

    // Escape braces at the text-token boundary so prose never becomes a Vue template expression.
    const previousText = markdown.renderer.rules.text;
    markdown.renderer.rules.text = (...arguments_) => {
        const result = previousText(...arguments_);
        return result.includes('{') ? `<span v-pre>${result}</span>` : result;
    };

    // Inline G4 macros are literal CLI syntax, including double braces that Vue otherwise evaluates.
    const previousCode = markdown.renderer.rules.code_inline;
    markdown.renderer.rules.code_inline = (...arguments_) => previousCode(...arguments_).replace('<code', '<code v-pre');

    // Missing upstream screenshots remain visible as explanations instead of broken image icons.
    const previousImage = markdown.renderer.rules.image;
    markdown.renderer.rules.image = (tokens, index, ...arguments_) => {
        const token = tokens[index];

        if (token.attrGet('data-source-missing')) {
            const destination = markdown.utils.escapeHtml(token.attrGet('src'));
            const label = markdown.utils.escapeHtml(token.content);
            return `<a href="${destination}">Image unavailable in source: ${label}</a>`;
        }

        return previousImage(tokens, index, ...arguments_);
    };
}

export default defineConfig({
    title: 'G4 Documentation',
    description: 'Build, run, record, and operate automations across the G4 ecosystem.',
    base: '/g4-docs/',
    ignoreDeadLinks: [/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/],
    lastUpdated: false,
    markdown: {
        html: false,
        attrs: { disable: true },
        anchor: { slugify: slug },
        headers: { slugify: slug },
        toc: { slugify: slug },
        config: registerSourceLinks
    },
    themeConfig: {
        nav: [
            { text: 'Get started', link: '/get-started' },
            { text: 'Repositories', link: '/repositories' },
            { text: 'Maintain the hub', link: '/maintaining' }
        ],
        search: { provider: 'local' },
        outline: [2, 3],
        socialLinks: [{ icon: 'github', link: 'https://github.com/g4-api/g4-docs' }],
        sidebar: [
            { text: 'Start here', items: [
                { text: 'Overview', link: '/' },
                { text: 'Choose your path', link: '/get-started' },
                { text: 'Repository index', link: '/repositories' }
            ] },
            ...groups.map(area => ({ text: area, collapsed: true,
                items: lock.sources.filter(source => source.area === area).map(source => ({
                    text: source.title, collapsed: true,
                    items: source.documents.map(path => ({
                        text: path === 'README.md' ? 'Overview' : path.replace(/\.md$/, ''),
                        link: `/products/${source.slug}/${path.replace(/\.md$/, '')}`
                    }))
                }))
            }))
        ],
        editLink: {
            pattern(page) {
                if (page.frontmatter.sourceEditUrl) {
                    return page.frontmatter.sourceEditUrl;
                }

                return `https://github.com/g4-api/g4-docs/edit/main/content/${page.relativePath}`;
            }
        },
        footer: { message: 'Documentation from across the G4 ecosystem.' }
    },
    transformPageData(page) {
        const source = lock.sources.find(item => page.relativePath.startsWith(`products/${item.slug}/`));

        if (source) {
            const path = page.relativePath.slice(`products/${source.slug}/`.length);
            page.frontmatter.sourceEditUrl = `${source.url}/edit/${source.ref}/${path}`;
        }
    }
});
