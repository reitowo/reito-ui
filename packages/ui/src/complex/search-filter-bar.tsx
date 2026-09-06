import { Search, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Input } from '../primitives/input.js';
import { cx } from './shared.js';

export interface FilterOption { value: string; label: string; count?: number; disabled?: boolean; }
export interface SearchFilterBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  filters: FilterOption[];
  selected: string[];
  onSelectedChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  resultCount?: number;
  disabled?: boolean;
  className?: string;
}
export function SearchFilterBar({ query, onQueryChange, filters, selected, onSelectedChange, placeholder = '搜索名称或说明…', label = '搜索与筛选', resultCount, disabled = false, className }: SearchFilterBarProps) {
  return <section aria-label={label} className={cx('space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <div className="flex flex-wrap items-center gap-[var(--rui-content-gap)]"><div className="relative min-w-40 flex-1"><Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={label} placeholder={placeholder} className="pl-9" value={query} disabled={disabled} onChange={event => onQueryChange(event.target.value)} /></div>{(query || selected.length > 0) && <Button variant="ghost" size="sm" disabled={disabled} onClick={() => { onQueryChange(''); onSelectedChange([]); }}><X aria-hidden="true" />清除全部</Button>}</div>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2" role="group" aria-label="筛选条件">{filters.map(filter => <Button key={filter.value} variant={selected.includes(filter.value) ? 'secondary' : 'outline'} size="sm" aria-pressed={selected.includes(filter.value)} disabled={disabled || filter.disabled} onClick={() => onSelectedChange(selected.includes(filter.value) ? selected.filter(value => value !== filter.value) : [...selected, filter.value])}>{filter.label}{filter.count !== undefined && <span className="text-xs text-muted-foreground">{filter.count}</span>}</Button>)}</div>{resultCount !== undefined && <span role="status" className="text-xs text-muted-foreground">找到 {resultCount} 项</span>}</div>
  </section>;
}
