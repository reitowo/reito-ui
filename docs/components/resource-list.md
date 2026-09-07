# ResourceList 资源列表

`@reito/ui/complex` 导出 `ResourceList`、`ResourceItem`、`ResourceAction`、`ResourceSort` 与 `ResourceListProps`。组件覆盖本地小集合和远程增量集合；网络请求、缓存、取消和服务端排序由宿主负责。

```tsx
const [query, setQuery] = useState('');
const [selectedIds, setSelectedIds] = useState<string[]>([]);

<ResourceList
  label="项目资源"
  items={page.items}
  dataMode="remote"
  totalCount={page.total}
  query={query}
  onQueryChange={next => {
    setQuery(next);
    replaceLoadedWindow(next);
  }}
  virtualized
  viewportClassName="h-80"
  selectionMode="multiple"
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  hasMore={page.hasMore}
  loadingMore={page.loadingMore}
  loadMoreError={page.loadMoreError}
  onLoadMore={loadNextPage}
/>
```

| 参数 | 契约 |
| --- | --- |
| `dataMode` | `local` 在组件内搜索并排序 `items`；`remote` 保留宿主传入的顺序，查询和排序回调只通知宿主。默认 `local`。 |
| `items / totalCount` | `items` 是当前已加载窗口；远程模式用 `totalCount` 表示当前查询的总匹配数。显示总量不会小于已加载数量。 |
| `virtualized` | 使用共享 `VirtualList` 只渲染可见窗口，动态测量换行说明。`overscan` 默认 4，`viewportClassName` 调整滚动区高度。 |
| `onVisibleRangeChange` | 返回渲染与可见下标，格式与 `VirtualListRange` 一致。宿主可用于缓存、遥测或自定义加载策略。 |
| `hasMore / loadingMore / loadMoreError` | 分开表达增量边界、加载过程和下一批失败；已有资源保持可用。首次加载与失败继续用 `loading / error / onRetry`。 |
| `loadMoreMode` | `manual` 显示加载按钮；`automatic` 在虚拟窗口接近末尾时调用 `onLoadMore`。同一查询、排序和加载长度只自动请求一次。 |
| `loadMoreThreshold` | 自动模式距离已加载末尾多少行触发，默认 3，负数归零。 |
| `selectionMode / selectedIds` | `none / single / multiple`。稳定 ID 不因查询替换、虚拟行卸载或当前数据窗口变化而被组件清除；宿主删除真实资源时应同步移除对应 ID。 |
| 批量选择 | 本地模式只影响当前筛选结果；远程模式只影响当前已加载结果，不假定未加载资源的 ID。禁用项始终跳过。 |
| `actions` | 行操作由宿主提供，组件不读写磁盘或网络。禁用、首次加载或资源自身禁用时阻止动作。 |

远程模式的查询或排序变化应替换当前加载窗口并更新 `totalCount`。若宿主需要取消旧请求或隔离过期响应，应在数据层使用 AbortSignal 或请求身份；ResourceList 不推断远程协议。自动加载适合连续滚动，必须由 `loadingMore` 和宿主请求状态阻止并发请求；手动模式更适合昂贵或需要明确控制的数据源。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-resourcelist-资源列表--playground) 在同一 Story 调整选择、查询、排序、虚拟化和状态；[手动增量](http://127.0.0.1:6006/?path=/story/复杂-resourcelist-资源列表--manual-incremental)、[滚动增量](http://127.0.0.1:6006/?path=/story/复杂-resourcelist-资源列表--automatic-incremental)、[查询替换](http://127.0.0.1:6006/?path=/story/复杂-resourcelist-资源列表--query-replacement) 与[跨窗口选择](http://127.0.0.1:6006/?path=/story/复杂-resourcelist-资源列表--selection-across-windows) 分别固定高级边界。[Lab](http://127.0.0.1:5173/?layer=complex&component=resource-list) 使用同一公共组件。
