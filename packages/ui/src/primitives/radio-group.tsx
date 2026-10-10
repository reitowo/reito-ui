'use client';
import { useThemeColor, type ThemeColor } from '../theme.js';

import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { cn } from '../lib/utils.js';

function RadioGroup({
  className,
  color,
  style,
  ...props
}: Omit<RadioGroupPrimitive.Props, 'color'> & { color?: ThemeColor }) {
  const colorStyle = useThemeColor(color);
  return (
    <RadioGroupPrimitive
      data-rui-color={color}
      style={
        typeof style === 'function'
          ? (state) => ({ ...colorStyle, ...style(state) })
          : { ...colorStyle, ...style }
      }
      data-slot="radio-group"
      className={cn('grid w-full gap-2', className)}
      {...props}
    />
  );
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        [
          // Layout
          'group/radio-group-item peer relative flex aspect-square size-4 shrink-0',
          // Surface
          'rounded-full border border-input outline-none',
          // Keyboard focus
          'group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input',
          // Layout
          'after:absolute after:-inset-x-3 after:-inset-y-2',
          // Keyboard focus
          'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-[var(--rui-opacity-disabled)]',
          // Validation state
          'aria-invalid:border-destructive aria-invalid:ring-[length:var(--rui-outline-width)] aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary',
          // Dark theme
          'dark:bg-input/30',
          // Validation state
          'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
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
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
