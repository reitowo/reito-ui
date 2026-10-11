# Component shape and alignment review

Reference: the user's five annotated screenshots from the local component overview, 1303 × 1244, dark theme and compact density. The first four identify the color trigger shape, tag curvature, breadcrumb spacing, and Kanban text alignment. The fifth asks how Scheduler is implemented.

## Actual causes and shared changes

| Component | Before | After |
| --- | --- | --- |
| ColorPicker / ColorInput | A 28px button with 6px radius was clipped by an addon with 12px radius and a -4px margin. | One inset swatch, 24px in compact and 32px in comfortable. Its radius derives from input radius minus space-1; the addon does not clip it or use a negative margin. Read-only swatches use the same shape, with the checkerboard behind the color layer. |
| InputTags | 6px tag corners inside a 12px field; tag controls had independent corners. | Field uses the input component radius. Tag radius derives from that radius minus space-1 (8px by default), and editing/removal controls inherit it. |
| Breadcrumb | 6px item gap and 16px between navigation and example status. | Item gap and the related-content stack use content-gap-sm: 8px compact and 12px comfortable. The ordinary example Stack default remains unchanged. |
| Kanban | Title button added 10px horizontal padding plus its transparent border, while the description started at the card content edge. | Title removes both duplicate padding and border. Live text-range measurement confirms title and description share the same x coordinate (offset 0px). Card padding and keyboard focus ring remain intact. |

The fixes live in shared components or shared catalog examples. No Lab selector override or new literal palette/size was added. The composed screenshots in `.logs/component-shape-inputs-live.png`, `.logs/component-shape-breadcrumb-live.png`, and `.logs/component-shape-kanban-live.png` retain surrounding card context for comparison with the user's references.

## Scheduler implementation boundary

The component wraps FullCalendar Standard 7.1.0. `scheduler.tsx` imports the day-grid, time-grid and interaction modules, replaces the built-in toolbar with shared Buttons, and provides controlled view, date and event callbacks. `scheduler-theme.ts` maps structural slots to existing tokens and generated metrics. Drag/resize proposals revert FullCalendar's temporary mutation before asking the host to save; the host's successful event update is the persisted result. Failed saves retain the old events and support retry.

`scheduler-demo.tsx` holds local events and a fixed September 2026 date. It demonstrates two overlapping timed events and an all-day event. It does not connect to a calendar service. Scheduler behavior and layout were inspected for explanation, not changed in this review.

## Verification evidence

Full build and check both passed. ColorPicker and the two InputTags suites passed all 45 checks, including light/dark, both densities, IME, editing, disabled states and accessibility. The initial combined interaction run passed 54 tests and failed one Kanban Storybook Controls test. Inspection showed that the handled Alt+ArrowRight shortcut bubbled out to the Storybook manager and selected the next (read-only) story. Kanban now stops propagation for the shortcuts it handles, keeping ancestor shortcuts from also acting. The test also targets the accessible named switches and verifies their checked state. The final full Kanban suite passed all 10 tests (24.9s), including the formerly failing Controls test, keyboard moves, drag/drop, failed saves and four theme/density combinations. Logs: `.logs/component-shape-alignment-*.log` and `.logs/component-shape-kanban-final-tests.log`.

Changes are local follow-up work and are not included in the published 0.5.6 packages. Existing editor fixes, loading-copy cleanup, confirmation placement and other Kanban draft work remain in the working tree.
