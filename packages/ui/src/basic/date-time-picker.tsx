import * as React from 'react';
import type { Locale } from 'react-day-picker';
import { FieldDescription, FieldError, FieldLegend, FieldSet } from '../primitives/field.js';
import { cn } from '../lib/utils.js';
import { InputDate, formatLocalDate, parseLocalDate, type DateOrder } from './input-date.js';
import { InputTime, formatTimeValue, parseTimeValue, type TimePrecision, type TimeValue } from './input-time.js';

export interface LocalDateTimeValue {
  date: Date;
  time: TimeValue;
}

export interface DateTimePickerProps {
  value?: LocalDateTimeValue | null;
  defaultValue?: LocalDateTimeValue | null;
  onValueChange?: (value: LocalDateTimeValue | null) => void;
  onValueCommit?: (value: LocalDateTimeValue | null) => void;
  min?: LocalDateTimeValue;
  max?: LocalDateTimeValue;
  isDateDisabled?: (date: Date) => boolean;
  locale?: Partial<Locale>;
  order?: DateOrder;
  hourCycle?: 12 | 24;
  precision?: TimePrecision;
  minuteStep?: number;
  secondStep?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  label: string;
  dateLabel?: string;
  timeLabel?: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  name?: string;
  form?: string;
  id?: string;
  className?: string;
}

function sameDate(left: Date, right: Date) {
  return formatLocalDate(left) === formatLocalDate(right);
}

function secondsOf(time: TimeValue) {
  return time.hour * 3600 + time.minute * 60 + (time.second ?? 0);
}

export function compareLocalDateTime(left: LocalDateTimeValue, right: LocalDateTimeValue) {
  const dateComparison = formatLocalDate(left.date).localeCompare(formatLocalDate(right.date));
  return dateComparison || secondsOf(left.time) - secondsOf(right.time);
}

export function formatLocalDateTime(value: LocalDateTimeValue | null | undefined, precision: TimePrecision = 'minute') {
  if (!value) return '';
  const date = formatLocalDate(value.date);
  const time = formatTimeValue(value.time, precision);
  return date && time ? `${date}T${time}` : '';
}

export function parseLocalDateTime(text: string): LocalDateTimeValue | null {
  const separator = text.indexOf('T');
  if (separator < 0) return null;
  const date = parseLocalDate(text.slice(0, separator));
  const time = parseTimeValue(text.slice(separator + 1));
  return date && time ? { date, time } : null;
}

export function DateTimePicker({
  value,
  defaultValue = null,
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
  disabled = false,
  readOnly = false,
  required = false,
  label,
  dateLabel = '日期',
  timeLabel = '时间',
  description,
  error,
  name,
  form,
  id: suppliedId,
  className,
}: DateTimePickerProps) {
  const generatedId = React.useId();
  const id = suppliedId ?? generatedId;
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<LocalDateTimeValue | null>(defaultValue);
  const currentValue = controlled ? value : internalValue;
  const currentKey = formatLocalDateTime(currentValue, precision);
  const [draftDate, setDraftDate] = React.useState<Date | null>(currentValue?.date ?? null);
  const [draftTime, setDraftTime] = React.useState<TimeValue | null>(currentValue?.time ?? null);
  const [committedValue, setCommittedValue] = React.useState<LocalDateTimeValue | null>(currentValue);
  const editingRef = React.useRef(false);

  React.useEffect(() => {
    setDraftDate(currentValue?.date ?? null);
    setDraftTime(currentValue?.time ?? null);
    if (!editingRef.current) setCommittedValue(currentValue);
  }, [currentKey]);

  const visibleError = error;
  const minTime = draftDate && min && sameDate(draftDate, min.date) ? min.time : undefined;
  const maxTime = draftDate && max && sameDate(draftDate, max.date) ? max.time : undefined;

  const emit = (date: Date | null, time: TimeValue | null, commit: boolean) => {
    const next = date && time ? { date, time } : null;
    const valid = next && !(min && compareLocalDateTime(next, min) < 0) && !(max && compareLocalDateTime(next, max) > 0);
    if (valid || !next) {
      if (!controlled) setInternalValue(valid ? next : null);
      onValueChange?.(valid ? next : null);
      if (commit && (valid || currentValue)) {
        setCommittedValue(valid ? next : null);
        onValueCommit?.(valid ? next : null);
      }
    }
  };

  const changeDate = (date: Date | null) => {
    editingRef.current = true;
    setDraftDate(date);
    emit(date, draftTime, false);
  };
  const commitDate = (date: Date | null) => {
    setDraftDate(date);
    emit(date, draftTime, true);
    editingRef.current = false;
  };
  const changeTime = (time: TimeValue | null) => {
    editingRef.current = true;
    setDraftTime(time);
    emit(draftDate, time, false);
  };
  const commitTime = (time: TimeValue | null) => {
    setDraftTime(time);
    emit(draftDate, time, true);
    editingRef.current = false;
  };

  return <FieldSet disabled={disabled} data-slot="date-time-picker" data-invalid={visibleError ? true : undefined} aria-describedby={[description ? `${id}-description` : undefined, visibleError ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined} className={cn('min-w-0 gap-[var(--rui-content-gap-sm)]', className)}>
    <FieldLegend variant="label">{label}</FieldLegend>
    <div className="grid min-w-0 gap-[var(--rui-content-gap-sm)] sm:grid-cols-2">
      <InputDate id={`${id}-date`} form={form} label={dateLabel} value={draftDate} onValueChange={changeDate} onValueCommit={commitDate} locale={locale} order={order} min={min?.date} max={max?.date} isDateDisabled={isDateDisabled} disabled={disabled} readOnly={readOnly} required={required} clearable={!required} />
      <InputTime id={`${id}-time`} form={form} label={timeLabel} value={draftTime} onValueChange={changeTime} onValueCommit={commitTime} hourCycle={hourCycle} precision={precision} minuteStep={minuteStep} secondStep={secondStep} min={minTime} max={maxTime} disabled={disabled} readOnly={readOnly} required={required} clearable={!required} />
    </div>
    {name && <input type="hidden" name={name} form={form} value={formatLocalDateTime(committedValue, precision)} disabled={disabled} />}
    {description && <FieldDescription id={`${id}-description`}>{description}</FieldDescription>}
    {visibleError && <FieldError id={`${id}-error`}>{visibleError}</FieldError>}
  </FieldSet>;
}
