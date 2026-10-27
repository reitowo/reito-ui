import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import { usePrefersReducedMotion } from '../shared.js';

export type GradientFloorProps = {
  children?: ReactNode;
  colors?: [string, string, string];
  speed?: number;
  className?: string;
};

/** Recreated from public Gradient Floor docs. Hex colors are ignored. */
export function GradientFloor({ children, speed = 3, className }: GradientFloorProps) {
  const reduced = usePrefersReducedMotion();
  const style = {
    '--affect-floor-duration': `${Math.max(0, speed)}s`,
  } as CSSProperties;

  return (
    <div
      className={cn(
        'relative isolate min-h-[var(--rui-container-xs)] overflow-hidden bg-background',
        className,
      )}
      style={style}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,var(--rui-accent-soft),transparent_70%)]',
          !reduced &&
            speed > 0 &&
            'animate-[affect-pulse_var(--affect-floor-duration)_ease-in-out_infinite]',
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-[10%] bottom-0 h-1/3 bg-[radial-gradient(ellipse_at_bottom,var(--rui-background),transparent_80%)] opacity-80',
          !reduced &&
            speed > 0 &&
            'animate-[affect-pulse_calc(var(--affect-floor-duration)*1.2)_ease-in-out_infinite]',
        )}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
