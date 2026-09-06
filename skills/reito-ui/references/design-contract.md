# Reito Graphite portable design contract

Baseline: Reito UI 0.4.1, revised 2026-09-06. The basic layer contains 50 pinned shadcn / Base UI base-nova generated families and 4 local Base UI compositions; complex / AI layers share Tailwind 4 and the same tokens. Read installed types and current token source before using exact values. This document travels with the Skill; it does not depend on a machine-specific repository location.

## Visual rules and token roles

Graphite uses neutral grayscale surfaces, compact desktop controls, readable content and quiet window chrome. Blue is reserved for focus, links and information that needs emphasis; ordinary navigation selection uses a neutral surface. Support dark and light with compact and comfortable density. These are original choices, not official Cursor, Claude, or Multica tokens.

| Purpose | Tokens |
| --- | --- |
| Canvas, panel, overlay surface | `--rui-bg`, `--rui-surface`, `--rui-elevated` |
| Hover and pressed surface | `--rui-hover`, `--rui-active` |
| Primary, secondary, supporting text | `--rui-text`, `--rui-text-secondary`, `--rui-text-muted` |
| Soft dividers and optional stronger boundary | `--rui-border`, `--rui-border-strong` |
| Main action and its text | `--rui-primary`, `--rui-on-primary` |
| Accent, accent surface, focus | `--rui-accent`, `--rui-accent-soft`, `--rui-focus` |
| Conversation composer surface and radius | `--rui-composer-bg`, `--rui-radius-composer` |
| Feedback | `--rui-success`, `--rui-warning`, `--rui-danger` with matching `-soft` surfaces |

The source structure is `palette` → `themes` aliases, plus shared `foundation` and `density` groups. Components consume generated semantic variables. Add a component alias only for a real reusable decision; there is no requirement to manufacture a token for every CSS declaration.

At a 16 px root font size, compact controls are 24/28/32/36 px for xs/sm/default/lg; comfortable controls are 32/36/40/44 px. The shared interface font is 14 px and reading text is 16 px. Spacing follows 4 px steps; radius tokens are 6/8/12 px and a 14 px composer role. The CSS ships open-source Inter Variable with system Chinese and monospace fallbacks. Do not add page-specific font or SVG overrides, or download proprietary fonts.

The 0.3 → 0.4 upgrade changes content spacing defaults while retaining those control heights. Use these shared density roles instead of fixed page padding. Values below are pixels at a 16 px root, generated from rem tokens.

| Role | CSS token | Compact | Comfortable |
| --- | --- | ---: | ---: |
| Content padding | `--rui-content-padding` | 12 | 20 |
| Content gap | `--rui-content-gap` | 12 | 16 |
| Small content gap | `--rui-content-gap-sm` | 8 | 12 |
| Cell horizontal padding | `--rui-cell-padding-x` | 10 | 16 |
| Cell vertical padding | `--rui-cell-padding-y` | 6 | 10 |
| Table header vertical padding | `--rui-table-head-padding-y` | 4 | 6 |
| Table header height role | `--rui-table-head-height` | 36 | 48 |
| Message gap | `--rui-message-gap` | 16 | 24 |
| Composer input minimum height | `--rui-composer-input-height` | 80 | 112 |
| Empty-state padding | `--rui-empty-padding` | 24 | 40 |
| Preview padding | `--rui-preview-padding` | 16 | 24 |

Use `p-[var(--rui-content-padding)]` and `gap-[var(--rui-content-gap)]` for general composed content, cell roles for table rows, and the appropriate conversation/preview role for those surfaces. Table row height remains content-dependent. The older panel-padding and row-height tokens are distinct layout roles, not universal component padding or data-row heights. Inside an existing artifact frame, `CodeBlock variant="embedded"` removes its outer frame while retaining code text padding; the parent should not add another layer of content padding around that code view.

Default controls and dividers have soft boundaries. Use a stronger edge only when needed for recognition; keep an explicit focus indicator. Surface contrast, readable text, control recognition and keyboard focus have distinct roles. Avoid applying a bright permanent outline to every input and button in an attempt to improve accessibility.

Density changes dimensions and spacing, not the user's zoom level. Set theme and density on the document root. Popovers and dialogs portal outside ordinary component wrappers, so a local wrapper alone cannot guarantee theme consistency.

## Choose existing components by meaning

This is a selection aid, not an exhaustive API reference. Verify each component in installed types.

