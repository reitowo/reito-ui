# Affect 表面：免费移植与公开重建

`@reito/ui/affect` 是第四层（Lab / Storybook 中文名 **模式**）。它把 affectUI 的桌面表面接到 Reito Theme、密度、语义色和 `--rui-radius`，而不是复制 affectUI 的 `<style href>` / BEM 内联样式。

## 许可与来源

| 范围 | 来源 | 本库做法 |
| --- | --- | --- |
| Phase 1 免费组件、blocks、插画、motion | [flohoeller/affectui](https://github.com/flohoeller/affectui)（MIT） | 只参考公开行为与 API；实现使用 `@reito/ui` 原语、`--rui-*` 与 Tailwind token 桥。clean 变体合并为 `appearance?: 'default' \| 'clean'`，不复制 `*-clean` 文件。 |
| Phase 2 高价值 Pro AI 表面 | [affectui.com 组件页](https://www.affectui.com/components/) 与 [llms.txt](https://www.affectui.com/llms.txt) 的公开 prop / 预览描述 | **没有拉取 Pro registry 或付费源码。** Thinking State、Chat Composer、Agent Plan、Approval Card、Command Menu、Model Picker、Review Center、Agent Inbox 是按公开文档重建的交互意图，不声称与 Pro 源码逐行一致。 |
| 插画 | 免费 17 件的公开 API | 保留交互意图与命名；标记是通用色块，不复制品牌 SVG 路径或专有素材。 |

MIT 参考仓库的许可证仍属于原作者。本层的 React / token 实现是 Reito 原创再实现，随 `@reito/ui` 以 MIT 发布。产品许可与参考出处总表见 [references.md](references.md)。

## 入口与依赖方向

```tsx
import { ToolCallCard, ChatComposer, LogoMarquee } from '@reito/ui/affect';
```

不要从 `@reito/ui` 根入口再导出这一层：`Button`、`Skeleton`、`MessageActions` 等名称已在基础 / AI 层占用。已有 Button / Input / Composer / CommandSearch 等能力用薄适配或组合，而不是第二套视觉系统。

`packages/ui/src/affect/catalog.tsx` 只给 Lab 使用，不是发布包公共 API。

## 主题与动效

颜色、圆角、间距、字体和密度全部走 `packages/tokens`。循环、翻滚、微光在 `prefers-reduced-motion: reduce` 时改为静止或立即完成。数字时长 API 读取 `@reito/tokens/metrics`，不在 class 里写死 `px` / `ms`。

## 与文档站的关系

[PR #25](https://github.com/reitowo/reito-ui/pull/25) 的 `/gallery`、`/docs`、llms 路由若尚未合并，本层先挂在现有 Lab `/components/<id>` 与 Storybook `模式/` 目录。合并后应把同一 catalog 接到文档站画廊。
