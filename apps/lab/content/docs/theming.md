---
title: 主题
description: ReitoThemeProvider、Theme 局部作用域、createTheme 预设、--rui-radius 全局圆角与 tokens 覆盖。
---

# 主题

主题是代码：一个根 `ReitoThemeProvider` 定义全局主题，嵌套 Provider 或 `Theme` 定义局部作用域。应用代码中的 className 与 CSS 变量不是主题机制。

## 明暗与配色

```tsx
import { ReitoThemeProvider, Button, Badge } from '@reito/ui/basic';

<ReitoThemeProvider root mode="system" colors={{ primary: 'violet', neutral: 'zinc' }}>
  <Button>跟随主题</Button>
  <Button color="green" variant="outline">独立绿色</Button>
  <Badge color="success" variant="secondary">已完成</Badge>
</ReitoThemeProvider>
```

- `mode`：`dark`、`light` 或 `system`（监听系统偏好）。
- `colors.neutral`：工作面灰阶，Graphite（默认）、Gray、Zinc、Slate、Stone、Neutral。
- `colors.primary`：灰白（默认）或 17 套彩色色阶之一。`success / warning / danger / info` 可分别指定。
- `Button / Badge / Switch / Checkbox / RadioGroup / Slider / Progress / Toggle` 支持独立 `color`，颜色与 `variant` 相互独立。

持久化由宿主处理，库本身不读写存储。

## 全局圆角 `--rui-radius`

圆角采用一个基准变量 `--rui-radius`（默认 `0.25rem` = 4px），阶梯中每一级都是它的倍数。修改基准即可同步缩放控件、表面、菜单、弹层与对话框：

| 级 | 倍数 | 默认 | 角色 |
| --- | --- | --- | --- |
| `radius-2xs` | × 0.5 | 2px | kbd 等行内标记 |
| `radius-xs` | × 1 | 4px | Checkbox、菜单条目 |
| `radius-sm` | × 1.5 | 6px | `radius-control`：Button、Input、Select |
| `radius-md` | × 2 | 8px | `radius-surface`：Card、面板、菜单弹层 |
| `radius-lg` | × 3 | 12px | Popover、较大面板 |
| `radius-composer` | × 3.5 | 14px | 会话 Composer、Dialog |
| `radius-2xl` / `radius-3xl` | × 4 / × 6 | 16 / 24px | 大型展示面 |

`radius-full` 不随基准变化，胶囊与圆形动作保持全圆。

```tsx
// 一个旋钮：控件 9px、表面 12px……
<ReitoThemeProvider root radius="0.375rem">…</ReitoThemeProvider>
// 等价的类型化 token 覆盖
<ReitoThemeProvider root tokens={{ semantic: { radius: '0.375rem' } }}>…</ReitoThemeProvider>
```

纯 CSS 宿主可以在 `:root` 或带 `data-theme` / `data-density` 的作用域上设置 `--rui-radius`。只改某一角色时，覆盖 `radius-control`、`radius-surface` 或组件 token（如 `components.card.radius`）。

## createTheme 预设

全局主题写在一个 TS 模块里，用 `createTheme` 生成类型化预设；预设可以多层叠加，后面的层覆盖前面的层。

```tsx
// theme.ts
import { createTheme } from '@reito/ui/basic';

export const baseTheme = createTheme({
  colors: { primary: 'violet', neutral: 'zinc' },
  tokens: { components: { button: { radius: '10px' } } },
});

export const productTheme = createTheme(baseTheme, {
  defaults: { Button: { variant: 'outline' }, SelectInput: { placeholder: '请选择范围' } },
});

// main.tsx
<ReitoThemeProvider root mode="system" theme={productTheme}>
  <App />
</ReitoThemeProvider>
```

## Theme 局部作用域

`Theme` 只影响子树，从不接管 html。它与 Provider 接受同样的 `theme / mode / colors / density / tokens / defaults / radius`。合并顺序是：父作用域、本层 `theme`、本层单独属性；组件上显式传入的属性永远优先。

```tsx
import { Theme, Button, SelectInput } from '@reito/ui/basic';

<Theme mode="light" colors={{ primary: 'rose' }} defaults={{ Button: { variant: 'secondary', size: 'sm' } }}>
  <Button>使用 secondary / sm</Button>
  <Button variant="ghost">显式 ghost 优先</Button>
  <SelectInput options={options} /> {/* 弹出菜单同样使用局部主题与默认值 */}
</Theme>
```

Dialog、Select、DropdownMenu、Popover、Tooltip 等弹层传递最近的 React 主题。作用域使用 `display: contents`，不增加布局容器。`dark:` 变体按最近的主题作用域解析，支持深色 → 浅色 → 深色三层嵌套。

## Tokens 覆盖

`tokens` 是 `@reito/tokens` 生成的 `ThemeTokenOverrides`，键名有类型检查；值应引用其他 `--rui-*` token，而不是字面颜色或像素：

```tsx
import { ReitoThemeProvider, type ThemeTokenOverrides } from '@reito/ui/basic';

export const appTheme = {
  semantic: { 'radius-surface': 'var(--rui-radius-lg)' },
  components: { button: { radius: 'var(--rui-radius-md)' } },
} satisfies ThemeTokenOverrides;

<ReitoThemeProvider root tokens={appTheme}>…</ReitoThemeProvider>
```

## 密度

`density` 支持 `compact`（默认）、`comfortable` 与 `dense`。密度是样式能力：应用作者在代码里选择，不要在产品的页头或设置中加入密度切换，除非用户明确需要。

在 [配色示例](/theme-guide) 中可以实时切换主色、底色和局部主题。完整说明与验证记录见仓库 [theme-guide.md](https://github.com/reitowo/reito-ui/blob/main/docs/theme-guide.md)。
