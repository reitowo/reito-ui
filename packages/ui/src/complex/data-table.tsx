import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type RefCallback } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronDown, ChevronLeft, ChevronRight, LoaderCircle, Pencil, RotateCcw, Search, X } from 'lucide-react';
import {
  flexRender, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
  type Column, type ColumnDef, type ColumnFiltersState, type ColumnOrderState, type ColumnPinningState, type ColumnSizingState, type ExpandedState, type FilterFn, type GroupingState, type PaginationState, type Row, type RowSelectionState, type SortingState, type Updater, type VisibilityState,
} from '@tanstack/react-table';
import { Button } from '../primitives/button.js';
import { Checkbox } from '../primitives/checkbox.js';
import { Input } from '../primitives/input.js';
import { NativeSelect, NativeSelectOption } from '../primitives/native-select.js';
import { DataTableColumnFilterMenu, dataTableColumnFilterFn, isDataTableColumnFilterActive, type DataTableColumnFilterDefinition, type DataTableColumnFiltersState } from './data-table-filter.js';
import { DataTableColumnManager } from './data-table-columns.js';
import { DataTableGroupingMenu, type DataTableGroupingDefinition } from './data-table-grouping.js';
import { DataTableCellEditor, type DataTableEditableColumn, type DataTableEditCommit, type DataTableEditingState, type DataTableEditMode, type DataTableEditValue } from './data-table-editing.js';
import { createDataTableViewSnapshot, DataTablePreferences, validateDataTableViewSnapshot, type DataTableExportRequest, type DataTableExportScope, type DataTableSavedView } from './data-table-preferences.js';
import { DataTableVirtualBody, type DataTableVirtualRowsOptions } from './data-table-virtual.js';
import { cx } from './shared.js';

export { isDataTableColumnFilterActive, matchesDataTableColumnFilter, serializeDataTableColumnFilters } from './data-table-filter.js';
export type { DataTableColumnFilterDefinition, DataTableColumnFilterOption, DataTableColumnFiltersState, DataTableColumnFilterValue, DataTableDateFilterValue, DataTableFilterQueryClause, DataTableNumberFilterValue, DataTableSelectFilterValue, DataTableTextFilterValue } from './data-table-filter.js';
export type { DataTableGroupingDefinition } from './data-table-grouping.js';
export type { DataTableEditableColumn, DataTableEditCommit, DataTableEditingState, DataTableEditMode, DataTableEditOption, DataTableEditorRenderProps, DataTableEditValue } from './data-table-editing.js';
export { createDataTableViewSnapshot, validateDataTableViewSnapshot } from './data-table-preferences.js';
export type { DataTableExportColumn, DataTableExportFormat, DataTableExportRequest, DataTableExportScope, DataTableSavedView, DataTableViewSnapshot, DataTableViewState, DataTableViewValidation } from './data-table-preferences.js';
export type { DataTableVirtualRange, DataTableVirtualRowsOptions } from './data-table-virtual.js';

