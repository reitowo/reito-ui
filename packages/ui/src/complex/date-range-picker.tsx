import { useId, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { zhCN } from 'react-day-picker/locale';
import { Button } from '../primitives/button.js';
import { Calendar } from '../primitives/calendar.js';
import { Input } from '../primitives/input.js';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '../primitives/popover.js';
import { cx } from './shared.js';

export interface DateRangePickerProps {
  value: DateRange | undefined;
  onValueChange: (range: DateRange | undefined) => void;
  label?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}
function inputDate(date?: Date) { return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : ''; }
function parseDate(text: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return undefined;
  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return inputDate(date) === text ? date : undefined;
}
const dateFormat = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });

export function DateRangePicker({ value, onValueChange, label = '日期范围', disabled = false, minDate, maxDate, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(value);
  const errorId = useId();
  const invalid = draft?.from && draft.to && draft.from > draft.to ? '结束日期不能早于开始日期' : draft?.from && minDate && inputDate(draft.from) < inputDate(minDate) ? '开始日期早于允许范围' : draft?.to && maxDate && inputDate(draft.to) > inputDate(maxDate) ? '结束日期晚于允许范围' : undefined;
  const currentLabel = value?.from ? `${dateFormat.format(value.from)}${value.to ? ` — ${dateFormat.format(value.to)}` : ' — 待选择'}` : '选择日期范围';
  return <Popover open={open} onOpenChange={next => { if (next) setDraft(value); setOpen(next); }}>
    <PopoverTrigger render={<Button variant="outline" disabled={disabled} className={cx('max-w-full justify-start text-left font-normal', className)} />} aria-label={`${label}：${currentLabel}`}><CalendarDays aria-hidden="true" /><span className="truncate">{currentLabel}</span></PopoverTrigger>
    <PopoverContent align="start" className="w-auto max-w-[calc(100vw-var(--rui-space-8))] gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
      <PopoverTitle>{label}</PopoverTitle>
      <Calendar locale={zhCN} mode="range" selected={draft} onSelect={setDraft} defaultMonth={value?.from} disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]} numberOfMonths={1} />
      <div className="grid grid-cols-2 gap-2"><label className="space-y-1 text-xs text-muted-foreground">开始日期<Input aria-label="开始日期" aria-invalid={!!invalid} aria-describedby={invalid ? errorId : undefined} type="date" value={inputDate(draft?.from)} min={inputDate(minDate) || undefined} max={inputDate(maxDate) || undefined} onChange={event => setDraft({ from: parseDate(event.target.value), to: draft?.to })} /></label><label className="space-y-1 text-xs text-muted-foreground">结束日期<Input aria-label="结束日期" aria-invalid={!!invalid} aria-describedby={invalid ? errorId : undefined} type="date" value={inputDate(draft?.to)} min={inputDate(minDate) || undefined} max={inputDate(maxDate) || undefined} onChange={event => setDraft({ from: draft?.from, to: parseDate(event.target.value) })} /></label></div>
      {invalid && <p id={errorId} role="alert" className="text-xs text-destructive">{invalid}</p>}
      <div className="flex justify-between gap-2 border-t border-border pt-3"><Button variant="ghost" size="sm" onClick={() => { onValueChange(undefined); setOpen(false); }}>清除</Button><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setOpen(false)}>取消</Button><Button size="sm" disabled={!draft?.from || !draft.to || !!invalid} onClick={() => { onValueChange(draft); setOpen(false); }}>应用范围</Button></div></div>
    </PopoverContent>
  </Popover>;
}
