import { useMemo, useState } from 'react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { NumberTicker } from '../motion/number-ticker.js';
import { KpiChart } from '../pro/kpi-chart.js';
import { SegmentedControl } from '../segmented-control.js';

export type MetricsRange = '7d' | '30d' | '90d';
export type MetricsMetric = 'revenue' | 'orders' | 'aov' | 'refunds';
export type MetricsDashboardProps = {
  title?: string;
  site?: string;
  defaultRange?: MetricsRange;
  defaultMetric?: MetricsMetric;
  onExport?: (range: MetricsRange, metric: MetricsMetric) => void;
  className?: string;
};

const labels = {
  '7d': ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  '30d': ['W1', 'W2', 'W3', 'W4'],
  '90d': ['1 月', '2 月', '3 月'],
} as const;

const series: Record<MetricsRange, Record<MetricsMetric, number[]>> = {
  '7d': {
    revenue: [4200, 4600, 4100, 5100, 5300, 3900, 4700],
    orders: [38, 41, 36, 44, 48, 29, 40],
    aov: [110, 112, 114, 116, 110, 134, 118],
    refunds: [4, 3, 5, 2, 3, 6, 2],
  },
  '30d': {
    revenue: [18400, 19600, 18800, 21400],
    orders: [160, 172, 168, 190],
    aov: [115, 114, 112, 113],
    refunds: [12, 9, 11, 8],
  },
  '90d': {
    revenue: [54000, 58000, 61200],
    orders: [480, 510, 540],
    aov: [112, 114, 113],
    refunds: [28, 24, 21],
  },
};

const metricLabel: Record<MetricsMetric, string> = {
  revenue: '收入',
  orders: '订单',
  aov: '客单价',
  refunds: '退款',
};

const products = [
  { name: '席位', share: 46 },
  { name: '支持', share: 28 },
  { name: '用量', share: 16 },
];
const channels = [
  { name: '自然搜索', share: 41 },
  { name: '付费', share: 33 },
  { name: '推荐', share: 26 },
];

function format(metric: MetricsMetric, value: number) {
  if (metric === 'revenue' || metric === 'aov') return `$${value.toLocaleString()}`;
  return String(value);
}

/** Recreated from public Metrics Dashboard docs. Not Pro source. */
export function MetricsDashboard({
  title = 'Sales',
  site = 'Northwind Store',
  defaultRange = '30d',
  defaultMetric = 'revenue',
  onExport,
  className,
}: MetricsDashboardProps) {
  const [range, setRange] = useState<MetricsRange>(defaultRange);
  const [metric, setMetric] = useState<MetricsMetric>(defaultMetric);
  const [chart, setChart] = useState<'line' | 'bar'>('line');
  const [compare, setCompare] = useState(true);
  const [exported, setExported] = useState(false);
  const [point, setPoint] = useState<number | null>(null);
  const values = series[range][metric];
  const labelsFor = labels[range];
  const previous = values.map((value) => Math.round(value * 0.86));
  const total = values.reduce((sum, value) => sum + value, 0);
  const last = previous.reduce((sum, value) => sum + value, 0);
  const delta = total - last;
  const lowerBetter = metric === 'refunds';
  const good = lowerBetter ? delta <= 0 : delta >= 0;
  const inspected = point ?? values.length - 1;
  const live = useMemo(
    () =>
      `${labelsFor[inspected]} ${metricLabel[metric]} ${format(metric, values[inspected] ?? 0)}`,
    [inspected, labelsFor, metric, values],
  );

  return (
    <section className={cn('grid min-w-0 gap-[var(--rui-content-gap)]', className)}>
      <Inline className="justify-between">
        <div>
          <Heading size="item">{title}</Heading>
          <Text variant="caption" tone="muted">
            {site}
          </Text>
        </div>
        <Inline>
          <SegmentedControl
            aria-label="周期"
            size="sm"
            value={range}
            onChange={setRange}
            options={[
              { value: '7d', label: '周' },
              { value: '30d', label: '月' },
              { value: '90d', label: '季' },
            ]}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setExported(true);
              onExport?.(range, metric);
            }}
          >
            {exported ? '已导出' : '导出'}
          </Button>
        </Inline>
      </Inline>
      <div
        role="tablist"
        aria-label="指标"
        className="grid gap-[var(--rui-content-gap-sm)] @md:grid-cols-4"
      >
        {(Object.keys(metricLabel) as MetricsMetric[]).map((item) => {
          const itemTotal = series[range][item].reduce((sum, value) => sum + value, 0);
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={metric === item}
              onClick={() => setMetric(item)}
              className={cn(
                'rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-content-padding)] text-left',
                metric === item ? 'opacity-100' : 'opacity-60',
              )}
            >
              <Text variant="caption" tone="muted">
                {metricLabel[item]}
              </Text>
              <Heading size="item">
                <NumberTicker value={itemTotal} format={{ maximumFractionDigits: 0 }} />
              </Heading>
            </button>
          );
        })}
      </div>
      <div
        className="grid gap-2 rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-content-padding)]"
        tabIndex={0}
        aria-label={`${metricLabel[metric]} ${range}`}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') setPoint(Math.max(0, inspected - 1));
          if (event.key === 'ArrowRight') setPoint(Math.min(values.length - 1, inspected + 1));
          if (event.key === 'Home') setPoint(0);
          if (event.key === 'End') setPoint(values.length - 1);
        }}
      >
        <Inline className="justify-between">
          <div className="flex gap-1">
            <Button
              type="button"
              size="xs"
              variant={chart === 'line' ? 'secondary' : 'ghost'}
              aria-pressed={chart === 'line'}
              onClick={() => setChart('line')}
            >
              折线
            </Button>
            <Button
              type="button"
              size="xs"
              variant={chart === 'bar' ? 'secondary' : 'ghost'}
              aria-pressed={chart === 'bar'}
              onClick={() => setChart('bar')}
            >
              柱状
            </Button>
          </div>
          <Button
            type="button"
            size="xs"
            variant={compare ? 'secondary' : 'ghost'}
            aria-pressed={compare}
            onClick={() => setCompare((value) => !value)}
          >
            对比
          </Button>
        </Inline>
        <KpiChart
          title={metricLabel[metric]}
          value={format(metric, total)}
          delta={delta}
          labels={[...labelsFor]}
          series={[
            { label: metricLabel[metric], values },
            ...(compare ? [{ label: '上期', values: previous }] : []),
          ]}
          defaultIndex={inspected}
          format={(value) => format(metric, value)}
        />
        <Text
          variant="caption"
          className={good ? 'text-success' : 'text-destructive'}
          role="status"
        >
          {delta >= 0 ? '上升' : '下降'} {format(metric, Math.abs(delta))} · {live}
        </Text>
      </div>
      <div className="grid gap-[var(--rui-content-gap)] @md:grid-cols-2">
        <Rank title="热门产品" items={products} />
        <Rank title="渠道" items={channels} />
      </div>
    </section>
  );
}

function Rank({ title, items }: { title: string; items: { name: string; share: number }[] }) {
  return (
    <article className="grid gap-2 rounded-[var(--rui-radius)] border border-border bg-card p-[var(--rui-content-padding)]">
      <Heading size="item">{title}</Heading>
      {items.map((item) => (
        <div key={item.name} className="grid gap-1">
          <Inline className="justify-between">
            <Text variant="caption">{item.name}</Text>
            <Text variant="caption">
              <NumberTicker value={item.share} format={{ maximumFractionDigits: 0 }} />%
            </Text>
          </Inline>
          <div className="h-1 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${item.share}%` }} />
          </div>
        </div>
      ))}
    </article>
  );
}
