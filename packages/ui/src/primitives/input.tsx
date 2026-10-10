import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '../lib/utils.js';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        [
          // Layout
          'h-[var(--rui-control-height)] w-full min-w-0',
          // Surface
          'rounded-lg border border-input bg-transparent',
          // Spacing
          'px-2.5 py-1',
          // Typography
          'text-sm',
          // Motion
          'transition-colors',
          // Surface
          'outline-none',
          // Layout
          'file:inline-flex file:h-[var(--rui-control-height-xs)] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground',
          // Keyboard focus
          'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
          // Disabled state
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-[var(--rui-opacity-disabled)]',
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

export { Input };
