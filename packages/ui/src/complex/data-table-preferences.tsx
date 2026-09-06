import { useState } from 'react';
import { Download, Save, SlidersHorizontal, Trash2 } from 'lucide-react';
import type { ColumnFiltersState, ColumnOrderState, ColumnPinningState, ColumnSizingState, GroupingState, RowSelectionState, SortingState, VisibilityState } from '@tanstack/react-table';
import { Button } from '../primitives/button.js';
import { Input } from '../primitives/input.js';
import { NativeSelect, NativeSelectOption } from '../primitives/native-select.js';
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from '../primitives/popover.js';

export type DataTableExportScope = 'current-page' | 'filtered' | 'selected' | 'all';
export type DataTableExportFormat = 'csv' | 'json';

export interface DataTableViewState {
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  columnSizing: ColumnSizingState;
  columnPinning: ColumnPinningState;
  grouping: GroupingState;
  pageSize: number;
}

export interface DataTableViewSnapshot {
  schemaVersion: string;
  state: DataTableViewState;
}

export interface DataTableSavedView {
  id: string;
  label: string;
  snapshot: DataTableViewSnapshot;
}

export interface DataTableExportColumn {
  id: string;
  label: string;
}

export interface DataTableExportRequest<TData> {
  scope: DataTableExportScope;
  format: DataTableExportFormat;
  columns: DataTableExportColumn[];
  loadedRows: TData[];
  rowIds: string[];
  requiresHostData: boolean;
  query: DataTableViewState;
  pagination: { pageIndex: number; pageSize: number };
  selection: RowSelectionState;
}

export interface DataTableViewValidation {
  valid: boolean;
  reason?: string;
}

export function createDataTableViewSnapshot(schemaVersion: string, state: DataTableViewState): DataTableViewSnapshot {
  return {
    schemaVersion,
    state: {
      ...state,
      sorting: state.sorting.map(item => ({ ...item })),
      columnFilters: state.columnFilters.map(item => ({ ...item })),
      columnVisibility: { ...state.columnVisibility },
      columnOrder: [...state.columnOrder],
      columnSizing: { ...state.columnSizing },
      columnPinning: { left: [...(state.columnPinning.left ?? [])], right: [...(state.columnPinning.right ?? [])] },
      grouping: [...state.grouping],
    },
  };
}

