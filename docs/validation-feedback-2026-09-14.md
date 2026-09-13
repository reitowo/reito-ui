# Browser feedback validation · 2026-09-14

Reference: user annotations on the local Reito Lab (1173 × 1272, dark/compact), targeting ColorPicker, InputTime, ScrollArea, Calendar, InputOTP, ImageCompare and complex navigation. The changes address those concrete details, not a new claim of pixel similarity to another product.

Shared styling uses the existing token bridge. Full `npm run build` and `npm run check` passed; the build reports its existing large-chunk advisory. Local screenshots are in `.logs/feedback-*`.

## InputTime

The clock opens a token-themed Popover with hour/minute/optional-second selectors. Draft selection is isolated until confirmation; cancellation/Escape return focus. Valid choices respect steps and inclusive time bounds. Changing hours preserves lower segments when valid, or selects the nearest valid boundary. Read-only/disabled lock the picker; an empty constrained range explains why confirmation is unavailable.

`tests/input-time.spec.ts`: **21 passed** against the freshly built Storybook on port 6008 using Edge. Includes 12/24 hours, seconds, cancel/commit, hidden form values, invalid drafts, keyboard, range/step limits, four theme/density combinations, narrow width and axe scans. Storybook can own axe during its initial scan; the test now waits with a bounded retry. Popup screenshots inspected in dark/compact and light/comfortable.

## ScrollArea

Removed the demo's outer 12 px content inset and row divider/vertical padding stack. Rows now use cell padding and a 4 px vertical edge inset; generic ScrollArea remains padding-free for caller content. Lab, Storybook Overview and vertical Playground share ScrollAreaDemo.

Edge checked dark/light × compact/comfortable: row padding **6px 10px / 10px 16px**, measured row heights **32 / 40px**. Keyboard End scrolls the viewport. The light compact screenshot was inspected against the supplied list annotation; file icons and text now share consistent row insets.

## Calendar

Removed the extra 8 px margin between week rows, centered weekday headings in the same cell height, and aligned date-button radii to the calendar cell token. Continuous range backgrounds retain adjacent cells.

Edge checked dark/light × compact/comfortable: date buttons and both axis pitches measure **32 × 32px / 40 × 40px**. Selecting September 8 updates the output. Inspected the compact dark calendar screenshot against the annotated September 6 reference: rows no longer have a wider vertical pitch than columns.

## InputOTP

Lab and Storybook Playground now default to one continuous group of six slots. The explicit grouped story and grouped control remain available.

Edge checked four theme/density combinations: six digits fill and completion feedback appears, no separator is rendered. The dark compact completed screenshot was inspected against the annotated 3+3 layout.

## ImageCompare

The bottom strip came from the local mountain SVG: its polygon ended at y=530 on a 540 px canvas. Extended the polygon to the bottom edge. The reusable comparison component and its cover/contain semantics remain unchanged. The corrected shared asset also serves gallery/carousel stories.

At 100/0, Edge checked all four theme/density combinations. Canvas sampling confirms the bottom-center pixel matches the mountain above it. Inspected the dark compact screenshot against the annotation: no background band remains below the mountain. Keyboard End still reaches 100%.

## Lab navigation and ColorPicker recheck

Component navigation rows display the English name, while full bilingual titles remain in page headings, hover titles and the search index. All complex navigation rows were checked for Chinese suffix removal; searching 排程 still finds Scheduler.

ColorPicker's existing fix (6c52bac) was rechecked across all four theme/density combinations: the addon inherits the group's **12 px radius**, opens the picker, and Escape restores focus.

Remaining scope: this is local validation and local Git history, not a deployment or npm release. Deferred Kanban drafts remain outside these commits.
