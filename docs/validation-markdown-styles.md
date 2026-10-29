# MarkdownContent styling refactor

Validated on 2026-10-10. The reference is the user's screenshot of the long
MarkdownContent descendant-selector class list. This is a code readability
change; the existing composed Storybook stories provide the visual baseline.

## Change

Document typography now lives in `packages/ui/src/ai/markdown-content.css`,
scoped under `rui-markdown-content` and grouped by headings, lists, code, tables,
and supporting content. The component retains one root class and explicit code
block and table-scroll hooks. The shared stylesheet bundles these rules.
Visual values continue to use existing `--rui-*` tokens. Parsing, renderer
overrides, URL safety, streaming, and public component props are unchanged.

Static document-wide descendant typography belongs in readable component CSS,
rather than a large arbitrary-selector string in JSX. Local layout utilities
and interactive variants can continue to use the generated Tailwind bridge.

## Results

- `npm run build`: passed. Existing bundle size warnings remain.
- `npm run check`: passed, including token audit and all workspace typechecks.
- `npx playwright test tests/markdown-content.spec.ts --reporter=list --workers=2`: 37 passed.
- Compared 16 rendered cases: Default, TaskList, InlineCode, and Table stories
  in dark/light themes and compact/comfortable densities at 640 × 760.
  Comparison includes element dimensions, typography, color, spacing, borders,
  wrapping, and layout after fonts are ready. Final differences: zero.

Local evidence is in `.logs/markdown-style-before.json`,
`.logs/markdown-style-final-diff.json`, `.logs/markdown-refactor-tests.log`,
`.logs/markdown-refactor-final-build.log`, and `.logs/markdown-refactor-check.log`.
The comparison proves parity for these inspected stories, not every possible
custom renderer. This request did not run the full repository interaction suite
or publish a version.
