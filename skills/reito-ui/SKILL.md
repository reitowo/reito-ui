---
name: reito-ui
description: Build, extend, or review UI using the Reito Graphite component library when the user explicitly requests Reito UI, Graphite, or this personal design system. Use its tokens, shared React components, Storybook examples, and design contract; do not apply this style to unrelated UI tasks.
---

# Reito UI / Graphite

Use the user's existing Reito Graphite library as the design authority. It combines neutral grayscale surfaces, compact controls and readable content with quiet desktop chrome. The library provides a three-layer component explorer: basic, complex and AI. Choose layouts according to the requested work. Product screenshots are visual references, not exact specifications or sources of assets.

## Start with the installed version

- Locate `@reito/ui` and `@reito/tokens` in the current project or the library checkout supplied by the user. Read their package versions, exports, types, and relevant existing component/story before editing. Do not invent APIs or silently install a different library when Reito UI is missing.
- Read [references/design-contract.md](references/design-contract.md) for the portable design rules, component selection, and acceptance gates. If working in the library repository, also read its `AGENTS.md` and `docs/design-language.md`; those files track current implementation values.
- Establish the working context first: identify whether the screen is a conversation, review, settings, data view or component showcase. For a visual direction change, inspect a reference for that context and the actual composed page before judging individual tokens. Then check affected component states and shared implications.

## Preserve the system

- Token source: `packages/tokens/src/tokens.json`. Rebuild with `npm run tokens:build`; never hand-edit generated CSS. Primitive values feed semantic roles, and component slots/variants consume those roles.
- Use semantic Tailwind utilities or --rui-* tokens, connected by the generated @theme bridge. The basic layer combines pinned shadcn / Base UI base-nova output with local Base UI compositions; complex and AI components compose that layer. Read installed APIs and provenance before choosing or extending a component. Correct shared appearance in the token source, component, or shared layout. Do not add page-specific theme overrides, literal palette colors, isolated fonts, or arbitrary shadows.
- Use shared content-padding/content-gap, cell-padding and conversation density roles for containers and rows. Compact mode tightens spacing without shrinking reading text. Read the portable contract for 0.4 defaults; do not restore old fixed padding through feature-page overrides. Use CodeBlock's embedded variant inside an existing artifact frame to avoid nested container padding.
- Give active work visual priority. Use short toolbars, lightweight sidebar rows and conditional context panels. In a conversation, make the composer the main soft container and keep input, context and actions together. Keep ordinary boundaries quiet and focus explicit; a statistics strip, decorative filename tab or uppercase eyebrow does not establish desktop character.
- Set `data-theme="dark|light"` and `data-density="compact|comfortable"` on `<html>` so portaled surfaces inherit them. Default is dark + compact. A panel-specific color patch is not a fix for incorrect portal inheritance.
- Do not add a compact/comfortable density switch to product headers, toolbars or settings by default. Use compact density unless the product specifies otherwise. Only expose density selection when the user explicitly requests it; supporting both densities and testing them does not require a user-facing switch. Lab and Storybook inspection controls are not application chrome to copy.
- Consume `@reito/tokens/css` followed by `@reito/ui/styles.css`. Reuse public components; do not copy their implementation into feature pages.
- Preserve accessible labels, native/Base UI keyboard semantics, visible focus, IME composition, and reduced-motion behavior. Show applicable loading/error/disabled/empty states with realistic Chinese content.
- Keep product branding, proprietary fonts, and restricted Multica UI code out of the implementation. The library's own tokens and styling are original; inspect relevant dependency licenses when adding third-party code.

## Finish with evidence

When adding a library component family, register its shared Demo in the relevant catalog, add discoverable stories and run `npm run catalog:build`. The generated manifest supplies Lab counts and Storybook deep links; `catalog:check` detects drift. Use Lab for individual components and Workbench for composed Agent, file review and settings flows, according to the task.

In the library repository, run `npm run check`, `npm run build`, and relevant interaction checks for executable UI changes. In a consuming project, use that project's checks and inspect the composed page. For visual work, also compare the result with an inspected reference for the selected working context, recording the reference and remaining differences. A passing build, interaction test or accessibility scan does not prove visual similarity.

Record what actually ran, which theme/density combinations were checked, and any remaining limitations; the existence of a story or a prose rule is not proof that verification passed.

Scope remains the user's requested screen, component, or review. Using this Skill does not authorize publishing packages, sending data, or replacing unrelated design systems.