function object(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function stringArray(value: unknown): value is string[] { return Array.isArray(value) && value.every(item => typeof item === 'string'); }

export function validateDataTableViewSnapshot(value: unknown, schemaVersion: string, columnIds: readonly string[]): DataTableViewValidation {
  if (!object(value) || value.schemaVersion !== schemaVersion || !object(value.state)) return { valid: false, reason: '视图版本已失效' };
  const state = value.state;
  if (!Array.isArray(state.sorting) || !Array.isArray(state.columnFilters) || !object(state.columnVisibility) || !stringArray(state.columnOrder) || !object(state.columnSizing) || !object(state.columnPinning) || !stringArray(state.grouping) || typeof state.globalFilter !== 'string' || typeof state.pageSize !== 'number' || !Number.isFinite(state.pageSize) || state.pageSize < 1) return { valid: false, reason: '视图数据不完整' };
  if (!stringArray(state.columnPinning.left ?? []) || !stringArray(state.columnPinning.right ?? [])) return { valid: false, reason: '固定列数据无效' };
  const referenced = new Set<string>([
    ...state.columnOrder,
    ...state.grouping,
    ...((state.columnPinning.left as string[] | undefined) ?? []),
    ...((state.columnPinning.right as string[] | undefined) ?? []),
    ...Object.keys(state.columnVisibility),
    ...Object.keys(state.columnSizing),
  ]);
  for (const item of state.sorting) if (!object(item) || typeof item.id !== 'string' || typeof item.desc !== 'boolean') return { valid: false, reason: '排序数据无效' }; else referenced.add(item.id);
  for (const item of state.columnFilters) if (!object(item) || typeof item.id !== 'string') return { valid: false, reason: '筛选数据无效' }; else referenced.add(item.id);
  const available = new Set(columnIds);
  const missing = [...referenced].filter(id => !available.has(id));
  return missing.length ? { valid: false, reason: `缺少列：${missing.join('、')}` } : { valid: true };
}

export function DataTablePreferences<TData>({ snapshot, columnIds, savedViews = [], activeViewId, exportScopes, onApplyView, onSaveView, onDeleteView, createExportRequest, onExport, disabled }: {
  snapshot: DataTableViewSnapshot;
  columnIds: string[];
  savedViews?: DataTableSavedView[];
  activeViewId?: string;
  exportScopes: DataTableExportScope[];
  onApplyView: (view: DataTableSavedView) => void;
  onSaveView?: (request: { label: string; snapshot: DataTableViewSnapshot }) => void | Promise<void>;
  onDeleteView?: (view: DataTableSavedView) => void;
  createExportRequest: (scope: DataTableExportScope, format: DataTableExportFormat) => DataTableExportRequest<TData>;
  onExport?: (request: DataTableExportRequest<TData>) => void | Promise<void>;
  disabled?: boolean;
}) {
  const [scope, setScope] = useState<DataTableExportScope>(exportScopes[0] ?? 'current-page');
  const [format, setFormat] = useState<DataTableExportFormat>('csv');
  const [name, setName] = useState('');
  const [pending, setPending] = useState<'export' | 'view'>();
  const [error, setError] = useState<string>();
  async function exportRows() {
    if (!onExport || pending) return;
    setPending('export'); setError(undefined);
    try { await onExport(createExportRequest(scope, format)); }
    catch (reason) { setError(reason instanceof Error && reason.message ? reason.message : '导出请求失败'); }
    finally { setPending(undefined); }
  }
  async function saveView() {
    const label = name.trim();
    if (!label || !onSaveView || pending) return;
    setPending('view'); setError(undefined);
    try { await onSaveView({ label, snapshot }); setName(''); }
    catch (reason) { setError(reason instanceof Error && reason.message ? reason.message : '视图保存失败'); }
    finally { setPending(undefined); }
  }
  return <div className="flex items-center gap-[var(--rui-content-gap-sm)]">
    {onExport && <Popover><PopoverTrigger render={<Button variant="outline" size="sm" disabled={disabled} />}><Download aria-hidden="true" />导出</PopoverTrigger><PopoverContent align="end" className="w-72 max-w-[calc(100vw-var(--rui-space-8))] gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]"><div><PopoverTitle>请求导出</PopoverTitle><PopoverDescription className="text-xs">组件声明范围；文件生成和下载由宿主完成。</PopoverDescription></div><div className="grid grid-cols-2 gap-[var(--rui-content-gap-sm)]"><NativeSelect aria-label="导出范围" size="sm" value={scope} onChange={event => setScope(event.target.value as DataTableExportScope)}>{exportScopes.map(value => <NativeSelectOption key={value} value={value}>{value === 'current-page' ? '当前页' : value === 'filtered' ? '筛选结果' : value === 'selected' ? '已选记录' : '全部数据'}</NativeSelectOption>)}</NativeSelect><NativeSelect aria-label="导出格式" size="sm" value={format} onChange={event => setFormat(event.target.value as DataTableExportFormat)}><NativeSelectOption value="csv">CSV</NativeSelectOption><NativeSelectOption value="json">JSON</NativeSelectOption></NativeSelect></div><Button size="sm" disabled={pending === 'export'} onClick={() => { void exportRows(); }}>{pending === 'export' ? '正在请求…' : '请求导出'}</Button>{error && <p role="alert" className="text-xs text-destructive">{error}</p>}</PopoverContent></Popover>}
    {(savedViews.length > 0 || onSaveView) && <Popover><PopoverTrigger render={<Button variant="outline" size="sm" disabled={disabled} />}><SlidersHorizontal aria-hidden="true" />视图</PopoverTrigger><PopoverContent align="end" className="w-80 max-w-[calc(100vw-var(--rui-space-8))] gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]"><div><PopoverTitle>视图偏好</PopoverTitle><PopoverDescription className="text-xs">保存查询、列布局、分组和每页数量。</PopoverDescription></div>{savedViews.length > 0 && <div className="grid max-h-48 gap-[var(--rui-space-1)] overflow-auto">{savedViews.map(view => { const validation = validateDataTableViewSnapshot(view.snapshot, snapshot.schemaVersion, columnIds); return <div key={view.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[var(--rui-space-1)]"><Button variant={activeViewId === view.id ? 'secondary' : 'ghost'} size="sm" className="min-w-0 justify-start" disabled={!validation.valid} title={validation.reason} onClick={() => onApplyView(view)}><span className="truncate">{view.label}</span>{!validation.valid && <span className="ml-auto text-xs text-muted-foreground">已失效</span>}</Button>{onDeleteView && <Button variant="ghost" size="icon-xs" aria-label={`删除视图 ${view.label}`} onClick={() => onDeleteView(view)}><Trash2 aria-hidden="true" /></Button>}</div>; })}</div>}{onSaveView && <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-[var(--rui-content-gap-sm)] border-t border-border pt-[var(--rui-content-gap)]"><Input aria-label="新视图名称" className="h-[var(--rui-control-height-sm)]" value={name} placeholder="视图名称" onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void saveView(); } }} /><Button size="sm" disabled={!name.trim() || pending === 'view'} onClick={() => { void saveView(); }}><Save aria-hidden="true" />保存</Button></div>}{error && <p role="alert" className="text-xs text-destructive">{error}</p>}</PopoverContent></Popover>}
  </div>;
}
