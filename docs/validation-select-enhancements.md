# SELECT-02 验收

2026-09-07，SELECT-02 已完成。`MultiSelect` 与 `AsyncMultiSelect` 共享选项模型和高层增强 API，覆盖分组、同步/异步创建、当前筛选结果全选、部分选中、批量清除和禁用项边界。全库保持 108 个组件族（基础 67、复杂 22、AI 19），共 909 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计检查 256 个文件，0 个未批准项。
- **30/30** 相关测试在最终源码上通过：14 项增强测试和 16 项 AsyncMultiSelect 回归，覆盖分组、筛选范围、三态语义、结果页外值保留、禁用值保留、重复创建抑制、异步 pending/失败、缓存、表单、键盘和同页 Controls。
- **120/120** 两族 Story 组合通过：30 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 420px 窄宽度截图人工检查 dark/compact 与 light/comfortable：批量操作使用 XS 行高，分组标签降低权重，双行选项和 chip 保持紧凑；弹层宽度跟随输入，不产生页面横向滚动。
- 全选范围定义为当前筛选或远程结果页内的非禁用项。切换保留范围外值；清除保留已选且禁用的值；部分选中用 `aria-checked="mixed"` 表达。
- `onCreateOption` 是宿主回调边界。组件只缓存返回的显示元数据和当前选择，不负责服务端持久化、去重事务或跨实例缓存。
- 大量选项、动态选项高度与远程分页窗口化仍由 SELECT-03 跟踪。

证据：[检查](../.logs/select-enhancements/check.log)、[构建](../.logs/select-enhancements/build.log)、[增强测试](../.logs/select-enhancements/tests-advanced.log)、[异步回归](../.logs/select-enhancements/tests-async-regression.log)、[Story 扫描](../.logs/select-enhancements/storybook-audit.json)、[四组合截图](../.logs/multi-select-advanced)、[同步源码](../packages/ui/src/basic/multi-select.tsx)、[异步源码](../packages/ui/src/basic/async-multi-select.tsx)、[同步用法](components/multi-select.md)、[异步用法](components/async-multi-select.md)。
