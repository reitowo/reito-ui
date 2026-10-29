import { useThemeColor, type ThemeColor } from '../theme.js';
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';

const toggleVariants = cva(
  [
    // Layout
    'group/toggle inline-flex items-center justify-center',
    // Spacing
    'gap-1',
    // Surface
    'rounded-control',
    // Typography
    'text-[length:var(--rui-action-font-size)] font-normal whitespace-nowrap',
    // Motion
    'transition-all',
    // Surface
    'outline-none',
    // Pointer interaction
    'hover:bg-muted hover:text-foreground',
    // Keyboard focus
    'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
    // Disabled state
    'disabled:pointer-events-none disabled:opacity-[var(--rui-opacity-disabled)]',
    // Validation state
    'rui-validation',
    // Component state
    'aria-pressed:bg-muted data-[state=on]:bg-muted',
    // Validation state
    // Child and composition rules
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--rui-icon-size)]",
  ],
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-input bg-transparent hover:bg-muted',
      },
      size: {
        xs: "h-[var(--rui-control-height-xs)] min-w-[var(--rui-control-height-xs)] px-1.5 text-xs dense:px-1 [&_svg:not([class*='size-'])]:size-3 dense:[&_svg:not([class*='size-'])]:size-2.5",
        default:
          "h-[var(--rui-button-height)] min-w-[var(--rui-button-height)] px-[var(--rui-button-padding-x)] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-[var(--rui-control-height-sm)] min-w-[var(--rui-control-height-sm)] px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        md: 'h-[var(--rui-control-height)] min-w-[var(--rui-control-height)] px-2.5',
        lg: 'h-[var(--rui-control-height-lg)] min-w-[var(--rui-control-height-lg)] px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Toggle({
  className,
  color,
  style,
  variant = 'default',
  size = 'default',
  ...props
}: Omit<TogglePrimitive.Props, 'color'> & { color?: ThemeColor } & VariantProps<
    typeof toggleVariants
  >) {
  const colorStyle = useThemeColor(color);
  return (
    <TogglePrimitive
      data-rui-color={color}
      style={
        typeof style === 'function'
          ? (state) => ({ ...colorStyle, ...style(state) })
          : { ...colorStyle, ...style }
      }
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
