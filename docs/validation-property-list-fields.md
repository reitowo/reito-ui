# PROPERTIES-01 PropertyList 子项验收

2026-09-07，PROPERTIES-01 的 PropertyList 子项完成；KeyValueEditor 子项仍在进行，整项尚未关闭。PropertyList 已支持文本、数字、布尔、选项、日期、显式嵌套路径、草稿通知，以及列表级和逐项禁用/只读。

- Playwright 13 项通过，覆盖原有文本/数字校验回归、五种字段适配、内置边界、嵌套路径草稿与提交、逐项禁用/只读、Escape 焦点恢复、同页 Controls，以及四主题密度窄屏。
- 本族 12 个 Story 在 dark/light × compact/comfortable 共 48 次组合中全部通过；页面错误、控制台错误、可访问性违规与页面级水平溢出均为 0。
- 视觉检查使用 420 × 800 的嵌套属性 Story。窄容器改为单列标签/值，较宽容器保留 1:2 网格；内距、间距、控件、错误和焦点均复用 Graphite tokens 与共享 Field 原语。
- 能力范围核对 Nuxt UI 的多类表单字段目录与 Base UI Input/Switch/Select 的标签和受控值约束；实现为 Reito UI 的同步属性列表，不承担表单级提交事务。
- 全库为 115 个组件族（基础 67、复杂 29、AI 19）和 1069 个 Story；`npm run check` 与 `npm run build` 通过。构建只保留既有 chunk size 提示。

证据：[源码](../packages/ui/src/complex/property-list.tsx)、[Story](../apps/storybook/stories/complex/PropertyList.stories.tsx)、[交互测试](../tests/property-list-rich.spec.ts)、[Story 审计](../.logs/property-list/storybook-audit.json)、[测试日志](../.logs/property-list/tests.log)、[四组合截图](../.logs/property-list)、[用法](components/property-list.md)。
