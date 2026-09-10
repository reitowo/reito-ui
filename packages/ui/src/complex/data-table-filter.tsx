import { useEffect, useState, type ComponentProps } from 'react';
import { ListFilter } from 'lucide-react';
import type { Column, FilterFn } from '@tanstack/react-table';
import { Button } from '../primitives/button.js';
import { Checkbox } from '../primitives/checkbox.js';
import { Input } from '../primitives/input.js';
import { SelectInput } from "../basic/select-input.js";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '../primitives/popover.js';

export type DataTableTextFilterValue = { kind: 'text'; operator: 'contains' | 'equals' | 'startsWith'; value: string };
export type DataTableNumberFilterValue = { kind: 'number'; operator: 'between' | 'equals' | 'atLeast' | 'atMost'; value?: number; valueTo?: number };
export type DataTableDateFilterValue = { kind: 'date'; operator: 'between' | 'on' | 'onOrAfter' | 'onOrBefore'; value?: string; valueTo?: string };
export type DataTableSelectFilterValue = { kind: 'select'; operator: 'in'; values: string[] };
export type DataTableColumnFilterValue = DataTableTextFilterValue | DataTableNumberFilterValue | DataTableDateFilterValue | DataTableSelectFilterValue;
export type DataTableColumnFiltersState = Array<{ id: string; value: DataTableColumnFilterValue }>;

export interface DataTableColumnFilterOption { value: string; label: string; }
export interface DataTableColumnFilterDefinition {
  id: string;
  label: string;
  kind: DataTableColumnFilterValue['kind'];
  placeholder?: string;
  options?: DataTableColumnFilterOption[];
}

export interface DataTableFilterQueryClause {
  field: string;
  kind: DataTableColumnFilterValue['kind'];
  operator: DataTableColumnFilterValue['operator'];
  value?: string | number;
  valueTo?: string | number;
  values?: string[];
}

function emptyValue(definition: DataTableColumnFilterDefinition): DataTableColumnFilterValue {
  if (definition.kind === 'number') return { kind: 'number', operator: 'between' };
  if (definition.kind === 'date') return { kind: 'date', operator: 'between' };
  if (definition.kind === 'select') return { kind: 'select', operator: 'in', values: [] };
  return { kind: 'text', operator: 'contains', value: '' };
}

export function isDataTableColumnFilterActive(value: unknown): value is DataTableColumnFilterValue {
  if (!value || typeof value !== 'object' || !('kind' in value)) return false;
  const filter = value as DataTableColumnFilterValue;
  if (filter.kind === 'text') return Boolean(filter.value.trim());
  if (filter.kind === 'select') return filter.values.length > 0;
  if (filter.kind === 'number') return filter.operator === 'between' ? isFiniteNumber(filter.value) || isFiniteNumber(filter.valueTo) : isFiniteNumber(filter.value);
  if (filter.kind === 'date') return filter.operator === 'between' ? isDateOnly(filter.value) || isDateOnly(filter.valueTo) : isDateOnly(filter.value);
  return false;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function comparableDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  const text = String(value ?? '');
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : '';
}

export function matchesDataTableColumnFilter(cellValue: unknown, filter: DataTableColumnFilterValue) {
  if (filter.kind === 'text') {
    const source = String(cellValue ?? '').toLocaleLowerCase();
    const query = filter.value.trim().toLocaleLowerCase();
    if (!query) return true;
    if (filter.operator === 'equals') return source === query;
    if (filter.operator === 'startsWith') return source.startsWith(query);
    return source.includes(query);
  }
  if (filter.kind === 'select') return !filter.values.length || filter.values.includes(String(cellValue ?? ''));
  if (filter.kind === 'number') {
    const source = Number(cellValue);
    if (!Number.isFinite(source)) return false;
    if (filter.operator === 'equals') return filter.value === undefined || source === filter.value;
    if (filter.operator === 'atLeast') return filter.value === undefined || source >= filter.value;
    if (filter.operator === 'atMost') return filter.value === undefined || source <= filter.value;
    return (filter.value === undefined || source >= filter.value) && (filter.valueTo === undefined || source <= filter.valueTo);
  }
  const source = comparableDate(cellValue);
  if (!source) return false;
  if (filter.operator === 'on') return !filter.value || source === filter.value;
  if (filter.operator === 'onOrAfter') return !filter.value || source >= filter.value;
  if (filter.operator === 'onOrBefore') return !filter.value || source <= filter.value;
  return (!filter.value || source >= filter.value) && (!filter.valueTo || source <= filter.valueTo);
}

