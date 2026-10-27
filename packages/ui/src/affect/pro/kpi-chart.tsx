import { useMemo, useState, type KeyboardEvent } from 'react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { cn } from '../../lib/utils.js';

export type KpiSeries = { label: string; color?: string; values: number[] };
export type KpiChartProps = {
  title: string;
  value: string;
  delta?: number;
  labels: string[];
  tooltipLabels?: string[];
  series: KpiSeries[];
  format?: (n: number) => string;
  footer?: string;
  defaultIndex?: number;
  className?: string;
};

const strokes = [
  'text-primary',
  'text-success',
  'text-warning',
  'text-info',
  'text-destructive',
  'text-muted-foreground',
];

function compact(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (abs >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}

/** Recreated from public KPI Chart docs. Not Pro source. Hex colors are ignored. */
export function KpiChart({
  title,
  value,
  delta,
  labels,
  tooltipLabels,
  series,
  format = compact,
  footer,
  defaultIndex,
  className,
}: KpiChartProps) {
  const last = Math.max(0, labels.length - 1);
  const [index, setIndex] = useState(defaultIndex ?? last);
  const [active, setActive] = useState(false);
  const width = 420;
  const height = 132;
  const pad = 10;
  const values = series.flatMap((item) => item.values);
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const x = (i: number) => pad + (i / Math.max(last, 1)) * (width - pad * 2);
  const y = (n: number) => height - pad - ((n - min) / (max - min || 1)) * (height - pad * 2);
  const heads = tooltipLabels ?? labels;
  const current = labels[index] ?? labels[last];
  const live = useMemo(() => {
    const parts = series.map((item) => `${item.label} ${format(item.values[index] ?? 0)}`);
    return `${heads[index] ?? current}：${parts.join('，')}`;
  }, [current, format, heads, index, series]);

  function move(next: number) {
    setIndex(Math.min(last, Math.max(0, next)));
    setActive(true);
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(index + 1);
    }
    if (event.key === 'Escape') setActive(false);
  }

  function fromClientX(clientX: number, target: HTMLElement) {
    const box = target.getBoundingClientRect();
    const ratio = (clientX - box.left) / Math.max(box.width, 1);
    return Math.round(ratio * last);
  }

  return (
    <article
      className={cn(
        'grid max-w-[var(--rui-container-sm)] gap-[var(--rui-content-gap-sm)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <div className="grid gap-1">
          <Text variant="caption" tone="muted">
            {title}
          </Text>
          <Heading size="section">{value}</Heading>
        </div>
        {delta != null ? (
          <Text variant="caption" className={delta >= 0 ? 'text-success' : 'text-destructive'}>
            {delta >= 0 ? '+' : ''}
            {format(delta)}
          </Text>
        ) : null}
      </Inline>
      <div
        role="img"
        tabIndex={0}
        aria-label={`${title} 折线图`}
        className="outline-none focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50"
        onKeyDown={onKey}
        onPointerLeave={() => setActive(false)}
        onPointerMove={(event) => {
          setActive(true);
          move(fromClientX(event.clientX, event.currentTarget));
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[calc(var(--rui-space-16)*2)] w-full"
          aria-hidden="true"
        >
          {active ? (
            <line
              x1={x(index)}
              x2={x(index)}
              y1={pad}
              y2={height - pad}
              className="stroke-border"
              strokeWidth="1"
            />
          ) : null}
          {series.map((item, seriesIndex) => (
            <polyline
              key={item.label}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={cn('motion-reduce:transition-none', strokes[seriesIndex % strokes.length])}
              points={item.values.map((n, i) => `${x(i)},${y(n)}`).join(' ')}
            />
          ))}
          {series.map((item, seriesIndex) => (
            <circle
              key={`${item.label}-dot`}
              cx={x(index)}
              cy={y(item.values[index] ?? 0)}
              r="3"
              fill="currentColor"
              className={strokes[seriesIndex % strokes.length]}
            />
          ))}
        </svg>
        <Inline className="justify-between">
          <Text variant="caption" tone="muted">
            {labels[0]}
          </Text>
          <Text variant="caption" tone="muted">
            {labels[Math.floor(last / 2)]}
          </Text>
          <Text variant="caption" tone="muted">
            {labels[last]}
          </Text>
        </Inline>
      </div>
      {active ? (
        <div className="rounded-[var(--rui-radius)] bg-muted p-2" role="status" aria-live="polite">
          <Text variant="caption">{live}</Text>
        </div>
      ) : (
        <p className="sr-only" aria-live="polite">
          {live}
        </p>
      )}
      <ul className="flex flex-wrap gap-[var(--rui-content-gap-sm)]">
        {series.map((item, seriesIndex) => (
          <li key={item.label} className="flex items-center gap-1">
            <span
              className={cn(
                'size-2 rounded-full bg-current',
                strokes[seriesIndex % strokes.length],
              )}
            />
            <Text variant="caption" tone="muted">
              {item.label}
            </Text>
          </li>
        ))}
      </ul>
      {footer ? (
        <Text variant="caption" tone="muted">
          {footer}
        </Text>
      ) : null}
    </article>
  );
}
