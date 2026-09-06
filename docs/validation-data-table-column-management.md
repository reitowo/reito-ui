# TABLE-03 DataTable 列管理验收

2026-09-07，TABLE-03 已完成。新增受控/非受控列显隐、顺序、宽度、左右固定，以及紧凑管理菜单和键盘等价操作。当前 95 个组件族（基础 54、复杂 22、AI 19），共 676 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **11/11** 新增测试；**44/44** DataTable Story 组合通过，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- TABLE-01 的 10 项远程回归和 TABLE-02 的 11 项筛选回归继续通过。

证据：[检查](../.logs/data-table-column-management/check.log)、[构建](../.logs/data-table-column-management/build.log)、[交互](../.logs/data-table-column-management/interactions.log)、[回归](../.logs/data-table-column-management/regressions.log)、[Story 扫描](../.logs/data-table-column-management/story-audit.json)、[测试源码](../tests/data-table-column-management.spec.ts)。
