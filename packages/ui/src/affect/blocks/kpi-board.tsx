import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { NumberTicker } from '../motion/number-ticker.js';
import { KpiChart } from '../pro/kpi-chart.js';

export type KpiStat = {
  id: string;
  label: string;
  series: number[];
  previous?: number;
  lowerIsBetter?: boolean;
};
export type KpiOverview = {
  labels: string[];
  current: number[];
  previous: number[];
  segments?: Record<string, { current: number[]; previous: number[] }>;
};
export type KpiFocus = { title: string; value: number; series: number[]; labels: string[] };
export type KpiBoardData = { stats: KpiStat[]; overview: KpiOverview; focus: KpiFocus };
export type KpiBoardProps = {
  data: Record<string, KpiBoardData>;
  ranges: { id: string; label: string }[];
  range?: string;
  defaultRange?: string;
  onRangeChange?: (id: string) => void;
  segments?: { id: string; label: string }[];
  segment?: string;
  defaultSegment?: string;
  onSegmentChange?: (id: string) => void;
  compareLabel?: string;
  currentLabel?: string;
  previousLabel?: string;
  formatMoney?: (value: number) => string;
  icon?: ReactNode;
  title?: string;
  setup?: { label: string; onClick: () => void };
  action?: { label: string; onClick: () => void };
  className?: string;
};

function dollars(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

/** Recreated from public KPI Board docs. Composes KPI Chart. Not Pro source. */
export function KpiBoard({
  data,
  ranges,
  range,
  defaultRange,
  onRangeChange,
  segments,
  segment,
  defaultSegment,
  onSegmentChange,
  compareLabel = 'vs. last period',
  currentLabel = 'This period',
  previousLabel = 'Last period',
  formatMoney = dollars,
  icon,
  title,
  setup,
  action,
  className,
}: KpiBoardProps) {
  const [internalRange, setInternalRange] = useState(defaultRange ?? ranges[0]?.id ?? '');
  const [internalSegment, setInternalSegment] = useState(defaultSegment ?? segments?.[0]?.id ?? '');
  const [openRange, setOpenRange] = useState(false);
  const [openSegment, setOpenSegment] = useState(false);
  const currentRange = range ?? internalRange;
  const currentSegment = segment ?? internalSegment;
  const pack = data[currentRange] ?? Object.values(data)[0];
  const overview = pack?.overview;
  const lines = overview?.segments?.[currentSegment] ?? {
    current: overview?.current ?? [],
    previous: overview?.previous ?? [],
  };

  function pickRange(id: string) {
    if (range === undefined) setInternalRange(id);
    onRangeChange?.(id);
    setOpenRange(false);
  }

  function pickSegment(id: string) {
    if (segment === undefined) setInternalSegment(id);
    onSegmentChange?.(id);
    setOpenSegment(false);
  }

  const stats = pack?.stats ?? [];
  const focus = pack?.focus;

  return (
    <section className={cn('grid min-w-0 gap-[var(--rui-content-gap)]', className)}>
      <Inline className="justify-between">
        {title ? <Heading size="item">{title}</Heading> : <span />}
        <Picker
          label="日期范围"
          open={openRange}
          value={ranges.find((item) => item.id === currentRange)?.label ?? currentRange}
          options={ranges}
          onOpen={setOpenRange}
          onPick={pickRange}
        />
      </Inline>
      <div className="grid gap-[var(--rui-content-gap)] @md:grid-cols-3">
        {stats.map((stat) => {
          const value = sum(stat.series);
          const previous = stat.previous ?? 0;
          const delta = value - previous;
          const good = stat.lowerIsBetter ? delta <= 0 : delta >= 0;
          return (
            <article
              key={stat.id}
              aria-label={stat.label}
              className="rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-content-padding)]"
            >
              <Text variant="caption" tone="muted">
                {stat.label}
              </Text>
              <Heading size="item">
                <NumberTicker value={value} format={{ maximumFractionDigits: 0 }} />
              </Heading>
              <Text variant="caption" className={good ? 'text-success' : 'text-destructive'}>
                {delta >= 0 ? '↑' : '↓'} {formatMoney(Math.abs(delta))} {compareLabel}
              </Text>
            </article>
          );
        })}
      </div>
      <div className="grid gap-[var(--rui-content-gap)] @lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="grid gap-2 rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-content-padding)]">
          {segments?.length ? (
            <Picker
              label="分段"
              open={openSegment}
              value={segments.find((item) => item.id === currentSegment)?.label ?? currentSegment}
              options={segments}
              onOpen={setOpenSegment}
              onPick={pickSegment}
            />
          ) : null}
          {overview ? (
            <KpiChart
              title={currentLabel}
              value={formatMoney(sum(lines.current))}
              labels={overview.labels}
              series={[
                { label: currentLabel, values: lines.current },
                { label: previousLabel, values: lines.previous },
              ]}
              format={formatMoney}
              footer={compareLabel}
            />
          ) : null}
        </div>
        {focus ? (
          <article
            aria-label={focus.title}
            className="grid content-start gap-2 rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-content-padding)]"
          >
            <Inline className="justify-between">
              <Inline>
                {icon}
                <Heading size="item">{focus.title}</Heading>
              </Inline>
              {setup ? (
                <Button type="button" size="xs" variant="ghost" onClick={setup.onClick}>
                  {setup.label}
                </Button>
              ) : null}
            </Inline>
            <Text>
              <NumberTicker value={focus.value} format={{ maximumFractionDigits: 0 }} />
            </Text>
            <KpiChart
              title={currentLabel}
              value={formatMoney(focus.value)}
              labels={focus.labels}
              series={[{ label: currentLabel, values: focus.series }]}
              format={formatMoney}
            />
            {action ? (
              <Button type="button" onClick={action.onClick}>
                {action.label}
              </Button>
            ) : null}
          </article>
        ) : null}
      </div>
    </section>
  );
}

function Picker({
  label,
  open,
  value,
  options,
  onOpen,
  onPick,
}: {
  label: string;
  open: boolean;
  value: string;
  options: { id: string; label: string }[];
  onOpen: (open: boolean) => void;
  onPick: (id: string) => void;
}) {
  const highlighted = useMemo(
    () => options.find((item) => item.label === value)?.id ?? options[0]?.id,
    [options, value],
  );
  return (
    <div className="relative">
      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => onOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen(true);
          }
          if (event.key === 'Escape') onOpen(false);
        }}
      >
        {value}
      </Button>
      {open ? (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-[var(--rui-z-popover)] mt-1 min-w-32 rounded-[var(--rui-radius)] border border-border bg-card p-1"
        >
          {options.map((item) => (
            <li key={item.id}>
              <Button
                type="button"
                size="xs"
                role="option"
                aria-selected={item.id === highlighted}
                variant={item.id === highlighted ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onPick(item.id)}
              >
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
