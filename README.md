# G4 documentation hub

This repository collects G4 product documentation and publishes a searchable static website.

- [Choose a starting point](content/get-started.md).
- [Browse the repository index](content/repositories.md).
- [Maintain and publish the hub](content/maintaining.md).

## Local development

1. Install Node.js 22 or newer.
2. Run `npm ci`.
3. Run `npm run docs:dev`.

## Update and verify

1. Run `npm run docs:sync` to import approved sources.
2. Review `sources.lock.json` and the changes in `content/products/`.
3. Run `npm test`.
4. Run `npm run docs:build`.

The import allowlist lives in `sources.json`. Product pages remain owned by their source repositories.
Shared guides live directly in `content/`.
Legacy folders are retained outside the website source tree and are not indexed or published.

## Ownership and licensing

Imported documents and assets retain their source ownership and applicable licenses.
Consult each source repository through the repository index before redistributing its material.