| Need | Start with | Distinction that matters |
| --- | --- | --- |
| Action | Basic `Button` | Variants: default/outline/secondary/ghost/destructive/link. Icons use size icon/icon-sm/icon-xs and an accessible name. Loading is composed with Spinner + disabled; there is no universal loading prop. |
| Form value | Basic `Field`, `Input`, `Textarea`, `Select`, `Combobox` | Compose FieldLabel/FieldDescription/FieldError. Select composes Trigger/Value/Content/Item; verify Base UI items/value APIs. |
| Multiple values / number | Basic `MultiSelect`, `NumberField` | Both require label. MultiSelect uses options and optional controlled string[] value; NumberField preserves Base UI nullable value, range, step and commit contracts. |
| Boolean option | Basic `Checkbox`, `Switch` | Compose Label or aria-label; do not assume a label prop. Checkbox means selection, switch an immediate setting. |
| Related view / information | Basic `Tabs`, `Accordion`; complex `WorkspacePane` | Use TabsList/Trigger/Content and AccordionItem/Trigger/Content. WorkspacePane offers title/actions/footer/children. |
| Contextual action | Basic `DropdownMenu`, `Tooltip`, `Dialog` | Compound components; Base UI render composition differs from Radix asChild. TooltipProvider uses delay. |
| Feedback | Basic `Badge`, `Alert`, `Progress`, `Spinner`, `Skeleton`, `Empty` | Distinguish status, loading, progress and absence. Status needs a label, not only color. |
| Notifications / measurement | Basic `ToastProvider`, `useToastManager`, `Meter` | Toasts live in a labelled provider region; the manager controls their lifecycle. Meter describes a bounded measurement, not asynchronous progress. |
| Data / forms | Complex `DataTable`, `SearchFilterBar`, `PropertyList`, `DateRangePicker`, `FileUpload` | Read controlled-value, validation and async callback contracts. DataTable is local, not virtualized or a server protocol; uploads are local queues. |
| Resource collection / arbitrary keys | Complex `ResourceList`, `KeyValueEditor` | ResourceList filters, sorts and selects local items by stable ID; row actions belong to the host. KeyValueEditor edits a controlled entry array, preserves invalid drafts, validates required/duplicate keys and optionally masks values; masking is not secure storage. |
| Diff / logs | Complex `DiffViewer`, `LogViewer` | DiffViewer requires explicit hunks with line numbers and before/after pairing; it does not calculate diff. LogViewer filters host entries and pauses/resumes following; it is not a terminal executor. |
| Navigation / commands | Basic `Sidebar`, `Breadcrumb`, `CommandDialog`; complex `DisclosureTree`, `CommandSearch` | DisclosureTree is a native disclosure list, not an ARIA tree. Printed shortcuts do not register app hotkeys. |
| Conversation / execution | AI `Composer`, `Conversation`, `ToolCall`, `PermissionRequest`, `ArtifactPanel` | Composer uses onSubmit(text): void or Promise<void>, toolbar and context slots. Rejection preserves the draft. The host owns model requests, streaming, execution, permissions and persistence. |
| Message controls | AI `MessageActions`, `MessageBranch` | Actions copy caller text and invoke host edit/retry/feedback callbacks. Branch selection uses controlled zero-based index/count; it does not create or persist conversation forks. |
| Queue / restore decision | AI `TaskQueue`, `Checkpoint` | Queue operations pass task IDs to host callbacks. Checkpoint confirms and awaits onRestore, preserving failure context; neither component schedules work or writes files. |

Public layer imports are @reito/ui/basic, @reito/ui/complex and @reito/ui/ai. The root also exports them. Catalog demos stay outside the public runtime entry points. CSS ships compiled utilities and Tailwind Preflight; load it once. An application using Tailwind 4 can import @reito/tokens/tailwind for its own semantic utilities. Fix values in tokens.json, not in a second @theme palette.

The current library checkout also runs `tokens:audit` in `check`: standard spacing, typography, radii, shadows and motion must use its generated bridge; exact structural exceptions live in `docs/design-token-policy.json`. Container query sizes must be compiled from token values because runtime CSS variables are invalid inside query conditions. Numeric-only APIs use generated `@reito/tokens/metrics` defaults (px/ms, rem at a 16px baseline); inspect the installed version before importing that newer entry point. Workspace changes do not retroactively update older tarballs.

Chinese example content: workspace “研究工作台”; a long source name “沪深市场分钟行情与复权因子同步”; error “连接失败，请检查地址后重试”; empty state “还没有数据源” with action “添加数据源”. Use actual domain text rather than repeated placeholder labels. Some built-in library wording is English; do not claim full localization or invent unsupported locale props.

## Compose screens

Choose the structure from the user's working context. The library Lab organizes 54 basic, 15 complex and 19 AI component families (88 total); named compound exports are not separate families. Workbench demonstrates shared components in Agent, file review and settings flows using local data and callbacks. Select the structure required by the application. Forms, settings, tables and document views use the structure their work needs; this contract does not require every application to become a chat product.

Keep the primary work prominent, with short toolbars and lightweight sidebar rows. Secondary metadata should not compete with task titles or body text. Open artifacts, diffs and inspectors when relevant; navigation, active work and supporting context do not have to be three permanent columns. Start from shared layout dimensions; allow secondary panels to collapse when width or zoom makes multiple columns unusable. Keep one clear scroll owner per pane and constrain long-form reading width.

In conversation layouts, the composer is the main soft container. Keep input, attachments or context, mode/model controls and send action together. Let body text flow on the canvas; reserve cards for a meaningful grouped tool result or artifact. Large statistics strips, uppercase eyebrows and decorative filename tabs do not establish desktop character. Use real tabs, metrics or code labels when the actual work calls for them.

