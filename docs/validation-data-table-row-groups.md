# TABLE-04 DataTable 行展开与行分组验收

2026-09-07，TABLE-04 已完成。`DataTable` 新增受控/非受控展开、层级子行与详情面板、受控行分组顺序、紧凑分组菜单、组头/汇总插槽和聚合单元格。当前仍为 95 个组件族（基础 54、复杂 22、AI 19），共 678 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **14/14** 新增测试；**52/52** DataTable Story 组合通过，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- TABLE-01～03 的 **32/32** 回归继续通过；筛选从匹配叶行保留祖先组，组选择只保存稳定叶行 ID，折叠后选择不丢失。
- 暗/亮 × 紧凑/舒适均在 640px 窄工作面检查；分组行实测约 33px / 45px。专用 `table-expander-size` token 避免舒适密度按钮撑高表格行。

证据：[Storybook 构建](../.logs/data-table-row-groups/storybook-build.log)、[新增交互](../.logs/data-table-row-groups/interactions.log)、[回归](../.logs/data-table-row-groups/regressions.log)、[Story 扫描](../.logs/data-table-row-groups/story-audit.json)、[测试源码](../tests/data-table-row-groups.spec.ts)。
