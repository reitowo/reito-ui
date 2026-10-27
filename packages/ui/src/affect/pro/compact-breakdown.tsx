import { useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';

export type BreakdownItem = { id?: string; label: string; value: number; color?: string };
export type CompactBreakdownProps = {
  items: BreakdownItem[];
  title?: string;
  periods?: { id: string; label: string }[];
  period?: string;
  defaultPeriod?: string;
  onPeriodChange?: (id: string) => void;
  delta?: number;
  format?: (value: number) => string;
  totalLabel?: string;
  footer?: ReactNode | null;
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

/** Recreated from public Compact Breakdown docs. Not Pro source. */
export function CompactBreakdown({
  items,
  title = '构成',
  periods,
  period,
  defaultPeriod,
  onPeriodChange,
  delta,
  format = (value) => Math.round(value).toLocaleString(),
  totalLabel = '合计',
  footer,
  className,
}: CompactBreakdownProps) {
  const [internalPeriod, setInternalPeriod] = useState(defaultPeriod ?? periods?.[0]?.id);
  const [focus, setFocus] = useState<string | null>(null);
  const current = period ?? internalPeriod;
  const ranked = [...items].sort((left, right) => right.value - left.value);
  const total = ranked.reduce((sum, item) => sum + item.value, 0);
  const focused = ranked.find((item) => (item.id ?? item.label) === focus);

  function setPeriod(id: string) {
    if (period === undefined) setInternalPeriod(id);
    onPeriodChange?.(id);
  }

  return (
    <section
      aria-label={title}
      className={cn(
        'grid max-w-sm gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        {periods?.length ? (
          <div role="radiogroup" aria-label="周期" className="flex gap-1">
            {periods.map((item) => (
              <Button
                key={item.id}
                type="button"
                size="xs"
                role="radio"
                aria-checked={current === item.id}
                variant={current === item.id ? 'secondary' : 'ghost'}
                onClick={() => setPeriod(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        ) : null}
      </Inline>
      <Stack gap="small">
        <Inline>
          <Text variant="interface" aria-hidden="true">
            {format(focused?.value ?? total)}
          </Text>
          {delta != null ? (
            <Badge variant={delta >= 0 ? 'secondary' : 'destructive'}>
              {delta >= 0 ? '+' : ''}
              {delta}%
            </Badge>
          ) : null}
        </Inline>
        <Text variant="caption" tone="muted">
          {focused ? focused.label : totalLabel}
        </Text>
        <div className="flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          {ranked.map((item, index) => (
            <span
              key={item.id ?? item.label}
              className={cn('h-full', tones[index % tones.length])}
              style={{ width: `${total ? (item.value / total) * 100 : 0}%` }}
            />
          ))}
        </div>
      </Stack>
      <ul className="grid gap-1">
        {ranked.map((item, index) => {
          const id = item.id ?? item.label;
          const share = total ? Math.round((item.value / total) * 100) : 0;
          return (
            <li key={id}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-[var(--rui-radius)] px-1 py-1 text-left"
                onFocus={() => setFocus(id)}
                onBlur={() => setFocus(null)}
                onMouseEnter={() => setFocus(id)}
                onMouseLeave={() => setFocus(null)}
              >
                <Inline>
                  <span className={cn('size-2 rounded-full', tones[index % tones.length])} />
                  <Text as="span" variant="caption">
                    {item.label}
                  </Text>
                </Inline>
                <Text as="span" variant="caption" tone="muted">
                  {format(item.value)} · {share}%
                </Text>
              </button>
            </li>
          );
        })}
      </ul>
      {footer === null ? null : (
        <Text variant="caption" tone="muted">
          {footer ?? `最大：${ranked[0]?.label ?? '—'}`}
        </Text>
      )}
      <span className="sr-only">
        {totalLabel} {format(total)}
        {delta != null ? `，变化 ${delta}%` : ''}
      </span>
    </section>
  );
}
