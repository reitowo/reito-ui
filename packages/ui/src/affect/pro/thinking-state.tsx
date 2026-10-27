import { useEffect, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../primitives/collapsible.js';
import { cn } from '../../lib/utils.js';
import { formatDuration, usePrefersReducedMotion } from '../shared.js';
import { ShimmerText } from '../motion/shimmer-loader.js';

export type ThinkingSource = { label: string; href?: string; hint?: string };
export type ThinkingStep = {
  id?: string;
  title: string;
  sources?: ThinkingSource[];
  moreSources?: ThinkingSource[];
};
export type ThinkingStateProps = {
  steps: ThinkingStep[];
  doneLabel?: string;
  stepMs?: number;
  loop?: boolean;
  onDone?: (seconds: number) => void;
  className?: string;
};

/** Recreated from public Thinking State docs. Not Pro source. */
export function ThinkingState({
  steps,
  doneLabel = '思考完成',
  stepMs = 1300,
  loop = false,
  onDone,
  className,
}: ThinkingStateProps) {
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(reduced ? steps.length : 1);
  const [open, setOpen] = useState(true);
  const [started] = useState(() => Date.now());
  const [done, setDone] = useState(reduced);
  const [extra, setExtra] = useState<string | null>(null);
  const seconds = Math.max(1, Math.round((Date.now() - started) / 1000));

  useEffect(() => {
    if (reduced) {
      onDone?.(seconds);
      return;
    }
    if (visible >= steps.length) {
      setDone(true);
      onDone?.(seconds);
      if (!loop) return;
      const restart = window.setTimeout(() => {
        setVisible(1);
        setDone(false);
      }, 2400);
      return () => window.clearTimeout(restart);
    }
    const timer = window.setTimeout(() => setVisible((count) => count + 1), Math.max(400, stepMs));
    return () => window.clearTimeout(timer);
  }, [visible, steps.length, stepMs, loop, reduced, onDone, seconds]);

  const shown = steps.slice(0, visible);
  const latest = shown[shown.length - 1];

  return (
    <section
      aria-label="思考状态"
      className={cn('rounded-[var(--rui-radius-surface)] border border-border bg-card', className)}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 p-[var(--rui-content-padding)] text-left focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring">
          <Inline>
            {done ? <Check className="size-4 text-success" aria-hidden="true" /> : null}
            <Heading size="item">
              {done ? (
                `${doneLabel} · ${formatDuration(seconds)}`
              ) : (
                <ShimmerText>思考中 {formatDuration(seconds)}</ShimmerText>
              )}
            </Heading>
          </Inline>
          <ChevronDown className={cn('size-3.5 text-muted-foreground', !open && '-rotate-90')} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ol
            className="grid gap-[var(--rui-content-gap-sm)] px-[var(--rui-content-padding)] pb-[var(--rui-content-padding)]"
            aria-live="polite"
          >
            {shown.map((step, index) => (
              <li key={step.id ?? step.title} className="grid gap-1">
                <Text variant="interface">
                  {index + 1}. {step.title}
                </Text>
                {step.sources?.length ? (
                  <Inline>
                    {step.sources.map((source) =>
                      source.href ? (
                        <a
                          key={source.label}
                          href={source.href}
                          title={source.hint}
                          className="rounded-full border border-border px-2 py-0.5 text-[length:var(--rui-font-caption)] hover:bg-muted"
                        >
                          {source.label}
                        </a>
                      ) : (
                        <span
                          key={source.label}
                          className="rounded-full border border-border px-2 py-0.5 text-[length:var(--rui-font-caption)]"
                        >
                          {source.label}
                        </span>
                      ),
                    )}
                    {step.moreSources?.length && extra !== step.title ? (
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        onClick={() => setExtra(step.title)}
                      >
                        +{step.moreSources.length}
                      </Button>
                    ) : null}
                    {extra === step.title
                      ? step.moreSources?.map((source) => (
                          <span
                            key={source.label}
                            className="rounded-full border border-border px-2 py-0.5 text-[length:var(--rui-font-caption)]"
                          >
                            {source.label}
                          </span>
                        ))
                      : null}
                  </Inline>
                ) : null}
              </li>
            ))}
            {latest && !done ? (
              <li className="text-[length:var(--rui-font-caption)] text-muted-foreground">
                正在 {latest.title}…
              </li>
            ) : null}
          </ol>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
