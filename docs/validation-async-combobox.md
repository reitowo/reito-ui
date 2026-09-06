# SELECT-01 阶段验收：AsyncCombobox

2026-09-07，SELECT-01 的单选阶段完成。新增 `AsyncCombobox` 组件族，提供受控查询/值、最少字符、防抖、loading/error/empty/retry、AbortSignal、请求序号过期保护、禁用/字段错误与单选标签缓存。此处保留阶段证据；SELECT-01 的最终状态与当前总数见 [AsyncMultiSelect 最终验收](validation-async-multi-select.md)。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **13/13** 交互通过：覆盖 idle 阈值、loading、empty、失败重试、过期结果、选中项缓存、键盘选择、禁用/错误、同页 Controls，以及四种主题/密度下的 32/40px 高度、弹层可访问性和窄屏 containment。
- **44/44** Story 组合通过：11 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- dark/compact 与 light/comfortable 截图已人工检查：输入和弹层使用共享中性表面、弱边界、14px 输入与紧凑选项；未引入组件专用颜色或硬编码尺寸。
- 后续提交已通过 AsyncMultiSelect 补齐多选和跨结果页 chip 缓存，并将请求逻辑抽为共享状态机；本阶段的 13 项单选测试在最终验收时再次通过。

证据：[检查](../.logs/async-combobox/check.log)、[构建](../.logs/async-combobox/build.log)、[交互测试](../tests/async-combobox.spec.ts)、[Story 扫描](../.logs/storybook-async-combobox.json)、[四组合截图](../.logs/async-combobox)、[组件源码](../packages/ui/src/basic/async-combobox.tsx)、[用法](components/async-combobox.md)。
