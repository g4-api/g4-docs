import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveLink } from '../scripts/links.mjs';

const source = { url: 'https://github.com/g4-api/example', commit: 'a'.repeat(40) };
const inventory = ['README.md', 'docs/README.md', 'docs/guide.md', 'images/example.png'];

/** Exercise the source/hub boundary where relocation otherwise silently breaks documentation. */
function getDestination(destination, page = 'docs/guide.md') {
    return resolveLink({ destination, page, source, inventory });
}

test('keeps document links and fragments inside the imported collection', () => {
    assert.equal(getDestination('../README.md#setup').url, '../README.md#setup');
    assert.equal(getDestination('./').url, './README.md');
    assert.equal(getDestination('/docs/guide.md?mode=one#setup').url, './guide.md?mode=one#setup');
});

test('resolves root-relative screenshots relative to the actual imported page', () => {
    assert.equal(getDestination('/images/example.png').url, '../images/example.png');
});

test('preserves external links, protocols, and same-page anchors', () => {
    for (const destination of ['https://example.com', 'mailto:a@example.com', '//example.com/a', '#setup', 'command:example']) {
        assert.equal(getDestination(destination).url, destination);
    }
});

test('pins code and excluded documentation links to the source revision', () => {
    const result = getDestination('../src/Some File.cs#L10');
    assert.equal(result.url, `${source.url}/blob/${source.commit}/src/Some%20File.cs#L10`);
    assert.ok(result.warning);
});

test('does not crash the build on malformed upstream URL encoding', () => {
    const result = getDestination('%broken');
    assert.equal(result.url, source.url);
    assert.match(result.warning, /Malformed URL/);
});

test('does not manufacture a GitHub path when a source reference escapes its repository', () => {
    const result = getDestination('../../other-repo/docs/guide.md');
    assert.equal(result.url, `${source.url}/blob/${source.commit}/docs/guide.md`);
    assert.match(result.warning, /escapes source repository/);
});
