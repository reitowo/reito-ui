import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';

export type BreakdownRecord = Record<string, string | number | undefined>;
export type Dimension = {
  key: string;
  label: string;
  values: string[];
  colors?: Record<string, string>;
  icons?: Record<string, ReactNode>;
};
export type Measure = { key: string; label: string; unit?: string; field?: string };
export type BreakdownChartProps = {
  records: BreakdownRecord[];
  dimensions: Dimension[];
  measures: Measure[];
  title?: string;
  defaultMeasure?: string;
  defaultSlice?: string;
  defaultSegment?: string;
  className?: string;
};

const tones = [
  'bg-primary',
  'bg-success',
  'bg-warning',
  'bg-info',
  'bg-destructive',
  'bg-muted-foreground',
];

function amount(record: BreakdownRecord, measure: Measure) {
  if (!measure.field) return 1;
  const value = record[measure.field];
  return typeof value === 'number' ? value : Number(value) || 0;
}

/** Recreated from public Breakdown Chart docs. Not Pro source. */
export function BreakdownChart({
  records,
  dimensions,
  measures,
  title = '工作量',
  defaultMeasure,
  defaultSlice,
  defaultSegment,
  className,
}: BreakdownChartProps) {
  const [measureKey, setMeasureKey] = useState(defaultMeasure ?? measures[0]?.key);
  const [sliceKey, setSliceKey] = useState(defaultSlice ?? dimensions[0]?.key);
  const [segmentKey, setSegmentKey] = useState(defaultSegment ?? dimensions[1]?.key ?? 'none');
  const [hidden, setHidden] = useState<string[]>([]);
  const [focus, setFocus] = useState<string | null>(null);
  const measure = measures.find((item) => item.key === measureKey) ?? measures[0];
  const slice = dimensions.find((item) => item.key === sliceKey) ?? dimensions[0];
  const segment = dimensions.find((item) => item.key === segmentKey);
  const segments = segment?.values ?? ['全部'];
  const rows = useMemo(() => {
    return slice.values.map((label) => {
      const matching = records.filter((record) => String(record[slice.key] ?? '') === label);
      const parts = segments.map((name) => {
        const value = matching
          .filter((record) => !segment || String(record[segment.key] ?? '') === name)
          .reduce((sum, record) => sum + amount(record, measure), 0);
        return { name, value };
      });
      return { label, total: parts.reduce((sum, part) => sum + part.value, 0), parts };
    });
  }, [records, slice, segment, segments, measure]);
  const max = Math.max(1, ...rows.map((row) => row.total));
  const legend = segments.filter((name) => !hidden.includes(name));

  return (
    <section
      className={cn(
        'grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        <Inline>
          {measures.map((item) => (
            <Button
              key={item.key}
              type="button"
              size="xs"
              variant={measureKey === item.key ? 'secondary' : 'ghost'}
              onClick={() => setMeasureKey(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </Inline>
      </Inline>
      <Inline>
        {dimensions.map((item) => (
          <Button
            key={`slice-${item.key}`}
            type="button"
            size="xs"
            variant={sliceKey === item.key ? 'secondary' : 'outline'}
            onClick={() => setSliceKey(item.key)}
          >
            切片 · {item.label}
          </Button>
        ))}
        <Button
          type="button"
          size="xs"
          variant={segmentKey === 'none' ? 'secondary' : 'outline'}
          onClick={() => setSegmentKey('none')}
        >
          不分段
        </Button>
        {dimensions.map((item) => (
          <Button
            key={`seg-${item.key}`}
            type="button"
            size="xs"
            variant={segmentKey === item.key ? 'secondary' : 'outline'}
            onClick={() => setSegmentKey(item.key)}
          >
            分段 · {item.label}
          </Button>
        ))}
      </Inline>
      <ul className="grid gap-2">
        {rows.map((row) => (
          <li key={row.label}>
            <button
              type="button"
              className="grid w-full gap-1 text-left"
              aria-label={`${row.label}，${row.total} ${measure.unit ?? ''}`}
              onFocus={() => setFocus(row.label)}
              onBlur={() => setFocus(null)}
              onMouseEnter={() => setFocus(row.label)}
              onMouseLeave={() => setFocus(null)}
            >
              <Inline className="justify-between">
                <Text variant="caption">{row.label}</Text>
                <Text variant="caption" tone="muted">
                  {row.total} {measure.unit}
                </Text>
              </Inline>
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                {row.parts
                  .filter((part) => legend.includes(part.name))
                  .map((part, index) => (
                    <span
                      key={part.name}
                      className={cn(
                        'h-full',
                        tones[index % tones.length],
                        focus && focus !== row.label && 'opacity-40',
                      )}
                      style={{ width: `${(part.value / max) * 100}%` }}
                    />
                  ))}
              </div>
            </button>
          </li>
        ))}
      </ul>
      <Inline>
        {segments.map((name, index) => (
          <Button
            key={name}
            type="button"
            size="xs"
            variant={hidden.includes(name) ? 'ghost' : 'secondary'}
            aria-pressed={!hidden.includes(name)}
            onClick={() =>
              setHidden((current) =>
                current.includes(name)
                  ? current.filter((item) => item !== name)
                  : [...current, name],
              )
            }
          >
            <span className={cn('inline-block size-2 rounded-full', tones[index % tones.length])} />
            {name}
          </Button>
        ))}
      </Inline>
      <table className="w-full text-left text-[length:var(--rui-font-caption)]">
        <caption className="sr-only">{title} 明细</caption>
        <thead>
          <tr>
            <th className="border-b border-border py-1 font-medium">{slice.label}</th>
            {legend.map((name) => (
              <th key={name} className="border-b border-border py-1 font-medium">
                {name}
              </th>
            ))}
            <th className="border-b border-border py-1 font-medium">合计</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={focus === row.label ? 'bg-muted' : undefined}>
              <td className="border-b border-border py-1">{row.label}</td>
              {legend.map((name) => (
                <td key={name} className="border-b border-border py-1">
                  {row.parts.find((part) => part.name === name)?.value ?? 0}
                </td>
              ))}
              <td className="border-b border-border py-1">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
