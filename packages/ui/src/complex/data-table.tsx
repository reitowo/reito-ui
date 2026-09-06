import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import {
  flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
  type Column, type ColumnDef, type ColumnFiltersState, type ColumnOrderState, type ColumnPinningState, type ColumnSizingState, type FilterFn, type PaginationState, type RowSelectionState, type SortingState, type Updater, type VisibilityState,
} from '@tanstack/react-table';
import { Button } from '../primitives/button.js';
import { Checkbox } from '../primitives/checkbox.js';
import { Input } from '../primitives/input.js';
import { NativeSelect, NativeSelectOption } from '../primitives/native-select.js';
import { DataTableColumnFilterMenu, dataTableColumnFilterFn, isDataTableColumnFilterActive, type DataTableColumnFilterDefinition, type DataTableColumnFiltersState } from './data-table-filter.js';
import { DataTableColumnManager } from './data-table-columns.js';
import { cx } from './shared.js';

export { isDataTableColumnFilterActive, matchesDataTableColumnFilter, serializeDataTableColumnFilters } from './data-table-filter.js';
export type { DataTableColumnFilterDefinition, DataTableColumnFilterOption, DataTableColumnFiltersState, DataTableColumnFilterValue, DataTableDateFilterValue, DataTableFilterQueryClause, DataTableNumberFilterValue, DataTableSelectFilterValue, DataTableTextFilterValue } from './data-table-filter.js';

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  /** Stable IDs are required so selection survives sorting, filtering and insertion. */
  getRowId: (row: TData) => string;
  caption?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  sorting?: SortingState;
  defaultSorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  globalFilter?: string;
  defaultGlobalFilter?: string;
  onGlobalFilterChange?: (filter: string) => void;
  /** Typed per-column filters. Different columns are combined with AND. */
  columnFilters?: DataTableColumnFiltersState;
  defaultColumnFilters?: DataTableColumnFiltersState;
  onColumnFiltersChange?: (filters: DataTableColumnFiltersState) => void;
  /** Adds compact editors to matching leaf column headers. */
  filterDefinitions?: DataTableColumnFilterDefinition[];
  columnVisibility?: VisibilityState;
  defaultColumnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  columnOrder?: ColumnOrderState;
  defaultColumnOrder?: ColumnOrderState;
  onColumnOrderChange?: (order: ColumnOrderState) => void;
  columnSizing?: ColumnSizingState;
  defaultColumnSizing?: ColumnSizingState;
  onColumnSizingChange?: (sizing: ColumnSizingState) => void;
  columnPinning?: ColumnPinningState;
  defaultColumnPinning?: ColumnPinningState;
  onColumnPinningChange?: (pinning: ColumnPinningState) => void;
  manageColumns?: boolean;
  resizableColumns?: boolean;
  columnLabels?: Record<string, string>;
  pagination?: PaginationState;
  defaultPagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  /** The supplied data is one server-resolved page; sorting, filtering and pagination are delegated to the host. */
  manual?: boolean;
  /** Total records matching the remote query. Required for accurate manual pagination. */
  rowCount?: number;
  /** Overrides the page count derived from rowCount/pageSize. Use -1 when the backend does not know the last page. */
  pageCount?: number;
  selectable?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  className?: string;
}