Long names must not push actions offscreen. Wrap narrative content; constrain horizontal overflow to code/table containers where necessary. A consumer may add page layout using shared spacing and role tokens; it must not override `[data-slot]` internals to create a divergent component theme.

## Interaction and review gates

For each applicable component, inspect default, hover, focus-visible, active, disabled, loading, invalid and empty states. Do not create irrelevant states for static components.

- Four combinations: dark/light × compact/comfortable. Include open menus, selects and dialogs in the inspection.
- Responsive views: 1280 × 800 and 960 × 720, plus browser 200% zoom. No accidental page-wide horizontal overflow or inaccessible essential control. Local code/table scrolling may be intentional.
- Keyboard: Tab reaches meaningful controls; menus/Tabs/selects keep appropriate arrow-key behavior; Escape closes overlays; closing an overlay returns focus to a sensible place.
- Chinese IME: candidate-confirmation Enter must not submit a message or execute a command. Composer supports Shift+Enter for a newline. A real OS IME check remains necessary when only synthetic events have been tested.
- Loading: no duplicate submit; feedback remains labelled. Error and success do not depend solely on color. Reduced-motion preference removes unnecessary animation.
- Every added public component has a discoverable Storybook example and applicable state coverage. Register its Demo in the correct catalog, run `npm run catalog:build`, and keep `catalog:check` clean; the generated manifest supplies family counts and real Storybook IDs. Relevant automated accessibility violations are resolved or explicitly tracked; automated checks are not a full accessibility certification.
- Token-generation consistency, typecheck and production build exit successfully for code changes. Record actual command results and manual coverage; never convert “configured” into “passed”.
- For visual work, inspect a reference of the selected working context and compare the actual composed page. Record the source, whether it is an application screenshot or website demo, theme, viewport and remaining differences in structure, grayscale, boundary strength, typography, reading space and composer. Passing build, interaction or accessibility tests does not establish visual similarity.

## Consumption and maintenance

Load the public package CSS in this order:

```tsx
import '@reito/tokens/css';
import '@reito/ui/styles.css';
```

Use `<html lang="zh-CN" data-theme="dark" data-density="compact">`. The consuming application owns preference persistence, routing and business effects.

For local distribution in the library repository, run `npm run pack:library`: it generates tokens, builds UI and packs both `@reito/tokens` and `@reito/ui` into `artifacts/`. Install both tarballs together. The lower-level `pack:ui` script alone does not distribute the token dependency. The current UI depends on tokens at an exact version, so bump the dependency when bumping tokens. Do not overwrite an already-used version with different content. The 0.x library is experimental; document breaking defaults/API/token changes and validate each consuming product before upgrade.

The repository's `npm ci` postinstall generates tokens. `npm run test:ui` starts or reuses the example dev server according to Playwright configuration; verify an existing server belongs to the current checkout. `npm run test:storybook` requires a running Storybook server. Inspect current scripts before claiming either test passed.

Repository preview commands: `npm run dev` opens Lab on 5173, `npm run storybook` serves Storybook on 6006, and `npm run dev:workbench` serves Workbench on 5175. A Lab deep link has the shape `?layer=complex&component=diff-viewer`; take component IDs and corresponding story IDs from the generated manifest. Default demo content is local; previews do not establish a live integration or prove product acceptance. Preserve historical version records and record 0.x density/API changes when upgrading consumers.

## Reference boundaries

The 0.2 visual contract was informed by actually inspected official images: [Cursor 2.0 application view](https://cursor.com/blog/2-0), [Cursor Agents Window application views](https://cursor.com/docs/agent/agents-window), and [Claude Desktop Chat and Code views](https://academy.claude.com/tutorials/navigating-the-claude-desktop-app). These establish context-specific observations about task flow, quiet chrome, composer structure and reading space. They are not a specification to copy.

The [Cursor product page](https://cursor.com/product) was also rendered and inspected in dark mode. Its task sidebar and composer are a website demo, not a verified screenshot of the installed desktop app. No exact desktop dark palette or official reusable token package was established. Never present sampled image pixels, approximate dimensions or the library's own token values as official product tokens. The library repository's `docs/references.md` keeps the exact inspected image URLs and provenance.

Other provenance: [Cursor themes](https://cursor.com/help/customization/themes), [Claude Artifacts](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them), [Multica license](https://raw.githubusercontent.com/multica-ai/multica/main/LICENSE), [DTCG 2025.10 format](https://www.designtokens.org/tr/2025.10/format/), [Radix styling (0.2 reference)](https://www.radix-ui.com/primitives/docs/guides/styling), [Storybook accessibility](https://storybook.js.org/docs/writing-tests/accessibility-testing). Multica's additional UI/branding/service conditions are why this library uses original styling instead of extracted Multica source. DTCG 2025.10 is a stable Community Group format report, not a W3C Standard.
