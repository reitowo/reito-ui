# ResourceView 资源视图

`@reito/ui/complex` 导出 `ResourceView`、`ResourceViewProps` 与 `ResourceLayout`。它将同一资源集合投影成列表或网格，布局偏好、查询、排序、页码、选择和动作都只有一个状态来源。

```tsx
const [layout, setLayout] = useState<ResourceLayout>('list');
const [selectedIds, setSelectedIds] = useState<string[]>([]);

<ResourceView
  label="项目资源"
  items={resources}
  layout={layout}
  onLayoutChange={setLayout}
  pageSize={12}
  selectionMode="multiple"
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  actions={[{ id: 'open', label: '打开', onAction: openResource }]}
/>
```

| 参数 | 契约 |
| --- | --- |
| `layout / defaultLayout / onLayoutChange` | `list` 或 `grid`；支持受控和非受控。切换只改变投影，不重建查询、页码或选择状态。 |
| `dataMode` | `local` 使用 ResourceList 的共享 `projectResourceItems` 搜索排序后分页；`remote` 保留宿主当前页顺序。 |
| `page / defaultPage / pageSize` | 页码从 0 开始。查询与排序变化回到第 0 页；越界页会限制在当前总页数内。 |
| `totalCount` | 远程模式当前查询的总记录数；宿主传入 `items` 作为当前页，并在 `onPageChange` 后替换它。 |
| `selectionMode / selectedIds` | 列表和网格使用同一稳定 ID 数组。当前页批量选择跳过禁用项，翻页和切换布局不清除选择。 |
| `actions` | 同一动作定义用于两种布局，禁用规则一致；组件不执行文件或网络操作。 |
| `renderGridItem` | 替换网格卡片说明区域，卡片的身份、选择、类型、禁用状态和动作仍由组件维护。 |
| `virtualizedList` | 列表布局可复用 ResourceList 虚拟窗口；网格按页渲染，避免同时叠加分页和二维滚动状态。 |
| `query / sort / page / layout` 回调 | 可用于宿主持久化完整视图偏好。组件不写 localStorage，避免多个实例共享错误的隐式状态。 |

网格使用原生 `ul/li` 列表语义，布局按钮通过 `aria-pressed` 表达当前偏好。窄宽度下工具栏自然换行，网格降为单列；卡片继续使用内容内距、边界、间距和控件尺寸 tokens。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-resourceview-资源视图--playground) 可在同一 Story 调整布局、查询、排序、页码、选择与状态；[状态连续性](http://127.0.0.1:6006/?path=/story/复杂-resourceview-资源视图--state-continuity) 和[远程分页](http://127.0.0.1:6006/?path=/story/复杂-resourceview-资源视图--remote-page) 固定共享状态边界。[Lab](http://127.0.0.1:5173/?layer=complex&component=resource-view) 使用同一组件。
