# Reito Graphite tokens

Original semantic design tokens for Reito UI, with dark/light themes and compact/comfortable density.

```sh
npm install @reito/tokens
```

```ts
import '@reito/tokens/css';
```

Set `data-theme="dark"` or `light` and `data-density="compact"` on `<html>`. Use compact by default in applications.

Exports:

- `@reito/tokens/css`: generated CSS custom properties.
- `@reito/tokens/tailwind`: generated Tailwind theme bridge.
- `@reito/tokens/json`: source token definitions.
- `@reito/tokens/metrics`: numeric positioning and timing values with TypeScript declarations.

[Design language and examples](https://reitowo.github.io/reito-ui/) · [Source](https://github.com/reitowo/reito-ui)

MIT. These are original tokens, not official Cursor or Claude tokens.
