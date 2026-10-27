import { useMemo, useState, type ReactNode } from 'react';
import { Inline, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Calendar } from '../../primitives/calendar.js';
import { Switch } from '../../primitives/switch.js';
import { Label } from '../../primitives/label.js';
import { cn } from '../../lib/utils.js';

export type DateRange = { start: Date; end: Date };
export type CompareMode = 'off' | 'previous' | 'year';
export type DatePreset = { id: string; label: string; range: (today: Date) => DateRange };
export type DateRangePickerProps = {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange, compare: DateRange | null, mode: CompareMode) => void;
  presets?: DatePreset[];
  compare?: boolean;
  defaultCompare?: CompareMode;
  weekStartsOn?: 0 | 1;
  min?: Date;
  max?: Date;
  defaultOpen?: boolean;
  today?: Date;
  className?: string;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function defaultPresets(today: Date): DatePreset[] {
  return [
    { id: 'today', label: '今天', range: () => ({ start: today, end: today }) },
    { id: '7d', label: '近 7 天', range: () => ({ start: addDays(today, -6), end: today }) },
    { id: '30d', label: '近 30 天', range: () => ({ start: addDays(today, -29), end: today }) },
    {
      id: 'mtd',
      label: '本月至今',
      range: () => ({ start: new Date(today.getFullYear(), today.getMonth(), 1), end: today }),
    },
    {
      id: 'ytd',
      label: '今年至今',
      range: () => ({ start: new Date(today.getFullYear(), 0, 1), end: today }),
    },
  ];
}

function compareRange(range: DateRange, mode: CompareMode): DateRange | null {
  if (mode === 'off') return null;
  const span = range.end.getTime() - range.start.getTime();
  if (mode === 'year') {
    return {
      start: new Date(range.start.getFullYear() - 1, range.start.getMonth(), range.start.getDate()),
      end: new Date(range.end.getFullYear() - 1, range.end.getMonth(), range.end.getDate()),
    };
  }
  return {
    start: new Date(range.start.getTime() - span - 86400000),
    end: new Date(range.start.getTime() - 86400000),
  };
}

function labelOf(range: DateRange) {
  const fmt = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;
  return `${fmt(range.start)} – ${fmt(range.end)}`;
}

/** Recreated from public Date Range Picker docs. Not Pro source. */
export function DateRangePicker({
  value,
  defaultValue,
  onChange,
  presets,
  compare = true,
  defaultCompare = 'previous',
  weekStartsOn = 1,
  min,
  max,
  defaultOpen = false,
  today,
  className,
}: DateRangePickerProps) {
  const now = startOfDay(today ?? new Date());
  const initial = defaultValue ?? { start: addDays(now, -29), end: now };
  const [open, setOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState<DateRange>(value ?? initial);
  const [mode, setMode] = useState<CompareMode>(defaultCompare);
  const current = value ?? draft;
  const list = presets ?? defaultPresets(now);
  const compared = useMemo(() => compareRange(current, mode), [current, mode]);

  function apply(range: DateRange, nextMode = mode) {
    if (value === undefined) setDraft(range);
    onChange?.(range, compareRange(range, nextMode), nextMode);
    setOpen(false);
  }

  return (
    <div className={cn('grid max-w-xl gap-[var(--rui-content-gap-sm)]', className)}>
      <Button type="button" variant="outline" aria-expanded={open} onClick={() => setOpen(!open)}>
        {labelOf(current)}
        {compare && mode !== 'off' ? ' · 对比' : ''}
      </Button>
      {open ? (
        <section
          role="dialog"
          aria-label="选择日期范围"
          className="grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)] @md:grid-cols-[minmax(0,var(--rui-container-3xs))_minmax(0,1fr)]"
        >
          <Stackish>
            {list.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                size="xs"
                variant="ghost"
                className="w-full justify-start"
                onClick={() => apply(preset.range(now))}
              >
                {preset.label}
              </Button>
            ))}
          </Stackish>
          <div className="grid gap-[var(--rui-content-gap)]">
            <Calendar
              mode="range"
              selected={{ from: current.start, to: current.end }}
              onSelect={(range) => {
                if (!range?.from) return;
                const next = { start: range.from, end: range.to ?? range.from };
                if (value === undefined) setDraft(next);
              }}
              weekStartsOn={weekStartsOn}
              startMonth={min}
              endMonth={max}
              disabled={
                max
                  ? [{ after: max }, ...(min ? [{ before: min }] : [])]
                  : min
                    ? [{ before: min }]
                    : undefined
              }
            />
            {compare ? (
              <Inline>
                <Label htmlFor="affect-range-compare">对比上一周期</Label>
                <Switch
                  id="affect-range-compare"
                  checked={mode !== 'off'}
                  onCheckedChange={(checked) => setMode(checked ? 'previous' : 'off')}
                />
                {mode !== 'off' ? (
                  <Button
                    type="button"
                    size="xs"
                    variant={mode === 'year' ? 'secondary' : 'ghost'}
                    onClick={() => setMode(mode === 'year' ? 'previous' : 'year')}
                  >
                    {mode === 'year' ? '去年' : '上一周期'}
                  </Button>
                ) : null}
              </Inline>
            ) : null}
            <Inline className="justify-between">
              <Text variant="caption" tone="muted">
                {labelOf(current)}
                {compared ? ` · 对比 ${labelOf(compared)}` : ''}
              </Text>
              <Inline>
                <Button type="button" size="xs" variant="ghost" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button type="button" size="xs" onClick={() => apply(current, mode)}>
                  应用
                </Button>
              </Inline>
            </Inline>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Stackish({ children }: { children: ReactNode }) {
  return <div className="grid gap-1">{children}</div>;
}
