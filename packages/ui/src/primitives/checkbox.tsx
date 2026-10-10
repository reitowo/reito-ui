'use client';
import { useThemeColor, type ThemeColor } from '../theme.js';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { cn } from '../lib/utils.js';
import { CheckIcon } from 'lucide-react';

function Checkbox({
  className,
  color,
  style,
  ...props
}: Omit<CheckboxPrimitive.Root.Props, 'color'> & { color?: ThemeColor }) {
  const colorStyle = useThemeColor(color);
  return (
    <CheckboxPrimitive.Root
      data-rui-color={color}
      style={
        typeof style === 'function'
          ? (state) => ({ ...colorStyle, ...style(state) })
          : { ...colorStyle, ...style }
      }
      data-slot="checkbox"
      className={cn(
        [
          // Layout
          'peer relative flex size-4 shrink-0 items-center justify-center',
          // Surface
          'rounded-[var(--rui-radius-xs)] border border-input',
          // Motion
          'transition-colors',
          // Surface
          'outline-none',
          // Disabled state
          'group-has-disabled/field:opacity-[var(--rui-opacity-disabled)]',
          // Keyboard focus
          'group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input',
          // Layout
          'after:absolute after:-inset-x-3 after:-inset-y-2',
          // Keyboard focus
          'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-[var(--rui-opacity-disabled)]',
          // Dark theme
          'dark:bg-input/30',
          // Validation state
          'rui-validation',
          // Component state
          'data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
          // Keyboard focus
          'group-has-[:focus-visible]/field-label:data-checked:border-primary',
          // Dark theme
          'dark:data-checked:bg-primary',
        ],
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
