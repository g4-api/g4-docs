/** Provide a deterministic GitHub transport for importer tests; never access a network service. */
globalThis.fetch = async function requestFixture(url) {
    if (process.env.G4_TEST_DOWNLOAD_FAILURE === 'true') {
        return new Response('Unavailable', { status: 404 });
    }

    if (url.includes('/git/trees/')) {
        return Response.json({ truncated: false, tree: [
            { path: 'README.md', type: 'blob', mode: '100644' },
            { path: 'docs/guide.md', type: 'blob', mode: '100644' },
            { path: 'images/example.png', type: 'blob', mode: '100644' },
            { path: 'skills/SKILL.md', type: 'blob', mode: '100644' }
        ] });
    }

    if (url.endsWith('/README.md')) {
        return new Response('# Example\n\n[Guide](docs/guide.md)\n\n![Example][image]\n\n[image]: /images/example.png\n');
    }

    if (url.endsWith('/docs/guide.md')) {
        return new Response('# Guide\n\nA source guide.\n');
    }

    if (url.endsWith('/images/example.png')) {
        return new Response(new Uint8Array([137, 80, 78, 71]));
    }

    throw new Error(`Unexpected fixture request: ${url}`);
};
