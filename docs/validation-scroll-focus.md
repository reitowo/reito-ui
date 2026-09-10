# Quiet reading-surface focus

## Scope

Conversation, WorkspacePane and ScrollArea share a keyboard-only inset focus marker. Their tab stops, labels, scrolling and descendants' focus handling remain unchanged. Buttons and inputs retain their normal explicit focus rings. Forced-colors mode uses a system-color inset outline because box shadows may be removed.

This does not remove application-owned selection outlines: a consumer's selected text annotations must be styled independently.

## Validation

- `npm run build` passed for UI, Lab, Storybook and Workbench.
- `npm run check` passed after building the library's declaration exports.
- `REITO_BROWSER_CHANNEL=chrome npx playwright test tests/scroll-focus.spec.ts`: 13 passed. Covers pointer focus, Tab/Shift+Tab, blur, no layout movement, scroll keys and forced-colors, across dark/light and compact/comfortable.
- Existing lockfile could not run `npm ci` (missing `@emnapi/core` and `@emnapi/runtime` entries). Used `npm install --ignore-scripts` locally; lockfile repair is not part of this change.

## Visual inspection

Reference: the existing Lab Conversation/Message and Workspace examples, plus a consuming application's reading-pane reference (not reproduced to avoid publishing private content). The working context is a desktop transcript reading surface, not a form input.

Inspected local synthetic Conversation screenshots at 1440 × 1000 in dark and light, compact density. The keyboard cue is now a single inner leading edge; the full rounded bright border is gone. Neutral example boundaries, text typography, spacing and message surfaces remain. The Lab still has its own component-preview frame; this change deliberately does not remove that frame or imitate the consumer's application layout. Screenshots are generated into ignored test-results, with no customer text or assets committed.
