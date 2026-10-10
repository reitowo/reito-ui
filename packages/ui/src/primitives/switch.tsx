import { useThemeColor, type ThemeColor } from '../theme.js';
import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import { cn } from '../lib/utils.js';

function Switch({
  className,
  color,
  style,
  size = 'default',
  ...props
}: Omit<SwitchPrimitive.Root.Props, 'color'> & { color?: ThemeColor } & {
  size?: 'sm' | 'default';
}) {
  const colorStyle = useThemeColor(color);
  return (
    <SwitchPrimitive.Root
      data-rui-color={color}
      style={
        typeof style === 'function'
          ? (state) => ({ ...colorStyle, ...style(state) })
          : { ...colorStyle, ...style }
      }
      data-slot="switch"
      data-size={size}
      className={cn(
        [
          // Layout
          'peer group/switch relative inline-flex shrink-0 items-center',
          // Surface
          'rounded-full border border-transparent',
          // Motion
          'transition-all',
          // Surface
          'outline-none',
          // Keyboard focus
          'group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0',
          // Layout
          'after:absolute after:-inset-x-3 after:-inset-y-2',
          // Keyboard focus
          'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
          // Validation state
          'rui-validation',
          // Component state
          'data-[size=default]:h-[var(--rui-switch-height)] data-[size=default]:w-[var(--rui-switch-width)] data-[size=sm]:h-[var(--rui-switch-height-sm)] data-[size=sm]:w-[var(--rui-switch-width-sm)]',
          // Validation state
          // Component state
          'data-checked:bg-primary data-unchecked:bg-input',
          // Dark theme
          'dark:data-unchecked:bg-input/80',
          // Disabled state
          'data-disabled:cursor-not-allowed data-disabled:opacity-[var(--rui-opacity-disabled)]',
        ],
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn([
          // Layout
          'pointer-events-none block',
          // Surface
          'rounded-full bg-background ring-0',
          // Motion
          'transition-transform',
          // Component state
          'group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(var(--rui-switch-width)-var(--rui-space-4)-2*var(--rui-border-width))]',
          'group-data-[size=sm]/switch:data-checked:translate-x-[calc(var(--rui-switch-width-sm)-var(--rui-space-3)-2*var(--rui-border-width))] data-checked:bg-primary-foreground',
          'group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0',
          // Dark theme
          'dark:data-unchecked:bg-foreground',
        ])}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
