import type { CSSProperties, ReactNode } from 'react';
import { tokenMetrics } from '@reito/tokens/metrics';
import { cn } from '../../lib/utils.js';

export type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  circle?: boolean;
  className?: string;
  style?: CSSProperties;
};

export type ShimmerTextProps = {
  children: ReactNode;
  duration?: number;
  className?: string;
};

function length(value: number | string | undefined, fallback: string) {
  if (value === undefined) return fallback;
  return typeof value === 'number' ? `calc(${value} * var(--rui-space-1) / 4)` : value;
}

/** Shared-sweep skeleton block. */
export function Skeleton({
  width,
  height,
  radius,
  circle = false,
  className,
  style,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block bg-muted',
        'bg-[linear-gradient(90deg,transparent,var(--rui-hover),transparent)]',
        'bg-size-[200%_100%] motion-reduce:bg-none',
        !circle && 'rounded-[var(--rui-radius)]',
        circle && 'rounded-full',
        className,
      )}
      style={{
        width: circle ? length(width, 'var(--rui-control-height)') : length(width, '100%'),
        height: circle
          ? length(width, 'var(--rui-control-height)')
          : length(height, 'var(--rui-space-3)'),
        borderRadius: circle
          ? undefined
          : radius === undefined
            ? undefined
            : length(radius, 'var(--rui-radius)'),
        animation: 'affect-shimmer var(--rui-motion-duration-lg) linear infinite',
        ...style,
      }}
    />
  );
}

/** Sweeping highlight through label text. */
export function ShimmerText({ children, duration, className }: ShimmerTextProps) {
  const length = duration ?? tokenMetrics['motion-duration-lg'] * 5;
  return (
    <span
      className={cn(
        'bg-clip-text text-transparent',
        'bg-[linear-gradient(90deg,var(--rui-text-muted),var(--rui-text),var(--rui-text-muted))]',
        'bg-size-[200%_100%] motion-reduce:text-muted-foreground motion-reduce:bg-none',
        className,
      )}
      style={{
        animation: `affect-shimmer ${Math.max(tokenMetrics['motion-duration'], length)}ms linear infinite`,
      }}
    >
      {children}
    </span>
  );
}
