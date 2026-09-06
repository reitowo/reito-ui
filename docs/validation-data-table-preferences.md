# TABLE-06 DataTable 导出与视图偏好验收

2026-09-07，TABLE-06 已完成。`DataTable` 新增当前页/筛选结果/已选/全部四种导出范围、CSV/JSON 格式意图、manual 完整数据委托，以及带 schema 版本和列兼容检查的命名视图保存/应用/删除。当前仍为 95 个组件族（基础 54、复杂 22、AI 19），共 685 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **12/12** 新增交互通过：四种范围中的关键本地/远程边界、稳定已选 ID、视图全状态恢复、版本失效、命名保存/删除和同页 Controls。
- TABLE-01～05 的 **61/61** 回归通过；导出取 TanStack 数据模型与原始行，不读取渲染 DOM，manual 全量请求明确 `requiresHostData=true`。
- **80/80** DataTable Story 组合通过：20 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 720px 工作面四种主题/密度下检查视图弹层；工具栏继续复用 control、content gap、content padding 和语义颜色 tokens。

证据：[检查](../.logs/data-table-preferences/check.log)、[构建](../.logs/data-table-preferences/build.log)、[新增交互](../.logs/data-table-preferences/interactions.log)、[回归](../.logs/data-table-preferences/regressions.log)、[Story 扫描](../.logs/data-table-preferences/story-audit.json)、[测试源码](../tests/data-table-preferences.spec.ts)、[用法](components/data-table.md#导出与视图偏好)。
