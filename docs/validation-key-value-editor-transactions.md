# PROPERTIES-02 KeyValueEditor 子项验收

2026-09-07，KeyValueEditor 子项完成，PROPERTIES-02 已关闭。组件现在以稳定条目 ID 管理数组级事务，支持跨行异步校验、add/update/remove 更改集、取消到已应用基线、重置到默认数组、异步错误定位和失败恢复。

- Playwright 21 项通过：原有字段适配回归 11 项；事务专项 10 项覆盖受控编辑保持待应用、成功应用更新基线、跨行错误定位、服务端条目错误、全局异步失败、完整数组草稿保留、添加/删除/编辑的批量取消、默认数组重置，以及四主题密度窄屏。
- 本族当前 16 个 Story 在 dark/light × compact/comfortable 共 64 次组合中全部通过；页面错误、控制台错误、可访问性违规和页面级水平溢出均为 0，审计期间源码指纹未变化。
- 视觉检查使用 420 × 900 的批量事务 Story。两个键值行保持既有紧凑单列字段，状态和三个事务动作完整换行；dark/compact 与 light/comfortable 均由共享 control height、content padding、content gap、Field 和语义颜色 token 决定。
- `KeyValueChange` 按稳定 ID 表达添加、更新、删除和位置；完整提交数组会修剪键，保留字符串值。成功提交后才推进基线，失败后仍可原地修正或重试。
- `validateAll` 和服务端 `entryErrors` 都按稳定 ID 定位到键或值。重复业务键不会影响映射；组件把焦点移到第一条异步错误所在行。
- 全库为 115 个组件族（基础 67、复杂 29、AI 19）和 1077 个 Story；`npm run check` 与 `npm run build` 通过。构建只保留既有 chunk size 提示。

证据：[源码](../packages/ui/src/complex/key-value-editor.tsx)、[Story](../apps/storybook/stories/complex/KeyValueEditor.stories.tsx)、[字段回归](../tests/key-value-editor-rich.spec.ts)、[事务测试](../tests/key-value-editor-transaction.spec.ts)、[Story 审计](../.logs/key-value-editor-transaction/storybook-audit.json)、[测试日志](../.logs/key-value-editor-transaction/tests.log)、[四组合截图](../.logs/key-value-editor-transaction)、[用法](components/key-value-editor.md)。
