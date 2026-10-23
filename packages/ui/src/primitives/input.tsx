import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { fieldStateClassName } from '../lib/state.js';
import { cn } from '../lib/utils.js';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        [
          // Layout
          'h-[var(--rui-component-input-height)] w-full min-w-0',
          // Surface
          'rounded-[var(--rui-component-input-radius)] border',
          fieldStateClassName,
          // Spacing
          'px-[var(--rui-component-input-padding-x)] py-1',
          // Typography
          'text-[length:var(--rui-component-input-font-size)]',
          // Surface
          'outline-none',
          // Layout
          'file:inline-flex file:h-[var(--rui-control-height-xs)] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground',
          // Keyboard focus
          'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
          // Disabled state
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[var(--rui-opacity-disabled)]',
          // Validation state
          'rui-validation',
        ],
        className,
      )}
      {...props}
    />
  );
}

export { Input };
