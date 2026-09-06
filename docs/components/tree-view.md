# TreeView 树形导航

`@reito/ui/complex` 导出 `TreeView`、`TreeViewProps` 和 `TreeViewNode`。它是单选 ARIA tree，适合文件、资源和层级对象导航；原有 `DisclosureTree` 继续提供基于原生 `details/summary` 的普通目录。

```tsx
<TreeView nodes={nodes} label="项目文件"
  value={selected} onValueChange={setSelected}
  expanded={expanded} onExpandedChange={setExpanded} />
```

| 参数 | 契约 |
| --- | --- |
| nodes | 递归节点；`id` 在整棵树中稳定且唯一，`children: []` 表示可展开的空父节点。 |
| value / defaultValue / onValueChange | 受控或非受控单选。键盘焦点和选择彼此独立；Enter/Space 激活节点。 |
| expanded / defaultExpanded / onExpandedChange | 受控或非受控展开 ID。受控宿主必须把回调值写回。 |
| disabled | 禁用节点仍可通过方向键读取，带 `aria-disabled`，不能选择；依照 APG 不声明 `aria-selected`。 |
| label / emptyMessage | 树的可访问名称和整树/空父节点提示。 |

方向键遵循纵向树模型：上下移动到相邻可见节点；右键展开父节点或进入第一个子节点；左键折叠父节点或返回父节点；Home/End 前往首末可见节点。每项声明 `aria-level`、`aria-posinset` 和 `aria-setsize`。若宿主折叠或删除当前焦点节点，焦点回到最近仍可见的父节点，再回退到已选或首节点。

TreeView 使用 XS 行高、柔和层级线、中性选中底色和明确 focus ring。双击父节点可展开/折叠，单击选择节点。多选、复选级联和半选属于 TREE-02；异步子节点属于 TREE-03；拖放重排属于 TREE-04。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-treeview-树形导航--playground) 在同一 Canvas 中控制选择、展开、名称和空文案；另有禁用、折叠、窄宽度和焦点恢复预设。[Lab](http://127.0.0.1:5173/?layer=complex&component=tree-view) 使用同一组件。
