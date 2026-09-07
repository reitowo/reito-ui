# LOG-01 LogViewer 大数据验收

2026-09-07，LOG-01 已完成。LogViewer 在原有等级、查询与跟随基础上改用动态虚拟窗口，增加前插历史加载、总量边界、稳定追加、视图偏好、范围回调、缓存错误和窄工作面状态。

- LogViewer Playwright 14 项通过，覆盖 1 万条日志的有界 DOM、等级与文本查询、跟随追加、暂停追加、用户上滚暂停、恢复到最新、前插历史锚点、视图菜单、长行换行/横向滚动、加载/错误/空/禁用、同页 Controls 和四种主题密度。
- 共享 VirtualList 固定与动态模式 15 项回归通过，共 29 项；新增句柄可查询末尾并定位最新，新增初始末尾位置用于日志和 feed。
- 本族 19 个 Story 在 dark/light × compact/comfortable 共 76 次组合中全部通过；页面错误、控制台错误、可访问性违规和页面级水平溢出均为 0。
- 视觉对照使用本库 ResourceList 的 dark/compact 窄数据工作面（420 × 760）作为同类内部参考，并检查 LogViewer 的四种主题/密度截图。两者保持相同 cell padding、content gap、软边界和短工具栏节奏；日志为适配时间/级别/来源保留更紧凑的等宽元数据列。窄面板中视图动作会换到下一行，长日志在内部换行或横向滚动；未增加日志专用硬编码颜色或行高。
- 能力和视觉范围核对官方 TanStack Virtual Virtualizer API 与 PrimeVue VirtualScroller；实现复用本项目共享 VirtualList 和原创 Graphite 布局。剩余差异是组件只接收结构化日志，不读取终端、不提供 ANSI 解析，也不持久化视图偏好。
- 全库为 115 个组件族（基础 67、复杂 29、AI 19）和 1051 个 Story；`npm run check` 与 `npm run build` 通过。构建只保留既有 chunk size 提示。

证据：[源码](../packages/ui/src/complex/log-viewer.tsx)、[Story](../apps/storybook/stories/complex/LogViewer.stories.tsx)、[交互测试](../tests/log-viewer.spec.ts)、[Story 审计](../.logs/log-viewer/storybook-audit.json)、[测试日志](../.logs/log-viewer/tests.log)、[四组合截图](../.logs/log-viewer)、[用法](components/log-viewer.md)。
