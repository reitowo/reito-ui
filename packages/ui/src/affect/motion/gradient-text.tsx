import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { usePrefersReducedMotion } from '../shared.js';

export type GradientTextProps = {
  children: ReactNode;
  colors?: string[];
  speed?: number;
  sweep?: boolean;
  as?: 'span' | 'h1' | 'h2' | 'p';
  className?: string;
};

/** Recreated from public Gradient Text docs. Hex colors are ignored. */
export function GradientText({
  children,
  speed = 8,
  sweep = true,
  as = 'span',
  className,
}: GradientTextProps) {
  const Tag = as as ElementType;
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(!sweep || reduced);

  useEffect(() => {
    if (!sweep || reduced) return;
    const node = root.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.intersectionRatio >= 0.6)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, sweep]);

  return (
    <Tag
      ref={root}
      className={cn(
        'relative inline-block bg-clip-text text-transparent',
        !reduced && seen && 'animate-[affect-marquee_var(--affect-text-duration)_linear_infinite]',
        className,
      )}
      style={{
        '--affect-text-duration': `${Math.max(1, speed)}s`,
        backgroundImage:
          'linear-gradient(90deg, var(--rui-accent), var(--rui-primary), var(--rui-accent))',
        backgroundSize: '200% 100%',
        backgroundPosition: seen || reduced ? '0 0' : '100% 0',
      }}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0">
        {children}
      </span>
    </Tag>
  );
}
