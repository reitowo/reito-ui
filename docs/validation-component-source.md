# Component source refactor

Date: 2026-10-10. Scope: source organization across `packages/ui/src`, preserving
the existing public component contracts and visual tokens.

## Implementation

- Formatted the entire UI source tree with pinned Prettier 3.6.2. JSX, callbacks,
  imports, and type declarations now have a consistent readable layout.
- Split 82 long static class recipes in 45 files into ordered layout, typography,
  surface, motion, focus, disabled, validation, and composition groups.
- Moved RichTextEditor document typography into scoped component CSS. It uses
  the existing tokens and is bundled through the shared styles entry.
- Extracted DataTable's duplicated ordinary/virtual cell content into one render
  function. It closes over the same editing state and retains component identity.
- Added internal AsyncOptionsFeedback for single and multiple asynchronous
  selectors. It shares idle/loading/error markup without adding a DOM wrapper or
  taking ownership of selection, caching, cancellation, or virtualization.
- Added formatting and AST source-organization checks to `npm run check`.
  Policy and architecture: [component-source-policy.md](component-source-policy.md).

## Preservation evidence

The reference is the existing composed Storybook editor, inspected before and
after the change in dark and light themes. Compared 16 cases: Markdown, HTML,
task-list, and JSON content across both themes and densities at 960 × 800.
After fonts and styles settled, dimensions and computed typography, spacing,
colors, borders, layout, and outline properties matched in all 16 cases.

Normalized emitted JavaScript comparison found no runtime difference in 171
existing source files, after accounting for equivalent class arrays, formatting
parentheses, and adjacent JSX text fragments. The four intentional refactors
listed above require behavior checks in addition to this comparison. All 14
previously literal long JSX class attributes were checked for merge conflicts;
passing them through `cn` removed no utility tokens.

Local evidence:

- `.logs/component-refactor-before-source.json`
- `.logs/component-refactor-class-groups.json`
- `.logs/component-refactor-source-comparison.json`
- `.logs/component-refactor-before-render.json`
- `.logs/component-refactor-after-render.json`
- `.logs/component-refactor-style-diff.json`
- `.logs/component-refactor-before-dark.png` and corresponding light/after images

## Execution results

- `npm run build`: passed for UI, Lab, Storybook, and Workbench. Existing large
  bundle warnings remain.
- `npm run check`: passed, including formatting, 176 source files / 512 class
  recipes, token audit (349 visual-source files, zero unapproved exceptions),
  catalog/design checks, and all workspace typechecks.
- Selected interaction suite: 380 distinct tests verified. The initial batch
  passed 342 and failed 38; the targeted repeat passed all 38 in 4.7 minutes.
  Coverage includes all 139 catalog families, four geometry combinations,
  table editing/grouping/virtualization, async selectors, rich text, Markdown,
  images, tags, theme controls, keyboard focus, and overlays.
- Re-ran all four compact table geometry cases after strengthening the density
  assertions: four passed in 15.5 seconds.
- RichTextEditor: all 16 rendered comparisons match.
- DataTable: all four ordinary/virtual × density comparisons match. Existing
  compact/comfortable row heights are 37/53px before and after the refactor.
- Incremental multi-select: both versions have no load error on opening and
  display the same error after scrolling near the end.
- `git diff --check`: passed.

The first batch exposed a cached Vite resolution error for the newly added
feedback module, initial preview timeouts, and stale test assumptions. Refreshing
the Lab module graph restored the page. Baseline comparison proved that the
comfortable table rows were already 53px and that incremental loading required
scrolling. The two density tests now assert the exact existing heights, and the
incremental-load test performs the required scroll. No visual token values were
changed to satisfy these tests.

Logs: `.logs/component-refactor-final-build.log`,
`.logs/component-refactor-final-check.log`, `.logs/component-refactor-tests.log`,
and `.logs/component-refactor-retry-tests.log`. Density and load-more preservation
records are in `.logs/component-refactor-table-density.json` and
`.logs/component-refactor-load-more.json`.

This ran a relevant subset of the repository's 1,357 tests, not the entire test
suite. No package publication or Git delivery is part of this request.
