import * as React from 'react';
import { cn } from '../lib/utils.js';

export type KnobSize = 'sm' | 'default' | 'lg';
export type KnobTone = 'default' | 'accent' | 'success' | 'warning' | 'danger';
export type KnobStroke = 'thin' | 'default' | 'thick';
export interface KnobProps extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onValueCommitted?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: KnobSize;
  tone?: KnobTone;
  stroke?: KnobStroke;
  readOnly?: boolean;
  disabled?: boolean;
  showRange?: boolean;
  description?: React.ReactNode;
  error?: React.ReactNode;
  formatValue?: (value: number) => React.ReactNode;
  valueText?: (value: number) => string;
  name?: string;
}

const sizeClasses: Record<KnobSize, string> = { sm: 'size-16', default: 'size-20', lg: 'size-24' };
const toneClasses: Record<KnobTone, string> = { default: 'text-primary', accent: 'text-accent', success: 'text-success', warning: 'text-warning', danger: 'text-destructive' };
const strokeWidths: Record<KnobStroke, number> = { thin: 4, default: 6, thick: 8 };
const finite = (value: number, fallback: number) => Number.isFinite(value) ? value : fallback;

function clamp(value: number, min: number, max: number, step: number) {
  const stepped = min + Math.round((value - min) / step) * step;
  const precision = Math.max(0, Math.ceil(-Math.log10(step)));
  return Number(Math.min(max, Math.max(min, stepped)).toFixed(Math.min(8, precision + 2)));
}

function point(angle: number, radius = 40) {
  const radians = (angle - 90) * Math.PI / 180;
  return { x: 50 + radius * Math.cos(radians), y: 50 + radius * Math.sin(radians) };
}

function arc(endAngle: number) {
  const startAngle = -135;
  const start = point(startAngle);
  const end = point(endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A 40 40 0 ${large} 1 ${end.x} ${end.y}`;
}

const trackPath = arc(135);

export function Knob({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  size = 'default',
  tone = 'default',
  stroke = 'default',
  readOnly = false,
  disabled = false,
  showRange = false,
  description,
  error,
  formatValue = current => current,
  valueText,
  name,
  className,
  id: suppliedId,
  ...props
}: KnobProps) {
  const generatedId = React.useId();
  const id = suppliedId ?? generatedId;
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId, props['aria-describedby']].filter(Boolean).join(' ') || undefined;
  const safeMin = finite(min, 0);
  const safeMax = Math.max(safeMin + 1, finite(max, 100));
  const safeStep = Math.max(Number.EPSILON, finite(step, 1));
  const [internalValue, setInternalValue] = React.useState(() => clamp(defaultValue, safeMin, safeMax, safeStep));
  const current = clamp(value === undefined ? internalValue : value, safeMin, safeMax, safeStep);
  const progress = (current - safeMin) / (safeMax - safeMin);
  const interactive = !disabled && !readOnly;
  const renderedValue = formatValue(current);
  const ariaValueText = valueText?.(current) ?? (typeof renderedValue === 'string' || typeof renderedValue === 'number' ? String(renderedValue) : String(current));

  function update(next: number, commit = false) {
    if (!interactive) return;
    const normalized = clamp(next, safeMin, safeMax, safeStep);
    if (value === undefined) setInternalValue(normalized);
    if (normalized !== current) onValueChange?.(normalized);
    if (commit) onValueCommitted?.(normalized);
  }

  function updateFromPointer(event: React.PointerEvent<HTMLDivElement>, commit = false) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    let sweepAngle: number;
    if (angle > 135 && angle < 225) sweepAngle = angle < 180 ? 495 : 225;
    else sweepAngle = angle < 225 ? angle + 360 : angle;
    const ratio = Math.min(1, Math.max(0, (sweepAngle - 225) / 270));
    update(safeMin + ratio * (safeMax - safeMin), commit);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    let next: number | undefined;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = current + safeStep;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = current - safeStep;
    else if (event.key === 'Home') next = safeMin;
    else if (event.key === 'End') next = safeMax;
    else if (event.key === 'PageUp') next = current + safeStep * 10;
    else if (event.key === 'PageDown') next = current - safeStep * 10;
    if (next === undefined || !interactive) return;
    event.preventDefault();
    update(next, true);
  }

  return <div {...props} data-slot="knob-field" data-size={size} data-tone={tone} className={cn('grid w-fit min-w-0 gap-[var(--rui-content-gap-sm)] text-sm', disabled && 'opacity-[var(--rui-opacity-disabled)]', className)}>
    <div className="flex min-w-0 items-center justify-between gap-[var(--rui-space-2)]"><span id={labelId} className="min-w-0 truncate font-medium">{label}</span></div>
    <div data-slot="knob-control" className="grid w-fit gap-[var(--rui-space-1)]"><div
      role="slider"
      tabIndex={interactive ? 0 : -1}
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      aria-valuemin={safeMin}
      aria-valuemax={safeMax}
      aria-valuenow={current}
      aria-valuetext={ariaValueText}
      aria-readonly={readOnly || undefined}
      aria-disabled={disabled || undefined}
      aria-invalid={Boolean(error) || undefined}
      data-slot="knob"
      className={cn('relative touch-none select-none rounded-full outline-none focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/70', interactive && 'cursor-pointer', sizeClasses[size], toneClasses[tone])}
      onKeyDown={onKeyDown}
      onPointerDown={event => { if (!interactive) return; event.currentTarget.setPointerCapture(event.pointerId); updateFromPointer(event); }}
      onPointerMove={event => { if (interactive && event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPointer(event); }}
      onPointerUp={event => { if (!interactive) return; updateFromPointer(event, true); event.currentTarget.releasePointerCapture(event.pointerId); }}
    >
      <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
        <path d={trackPath} fill="none" stroke="currentColor" strokeWidth={strokeWidths[stroke]} strokeLinecap="round" className="text-muted" />
        {progress > 0 && <path d={arc(-135 + progress * 270)} fill="none" stroke="currentColor" strokeWidth={strokeWidths[stroke]} strokeLinecap="round" />}
      </svg>
      <span data-slot="knob-value" className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium tabular-nums text-foreground">{renderedValue}</span>
    </div>
    {showRange && <div data-slot="knob-range" className="flex justify-between text-xs tabular-nums text-muted-foreground"><span>{formatValue(safeMin)}</span><span>{formatValue(safeMax)}</span></div>}</div>
    {description && <p id={descriptionId} className="max-w-48 text-xs leading-relaxed text-muted-foreground">{description}</p>}
    {error && <p id={errorId} role="alert" className="max-w-48 text-xs text-destructive">{error}</p>}
    {name && <input type="hidden" name={name} value={current} disabled={disabled} />}
  </div>;
}
