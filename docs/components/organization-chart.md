# OrganizationChart 组织结构图

`OrganizationChart` 将稳定的层级数据排成由上到下的关系图。它适合团队、服务、权限或模块关系的只读浏览与节点选择；普通文件导航继续使用 `TreeView`。

```tsx
<OrganizationChart
  nodes={teams}
  selectedId={selectedId}
  onSelectedIdChange={setSelectedId}
  collapsedIds={collapsedIds}
  onCollapsedIdsChange={setCollapsedIds}
  renderNode={(node, state) => <TeamNode node={node} depth={state.depth} />}
  label="团队结构"
/>
```

| 能力 | 契约 |
| --- | --- |
| 数据 | `nodes` 接收递归 `OrganizationChartNode[]`。每个节点需要全图唯一且稳定的 `id` 和可读 `label`；可选 `description / disabled / data / children`。组件不修改传入数据。 |
| 选择 | `selectedId / onSelectedIdChange` 提供受控单选，`defaultSelectedId` 提供非受控初值。禁用节点仍可浏览和聚焦，但不会触发选择。 |
| 折叠 | `collapsedIds / onCollapsedIdsChange` 提供受控分支折叠，`defaultCollapsedIds` 提供非受控初值。`collapsible={false}` 固定显示全部层级并移除折叠按钮。 |
| 节点模板 | `renderNode(node, state)` 只替换卡片内部内容；外层仍保留树语义、选择、焦点、边界和折叠控件。`state` 包含 `depth / selected / collapsed / disabled`。 |
| 键盘 | 根树使用 roving focus。上下键按当前可见顺序移动，左右键进入、展开、折叠或返回父节点，Home / End 跳到首尾，Enter / Space 选择。折叠当前焦点的祖先后，焦点回到最近可见祖先。 |
| 长内容 | 默认节点宽度为共享间距尺度上的 160px；标题单行截断、说明最多两行，完整文本保留在 `title` 和节点可访问名称中。宽图只在自身容器横向滚动。 |
| 空与禁用 | 空数据呈现带名称的状态区域；`disabled` 禁止整图选择和折叠，但保留层级阅读与方向键浏览。 |

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-organizationchart-组织结构图--playground) 可在同一个 Story 调整选择、折叠集合、是否允许折叠、整体禁用和文案。受控状态、模板、初始折叠、固定展开、禁用节点、多根、长内容、窄工作面与空态均有独立 Story。

组件只计算树形层级布局，不提供任意节点坐标、连边编辑、拖放、缩放、历史或序列化。需要流程图或图编辑器时，应使用独立的节点/边模型与画布组件。
