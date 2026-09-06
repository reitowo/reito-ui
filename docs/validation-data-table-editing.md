# TABLE-05 DataTable 单元格与行编辑验收

2026-09-07，TABLE-05 已完成。`DataTable` 新增单元格和整行两种编辑事务、内置文本/数字/日期/枚举编辑器、同步校验、异步宿主提交、失败保留与重试、受控草稿和按行禁用。当前仍为 95 个组件族（基础 54、复杂 22、AI 19），共 682 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **15/15** 新增交互通过：草稿、必填/自定义校验、提交/取消、宿主数据替换、pending 防重复、异步失败保留/重试、受控状态、单元格与行键盘流。
- TABLE-01～04 的 **46/46** 回归通过；远程状态、列筛选、列管理、展开和分组行为保持。
- **68/68** DataTable Story 组合通过：17 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 活动编辑行在 720px 工作面检查四种主题/密度；输入与动作复用 control / cell / space tokens，未增加组件私有固定 padding。Escape 和成功提交都把焦点还给原单元格或新渲染的行编辑按钮。

证据：[Storybook 构建](../.logs/data-table-editing/storybook-build.log)、[新增交互](../.logs/data-table-editing/interactions.log)、[TABLE-01～04 回归](../.logs/data-table-editing/regressions.log)、[Story 扫描](../.logs/data-table-editing/story-audit.json)、[测试源码](../tests/data-table-editing.spec.ts)、[用法](components/data-table.md#单元格与行编辑)。
