# Documentation authoring standard

Apply this standard to new documentation and documentation refactoring in this repository.

## Learning paths

1. Use the `markdown-learning-path` skill for procedural guides and onboarding work.
2. Use existing source material and verified screenshots. Never invent application labels or screenshot evidence.
3. Follow the skill's intake and outline approval requirements before drafting a new learning path.
4. Organize each path as `README.md`, numbered `NN-kebab-case.md` modules, `troubleshooting.md`, and `images/`.
5. Include audience, outcomes, prerequisites, and a module table in the overview.
6. Give modules a title, navigation, duration, outcomes, numbered steps, verified images, and a check-your-work list.
7. Cross-link troubleshooting entries to the relevant module.
8. Run the learning-path checker and Markdown compliance review before completion.

## Names and navigation

- Use the product names in `sources.json` throughout navigation and the repository index.
- Preserve official identifiers such as WebDriver, UIA, SAP, MCP, and API.
- Use sentence case for new descriptive headings and kebab-case for new filenames.
- Use `Overview` for an overview navigation entry and `NN · Title` for a module entry.
- Group modules under their learning path and reference pages under their subject.
- Hide source storage names such as `docs` and `resources.docs` from navigation labels.
- Preserve existing public URLs when changing presentation names.

## Reference documentation

Keep API contracts, plugin catalogs, and configuration references as reference pages.
The learning-path skill explicitly excludes terse API references and design documents.
Link references from relevant learning paths instead of converting every reference into a tutorial.

## Imported content

1. Treat `content/products/` as an imported snapshot owned by its source repository.
2. Make substantive content and screenshot changes upstream, then synchronize the hub.
3. Apply presentation rules through the navigation and rendering code so synchronization preserves them.
4. Keep source metadata and `sources.lock.json` consistent when changing product labels.
5. Run tests and the production build to verify file integrity, links, and rendered anchors.

## Reports

Report the scope reviewed, changes applied, checks run, remaining defects, and any approval still needed.
Distinguish presentation consistency from a full editorial rewrite of imported content.
