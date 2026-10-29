import type { ButtonHTMLAttributes } from 'react';
import { ArrowDown } from 'lucide-react';
import { cn } from '../lib/utils.js';

export interface JumpToLatestProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Render nothing while the reader is already at the latest content. */
  visible?: boolean;
  label?: string;
  /** Unread item count appended to the label. */
  count?: number;
  /** Horizontal position inside the nearest positioned scroll container. */
  placement?: 'center' | 'end';
  /** `false` renders the pill in flow, for toolbars or tests. */
  floating?: boolean;
}

/** Floating pill that returns a followed log or conversation to its newest content. */
export function JumpToLatest({
  visible = true,
  label = '回到最新',
  count,
  placement = 'end',
  floating = true,
  className,
  type = 'button',
  ...props
}: JumpToLatestProps) {
  if (!visible) return null;
  const pill = (
    <button
      type={type}
      data-slot="jump-to-latest"
      className={cn(
        [
          // Layout
          'pointer-events-auto inline-flex h-[var(--rui-control-height-xs)] shrink-0 items-center',
          // Spacing
          'gap-1 px-2.5',
          // Surface
          'rounded-full bg-primary shadow-md',
          // Typography
          'text-xs font-medium whitespace-nowrap text-primary-foreground',
          // Motion
          'transition-colors',
          // Pointer interaction
          'hover:bg-[var(--rui-primary-hover)]',
          // Keyboard focus
          'focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-offset-1 focus-visible:outline-ring',
          // Disabled state
          'disabled:pointer-events-none disabled:opacity-[var(--rui-opacity-disabled)]',
        ],
        className,
      )}
      {...props}
    >
      <ArrowDown className="size-3" aria-hidden="true" />
      {label}
      {count ? <span className="tabular-nums">· {count}</span> : null}
    </button>
  );
  if (!floating) return pill;
  return (
    <div
      data-slot="jump-to-latest-anchor"
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-[var(--rui-content-gap)] flex px-[var(--rui-content-gap)]',
        placement === 'center' ? 'justify-center' : 'justify-end',
      )}
    >
      {pill}
    </div>
  );
}