export const dataTableColumnFilterFn: FilterFn<unknown> = (row, columnId, value) => !isDataTableColumnFilterActive(value) || matchesDataTableColumnFilter(row.getValue(columnId), value);
dataTableColumnFilterFn.autoRemove = value => !isDataTableColumnFilterActive(value);

/** Produces deterministic JSON clauses for a request/cache key; transport and server parsing stay with the host. */
export function serializeDataTableColumnFilters(filters: DataTableColumnFiltersState) {
  const clauses: DataTableFilterQueryClause[] = filters.filter(filter => isDataTableColumnFilterActive(filter.value)).map(({ id, value }) => {
    if (value.kind === 'select') return { field: id, kind: value.kind, operator: value.operator, values: [...new Set(value.values)].sort() };
    if (value.kind === 'text') return { field: id, kind: value.kind, operator: value.operator, value: value.value.trim() };
    const rangeEnd = value.operator === 'between' && value.valueTo !== undefined ? { valueTo: value.valueTo } : {};
    return { field: id, kind: value.kind, operator: value.operator, ...(value.value !== undefined ? { value: value.value } : {}), ...rangeEnd };
  }).sort((a, b) => a.field.localeCompare(b.field));
  return JSON.stringify(clauses);
}

function validationMessage(value: DataTableColumnFilterValue) {
  if (value.kind === 'number' && value.operator === 'between' && value.value !== undefined && value.valueTo !== undefined && value.value > value.valueTo) return '最小值不能大于最大值';
  if (value.kind === 'date' && value.operator === 'between' && value.value && value.valueTo && value.value > value.valueTo) return '开始日期不能晚于结束日期';
  return '';
}

function CompactInput(props: ComponentProps<typeof Input>) {
  return <Input className="h-[var(--rui-control-height-sm)] text-sm" {...props} />;
}

