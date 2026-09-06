import * as React from 'react';
import { CalendarDays, X } from 'lucide-react';
import type { Locale } from 'react-day-picker';
import { zhCN } from 'react-day-picker/locale';
import { Calendar } from '../primitives/calendar.js';
import { Field, FieldDescription, FieldError, FieldLabel } from '../primitives/field.js';
import { InputGroup, InputGroupAddon, InputGroupButton } from '../primitives/input-group.js';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '../primitives/popover.js';
import { cn } from '../lib/utils.js';

export type DateSegment = 'year' | 'month' | 'day';
export type DateOrder = 'ymd' | 'mdy' | 'dmy';

export interface InputDateProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  onValueCommit?: (value: Date | null) => void;
  locale?: Partial<Locale>;
  order?: DateOrder;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  label: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  name?: string;
  form?: string;
  id?: string;
  className?: string;
  calendarLabel?: string;
  clearLabel?: string;
}

type DateParts = Record<DateSegment, string>;

const emptyParts: DateParts = { year: '', month: '', day: '' };
const segmentLength: Record<DateSegment, number> = { year: 4, month: 2, day: 2 };
const segmentNames: Record<DateSegment, string> = { year: '年', month: '月', day: '日' };

function pad(value: number, digits = 2) {
  return String(value).padStart(digits, '0');
}

