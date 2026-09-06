# LISTBOX-02 虚拟 Listbox 验收

2026-09-07，LISTBOX-02 已完成。在 LISTBOX-01 上增加 `virtual / overscan / onRangeChange` 和宿主驱动的 `loading / loadError / onRetry`。Listbox 组件族现有 25 个 Story；全库仍为 105 个组件族（基础 64、复杂 22、AI 19），共 851 个 Story。

- `npm run check`、`npm run build` 退出 0；token 审计无未批准项。
- **12/12** 虚拟化测试和 **20/20** LISTBOX-01 回归通过：5 万项 DOM 有界、远端选中项定位、活动 descendant 留存、End 导航、筛选焦点修复、首次/保留结果加载、错误重试、范围回调、同页 Controls，以及四种主题/密度。
- **100/100** 全族 Story 组合通过：25 个 Story × 深浅主题 × 两档密度，0 页面/控制台错误、0 可访问性违规、0 横向溢出。
- 5 万项示例的 option DOM 保持少于 30；跳到第 25,001 与 50,000 项后，活动 option 存在于 DOM，滚动位置与选择结果一致。
- 虚拟固定行由 `--rui-control-height`、行内 token 间距和隐藏 DOM 探针测得，不在 TypeScript 中写死像素；截图人工检查 dark/compact 与 light/comfortable 的滚动窗口、选中行和双行说明。
- loading/error 是宿主状态：刷新时保留现有选项，首次加载为空列表 status，失败提供 retry 回调。组件不内置请求、缓存或未知占位项。

证据：[检查](../.logs/listbox-virtual/check.log)、[构建](../.logs/listbox-virtual/build.log)、[新增与回归交互](../tests/listbox-virtual.spec.ts)、[Story 扫描](../.logs/listbox-virtual/storybook-audit-final.json)、[四组合截图](../.logs/listbox-virtual)、[组件源码](../packages/ui/src/basic/listbox.tsx)、[用法](components/listbox.md#虚拟化与加载边界)。
