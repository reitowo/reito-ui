# RESOURCE-01 ResourceList 数据规模验收

2026-09-07，RESOURCE-01 已完成。ResourceList 在原有本地搜索、排序、选择与行操作上增加远程数据模式、动态虚拟窗口、已加载/总量边界、手动或滚动增量、下一批错误恢复、范围回调，以及跨查询和数据窗口的稳定 ID 选择。

- ResourceList Playwright 15 项通过，覆盖本地筛选/批量选择、虚拟渲染数量、手动与滚动增量、加载总量、查询替换、跨窗口选择、当前加载结果批量范围、下一批错误、首次状态、禁用状态、同页 Controls，以及四种主题密度。共享 VirtualList 固定和动态模式 15 项回归也通过，共 30 项。
- 本族 15 个 Story 在 dark/light × compact/comfortable 共 60 次组合中全部通过；页面错误、可访问性违规和水平溢出均为 0。
- 窄宽度四种主题/密度截图检查搜索、排序、批量选择、计数、虚拟行、增量栏和操作不会造成页面级水平溢出；行内距、间距、边界、状态色和控件尺寸消费共享 Graphite tokens。
- 首次视觉检查发现动态虚拟行在滚动顶部仍执行高度锚点补偿，首行被裁掉约 15px；共享 VirtualList 已限定只在离开顶部后补偿，资源列表和原有动态锚点回归均通过。
- 远程演示均由本地数组模拟，不发起网络请求；宿主负责远程取消、缓存、过期响应和真实删除。
- 全库为 114 个组件族（基础 67、复杂 28、AI 19）和 1024 个 Story；`npm run check` 与 `npm run build` 通过。构建只保留既有 chunk size 提示。

证据：[源码](../packages/ui/src/complex/resource-list.tsx)、[Story](../apps/storybook/stories/complex/ResourceList.stories.tsx)、[交互测试](../tests/resource-list.spec.ts)、[Story 审计](../.logs/resource-list/storybook-audit.json)、[测试日志](../.logs/resource-list/tests.log)、[四组合截图](../.logs/resource-list)、[用法](components/resource-list.md)。