export function formatLocalDate(date: Date | null | undefined) {
  return date && !Number.isNaN(date.getTime()) ? `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : '';
}

export function parseLocalDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return formatLocalDate(date) === value ? date : null;
}

function dateToParts(date: Date | null | undefined): DateParts {
  return date ? { year: pad(date.getFullYear(), 4), month: pad(date.getMonth() + 1), day: pad(date.getDate()) } : { ...emptyParts };
}

function partsToDate(parts: DateParts) {
  if (Object.values(parts).some(part => !part)) return null;
  return parseLocalDate(`${parts.year}-${parts.month}-${parts.day}`);
}

function deriveOrder(localeCode = 'en-US'): DateOrder {
  const parts = new Intl.DateTimeFormat(localeCode, { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(2001, 10, 22));
  const order = parts.filter(part => part.type === 'year' || part.type === 'month' || part.type === 'day').map(part => part.type[0]).join('');
  return order === 'mdy' || order === 'dmy' ? order : 'ymd';
}

function orderSegments(order: DateOrder): DateSegment[] {
  return order === 'mdy' ? ['month', 'day', 'year'] : order === 'dmy' ? ['day', 'month', 'year'] : ['year', 'month', 'day'];
}

function dateKey(date: Date) {
  return Number(formatLocalDate(date).replaceAll('-', ''));
}

function localDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function adjustDate(date: Date, segment: DateSegment, amount: number) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (segment === 'day') return new Date(year, month - 1, day + amount);
  if (segment === 'month') {
    const monthIndex = year * 12 + month - 1 + amount;
    const nextYear = Math.floor(monthIndex / 12);
    const nextMonth = ((monthIndex % 12) + 12) % 12 + 1;
    return new Date(nextYear, nextMonth - 1, Math.min(day, daysInMonth(nextYear, nextMonth)));
  }
  const nextYear = year + amount;
  return new Date(nextYear, month - 1, Math.min(day, daysInMonth(nextYear, month)));
}

function clampDate(date: Date, min?: Date, max?: Date) {
  if (min && dateKey(date) < dateKey(min)) return new Date(min.getFullYear(), min.getMonth(), min.getDate());
  if (max && dateKey(date) > dateKey(max)) return new Date(max.getFullYear(), max.getMonth(), max.getDate());
  return date;
}

export function InputDate({
  value,
  defaultValue = null,
  onValueChange,
  onValueCommit,
  locale = zhCN,
  order,
  min,
  max,
  isDateDisabled,
  open,
  defaultOpen = false,
  onOpenChange,
  clearable = true,
  disabled = false,
  readOnly = false,
  required = false,
  label,
  description,
  error,
  name,
  form,
  id: suppliedId,
  className,
  calendarLabel = '打开日历',
  clearLabel = '清除日期',
}: InputDateProps) {
  const generatedId = React.useId();
  const id = suppliedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = `${id}-error`;
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<Date | null>(defaultValue);
  const currentValue = controlled ? value : internalValue;
  const [parts, setParts] = React.useState<DateParts>(() => dateToParts(currentValue));
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const segmentOrder = orderSegments(order ?? deriveOrder(locale?.code));
  const refs = React.useRef<Partial<Record<DateSegment, HTMLInputElement | null>>>({});
  const editingRef = React.useRef(false);
  const [committedValue, setCommittedValue] = React.useState<Date | null>(currentValue);

  React.useEffect(() => {
    setParts(dateToParts(currentValue));
    if (!editingRef.current) setCommittedValue(currentValue);
  }, [currentValue]);

  const parsed = partsToDate(parts);
  const complete = Object.values(parts).every(Boolean);
  const outOfRange = parsed && ((min && dateKey(parsed) < dateKey(min)) || (max && dateKey(parsed) > dateKey(max)));
  const blocked = parsed && isDateDisabled?.(parsed);
  const internalError = complete && !parsed ? '请输入有效日期。' : outOfRange ? `日期需在 ${min ? formatLocalDate(min) : '不限'} 至 ${max ? formatLocalDate(max) : '不限'} 之间。` : blocked ? '该日期不可选择。' : undefined;
  const visibleError = error ?? internalError;
  const describedBy = [descriptionId, visibleError ? errorId : undefined].filter(Boolean).join(' ') || undefined;

  const updateOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const emitValue = (next: Date | null, commit = false) => {
    if (!controlled) setInternalValue(next);
    onValueChange?.(next);
    if (commit) onValueCommit?.(next);
  };

  const commitParts = () => {
    const next = partsToDate(parts);
    if (next && !outOfRange && !blocked) {
      setParts(dateToParts(next));
      setCommittedValue(next);
      emitValue(next, true);
    } else if (!complete && Object.values(parts).every(part => !part)) {
      setCommittedValue(null);
      emitValue(null, true);
    }
    editingRef.current = false;
  };

  const updatePart = (segment: DateSegment, raw: string) => {
    const nextPart = raw.replace(/\D/g, '').slice(0, segmentLength[segment]);
    const next = { ...parts, [segment]: nextPart };
    setParts(next);
    const nextDate = partsToDate(next);
    const isAllowed = nextDate && !(min && dateKey(nextDate) < dateKey(min)) && !(max && dateKey(nextDate) > dateKey(max)) && !isDateDisabled?.(nextDate);
    if (isAllowed) emitValue(nextDate);
    if (nextPart.length === segmentLength[segment]) {
      const index = segmentOrder.indexOf(segment);
      refs.current[segmentOrder[index + 1]]?.focus();
      refs.current[segmentOrder[index + 1]]?.select();
    }
  };

  const restore = () => {
    const restored = committedValue;
    editingRef.current = false;
    setParts(dateToParts(restored));
    emitValue(restored);
  };
  const selectDate = (next?: Date) => {
    if (!next) return;
    const local = new Date(next.getFullYear(), next.getMonth(), next.getDate());
    setParts(dateToParts(local));
    setCommittedValue(local);
    editingRef.current = false;
    emitValue(local, true);
    updateOpen(false);
  };

  const clear = () => {
    setParts({ ...emptyParts });
    setCommittedValue(null);
    editingRef.current = false;
    emitValue(null, true);
    requestAnimationFrame(() => refs.current[segmentOrder[0]]?.focus());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, segment: DateSegment) => {
    const index = segmentOrder.indexOf(segment);
    if (event.key === 'ArrowLeft' && event.currentTarget.selectionStart === 0 && index > 0) {
      event.preventDefault(); refs.current[segmentOrder[index - 1]]?.focus(); refs.current[segmentOrder[index - 1]]?.select();
    } else if (event.key === 'ArrowRight' && event.currentTarget.selectionStart === event.currentTarget.value.length && index < segmentOrder.length - 1) {
      event.preventDefault(); refs.current[segmentOrder[index + 1]]?.focus(); refs.current[segmentOrder[index + 1]]?.select();
    } else if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && !readOnly) {
      event.preventDefault();
      const base = parsed ?? currentValue ?? clampDate(new Date(), min, max);
      const next = clampDate(adjustDate(base, segment, event.key === 'ArrowUp' ? 1 : -1), min, max);
      if (!isDateDisabled?.(next)) { setParts(dateToParts(next)); setCommittedValue(next); emitValue(next, true); }
    } else if (event.key === 'Home') {
      event.preventDefault(); refs.current[segmentOrder[0]]?.focus(); refs.current[segmentOrder[0]]?.select();
    } else if (event.key === 'End') {
      event.preventDefault(); refs.current[segmentOrder.at(-1)!]?.focus(); refs.current[segmentOrder.at(-1)!]?.select();
    } else if (event.key === 'Enter') {
      event.preventDefault(); commitParts();
    } else if (event.key === 'Escape') {
      event.preventDefault(); restore(); updateOpen(false);
    } else if (event.key === 'Backspace' && !event.currentTarget.value && index > 0 && !readOnly) {
      refs.current[segmentOrder[index - 1]]?.focus();
    }
  };

  const segmentInput = (segment: DateSegment) => <input
    key={segment}
    ref={node => { refs.current[segment] = node; }}
    id={segment === segmentOrder[0] ? id : undefined}
    data-slot="input-date-segment"
    data-segment={segment}
    type="text"
    inputMode="numeric"
    autoComplete="off"
    aria-label={`${label}${segmentNames[segment]}`}
    aria-invalid={visibleError ? true : undefined}
    aria-describedby={describedBy}
    placeholder={segment === 'year' ? 'YYYY' : segment === 'month' ? 'MM' : 'DD'}
    value={parts[segment]}
    maxLength={segmentLength[segment]}
    disabled={disabled}
    readOnly={readOnly}
    required={required}
    form={form}
    className={cn('h-full bg-transparent text-center text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed', segment === 'year' ? 'w-12' : 'w-8')}
    onChange={event => updatePart(segment, event.target.value)}
    onFocus={event => { if (!editingRef.current) setCommittedValue(currentValue); editingRef.current = true; event.currentTarget.select(); }}
    onKeyDown={event => handleKeyDown(event, segment)}
    onBlur={event => { if (!event.currentTarget.closest('[data-slot=input-date]')?.contains(event.relatedTarget)) commitParts(); }}
  />;

  return <Field data-disabled={disabled || undefined} data-invalid={visibleError ? true : undefined} className={className}>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    <Popover open={isOpen} onOpenChange={updateOpen}>
      <InputGroup data-slot="input-date" aria-label={label}>
        <div className="flex min-w-0 flex-1 items-center px-2">
          {segmentOrder.map((segment, index) => <React.Fragment key={segment}>{index > 0 && <span aria-hidden="true" className="text-sm text-muted-foreground">/</span>}{segmentInput(segment)}</React.Fragment>)}
        </div>
        <InputGroupAddon align="inline-end">
          {clearable && currentValue && !readOnly && <InputGroupButton size="icon-xs" aria-label={clearLabel} disabled={disabled} onClick={clear}><X aria-hidden="true" /></InputGroupButton>}
          {readOnly ? <CalendarDays aria-hidden="true" /> : <PopoverTrigger render={<InputGroupButton size="icon-xs" aria-label={calendarLabel} disabled={disabled} />}><CalendarDays aria-hidden="true" /></PopoverTrigger>}
        </InputGroupAddon>
      </InputGroup>
      {!readOnly && <PopoverContent align="start" aria-label={label} className="w-auto max-w-[calc(100vw-var(--rui-space-8))] p-0">
        <PopoverTitle className="sr-only">{label}</PopoverTitle>
        <Calendar locale={locale} mode="single" selected={parsed ?? currentValue ?? undefined} onSelect={selectDate} defaultMonth={parsed ?? currentValue ?? (min ? localDay(min) : undefined)} disabled={[...(min ? [{ before: localDay(min) }] : []), ...(max ? [{ after: localDay(max) }] : []), ...(isDateDisabled ? [isDateDisabled] : [])]} />
      </PopoverContent>}
    </Popover>
    {name && <input type="hidden" name={name} form={form} value={formatLocalDate(committedValue)} disabled={disabled} />}
    {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
    {visibleError && <FieldError id={errorId}>{visibleError}</FieldError>}
  </Field>;
}
