# TreeTable 树表格

`TreeTable` 在共享表格密度中呈现层级记录。它使用原生 `<table role="treegrid">`、稳定节点 ID 和泛型列渲染器，适合同时需要父子关系与多个数据列的项目、权限或资源列表；纯导航仍使用 TreeView。

```tsx
import { TreeTable, type TreeTableColumn, type TreeTableNode } from '@reito/ui/complex';

const columns: TreeTableColumn<FileData>[] = [
  { id: 'name', header: '名称', cell: node => node.data.name },
  { id: 'kind', header: '类型', cell: node => node.data.kind },
];

<TreeTable
  caption="项目文件"
  nodes={nodes}
  columns={columns}
  selectionMode="checkbox"
  checked={checked}
  onCheckedChange={setChecked}
  defaultExpanded={['src']}
/>
```

`TreeTableNode<TData>` 包含全树唯一的 `id`、业务 `data`、可选 `children` 和 `disabled`。`expanded / defaultExpanded / onExpandedChange` 控制展开；`selectionMode="single"` 使用 `value / onValueChange`，`checkbox` 使用 `checked / onCheckedChange`。`checkPropagation="cascade"` 向下级联、向上计算完整/半选，禁用节点阻断祖先级联；`independent` 让每行独立。

表格采用行焦点模型，每次只有一行进入 Tab 顺序。上下键移动相邻可见行，右键展开或进入首个子行，左键折叠或回到父行，Home/End 到达首末可见行。单选模式 Enter 选择，复选模式 Space 切换；折叠包含焦点的分支后，焦点回到最近可见祖先。展开按钮和行复选框仍可用鼠标操作，但不额外增加每行的 Tab 停顿。

表头复选框作用于整棵已知树中的可用节点，底部计数也排除禁用行。`loading / error / onRetry / emptyMessage` 替换表体内容并保持列结构。当前基础版不包含筛选、分页、列管理或 lazy 子节点，这些能力由 TREETABLE-02 增量实现。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-treetable-树表格--playground) 在同一 Canvas 中调整选择模式、值、展开、级联、标题、加载与错误；另有半选、独立选择、受控展开、禁用、窄容器和长内容预设。[Lab](http://127.0.0.1:5173/?layer=complex&component=tree-table) 使用同一组件。
