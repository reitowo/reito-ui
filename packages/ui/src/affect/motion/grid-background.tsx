import type { CSSProperties, ReactNode } from 'react';
import { tokenMetrics } from '@reito/tokens/metrics';
import { cn } from '../../lib/utils.js';
import { usePrefersReducedMotion } from '../shared.js';

export type GridDirection = 'up' | 'down' | 'left' | 'right' | 'diagonal';
export type GridBackgroundProps = {
  children?: ReactNode;
  size?: number;
  color?: string;
  speed?: number;
  direction?: GridDirection;
  reveal?: boolean;
  fade?: number;
  className?: string;
};

const offsets: Record<GridDirection, string> = {
  up: '0 100%',
  down: '0 -100%',
  left: '100% 0',
  right: '-100% 0',
  diagonal: '100% -100%',
};

/** Drifting line grid behind content. Reduced motion keeps the grid still. */
export function GridBackground({
  children,
  size,
  color,
  speed = 16,
  direction = 'diagonal',
  reveal = false,
  fade = 70,
  className,
}: GridBackgroundProps) {
  const reduced = usePrefersReducedMotion();
  const cell =
    size == null
      ? 'var(--rui-space-6)'
      : `calc(${size} * var(--rui-space-1) / ${tokenMetrics['space-1']})`;
  const style = {
    '--affect-grid-size': cell,
    '--affect-grid-fade': `${Math.min(100, Math.max(0, fade))}%`,
    '--affect-grid-color': color || 'var(--rui-border)',
    '--affect-grid-shift': offsets[direction],
    '--affect-grid-duration': `${Math.max(1, speed)}s`,
  } as CSSProperties;

  return (
    <div
      className={cn('relative isolate min-h-[var(--rui-container-xs)] overflow-hidden', className)}
      style={style}
    >
      <div
        aria-hidden="true"
        className={cn(
          'affect-grid-lines pointer-events-none absolute inset-0',
          '[mask-image:radial-gradient(circle,CanvasText_var(--affect-grid-fade),transparent_100%)]',
          !reduced &&
            speed > 0 &&
            'animate-[affect-grid_var(--affect-grid-duration)_linear_infinite]',
          reveal &&
            !reduced &&
            'animate-[affect-grid-reveal_var(--rui-motion-duration-lg)_ease-out]',
        )}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
