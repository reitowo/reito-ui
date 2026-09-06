# TREE-04 ReorderableTreeView 验收

2026-09-07，TREE-04 已完成。新增 `ReorderableTreeView` 组件族，当前 95 族（基础 54、复杂 22、AI 19），共 672 个 Story。

- `npm run check`、`npm run build` 退出 0；公开导出、目录与 token 审计通过，0 个未批准项。
- **9/9** 浏览器测试：Alt 键盘前后/缩进/移出、指针 reparent、环路与禁用落点拒绝、同 scope 跨树 inside 传输、同页 Controls，以及四主题密度窄工作面。
- **24/24** Story 组合：6 个 Story × 深浅主题 × 两档密度；0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 移动后选中 ID 和 DOM 焦点保持；紧凑/舒适行高仍为 24/32px。

证据：[检查](../.logs/reorderable-tree-view/check.log)、[构建](../.logs/reorderable-tree-view/build.log)、[交互](../.logs/reorderable-tree-view/interactions.log)、[Story 扫描](../.logs/reorderable-tree-view/story-audit.json)、[测试源码](../tests/reorderable-tree-view.spec.ts)。能力参考 [PrimeVue Tree DragDrop](https://primevue.dev/tree/)；数据变更、样式与键盘模型为本项目原创。
