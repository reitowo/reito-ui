# TabsContent and Table focus validation

Validated on 2026-09-10 against `1bc23ef`, using only synthetic Storybook content.

## Change and visual reference

The composed `基础/Tabs → 阅读面板与宽表焦点` story places text, an opaque wide table, and a child button between ordinary controls. TabsContent and the Table scroll wrapper reuse `rui-scroll-focus` with the opt-in `rui-scroll-focus-border` modifier. A permanent `--rui-border-width` transparent leading border (currently 1px) reserves the marker's space; keyboard focus changes its color without moving content. This small permanent gutter is the intended layout difference; a Table nested in TabsContent reserves 2px in total. Existing Conversation, WorkspacePane, and ScrollArea markers are unchanged.

The final dark/light screenshots were inspected at 1440 × 1000. The leading marker remains visible next to opaque table rows and after horizontal and vertical scrolling, with no full normal-mode frame. The text panel has the same quiet leading marker. Pixel assertions additionally sample the rendered PNG edge in both themes and both densities; computed CSS alone does not establish visibility. Focused and unfocused bounds match exactly. The comparison source is the synthetic story itself; no external product screenshot or asset is included.

## Completed checks

- `npm run check`: passed, including catalog/design checks, token audit, and all workspace typechecks. Token audit reported 331 files, 0 unapproved usages, and 28 exact exceptions.
- `npm run build`: passed for UI, Lab, Storybook, and Workbench. Existing large-chunk warnings remain.
- Playwright: **24 passed** (11 TabsContent/Table cases plus 13 existing scroll-focus cases), using Chrome/Chromium and fresh static builds served on isolated ports 6018 (Storybook) and 6019 (Lab), with `reuseExistingServer: false`. No existing development server was reused.
- Coverage: pointer quietness, keyboard entry, visible marker pixels, parent quietness while a child button keeps its own focus cue, tab/panel ARIA links, Home/End/arrow navigation, disabled-tab nonactivation, native table scrolling in both axes, unchanged bounds on focus, dark/light themes, compact/comfortable densities, and forced-colors system outlines.
- The ARIA/table scan passed for `aria-allowed-attr`, `aria-hidden-focus`, `aria-prohibited-attr`, `aria-required-attr`, `aria-required-children`, `aria-required-parent`, `aria-roles`, `aria-tab-name`, `aria-valid-attr-value`, `aria-valid-attr`, `table-fake-caption`, `td-headers-attr`, and `th-has-data-cells` across all three enabled panels. This is a scoped semantics check, not a full accessibility pass.

## Boundaries and existing issues

The initial broad axe scan reported `scrollable-region-focusable` for the Table wrapper, which has no explicit `tabindex`. That rule is outside the final scoped semantics scan. This change preserves the wrapper's DOM and focus behavior; Chrome's native overflow tab stop was exercised, while Safari behavior remains unverified. The screenshots and pixel checks cover left-to-right layout in Chromium, not RTL or a full browser matrix. Base UI's active-panel tab stop and focusable disabled tabs are preserved; pressing Enter on a disabled tab does not activate it.

Generic host focus fallbacks must remain in `@layer base` or exclude shared focus-managed elements. The interaction fixture injects a base-layer `[tabindex]:focus-visible` fallback to verify that integration. An unlayered host selector can still override component styling and requires a host cascade correction.

On this baseline, `npm ci` failed because the lockfile omitted `@emnapi/core@1.11.3` and `@emnapi/runtime@1.11.3`. Local validation used `npm install --package-lock=false --no-audit --no-fund`; the lockfile was not changed. Initial test-fixture corrections respected actual behavior: Base UI permits focus on disabled tabs, the synthetic grid needed a constrained width to overflow, and clicking a table cell does not promise focus on its native scroll wrapper.
