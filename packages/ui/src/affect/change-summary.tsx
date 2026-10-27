import { ArrowDownRight, ArrowUpRight, Minus, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../basic/composition.js';
import { cn } from '../lib/utils.js';
import { cardClass, surfaceClass, type AffectAppearance } from './shared.js';

export type MetricChange = {
  label: string;
  change: string;
  tone?: 'good' | 'bad' | 'neutral';
  direction?: 'up' | 'down';
};

export type ChangeSummaryProps = {
  title?: string;
  period?: string;
  icon?: ReactNode;
  changes: MetricChange[];
  appearance?: AffectAppearance;
  className?: string;
};

/** One metric per row with a semantic trend mark. */
export function ChangeSummary({
  title = '近期变化',
  period,
  icon,
  changes,
  appearance = 'default',
  className,
}: ChangeSummaryProps) {
  return (
    <section aria-label={title} className={cn(surfaceClass(appearance), className)}>
      <Stack gap="small" className={cn(cardClass(appearance), 'p-[var(--rui-content-padding)]')}>
        <Inline className="justify-between">
          <Inline>
            <span className="text-muted-foreground" aria-hidden="true">
              {icon ?? <Sparkles className="size-4" />}
            </span>
            <Heading size="item">{title}</Heading>
          </Inline>
          {period ? (
            <Text as="span" variant="caption" tone="muted">
              {period}
            </Text>
          ) : null}
        </Inline>
        {changes.length ? (
          <dl className="grid gap-[var(--rui-content-gap-sm)]">
            {changes.map((item) => {
              const tone = item.tone === 'good' || item.tone === 'bad' ? item.tone : 'neutral';
              const down = (item.direction ?? (tone === 'bad' ? 'down' : 'up')) === 'down';
              const toneClass =
                tone === 'good'
                  ? 'text-success'
                  : tone === 'bad'
                    ? 'text-destructive'
                    : 'text-muted-foreground';
              return (
                <div key={item.label} className="flex min-w-0 items-baseline justify-between gap-2">
                  <dt className="min-w-0 truncate text-[length:var(--rui-font-interface)]">
                    {item.label}
                  </dt>
                  <dd className="flex min-w-0 items-center gap-1">
                    <span className={toneClass} aria-hidden="true">
                      {tone === 'neutral' ? (
                        <Minus className="size-3.5" />
                      ) : down ? (
                        <ArrowDownRight className="size-3.5" />
                      ) : (
                        <ArrowUpRight className="size-3.5" />
                      )}
                    </span>
                    <span className="truncate text-[length:var(--rui-font-interface)] text-muted-foreground">
                      {item.change}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        ) : null}
      </Stack>
    </section>
  );
}
