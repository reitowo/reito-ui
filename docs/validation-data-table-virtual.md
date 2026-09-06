# TABLE-07 DataTable 行虚拟化验收

2026-09-07，TABLE-07 已完成。`DataTable` 新增可选行窗口化、稳定行 ID 定位、动态行高测量、overscan 与可见/加载边界回调；与分页、manual 远程页、左右固定列、跨窗口选择、详情展开和分组汇总共用现有行列模型。当前仍为 95 个组件族（基础 54、复杂 22、AI 19），共 688 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- 最终 **84/84** 表格交互通过：其中 11 项新增检查覆盖 5 万行 DOM 有界、稳定 ID 深跳转、选择卸载/恢复、左右固定列横滚、动态详情测量、远程页末边界/翻页复位、同页 Controls，以及四种主题/密度的紧凑度、可访问性和窄面 containment；另含 TABLE-01～06 的 73 项回归。
- 普通表格分支保持原 DOM，虚拟分支复用同一排序、筛选、分页、分组、展开、编辑、选择和固定列状态。
- **92/92** DataTable Story 组合通过：23 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 5 万行 Story 在 360px 工作面仅挂载可见窗口与 overscan；初始估算由 `--rui-row-height` 解析为实际像素，已挂载行继续动态测量。manual 下一页由宿主提供，页码变化后滚动回到页首。

证据：[检查](../.logs/data-table-virtual/check.log)、[构建](../.logs/data-table-virtual/build.log)、[最终 84 项交互](../.logs/data-table-virtual/all-interactions.log)、[Story 扫描](../.logs/data-table-virtual/story-audit.json)、[测试源码](../tests/data-table-virtual.spec.ts)、[用法](components/data-table.md#表格行虚拟化)。
