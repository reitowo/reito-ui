import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { formatDollars, formatDuration } from '../shared.js';

export type Attempt = {
  id: string;
  name: string;
  approach: string;
  model?: string;
  icon?: ReactNode;
  status: 'running' | 'done' | 'failed';
  progress?: number;
  step?: string;
  score?: number;
  note?: string;
  took?: number;
  cost?: number;
};
export type ParallelAttemptsProps = {
  attempts: Attempt[];
  task?: string;
  picked?: string | null;
  onPick?: (attempt: Attempt) => void;
  formatCost?: (amount: number) => string;
  title?: string;
  className?: string;
};

/** Recreated from public Parallel Attempts docs. Not Pro source. */
export function ParallelAttempts({
  attempts,
  task,
  picked,
  onPick,
  formatCost = formatDollars,
  title = 'Best of N',
  className,
}: ParallelAttemptsProps) {
  const finished = attempts.filter((item) => item.status === 'done' && item.score != null);
  const best = useMemo(
    () => finished.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0],
    [finished],
  );
  const [internal, setInternal] = useState<string | null>(null);
  const current = picked === undefined ? (internal ?? best?.id ?? null) : picked;

  return (
    <section
      className={cn(
        'grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        {task ? (
          <Text as="span" variant="caption" tone="muted">
            {task}
          </Text>
        ) : null}
      </Inline>
      <div role="radiogroup" aria-label={title} className="@container grid gap-2">
        {attempts.map((attempt) => {
          const selected = current === attempt.id;
          const width = `${Math.round(Math.min(1, Math.max(0, attempt.progress ?? (attempt.status === 'done' ? 1 : 0))) * 100)}%`;
          return (
            <div
              key={attempt.id}
              className={cn(
                'grid gap-1 rounded-[var(--rui-radius)] border border-border p-2 @md:grid-cols-[minmax(0,var(--rui-container-3xs))_minmax(0,1fr)_auto] @md:items-center',
                selected && 'bg-success/10',
                !selected && attempt.status === 'done' && 'opacity-80 hover:opacity-100',
              )}
            >
              <Inline>
                {attempt.icon}
                <Text as="span" variant="interface">
                  {attempt.name}
                </Text>
                {best?.id === attempt.id ? <Badge variant="secondary">最佳</Badge> : null}
                <Text as="span" variant="caption" tone="muted" className="@md:inline hidden">
                  {attempt.approach}
                </Text>
              </Inline>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                aria-hidden="true"
              >
                <div
                  className={cn(
                    'h-full rounded-full',
                    attempt.status === 'failed' && 'bg-destructive',
                    attempt.status === 'done' && 'bg-success',
                    attempt.status === 'running' && 'bg-primary',
                  )}
                  style={{ width }}
                />
              </div>
              <Inline className="justify-end">
                {attempt.status === 'running' ? (
                  <Text as="span" variant="caption" tone="muted">
                    {attempt.step ?? '进行中'}
                  </Text>
                ) : (
                  <>
                    {attempt.score != null ? (
                      <Text as="span" variant="interface">
                        {attempt.score}
                      </Text>
                    ) : null}
                    {attempt.took != null ? (
                      <Text as="span" variant="caption" tone="muted">
                        {formatDuration(Math.round(attempt.took / 1000))}
                      </Text>
                    ) : null}
                    {attempt.cost != null ? (
                      <Text as="span" variant="caption" tone="muted">
                        {formatCost(attempt.cost)}
                      </Text>
                    ) : null}
                    {attempt.status === 'done' ? (
                      <Button
                        type="button"
                        size="xs"
                        variant={selected ? 'secondary' : 'ghost'}
                        role="radio"
                        aria-checked={selected}
                        onClick={() => {
                          if (picked === undefined) setInternal(attempt.id);
                          onPick?.(attempt);
                        }}
                      >
                        用这个
                      </Button>
                    ) : (
                      <Badge variant="destructive">失败</Badge>
                    )}
                  </>
                )}
              </Inline>
              {attempt.note ? (
                <Text variant="caption" tone="muted" className="@md:col-span-3">
                  {attempt.note}
                </Text>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
