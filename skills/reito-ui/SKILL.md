---
name: reito-ui
description: Build or fix React interfaces with Reito UI using public components, fixed layout references and the typed theme system. Use when the user requests Reito UI or Graphite, asks for a dashboard, admin, settings, form or chat screen in a Reito application, or an existing Reito application needs layout or theme corrections.
---

# Reito UI

The library owns control geometry, typography, internal spacing, surfaces, focus and portal themes.
The application owns content, routes, business state and commands. A screen built from this skill
should look finished without application CSS.

## Core rules (always apply)

1. **Theme root.** Import `@reito/tokens/css` then `@reito/ui/styles.css` once. Wrap the app in
   one `<ReitoThemeProvider root mode=… tokens={appTheme}>`. `appTheme` is a typed
   `ThemeTokenOverrides` object (plus optional `colors` and `density`) defined in code. That object
   is the global theme; there is no theme CSS file.
2. **Scoped theme.** A subtree that needs different colors, density or tokens is wrapped in a
   nested `<ReitoThemeProvider>`. It inherits everything from its parent and merges only what it
   sets. This is the `Theme` scope; never imitate it with `className`, Tailwind or CSS variables.
3. **Zero application CSS for ordinary screens.** Forms, lists, tables, panels, settings, empty
   states and dashboards need no stylesheet, no `style` geometry and no `data-slot` selectors.
4. **No raw spacing or typography utilities on product UI.** Do not write `p-*`, `px-*`, `m-*`,
   `gap-*`, `space-*`, `text-xs/sm/base/lg`, `font-medium/semibold`, `leading-*` or `tracking-*`.
   Use `Stack`/`Inline`/`Grid` `gap`, `Stack inset`, `Panel` (padded or `flush`), `Heading size`,
   `Text variant/tone` and documented control props. Copied structural shell classes in the
   layout references are the only exception.
5. **Load the layout reference before writing a screen** (see routing below). A dashboard or any
   app with a sidebar uses `SidebarProvider` → `Sidebar` → `AppShell` → `WorkspacePreset` exactly
   as in [layouts/dashboard.md](references/layouts/dashboard.md). Never invent a shell from divs.
6. **One inset owner per surface.** `Stack inset` or a padded `Panel` body supplies the edge;
   lists, tables and `Empty` use `Panel flush`. Never pad inside an already padded body.
7. **Panel for sections, not Card for records.** Records go in `ItemGroup`/`Item` or `DataTable`
   inside one `Panel`. `Card` is for a standalone widget, never one per row or per number.
8. **States use public components.** Empty → `Empty`; loading → component `loading` props,
   `Spinner` or `Skeleton`; errors → `DataTable error/onRetry`, `FieldError`, `FormError`, `Alert`.
9. **Prefer composition over `className` overrides.** If a public composition looks wrong, fix
   the component or token in the library, not the page.
10. **Density is code, not chrome.** `compact` is the default. Use default control sizes; do not
    shrink controls with ad-hoc sizes, and do not add a density or theme switch to the product
    unless the user asks for it.

## Routing

Read the reference that matches the task before writing code. Combine them when a screen nests
another (for example settings inside a dashboard slot).

| Task | Load |
| --- | --- |
| Dashboard, admin, task/ops workspace, list-detail, any app with a sidebar | [layouts/dashboard.md](references/layouts/dashboard.md) |
| Settings, preferences, account, project configuration | [layouts/settings.md](references/layouts/settings.md) |
| Forms, filters, create/edit dialogs | [design-contract.md § Forms](references/design-contract.md#forms) |
| Chat, assistant, agent conversation | [design-contract.md § Conversation](references/design-contract.md#conversation) |
| Theme, brand colors, density, local variation | [design-contract.md § Theme](references/design-contract.md#theme) |
| Anything else, component choice, typography | [design-contract.md](references/design-contract.md) |

## Start

Read the installed `@reito/ui` and `@reito/tokens` versions; they must match. The composition APIs
(`Stack`, `Inline`, `Grid`, `Text`, `Heading`, `PageHeader`, `Panel`) target 0.6.0-next.0 and later;
0.5.8 does not export them. Consult public types or the Storybook story when a prop is unclear;
application authors should not need private component CSS.

Imports: basic components, composition and `ReitoThemeProvider` from `@reito/ui/basic`; shells,
`DataTable`, `Form`, settings and search from `@reito/ui/complex`; conversation from `@reito/ui/ai`.

## Compose

- [layouts/dashboard.md](references/layouts/dashboard.md) is the fixed application shell, derived
  from `docs/recipes/dashboard-workspace.md` and the Storybook `DashboardRecipe` story.
- [assets/workbench.tsx](assets/workbench.tsx) is a complete page body (PageHeader, filter Panel,
  record list, Empty) with public imports and no CSS. It is generated from the Lab composition and
  verified against the compiled package. Use it as the content inside a workspace slot.
- [design-contract.md](references/design-contract.md) gives component selection, typography roles,
  inset ownership and the full don't list.

Use documented control props. Base UI composition uses `render`, not Radix `asChild`;
`SelectInput` reports values through `onValueChange`. Not every component has `loading`, `size` or
`tone`; check types. Preserve labels, keyboard focus, disabled/error/loading states and Chinese IME.

## Theme

What works today: the root `ReitoThemeProvider` accepts `mode`, `colors`, `density` and typed
`tokens` (`{ semantic, components }`). A nested provider inherits mode, colors and density and
merges `tokens` per key, and portals rendered inside it keep its theme. Use that for both the
global theme and local `Theme` scopes. Details and examples:
[design-contract.md § Theme](references/design-contract.md#theme).

For a product-wide theme, define a `createTheme` preset in a TS module and pass it to the root
provider's `theme` prop. `<Theme>` is the nested provider for an intentional local variation; its
`defaults` prop sets Button, Panel and SelectInput prop defaults, and explicit props win. All three
are exported from `@reito/ui/basic`. Ordinary screens need no overrides to align basic controls.

## Validate

Inspect the composed screen with realistic Chinese and English content, empty/loading/error states
and a narrow container. Verify wrapping, visible labels, focus, scroll ownership and preserved
drafts. Before reporting, search the new code for the utilities forbidden in core rule 4; each hit
must be a copied structural shell class or be replaced.

In this repository follow AGENTS.md and run `npm run check`, `npm run build` and the relevant
behavior tests. `npm run test:composition` checks a compiled consumer without source aliases,
Tailwind or application CSS. `npm run recipe:check` keeps `assets/workbench.tsx` in sync; edit
`packages/ui/src/basic/composition-demo.tsx` and run `npm run recipe:build` to change it.

If a default composition has clipped labels, doubled inset, inconsistent geometry or wrong fonts,
reproduce it with public components and fix the responsible library component or token. Keep the
reproduction as a behavior check.

Report source changes, local artifacts and published versions separately. Skill use does not grant
package publication, deployment or external-message authority.
