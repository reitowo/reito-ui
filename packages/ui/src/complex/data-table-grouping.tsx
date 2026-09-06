import { Layers3, MoveDown, MoveUp, X } from 'lucide-react';
import type { GroupingState, Table } from '@tanstack/react-table';
import { Button } from '../primitives/button.js';
import { Checkbox } from '../primitives/checkbox.js';
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from '../primitives/popover.js';

export interface DataTableGroupingDefinition {
  id: string;
  label: string;
}

function move(ids: string[], id: string, delta: -1 | 1) {
  const from = ids.indexOf(id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= ids.length) return ids;
  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export function DataTableGroupingMenu<TData>({ table, definitions, disabled }: { table: Table<TData>; definitions: DataTableGroupingDefinition[]; disabled?: boolean }) {
  const grouping = table.getState().grouping;
  function toggle(id: string, checked: boolean) {
    table.setGrouping(current => checked ? [...current, id] : current.filter(item => item !== id));
  }
  function shift(id: string, delta: -1 | 1) {
    table.setGrouping(current => move(current, id, delta));
  }
  return <Popover>
    <PopoverTrigger render={<Button variant="outline" size="sm" disabled={disabled} aria-label={`行分组${grouping.length ? `，已选 ${grouping.length} 项` : ''}`} />}><Layers3 aria-hidden="true" />分组{grouping.length ? ` ${grouping.length}` : ''}</PopoverTrigger>
    <PopoverContent align="end" className="w-72 max-w-[calc(100vw-var(--rui-space-8))] gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
      <div><PopoverTitle>行分组</PopoverTitle><PopoverDescription className="text-xs">按选中顺序建立层级；Alt+↑/↓ 可调整层级。</PopoverDescription></div>
      <div className="grid gap-0.5">{definitions.map(definition => {
        const index = grouping.indexOf(definition.id);
        const active = index >= 0;
        const canGroup = table.getColumn(definition.id)?.getCanGroup() ?? false;
        return <div key={definition.id} tabIndex={active ? 0 : -1} aria-label={`管理${definition.label}分组`} onKeyDown={event => { if (event.altKey && event.key === 'ArrowUp' && index > 0) { event.preventDefault(); shift(definition.id, -1); } if (event.altKey && event.key === 'ArrowDown' && index >= 0 && index < grouping.length - 1) { event.preventDefault(); shift(definition.id, 1); } }} className="grid min-h-[var(--rui-control-height)] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1 rounded-md px-1.5 outline-none hover:bg-muted focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/50">
          <label className="flex min-w-0 cursor-pointer items-center gap-[var(--rui-content-gap)] text-sm"><Checkbox aria-label={definition.label} checked={active} disabled={!canGroup} onCheckedChange={checked => toggle(definition.id, checked)} /><span className="truncate">{definition.label}</span></label>
          <Button variant="ghost" size="icon-xs" aria-label={`${definition.label}上移一层`} disabled={!active || index === 0} onClick={() => shift(definition.id, -1)}><MoveUp aria-hidden="true" /></Button>
          <Button variant="ghost" size="icon-xs" aria-label={`${definition.label}下移一层`} disabled={!active || index === grouping.length - 1} onClick={() => shift(definition.id, 1)}><MoveDown aria-hidden="true" /></Button>
        </div>;
      })}</div>
      {grouping.length > 0 && <div className="border-t border-border pt-[var(--rui-content-gap)]"><Button variant="ghost" size="sm" onClick={() => table.setGrouping([])}><X aria-hidden="true" />清除行分组</Button></div>}
    </PopoverContent>
  </Popover>;
}
