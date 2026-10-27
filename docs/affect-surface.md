# Affect 表面：免费移植与公开重建

`@reito/ui/affect` 是第四层（Lab / Storybook 中文名 **模式**）。它把 affectUI 的桌面表面接到 Reito Theme、密度、语义色和 `--rui-radius`，而不是复制 affectUI 的 `<style href>` / BEM 内联样式。

## 许可与来源

| 范围                                   | 来源                                                                                                                                                                                          | 本库做法                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 1 免费组件、blocks、插画、motion | [flohoeller/affectui](https://github.com/flohoeller/affectui)（MIT）                                                                                                                          | 只参考公开行为与 API；实现使用 `@reito/ui` 原语、`--rui-*` 与 Tailwind token 桥。clean 变体合并为 `appearance?: 'default' \| 'clean'`，不复制 `*-clean` 文件。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Phase 2 高价值 Pro AI 表面             | [affectui.com 组件页](https://www.affectui.com/components/) 与 [llms.txt](https://www.affectui.com/llms.txt) / [llms-full.txt](https://www.affectui.com/llms-full.txt) 的公开 prop / 预览描述 | **没有拉取 Pro registry 或付费源码。** 下列组件按公开文档重建交互意图，不声称与 Pro 源码逐行一致：Thinking State、Chat Composer、Agent Plan、Approval Card、Command Menu、Model Picker、Review Center、Agent Inbox、AI Answer、Cited Answer、Writing Assistant、Permission Request、Agent Steering、Agent Tree、Agent Lanes、Autonomy Dial、Inline Diff、Memory Panel、Parallel Attempts、Trace Waterfall、Comments Panel、Prompt Library、Agent Cursors、Agent Graph、Agent Ledger、Agent Queue、Conflict Radar、Context Map、Context Window、Decision Tree、Delegate Board、Fan-out Grid、Project Card、Integration Picker、Setup Guide、Billing Schedule、Breakdown Chart、Combobox、Compact Breakdown、Data Table、Date Range Picker、Dropzone、Experiment Card、Integration Settings、KPI Chart、Stepper Form、Toaster、Usage Meter。 |
| 插画                                   | 免费 17 件的公开 API                                                                                                                                                                          | 保留交互意图与命名；标记是通用色块，不复制品牌 SVG 路径或专有素材。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

MIT 参考仓库的许可证仍属于原作者。本层的 React / token 实现是 Reito 原创再实现，随 `@reito/ui` 以 MIT 发布。产品许可与参考出处总表见 [references.md](references.md)。

目标是公开 Pro 目录的 1:1 覆盖（组件、屏幕、blocks、插画、motion），而不是只挑没有 Reito 兄弟的子集。已有基础 / 复杂 / AI 兄弟（Combobox、DateRangePicker、DataTable、Toast、FileUpload、AppShell 等）仍会按公开 API 重建为模式层表面。

## 入口与依赖方向

```tsx
import { ToolCallCard, ChatComposer, LogoMarquee } from '@reito/ui/affect';
```

不要从 `@reito/ui` 根入口再导出这一层：`Button`、`Skeleton`、`MessageActions` 等名称已在基础 / AI 层占用。已有 Button / Input / Composer / CommandSearch 等能力用薄适配或组合，而不是第二套视觉系统。

`packages/ui/src/affect/catalog.tsx` 只给 Lab 使用，不是发布包公共 API。

## 主题、密度与动效

颜色、圆角、间距、字体和密度全部走 `packages/tokens`。循环、翻滚、微光在 `prefers-reduced-motion: reduce` 时改为静止或立即完成。数字时长 API 读取 `@reito/tokens/metrics`，不在 class 里写死 `px` / `ms`。

### 基础控件向 affectUI 高密默认对齐

affectUI 的默认控件比 Reito 原先 compact 字段更紧：短按钮、短输入、更少纵向空白。Reito 继续用共享 density token，而不是给基础组件写一次性覆盖。

本轮对齐（不改公共 API）：

| 角色                            | 调整                                                        | 结果                                                                                      |
| ------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `density.compact.button-height` | 从 `control-height`（32px）改为 `control-height-sm`（28px） | 默认 Button / `size="icon"` 回到设计语言已记录的 28px compact                             |
| `components.input.height`       | 改为引用 `button-height`                                    | 默认 Input 与 SelectTrigger 与 Button 同高，三件在 compact / comfortable / dense 下一起走 |
| Input 纵向                      | `py-1` 改为 `py-0`                                          | 高度完全由 token 决定，不再叠加 4px 内边距把字段撑高                                      |

表格行、列表行和其它仍需要 32px 轨道的表面继续用 `control-height`。`md` 按钮仍是原来的 32px compact 控件高度。舒适和高密模式只换 density 组，不另写组件特例。

本轮继续对齐（不改公共 API）：

| 角色                    | 调整                                                                                           | 结果                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Textarea 内边距 / 字号  | `px-2.5 py-2 text-sm` 改为 `input-padding-x` + `compact-surface-padding-y` + `input-font-size` | 多行字段与 Input 共用同一水平内距和界面字号，纵向不再多出 8px 固定边距 |
| RadioGroup 间距         | `gap-2` 改为 `content-gap-sm`                                                                  | 选项间距走密度 token                                                   |
| Checkbox / Radio 靶面   | 保持 `size-4`（16px）                                                                          | 不是 28px 轨道控件；改成 button-height 会破坏标签对齐                  |
| Switch / Badge / Slider | 已用 switch / badge / 细轨 token                                                               | 本轮只核验，不改几何                                                   |
| Tabs 触发器             | 已用 `button-height`                                                                           | 与默认 Button 同高，表格行继续用 `control-height`                      |

后续会把 NativeSelect、InputGroup、菜单触发器接到同一动作高度，并补几何回归。不要在页面或 Lab 里加「紧凑 / 舒适」开关；密度仍是样式能力，默认 compact。

## 与文档站的关系

[PR #25](https://github.com/reitowo/reito-ui/pull/25) 的 `/gallery`、`/docs`、llms 路由若尚未合并，本层先挂在现有 Lab `/components/<id>` 与 Storybook `模式/` 目录。合并后应把同一 catalog 接到文档站画廊。
