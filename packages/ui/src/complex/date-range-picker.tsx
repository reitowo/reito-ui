import { useId, useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { type DateRange, type Locale } from 'react-day-picker';
import { zhCN } from 'react-day-picker/locale';
import { Button } from '../primitives/button.js';
import { Calendar } from '../primitives/calendar.js';
import { Input } from '../primitives/input.js';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '../primitives/popover.js';
import { cx } from './shared.js';

export interface DateRangePresetContext {
  today: Date;
  minDate?: Date;
  maxDate?: Date;
}

export interface DateRangePreset {
  id: string;
  label: string;
  range: DateRange | ((context: DateRangePresetContext) => DateRange | undefined);
}

export type DateRangeFormat = (date: Date, locale: Locale) => string;

export interface DateRangePickerProps {
  value: DateRange | undefined;
  onValueChange: (range: DateRange | undefined) => void;
  label?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  locale?: Locale;
  formatDate?: DateRangeFormat;
  presets?: DateRangePreset[] | false;
  today?: Date;
  placeholder?: string;
  incompleteLabel?: string;
  clearLabel?: string;
  cancelLabel?: string;
  applyLabel?: string;
  className?: string;
}

function startOfLocalDay(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function addLocalDays(date: Date, amount: number) { const next = startOfLocalDay(date); next.setDate(next.getDate() + amount); return next; }
function inputDate(date?: Date) { return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : ''; }
function parseDate(text: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return undefined;
  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return inputDate(date) === text ? date : undefined;
}
function sameDay(left?: Date, right?: Date) { return inputDate(left) === inputDate(right); }
function sameRange(left?: DateRange, right?: DateRange) { return sameDay(left?.from, right?.from) && sameDay(left?.to, right?.to); }
function rangeError(range: DateRange | undefined, minDate?: Date, maxDate?: Date, requireComplete = false) {
  if (minDate && maxDate && inputDate(minDate) > inputDate(maxDate)) return '可选日期范围配置无效';
  if (!range?.from) return requireComplete ? '请选择开始日期' : undefined;
  if (!range.to) return requireComplete ? '请选择结束日期' : undefined;
  if (range.from > range.to) return '结束日期不能早于开始日期';
  if (minDate && inputDate(range.from) < inputDate(minDate)) return '开始日期早于允许范围';
  if (maxDate && inputDate(range.from) > inputDate(maxDate)) return '开始日期晚于允许范围';
  if (minDate && inputDate(range.to) < inputDate(minDate)) return '结束日期早于允许范围';
  if (maxDate && inputDate(range.to) > inputDate(maxDate)) return '结束日期晚于允许范围';
  return undefined;
}

export const defaultDateRangePresets: DateRangePreset[] = [
  { id: 'today', label: '今天', range: ({ today }) => ({ from: today, to: today }) },
  { id: 'last-7-days', label: '近 7 天', range: ({ today }) => ({ from: addLocalDays(today, -6), to: today }) },
  { id: 'last-30-days', label: '近 30 天', range: ({ today }) => ({ from: addLocalDays(today, -29), to: today }) },
  { id: 'this-month', label: '本月', range: ({ today }) => ({ from: new Date(today.getFullYear(), today.getMonth(), 1), to: new Date(today.getFullYear(), today.getMonth() + 1, 0) }) },
];

/** Controlled local-date range picker with explicit draft, preset and apply boundaries. */
export function DateRangePicker({ value, onValueChange, label = '日期范围', disabled = false, minDate, maxDate, locale = zhCN, formatDate, presets = defaultDateRangePresets, today, placeholder = '选择日期范围', incompleteLabel = '待选择', clearLabel = '清除', cancelLabel = '取消', applyLabel = '应用范围', className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(value);
  const referenceToday = useMemo(() => startOfLocalDay(today ?? new Date()), [today]);
  const [month, setMonth] = useState<Date>(() => value?.from ?? referenceToday);
  const errorId = useId();
  const invalid = rangeError(draft, minDate, maxDate);
  const formatter = useMemo<DateRangeFormat>(() => formatDate ?? ((date, activeLocale) => new Intl.DateTimeFormat(activeLocale.code || 'zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)), [formatDate]);
  const format = (date: Date) => formatter(date, locale);
  const currentLabel = value?.from ? `${format(value.from)}${value.to ? ` — ${format(value.to)}` : ` — ${incompleteLabel}`}` : placeholder;
  const presetOptions = useMemo(() => presets === false ? [] : presets.map(preset => {
    const range = typeof preset.range === 'function' ? preset.range({ today: referenceToday, minDate, maxDate }) : preset.range;
    return { ...preset, range, error: rangeError(range, minDate, maxDate, true) };
  }), [maxDate, minDate, presets, referenceToday]);

  function changeOpen(next: boolean) {
    if (next) {
      setDraft(value);
      setMonth(value?.from ?? referenceToday);
    }
    setOpen(next);
  }

  return <Popover open={open} onOpenChange={changeOpen}>
    <PopoverTrigger render={<Button variant="outline" disabled={disabled} className={cx('max-w-full justify-start text-left font-normal', className)} />} aria-label={`${label}：${currentLabel}`}><CalendarDays aria-hidden="true" /><span className="truncate">{currentLabel}</span></PopoverTrigger>
    <PopoverContent align="start" className="w-auto max-w-[calc(100vw-var(--rui-space-8))] gap-[var(--rui-content-gap-sm)] p-[var(--rui-content-padding)]">
      <PopoverTitle>{label}</PopoverTitle>
      {presetOptions.length > 0 && <div data-slot="date-range-presets" aria-label="常用日期范围" className="flex min-w-0 flex-wrap gap-[var(--rui-space-1)]">{presetOptions.map(preset => <Button key={preset.id} type="button" variant={sameRange(draft, preset.range) ? 'secondary' : 'ghost'} size="xs" aria-pressed={sameRange(draft, preset.range)} disabled={Boolean(preset.error)} title={preset.error} onClick={() => { if (!preset.range) return; setDraft(preset.range); setMonth(preset.range.from ?? referenceToday); }}>{preset.label}</Button>)}</div>}
      <Calendar locale={locale} mode="range" selected={draft} onSelect={setDraft} month={month} onMonthChange={setMonth} startMonth={minDate} endMonth={maxDate} disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]} excludeDisabled numberOfMonths={1} />
      <div className="grid min-w-0 grid-cols-2 gap-[var(--rui-space-2)]"><label className="min-w-0 space-y-[var(--rui-space-1)] text-xs text-muted-foreground">开始日期<Input aria-label="开始日期" aria-invalid={Boolean(invalid)} aria-describedby={invalid ? errorId : undefined} type="date" value={inputDate(draft?.from)} min={inputDate(minDate) || undefined} max={inputDate(maxDate) || undefined} onChange={event => setDraft({ from: parseDate(event.target.value), to: draft?.to })} /></label><label className="min-w-0 space-y-[var(--rui-space-1)] text-xs text-muted-foreground">结束日期<Input aria-label="结束日期" aria-invalid={Boolean(invalid)} aria-describedby={invalid ? errorId : undefined} type="date" value={inputDate(draft?.to)} min={inputDate(minDate) || undefined} max={inputDate(maxDate) || undefined} onChange={event => setDraft({ from: draft?.from, to: parseDate(event.target.value) })} /></label></div>
      {invalid && <p id={errorId} role="alert" className="text-xs text-destructive">{invalid}</p>}
      <div className="flex flex-wrap justify-between gap-[var(--rui-space-2)] border-t border-border pt-[var(--rui-content-gap-sm)]"><Button variant="ghost" size="sm" onClick={() => { onValueChange(undefined); setOpen(false); }}>{clearLabel}</Button><div className="ml-auto flex gap-[var(--rui-space-2)]"><Button variant="outline" size="sm" onClick={() => setOpen(false)}>{cancelLabel}</Button><Button size="sm" disabled={Boolean(rangeError(draft, minDate, maxDate, true))} onClick={() => { onValueChange(draft); setOpen(false); }}>{applyLabel}</Button></div></div>
    </PopoverContent>
  </Popover>;
}
