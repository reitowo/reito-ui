import { useEffect, useRef, useState, type ElementType } from 'react';
import { tokenMetrics } from '@reito/tokens/metrics';
import { cn } from '../../lib/utils.js';
import { usePrefersReducedMotion } from '../shared.js';

export type TextRevealProps = {
  text: string;
  by?: 'word' | 'char';
  stagger?: number;
  delay?: number;
  duration?: number;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span';
  once?: boolean;
  className?: string;
};

/** Reveals text piece by piece when it enters the viewport. */
export function TextReveal({
  text,
  by = 'word',
  stagger,
  delay = 0,
  duration,
  as = 'p',
  once = true,
  className,
}: TextRevealProps) {
  const Tag = as as ElementType;
  const reduced = usePrefersReducedMotion();
  const step = stagger ?? tokenMetrics['motion-duration'] / 2;
  const length = duration ?? tokenMetrics['motion-duration-lg'];
  const root = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(reduced);
  const pieces = by === 'char' ? Array.from(text) : text.split(/(\s+)/);

  useEffect(() => {
    if (reduced) return;
    const node = root.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) setVisible(false);
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, reduced]);

  return (
    <Tag ref={root} className={cn('min-w-0', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {pieces.map((piece, index) => (
          <span
            key={`${piece}-${index}`}
            className={cn(
              'inline-block motion-reduce:translate-y-0 motion-reduce:opacity-100',
              visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
            )}
            style={{
              transitionProperty: 'opacity, transform',
              transitionDuration: `calc(${length} * var(--rui-motion-duration) / ${tokenMetrics['motion-duration']})`,
              transitionTimingFunction: 'var(--rui-motion-easing)',
              transitionDelay: visible
                ? `calc(${delay + index * step} * var(--rui-motion-duration) / ${tokenMetrics['motion-duration']})`
                : '0',
            }}
          >
            {piece === ' ' ? '\u00a0' : piece}
          </span>
        ))}
      </span>
    </Tag>
  );
}
