# TreeTable 树表格

`TreeTable` 在共享表格密度中呈现层级记录。它使用原生 `<table role="treegrid">`、稳定节点 ID 和泛型列渲染器，适合同时需要父子关系与多个数据列的项目、权限或资源列表；纯导航仍使用 TreeView。

```tsx
import { TreeTable, type TreeTableColumn, type TreeTableNode } from '@reito/ui/complex';

const columns: TreeTableColumn<FileData>[] = [
  { id: 'name', header: '名称', cell: node => node.data.name, filterValue: node => node.data.name },
  { id: 'kind', header: '类型', cell: node => node.data.kind, filterValue: node => node.data.kind },
];

<TreeTable
  caption="项目文件"
  nodes={nodes}
  columns={columns}
  selectionMode="checkbox"
  checked={checked}
  onCheckedChange={setChecked}
  defaultExpanded={['src']}
  searchable
  filterable
  columnManager
  pageSize={20}
/>
```

`TreeTableNode<TData>` 包含全树唯一的 `id`、业务 `data`、可选 `children` 和 `disabled`。`expanded / defaultExpanded / onExpandedChange` 控制展开；`selectionMode="single"` 使用 `value / onValueChange`，`checkbox` 使用 `checked / onCheckedChange`。`checkPropagation="cascade"` 向下级联、向上计算完整/半选，禁用节点阻断祖先级联；`independent` 让每行独立。

表格采用行焦点模型，每次只有一行进入 Tab 顺序。上下键移动相邻可见行，右键展开或进入首个子行，左键折叠或回到父行，Home/End 到达首末可见行。单选模式 Enter 选择，复选模式 Space 切换；折叠包含焦点的分支后，焦点回到最近可见祖先。展开按钮和行复选框仍可用鼠标操作，但不额外增加每行的 Tab 停顿。

表头复选框作用于整棵已知树中的可用节点，底部计数也排除禁用行。loading / error / onRetry / emptyMessage 替换表体内容并保持列结构。

## 查询、列与分页

searchable 启用全局搜索，filterable 启用列筛选行。两者分别由 query / onQueryChange 和 columnFilters / onColumnFiltersChange 接管；未受控时可使用对应的 default 属性。列值优先取 column.filterValue(node)，否则读取 node.data[column.id]。所有活动列条件相与，再与全局查询相与。

filterMode=ancestors 仅保留命中节点及其祖先路径；subtree 在父节点命中时保留整棵子树。筛选期间祖先路径会临时展开，不修改 expanded。未加载的远程子节点不参与本地搜索，宿主需要先加载或在 onQueryChange 中执行远程查询。

columnManager 提供受控或非受控的显隐设置。第一列承载 treegrid 的层级、展开和错误状态，因此始终可见；其余列可以用 hideable=false 固定。pageSize 只分页根节点，子节点始终跟随所属根节点；page / onPageChange 可由宿主管理，查询变化会回到第一页。

## Lazy 子节点与稳定选择

将节点标为 loadable 并传入 loadChildren(node, { signal })。首次展开触发请求；折叠、刷新或卸载会通过 AbortSignal 取消请求，过期响应不会覆盖新状态。失败只显示在对应节点，可原位重试；refreshKey 变化会丢弃已解析子节点并重新进入未加载状态。

复选归一化始终基于完整的已知树，而不是当前筛选或根分页投影。因此隐藏行保持选择，已选 lazy 父节点加载新子节点后会继续向新子节点级联。宿主更新 nodes 时应保持业务 ID 稳定；已不存在的 ID 不计入显示选择。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-treetable-树表格--playground) 在同一 Canvas 中调整选择、展开、查询规则、筛选、列管理、分页、加载与错误；另有父子筛选、受控视图、lazy 成功/失败、跨视图选择等预设。[Lab](http://127.0.0.1:5173/?layer=complex&component=tree-table) 使用同一组件。
