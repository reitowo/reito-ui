import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils.js';

export interface SectionLabelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Heading level for document structure; `div` when the label is purely visual grouping. */
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  /** Short trailing content such as a count; stays on the same line. */
  trailing?: ReactNode;
  /** Extends a hairline after the label to separate the following group. */
  divider?: boolean;
}

/** Quiet group label for dense lists, e.g. a turn or day boundary in an event trace. */
export function SectionLabel({
  children,
  as: Element = 'h3',
  trailing,
  divider = false,
  className,
  ...props
}: SectionLabelProps) {
  return (
    <Element
      data-slot="section-label"
      className={cn(
        [
          // Layout
          'flex min-w-0 items-center',
          // Spacing
          'gap-2 py-1',
          // Typography
          'text-2xs font-semibold tracking-wide text-muted-foreground uppercase',
        ],
        className,
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
      {trailing !== undefined && (
        <span className="shrink-0 font-normal tabular-nums normal-case">{trailing}</span>
      )}
      {divider && <span aria-hidden="true" className="h-px min-w-0 flex-1 bg-border" />}
    </Element>
  );
}
