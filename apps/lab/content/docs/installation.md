---
title: 安装
description: 安装 @reito/ui 与 @reito/tokens，引入样式并设置主题根。
---

# 安装

Reito UI 由两个必须同版本安装的包组成：`@reito/ui`（组件）与 `@reito/tokens`（设计变量）。包面向 React 19 / ESM，带 TypeScript 声明和已编译 CSS。

## 从 npm 安装

```bash
npm install @reito/ui @reito/tokens
```

npm 上当前发布的是 0.5.8。本站文档描述仓库 `main` 上的 0.6.0-next.0 候选：`Page`、`Panel`、`Stack` 等页面积木，`Theme`、`createTheme` 与 `radius` 只在候选版中提供。需要这些 API 时，请按下文从源码打包。

## 从源码打包候选版

```bash
git clone https://github.com/reitowo/reito-ui.git
cd reito-ui
npm ci
npm run pack:library
```

命令在 `artifacts/` 下生成版本一致的 `reito-tokens-<version>.tgz` 与 `reito-ui-<version>.tgz`，在你的项目中一起安装：

```bash
npm install ../reito-ui/artifacts/reito-tokens-0.6.0-next.0.tgz ../reito-ui/artifacts/reito-ui-0.6.0-next.0.tgz
```

## 引入样式

在应用入口按顺序引入一次：

```tsx
import '@reito/tokens/css';
import '@reito/ui/styles.css';
```

组件 CSS 已经编译，包含 Tailwind Preflight 与 Inter Variable 字体。消费工程不需要 shadcn CLI、Tailwind 插件或额外字体规则就能显示组件。

## 设置主题根

用一个根 Provider 包住应用。它负责 html 上的主题、密度和语义变量，弹层与页面背景都会跟随：

```tsx
import { ReitoThemeProvider } from '@reito/ui/basic';

export function Root() {
  return (
    <ReitoThemeProvider root mode="system">
      <App />
    </ReitoThemeProvider>
  );
}
```

不使用 Provider 的纯静态页面，可以直接在 `<html>` 上设置 `data-theme="dark" data-density="compact"`。

## 与 Tailwind 4 一起使用（可选）

如果你的应用本身使用 Tailwind 4，并希望在自己的代码中使用 `bg-background`、`text-muted-foreground` 等语义 utility，在主 CSS 中导入桥接：

```css
@import 'tailwindcss';
@import '@reito/tokens/tailwind';
```

组件外观仍由 `@reito/ui/styles.css` 提供，不需要重新扫描 `node_modules`。

## 版本要求

- `@reito/ui` 与 `@reito/tokens` 的版本必须完全一致。
- React 19、ESM 构建工具（Vite、Next.js 等）。
- 目标是支持 CSS `light-dark()`、`color-mix()` 与 `:where()` 的现代浏览器。

下一步：[快速开始](/docs/getting-started)。
