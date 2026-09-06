import * as React from 'react';
import { Clock3, X } from 'lucide-react';
import { Field, FieldDescription, FieldError, FieldLabel } from '../primitives/field.js';
import { InputGroup, InputGroupAddon, InputGroupButton } from '../primitives/input-group.js';
import { cn } from '../lib/utils.js';

export interface TimeValue { hour: number; minute: number; second?: number }
export type TimePrecision = 'minute' | 'second';
type TimeSegment = 'hour' | 'minute' | 'second';
type TimeParts = Record<TimeSegment, string>;
type Period = 'am' | 'pm';

export interface InputTimeProps {
  value?: TimeValue | null;
  defaultValue?: TimeValue | null;
  onValueChange?: (value: TimeValue | null) => void;
  onValueCommit?: (value: TimeValue | null) => void;
  hourCycle?: 12 | 24;
  precision?: TimePrecision;
  minuteStep?: number;
  secondStep?: number;
  min?: TimeValue;
  max?: TimeValue;
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
  clearLabel?: string;
}

const emptyParts: TimeParts = { hour: '', minute: '', second: '' };
const segmentNames: Record<TimeSegment, string> = { hour: '时', minute: '分', second: '秒' };
const pad = (value: number) => String(value).padStart(2, '0');
const normalizeStep = (value: number | undefined) => Math.max(1, Math.min(60, Math.floor(value ?? 1)));

function secondsOf(value: TimeValue) {
  return value.hour * 3600 + value.minute * 60 + (value.second ?? 0);
}

function validTime(value: TimeValue) {
  return Number.isInteger(value.hour) && value.hour >= 0 && value.hour <= 23 && Number.isInteger(value.minute) && value.minute >= 0 && value.minute <= 59 && Number.isInteger(value.second ?? 0) && (value.second ?? 0) >= 0 && (value.second ?? 0) <= 59;
}

export function formatTimeValue(value: TimeValue | null | undefined, precision: TimePrecision = 'minute') {
  if (!value || !validTime(value)) return '';
  return `${pad(value.hour)}:${pad(value.minute)}${precision === 'second' ? `:${pad(value.second ?? 0)}` : ''}`;
}

export function parseTimeValue(text: string): TimeValue | null {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(text);
  if (!match) return null;
  const value = { hour: Number(match[1]), minute: Number(match[2]), second: Number(match[3] ?? 0) };
  return validTime(value) ? value : null;
}

function valueToParts(value: TimeValue | null | undefined, hourCycle: 12 | 24): TimeParts {
  if (!value) return { ...emptyParts };
  const hour = hourCycle === 12 ? value.hour % 12 || 12 : value.hour;
  return { hour: pad(hour), minute: pad(value.minute), second: pad(value.second ?? 0) };
}

function partsToValue(parts: TimeParts, period: Period, hourCycle: 12 | 24, precision: TimePrecision, minuteStep: number, secondStep: number) {
  if (!parts.hour || !parts.minute || (precision === 'second' && !parts.second)) return null;
  let hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = precision === 'second' ? Number(parts.second) : 0;
  if (hourCycle === 12) {
    if (hour < 1 || hour > 12) return null;
    hour = hour % 12 + (period === 'pm' ? 12 : 0);
  }
  const value = { hour, minute, second };
  return validTime(value) && minute % minuteStep === 0 && second % secondStep === 0 ? value : null;
}

function valueFromSeconds(total: number): TimeValue {
  const normalized = ((total % 86400) + 86400) % 86400;
  return { hour: Math.floor(normalized / 3600), minute: Math.floor((normalized % 3600) / 60), second: normalized % 60 };
}

