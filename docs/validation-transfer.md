# TRANSFER-01 Transfer 验收

2026-09-07，TRANSFER-01 已完成。新增 Transfer / TransferItem，覆盖有序受控目标值、双侧受控选择与查询、单项和当前结果批量转移、禁用项边界、Alt+方向键、空态、只读、禁用和加载状态。全库增为 113 个组件族（基础 67、复杂 27、AI 19），共 1005 个 Story。

- Playwright 14 项通过：双侧可访问名称、按源顺序追加、移回与去重、搜索结果批量移动、禁用项保留、Alt+左右转移、只读/禁用/加载、两侧空态、同页 Controls，以及四种主题密度。
- 本族 15 个 Story 在 dark/light × compact/comfortable 共 60 次组合中全部通过；页面错误、可访问性违规和水平溢出均为 0。
- 560px 四种主题/密度截图人工检查通过。窄布局垂直排列两侧并横排操作按钮；行高、搜索框、边框、间距和按钮直接消费 Listbox、Button 与共享 token。
- npm run check 与 npm run build 通过。
- 能力范围对照 PrimeVue 5 PickList 与 PrimeReact v11 PickList。Reito 复用自己的 Listbox 和 Graphite tokens，实现独立 React 状态与当前结果规则；未复制上游源码、CSS、示例或资源。

证据：[源码](../packages/ui/src/complex/transfer.tsx)、[Story](../apps/storybook/stories/complex/Transfer.stories.tsx)、[交互测试](../tests/transfer.spec.ts)、[Story 审计](../.logs/transfer/storybook-audit.json)、[测试日志](../.logs/transfer/tests.log)、[四组合截图](../.logs/transfer)、[用法](components/transfer.md)。
