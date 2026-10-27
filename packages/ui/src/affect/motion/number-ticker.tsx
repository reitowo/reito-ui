import { useEffect, useMemo, useRef, useState } from 'react';
import { tokenMetrics } from '@reito/tokens/metrics';
import { cn } from '../../lib/utils.js';
import { usePrefersReducedMotion } from '../shared.js';

export type NumberTickerProps = {
  value: number;
  format?: Intl.NumberFormatOptions;
  locale?: string;
  duration?: number;
  delay?: number;
  className?: string;
};

/** Odometer-style count. Reduced motion shows the formatted value immediately. */
export function NumberTicker({
  value,
  format,
  locale,
  duration,
  delay = 0,
  className,
}: NumberTickerProps) {
  const reduced = usePrefersReducedMotion();
  const length = duration ?? tokenMetrics['motion-duration-lg'] * 3;
  const fmtKey = JSON.stringify(format ?? {});
  const formatValue = (next: number) => new Intl.NumberFormat(locale, format).format(next);
  const text = useMemo(() => formatValue(value), [value, locale, fmtKey]);
  const [display, setDisplay] = useState(() => (reduced ? text : formatValue(0)));
  const current = useRef(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      current.current = value;
      setDisplay(text);
      return;
    }
    const from = current.current;
    let frame = 0;
    const start = () => {
      const began = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - began) / Math.max(1, length));
        const eased = 1 - (1 - progress) ** 4;
        const next = from + (value - from) * eased;
        current.current = progress === 1 ? value : next;
        setDisplay(formatValue(current.current));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const wait = window.setTimeout(start, delay);
    return () => {
      window.clearTimeout(wait);
      cancelAnimationFrame(frame);
    };
  }, [value, text, length, delay, locale, fmtKey, reduced]);

  return <span className={cn('inline-flex tabular-nums', className)}>{display}</span>;
}