export function InputTime({
  value,
  defaultValue = null,
  onValueChange,
  onValueCommit,
  hourCycle = 24,
  precision = 'minute',
  minuteStep: minuteStepProp = 1,
  secondStep: secondStepProp = 1,
  min,
  max,
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
  clearLabel = '清除时间',
}: InputTimeProps) {
  const generatedId = React.useId();
  const id = suppliedId ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = `${id}-error`;
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<TimeValue | null>(defaultValue);
  const currentValue = controlled ? value : internalValue;
  const minuteStep = normalizeStep(minuteStepProp);
  const secondStep = normalizeStep(secondStepProp);
  const [parts, setParts] = React.useState(() => valueToParts(currentValue, hourCycle));
  const [period, setPeriod] = React.useState<Period>(() => currentValue && currentValue.hour >= 12 ? 'pm' : 'am');
  const [committedValue, setCommittedValue] = React.useState<TimeValue | null>(currentValue);
  const editingRef = React.useRef(false);
  const refs = React.useRef<Partial<Record<TimeSegment, HTMLInputElement | null>>>({});
  const segments: TimeSegment[] = precision === 'second' ? ['hour', 'minute', 'second'] : ['hour', 'minute'];

  React.useEffect(() => {
    setParts(valueToParts(currentValue, hourCycle));
    setPeriod(currentValue && currentValue.hour >= 12 ? 'pm' : 'am');
    if (!editingRef.current) setCommittedValue(currentValue);
  }, [currentValue, hourCycle]);

  const parsed = partsToValue(parts, period, hourCycle, precision, minuteStep, secondStep);
  const complete = segments.every(segment => Boolean(parts[segment]));
  const outOfRange = parsed && ((min && secondsOf(parsed) < secondsOf(min)) || (max && secondsOf(parsed) > secondsOf(max)));
  const internalError = complete && !parsed ? `请输入有效时间，并按 ${minuteStep} 分钟${precision === 'second' ? ` / ${secondStep} 秒` : ''}步进。` : outOfRange ? `时间需在 ${min ? formatTimeValue(min, precision) : '不限'} 至 ${max ? formatTimeValue(max, precision) : '不限'} 之间。` : undefined;
  const visibleError = error ?? internalError;
  const describedBy = [descriptionId, visibleError ? errorId : undefined].filter(Boolean).join(' ') || undefined;

  const emitValue = (next: TimeValue | null, commit = false) => {
    if (!controlled) setInternalValue(next);
    onValueChange?.(next);
    if (commit) onValueCommit?.(next);
  };

  const applyValue = (next: TimeValue | null, commit = false) => {
    setParts(valueToParts(next, hourCycle));
    setPeriod(next && next.hour >= 12 ? 'pm' : 'am');
    if (commit) setCommittedValue(next);
    emitValue(next, commit);
  };

  const commit = () => {
    if (parsed && !outOfRange) applyValue(parsed, true);
    else if (!complete && segments.every(segment => !parts[segment])) applyValue(null, true);
    editingRef.current = false;
  };

  const restore = () => {
    editingRef.current = false;
    applyValue(committedValue);
  };

  const updatePart = (segment: TimeSegment, raw: string) => {
    const next = { ...parts, [segment]: raw.replace(/\D/g, '').slice(0, 2) };
    setParts(next);
    const nextValue = partsToValue(next, period, hourCycle, precision, minuteStep, secondStep);
    const allowed = nextValue && !(min && secondsOf(nextValue) < secondsOf(min)) && !(max && secondsOf(nextValue) > secondsOf(max));
    if (allowed) emitValue(nextValue);
    if (next[segment].length === 2) {
      const index = segments.indexOf(segment);
      refs.current[segments[index + 1]]?.focus();
      refs.current[segments[index + 1]]?.select();
    }
  };

  const adjust = (segment: TimeSegment, direction: 1 | -1) => {
    const base = parsed ?? currentValue ?? min ?? { hour: 0, minute: 0, second: 0 };
    const unit = segment === 'hour' ? 3600 : segment === 'minute' ? minuteStep * 60 : secondStep;
    let next = valueFromSeconds(secondsOf(base) + unit * direction);
    if (min && secondsOf(next) < secondsOf(min)) next = { ...min };
    if (max && secondsOf(next) > secondsOf(max)) next = { ...max };
    applyValue(next, true);
  };

  const togglePeriod = () => {
    const nextPeriod = period === 'am' ? 'pm' : 'am';
    setPeriod(nextPeriod);
    const next = partsToValue(parts, nextPeriod, hourCycle, precision, minuteStep, secondStep);
    if (next && !(min && secondsOf(next) < secondsOf(min)) && !(max && secondsOf(next) > secondsOf(max))) applyValue(next, true);
  };

  const clear = () => {
    setParts({ ...emptyParts });
    setCommittedValue(null);
    editingRef.current = false;
    emitValue(null, true);
    requestAnimationFrame(() => refs.current.hour?.focus());
  };

  const keyDown = (event: React.KeyboardEvent<HTMLInputElement>, segment: TimeSegment) => {
    const index = segments.indexOf(segment);
    if (event.key === 'ArrowLeft' && event.currentTarget.selectionStart === 0 && index > 0) { event.preventDefault(); refs.current[segments[index - 1]]?.focus(); refs.current[segments[index - 1]]?.select(); }
    else if (event.key === 'ArrowRight' && event.currentTarget.selectionStart === event.currentTarget.value.length && index < segments.length - 1) { event.preventDefault(); refs.current[segments[index + 1]]?.focus(); refs.current[segments[index + 1]]?.select(); }
    else if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && !readOnly) { event.preventDefault(); adjust(segment, event.key === 'ArrowUp' ? 1 : -1); }
    else if (event.key === 'Home') { event.preventDefault(); refs.current.hour?.focus(); refs.current.hour?.select(); }
    else if (event.key === 'End') { event.preventDefault(); refs.current[segments.at(-1)!]?.focus(); refs.current[segments.at(-1)!]?.select(); }
    else if (event.key === 'Enter') { event.preventDefault(); commit(); }
    else if (event.key === 'Escape') { event.preventDefault(); restore(); }
    else if (event.key === 'Backspace' && !event.currentTarget.value && index > 0 && !readOnly) refs.current[segments[index - 1]]?.focus();
  };

  return <Field data-disabled={disabled || undefined} data-invalid={visibleError ? true : undefined} className={className}>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    <InputGroup data-slot="input-time" aria-label={label}>
      <div className="flex min-w-0 flex-1 items-center px-2">
        {segments.map((segment, index) => <React.Fragment key={segment}>{index > 0 && <span aria-hidden="true" className="text-sm text-muted-foreground">:</span>}<input ref={node => { refs.current[segment] = node; }} id={segment === 'hour' ? id : undefined} data-slot="input-time-segment" data-segment={segment} type="text" inputMode="numeric" autoComplete="off" aria-label={`${label}${segmentNames[segment]}`} aria-invalid={visibleError ? true : undefined} aria-describedby={describedBy} placeholder={segment === 'hour' ? 'HH' : segment === 'minute' ? 'MM' : 'SS'} value={parts[segment]} maxLength={2} disabled={disabled} readOnly={readOnly} required={required} form={form} className="h-full w-8 bg-transparent text-center text-sm tabular-nums text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed" onChange={event => updatePart(segment, event.target.value)} onFocus={event => { if (!editingRef.current) setCommittedValue(currentValue); editingRef.current = true; event.currentTarget.select(); }} onKeyDown={event => keyDown(event, segment)} onBlur={event => { if (!event.currentTarget.closest('[data-slot=input-time]')?.contains(event.relatedTarget)) commit(); }} /></React.Fragment>)}
        {hourCycle === 12 && (readOnly ? <span className="ml-1 text-xs font-medium text-muted-foreground">{period.toUpperCase()}</span> : <InputGroupButton size="xs" aria-label="切换上午下午" aria-pressed={period === 'pm'} disabled={disabled} className="ml-1" onClick={togglePeriod}>{period.toUpperCase()}</InputGroupButton>)}
      </div>
      <InputGroupAddon align="inline-end">
        {clearable && currentValue && !readOnly && <InputGroupButton size="icon-xs" aria-label={clearLabel} disabled={disabled} onClick={clear}><X aria-hidden="true" /></InputGroupButton>}
        <Clock3 aria-hidden="true" />
      </InputGroupAddon>
    </InputGroup>
    {name && <input type="hidden" name={name} form={form} value={formatTimeValue(committedValue, precision)} disabled={disabled} />}
    {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
    {visibleError && <FieldError id={errorId}>{visibleError}</FieldError>}
  </Field>;
}
