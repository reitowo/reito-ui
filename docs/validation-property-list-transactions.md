# PROPERTIES-02 PropertyList 子项验收

2026-09-07，PROPERTIES-02 的 PropertyList 子项完成；KeyValueEditor 子项仍在进行，整项尚未关闭。列表层现在明确区分字段草稿与事务提交，支持跨字段异步校验、完整值快照、更改集、取消到已提交基线、重置到默认值、字段错误定位和失败恢复。

- Playwright 23 项通过：原有字段适配回归 13 项；事务专项 10 项覆盖行保存不等于事务提交、成功提交更新基线、跨字段错误定位和焦点、服务端字段错误、全局异步失败、草稿保留、批量取消、默认值重置，以及四主题密度窄屏。
- 本族当前 14 个 Story 在 dark/light × compact/comfortable 共 56 次组合中全部通过；页面错误、控制台错误、可访问性违规和页面级水平溢出均为 0，审计期间源码指纹未变化。
- 视觉检查使用 420 × 800 的批量事务 Story。三行属性、状态文本和三个事务动作在窄宽度完整换行；dark/compact 与 light/comfortable 均使用既有内容内距、单元格纵向内距、控件高度、边框和状态色 token。
- `onSubmit` 得到完整 `PropertyValues` 与相对最近成功提交基线的 `PropertyChange[]`。返回字段错误、返回全局错误或抛出异常都不会推进基线；修正后可直接重试。
- `onBatchValueChange` 为受控宿主提供一次性取消/重置入口，避免多次状态更新互相覆盖。`baselineKey` 用于宿主切换记录；未启用事务时，原有逐行编辑 API 和布局保持不变。
- 全库为 115 个组件族（基础 67、复杂 29、AI 19）和 1075 个 Story；`npm run check` 与 `npm run build` 通过。构建只保留既有 chunk size 提示。

证据：[源码](../packages/ui/src/complex/property-list.tsx)、[Story](../apps/storybook/stories/complex/PropertyList.stories.tsx)、[字段回归](../tests/property-list-rich.spec.ts)、[事务测试](../tests/property-list-transaction.spec.ts)、[Story 审计](../.logs/property-list-transaction/storybook-audit.json)、[测试日志](../.logs/property-list-transaction/tests.log)、[四组合截图](../.logs/property-list-transaction)、[用法](components/property-list.md)。
