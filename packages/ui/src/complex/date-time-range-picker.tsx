import * as React from 'react';
import type { Locale } from 'react-day-picker';
import {
  DateTimePicker,
  compareLocalDateTime,
  formatLocalDateTime,
  parseLocalDateTime,
  type DateOrder,
  type LocalDateTimeValue,
  type TimePrecision,
} from '../basic.js';
import { cn } from '../lib/utils.js';
import { FieldDescription, FieldError, FieldLegend, FieldSet } from '../primitives/field.js';

export interface DateTimeRangeValue {
  start: LocalDateTimeValue | null;
  end: LocalDateTimeValue | null;
}

export interface DateTimeRangeValidationOptions {
  min?: LocalDateTimeValue;
  max?: LocalDateTimeValue;
  timeZone?: string;
  requireComplete?: boolean;
}

export interface DateTimeRangeSerializationOptions extends DateTimeRangeValidationOptions {
  precision?: TimePrecision;
}

export interface ParsedDateTimeRange {
  value: DateTimeRangeValue;
  timeZone?: string;
}

export interface DateTimeRangePickerProps {
  value?: DateTimeRangeValue;
  defaultValue?: DateTimeRangeValue;
  onValueChange?: (value: DateTimeRangeValue) => void;
  onValueCommit?: (value: DateTimeRangeValue) => void;
  min?: LocalDateTimeValue;
  max?: LocalDateTimeValue;
  isDateDisabled?: (date: Date) => boolean;
  locale?: Partial<Locale>;
  order?: DateOrder;
  hourCycle?: 12 | 24;
  precision?: TimePrecision;
  minuteStep?: number;
  secondStep?: number;
  timeZone?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  dateLabel?: string;
  timeLabel?: string;
  timeZoneLabel?: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  name?: string;
  form?: string;
  id?: string;
  className?: string;
}

const emptyRange: DateTimeRangeValue = { start: null, end: null };

export function isSupportedTimeZone(timeZone: string) {
  if (!timeZone.trim()) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone }).format(0);
    return true;
  } catch {
    return false;
  }
}

export function validateDateTimeRange(value: DateTimeRangeValue, { min, max, timeZone, requireComplete = false }: DateTimeRangeValidationOptions = {}) {
  if (min && max && compareLocalDateTime(min, max) > 0) return '允许的起止时间配置无效';
  if (timeZone !== undefined && !isSupportedTimeZone(timeZone)) return '时区标识无效';
  if (!value.start) return value.end || requireComplete ? '请选择开始时间' : undefined;
  if (!value.end) return requireComplete ? '请选择结束时间' : undefined;
  if (compareLocalDateTime(value.start, value.end) > 0) return '结束时间不能早于开始时间';
  if (min && compareLocalDateTime(value.start, min) < 0) return '开始时间早于允许范围';
  if (max && compareLocalDateTime(value.start, max) > 0) return '开始时间晚于允许范围';
  if (min && compareLocalDateTime(value.end, min) < 0) return '结束时间早于允许范围';
  if (max && compareLocalDateTime(value.end, max) > 0) return '结束时间晚于允许范围';
  return undefined;
}

export function serializeDateTimeRange(value: DateTimeRangeValue | null | undefined, { precision = 'minute', min, max, timeZone }: DateTimeRangeSerializationOptions = {}) {
  if (!value?.start || !value.end || validateDateTimeRange(value, { min, max, timeZone, requireComplete: true })) return '';
  return JSON.stringify({
    start: formatLocalDateTime(value.start, precision),
    end: formatLocalDateTime(value.end, precision),
    ...(timeZone ? { timeZone } : {}),
  });
}

export function parseDateTimeRange(text: string): ParsedDateTimeRange | null {
  try {
    const parsed = JSON.parse(text) as { start?: unknown; end?: unknown; timeZone?: unknown };
    if (typeof parsed.start !== 'string' || typeof parsed.end !== 'string') return null;
    if (parsed.timeZone !== undefined && (typeof parsed.timeZone !== 'string' || !isSupportedTimeZone(parsed.timeZone))) return null;
    const start = parseLocalDateTime(parsed.start);
    const end = parseLocalDateTime(parsed.end);
    const value = { start, end };
    return start && end && !validateDateTimeRange(value) ? { value, ...(parsed.timeZone ? { timeZone: parsed.timeZone } : {}) } : null;
  } catch {
    return null;
  }
}

