# SORTABLE-01 SortableList 验收

2026-09-07，SORTABLE-01 已完成。新增受控稳定顺序、单/多选、批量上移/下移/置顶/置底、Alt 键盘等价操作、原生拖放、焦点保持、禁用边界与空/只读/禁用状态。全库增为 114 个组件族（基础 67、复杂 28、AI 19），共 1018 个 Story。

- Playwright 14 项通过，覆盖顺序、受控回写、批量、键盘、焦点、同段拖放、禁用跨越、状态、Controls 及四主题密度。
- 本族 13 个 Story 的 52 种主题/密度组合全部通过，页面错误、可访问性违规与水平溢出均为 0。
- 420px 四种截图人工检查通过；行、按钮、间距和边界均使用共享 token。
- npm run check 与 npm run build 通过。
- 能力范围对照 PrimeVue OrderList 和 PrimeReact OrderList；本实现使用原创 React 状态、禁用分段算法与 Graphite tokens。

证据：[源码](../packages/ui/src/complex/sortable-list.tsx)、[Story](../apps/storybook/stories/complex/SortableList.stories.tsx)、[测试](../tests/sortable-list.spec.ts)、[Story 审计](../.logs/sortable-list/storybook-audit.json)、[用法](components/sortable-list.md)。
