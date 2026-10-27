import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/utils.js';

export function IllustrationFrame({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure
      aria-label={label}
      className={cn(
        'relative aspect-4/3 w-full overflow-hidden rounded-[var(--rui-radius-surface)] border border-border bg-muted text-foreground',
        className,
      )}
    >
      {children}
    </figure>
  );
}

export function Mark({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={style}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-[var(--rui-radius)] border border-border bg-card text-[length:var(--rui-font-caption)] font-medium',
        className,
      )}
    >
      {name.slice(0, 2)}
    </span>
  );
}
