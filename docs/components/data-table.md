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

[Storybook 类型化列筛选](http://127.0.0.1:6006/?path=/story/复杂-datatable-数据表格--column-filters) 展示四种编辑器；[远程列筛选](http://127.0.0.1:6006/?path=/story/复杂-datatable-数据表格--remote-column-filters) 展示受控条件、远程结果和序列化查询；[受控远程分页](http://127.0.0.1:6006/?path=/story/复杂-datatable-数据表格--remote-controlled) 展示远程排序、分页和跨页选择。[参数调试](http://127.0.0.1:6006/?path=/story/复杂-datatable-数据表格--playground) 在同一 Canvas 用 Controls 切换 `manual`、总量、页码、全局查询、列筛选、负责人条件和错误/空态。默认、本地交互、加载、错误、空数据和隐藏选择列均有独立预设。
