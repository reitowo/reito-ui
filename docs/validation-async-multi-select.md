# SELECT-01 最终验收：AsyncMultiSelect

2026-09-07，SELECT-01 已完成。新增 `AsyncMultiSelect`，并将 `AsyncCombobox` 的取消、过期响应保护、错误重试和选项缓存抽为共享异步状态机。多选组件支持查询/值分别受控或非受控、跨远程结果页保留 chip 标签、选择后清空查询、移除、选项禁用、字段错误、原生重复表单值，以及 idle/loading/empty/error/retry。当前 98 个组件族（基础 57、复杂 22、AI 19），共 724 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计 0 个未批准项。
- **16/16** AsyncMultiSelect 交互通过：覆盖最少查询字符、loading、empty、失败重试、过期结果、跨结果页标签缓存、鼠标/键盘选择、查询清空、chip 移除、禁用/错误、FormData、同页 Controls，以及四种主题/密度。
- **13/13** AsyncCombobox 回归通过，证明共享状态机抽取未破坏单选行为。
- **48/48** Story 组合通过：12 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- compact / comfortable 的单行 chip 容器实测为 32 / 40px；dark/compact 与 light/comfortable 截图人工检查通过，标签、输入、弹层和双行选项沿用共享 Graphite tokens。
- 宿主仍负责网络、鉴权、服务端搜索和持久缓存；本地 Story 使用延迟 Promise 演示契约，不宣称连接外部服务。

证据：[检查](../.logs/async-multi-select/check.log)、[构建](../.logs/async-multi-select/build.log)、[多选交互](../tests/async-multi-select.spec.ts)、[单选回归](../tests/async-combobox.spec.ts)、[Story 扫描](../.logs/storybook-async-multi-select.json)、[四组合截图](../.logs/async-multi-select)、[组件源码](../packages/ui/src/basic/async-multi-select.tsx)、[共享状态机](../packages/ui/src/basic/async-options.ts)、[用法](components/async-multi-select.md)。
