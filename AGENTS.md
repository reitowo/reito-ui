# Reito UI

This repository is an original, reusable desktop component library informed by Cursor and Claude Desktop working surfaces. Graphite uses neutral grayscale surfaces, compact controls, readable content, quiet chrome, and dark and light themes. The Lab is a three-layer component explorer; forms, settings, data views and AI workspaces keep the structure their work needs. Product screenshots are visual references, not specifications or assets to copy.

- Read `docs/design-language.md` and the relevant existing component before a UI change.
- Tokens in `packages/tokens/src/tokens.json` are the source of truth. Run `npm run tokens:build`; never edit generated tokens CSS by hand.
- Standard Tailwind spacing, typography, radius, shadow and motion must use the generated token bridge. Numeric-only positioning/delay APIs use `@reito/tokens/metrics`; container-query sizes are compiled from tokens because CSS queries cannot resolve runtime `var()`. Run `npm run tokens:audit`; exact structural exceptions require a reason in `docs/design-token-policy.json`, never a blanket baseline.
- Shared fixes belong in tokens, `packages/ui`, or layout primitives, not page-specific overrides.
- Use semantic Tailwind utilities (bg-background, text-muted-foreground, border-border) or --rui-* tokens. Do not introduce palette utilities or literal colors in components/examples. The generated @theme bridge maps both to the same token source.
- Make active work the primary visual surface. Use lightweight sidebar rows and short toolbars; open artifact previews and inspectors when relevant. The Lab is a component inspection tool; consuming applications should organize the actual work. Statistics strips, decorative filename tabs and uppercase eyebrows are not a generic desktop identity.
- Keep ordinary boundaries soft and keyboard focus explicit. In conversation layouts, the composer is the main rounded container; its input and supporting actions belong together. Do not wrap every message or content section in a card, or force every screen into a chat layout.
- Use the pinned shadcn / Base UI base-nova primitives in packages/ui/src/primitives; complex and AI layers compose them. Preserve Base UI keyboard behavior, label icon buttons, and handle Chinese IME. Read actual APIs; do not keep old Radix asChild/size assumptions.
- Every public component needs a discoverable Storybook example. Cover applicable disabled, loading, error and empty states. Check both themes and densities.
- Density support is a styling capability, not a default product control. Use compact density by default; do not add a compact/comfortable switch to application headers, toolbars or settings unless the user explicitly requests it. Lab and Storybook may expose density controls for component inspection; do not copy those controls into consuming applications or Workbench examples.
- Examples may demonstrate local interactions; don't imply that demo content is a real AI response or external integration.
- Run `npm run check`, `npm run build`, and relevant interaction checks before reporting verified completion. Record actual results.
- For visual changes, compare the composed page against an inspected reference of the selected working context; record the source, theme and remaining differences. Passing builds, interaction tests or accessibility scans does not prove visual similarity.
- Keep product licenses and reference provenance in `docs/references.md`. The tokens and styling here are original; don't copy proprietary fonts, brand assets or restricted Multica UI code.
