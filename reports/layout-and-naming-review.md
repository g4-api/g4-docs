# Layout and naming review

## Scope

The review inventories 426 imported pages from 27 repositories, including 114 numbered modules,
48 README overviews, and 22 troubleshooting pages. The repository index registers 38 sources.
The review covers navigation structure, product labels, page titles, file organization, and future authoring rules.
It does not claim that all imported prose has been rewritten into a single template.

## Applied standard

| Element | Standard | Result |
| --- | --- | --- |
| Product names | Use the canonical title in the source manifest | Names aligned in manifest, lock, sidebar, and index |
| Page labels | Use the first document heading | Raw file paths removed from navigation |
| Learning paths | Group modules under their overview | Nested paths replace the flat page list |
| Modules | Use `NN ? Title` and numeric ordering | Consistent labels across imported modules |
| Overview | Use `Overview` as the page entry | README filenames hidden from readers |
| Troubleshooting | Place after direct module and reference entries | Consistent position within each path |
| Storage folders | Hide `docs`, `resources.docs`, and `src` | Source organization does not clutter labels |
| Branding | Remove decorative emoji and trademark marks from labels | Product identifiers retain their spelling |
| Public routes | Preserve existing paths | Existing links remain valid |
| Future guides | Apply the learning-path skill | Rules recorded in the root AGENTS.md |

## Verification

- Nine automated tests pass, including complete navigation coverage for all 426 source pages.
- File-integrity validation checks all 551 imported documents and assets against the source lock.
- The production build validates internal page links and audits rendered heading anchors.
- Markdown validation covers the new policy, this report, and the updated repository index.

## Remaining source issues

The source-link report contains 135 references outside the imported collection, including 82 image references
whose assets were unavailable to the importer. Missing images are presented as explanatory links.
Repair those screenshots in their owning repositories before reimporting.

API reference and plugin catalog pages remain reference documentation, as required by the learning-path skill's scope.
Imported module prose and screenshot coverage still vary between repositories.
The new presentation standard survives synchronization without changing imported bytes or their checksums.

## Proposed maintainer learning path

1. Preview the hub: install dependencies and open the local documentation site.
2. Update product documentation: edit upstream and synchronize the hub.
3. Register a source: configure its approved paths and verify imported content.
4. Validate and publish: run checks and publish through GitHub Pages.

The path also needs an overview, troubleshooting page, and verified images for each procedural step.
Drafting is pending the requested outline approval and screenshot choice.
The learning-path skill explicitly requires outline sign-off before drafting.

## Markdown compliance

### AGENTS.md

| Markdown dimension | Weight | Score | Findings |
| --- | ---: | ---: | --- |
| YAML boundary and artifact contract | 15 | 100 | None |
| Heading hierarchy, MD041, and document structure | 15 | 100 | None |
| Spacing and source cleanliness | 10 | 100 | None |
| Line enumeration and stable IDs | 20 | 100 | None |
| Lists, tables, and fences | 10 | 100 | None |
| Prose clarity and readability | 15 | 100 | None |
| Links and references | 5 | 100 | None |
| Completeness and internal consistency | 10 | 100 | None |
| **Markdown compliance** | **100** | **100** | **PASS** |

### content/repositories.md

| Markdown dimension | Weight | Score | Findings |
| --- | ---: | ---: | --- |
| YAML boundary and artifact contract | 15 | 100 | None |
| Heading hierarchy, MD041, and document structure | 15 | 100 | None |
| Spacing and source cleanliness | 10 | 100 | None |
| Line enumeration and stable IDs | 20 | 100 | None |
| Lists, tables, and fences | 10 | 100 | None |
| Prose clarity and readability | 15 | 100 | None |
| Links and references | 5 | 100 | None |
| Completeness and internal consistency | 10 | 100 | None |
| **Markdown compliance** | **100** | **100** | **PASS** |

### reports/layout-and-naming-review.md

| Markdown dimension | Weight | Score | Findings |
| --- | ---: | ---: | --- |
| YAML boundary and artifact contract | 15 | 100 | None |
| Heading hierarchy, MD041, and document structure | 15 | 100 | None |
| Spacing and source cleanliness | 10 | 100 | None |
| Line enumeration and stable IDs | 20 | 100 | None |
| Lists, tables, and fences | 10 | 100 | None |
| Prose clarity and readability | 15 | 100 | None |
| Links and references | 5 | 100 | None |
| Completeness and internal consistency | 10 | 100 | None |
| **Markdown compliance** | **100** | **100** | **PASS** |
