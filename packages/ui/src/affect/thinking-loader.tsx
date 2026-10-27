import { Check, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils.js';
import { formatDuration, usePrefersReducedMotion } from './shared.js';

export type ThinkingLoaderProps = {
  phases?: string[];
  interval?: number;
  phase?: number;
  loop?: boolean;
  done?: boolean;
  doneLabel?: string | ((seconds: number) => string);
  size?: 'sm' | 'md';
  variant?: 'pill' | 'plain';
  className?: string;
};

const defaultPhases = ['思考中', '检索来源', '阅读材料', '整理回答'];

/** Working pill with phase labels. Motion follows reduced-motion and token duration. */
export function ThinkingLoader({
  phases: phasesProp = defaultPhases,
  interval: intervalProp = 2200,
  phase,
  loop = false,
  done = false,
  doneLabel = (seconds) => `思考用时 ${formatDuration(seconds)}`,
  size = 'md',
  variant = 'pill',
  className,
}: ThinkingLoaderProps) {
  const given = Array.isArray(phasesProp) ? phasesProp.map((item) => String(item ?? '')) : [];
  const phases = given.length ? given : defaultPhases.slice(0, 1);
  const interval =
    Number.isFinite(intervalProp) && intervalProp > 0 ? Math.max(intervalProp, 200) : 2200;
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [started] = useState(() => Date.now());
  const [seconds, setSeconds] = useState<number | null>(null);
  const elapsed = seconds ?? Math.max(1, Math.round((Date.now() - started) / 1000));
  if (done && seconds === null) setSeconds(elapsed);
  if (!done && seconds !== null) setSeconds(null);

  useEffect(() => {
    if (done || (phase !== undefined && Number.isFinite(phase)) || phases.length < 2 || reduced)
      return;
    const id = window.setInterval(() => {
      setStep((current) => (current + 1 < phases.length ? current + 1 : loop ? 0 : current));
    }, interval);
    return () => window.clearInterval(id);
  }, [done, phase, phases.length, interval, loop, reduced]);

  const index =
    phase !== undefined && Number.isFinite(phase)
      ? Math.min(phases.length - 1, Math.max(0, Math.floor(phase)))
      : step;
  const label = done
    ? typeof doneLabel === 'function'
      ? doneLabel(elapsed)
      : doneLabel
    : phases[index];

  return (
    <div
      role="status"
      aria-live="polite"
      data-variant={variant}
      data-size={size}
      data-done={done || undefined}
      className={cn(
        'inline-flex max-w-full items-center gap-2 text-[length:var(--rui-font-interface)]',
        variant === 'pill' &&
          'rounded-full border border-border bg-card px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-cell-padding-y)]',
        size === 'sm' && 'text-[length:var(--rui-font-caption)]',
        className,
      )}
    >
      {done ? (
        <Check className="size-3.5 text-success" aria-hidden="true" />
      ) : (
        <LoaderCircle
          className={cn('size-3.5 text-muted-foreground', !reduced && 'animate-spin')}
          aria-hidden="true"
        />
      )}
      <span className="min-w-0 truncate">{label}</span>
    </div>
  );
}
