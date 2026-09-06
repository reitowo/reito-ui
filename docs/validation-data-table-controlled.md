# TABLE-01 DataTable 受控与远程模式验收

2026-09-07，TABLE-01 已完成。现有 `DataTable` 保留完整本地数据的筛选、排序和分页，并新增一致的 manual 数据模式。当前目录仍为 95 个组件族（基础 54、复杂 22、AI 19），共 673 个 Story。

- `npm run check`、`npm run build` 退出 0；公开类型、目录、tokens 和生成物检查通过。
- **10/10** 浏览器测试：远程总量、一页数据、跨页选择、排序/筛选回到第 1 页、受控页大小、同页 Controls，以及四主题密度下的窄工作面。
- **32/32** Story 组合：8 个 Story × 深浅主题 × 两档密度；0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 远程选择计数保留未加载页 ID，当前页表头选择范围保持明确；manual 模式不会二次处理宿主返回的数据。

证据：[检查](../.logs/data-table-controlled/check.log)、[构建](../.logs/data-table-controlled/build.log)、[交互](../.logs/data-table-controlled/interactions.log)、[Story 扫描](../.logs/data-table-controlled/story-audit.json)、[测试源码](../tests/data-table-controlled.spec.ts)。行为引擎使用已安装的 TanStack React Table 8.21.3；组件 API、Graphite 样式和远程状态组合由本项目实现。
