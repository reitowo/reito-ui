import { useEffect, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { tokenMetrics } from '@reito/tokens/metrics';
import { cn } from '../../lib/utils.js';
import { usePrefersReducedMotion } from '../shared.js';

export type BlurCrossfadeProps = {
  id: string | number;
  children: ReactNode;
  duration?: number;
  blur?: number;
  morph?: 'height' | 'both' | 'none';
  as?: 'div' | 'span';
  className?: string;
};

/** Recreated from public Blur Crossfade docs. Reduced motion swaps instantly. */
export function BlurCrossfade({
  id,
  children,
  duration,
  blur,
  morph = 'height',
  as = 'div',
  className,
}: BlurCrossfadeProps) {
  const Tag = as as ElementType;
  const reduced = usePrefersReducedMotion();
  const length = duration ?? tokenMetrics['motion-duration-lg'] + tokenMetrics['motion-duration'];
  const haze = blur ?? tokenMetrics['space-3'];
  const [current, setCurrent] = useState({ id, children });
  const [leaving, setLeaving] = useState<ReactNode>(null);

  useEffect(() => {
    if (id === current.id) {
      setCurrent({ id, children });
      return;
    }
    if (reduced) {
      setCurrent({ id, children });
      setLeaving(null);
      return;
    }
    setLeaving(current.children);
    setCurrent({ id, children });
    const timer = window.setTimeout(() => setLeaving(null), length);
    return () => window.clearTimeout(timer);
  }, [children, current.children, current.id, id, length, reduced]);

  const style = {
    '--affect-blur': `calc(${haze} * 1px)`,
    '--affect-crossfade': `calc(${length} * 1ms)`,
  } as CSSProperties;

  return (
    <Tag
      className={cn(
        'relative inline-grid overflow-hidden align-middle',
        morph === 'both' && 'w-max',
        className,
      )}
      style={style}
    >
      {leaving && !reduced ? (
        <span
          aria-hidden="true"
          className="col-start-1 row-start-1 blur-[length:var(--affect-blur)] opacity-0"
          style={{ transition: `opacity var(--affect-crossfade), filter var(--affect-crossfade)` }}
        >
          {leaving}
        </span>
      ) : null}
      <span className="col-start-1 row-start-1">{current.children}</span>
    </Tag>
  );
}