/** Local wall-clock range. `timeZone` is explicit metadata and never performs instant conversion. */
export function DateTimeRangePicker({
  value,
  defaultValue = emptyRange,
  onValueChange,
  onValueCommit,
  min,
  max,
  isDateDisabled,
  locale,
  order,
  hourCycle = 24,
  precision = 'minute',
  minuteStep = 1,
  secondStep = 1,
  timeZone,
  disabled = false,
  readOnly = false,
  required = false,
  label = '日期时间范围',
  startLabel = '开始',
  endLabel = '结束',
  dateLabel = '日期',
  timeLabel = '时间',
  timeZoneLabel = '时区',
  description,
  error,
  name,
  form,
  id: suppliedId,
  className,
}: DateTimeRangePickerProps) {
  const generatedId = React.useId();
  const id = suppliedId ?? generatedId;
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = controlled ? value : internalValue;
  const automaticError = validateDateTimeRange(currentValue, { min, max, timeZone, requireComplete: Boolean(currentValue.start || currentValue.end) });
  const visibleError = error ?? automaticError;
  const describedBy = [description ? `${id}-description` : undefined, visibleError ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined;

  function update(endpoint: keyof DateTimeRangeValue, next: LocalDateTimeValue | null) {
    const nextValue = { ...currentValue, [endpoint]: next };
    if (!controlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  function commit(endpoint: keyof DateTimeRangeValue, next: LocalDateTimeValue | null) {
    const nextValue = { ...currentValue, [endpoint]: next };
    if (!validateDateTimeRange(nextValue, { min, max, timeZone, requireComplete: true })) onValueCommit?.(nextValue);
  }

  const serialized = serializeDateTimeRange(currentValue, { precision, min, max, timeZone });

  return <FieldSet disabled={disabled} data-slot="date-time-range-picker" data-invalid={visibleError ? true : undefined} aria-describedby={describedBy} className={cn('min-w-0 gap-[var(--rui-content-gap-sm)]', className)}>
    <FieldLegend variant="label">{label}</FieldLegend>
    <div className="grid min-w-0 gap-[var(--rui-content-gap)] md:grid-cols-2">
      <DateTimePicker id={`${id}-start`} label={startLabel} dateLabel={`${startLabel}${dateLabel}`} timeLabel={`${startLabel}${timeLabel}`} value={currentValue.start} onValueChange={next => update('start', next)} onValueCommit={next => commit('start', next)} min={min} max={max} isDateDisabled={isDateDisabled} locale={locale} order={order} hourCycle={hourCycle} precision={precision} minuteStep={minuteStep} secondStep={secondStep} disabled={disabled} readOnly={readOnly} required={required} />
      <DateTimePicker id={`${id}-end`} label={endLabel} dateLabel={`${endLabel}${dateLabel}`} timeLabel={`${endLabel}${timeLabel}`} value={currentValue.end} onValueChange={next => update('end', next)} onValueCommit={next => commit('end', next)} min={min} max={max} isDateDisabled={isDateDisabled} locale={locale} order={order} hourCycle={hourCycle} precision={precision} minuteStep={minuteStep} secondStep={secondStep} disabled={disabled} readOnly={readOnly} required={required} />
    </div>
    {timeZone && <p data-slot="date-time-range-time-zone" className="text-xs text-muted-foreground"><span>{timeZoneLabel}：</span><code className="font-mono text-foreground">{timeZone}</code></p>}
    {name && <input type="hidden" name={name} form={form} value={serialized} disabled={disabled} />}
    {description && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
    {visibleError && <FieldError id={`${id}-error`}>{visibleError}</FieldError>}
  </FieldSet>;
}
