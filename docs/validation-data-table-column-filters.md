# TABLE-02 DataTable 列筛选验收

2026-09-07，TABLE-02 已完成。`DataTable` 新增类型化受控列条件、四类紧凑表头编辑器、本地匹配、清空/组合规则与稳定服务端查询序列化。当前仍为 95 个组件族（基础 54、复杂 22、AI 19），共 675 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计为 0 个未批准项，公开类型和生成物包含筛选 API。
- **11/11** 新增浏览器测试：文本包含、枚举多值 OR、数值闭区间、日期闭区间、跨列 AND、错误区间、远程页码复位、序列化查询、同页 Controls，以及四主题密度窄工作面。
- **40/40** DataTable Story 组合：10 个 Story × 深浅主题 × 两档密度；0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- **10/10** TABLE-01 远程状态回归继续通过；列筛选没有破坏远程排序、分页和跨页选择。
- 紧凑筛选入口保持在表头内，不增加筛选行；菜单、错误信息、应用/清除动作在紧凑与舒适密度均已截图查看。

证据：[检查](../.logs/data-table-column-filters/check.log)、[构建](../.logs/data-table-column-filters/build.log)、[新增交互](../.logs/data-table-column-filters/interactions.log)、[远程回归](../.logs/data-table-column-filters/remote-regression.log)、[Story 扫描](../.logs/data-table-column-filters/story-audit.json)、[测试源码](../tests/data-table-column-filters.spec.ts)。行为参考 TanStack Table 列筛选状态和 PrimeVue DataTable 的行/菜单筛选能力；API、样式与实现均为本项目原创。
