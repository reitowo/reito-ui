# TREETABLE-01 TreeTable 基础验收

2026-09-07，TREETABLE-01 已完成。新增泛型 `TreeTable`，覆盖稳定层级/列模型、受控展开、单选、级联或独立三态复选、禁用级联屏障、全树全选、row-focused treegrid 键盘模型、折叠焦点恢复以及加载/错误/空态。全库增为 112 个组件族（基础 67、复杂 26、AI 19），共 980 个 Story。

- Playwright 17 项通过：treegrid 层级元数据、指针折叠不误选、左右层级导航、上下/Home/End 顺序、受控单选、父级半选、分支级联、Space 复选、独立复选、全选排除禁用、受控展开、加载/错误/空态和同页 Controls；其中四项为主题/密度组合检查。
- 本族 15 个 Story 在 dark/light × compact/comfortable 共 60 次组合中全部通过；页面错误、自动可访问性违规与水平溢出均为 0。
- 560px 工作面四种主题/密度截图均人工查看。单元格直接消费 `--rui-cell-padding-x/y` 与表头 token；compact 保持 6px 纵向内距，没有另加面板 padding。
- 语义和键盘对照 W3C APG Treegrid Pattern，能力范围对照 PrimeVue 3 TreeTable。Reito 使用自己的泛型模型、级联算法和 Graphite 表格样式，未复制其源码、CSS 或资源。

证据：[检查](../.logs/tree-table/check.log)、[构建](../.logs/tree-table/build.log)、[交互测试](../.logs/tree-table/tests.log)、[Story 扫描](../.logs/tree-table/storybook-audit.json)、[四组合截图](../.logs/tree-table)、[源码](../packages/ui/src/complex/tree-table.tsx)、[Story](../apps/storybook/stories/complex/TreeTable.stories.tsx)、[用法](components/tree-table.md)。
