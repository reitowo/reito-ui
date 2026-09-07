import * as React from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { cn } from '../lib/utils.js';

export type RatingSize = 'sm' | 'default' | 'lg';
export type RatingTone = 'default' | 'warning' | 'success' | 'danger';
export interface RatingIconRenderProps {
  index: number;
  filled: boolean;
  preview: boolean;
}

export interface RatingProps extends Omit<React.ComponentProps<'fieldset'>, 'defaultValue' | 'onChange' | 'value'> {
  label: string;
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  max?: number;
  step?: 1 | 0.5 | 0.25;
  size?: RatingSize;
  tone?: RatingTone;
  allowClear?: boolean;
  hoverable?: boolean;
  readOnly?: boolean;
  required?: boolean;
  description?: React.ReactNode;
  error?: React.ReactNode;
  valueLabel?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  clearLabel?: string;
  renderIcon?: (props: RatingIconRenderProps) => React.ReactNode;
}

const sizeClasses: Record<RatingSize, string> = { sm: 'size-4', default: 'size-5', lg: 'size-6' };
const toneClasses: Record<RatingTone, string> = { default: 'text-foreground', warning: 'text-warning', success: 'text-success', danger: 'text-destructive' };
const finite = (value: number, fallback: number) => Number.isFinite(value) ? value : fallback;

function normalize(value: number | null | undefined, max: number, step: number) {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.min(max, Math.max(step, Math.round(value / step) * step));
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}

export function Rating({
  label,
  value,
  defaultValue = null,
  onValueChange,
  max = 5,
  step = 1,
  size = 'default',
  tone = 'warning',
  allowClear = true,
  hoverable = true,
  readOnly = false,
  disabled = false,
  required = false,
  description,
  error,
  valueLabel,
  emptyLabel = '未评分',
  clearLabel = `清除${label}`,
  renderIcon,
  name,
  className,
  id: suppliedId,
  ...props
}: RatingProps) {
  const generatedId = React.useId();
  const id = suppliedId ?? generatedId;
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId, props['aria-describedby']].filter(Boolean).join(' ') || undefined;
  const safeMax = Math.max(1, Math.min(20, Math.floor(finite(max, 5))));
  const safeStep = step === 0.5 || step === 0.25 ? step : 1;
  const stepsPerItem = 1 / safeStep;
  const resolvedStep = 1 / stepsPerItem;
  const optionCount = safeMax * stepsPerItem;
  const [internalValue, setInternalValue] = React.useState(() => normalize(defaultValue, safeMax, resolvedStep));
  const selectedValue = normalize(value === undefined ? internalValue : value, safeMax, resolvedStep);
  const [previewValue, setPreviewValue] = React.useState<number | null>(null);
  const displayedValue = previewValue ?? selectedValue ?? 0;
  const inputName = name ?? `${id}-rating`;
  const interactive = !disabled && !readOnly;

  function setValue(next: number | null) {
    if (!interactive) return;
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }

  const resolvedValueLabel = valueLabel ?? (selectedValue == null ? emptyLabel : `${formatNumber(selectedValue)} / ${safeMax}`);
  return <fieldset
    {...props}
    id={id}
    role="radiogroup"
    aria-labelledby={labelId}
    aria-describedby={describedBy}
    aria-invalid={Boolean(error) || undefined}
    aria-readonly={readOnly || undefined}
    aria-disabled={disabled || undefined}
    aria-required={required || undefined}
    disabled={disabled}
    data-slot="rating"
    data-size={size}
    data-tone={tone}
    className={cn('grid min-w-0 gap-[var(--rui-content-gap-sm)] text-sm disabled:opacity-[var(--rui-opacity-disabled)]', className)}
    onPointerLeave={event => { setPreviewValue(null); props.onPointerLeave?.(event); }}
  >
    <legend className="sr-only">{label}</legend>
    <div className="flex min-w-0 items-center justify-between gap-[var(--rui-space-2)]">
      <span id={labelId} className="min-w-0 truncate font-medium">{label}{required && <span aria-hidden="true" className="text-destructive"> *</span>}</span>
      <output aria-live="polite" className="shrink-0 text-xs tabular-nums text-muted-foreground">{resolvedValueLabel}</output>
    </div>
    <div className="flex min-w-0 items-center gap-[var(--rui-space-1)]">
      <div data-slot="rating-items" className="flex w-fit items-center gap-[var(--rui-space-1)]">
        {Array.from({ length: safeMax }, (_, index) => {
          const fill = Math.max(0, Math.min(1, displayedValue - index));
          return <span key={index} data-slot="rating-item" data-filled={fill >= 1 || undefined} data-partial={fill > 0 && fill < 1 || undefined} className="relative isolate rounded-sm outline-none has-[input:focus-visible]:ring-[length:var(--rui-outline-width)] has-[input:focus-visible]:ring-ring/70">
            <span aria-hidden="true" className={cn('block text-muted-foreground/35', sizeClasses[size])}>{renderIcon?.({ index, filled: false, preview: previewValue != null }) ?? <Star className="size-full" />}</span>
            <span aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', toneClasses[tone])} style={{ width: `${fill * 100}%` }}><span className={cn('block', sizeClasses[size])}>{renderIcon?.({ index, filled: true, preview: previewValue != null }) ?? <Star className="size-full fill-current" />}</span></span>
            {Array.from({ length: stepsPerItem }, (_, part) => {
              const optionValue = index + (part + 1) * resolvedStep;
              return <label key={part} className={cn('absolute inset-y-0', interactive ? 'cursor-pointer' : 'cursor-default')} style={{ left: `${part / stepsPerItem * 100}%`, width: `${100 / stepsPerItem}%` }} onPointerEnter={() => { if (interactive && hoverable) setPreviewValue(optionValue); }}>
                <input type="radio" name={inputName} value={formatNumber(optionValue)} checked={selectedValue === optionValue} required={required} disabled={!interactive} aria-label={`${formatNumber(optionValue)} 星，共 ${safeMax} 星`} aria-describedby={describedBy} onChange={() => setValue(optionValue)} className="sr-only" />
              </label>;
            })}
          </span>;
        })}
      </div>
      {allowClear && !required && interactive && selectedValue != null && <Button type="button" variant="ghost" size="icon-xs" aria-label={clearLabel} onClick={() => setValue(null)}><X aria-hidden="true" /></Button>}
    </div>
    {description && <p id={descriptionId} className="text-xs leading-relaxed text-muted-foreground">{description}</p>}
    {error && <p id={errorId} role="alert" className="text-xs text-destructive">{error}</p>}
  </fieldset>;
}
