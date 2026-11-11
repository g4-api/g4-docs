# Maintain the documentation hub

The hub combines centrally authored pages with imported product documentation.
The existing legacy folders at the repository root are excluded from the website.

## Run locally

1. Install Node.js 22 or newer.
2. Run `npm ci` from the repository root.
3. Run `npm run docs:dev` to browse the committed documentation.
4. Run `npm test` and `npm run docs:build` before submitting a change.

## Update product documentation

1. Edit the page in its owning repository, using the imported page's **Edit this page** link.
2. Merge the source change.
3. Run `npm run docs:sync` or dispatch the **Sync documentation** workflow.
4. Review the imported changes, source lock, and link report in the update pull request.
5. Merge the pull request after validation passes.

Imported Markdown is preserved as supplied upstream. Do not edit `content/products/` directly.
The lock records each source revision, document path, copied asset, and content checksum.
Run `npm run docs:sync -- --locked` to download those exact revisions again.
Normal builds use committed content and do not contact source repositories.

## Register another source

1. Add an entry in `sources.json` with its repository, slug, title, area, and branch or tag.
2. Set `mode` to `import` and list approved document roots in `paths`.
3. Add excluded paths to `exclude`. Keep test execution records and executable agent skills upstream.
4. Confirm the documents may be published before enabling an additional local source.
5. Run synchronization, tests, and the production build.
6. Commit the source manifest, lock, pages, and copied assets together.

Use `mode: link` for upstream dependencies, retired projects, and sources not approved for import.
Documentation without a README needs a landing page before import is enabled.

## Links and assets

Rendered links stay inside the hub when their targets were imported.
Links to code or excluded documents point to the pinned upstream revision.
Referenced images are copied from the source repository. External media remains external.

`npm run docs:check` verifies the lock, committed inventory, and authored links.
It writes `.cache/link-report.json` with upstream references and source defects.
The production build rejects unresolved internal website links.
It also checks rendered heading anchors and records imported-page defects in `.cache/anchor-report.json`.
Broken anchors in centrally authored pages fail the build.
Imported HTML is displayed as text and prose template expressions are escaped.

## Publish with GitHub Pages

1. Open repository **Settings**, then **Pages**.
2. Select **GitHub Actions** as the publishing source.
3. Merge the implementation into `main` or dispatch **Publish documentation**.
4. Check the workflow deployment result for the published URL.

The site uses `/g4-docs/` as its base path. Change `base` in the VitePress configuration if hosting changes.
Publication deploys a static build and requires no runtime service.

## Automation permissions

Synchronization needs repository contents and pull request write access.
Enable **Allow GitHub Actions to create and approve pull requests** in the repository's Actions settings.
If the organization disables that option, synchronize locally and open the update pull request manually.
Publication uses the GitHub Pages environment and its deployment permissions.
