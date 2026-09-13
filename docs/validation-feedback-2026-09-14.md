# Browser feedback validation · 2026-09-14

Reference: user annotations on the local Reito Lab (1173 × 1272, dark/compact), targeting ColorPicker, InputTime, ScrollArea, Calendar, InputOTP, ImageCompare and complex navigation. The changes address those concrete details, not a new claim of pixel similarity to another product.

Shared styling uses the existing token bridge. Full `npm run build` and `npm run check` passed; the build reports its existing large-chunk advisory. Local screenshots are in `.logs/feedback-*`.

## InputTime

The clock opens a token-themed Popover with hour/minute/optional-second selectors. Draft selection is isolated until confirmation; cancellation/Escape return focus. Valid choices respect steps and inclusive time bounds. Changing hours preserves lower segments when valid, or selects the nearest valid boundary. Read-only/disabled lock the picker; an empty constrained range explains why confirmation is unavailable.

`tests/input-time.spec.ts`: **21 passed** against the freshly built Storybook on port 6008 using Edge. Includes 12/24 hours, seconds, cancel/commit, hidden form values, invalid drafts, keyboard, range/step limits, four theme/density combinations, narrow width and axe scans. Storybook can own axe during its initial scan; the test now waits with a bounded retry. Popup screenshots inspected in dark/compact and light/comfortable.
