import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils.js';

export type MeterGroupTone = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted';
export interface MeterGroupItem {
  id: string;
  label: string;
  value: number;
  valueLabel?: React.ReactNode;
  description?: React.ReactNode;
  tone?: MeterGroupTone;
}
export interface MeterGroupProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  label: string;
  items: readonly MeterGroupItem[];
  max?: number;
  valueLabel?: React.ReactNode;
  description?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  overflowLabel?: (amount: number) => React.ReactNode;
  showLegend?: boolean;
  legendPosition?: 'start' | 'end';
  formatValue?: (value: number) => React.ReactNode;
}
export interface ProgressGroupProps extends MeterGroupProps { indeterminate?: boolean }

const toneClasses: Record<MeterGroupTone, string> = { default: 'bg-primary', accent: 'bg-accent', success: 'bg-success', warning: 'bg-warning', danger: 'bg-destructive', muted: 'bg-muted-foreground' };
const dotClasses: Record<MeterGroupTone, string> = { ...toneClasses, accent: 'bg-accent ring-1 ring-border' };
const finite = (value: number, fallback: number) => Number.isFinite(value) ? value : fallback;

function Group({ kind, indeterminate = false, label, items, max = 100, valueLabel, description, emptyLabel = '暂无用量', overflowLabel = amount => `超出 ${amount}`, showLegend = true, legendPosition = 'end', formatValue = value => value, className, ...props }: MeterGroupProps & { kind: 'meter' | 'progressbar'; indeterminate?: boolean }) {
  const generatedId = React.useId();
  const labelId = `${generatedId}-label`;
  const descriptionId = `${generatedId}-description`;
  const safeMax = Math.max(1, finite(max, 100));
  const values = items.map(item => Math.max(0, finite(item.value, 0)));
  const total = values.reduce((sum, value) => sum + value, 0);
  const current = Math.min(safeMax, total);
  const overflow = Math.max(0, total - safeMax);
  const empty = total === 0;
  const resolvedValueLabel = valueLabel ?? <>{formatValue(total)} / {formatValue(safeMax)}</>;
  const valueText = typeof resolvedValueLabel === 'string' || typeof resolvedValueLabel === 'number' ? String(resolvedValueLabel) : `${total} / ${safeMax}`;
  const legend = showLegend && <ul data-slot={`${kind}-group-legend`} className="grid min-w-0 gap-[var(--rui-space-1)] text-xs sm:grid-cols-2">
    {items.map((item, index) => <li key={item.id} className="flex min-w-0 items-start gap-[var(--rui-space-2)]"><span aria-hidden="true" className={cn('mt-1 size-2 shrink-0 rounded-full', dotClasses[item.tone ?? 'default'])} /><span className="min-w-0 flex-1"><span className="block truncate text-foreground">{item.label}</span>{item.description && <span className="block truncate text-muted-foreground">{item.description}</span>}</span><span className="shrink-0 tabular-nums text-muted-foreground">{item.valueLabel ?? formatValue(values[index] ?? 0)}</span></li>)}
  </ul>;
  return <div {...props} role={kind} aria-labelledby={labelId} aria-describedby={description ? descriptionId : undefined} aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={kind === 'progressbar' && indeterminate ? undefined : current} aria-valuetext={kind === 'progressbar' && indeterminate ? '进行中，进度未知' : valueText} aria-busy={kind === 'progressbar' && indeterminate || undefined} data-slot={`${kind}-group`} data-empty={empty || undefined} data-overflow={overflow > 0 || undefined} className={cn('grid min-w-0 gap-[var(--rui-content-gap-sm)] text-sm', className)}>
    <div className="flex min-w-0 items-center justify-between gap-[var(--rui-space-2)]"><span id={labelId} className="min-w-0 truncate font-medium">{label}</span><span className="shrink-0 text-xs tabular-nums text-muted-foreground">{indeterminate && kind === 'progressbar' ? '进行中' : resolvedValueLabel}</span></div>
    {legendPosition === 'start' && legend}
    <div data-slot={`${kind}-group-track`} aria-hidden="true" className="flex h-2 min-w-0 overflow-hidden rounded-full bg-muted">
      {indeterminate && kind === 'progressbar' ? <span className="h-full w-1/3 rounded-full bg-primary motion-safe:animate-pulse motion-reduce:animate-none" /> : items.map((item, index) => { const width = Math.max(0, values[index] ?? 0) / safeMax * 100; return width > 0 ? <span key={item.id} data-slot={`${kind}-group-segment`} data-tone={item.tone ?? 'default'} className={cn('h-full shrink-0', toneClasses[item.tone ?? 'default'])} style={{ width: `${width}%` }} /> : null; })}
    </div>
    {empty && <span data-slot={`${kind}-group-empty`} className="text-xs text-muted-foreground">{emptyLabel}</span>}
    {overflow > 0 && <span data-slot={`${kind}-group-overflow`} className="flex items-center gap-[var(--rui-space-1)] text-xs text-warning"><AlertTriangle aria-hidden="true" className="size-3.5 shrink-0" />{overflowLabel(overflow)}</span>}
    {legendPosition === 'end' && legend}
    {description && <p id={descriptionId} className="text-xs leading-relaxed text-muted-foreground">{description}</p>}
  </div>;
}

/** Segmented scalar measurement such as storage, quota or category composition. */
export function MeterGroup(props: MeterGroupProps) { return <Group {...props} kind="meter" />; }
/** Segmented task completion. Use indeterminate when the host cannot estimate completion. */
export function ProgressGroup({ indeterminate, ...props }: ProgressGroupProps) { return <Group {...props} kind="progressbar" indeterminate={indeterminate} />; }