function FilterEditor({ definition, value, onChange }: { definition: DataTableColumnFilterDefinition; value: DataTableColumnFilterValue; onChange: (value: DataTableColumnFilterValue) => void }) {
  if (value.kind === 'text') return <div className="grid gap-[var(--rui-content-gap-sm)]">
    <SelectInput size="sm" aria-label={`${definition.label}匹配方式`} value={value.operator} onValueChange={(nextValue) => onChange({ ...value, operator: nextValue as DataTableTextFilterValue['operator'] })} options={[
    {
        value: "contains",
        label: "包含"
    },
    {
        value: "equals",
        label: "等于"
    },
    {
        value: "startsWith",
        label: "开头是"
    }
]}/>
    <CompactInput autoFocus aria-label={`${definition.label}筛选值`} placeholder={definition.placeholder ?? `输入${definition.label}`} value={value.value} onChange={event => onChange({ ...value, value: event.target.value })} />
  </div>;
  if (value.kind === 'number') {
    const range = value.operator === 'between';
    return <div className="grid gap-[var(--rui-content-gap-sm)]">
      <SelectInput size="sm" aria-label={`${definition.label}匹配方式`} value={value.operator} onValueChange={(nextValue) => onChange({ ...value, operator: nextValue as DataTableNumberFilterValue['operator'] })} options={[
    {
        value: "between",
        label: "范围内"
    },
    {
        value: "equals",
        label: "等于"
    },
    {
        value: "atLeast",
        label: "大于等于"
    },
    {
        value: "atMost",
        label: "小于等于"
    }
]}/>
      <div className={range ? 'grid grid-cols-2 gap-[var(--rui-content-gap-sm)]' : undefined}><CompactInput autoFocus type="number" aria-label={range ? `${definition.label}最小值` : `${definition.label}数值`} placeholder={range ? '最小' : '数值'} value={value.value ?? ''} onChange={event => onChange({ ...value, value: event.target.value === '' ? undefined : Number(event.target.value) })} />{range && <CompactInput type="number" aria-label={`${definition.label}最大值`} placeholder="最大" value={value.valueTo ?? ''} onChange={event => onChange({ ...value, valueTo: event.target.value === '' ? undefined : Number(event.target.value) })} />}</div>
    </div>;
  }
  if (value.kind === 'date') {
    const range = value.operator === 'between';
    return <div className="grid gap-[var(--rui-content-gap-sm)]">
      <SelectInput size="sm" aria-label={`${definition.label}匹配方式`} value={value.operator} onValueChange={(nextValue) => onChange({ ...value, operator: nextValue as DataTableDateFilterValue['operator'] })} options={[
    {
        value: "between",
        label: "日期范围"
    },
    {
        value: "on",
        label: "当天"
    },
    {
        value: "onOrAfter",
        label: "不早于"
    },
    {
        value: "onOrBefore",
        label: "不晚于"
    }
]}/>
      <div className={range ? 'grid grid-cols-2 gap-[var(--rui-content-gap-sm)]' : undefined}><CompactInput autoFocus type="date" aria-label={range ? `${definition.label}开始日期` : `${definition.label}日期`} value={value.value ?? ''} onChange={event => onChange({ ...value, value: event.target.value || undefined })} />{range && <CompactInput type="date" aria-label={`${definition.label}结束日期`} value={value.valueTo ?? ''} onChange={event => onChange({ ...value, valueTo: event.target.value || undefined })} />}</div>
    </div>;
  }
  return <div className="grid max-h-48 gap-[var(--rui-content-gap-sm)] overflow-auto py-0.5">{definition.options?.map(option => <label key={option.value} className="flex min-h-[var(--rui-control-height-sm)] cursor-pointer items-center gap-[var(--rui-content-gap)] rounded-md px-1.5 text-sm hover:bg-muted"><Checkbox checked={value.values.includes(option.value)} onCheckedChange={checked => onChange({ ...value, values: checked ? [...value.values, option.value] : value.values.filter(item => item !== option.value) })} /><span className="truncate">{option.label}</span></label>) ?? <span className="text-xs text-muted-foreground">没有可选项</span>}</div>;
}

export function DataTableColumnFilterMenu<TData>({ column, definition, disabled }: { column: Column<TData, unknown>; definition: DataTableColumnFilterDefinition; disabled?: boolean }) {
  const current = column.getFilterValue() as DataTableColumnFilterValue | undefined;
  const active = isDataTableColumnFilterActive(current);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DataTableColumnFilterValue>(() => current ?? emptyValue(definition));
  useEffect(() => { if (open) setDraft(current ?? emptyValue(definition)); }, [current, definition, open]);
  const error = validationMessage(draft);
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger render={<Button variant={active ? 'secondary' : 'ghost'} size="icon-xs" disabled={disabled} />} aria-label={`${definition.label}列筛选${active ? '，已启用' : ''}`}><ListFilter aria-hidden="true" /></PopoverTrigger>
    <PopoverContent align="start" className="w-72 max-w-[calc(100vw-var(--rui-space-8))] gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
      <PopoverTitle className="text-sm">筛选{definition.label}</PopoverTitle>
      <FilterEditor definition={definition} value={draft} onChange={setDraft} />
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <div className="flex items-center justify-between gap-[var(--rui-content-gap)] border-t border-border pt-[var(--rui-content-gap)]"><Button size="sm" variant="ghost" disabled={!active} onClick={() => { column.setFilterValue(undefined); setDraft(emptyValue(definition)); setOpen(false); }}>清除</Button><Button size="sm" disabled={Boolean(error) || !isDataTableColumnFilterActive(draft)} onClick={() => { column.setFilterValue(draft); setOpen(false); }}>应用</Button></div>
    </PopoverContent>
  </Popover>;
}
