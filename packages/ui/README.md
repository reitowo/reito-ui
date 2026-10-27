# Reito UI

Original Graphite desktop React components: compact controls, neutral surfaces, dark/light themes, and basic, complex, AI and affect/pattern layers. Built with Base UI and shared design tokens.

## Install

```sh
npm install @reito/ui @reito/tokens react react-dom
```

React 19 is required. Import the prebuilt styles once; a Tailwind build is not required just to render the components.

```tsx
import '@reito/tokens/css';
import '@reito/ui/styles.css';
import { Button, Input } from '@reito/ui/basic';

export function Search() {
  return <div className="reito-root">
    <Input aria-label="Search" />
    <Button>Search</Button>
  </div>;
}
```

Set `data-theme="dark"` (or `light`) and `data-density="compact"` on the document's `<html>` element so portaled menus share the theme. Compact is the application default.

Public entries: `@reito/ui`, `@reito/ui/basic`, `@reito/ui/complex`, `@reito/ui/ai`, `@reito/ui/affect`, and the explicit native compatibility entry `@reito/ui/native`. Prefer `SelectInput` or `Select` for themed application selection controls. `@reito/ui/affect` is a token-backed reimplementation of affectUI's free MIT surface plus public-docs recreations of selected Pro AI patterns; it is not a copy of affectUI CSS or paid source. See [affect-surface.md](https://github.com/reitowo/reito-ui/blob/main/docs/affect-surface.md).

`ReitoThemeProvider` supports runtime colors and typed `tokens` overrides. Shared semantic roles feed component defaults for Button, Input, Menu, Card and ScrollArea; nested scopes and overlays inherit the nearest configuration. See the [component token guide](https://github.com/reitowo/reito-ui/blob/main/docs/component-tokens.md) for keys and scope boundaries.

- [Live examples and Storybook](https://reitowo.github.io/reito-ui/)
- [Installation and migration guide](https://github.com/reitowo/reito-ui/blob/main/docs/reuse-guide.md)
- [Source and issues](https://github.com/reitowo/reito-ui)

MIT. Third-party notices are included in the package. AI examples demonstrate local UI state; the library does not provide a model backend.
