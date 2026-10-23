import * as React from 'react';
import { fieldStateClassName } from '../lib/state.js';
import { cn } from '../lib/utils.js';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        [
          // Layout
          'flex field-sizing-content min-h-[var(--rui-textarea-min-height)] w-full',
          // Surface
          'rounded-lg border',
          fieldStateClassName,
          // Spacing
          'px-2.5 py-2',
          // Typography
          'text-sm',
          // Surface
          'outline-none',
          // Layout
          'placeholder:text-muted-foreground',
          // Keyboard focus
          'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-[var(--rui-opacity-disabled)]',
          // Validation state
          'rui-validation',
        ],
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
