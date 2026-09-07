# TreeSelect 树选择

`TreeSelect` 将可搜索的树放进 Popover，适合从项目、资源或权限层级中选择节点。它复用 `TreeView` 的单选/三态复选模型与 `AsyncTreeView` 的懒加载状态机；搜索只投影可见节点，隐藏选择仍保留并参与父节点半选计算。

```tsx
import { TreeSelect, type TreeViewNode } from '@reito/ui/complex';

const [checked, setChecked] = useState<string[]>(['button']);

<TreeSelect
  label="包含文件"
  nodes={nodes}
  selectionMode="checkbox"
  checked={checked}
  onCheckedChange={setChecked}
  defaultExpanded={['src', 'components']}
/>
```

`selectionMode="single"` 使用 `value / defaultValue / onValueChange`，选择后关闭弹层；`selectionMode="checkbox"` 使用 `checked / defaultChecked / onCheckedChange`，允许继续批量选择并通过“完成”关闭。`checkPropagation="cascade"` 级联父子并计算半选，`independent` 独立切换每个节点。`expanded`、`query` 与 `open` 都提供受控和默认值契约。

搜索匹配标签和说明。父节点匹配时保留其整棵已加载子树；只有后代匹配时保留祖先路径。懒加载模式只能搜索当前已解析节点，未加载后代不会被远程查询。`loadChildren(node, signal)`、`refreshKey`、加载错误和重试遵循 `AsyncTreeView` 契约；复选级联也只作用于已知节点。

传入 `name` 时，单选输出一个隐藏值，复选为每个规范化选中 ID 输出一个同名隐藏值。`required` 提供字段和组合框的必填语义与错误呈现；业务提交仍应验证是否满足选择规则。禁用态不会打开弹层，清除按钮不删除禁用节点本身形成的既有值。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-treeselect-树选择--playground) 可在同一 Canvas 中调整选择模式、值、展开项、搜索、级联、标签、必填、禁用与错误；另有搜索投影、无结果、懒加载失败重试、焦点恢复和原生表单预设。[Lab](http://127.0.0.1:5173/?layer=complex&component=tree-select) 使用同一组件。
