# MR integration validation

This integration combines PR #9 (Field control layout) and PR #26 (the separate Affect surface entry) with the current documentation site.

## Integration decisions

- Preserve the current compact Field spacing while adding FieldControlRow and the outlined FieldSet API.
- Preserve the public site and Markdown/llms documentation pipeline. Add the Affect layer to gallery filtering, detail pages and generated documentation, using `@reito/ui/affect` rather than adding its conflicting names to the root entry.
- Rebuild tokens before Lab, Storybook and Workbench development startup. The reported flattened homepage buttons used current source with stale generated token CSS, leaving the new XL height and button color variables undefined.
- Resolve all public UI entry aliases to source during development, avoiding a mixture of current source and old compiled complex/AI components.
- Keep the Affect button shine decorative for accessibility, and separate TaskBoard card opening from its favorite button.
- Fix the TraceWaterfall clock feedback loop: controlled timestamps are returned directly, while uncontrolled live timestamps advance on an interval. Add a running Storybook example and a regression that checks time advances without maximum-update-depth errors.

## Executed checks

| Check | Result |
| --- | --- |
| `npm run build` | Passed after the clock fix |
| `npm run check` | Passed after the clock fix |
| Token audit | Zero unapproved exceptions |
| Field control layout interaction checks | 5 passed |
| Final merged interaction suite | 33 passed in 2.3 minutes |
| Compiled public consumer/composition suite | 30 passed in 34.2 seconds |
| Public documentation generation | 280 pages across 7 sections |

The final interaction suite covers Field layout, homepage button geometry, shared menu density, Affect button names and sizes in both themes and densities, gallery/documentation integration, independent TaskBoard actions and the live trace clock. Catalog output contains 267 component families, including 123 Affect families.

## Visual comparison

Reference: the user's cropped homepage screenshot showing the flattened primary action and short outlined secondary action. Inspected composed homepage captures in dark and light themes after rebuilding tokens. The homepage actions now resolve their XL height to 48px and render the intended filled primary action. This restores the current source design; it does not change all shared buttons into pills. The isolated Affect button capture was also inspected in light/compact mode; its separate 40px default surface remains distinct from the basic Reito controls.

Local evidence is saved in ignored `.logs/home-merge-dark.png`, `.logs/home-merge-light.png`, `.logs/affect-merge-light-compact.png`, `.logs/merge-pr26-clock-build.log`, `.logs/merge-pr26-clock-check.log`, `.logs/merge-pr26-clock-tests.log` and `.logs/merge-composition-tests.log` in the integration worktree.

## Limits

The local suites pass, and the final run contains no maximum-update-depth or nested-button warning. Other development warnings remain: an update-before-mount warning, Base UI panels combining transitions and animations, and an intermittent ResizeObserver loop notification. These results do not establish a clean console for every example, pixel parity for all 123 Affect families, or any real external integration. Remote CI is triggered by the final push; these local results do not assert that remote CI has completed.
