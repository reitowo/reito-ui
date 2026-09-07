# PROPERTIES-01 KeyValueEditor 子项验收

2026-09-07，KeyValueEditor 子项完成，PROPERTIES-01 已关闭。组件保留稳定 ID 与字符串草稿，增加文本、数字、布尔、选项、日期编辑器，显式嵌套路径、草稿通知和逐项禁用/只读。

- Playwright 11 项通过，覆盖既有增删/重复/遮罩/提交回归、数字无效草稿与上下界、布尔/选项/日期、嵌套路径草稿、逐项禁用/只读、同页 Controls，以及四主题密度窄屏。
- 本族 14 个 Story 在 dark/light × compact/comfortable 共 56 次组合中全部通过；1 个 play Story 完成，页面错误、控制台错误、可访问性违规和页面级水平溢出均为 0。
- 视觉检查使用 420 × 900 的富类型 Story。编辑器用容器宽度决定单列/多列，复用 content padding、content gap、Field、Input、Switch 与 NativeSelect；长键值和错误留在行内，不撑出页面。
- 值继续使用字符串以保留无效配置草稿；组件不隐式转换宿主配置类型，也不承担安全存储。异步批量事务、重置与跨字段错误定位属于 PROPERTIES-02。
- 全库为 115 个组件族（基础 67、复杂 29、AI 19）和 1073 个 Story；`npm run check` 与 `npm run build` 通过。构建只保留既有 chunk size 提示。

证据：[源码](../packages/ui/src/complex/key-value-editor.tsx)、[Story](../apps/storybook/stories/complex/KeyValueEditor.stories.tsx)、[交互测试](../tests/key-value-editor-rich.spec.ts)、[Story 审计](../.logs/key-value-editor/storybook-audit.json)、[测试日志](../.logs/key-value-editor/tests.log)、[四组合截图](../.logs/key-value-editor)、[用法](components/key-value-editor.md)。
