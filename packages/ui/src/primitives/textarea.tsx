import * as React from 'react';
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
          'rounded-lg border border-input bg-transparent',
          // Spacing
          'px-2.5 py-2',
          // Typography
          'text-sm',
          // Motion
          'transition-colors',
          // Surface
          'outline-none',
          // Layout
          'placeholder:text-muted-foreground',
          // Keyboard focus
          'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
          // Disabled state
          'disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-[var(--rui-opacity-disabled)]',
          // Validation state
          'aria-invalid:border-destructive aria-invalid:ring-[length:var(--rui-outline-width)] aria-invalid:ring-destructive/20',
          // Dark theme
          'dark:bg-input/30',
          // Disabled state
          'dark:disabled:bg-input/80',
          // Validation state
          'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        ],
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
