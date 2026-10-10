import * as React from 'react';
import { cn } from '../lib/utils.js';
import { ChevronDownIcon } from 'lucide-react';

type NativeSelectProps = Omit<React.ComponentProps<'select'>, 'size'> & {
  size?: 'sm' | 'default';
};

/**
 * HTML select with a themed closed state. Its expanded popup is rendered by the browser/OS.
 * Only exported from @reito/ui/native. Product UI uses SelectInput or Select.
 */
function NativeSelect({ className, size = 'default', ...props }: NativeSelectProps) {
  return (
    <div
      className={cn(
        'group/native-select relative w-fit has-[select:disabled]:opacity-[var(--rui-opacity-disabled)]',
        className,
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn([
          // Layout
          'h-[var(--rui-control-height)] w-full min-w-0 appearance-none',
          // Surface
          'rounded-lg border border-input bg-transparent',
          // Spacing
          'py-1 pr-8 pl-2.5',
          // Typography
          'text-sm',
          // Motion
          'transition-colors',
          // Surface
          'outline-none',
          // Layout
          'select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground',
          // Keyboard focus
          'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
          // Disabled state
          'disabled:pointer-events-none disabled:cursor-not-allowed',
          // Validation state
          'aria-invalid:border-destructive aria-invalid:ring-[length:var(--rui-outline-width)] aria-invalid:ring-destructive/20',
          // Component state
          'data-[size=sm]:h-[var(--rui-control-height-sm)] data-[size=sm]:rounded-md data-[size=sm]:py-0.5',
          // Dark theme
          'dark:bg-input/30 dark:hover:bg-input/50',
          // Validation state
          'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        ])}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<'option'>) {
  return (
    <option
      data-slot="native-select-option"
      className={cn('bg-[Canvas] text-[CanvasText]', className)}
      {...props}
    />
  );
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn('bg-[Canvas] text-[CanvasText]', className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
