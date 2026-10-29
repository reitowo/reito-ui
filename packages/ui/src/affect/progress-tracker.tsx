import { useEffect, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../basic/composition.js';
import { Progress } from '../primitives/progress.js';
import { cn } from '../lib/utils.js';
import {
  cardClass,
  surfaceClass,
  type AffectAppearance,
  usePrefersReducedMotion,
} from './shared.js';

export type ProgressStep = {
  id: string;
  label: string;
  done?: boolean;
  icon?: ReactNode;
};

export type ProgressTrackerProps = {
  title?: string;
  steps: ProgressStep[];
  autoPlay?: boolean;
  interval?: number;
  onChange?: (steps: ProgressStep[]) => void;
  appearance?: AffectAppearance;
  className?: string;
};

/** Onboarding checklist with a token-backed progress bar. */
export function ProgressTracker({
  title = '入门清单',
  steps,
  autoPlay = false,
  interval = 1600,
  onChange,
  appearance = 'default',
  className,
}: ProgressTrackerProps) {
  const reduced = usePrefersReducedMotion();
  const [items, setItems] = useState(steps);
  const [paused, setPaused] = useState(!autoPlay || reduced);
  const finished = items.filter((step) => step.done).length;
  const value = items.length ? Math.round((finished / items.length) * 100) : 0;

  useEffect(() => setItems(steps), [steps]);
  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setInterval(
      () => {
        setItems((current) => {
          const nextOpen = current.findIndex((step) => !step.done);
          const next =
            nextOpen === -1
              ? current.map((step, index) => ({ ...step, done: index === 0 }))
              : current.map((step, index) => (index === nextOpen ? { ...step, done: true } : step));
          onChange?.(next);
          return next;
        });
      },
      Math.max(400, interval),
    );
    return () => window.clearInterval(id);
  }, [paused, interval, onChange, reduced]);

  function toggle(id: string) {
    setPaused(true);
    setItems((current) => {
      const next = current.map((step) => (step.id === id ? { ...step, done: !step.done } : step));
      onChange?.(next);
      return next;
    });
  }

  return (
    <section aria-label={title} className={cn(surfaceClass(appearance), className)}>
      <Stack className={cn(cardClass(appearance), 'p-[var(--rui-content-padding)]')}>
        <Inline className="justify-between">
          <Heading size="item">{title}</Heading>
          <Text as="span" variant="caption" tone="muted">
            {finished} / {items.length}
          </Text>
        </Inline>
        <Progress value={value} aria-label={`${title}进度`} />
        <ul className="grid gap-[var(--rui-content-gap-sm)]">
          {items.map((step) => (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => toggle(step.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-[var(--rui-radius)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-left',
                  'hover:bg-muted focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring',
                )}
              >
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-full border',
                    step.done ? 'border-success bg-success-soft text-success' : 'border-border',
                  )}
                  aria-hidden="true"
                >
                  {step.done ? <Check className="size-3" /> : null}
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 text-[length:var(--rui-font-interface)]',
                    step.done && 'text-muted-foreground line-through',
                  )}
                >
                  {step.label}
                </span>
                {step.icon}
              </button>
            </li>
          ))}
        </ul>
      </Stack>
    </section>
  );
}
