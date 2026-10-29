# Affect 表面：公开目录的视觉还原

`@reito/ui/affect` 是第四层（Lab / Storybook 中文名 **模式**）。目标是把 affectUI **公开免费 + 文档站** 的表面，在 Reito Theme / `--rui-*` 上做到尽可能接近的 1:1 视觉还原：字号、内距、描边、圆角、阴影、密度、悬停 / 焦点和动效。Token 桥用来翻译 Affect 的表面语言，而不是把它压成通用 Reito 铬件。

## 保真目标

| 要求 | 做法 |
| --- | --- |
| 视觉 1:1 | 公开 MIT registry CSS（例如 [button.json](https://www.affectui.com/r/button.json)）和 [affectui.com/components](https://www.affectui.com/components/) / [llms.txt](https://www.affectui.com/llms.txt) 的预览几何是对照源。Affect Button 的 md 是 40×16、12px 圆角、14px/500，而不是 Reito 默认 32×12、6px、400。 |
| 仍走 Reito Theme | 颜色、圆角、阴影、时长全部是 `--rui-*`。不引入 Affect 的 hex / BEM / `<style href>`。换主题或密度时，Affect 表面跟其余层一起变。 |
| 被包裹的原语 | Button / Input / Select / Menu / AppShell 铬件的间距要对齐 Base UI 质量。菜单条目按 [Base UI v1.9 Menu](https://base-ui.com/react/components/menu) 的 `padding-block: 0.5rem`、`padding-left: 1rem`。不要把 Affect 做成套在错误默认值上的薄 API 别名。 |
| 密度 | 继续用连续 density token。Compact 是默认；高密是偏好基线，不是产品锁死。 |

## 许可与来源

| 范围 | 来源 | 本库做法 |
| --- | --- | --- |
| Phase 1 免费组件、blocks、插画、motion | [flohoeller/affectui](https://github.com/flohoeller/affectui)（MIT） | 对照公开行为、API 与免费 registry CSS 还原表面；实现用 `@reito/ui` 原语、`--rui-*` 与 Tailwind token 桥。`appearance?: 'default' \| 'clean'` 合并 clean 变体，不复制 `*-clean` 文件。 |
| Phase 2 公开 Pro 表面 | [affectui.com 组件页](https://www.affectui.com/components/) 与 [llms.txt](https://www.affectui.com/llms.txt) / [llms-full.txt](https://www.affectui.com/llms-full.txt) 的公开 prop / 预览 | **没有拉取 Pro registry 或付费源码，也没有 `AFFECTUI_TOKEN`。** 下列组件按公开文档与预览重建交互和视觉：Thinking State、Chat Composer、Agent Plan、Approval Card、Command Menu、Model Picker、Review Center、Agent Inbox、AI Answer、Cited Answer、Writing Assistant、Permission Request、Agent Steering、Agent Tree、Agent Lanes、Autonomy Dial、Inline Diff、Memory Panel、Parallel Attempts、Trace Waterfall、Comments Panel、Prompt Library、Agent Cursors、Agent Graph、Agent Ledger、Agent Queue、Conflict Radar、Context Map、Context Window、Decision Tree、Delegate Board、Fan-out Grid、Project Card、Integration Picker、Setup Guide、Billing Schedule、Breakdown Chart、Combobox、Compact Breakdown、Data Table、Date Range Picker、Dropzone、Experiment Card、Integration Settings、KPI Chart、Stepper Form、Toaster、Usage Meter、Agent Chat、Agent Run、Analytics、App Shell Flat、App Shell Inset、App Shell Workspace Flat、App Shell Workspace Inset、Assistant Home、CRM、Evals、Folder、Folders、Integrations、Onboarding、Settings & Billing、Agent Gallery、AI Workspace、App Directory、Client Context、Invoice & Credit Note、KPI Board、Metrics Dashboard、Pricing Plans、Task Board、Glass Folder、Glow Keyboard、Integration Flow、Outreach Branches、Project Flow、Voice Orb、World Map Continental、Blur Crossfade、Gradient Floor、Gradient Text、Tilt Card。公开 Pro 目录现为 83/83。 |
| 插画 | 免费 17 件加公开 Pro 7 件 | 保留交互意图与命名；标记是通用色块，不复制品牌 SVG 路径或专有素材。 |

MIT 参考仓库的许可证仍属于原作者。本层的 React / token 实现是 Reito 原创再实现，随 `@reito/ui` 以 MIT 发布。产品许可与参考出处总表见 [references.md](references.md)。

## 刻意不同（不是偷懒）

这些差异是许可和主题边界，不是“差不多就行”的借口：

1. **没有 Pro 源码。** 付费 registry、AFFECTUI_TOKEN 和私有 CSS 一律不用。Pro 项只对照公开页面、llms 文本和免费 MIT 亲戚。
2. **没有专有字体 / 品牌资产。** 不复制 Inter 以外的商品字体、品牌 SVG 或 Multica 限制代码。字重和字距用 token 桥接近公开 CSS。
3. **颜色跟 Reito Theme，不跟 Affect 的 hex 表。** 主按钮的深色竖向渐变、浅底危险、描边次要，都映射到 `--rui-primary` / `--rui-danger-soft` / `--rui-surface`。换 Graphite 或其它预设时，这些表面一起变。
4. **密度可切换。** 公开 Affect 站点基本是固定几何。Reito compact / comfortable / dense 仍共用同一组角色；Affect Button 的 sm/md/lg（32/40/48）是该表面自己的尺度，不随 density 把 40px md 压回 28px。

除此之外，公开免费表面应以 registry CSS 和文档预览为准，而不是“薄适配到现有 Reito 默认”。

## 入口与依赖方向

```tsx
import { Button, ToolCallCard, ChatComposer, LogoMarquee } from '@reito/ui/affect';
```

不要从 `@reito/ui` 根入口再导出这一层：`Button`、`Skeleton`、`MessageActions` 等名称已在基础 / AI 层占用。

Affect Button **不再**映射到 `primitives/button`。它使用 Base UI `Button` 原语和 `components.affect-button` 令牌，这样 Affect 的圆角、内距、字重和主按钮渐变不会被 Reito 默认 6px / 32px / 400 吃掉。Input、Select、Menu 等被包裹的原语则把共享 density / menu token 抬到 Base UI 级间距，供 Affect 和基础层一起用。

`packages/ui/src/affect/catalog.tsx` 只给 Lab 使用，不是发布包公共 API。

## 主题、密度与动效

颜色、圆角、间距、字体和密度全部走 `packages/tokens`。循环、翻滚、微光在 `prefers-reduced-motion: reduce` 时改为静止或立即完成。数字时长 API 读取 `@reito/tokens/metrics`，不在 class 里写死 `px` / `ms`。

### 基础控件：Base UI 级间距，而不是 28px 高密挤压

先前把 compact `button-height` 改成 `control-height-sm`（28px），菜单条目也锁在 28×4，是为了“靠近 affectUI 高密默认”。公开 MIT Button CSS 的默认 md 其实是 **40px**，文档表里的 24/28/32 已经过时；28px 轨道既对不上 Affect，也对不上 Base UI v1.9 的 2rem 触发器 / 0.5rem 菜单行距，看起来比两边都差。

当前共享 token（不改公共 API）：

| 角色 | 当前值 | 原因 |
| --- | --- | --- |
| `density.compact.button-height` | `control-height`（32px） | 默认 Button / Input / SelectTrigger 回到 composition 合同和 Base UI 2rem 轨道 |
| `components.input.height` | 引用 `button-height` | 三件基础控件在 compact / comfortable / dense 下一起走 |
| `components.menu.item-height` | `control-height`（32 / 36 / 24） | 单行菜单跟默认控件同高 |
| `components.menu.item-line-height` | 1rem | `(height − 16) / 2` 在 compact 得到 Base UI 的 8px `padding-block` |
| `density.*.popup-item-padding-x` | 16 / 20 / 12px | compact 对齐 Base UI `padding-left: 1rem` |
| `foundation.menu-font-size` | `text-md`（14px） | 对齐 Base UI Menu 0.875rem |
| `density.compact.button-padding-x` | 12px | 默认动作左右更接近 Base UI 触发器，而不是 10px 挤在一起 |

表格行继续用独立的 `control-height`。不要在页面或 Lab 里加「紧凑 / 舒适」开关；密度仍是样式能力，默认 compact。

### Affect Button 自己的表面

| 尺寸 | 高 / 左右 / 间距 / 字号 / 图标 / 圆角 |
| --- | --- |
| sm | 32 / 12 / 6 / 13 / 16 / 10 |
| md | 40 / 16 / 8 / 14 / 18 / 12 |
| lg | 48 / 20 / 10 / 15 / 20 / 14 |

- primary：竖向主色渐变 + 边沿渐变 + `shadow-subtle`，按下 `scale(0.97)`
- secondary：`surface` + 发丝边 + 轻阴影
- ghost：透明弱化字，悬停 `hover` 底
- destructive：`danger-soft` 底 + `danger` 字（不是实心危险填充）
- 加载：标签扫光；有 icon 时左侧换成转圈
- 焦点：`outline-width` + 同宽 offset

对照源是公开 `https://www.affectui.com/r/button.json`，不是 Storybook 或 Lab 自己的旧默认。

## 与文档站的关系

已与 PR #25 的公开站点整合：模式层使用同一 catalog 接入 `/gallery` 的模式筛选、组件详情、`/docs/components/<id>`、Markdown 镜像与 llms 索引；Lab 和 Storybook 继续复用相同示例。
