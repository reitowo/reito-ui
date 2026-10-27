# Composition contract

Graphite uses neutral surfaces, readable content and quiet chrome. Choose components around the
actual task. The library supplies visual behavior; the application supplies business facts. The
core rules in [SKILL.md](../SKILL.md) apply to everything below.

## Mandatory paths

These screen types have one supported structure. Use it even for a quick prototype.

| Screen | Required structure | Reference |
| --- | --- | --- |
| Complex dashboard / split workspace | `SidebarProvider` → `Sidebar` + `AppShell` → `WorkspacePreset`; slot content in `Stack inset` | [layouts/dashboard.md](layouts/dashboard.md) |
| List-detail with inspector | Same shell: list or `DataTable` in the `workspace` slot, the selected record in the `inspector` slot. Narrow widths switch the active panel; do not build a second responsive layout | [layouts/dashboard.md](layouts/dashboard.md) |
| Settings | `Page inset` → `Page.Header` + `Page.Content` → `SettingsSection` → `SettingsRow`; read-only facts in `PropertyList` | [layouts/settings.md](layouts/settings.md) |
| Page body without a shell | `Page inset` → `Page.Header` + `Page.Content` → `Panel`/`Grid` | [../assets/workbench.tsx](../assets/workbench.tsx) |
| Form | `Form` + `FormField` (validated) or `FieldGroup` + `Field` (local) | [§ Forms](#forms) |
| Conversation | `Conversation` + `Message` + one `Composer` | [§ Conversation](#conversation) |

The Storybook story `复杂/DashboardRecipe 工作面配方` and `docs/recipes/dashboard-workspace.md` are the
maintained source for the dashboard shell. Copy relationships from them, not from screenshots.

## Choose public components

| Need | Components | Composition rule |
| --- | --- | --- |
| Ordinary ops/list/form shell | Shell.Sidebar, Shell.Main, Shell.Topbar, Shell.Content | Host height; named navigation and scrolling regions |
| Complete page | Page.Header, Page.Content | Page owns edge and header-to-content spacing |
| Standalone heading | PageHeader | For a container that already owns layout; no outside margins |
| Page tabs | Tabs, TabsList, TabsTrigger, TabsContent | line for page navigation; no gap compensation |
| Vertical flow | Stack | gap="small/normal/section/none"; inset supplies the outer content edge |
| Actions, metadata, form row | Inline | Wraps; baseline for author/time, end for fields/actions |
| Peer sections | Grid | minColumnWidth="xs/sm/md"; collapses inside narrow containers |
| Section | Panel.Header, Panel.Content, Panel.Footer | Panel owns title identity and inset; flush for self-inset content |
| Widget | Card and slots | Header/body/footer own their insets; avoid cards around every record |
| Text | Text, Heading | Role controls style; heading level controls document semantics |
| Form | FieldGroup, Field, FieldLabel, FieldDescription, FieldError | Field owns related spacing |
| Validated form | Form, FormField, FormError, useForm | Field visuals with validation and submit state |
| Value | Input, Textarea, SelectInput, NumberField | Default controls align without page overrides |
| Records | ItemGroup, Item, ItemContent, ItemActions, ItemSeparator | Content determines height |
| Data | Table, DataTable | Tables own cell geometry, selection and loading/empty/error |
| Empty content | Empty and slots | Put directly in a flush Panel or standalone |
| Application shell | SidebarProvider, Sidebar, AppShell, WorkspacePreset | Fixed tree; see layouts/dashboard.md |
| Scrolling workspace | WorkspacePane, ResizableWorkspace | Own scroll regions and panes |
| Settings | SettingsSection, SettingsRow, PropertyList | Reuse existing form and feedback behavior |
| Search across the app | ApplicationSearch | Pages, records and actions in one dialog |
| Conversation | Conversation, Message, RichMessage, Composer | Continuous content with one composer |
| Contextual actions | Dialog, Popover, DropdownMenu, Tooltip | Use the nearest provider's theme |

Composition, primitives and `ReitoThemeProvider` are exported by `@reito/ui/basic`. Shells, data,
forms and settings use `@reito/ui/complex`; conversation components use `@reito/ui/ai`. Consult
installed types for complete APIs.

## Panel or Card

| Use | When |
| --- | --- |
| `Panel` | A titled section of a page: filters, a list, a table, a chart, a group of fields |
| `Panel flush` | The body is a list, `ItemGroup`, `DataTable`, `Table` or `Empty` that owns its edge |
| `Card` | A standalone, self-contained widget that can move independently (a summary tile in a grid of peers, a preview) |
| Neither | Individual records, messages, settings rows, form fields, single numbers |

A page of five cards each holding one number is a statistics strip; start with the work instead.
Never nest `Panel` in `Panel` or `Card` in `Card`. Inside a `WorkspacePane`, the pane already has a
title bar: put content straight into `Stack inset` and use `Panel` only for distinct sub-sections.

## Typography roles

Use the same role for the same meaning across the product. Never set font size, weight or line
height with utilities.

| Meaning | Component | Notes |
| --- | --- | --- |
| Screen title | `PageHeader title` (renders `Heading level={1} size="page"`) | Once per screen; omit when a pane title already names it |
| Section title | `Panel title`, `Heading size="section"` | Pane and panel titles |
| Record / item title | `Heading level={3} size="item"` | List rows, card titles, author names |
| Body copy | `Text` (variant `body`) | Descriptions, messages, paragraphs |
| Interface text | `Text variant="interface"` | Labels and short UI strings next to controls |
| Metadata | `Text variant="caption" tone="muted"` | Time, owner, counts, hints |
| Long-form reading | `Text variant="reading"` | Articles, documentation, notes |
| Secondary description | `tone="muted"` on any `Text` | Never `text-muted-foreground` on a span |

`Heading level` is document semantics, `size` is visual weight; choose them independently. Use
`as="span"` for inline text inside `Inline`. Headings and text have no browser margins and wrap
completely; explicit truncation must preserve access to the full content. Code keeps the shared
monospace font.

## Inset ownership

Exactly one component supplies each content edge.

- `Stack inset` supplies the edge of a pane body or a page. `Stack` and `Inline` otherwise only
  separate children.
- A padded `Panel` body supplies its own edge. Do not put `Stack inset` inside it.
- Lists, tables and `Empty` already own their edge: use `Panel flush` and place them directly.
- `AppShell` header/footer, `WorkspacePane` header/footer, `SettingsRow`, `Item` and table cells
  own their padding.
- Related text uses `gap="small"`; separate sections use `gap="section"`. No pixel values need to
  be copied into the app.

Page supplies section-gap between its header and body, and content-gap between body sections.
PageHeader uses compact-surface-gap between title and description. Tabs supplies content-gap between
navigation and panels. Use Page consistently for ordinary pages instead of native headings with
per-page margins. Use inset only when the outer container does not already supply the page edge.
Both Tabs variants scroll long labels internally; line labels keep their natural width and share
one baseline with the active indicator. Preserve drafts with application state and keepMounted when
the form DOM must remain present. Theme overrides use the same public spacing roles.

## Forms

- Validated or submitted data: `Form form={useForm()}` with one `FormField` per value and a single
  `FormError`. `FormField` renders the label, description and error; pass `controlProps` to the
  control. Local filters: `FieldGroup` → `Field` → `FieldLabel` + control + `FieldDescription`/
  `FieldError`.
- A filter row: `Inline align="end"` with `Field`s and the submit `Button`; fields grow, the button
  keeps its default size and aligns with the inputs.
- Submit/reset actions sit in one `Inline` after the fields. Default control sizes align; do not
  set heights or font sizes.
- A form in a dashboard belongs in the `inspector` slot or a `Dialog`, not in a floating card.
- Preserve drafts on failed submit and Chinese IME composition; `SelectInput` uses
  `onValueChange`.

## Conversation

- `Conversation` owns the reading width, scroll following and "jump to latest". `Message` owns role
  styling. Messages are continuous content: do not wrap each message in a `Card` or `Panel`.
- `Composer` is the main rounded container; its input and supporting actions belong inside it.
  Use one composer per conversation.
- Keep the conversation inside a `WorkspacePreset` slot when it is part of a larger application.
- Do not present demo content as a real AI response or external integration.

## Theme

The theme is code. One root provider defines the global theme; nested providers define local
scopes. Classes and CSS variables in application code are not a theme mechanism.

```tsx
import { ReitoThemeProvider, type ThemeTokenOverrides } from '@reito/ui/basic';

export const appTheme = {
  semantic: { 'radius-surface': 'var(--rui-radius-lg)' },
  components: { button: { radius: 'var(--rui-radius-md)' } },
} satisfies ThemeTokenOverrides;

<ReitoThemeProvider root mode="system" colors={{ primary: 'blue' }} tokens={appTheme}>
  <App />
</ReitoThemeProvider>;

// Local scope: inherits mode, colors and tokens; merges only what it sets.
<ReitoThemeProvider density="comfortable" tokens={{ semantic: { 'content-padding': 'var(--rui-space-5)' } }}>
  <Onboarding />
</ReitoThemeProvider>;
```

- `root` is set once; it applies the theme to the document so portals and body backgrounds match.
- A nested provider without `mode`, `colors` or `density` inherits the parent's value. `tokens`
  merge per key: semantic tokens by name, component tokens per component and property.
- Dialogs, popovers and menus opened inside a scope keep that scope's theme.
- Token names are typed from `packages/tokens/src/tokens.json`; values should reference other
  `--rui-*` tokens rather than literal colors or pixels.
- Planned in [#20](https://github.com/reitowo/reito-ui/issues/20) (AI-THEME-01..03): `Theme` as an
  alias of the nested provider, `createTheme` for a reusable preset object, and component prop
  defaults. They are not exported yet; use `ReitoThemeProvider` and a typed object today.

radius-control is the rectangular control role; radius-surface is the panel/card role. Menus and
composers retain explicit roles.
Global curvature follows Nuxt UI's --ui-radius model: every radius step is a multiple of
--rui-radius (default 0.25rem; control = ×1.5, surface = ×2), so set
`<ReitoThemeProvider radius="0.375rem">` instead of per-component radius CSS.

## Don't

- Don't build an application shell, sidebar or split view from divs; use the dashboard layout.
- Don't write `p-*`, `m-*`, `gap-*`, `space-*`, `text-{size}`, `font-{weight}`, `leading-*` or
  `tracking-*` on product UI.
- Don't add `className` or `style` to change a component's padding, height, font or radius; change
  the theme tokens or fix the component.
- Don't pad inside a padded `Panel`, or put a list/table/`Empty` in a non-flush `Panel`.
- Don't wrap every record, message, setting or number in a `Card`.
- Don't add `overflow-auto` inside workspace panes or make the page body scroll around the shell.
- Don't render empty, loading or error states as raw text or custom spinners.
- Don't use palette utilities or literal colors; use semantic utilities only when a reference
  layout requires a structural class.
- Don't add a density or theme switch, a statistics strip, decorative tabs or uppercase eyebrows to
  the product unless explicitly requested.
- Don't style `data-slot` selectors or copy component source into the application.
- Don't use Radix `asChild`; Base UI uses `render`.

## Local 0.6 candidate changes

Default Button/Input/Select align at 32/36/24px for compact/comfortable/dense and share the interface
font role. Explicit sizes remain deliberate variants. Card and Empty use surface radius rather than
composer radius. Empty, fields and list spacing respond to density. These are intentional visual
changes from 0.5.8: validate an existing consumer before upgrading and then remove compensating CSS.
Current numerical scales come from packages/tokens/src/tokens.json and its generated public catalog.

## Executable recipe

[workbench.tsx](../assets/workbench.tsx) uses public imports and has no stylesheet, private selector
or custom reset. Replace its local example state with product content and callbacks. Lab and
Storybook theme controls are inspection tools; the resulting product does not need those controls.
