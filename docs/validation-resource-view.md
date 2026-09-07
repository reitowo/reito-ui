# RESOURCE-02 ResourceView 验收

2026-09-07，RESOURCE-02 已完成。新增 ResourceView，在同一状态层提供列表/网格切换、本地或远程查询、排序、分页、单选/多选、当前页批量选择、共享动作、受控布局偏好与自定义网格内容。

- Playwright 15 项通过：布局按钮状态、受控切换、页码和选择连续性、本地分页、查询复位、远程分页、当前页批量选择、单选、富网格内容、共享动作、加载/错误/空态、禁用、同页 Controls，以及四种主题密度。
- 本族 16 个 Story 在 dark/light × compact/comfortable 共 64 次组合中全部通过；页面错误、可访问性违规和水平溢出均为 0。
- 窄宽度截图人工检查通过：工具栏分行后仍保持明确顺序，网格为单列，卡片内距和行距紧凑，分页按钮和计数在同一行，无页面级水平溢出。
- 网格初版使用 `article role=listitem`，自动审计指出角色不适用于该元素；最终改为原生 `ul/li`，保留列表名称和项目语义。
- 参考 PrimeVue DataView 的列表/网格、分页和排序能力边界。Reito UI 使用自己的 ResourceList 状态投影、React API 和 Graphite tokens，没有复制上游源码、CSS、示例或资源。
- 全库为 115 个组件族（基础 67、复杂 29、AI 19）和 1040 个 Story；`npm run check` 与 `npm run build` 通过。构建只保留既有 chunk size 提示。

证据：[源码](../packages/ui/src/complex/resource-view.tsx)、[Story](../apps/storybook/stories/complex/ResourceView.stories.tsx)、[测试](../tests/resource-view.spec.ts)、[Story 审计](../.logs/resource-view/storybook-audit.json)、[测试日志](../.logs/resource-view/tests.log)、[四组合截图](../.logs/resource-view)、[用法](components/resource-view.md)。
