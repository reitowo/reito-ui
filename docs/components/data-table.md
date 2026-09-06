# DataTable 数据表格

`@reito/ui/complex` 导出 `DataTable` 和 `DataTableProps`。默认模式接收完整数据集，在浏览器内完成全局筛选、排序和分页；`manual` 模式接收宿主已经处理好的一页数据，并把查询状态交给宿主。

```tsx
const [sorting, setSorting] = useState<SortingState>([])
const [filter, setFilter] = useState('')
const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 20,
})
const [selection, setSelection] = useState<RowSelectionState>({})

<DataTable
  manual
  data={query.data.rows}
  rowCount={query.data.total}
  columns={columns}
  getRowId={(row) => row.id}
  sorting={sorting}
  onSortingChange={setSorting}
  globalFilter={filter}
  onGlobalFilterChange={setFilter}
  pagination={pagination}
  onPaginationChange={setPagination}
  rowSelection={selection}
  onRowSelectionChange={setSelection}
/>
```

| 参数 | 契约 |
| --- | --- |
| `data` / `columns` / `getRowId` | `getRowId` 必须返回跨查询、排序和分页均稳定且唯一的业务 ID。客户端模式的 `data` 是完整集合；manual 模式只传当前页。 |
| `sorting` / `defaultSorting` / `onSortingChange` | 受控或非受控排序状态。manual 模式只发出状态，不重排当前页；排序变化会回到第 1 页。 |
| `globalFilter` / `defaultGlobalFilter` / `onGlobalFilterChange` | 受控或非受控全局查询。输入和清空都会回到第 1 页；manual 模式由宿主解释查询语义。 |
| `columnFilters` / `defaultColumnFilters` / `onColumnFiltersChange` | 受控或非受控的类型化列条件。不同列按 AND 组合；`select` 的多个值按 OR 匹配。变化会回到第 1 页。 |
| `filterDefinitions` | 为匹配的叶列增加紧凑筛选菜单。支持 `text`、`select`、`number`、`date`；定义的 `id` 必须等于列 `id` 或字符串 `accessorKey`。 |
| `columnVisibility` / `columnOrder` / `columnSizing` / `columnPinning` | 四组均支持受控值、`default*` 初值和 `on*Change` 回调，可由宿主持久化。 |
| `manageColumns` / `resizableColumns` / `columnLabels` | 开启列管理菜单、指针/键盘宽度调节，并为非字符串表头提供可读名称。 |
| `expanded` / `defaultExpanded` / `onExpandedChange` | 受控或非受控展开状态；键是稳定行 ID，`true` 表示全部展开。 |
| `getSubRows` / `getRowCanExpand` / `renderExpandedRow` | 分别声明层级子行、可展开范围和详情内容。详情回调只负责内容，组件负责完整宽度行、按钮和 `aria-expanded`。 |
| `grouping` / `defaultGrouping` / `onGroupingChange` | 受控或非受控行分组字段顺序。分组改变会回到第 1 页。 |
| `groupingDefinitions` | 添加紧凑行分组菜单；定义 ID 必须对应可分组叶列。选择顺序就是嵌套层级，可用按钮或 Alt+↑/↓ 调整。 |
| `renderGroupHeader` / `renderGroupSummary` | 自定义组头和全宽汇总行。聚合数据单元格继续使用 TanStack `ColumnDef.aggregatedCell` / `aggregationFn`。 |
| `manualExpanding` / `manualGrouping` | 分别把展开或分组交给宿主，独立于远程筛选/排序/分页的 `manual`。 |
| `filterFromLeafRows` / `paginateExpandedRows` | 默认由叶行向上保留匹配父组，并让展开子行跟随父行所在页；可显式改写。 |
| `pagination` / `defaultPagination` / `onPaginationChange` | 受控或非受控 `{ pageIndex, pageSize }`。`pageIndex` 从 0 开始。只传 `pageSize` 时，它作为非受控初值。 |
| `manual` | 同时关闭客户端筛选、排序和分页。宿主必须用最新状态请求并传回已经处理好的一页数据。 |
| `rowCount` / `pageCount` | manual 模式的远程总量或页数。优先传 `rowCount`，组件按当前 `pageSize` 推导页数；后端不知道终页时可传 `pageCount={-1}`。两者都不传时只能把当前页行数当作总量回退。 |
| `rowSelection` / `onRowSelectionChange` | 可受控保存跨页 ID。计数来自完整选择映射，不依赖当前页是否已加载；表头复选框只切换当前页。 |
| `selectable` | 控制选择列；默认开启。 |
| `loading` / `error` / `onRetry` / `emptyMessage` | 加载、保留缓存数据的错误提示、重试动作和空结果文案。网络请求、取消、缓存和错误恢复由宿主实现。 |

