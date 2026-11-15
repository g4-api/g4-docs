import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { getNavigation, getPageTitle } from '../scripts/navigation.mjs';

test('module labels preserve identifiers and consistently remove decorative branding', () => {
    assert.equal(getPageTitle('# Module 2: Configure the MCP endpoint\n', '02-configure.md'), '02 · Configure the MCP endpoint');
    assert.equal(getPageTitle('# 🎬 G4™ Recorders\n', 'README.md'), 'G4 Recorders');
});

test('navigation preserves every source URL and groups nested guides without storage prefixes', () => {
    const root = fileURLToPath(new URL('../', import.meta.url));
    const lock = JSON.parse(readFileSync(`${root}/sources.lock.json`, 'utf8'));

    for (const source of lock.sources) {
        const links = [];

        function collectItems(items) {
            for (const item of items) {
                assert.ok(!item.text.startsWith('resources.docs/'));
                if (item.link) links.push(item.link);
                if (item.items) collectItems(item.items);
            }
        }

        collectItems(getNavigation(source, `${root}/content`));
        assert.equal(new Set(links).size, source.documents.length);
        assert.deepEqual(links.sort(), source.documents.map(path => `/products/${source.slug}/${path.replace(/\.md$/, '')}`).sort());
    }
});
