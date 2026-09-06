# VirtualGrid 虚拟网格

`@reito/ui/complex` 导出 `VirtualGrid`、`VirtualGridProps`、`VirtualGridHandle` 和 `VirtualGridRange`。组件使用两个 TanStack Virtual 实例分别计算行、列窗口，只渲染二维交集。

```tsx
const ref = useRef<VirtualGridHandle>(null);
<VirtualGrid ref={ref} label="指标矩阵"
  rowCount={100_000} columnCount={10_000}
  getRowKey={row => rowIds[row]}
  getColumnKey={column => columnIds[column]}
  getCellKey={(row, column) => `${rowIds[row]}:${columnIds[column]}`}
  renderCell={(row, column) => matrix.read(row, column)}
  onRangeChange={range => loadWindow(range)} />
ref.current?.scrollToCell(50_000, 5_000, { row: 'center', column: 'center' });
```

| 参数 | 契约 |
| --- | --- |
| rowCount / columnCount | 已知二维总量；非有限数按 0，负数归零，小数取整。任一轴为 0 时显示空态。 |
| getRowKey / getColumnKey / getCellKey | 必填稳定业务身份。排序或插入后同一行、列、单元格继续使用同一 key。 |
| renderCell | 只渲染当前二维窗口的交集；宿主可依据缓存返回内容或占位。 |
| overscanRows / overscanColumns | 两个轴各自的额外渲染范围，默认 2 / 1，允许 0。 |
| rowSize / columnSize | 可选正数像素值，适合宿主已知固定尺寸；省略时分别测量 `--rui-row-height` 与 `--rui-virtual-column-width`。 |
| onRangeChange | 返回两个轴的渲染闭区间和可见闭区间，均为 0-based；没有窗口时对应值为 -1。宿主负责二维请求合并、缓存和过期结果。 |
| ref.scrollToCell | 将有限行列下标限制到有效范围，两个轴分别支持 start/center/end/auto。 |
| loading / error / onRetry | 初始加载、错误及本地/宿主重试；已有窗口加载时通过 `aria-busy` 表示。 |

滚动视口使用 `grid`、`row` 和 `gridcell`，并声明完整 `aria-rowcount` / `aria-colcount`。视口获得键盘焦点后，方向键移动活动单元格，Home/End 定位左上和右下；活动单元格以 `aria-activedescendant` 关联，不会被误报为业务选择。

默认尺寸随深浅主题之外的紧凑/舒适密度变化；Storybook 的数字 Controls 可以在同一页改为宿主固定尺寸。网格只负责固定尺寸的二维窗口；可变行列尺寸、表头、选择、编辑和冻结列属于更高层的数据表格组合。

[Storybook 参数调试](http://127.0.0.1:6006/?path=/story/复杂-virtualgrid-虚拟网格--playground) 可调整行列总量、两个 overscan、固定尺寸、状态和视口高度；[Lab](http://127.0.0.1:5173/?layer=complex&component=virtual-grid) 使用同一演示。