`manual` 是一个一致的数据边界：不要让远程分页只加载一页，却继续在客户端只排序或筛选这一页。宿主收到筛选或排序变化后应取消或忽略过期请求，并将结果、`rowCount` 与查询状态一起写回。组件会把筛选和排序导致的页码复位通过 `onPaginationChange` 交还宿主。

跨页选择依赖稳定 ID。受控 `rowSelection` 可以保留当前 `data` 之外的 ID；“已选”计数因此表示宿主保留的全部 ID。组件不猜测“选择全部远程结果”的含义，表头复选框明确只选择当前页。

## 列筛选

```tsx
const filterDefinitions: DataTableColumnFilterDefinition[] = [
  { id: 'name', label: '任务', kind: 'text' },
  { id: 'owner', label: '负责人', kind: 'select', options: owners },
  { id: 'score', label: '评分', kind: 'number' },
  { id: 'updated', label: '更新日期', kind: 'date' },
]

<DataTable
  data={rows}
  columns={columns}
  filterDefinitions={filterDefinitions}
  columnFilters={filters}
  onColumnFiltersChange={setFilters}
  getRowId={(row) => row.id}
/>
```

筛选值是带 `kind` 和 `operator` 的判别联合：文本支持包含、等于、开头是；数值支持闭区间、等于、大于等于、小于等于；日期支持闭区间、当天、不早于、不晚于；枚举支持同列多值。空条件自动移除，反向数值/日期区间会阻止应用并显示错误。`filterDefinitions` 只提供编辑器和本地匹配方式；列标题和单元格仍来自 TanStack `ColumnDef`。

manual 模式不会在当前页再次执行列筛选。宿主可直接使用受控 `columnFilters`，或用 `serializeDataTableColumnFilters(filters)` 得到按字段排序、去除空条件的稳定 JSON 子句，作为请求参数或缓存键。序列化只定义传输边界，不负责 URL 编码、数据库查询、时区转换、网络请求或后端授权。日期值是 `YYYY-MM-DD` 的 date-only 字符串；数值区间和日期区间均包含端点。

## 列管理

`manageColumns` 提供显隐、左右固定和前后排序。至少保留一列可见；按钮和聚焦行的 Alt+↑/↓ 都能重排。`resizableColumns` 提供指针拖动和可聚焦 separator，左右键每次调整 16px，双击恢复。四组状态均可受控持久化；固定列用 TanStack start/after 偏移和语义 token 保持在横向滚动边缘。可见列和 header group 共用同一模型，隐藏或排序叶列时分组表头同步更新。

## 行展开与行分组

层级子行由 `getSubRows` 提供；详情面板由 `renderExpandedRow` 提供。两者都使用同一份 `expanded` 状态和行内展开按钮，宿主可以只启用一种，也可以让父行展开子行、叶行展开详情。稳定 ID 必须在整棵树中唯一。默认 `paginateExpandedRows={false}`，因此子行留在父行所在页。

行分组使用 `grouping` 字段数组，其顺序决定嵌套层级。`groupingDefinitions` 只负责可见的分组菜单；是否允许某列分组仍由 `ColumnDef.enableGrouping` 决定。组头使用 `renderGroupHeader`，全宽说明使用 `renderGroupSummary`，数值聚合使用列定义的 `aggregationFn` 与 `aggregatedCell`。分组 checkbox 只把真实叶行 ID 写入选择状态，不把 TanStack 生成的临时组 ID 暴露给宿主；折叠后选择仍保留。

本地筛选默认 `filterFromLeafRows`，命中的叶行会保留祖先分组；排序、固定列、可见列和分组共用 TanStack 行/列模型。`manualGrouping` 和 `manualExpanding` 用于服务端已经产出相应结构的场景，宿主负责返回结构、聚合值和对应状态；组件不发送网络请求。

[Storybook 类型化列筛选](http://127.0.0.1:6006/?path=/story/复杂-datatable-数据表格--column-filters) 展示四种编辑器；[远程列筛选](http://127.0.0.1:6006/?path=/story/复杂-datatable-数据表格--remote-column-filters) 展示受控条件、远程结果和序列化查询；[受控远程分页](http://127.0.0.1:6006/?path=/story/复杂-datatable-数据表格--remote-controlled) 展示远程排序、分页和跨页选择；[层级与详情展开](http://127.0.0.1:6006/?path=/story/复杂-datatable-数据表格--row-expansion) 和[数据行分组](http://127.0.0.1:6006/?path=/story/复杂-datatable-数据表格--row-grouping) 分开展示两种结构。[参数调试](http://127.0.0.1:6006/?path=/story/复杂-datatable-数据表格--playground) 在同一 Canvas 用 Controls 切换查询、列、分组、展开和状态参数。