type DataTableBodyEntry<TData> =
  | { key: string; kind: 'row'; rowId: string; row: Row<TData>; rowIndex: number }
  | { key: string; kind: 'expanded'; rowId: string; row: Row<TData> }
  | { key: string; kind: 'summary'; rowId: string; row: Row<TData> };

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  /** Stable IDs are required so selection survives sorting, filtering and insertion. */
  getRowId: (row: TData, index: number, parent?: Row<TData>) => string;
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
  expanded?: ExpandedState;
  defaultExpanded?: ExpandedState;
  onExpandedChange?: (expanded: ExpandedState) => void;
  getSubRows?: (row: TData, index: number) => TData[] | undefined;
  getRowCanExpand?: (row: Row<TData>) => boolean;
  renderExpandedRow?: (row: Row<TData>) => ReactNode;
  grouping?: GroupingState;
  defaultGrouping?: GroupingState;
  onGroupingChange?: (grouping: GroupingState) => void;
  groupingDefinitions?: DataTableGroupingDefinition[];
  renderGroupHeader?: (row: Row<TData>) => ReactNode;
  renderGroupSummary?: (row: Row<TData>) => ReactNode;
  manualExpanding?: boolean;
  manualGrouping?: boolean;
  filterFromLeafRows?: boolean;
  paginateExpandedRows?: boolean;
  editMode?: DataTableEditMode;
  editableColumns?: DataTableEditableColumn<TData>[];
  editingState?: DataTableEditingState | null;
  defaultEditingState?: DataTableEditingState | null;
  onEditingStateChange?: (state: DataTableEditingState | null) => void;
  onEditCommit?: (change: DataTableEditCommit<TData>) => void | Promise<void>;
  isRowEditable?: (row: Row<TData>) => boolean;
  exportScopes?: DataTableExportScope[];
  onExport?: (request: DataTableExportRequest<TData>) => void | Promise<void>;
  viewVersion?: string;
  savedViews?: DataTableSavedView[];
  activeViewId?: string;
  onActiveViewChange?: (viewId: string) => void;
  onSaveView?: (request: { label: string; snapshot: DataTableSavedView['snapshot'] }) => void | Promise<void>;
  onDeleteView?: (view: DataTableSavedView) => void;
  virtualRows?: DataTableVirtualRowsOptions;
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
  expanded, defaultExpanded = {}, onExpandedChange, getSubRows, getRowCanExpand, renderExpandedRow,
  grouping, defaultGrouping = [], onGroupingChange, groupingDefinitions = [], renderGroupHeader, renderGroupSummary,
  manualExpanding = false, manualGrouping = false, filterFromLeafRows = true, paginateExpandedRows = false,
  editMode = 'row', editableColumns = [], editingState, defaultEditingState = null, onEditingStateChange, onEditCommit, isRowEditable,
  exportScopes = ['current-page', 'filtered', 'selected', 'all'], onExport, viewVersion = '1', savedViews = [], activeViewId, onActiveViewChange, onSaveView, onDeleteView,
  virtualRows,
  pagination, defaultPagination, onPaginationChange, manual = false, rowCount: externalRowCount, pageCount: externalPageCount,
  selectable = true, rowSelection, onRowSelectionChange, loading = false, error, onRetry, emptyMessage = '没有符合条件的记录', className }: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>(defaultSorting);
  const [internalFilter, setInternalFilter] = useState(defaultGlobalFilter);
  const [internalColumnFilters, setInternalColumnFilters] = useState<DataTableColumnFiltersState>(defaultColumnFilters);
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>(defaultColumnVisibility);
  const [internalColumnOrder, setInternalColumnOrder] = useState<ColumnOrderState>(defaultColumnOrder);
  const [internalColumnSizing, setInternalColumnSizing] = useState<ColumnSizingState>(defaultColumnSizing);
  const [internalColumnPinning, setInternalColumnPinning] = useState<ColumnPinningState>(defaultColumnPinning);
  const [internalExpanded, setInternalExpanded] = useState<ExpandedState>(defaultExpanded);
  const [internalGrouping, setInternalGrouping] = useState<GroupingState>(defaultGrouping);
  const [internalPagination, setInternalPagination] = useState<PaginationState>(defaultPagination ?? { pageIndex: 0, pageSize: Math.max(1, pageSize) });
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({});
  const [internalEditing, setInternalEditing] = useState<DataTableEditingState | null>(defaultEditingState);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editSubmissionError, setEditSubmissionError] = useState<string>();
  const [editSubmitting, setEditSubmitting] = useState(false);
  const editOrigins = useRef(new Map<string, HTMLElement>());
  const [tableViewport, setTableViewport] = useState<HTMLDivElement | null>(null);
  const currentSorting = sorting ?? internalSorting;
  const query = globalFilter ?? internalFilter;
  const currentColumnFilters = columnFilters ?? internalColumnFilters;
  const currentColumnVisibility = columnVisibility ?? internalColumnVisibility;
  const currentColumnOrder = columnOrder ?? internalColumnOrder;
  const currentColumnSizing = columnSizing ?? internalColumnSizing;
  const currentColumnPinning = columnPinning ?? internalColumnPinning;
  const currentExpanded = expanded ?? internalExpanded;
  const currentGrouping = grouping ?? internalGrouping;
  const currentPagination = pagination ?? internalPagination;
  const virtualRowsEnabled = Boolean(virtualRows);
  const selection = rowSelection ?? internalSelection;
  const currentEditing = editingState === undefined ? internalEditing : editingState;
  useEffect(() => {
    if (virtualRowsEnabled && tableViewport) tableViewport.scrollTo({ top: 0 });
  }, [currentPagination.pageIndex, currentPagination.pageSize, tableViewport, virtualRowsEnabled]);
  function updateSorting(update: Updater<SortingState>) {
    const next = typeof update === 'function' ? update(currentSorting) : update;
    if (sorting === undefined) setInternalSorting(next);
    onSortingChange?.(next);
    if (currentPagination.pageIndex !== 0) updatePagination(current => ({ ...current, pageIndex: 0 }));
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
  function updateExpanded(update: Updater<ExpandedState>) { const next = typeof update === 'function' ? update(currentExpanded) : update; if (expanded === undefined) setInternalExpanded(next); onExpandedChange?.(next); }
  function updateGrouping(update: Updater<GroupingState>) { const next = typeof update === 'function' ? update(currentGrouping) : update; if (grouping === undefined) setInternalGrouping(next); onGroupingChange?.(next); if (currentPagination.pageIndex !== 0) updatePagination(current => ({ ...current, pageIndex: 0 })); }
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
  function updateGroupSelection(row: Row<TData>, checked: boolean) {
    updateSelection(current => {
      const next = { ...current };
      for (const leaf of row.getLeafRows()) {
        if (checked) next[leaf.id] = true;
        else delete next[leaf.id];
      }
      return next;
    });
  }
  function updateEditing(next: DataTableEditingState | null) {
    if (editingState === undefined) setInternalEditing(next);
    onEditingStateChange?.(next);
  }
  function editKey(rowId: string, columnId?: string) { return `${rowId}:${columnId ?? 'row'}`; }
  function editableValue(row: Row<TData>, id: string): DataTableEditValue {
    const value = row.getValue(id);
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null ? value : value === undefined ? '' : String(value);
  }
  function startEditing(row: Row<TData>, columnId: string | undefined, origin: HTMLElement) {
    if (editSubmitting || currentEditing || row.getIsGrouped() || isRowEditable?.(row) === false) return;
    editOrigins.current.set(editKey(row.id, columnId), origin);
    updateEditing({ rowId: row.id, columnId, values: Object.fromEntries(editableColumns.map(definition => [definition.id, editableValue(row, definition.id)])) });
    setEditErrors({});
    setEditSubmissionError(undefined);
  }
  function restoreEditOrigin(state: DataTableEditingState) {
    requestAnimationFrame(() => {
      const origin = editOrigins.current.get(editKey(state.rowId, state.columnId));
      if (origin?.isConnected) { origin.focus(); return; }
      document.querySelector<HTMLElement>(`tr[data-row-id="${CSS.escape(state.rowId)}"] button[aria-label^="编辑记录 "]`)?.focus();
    });
  }
  function cancelEditing() {
    const state = currentEditing;
    updateEditing(null);
    setEditErrors({});
    setEditSubmissionError(undefined);
    if (state) restoreEditOrigin(state);
  }
  function changeDraft(columnId: string, value: DataTableEditValue) {
    if (!currentEditing) return;
    updateEditing({ ...currentEditing, values: { ...currentEditing.values, [columnId]: value } });
    setEditErrors(current => { const next = { ...current }; delete next[columnId]; return next; });
    setEditSubmissionError(undefined);
  }
  async function commitEditing() {
    if (!currentEditing || editSubmitting) return;
    const row = table.getRow(currentEditing.rowId);
    if (!row) { setEditSubmissionError('记录已不在当前数据中，草稿尚未保存。'); return; }
    const activeDefinitions = editMode === 'cell' ? editableColumns.filter(definition => definition.id === currentEditing.columnId) : editableColumns;
    const errors: Record<string, string> = {};
    for (const definition of activeDefinitions) {
      const value = currentEditing.values[definition.id];
      if (definition.required && (value === '' || value === null)) errors[definition.id] = `${definition.label}不能为空`;
      else {
        const problem = definition.validate?.(value, row.original, currentEditing.values);
        if (problem) errors[definition.id] = problem;
      }
    }
    if (Object.keys(errors).length) { setEditErrors(errors); requestAnimationFrame(() => document.querySelector<HTMLElement>(`[aria-describedby="data-table-edit-${CSS.escape(row.id)}-${CSS.escape(Object.keys(errors)[0])}-error"]`)?.focus()); return; }
    if (!onEditCommit) { setEditSubmissionError('未配置 onEditCommit，草稿尚未保存。'); return; }
    const changedValues = Object.fromEntries(activeDefinitions.filter(definition => !Object.is(currentEditing.values[definition.id], editableValue(row, definition.id))).map(definition => [definition.id, currentEditing.values[definition.id]]));
    setEditSubmitting(true);
    setEditSubmissionError(undefined);
    try {
      await onEditCommit({ mode: editMode, rowId: row.id, row: row.original, values: { ...currentEditing.values }, changedValues });
      const state = currentEditing;
      updateEditing(null);
      restoreEditOrigin(state);
    } catch (reason) {
      setEditSubmissionError(reason instanceof Error && reason.message ? reason.message : '保存失败，草稿已保留。');
    } finally { setEditSubmitting(false); }
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
    state: { sorting: currentSorting, globalFilter: query, columnFilters: currentColumnFilters, columnVisibility: currentColumnVisibility, columnOrder: currentColumnOrder, columnSizing: currentColumnSizing, columnPinning: currentColumnPinning, expanded: currentExpanded, grouping: currentGrouping, pagination: currentPagination, rowSelection: selection },
    onSortingChange: updateSorting, onPaginationChange: updatePagination, onRowSelectionChange: updateSelection,
    onGlobalFilterChange: updateFilter, onColumnFiltersChange: updateColumnFilters, enableRowSelection: selectable, globalFilterFn: 'includesString',
    onColumnVisibilityChange: updateColumnVisibility, onColumnOrderChange: updateColumnOrder, onColumnSizingChange: updateColumnSizing, onColumnPinningChange: updateColumnPinning,
    onExpandedChange: updateExpanded, onGroupingChange: updateGrouping, getSubRows,
    getRowCanExpand: row => getRowCanExpand?.(row) ?? Boolean(row.subRows.length || renderExpandedRow),
    manualExpanding, manualGrouping, filterFromLeafRows, paginateExpandedRows, groupedColumnMode: false,
    enableColumnResizing: resizableColumns, columnResizeMode: 'onChange',
    manualSorting: manual, manualFiltering: manual, manualPagination: manual, rowCount: manual ? externalRowCount ?? data.length : undefined,
    pageCount: manual ? externalPageCount : undefined, autoResetPageIndex: manual || pagination !== undefined ? false : undefined,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getGroupedRowModel: getGroupedRowModel(), getSortedRowModel: getSortedRowModel(), getExpandedRowModel: getExpandedRowModel(), getPaginationRowModel: getPaginationRowModel(),
  });
  const resolvedRowCount = manual ? externalRowCount ?? data.length : table.getFilteredRowModel().rows.length;
  const selectedCount = Object.values(selection).filter(Boolean).length;
  const activeColumnFilterCount = currentColumnFilters.filter(filter => isDataTableColumnFilterActive(filter.value)).length;
  const resolvedPageCount = table.getPageCount();
  const headerGroups = table.getHeaderGroups();
  const visibleRows = table.getRowModel().rows;
  function closingGroupsAfter(row: Row<TData>, rowIndex: number) {
    const nextDepth = visibleRows[rowIndex + 1]?.depth ?? -1;
    return renderGroupSummary ? [...row.getParentRows(), ...(row.getIsGrouped() ? [row] : [])].reverse().filter(group => group.getIsGrouped() && nextDepth <= group.depth) : [];
  }
  const virtualEntries: DataTableBodyEntry<TData>[] = virtualRows ? visibleRows.flatMap((row, rowIndex) => [
    { key: `row:${row.id}`, kind: 'row' as const, rowId: row.id, row, rowIndex },
    ...(!row.getIsGrouped() && row.getIsExpanded() && renderExpandedRow ? [{ key: `expanded:${row.id}`, kind: 'expanded' as const, rowId: row.id, row }] : []),
    ...closingGroupsAfter(row, rowIndex).map(group => ({ key: `summary:${group.id}`, kind: 'summary' as const, rowId: group.id, row: group })),
  ]) : [];
  const editingEnabled = editableColumns.length > 0;
  const columnCount = table.getVisibleLeafColumns().length + Number(selectable) + Number(editingEnabled && editMode === 'row');
  const hasLeftPinned = table.getLeftVisibleLeafColumns().length > 0;
  const hasRightPinned = table.getRightVisibleLeafColumns().length > 0;
  function pinnedStyle(column: Column<TData, unknown>) {
    const pinned = column.getIsPinned();
    return { width: column.getSize(), left: pinned === 'left' ? `calc(${column.getStart('left')}px + ${selectable ? 'var(--rui-control-height-lg)' : '0px'})` : undefined, right: pinned === 'right' ? `calc(${column.getAfter('right')}px + ${editingEnabled && editMode === 'row' ? 'var(--rui-control-height-lg)' : '0px'})` : undefined };
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
  const viewSnapshot = createDataTableViewSnapshot(viewVersion, { sorting: currentSorting, globalFilter: query, columnFilters: currentColumnFilters, columnVisibility: currentColumnVisibility, columnOrder: currentColumnOrder, columnSizing: currentColumnSizing, columnPinning: currentColumnPinning, grouping: currentGrouping, pageSize: currentPagination.pageSize });
  function applyView(view: DataTableSavedView) {
    if (!validateDataTableViewSnapshot(view.snapshot, viewVersion, table.getAllLeafColumns().map(column => column.id)).valid) return;
    const state = view.snapshot.state;
    updateSorting(state.sorting); updateFilter(state.globalFilter); updateColumnFilters(state.columnFilters); updateColumnVisibility(state.columnVisibility); updateColumnOrder(state.columnOrder); updateColumnSizing(state.columnSizing); updateColumnPinning(state.columnPinning); updateGrouping(state.grouping); updatePagination({ pageIndex: 0, pageSize: state.pageSize });
    onActiveViewChange?.(view.id);
  }
  function createExportRequest(scope: DataTableExportScope, format: 'csv' | 'json'): DataTableExportRequest<TData> {
    const loaded = table.getCoreRowModel().flatRows.filter(row => !row.getIsGrouped());
    const loadedIds = new Set(loaded.map(row => row.id));
    const rows = scope === 'current-page' ? visibleRows.filter(row => !row.getIsGrouped()) : scope === 'filtered' ? table.getFilteredRowModel().flatRows.filter(row => !row.getIsGrouped()) : scope === 'selected' ? loaded.filter(row => selection[row.id]) : loaded;
    const unique = [...new Map(rows.map(row => [row.id, row])).values()];
    const rowIds = scope === 'selected' ? Object.keys(selection).filter(id => selection[id]) : unique.map(row => row.id);
    return { scope, format, columns: table.getVisibleLeafColumns().map(column => ({ id: column.id, label: columnLabels[column.id] ?? (typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id) })), loadedRows: unique.map(row => row.original), rowIds, requiresHostData: scope === 'selected' && rowIds.some(id => !loadedIds.has(id)) || manual && (scope === 'filtered' || scope === 'all'), query: viewSnapshot.state, pagination: { ...currentPagination }, selection: { ...selection } };
  }
  function renderVirtualEntry(entry: DataTableBodyEntry<TData>, index: number, virtual: { ref: RefCallback<Element>; style: CSSProperties; ariaRowIndex: number }) {
    if (entry.kind === 'expanded') return <tr key={entry.key} ref={virtual.ref} data-index={index} data-expanded-row={entry.row.id} aria-rowindex={virtual.ariaRowIndex} style={virtual.style} className="flex border-t border-border bg-muted/10"><td colSpan={columnCount} style={{ width: '100%' }} className="px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]">{renderExpandedRow?.(entry.row)}</td></tr>;
    if (entry.kind === 'summary') return <tr key={entry.key} ref={virtual.ref} data-index={index} data-group-summary={entry.row.id} aria-rowindex={virtual.ariaRowIndex} style={virtual.style} className="flex border-t border-border bg-muted/10"><td colSpan={columnCount} style={{ width: '100%' }} className="px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-xs text-muted-foreground">{renderGroupSummary?.(entry.row)}</td></tr>;
    const row = entry.row;
    const grouped = row.getIsGrouped();
    return <tr key={entry.key} ref={virtual.ref} data-index={index} aria-rowindex={virtual.ariaRowIndex} data-row-id={row.id} data-grouped={grouped || undefined} data-selected={row.getIsSelected() || undefined} style={virtual.style} className={cx('group flex border-t border-border hover:bg-muted/30 data-selected:bg-muted/60', grouped && 'bg-muted/20 font-medium')}>
      {selectable && <td style={{ width: 'var(--rui-control-height-lg)', flexShrink: 0 }} className={cx('w-[var(--rui-control-height-lg)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]', hasLeftPinned && 'sticky left-0 z-[var(--rui-z-navigation)] border-r border-border bg-background group-hover:bg-muted')}><Checkbox aria-label={`${grouped ? '选择分组' : '选择记录'} ${row.id}`} checked={grouped ? row.getIsAllSubRowsSelected() : row.getIsSelected()} indeterminate={row.getIsSomeSelected()} onCheckedChange={checked => grouped ? updateGroupSelection(row, checked) : row.toggleSelected(checked)} /></td>}
      {row.getVisibleCells().map((cell, cellIndex) => { const expanderCell = grouped ? cell.getIsGrouped() : cellIndex === 0; const editor = editableColumns.find(definition => definition.id === cell.column.id); const editingCell = !grouped && editor && currentEditing?.rowId === row.id && (editMode === 'row' || currentEditing.columnId === cell.column.id); const errorId = `data-table-edit-${row.id}-${cell.column.id}-error`; const cellCanStart = editMode === 'cell' && editor && !grouped && !currentEditing && isRowEditable?.(row) !== false; return <td key={cell.id} data-editable={editor && !grouped || undefined} tabIndex={cellCanStart ? 0 : undefined} aria-label={cellCanStart ? `编辑${editor.label}，${String(cell.getValue() ?? '')}` : undefined} onDoubleClick={event => { if (cellCanStart) startEditing(row, cell.column.id, event.currentTarget); }} onKeyDown={event => { if (event.key === 'Enter' && cellCanStart) { event.preventDefault(); startEditing(row, cell.column.id, event.currentTarget); } }} style={{ ...pinnedStyle(cell.column), width: cell.column.getSize(), flexShrink: 0 }} className={cx('max-w-sm px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] align-middle', pinnedClass(cell.column, 'body'), cellCanStart && 'cursor-text outline-none focus-visible:ring-inset focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/50')}>
        {editingCell ? <div className="grid min-w-[var(--rui-control-height-lg)] gap-[var(--rui-space-1)]"><DataTableCellEditor definition={editor} row={row} value={currentEditing.values[editor.id] ?? ''} onChange={value => changeDraft(editor.id, value)} onCommit={() => { void commitEditing(); }} onCancel={cancelEditing} disabled={editSubmitting} error={editErrors[editor.id]} errorId={errorId} autoFocus={editMode === 'cell' || editableColumns[0]?.id === editor.id} mode={editMode} />{editErrors[editor.id] && <span id={errorId} role="alert" className="text-xs font-normal text-destructive">{editErrors[editor.id]}</span>}{editMode === 'cell' && <div className="flex justify-end gap-[var(--rui-space-1)]"><Button variant="ghost" size="icon-xs" aria-label={`取消编辑${editor.label}`} disabled={editSubmitting} onClick={cancelEditing}><X aria-hidden="true" /></Button><Button variant="ghost" size="icon-xs" aria-label={`保存${editor.label}`} disabled={editSubmitting} onClick={() => { void commitEditing(); }}>{editSubmitting ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <Check aria-hidden="true" />}</Button></div>}</div> : <div className={cx('flex min-w-0 items-center gap-1.5', expanderCell && 'whitespace-nowrap')} style={expanderCell && row.depth > 0 ? { paddingInlineStart: `calc(var(--rui-space-3) * ${row.depth})` } : undefined}>{expanderCell && row.getCanExpand() && <Button variant="ghost" size="icon-xs" className="size-[var(--rui-table-expander-size)]" aria-label={`${row.getIsExpanded() ? '折叠' : '展开'}${grouped ? '分组' : '记录'} ${row.id}`} aria-expanded={row.getIsExpanded()} onClick={row.getToggleExpandedHandler()}><ChevronDown aria-hidden="true" className={cx('transition-transform', !row.getIsExpanded() && '-rotate-90')} /></Button>}{cell.getIsGrouped() ? renderGroupHeader?.(row) ?? <span>{String(cell.getValue())} <span className="font-normal text-muted-foreground">({row.subRows.length})</span></span> : cell.getIsAggregated() ? flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext()) : cell.getIsPlaceholder() ? null : flexRender(cell.column.columnDef.cell, cell.getContext())}</div>}
      </td>; })}
      {editingEnabled && editMode === 'row' && <td style={{ width: 'var(--rui-control-height-lg)', flexShrink: 0 }} className={cx('px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-right', hasRightPinned && 'sticky right-0 z-[var(--rui-z-navigation)] border-l border-border bg-background group-hover:bg-muted')}>{!grouped && (currentEditing?.rowId === row.id ? <div className="flex justify-end gap-[var(--rui-space-1)]"><Button variant="ghost" size="icon-xs" aria-label={`取消编辑记录 ${row.id}`} disabled={editSubmitting} onClick={cancelEditing}><X aria-hidden="true" /></Button><Button variant="ghost" size="icon-xs" aria-label={`保存记录 ${row.id}`} disabled={editSubmitting} onClick={() => { void commitEditing(); }}>{editSubmitting ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <Check aria-hidden="true" />}</Button></div> : <Button variant="ghost" size="icon-xs" aria-label={`编辑记录 ${row.id}`} disabled={editSubmitting || Boolean(currentEditing) || isRowEditable?.(row) === false} onClick={event => startEditing(row, undefined, event.currentTarget)}><Pencil aria-hidden="true" /></Button>)}</td>}
    </tr>;
  }
  return <section data-slot="data-table" aria-label={caption} aria-busy={loading} className={cx('min-w-0 space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap)]">
      <div className="relative w-full max-w-xs"><Search aria-hidden="true" className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-2.5 size-4 text-muted-foreground" /><Input aria-label={`筛选${caption}`} placeholder={searchPlaceholder} className="pl-9" disabled={loading} value={query} onChange={event => { updateFilter(event.target.value); updatePagination(current => ({ ...current, pageIndex: 0 })); }} /></div>
      <div className="flex flex-wrap items-center justify-end gap-[var(--rui-content-gap)]"><span className="text-xs text-muted-foreground">共 {resolvedRowCount} 条{selectable && ` · 已选 ${selectedCount} 条`}{activeColumnFilterCount > 0 && ` · ${activeColumnFilterCount} 个列筛选`}{currentGrouping.length > 0 && ` · ${currentGrouping.length} 层分组`}</span>{activeColumnFilterCount > 0 && <Button variant="ghost" size="xs" disabled={loading} onClick={() => updateColumnFilters([])}>清除列筛选</Button>}{groupingDefinitions.length > 0 && <DataTableGroupingMenu table={table} definitions={groupingDefinitions} disabled={loading} />}{manageColumns && <DataTableColumnManager table={table} labels={columnLabels} disabled={loading} />}{(onExport || savedViews.length > 0 || onSaveView) && <DataTablePreferences snapshot={viewSnapshot} columnIds={table.getAllLeafColumns().map(column => column.id)} savedViews={savedViews} activeViewId={activeViewId} exportScopes={exportScopes} onApplyView={applyView} onSaveView={onSaveView} onDeleteView={onDeleteView} createExportRequest={createExportRequest} onExport={onExport} disabled={loading} />}</div>
    </div>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap)] rounded-lg border border-destructive/30 bg-destructive/5 p-[var(--rui-content-padding)] text-destructive"><span>{error}</span>{onRetry && <Button variant="outline" size="sm" onClick={onRetry}>重试</Button>}</div>}
    <div ref={setTableViewport} role="region" aria-label="表格滚动区域" tabIndex={0} className="overflow-auto rounded-lg border border-border outline-none focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring" style={virtualRows ? { maxHeight: virtualRows.viewportHeight ?? 'var(--rui-container-xl)' } : undefined}>
      <table className={cx('w-full min-w-full border-collapse text-left text-sm', virtualRows && 'grid')} style={{ width: virtualRows ? `calc(${table.getTotalSize()}px + var(--rui-control-height-lg) * ${Number(selectable) + Number(editingEnabled && editMode === 'row')})` : table.getTotalSize() }}>
        <caption className="sr-only">{caption}</caption>
        <thead className={cx('bg-muted/40 text-muted-foreground', virtualRows && 'sticky top-0 z-[var(--rui-z-navigation)] grid bg-muted')}>{headerGroups.map((group, groupIndex) => <tr key={group.id} className={cx(virtualRows && 'flex w-full')}>
          {selectable && groupIndex === 0 && <th scope="col" rowSpan={headerGroups.length} style={virtualRows ? { width: 'var(--rui-control-height-lg)', flexShrink: 0 } : undefined} className={cx('w-[var(--rui-control-height-lg)] px-[var(--rui-cell-padding-x)] py-[var(--rui-table-head-padding-y)]', hasLeftPinned && 'sticky left-0 z-[var(--rui-z-navigation)] border-r border-border bg-muted')}><Checkbox aria-label="选择当前页全部记录" checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected()} disabled={loading || !data.length} onCheckedChange={checked => table.toggleAllPageRowsSelected(checked)} /></th>}
          {virtualRows && selectable && groupIndex > 0 && <th aria-hidden="true" style={{ width: 'var(--rui-control-height-lg)', flexShrink: 0 }} className="w-[var(--rui-control-height-lg)]" />}
          {group.headers.map(header => <th scope="col" key={header.id} colSpan={header.colSpan} aria-sort={header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : undefined} style={{ ...pinnedStyle(header.column), ...(virtualRows ? { width: header.getSize(), flexShrink: 0 } : {}) }} className={cx('relative whitespace-nowrap px-[var(--rui-cell-padding-x)] py-[var(--rui-table-head-padding-y)] font-medium', pinnedClass(header.column, 'head'))}>
            {header.isPlaceholder ? null : <div className="flex items-center gap-0.5">{header.column.getCanSort() ? <Button variant="ghost" size="sm" className="-ml-2" onClick={header.column.getToggleSortingHandler()} disabled={loading}>{flexRender(header.column.columnDef.header, header.getContext())}{header.column.getIsSorted() === 'asc' ? <ArrowUp aria-hidden="true" /> : header.column.getIsSorted() === 'desc' ? <ArrowDown aria-hidden="true" /> : <ArrowUpDown aria-hidden="true" className="text-muted-foreground" />}</Button> : flexRender(header.column.columnDef.header, header.getContext())}{definitionById.get(header.column.id) && <DataTableColumnFilterMenu column={header.column} definition={definitionById.get(header.column.id)!} disabled={loading} />}</div>}
            {header.column.getCanResize() && !header.isPlaceholder && <div role="separator" aria-label={`调整${columnLabels[header.column.id] ?? header.column.id}列宽`} aria-orientation="vertical" aria-valuemin={header.column.columnDef.minSize ?? 20} aria-valuemax={header.column.columnDef.maxSize ?? 1000} aria-valuenow={Math.round(header.column.getSize())} tabIndex={0} onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()} onDoubleClick={() => header.column.resetSize()} onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); resizeColumn(header.column, event.key === 'ArrowLeft' ? -16 : 16); } }} className="absolute inset-y-0 right-0 w-1 cursor-col-resize touch-none outline-none hover:bg-ring focus-visible:bg-ring" />}
          </th>)}
          {editingEnabled && editMode === 'row' && groupIndex === 0 && <th scope="col" rowSpan={headerGroups.length} style={virtualRows ? { width: 'var(--rui-control-height-lg)', flexShrink: 0 } : undefined} className={cx('w-[var(--rui-control-height-lg)] px-[var(--rui-cell-padding-x)] py-[var(--rui-table-head-padding-y)] text-right font-medium', hasRightPinned && 'sticky right-0 z-[var(--rui-z-navigation)] border-l border-border bg-muted')}>编辑</th>}
          {virtualRows && editingEnabled && editMode === 'row' && groupIndex > 0 && <th aria-hidden="true" style={{ width: 'var(--rui-control-height-lg)', flexShrink: 0 }} className="w-[var(--rui-control-height-lg)]" />}
        </tr>)}</thead>
        {virtualRows && !loading && visibleRows.length ? <DataTableVirtualBody entries={virtualEntries} scrollElement={tableViewport} options={virtualRows} renderEntry={renderVirtualEntry} /> : <tbody>{loading ? <tr><td colSpan={columnCount} className="px-[var(--rui-content-padding)] py-[var(--rui-empty-padding)] text-center text-muted-foreground"><span role="status">正在加载记录…</span></td></tr> : visibleRows.length ? visibleRows.map((row, rowIndex) => {
          const grouped = row.getIsGrouped();
          const nextDepth = visibleRows[rowIndex + 1]?.depth ?? -1;
          const closingGroups = renderGroupSummary ? [...row.getParentRows(), ...(grouped ? [row] : [])].reverse().filter(group => group.getIsGrouped() && nextDepth <= group.depth) : [];
          return <Fragment key={row.id}><tr data-row-id={row.id} data-grouped={grouped || undefined} data-selected={row.getIsSelected() || undefined} className={cx('group border-t border-border hover:bg-muted/30 data-selected:bg-muted/60', grouped && 'bg-muted/20 font-medium')}>
            {selectable && <td className={cx('w-[var(--rui-control-height-lg)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]', hasLeftPinned && 'sticky left-0 z-[var(--rui-z-navigation)] border-r border-border bg-background group-hover:bg-muted')}><Checkbox aria-label={`${grouped ? '选择分组' : '选择记录'} ${row.id}`} checked={grouped ? row.getIsAllSubRowsSelected() : row.getIsSelected()} indeterminate={row.getIsSomeSelected()} onCheckedChange={checked => grouped ? updateGroupSelection(row, checked) : row.toggleSelected(checked)} /></td>}
            {row.getVisibleCells().map((cell, cellIndex) => { const expanderCell = grouped ? cell.getIsGrouped() : cellIndex === 0; const editor = editableColumns.find(definition => definition.id === cell.column.id); const editingCell = !grouped && editor && currentEditing?.rowId === row.id && (editMode === 'row' || currentEditing.columnId === cell.column.id); const errorId = `data-table-edit-${row.id}-${cell.column.id}-error`; const cellCanStart = editMode === 'cell' && editor && !grouped && !currentEditing && isRowEditable?.(row) !== false; return <td key={cell.id} data-editable={editor && !grouped || undefined} tabIndex={cellCanStart ? 0 : undefined} aria-label={cellCanStart ? `编辑${editor.label}，${String(cell.getValue() ?? '')}` : undefined} onDoubleClick={event => { if (cellCanStart) startEditing(row, cell.column.id, event.currentTarget); }} onKeyDown={event => { if (event.key === 'Enter' && cellCanStart) { event.preventDefault(); startEditing(row, cell.column.id, event.currentTarget); } }} style={pinnedStyle(cell.column)} className={cx('max-w-sm px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] align-middle', pinnedClass(cell.column, 'body'), cellCanStart && 'cursor-text outline-none focus-visible:ring-inset focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/50')}>
              {editingCell ? <div className="grid min-w-[var(--rui-control-height-lg)] gap-[var(--rui-space-1)]"><DataTableCellEditor definition={editor} row={row} value={currentEditing.values[editor.id] ?? ''} onChange={value => changeDraft(editor.id, value)} onCommit={() => { void commitEditing(); }} onCancel={cancelEditing} disabled={editSubmitting} error={editErrors[editor.id]} errorId={errorId} autoFocus={editMode === 'cell' || editableColumns[0]?.id === editor.id} mode={editMode} />{editErrors[editor.id] && <span id={errorId} role="alert" className="text-xs font-normal text-destructive">{editErrors[editor.id]}</span>}{editMode === 'cell' && <div className="flex justify-end gap-[var(--rui-space-1)]"><Button variant="ghost" size="icon-xs" aria-label={`取消编辑${editor.label}`} disabled={editSubmitting} onClick={cancelEditing}><X aria-hidden="true" /></Button><Button variant="ghost" size="icon-xs" aria-label={`保存${editor.label}`} disabled={editSubmitting} onClick={() => { void commitEditing(); }}>{editSubmitting ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <Check aria-hidden="true" />}</Button></div>}</div> : <div className={cx('flex min-w-0 items-center gap-1.5', expanderCell && 'whitespace-nowrap')} style={expanderCell && row.depth > 0 ? { paddingInlineStart: `calc(var(--rui-space-3) * ${row.depth})` } : undefined}>{expanderCell && row.getCanExpand() && <Button variant="ghost" size="icon-xs" className="size-[var(--rui-table-expander-size)]" aria-label={`${row.getIsExpanded() ? '折叠' : '展开'}${grouped ? '分组' : '记录'} ${row.id}`} aria-expanded={row.getIsExpanded()} onClick={row.getToggleExpandedHandler()}><ChevronDown aria-hidden="true" className={cx('transition-transform', !row.getIsExpanded() && '-rotate-90')} /></Button>}{cell.getIsGrouped() ? renderGroupHeader?.(row) ?? <span>{String(cell.getValue())} <span className="font-normal text-muted-foreground">({row.subRows.length})</span></span> : cell.getIsAggregated() ? flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext()) : cell.getIsPlaceholder() ? null : flexRender(cell.column.columnDef.cell, cell.getContext())}</div>}
            </td>; })}
            {editingEnabled && editMode === 'row' && <td className={cx('px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-right', hasRightPinned && 'sticky right-0 z-[var(--rui-z-navigation)] border-l border-border bg-background group-hover:bg-muted')}>{!grouped && (currentEditing?.rowId === row.id ? <div className="flex justify-end gap-[var(--rui-space-1)]"><Button variant="ghost" size="icon-xs" aria-label={`取消编辑记录 ${row.id}`} disabled={editSubmitting} onClick={cancelEditing}><X aria-hidden="true" /></Button><Button variant="ghost" size="icon-xs" aria-label={`保存记录 ${row.id}`} disabled={editSubmitting} onClick={() => { void commitEditing(); }}>{editSubmitting ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <Check aria-hidden="true" />}</Button></div> : <Button variant="ghost" size="icon-xs" aria-label={`编辑记录 ${row.id}`} disabled={editSubmitting || Boolean(currentEditing) || isRowEditable?.(row) === false} onClick={event => startEditing(row, undefined, event.currentTarget)}><Pencil aria-hidden="true" /></Button>)}</td>}
          </tr>{!grouped && row.getIsExpanded() && renderExpandedRow && <tr data-expanded-row={row.id} className="border-t border-border bg-muted/10"><td colSpan={columnCount} className="px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]">{renderExpandedRow(row)}</td></tr>}{closingGroups.map(group => <tr key={`summary-${group.id}`} data-group-summary={group.id} className="border-t border-border bg-muted/10"><td colSpan={columnCount} className="px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-xs text-muted-foreground">{renderGroupSummary?.(group)}</td></tr>)}</Fragment>;
        }) : <tr><td colSpan={columnCount} className="px-[var(--rui-content-padding)] py-[var(--rui-empty-padding)] text-center text-muted-foreground">{emptyMessage}{query && <div className="mt-3"><Button variant="outline" size="sm" onClick={() => { updateFilter(''); updatePagination(current => ({ ...current, pageIndex: 0 })); }}>清除筛选</Button></div>}</td></tr>}</tbody>}
      </table>
    </div>
    {editSubmissionError && <div role="alert" className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)] rounded-md border border-destructive/30 bg-destructive/5 px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)] text-sm text-destructive"><span>{editSubmissionError}</span><Button variant="outline" size="sm" disabled={editSubmitting} onClick={() => { void commitEditing(); }}><RotateCcw aria-hidden="true" />重试保存</Button></div>}
    <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap)] text-xs text-muted-foreground">
      <div className="flex items-center gap-2"><span>每页</span><NativeSelect size="sm" aria-label="每页记录数" value={currentPagination.pageSize} disabled={loading} onChange={event => table.setPageSize(Number(event.target.value))}>{Array.from(new Set([Math.max(1, pageSize), currentPagination.pageSize, 5, 10, 20])).sort((a, b) => a - b).map(size => <NativeSelectOption key={size} value={size}>{size} 条</NativeSelectOption>)}</NativeSelect></div>
      <div className="flex items-center gap-[var(--rui-content-gap)]"><span aria-live="polite">第 {currentPagination.pageIndex + 1} / {resolvedPageCount < 0 ? '?' : Math.max(1, resolvedPageCount)} 页</span><Button variant="outline" size="icon-sm" aria-label="上一页" disabled={!table.getCanPreviousPage() || loading} onClick={() => table.previousPage()}><ChevronLeft aria-hidden="true" /></Button><Button variant="outline" size="icon-sm" aria-label="下一页" disabled={!table.getCanNextPage() || loading} onClick={() => table.nextPage()}><ChevronRight aria-hidden="true" /></Button></div>
    </div>
  </section>;
}
