import { useId, type ReactNode } from 'react';
import { Meter as MeterPrimitive } from '@base-ui/react/meter';
import { cn } from '../lib/utils.js';

export interface MeterProps extends Omit<MeterPrimitive.Root.Props, 'children' | 'className'> {
  label: string;
  description?: ReactNode;
  valueLabel?: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

/** A bounded measurement (capacity/quality/budget), not asynchronous task progress. */
export function Meter({ label, description, valueLabel, tone = 'default', className, ...props }: MeterProps) {
  const descriptionId = useId();
  const indicator = { default: 'bg-primary', success: 'bg-success', warning: 'bg-warning', danger: 'bg-destructive' }[tone];
  return <MeterPrimitive.Root data-slot="meter" {...props} aria-describedby={[props['aria-describedby'], description ? descriptionId : ''].filter(Boolean).join(' ') || undefined} aria-valuetext={props['aria-valuetext'] ?? (typeof valueLabel === 'string' ? valueLabel : undefined)} className={cn('grid min-w-0 gap-2 text-sm', className)}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <MeterPrimitive.Label className="font-medium">{label}</MeterPrimitive.Label>
      <MeterPrimitive.Value className="text-xs tabular-nums text-muted-foreground">{valueLabel === undefined ? undefined : () => valueLabel}</MeterPrimitive.Value>
    </div>
    <MeterPrimitive.Track className="h-1.5 overflow-hidden rounded-full bg-muted"><MeterPrimitive.Indicator className={cn('h-full rounded-full transition-[width]', indicator)} /></MeterPrimitive.Track>
    {description && <p id={descriptionId} className="text-xs leading-relaxed text-muted-foreground">{description}</p>}
  </MeterPrimitive.Root>;
}

