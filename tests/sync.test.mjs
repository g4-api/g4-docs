import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const invokeNode = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));

test('locked imports preserve bytes, exclude unapproved files, replay deterministically, and survive download failure', async () => {
    // Keep fixtures inside the ignored project cache so module resolution reuses installed dependencies.
    await mkdir(resolve(root, '.cache'), { recursive: true });
    const directory = await mkdtemp(resolve(root, '.cache/import-test-'));
    const source = { repository: 'g4-api/example', slug: 'example', title: 'Example', area: 'Testing',
        mode: 'import', ref: 'main', paths: ['README.md', 'docs'], exclude: [], status: 'Import enabled' };
    const command = ['--import', pathToFileURL(resolve(root, 'tests/fixtures/github.mjs')).href,
        resolve(directory, 'scripts/sync.mjs'), '--locked'];

    try {
        await mkdir(resolve(directory, 'content/products'), { recursive: true });
        await cp(resolve(root, 'scripts'), resolve(directory, 'scripts'), { recursive: true });
        await writeFile(resolve(directory, 'sources.json'), JSON.stringify({ sources: [source] }));
        await writeFile(resolve(directory, 'sources.lock.json'), JSON.stringify({ sources: [{ ...source, commit: 'a'.repeat(40) }] }));

        for (const path of ['README.md', 'content/index.md', 'content/get-started.md', 'content/maintaining.md']) {
            await writeFile(resolve(directory, path), '# Fixture guide\n');
        }

        // First import exercises reference-style images and generates checksums from actual downloaded bytes.
        await invokeNode(process.execPath, command, { cwd: directory });
        const firstLock = await readFile(resolve(directory, 'sources.lock.json'), 'utf8');
        const imported = JSON.parse(firstLock).sources[0];
        assert.deepEqual(imported.documents, ['README.md', 'docs/guide.md']);
        assert.deepEqual(imported.assets, ['images/example.png']);
        assert.equal(Object.keys(imported.hashes).length, 3);
        assert.match(await readFile(resolve(directory, 'content/products/example/README.md'), 'utf8'), /\[image\]: \/images/);

        // Replaying the same lock must not introduce timestamps or unrelated content changes.
        await invokeNode(process.execPath, command, { cwd: directory });
        assert.equal(await readFile(resolve(directory, 'sources.lock.json'), 'utf8'), firstLock);

        // Validate the checksum gate independently, including detection of an edited mirrored document.
        const checkCommand = [resolve(directory, 'scripts/check.mjs')];
        await invokeNode(process.execPath, checkCommand, { cwd: directory });
        const guide = resolve(directory, 'content/products/example/docs/guide.md');
        await writeFile(guide, '# Locally edited import\n');
        await assert.rejects(invokeNode(process.execPath, checkCommand, { cwd: directory }), /Imported bytes differ from lock/);
        await writeFile(guide, '# Guide\n\nA source guide.\n');

        // A failed download must leave both metadata and the previous collection intact.
        await assert.rejects(invokeNode(process.execPath, command, {
            cwd: directory, env: { ...process.env, G4_TEST_DOWNLOAD_FAILURE: 'true' }
        }), /HTTP 404/);
        assert.equal(await readFile(resolve(directory, 'sources.lock.json'), 'utf8'), firstLock);
        assert.equal(await readFile(resolve(directory, 'content/products/example/docs/guide.md'), 'utf8'), '# Guide\n\nA source guide.\n');
    } finally {
        // Remove only the fixture directory allocated above; product repositories are never touched.
        await rm(directory, { recursive: true, force: true });
    }
});
