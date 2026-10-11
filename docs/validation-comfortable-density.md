# Comfortable density and theme menu review

Date: 2026-10-11 (Asia/Shanghai).

Reference: the user asked to move compact/comfortable into the theme picker, keep the current compact result, and inspect the comfortable values. The inspected working context is the local component overview, dark theme, 1303 × 1244, with representative inputs, menus, data rows, cards, dialogs and AI surfaces. Before evidence: `.logs/comfortable-before-live.png`.

## Shared contract

| Role | Compact, unchanged | Comfortable before | Comfortable now |
| --- | ---: | ---: | ---: |
| XS / SM / field / LG control height | 24 / 28 / 32 / 36px | 32 / 36 / 40 / 44px | 28 / 32 / 36 / 40px |
| Default button height | 28px | 36px | 32px |
| Menu vertical inset / ordinary single-line row | 4px / 28px | 8px / 36px | 6px / 32px |
| General content padding | 12px | 20px | 16px |
| Related content gap | 8px | 12px | 10px |
| Cell horizontal / vertical padding | 10 / 6px | 16 / 10px | 12 / 8px |
| Compact surface horizontal / vertical padding | 12 / 8px | 16 / 12px | 16 / 10px |
| Compact surface text gap | 4px | 8px | 6px |
| Card horizontal / vertical padding | 16 / 12px | 20 / 16px | 20 / 16px |
| Card related text gap | 8px | 12px | 10px |
| Virtual row height role | 36px | 46px | 40px |
| Composer input minimum height | 80px | 112px | 96px |

Only comfortable density values change in `packages/tokens/src/tokens.json`. The tuning script compares the serialized compact group before and after and rejects a change. Generated CSS, Tailwind bridge and numeric metrics are rebuilt from that source; they are not edited by hand. Font, color and radius foundations remain unchanged. Numeric values above are the 16px-root interpretation of scalable rem values.

`ThemeControls` now owns the density radios alongside palette and appearance mode. `useDensityPreferences` and `readThemeDensity` provide one validated stored preference for Home, Overview, the detailed Lab and ThemeGuide. Restoring the default theme also restores compact density. Existing independent density buttons are removed. Changing the preference updates styles without replacing the demo tree. Consuming Workbench applications retain their existing compact default and gain no density control from this Lab change.

## Verification

Screenshots, actual browser measurements, full build/check and core regression results are recorded in `.logs/comfortable-density-*` and `.logs/theme-density-menu-live.png`. New interaction coverage checks menu selection, demo state preservation, preference persistence across all four Lab routes, and reset. Existing density geometry assertions use the approved new comfortable contract while retaining compact expectations. Full-catalog geometry, light/dark themes, both densities and relevant virtualized rows are included in validation.

Actual final results:

- Complete `npm run build` and `npm run check`: passed.
- Source verification: compact is identical to HEAD, and every token group outside density is identical to HEAD. Only 21 comfortable roles changed. Evidence: `.logs/comfortable-density-source-verification.json`.
- Core suite: 236 passed initially; 5 failed because the button-size inventory still contained the previous comfortable size map, and standalone preview completion depended on the removed loading phrase. The inventory now uses the approved map. Standalone tests now wait for a real visible component child before checking for failure messages, strengthening completion validation. All 5 were covered by successful full-file reruns.
- Four catalog geometry combinations plus four table/AI density combinations: 8 passed (1.3m). The AI inset assertions now distinguish horizontal and vertical roles; their previous equal-padding expectation was obsolete.
- All 139 standalone previews: all three layer tests passed (2.3m), with runtime errors still collected and rejected.
- Additional comfortable coverage: 56 passed initially; the two obsolete equal-inset assertions were subsequently covered by the successful density rerun. This includes dates, tags, menus, tree rows, virtualized lists/grids, state preservation, and both appearance themes.
- Live comfortable measurements: default button 32px, ordinary input 36px, ordinary menu row 32px, interface font 13px. Switching back to compact returns input height to 32px. The live menu shows the selected density and the independent header toggle is absent.

Core, supplemental and repair logs preserve the initial failures and final results separately; this is not represented as one uninterrupted all-pass run. Final page evidence is `.logs/comfortable-after-live.png` and `.logs/theme-density-menu-live.png`.

The result stays a desktop UI with slightly larger targets and modest spacing. Card body insets remain wider than ordinary menus and short confirmation surfaces; comfortable density is not a uniform scale transform. These are local changes, not part of the already published 0.5.6 packages.
