# TREETABLE-02 TreeTable 高级验收

2026-09-07，TREETABLE-02 已完成。TreeTable 新增受控/非受控全局查询、列筛选、列显隐和根分页；明确祖先路径与整棵子树两种父子筛选规则；新增可取消、隔离过期响应、节点级失败与重试的 lazy 子节点。选择归一化仍以完整已知树和稳定 ID 为准，筛选、分页和异步子节点更新不会把视图投影误当成业务选择。

- Playwright 基础与高级共 32 项通过，其中高级 15 项覆盖祖先路径、父级子树、列筛选组合、列显隐/重置、根分页、受控查询/分页/列视图、lazy busy/成功/取消/重新加载/失败重试、筛选保持选择、新子节点继承父级选择，以及四种主题密度。
- 本族 25 个 Story 在 dark/light × compact/comfortable 共 100 次组合中全部通过；页面错误、可访问性违规和水平溢出均为 0。
- 560px 工作面四种主题/密度截图人工检查通过。工具栏、筛选行、表体与分页均直接消费共享控件和表格 token；compact 继续使用共享单元格纵向内距。
- npm run check 与 npm run build 通过。全库保持 112 个组件族（基础 67、复杂 26、AI 19），共 990 个 Story。
- 语义继续遵循 W3C APG Treegrid Pattern；能力范围对照 PrimeVue 3 TreeTable 的 filter、lazy 与 paginator。Reito 使用自己的 React 受控状态、树投影、请求隔离和 Graphite tokens，未复制上游源码、CSS、示例或资源。

证据：[源码](../packages/ui/src/complex/tree-table.tsx)、[Story](../apps/storybook/stories/complex/TreeTable.stories.tsx)、[高级交互测试](../tests/tree-table-advanced.spec.ts)、[基础回归](../tests/tree-table.spec.ts)、[Story 审计](../.logs/tree-table-advanced/storybook-audit.json)、[测试日志](../.logs/tree-table-advanced/tests.log)、[四组合截图](../.logs/tree-table-advanced)、[用法](components/tree-table.md)。
