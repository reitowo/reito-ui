# TREESELECT-01 TreeSelect 验收

2026-09-07，TREESELECT-01 已完成。新增 `TreeSelect`，在共享 Popover 中复用 TreeView / AsyncTreeView，覆盖搜索投影、单选、级联或独立复选、半选、受控值/展开/查询/弹层、清除、懒加载错误恢复、关闭焦点恢复和稳定原生表单值。全库增为 110 个组件族（基础 67、复杂 24、AI 19），共 950 个 Story。

- Playwright 17 项通过：受控单选与关闭、复选保持打开、级联半选、独立复选、搜索祖先路径/父节点子树/无结果、筛选时隐藏选择、键盘选择、清除、禁用、lazy 加载与失败重试、关闭后焦点、单/复选 FormData 和同页 Controls。
- 本族 15 个 Story 在 dark/light × compact/comfortable 共 60 次组合中全部通过；页面错误、自动可访问性违规与水平溢出均为 0。
- 420px 工作面四种主题/密度截图均人工查看；弹层宽度、搜索区、XS 树行和底部操作保持紧凑，舒适密度只增加共享控件高度与间距。
- 相关树回归合计 56 项；首次并行运行中仅 AsyncTreeView 的短暂 `aria-busy` 采样因 280ms 演示延迟错过，单项立即重跑通过。其余 TreeView、复选、异步、重排与 TreeSelect 场景通过。
- 视觉能力对照 PrimeVue 3 TreeSelect 的单选、复选和半选，以及 Tree 的筛选/lazy 场景。Reito 保留 Graphite 的中性触发器、紧凑行和明确 focus ring，并采用独立搜索栏与底部完成操作；未复制其品牌样式或源码。

证据：[检查](../.logs/tree-select/check.log)、[构建](../.logs/tree-select/build.log)、[交互测试](../.logs/tree-select/tests.log)、[Story 扫描](../.logs/tree-select/storybook-audit.json)、[四组合截图](../.logs/tree-select)、[源码](../packages/ui/src/complex/tree-select.tsx)、[Story](../apps/storybook/stories/complex/TreeSelect.stories.tsx)、[用法](components/tree-select.md)。
