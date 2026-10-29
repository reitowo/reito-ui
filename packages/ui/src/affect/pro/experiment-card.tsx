import { useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';

export type ExperimentTone = 'red' | 'amber' | 'green' | 'blue' | 'violet' | 'gray';
export type ExperimentMetric = {
  id: string;
  label: string;
  format?: (value: number) => string;
  lowerIsBetter?: boolean;
};
export type ExperimentVariant = {
  id: string;
  key: string;
  name: string;
  values: Record<string, number>;
  control?: boolean;
  visitors?: number;
  confidence?: Record<string, number>;
  color?: string;
};
export type ExperimentCardProps = {
  title: string;
  variants: ExperimentVariant[];
  metrics: ExperimentMetric[];
  metric?: string;
  defaultMetric?: string;
  onMetricChange?: (id: string) => void;
  winner?: string | null;
  defaultWinner?: string | null;
  onWinnerChange?: (id: string | null) => void;
  status?: { label: string; tone?: ExperimentTone };
  note?: string;
  action?: {
    label: string | ((variant: ExperimentVariant) => string);
    onClick: (variant: ExperimentVariant) => void;
  };
  hint?: ReactNode;
  trigger?: 'hover' | 'click';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/** Recreated from public Experiment Card docs. Not Pro source. */
export function ExperimentCard({
  title,
  variants,
  metrics,
  metric,
  defaultMetric,
  onMetricChange,
  winner,
  defaultWinner = null,
  onWinnerChange,
  status,
  note,
  action,
  hint = '选出赢家',
  trigger = 'hover',
  open,
  defaultOpen = false,
  onOpenChange,
  className,
}: ExperimentCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalMetric, setInternalMetric] = useState(defaultMetric ?? metrics[0]?.id);
  const [internalWinner, setInternalWinner] = useState(defaultWinner);
  const expanded = open ?? internalOpen;
  const current = metric ?? internalMetric;
  const picked = winner === undefined ? internalWinner : winner;
  const measure = metrics.find((item) => item.id === current) ?? metrics[0];
  const format = measure.format ?? ((value: number) => String(value));
  const baseline = variants.find((item) => item.control) ?? variants[0];
  const lead = [...variants].sort((left, right) => {
    const delta = (right.values[current] ?? 0) - (left.values[current] ?? 0);
    return measure.lowerIsBetter ? -delta : delta;
  })[0];
  const max = Math.max(...variants.map((item) => item.values[current] ?? 0), 1);

  function setExpanded(next: boolean) {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }

  function setMeasure(id: string) {
    if (metric === undefined) setInternalMetric(id);
    onMetricChange?.(id);
  }

  function setWinner(id: string | null) {
    if (winner === undefined) setInternalWinner(id);
    onWinnerChange?.(id);
  }

  const chosen = variants.find((item) => item.id === picked);

  return (
    <article
      className={cn(
        'grid max-w-sm gap-[var(--rui-compact-surface-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-compact-surface-padding-y)] px-[var(--rui-compact-surface-padding-x)]',
        className,
      )}
      onMouseEnter={() => trigger === 'hover' && setExpanded(true)}
      onMouseLeave={() => trigger === 'hover' && setExpanded(false)}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={`${title}，${status?.label ?? ''}，领先 ${lead?.key ?? ''}`}
        className="grid w-full gap-1 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <Inline className="justify-between">
          <Heading size="item">{title}</Heading>
          {status ? (
            <Badge variant={status.tone === 'red' ? 'destructive' : 'secondary'}>
              {status.label}
            </Badge>
          ) : null}
        </Inline>
        <Inline>
          {note ? (
            <Text variant="caption" tone="muted">
              {note}
            </Text>
          ) : null}
          <div className="flex h-6 flex-1 items-end gap-1" aria-hidden="true">
            {variants.map((item) => (
              <span
                key={item.id}
                className={cn('w-full rounded-sm bg-muted', item.id === lead?.id && 'bg-primary')}
                style={{ height: `${((item.values[current] ?? 0) / max) * 100 || 8}%` }}
              />
            ))}
          </div>
        </Inline>
      </button>
      {expanded ? (
        <Stack
          gap="small"
          className="border-t border-border pt-[var(--rui-compact-surface-padding-y)]"
        >
          {metrics.length > 1 ? (
            <div role="radiogroup" aria-label="指标" className="flex gap-1">
              {metrics.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="xs"
                  role="radio"
                  aria-checked={current === item.id}
                  variant={current === item.id ? 'secondary' : 'ghost'}
                  onClick={() => setMeasure(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          ) : null}
          <div role="radiogroup" aria-label="方案">
            {variants.map((item) => {
              const value = item.values[current] ?? 0;
              const base = baseline.values[current] ?? 0;
              const delta = base ? ((value - base) / base) * 100 : 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={picked === item.id}
                  className={cn(
                    'flex w-full items-center justify-between rounded-[var(--rui-radius)] px-1 py-1 text-left',
                    picked === item.id && 'bg-muted',
                  )}
                  onClick={() => setWinner(picked === item.id ? null : item.id)}
                >
                  <Inline>
                    <Badge variant={item.control ? 'outline' : 'secondary'}>{item.key}</Badge>
                    <Text as="span" variant="caption">
                      {item.name}
                    </Text>
                  </Inline>
                  <Text as="span" variant="caption" tone="muted">
                    {format(value)}
                    {item.control ? ' · 对照' : ` · ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`}
                    {item.visitors ? ` · ${item.visitors}` : ''}
                  </Text>
                </button>
              );
            })}
          </div>
          <Inline className="justify-between">
            <Text variant="caption" tone="muted" aria-live="polite">
              {chosen ? `已选 ${chosen.key}` : hint}
            </Text>
            {chosen && action ? (
              <Button type="button" size="xs" onClick={() => action.onClick(chosen)}>
                {typeof action.label === 'function' ? action.label(chosen) : action.label}
              </Button>
            ) : null}
          </Inline>
        </Stack>
      ) : null}
    </article>
  );
}
