import { Columns3, MoveDown, MoveUp } from 'lucide-react';
import type { ColumnPinningState, Table } from '@tanstack/react-table';
import { Button } from '../primitives/button.js';
import { Checkbox } from '../primitives/checkbox.js';
import { SelectInput } from "../basic/select-input.js";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from '../primitives/popover.js';

function moveItem(ids: string[], id: string, delta: -1 | 1) {
  const from = ids.indexOf(id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= ids.length) return ids;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export function DataTableColumnManager<TData>({ table, labels = {}, disabled }: { table: Table<TData>; labels?: Record<string, string>; disabled?: boolean }) {
  const columns = table.getAllLeafColumns();
  const visibleCount = columns.filter(column => column.getIsVisible()).length;
  function labelFor(id: string) {
    const column = table.getColumn(id);
    return labels[id] ?? (typeof column?.columnDef.header === 'string' ? column.columnDef.header : id);
  }
  function move(id: string, delta: -1 | 1) {
    const column = table.getColumn(id);
    const pinned = column?.getIsPinned();
    if (pinned) {
      table.setColumnPinning(current => ({ ...current, [pinned]: moveItem(current[pinned] ?? [], id, delta) } as ColumnPinningState));
      return;
    }
    const center = columns.filter(item => !item.getIsPinned()).map(item => item.id);
    const moved = moveItem(center, id, delta);
    const pinnedIds = new Set([...(table.getState().columnPinning.left ?? []), ...(table.getState().columnPinning.right ?? [])]);
    const base = table.getState().columnOrder.length ? table.getState().columnOrder : columns.map(item => item.id);
    let index = 0;
    table.setColumnOrder(base.map(item => pinnedIds.has(item) ? item : moved[index++]));
  }
  function canMove(id: string, delta: -1 | 1) {
    const column = table.getColumn(id);
    const pinned = column?.getIsPinned();
    const ids = pinned ? table.getState().columnPinning[pinned] ?? [] : columns.filter(item => !item.getIsPinned()).map(item => item.id);
    const index = ids.indexOf(id);
    return delta < 0 ? index > 0 : index >= 0 && index < ids.length - 1;
  }
  return <Popover>
    <PopoverTrigger render={<Button variant="outline" size="sm" disabled={disabled} />}><Columns3 aria-hidden="true" />列</PopoverTrigger>
    <PopoverContent align="end" className="w-80 max-w-[calc(100vw-var(--rui-space-8))] gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
      <div><PopoverTitle>管理列</PopoverTitle><PopoverDescription className="text-xs">显示、固定与排序；Alt+↑/↓ 可移动当前列。</PopoverDescription></div>
      <div className="grid max-h-72 gap-0.5 overflow-auto">{columns.map(column => {
        const label = labelFor(column.id);
        return <div key={column.id} tabIndex={0} aria-label={`管理${label}列`} onKeyDown={event => { if (event.altKey && event.key === 'ArrowUp' && canMove(column.id, -1)) { event.preventDefault(); move(column.id, -1); } if (event.altKey && event.key === 'ArrowDown' && canMove(column.id, 1)) { event.preventDefault(); move(column.id, 1); } }} className="grid min-h-[var(--rui-control-height)] grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-1 rounded-md px-1.5 outline-none hover:bg-muted focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/50">
          <label className="flex min-w-0 cursor-pointer items-center gap-[var(--rui-content-gap)] text-sm"><Checkbox checked={column.getIsVisible()} disabled={!column.getCanHide() || column.getIsVisible() && visibleCount <= 1} onCheckedChange={checked => column.toggleVisibility(checked)} /><span className="truncate">{label}</span></label>
          <SelectInput size="sm" aria-label={`${label}固定位置`} value={column.getIsPinned() || 'none'} disabled={!column.getCanPin()} onValueChange={(nextValue) => column.pin(nextValue === 'none' ? false : nextValue as 'left' | 'right')} options={[
    {
        value: "none",
        label: "不固定"
    },
    {
        value: "left",
        label: "左侧"
    },
    {
        value: "right",
        label: "右侧"
    }
]}/>
          <Button variant="ghost" size="icon-xs" aria-label={`${label}前移`} disabled={!canMove(column.id, -1)} onClick={() => move(column.id, -1)}><MoveUp aria-hidden="true" /></Button>
          <Button variant="ghost" size="icon-xs" aria-label={`${label}后移`} disabled={!canMove(column.id, 1)} onClick={() => move(column.id, 1)}><MoveDown aria-hidden="true" /></Button>
        </div>;
      })}</div>
      <div className="border-t border-border pt-[var(--rui-content-gap)]"><Button variant="ghost" size="sm" onClick={() => { table.resetColumnVisibility(); table.resetColumnOrder(); table.resetColumnSizing(); table.resetColumnPinning(); }}>重置列设置</Button></div>
    </PopoverContent>
  </Popover>;
}
