# 0.5.8 release validation

Scope: publish the existing Kanban draft with its catalog registration, public types, stories and tests. The unchanged token definitions are versioned alongside UI to preserve exact internal dependency versions.

## Local checks

- Full `npm run build`: passed for tokens, catalog, UI, Lab, Storybook and Workbench. Catalog: 139 families (72 basic, 43 complex, 24 AI).
- `npm run check`: passed, including component formatting/source policy, token generation, catalog generation, design checks, token audit and all workspace typechecks.
- Kanban model and interaction suites: 13 passed (13.9s), covering ownership validation, stable anchors, keyboard reorder/cross-column moves, drag/drop, filtering, failed save, Controls retry/read-only and narrow dark/light × compact/comfortable.
- The initial Controls check failed when switching failSave back to false. Replacing a generic toggle with an explicit click on the False segment made the intended state transition unambiguous; checked-state and component assertions remain in place. The complete suite was rerun successfully.
- `npm run pack:library` and `node scripts/check-npm-pack.mjs`: passed. Tokens: 13 files; UI: 193 files, including Kanban public declarations.

## Visual review

Reference: user-provided dark/compact Kanban screenshot from the component overview, especially title/description alignment. Inspected current built Storybook screenshots in `.logs/kanban/desktop-compact.png`, `dark-compact.png` and `light-comfortable.png`. Title and description begin at the same card content edge. The board keeps three quiet bordered columns on desktop; narrow screens scroll inside the board. Comfortable density increases shared padding without changing the layout. Storybook screenshots omit the Lab wrapper and use a different viewport; they are not a pixel-equivalence claim. No new visual redesign was made for this release.

## Publication gates

The tagged commit must pass the GitHub release policy, full build/check, all core regressions (now including Kanban), generated-file drift and npm package contracts before trusted publishing. After publication, verify both registry versions, latest tags and SHA-512 integrity against the workflow's npm-packages artifact. Local evidence: `.logs/release-058-*.log`; final cloud and registry evidence is recorded separately in the same directory.