/** Client mode resolves a complete dataset locally; manual mode exposes the query state for a remote page. */
export function DataTable<TData>({ data, columns, getRowId, caption = '工作区数据', searchPlaceholder = '筛选所有列…', pageSize = 5,
  sorting, defaultSorting = [], onSortingChange, globalFilter, defaultGlobalFilter = '', onGlobalFilterChange,
  columnFilters, defaultColumnFilters = [], onColumnFiltersChange, filterDefinitions = [],
  columnVisibility, defaultColumnVisibility = {}, onColumnVisibilityChange, columnOrder, defaultColumnOrder = [], onColumnOrderChange,
  columnSizing, defaultColumnSizing = {}, onColumnSizingChange, columnPinning, defaultColumnPinning = { left: [], right: [] }, onColumnPinningChange,
  manageColumns = false, resizableColumns = manageColumns, columnLabels = {},
  pagination, defaultPagination, onPaginationChange, manual = false, rowCount: externalRowCount, pageCount: externalPageCount,
  selectable = true, rowSelection, onRowSelectionChange, loading = false, error, onRetry, emptyMessage = '没有符合条件的记录', className }: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>(defaultSorting);
  const [internalFilter, setInternalFilter] = useState(defaultGlobalFilter);
  const [internalColumnFilters, setInternalColumnFilters] = useState<DataTableColumnFiltersState>(defaultColumnFilters);
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>(defaultColumnVisibility);
  const [internalColumnOrder, setInternalColumnOrder] = useState<ColumnOrderState>(defaultColumnOrder);
  const [internalColumnSizing, setInternalColumnSizing] = useState<ColumnSizingState>(defaultColumnSizing);
  const [internalColumnPinning, setInternalColumnPinning] = useState<ColumnPinningState>(defaultColumnPinning);
  const [internalPagination, setInternalPagination] = useState<PaginationState>(defaultPagination ?? { pageIndex: 0, pageSize: Math.max(1, pageSize) });
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({});
  const currentSorting = sorting ?? internalSorting;
  const query = globalFilter ?? internalFilter;
  const currentColumnFilters = columnFilters ?? internalColumnFilters;
  const currentColumnVisibility = columnVisibility ?? internalColumnVisibility;
  const currentColumnOrder = columnOrder ?? internalColumnOrder;
  const currentColumnSizing = columnSizing ?? internalColumnSizing;
  const currentColumnPinning = columnPinning ?? internalColumnPinning;
  const currentPagination = pagination ?? internalPagination;
  const selection = rowSelection ?? internalSelection;
  function updateSorting(update: Updater<SortingState>) {
    const next = typeof update === 'function' ? update(currentSorting) : update;
    if (sorting === undefined) setInternalSorting(next);
    onSortingChange?.(next);
    if (manual && currentPagination.pageIndex !== 0) updatePagination(current => ({ ...current, pageIndex: 0 }));
  }
  function updateFilter(update: Updater<string>) {
    const next = typeof update === 'function' ? update(query) : update;
    if (globalFilter === undefined) setInternalFilter(next);
    onGlobalFilterChange?.(next);
  }
  function updateColumnFilters(update: Updater<ColumnFiltersState>) {
    const next = (typeof update === 'function' ? update(currentColumnFilters) : update) as DataTableColumnFiltersState;
    if (columnFilters === undefined) setInternalColumnFilters(next);
    onColumnFiltersChange?.(next);
    if (currentPagination.pageIndex !== 0) updatePagination(current => ({ ...current, pageIndex: 0 }));
  }
  function updateColumnVisibility(update: Updater<VisibilityState>) { const next = typeof update === 'function' ? update(currentColumnVisibility) : update; if (columnVisibility === undefined) setInternalColumnVisibility(next); onColumnVisibilityChange?.(next); }
  function updateColumnOrder(update: Updater<ColumnOrderState>) { const next = typeof update === 'function' ? update(currentColumnOrder) : update; if (columnOrder === undefined) setInternalColumnOrder(next); onColumnOrderChange?.(next); }
  function updateColumnSizing(update: Updater<ColumnSizingState>) { const next = typeof update === 'function' ? update(currentColumnSizing) : update; if (columnSizing === undefined) setInternalColumnSizing(next); onColumnSizingChange?.(next); }
  function updateColumnPinning(update: Updater<ColumnPinningState>) { const next = typeof update === 'function' ? update(currentColumnPinning) : update; if (columnPinning === undefined) setInternalColumnPinning(next); onColumnPinningChange?.(next); }
  function updatePagination(update: Updater<PaginationState>) {
    const next = typeof update === 'function' ? update(currentPagination) : update;
    if (pagination === undefined) setInternalPagination(next);
    onPaginationChange?.(next);
  }
  function updateSelection(update: Updater<RowSelectionState>) {
    const next = typeof update === 'function' ? update(selection) : update;
    if (rowSelection === undefined) setInternalSelection(next);
    onRowSelectionChange?.(next);
  }
  const definitionById = useMemo(() => new Map(filterDefinitions.map(definition => [definition.id, definition])), [filterDefinitions]);
  const resolvedColumns = useMemo(() => {
    const decorate = (definitions: ColumnDef<TData>[]): ColumnDef<TData>[] => definitions.map(definition => {
      const id = definition.id ?? ('accessorKey' in definition && typeof definition.accessorKey === 'string' ? definition.accessorKey : undefined);
      const children = 'columns' in definition && definition.columns ? decorate(definition.columns) : undefined;
      const filterDefinition = id ? definitionById.get(id) : undefined;
      return { ...definition, ...(children ? { columns: children } : {}), ...(filterDefinition ? { enableColumnFilter: true, filterFn: dataTableColumnFilterFn as FilterFn<TData> } : {}) } as ColumnDef<TData>;
    });
    return decorate(columns);
  }, [columns, definitionById]);
  const table = useReactTable({
    data, columns: resolvedColumns, getRowId,
    state: { sorting: currentSorting, globalFilter: query, columnFilters: currentColumnFilters, columnVisibility: currentColumnVisibility, columnOrder: currentColumnOrder, columnSizing: currentColumnSizing, columnPinning: currentColumnPinning, pagination: currentPagination, rowSelection: selection },
    onSortingChange: updateSorting, onPaginationChange: updatePagination, onRowSelectionChange: updateSelection,
    onGlobalFilterChange: updateFilter, onColumnFiltersChange: updateColumnFilters, enableRowSelection: selectable, globalFilterFn: 'includesString',
    onColumnVisibilityChange: updateColumnVisibility, onColumnOrderChange: updateColumnOrder, onColumnSizingChange: updateColumnSizing, onColumnPinningChange: updateColumnPinning,
    enableColumnResizing: resizableColumns, columnResizeMode: 'onChange',
    manualSorting: manual, manualFiltering: manual, manualPagination: manual, rowCount: manual ? externalRowCount ?? data.length : undefined,
    pageCount: manual ? externalPageCount : undefined, autoResetPageIndex: manual ? false : undefined,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(),
  });
  const resolvedRowCount = manual ? externalRowCount ?? data.length : table.getFilteredRowModel().rows.length;
  const selectedCount = Object.values(selection).filter(Boolean).length;
  const activeColumnFilterCount = currentColumnFilters.filter(filter => isDataTableColumnFilterActive(filter.value)).length;
  const resolvedPageCount = table.getPageCount();
  const headerGroups = table.getHeaderGroups();
  const columnCount = table.getVisibleLeafColumns().length + Number(selectable);
  const hasLeftPinned = table.getLeftVisibleLeafColumns().length > 0;
  function pinnedStyle(column: Column<TData, unknown>) {
    const pinned = column.getIsPinned();
    return { width: column.getSize(), left: pinned === 'left' ? `calc(${column.getStart('left')}px + ${selectable ? 'var(--rui-control-height-lg)' : '0px'})` : undefined, right: pinned === 'right' ? `${column.getAfter('right')}px` : undefined };
  }
  function pinnedClass(column: Column<TData, unknown>, surface: 'head' | 'body') {
    const pinned = column.getIsPinned();
    return cx(pinned && 'sticky z-[var(--rui-z-navigation)]', pinned && (surface === 'head' ? 'bg-muted' : 'bg-background group-hover:bg-muted'), pinned === 'left' && column.getIsLastColumn('left') && 'border-r border-border', pinned === 'right' && column.getIsFirstColumn('right') && 'border-l border-border');
  }
  function resizeColumn(column: Column<TData, unknown>, delta: number) {
    const min = column.columnDef.minSize ?? 20;
    const max = column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;
    updateColumnSizing(current => ({ ...current, [column.id]: Math.min(max, Math.max(min, column.getSize() + delta)) }));
  }
  return <section data-slot="data-table" aria-label={caption} aria-busy={loading} className={cx('min-w-0 space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap)]">
      <div className="relative w-full max-w-xs"><Search aria-hidden="true" className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-2.5 size-4 text-muted-foreground" /><Input aria-label={`筛选${caption}`} placeholder={searchPlaceholder} className="pl-9" disabled={loading} value={query} onChange={event => { updateFilter(event.target.value); updatePagination(current => ({ ...current, pageIndex: 0 })); }} /></div>
      <div className="flex items-center gap-[var(--rui-content-gap)]"><span className="text-xs text-muted-foreground">共 {resolvedRowCount} 条{selectable && ` · 已选 ${selectedCount} 条`}{activeColumnFilterCount > 0 && ` · ${activeColumnFilterCount} 个列筛选`}</span>{activeColumnFilterCount > 0 && <Button variant="ghost" size="xs" disabled={loading} onClick={() => updateColumnFilters([])}>清除列筛选</Button>}{manageColumns && <DataTableColumnManager table={table} labels={columnLabels} disabled={loading} />}</div>
    </div>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap)] rounded-lg border border-destructive/30 bg-destructive/5 p-[var(--rui-content-padding)] text-destructive"><span>{error}</span>{onRetry && <Button variant="outline" size="sm" onClick={onRetry}>重试</Button>}</div>}
    <div className="overflow-auto rounded-lg border border-border">
      <table className="w-full min-w-full border-collapse text-left text-sm" style={{ width: table.getTotalSize() }}>
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-muted/40 text-muted-foreground">{headerGroups.map((group, groupIndex) => <tr key={group.id}>
          {selectable && groupIndex === 0 && <th scope="col" rowSpan={headerGroups.length} className={cx('w-[var(--rui-control-height-lg)] px-[var(--rui-cell-padding-x)] py-[var(--rui-table-head-padding-y)]', hasLeftPinned && 'sticky left-0 z-[var(--rui-z-navigation)] border-r border-border bg-muted')}><Checkbox aria-label="选择当前页全部记录" checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected()} disabled={loading || !data.length} onCheckedChange={checked => table.toggleAllPageRowsSelected(checked)} /></th>}
          {group.headers.map(header => <th scope="col" key={header.id} colSpan={header.colSpan} aria-sort={header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : undefined} style={pinnedStyle(header.column)} className={cx('relative whitespace-nowrap px-[var(--rui-cell-padding-x)] py-[var(--rui-table-head-padding-y)] font-medium', pinnedClass(header.column, 'head'))}>
            {header.isPlaceholder ? null : <div className="flex items-center gap-0.5">{header.column.getCanSort() ? <Button variant="ghost" size="sm" className="-ml-2" onClick={header.column.getToggleSortingHandler()} disabled={loading}>{flexRender(header.column.columnDef.header, header.getContext())}{header.column.getIsSorted() === 'asc' ? <ArrowUp aria-hidden="true" /> : header.column.getIsSorted() === 'desc' ? <ArrowDown aria-hidden="true" /> : <ArrowUpDown aria-hidden="true" className="text-muted-foreground" />}</Button> : flexRender(header.column.columnDef.header, header.getContext())}{definitionById.get(header.column.id) && <DataTableColumnFilterMenu column={header.column} definition={definitionById.get(header.column.id)!} disabled={loading} />}</div>}
            {header.column.getCanResize() && !header.isPlaceholder && <div role="separator" aria-label={`调整${columnLabels[header.column.id] ?? header.column.id}列宽`} aria-orientation="vertical" aria-valuemin={header.column.columnDef.minSize ?? 20} aria-valuemax={header.column.columnDef.maxSize ?? 1000} aria-valuenow={Math.round(header.column.getSize())} tabIndex={0} onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()} onDoubleClick={() => header.column.resetSize()} onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); resizeColumn(header.column, event.key === 'ArrowLeft' ? -16 : 16); } }} className="absolute inset-y-0 right-0 w-1 cursor-col-resize touch-none outline-none hover:bg-ring focus-visible:bg-ring" />}
          </th>)}
        </tr>)}</thead>
        <tbody>{loading ? <tr><td colSpan={columnCount} className="px-[var(--rui-content-padding)] py-[var(--rui-empty-padding)] text-center text-muted-foreground"><span role="status">正在加载记录…</span></td></tr> : table.getRowModel().rows.length ? table.getRowModel().rows.map(row => <tr key={row.id} data-selected={row.getIsSelected() || undefined} className="group border-t border-border hover:bg-muted/30 data-selected:bg-muted/60">
          {selectable && <td className={cx('w-[var(--rui-control-height-lg)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]', hasLeftPinned && 'sticky left-0 z-[var(--rui-z-navigation)] border-r border-border bg-background group-hover:bg-muted')}><Checkbox aria-label={`选择记录 ${row.id}`} checked={row.getIsSelected()} onCheckedChange={checked => row.toggleSelected(checked)} /></td>}
          {row.getVisibleCells().map(cell => <td key={cell.id} style={pinnedStyle(cell.column)} className={cx('max-w-sm px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] align-middle', pinnedClass(cell.column, 'body'))}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
        </tr>) : <tr><td colSpan={columnCount} className="px-[var(--rui-content-padding)] py-[var(--rui-empty-padding)] text-center text-muted-foreground">{emptyMessage}{query && <div className="mt-3"><Button variant="outline" size="sm" onClick={() => { updateFilter(''); updatePagination(current => ({ ...current, pageIndex: 0 })); }}>清除筛选</Button></div>}</td></tr>}</tbody>
      </table>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap)] text-xs text-muted-foreground">
      <div className="flex items-center gap-2"><span>每页</span><NativeSelect size="sm" aria-label="每页记录数" value={currentPagination.pageSize} disabled={loading} onChange={event => table.setPageSize(Number(event.target.value))}>{Array.from(new Set([Math.max(1, pageSize), currentPagination.pageSize, 5, 10, 20])).sort((a, b) => a - b).map(size => <NativeSelectOption key={size} value={size}>{size} 条</NativeSelectOption>)}</NativeSelect></div>
      <div className="flex items-center gap-[var(--rui-content-gap)]"><span aria-live="polite">第 {currentPagination.pageIndex + 1} / {resolvedPageCount < 0 ? '?' : Math.max(1, resolvedPageCount)} 页</span><Button variant="outline" size="icon-sm" aria-label="上一页" disabled={!table.getCanPreviousPage() || loading} onClick={() => table.previousPage()}><ChevronLeft aria-hidden="true" /></Button><Button variant="outline" size="icon-sm" aria-label="下一页" disabled={!table.getCanNextPage() || loading} onClick={() => table.nextPage()}><ChevronRight aria-hidden="true" /></Button></div>
    </div>
  </section>;
}
