import { useThemeColor, type ThemeColor } from '../theme.js';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';

const buttonVariants = cva(
  [
    // Layout
    'group/button inline-flex shrink-0 items-center justify-center',
    // Surface
    'rounded-sm border border-transparent bg-clip-padding',
    // Typography
    'text-[length:var(--rui-action-font-size)] font-normal whitespace-nowrap',
    // Motion
    'transition-all',
    // Surface
    'outline-none',
    // Layout
    'select-none',
    // Keyboard focus
    'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
    // Pointer interaction
    'active:not-aria-[haspopup]:translate-y-px',
    // Disabled state
    'disabled:pointer-events-none disabled:opacity-[var(--rui-opacity-disabled)]',
    // Validation state
    'aria-invalid:border-destructive aria-invalid:ring-[length:var(--rui-outline-width)] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
    // Child and composition rules
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        accent:
          'bg-[var(--rui-action-accent)] text-[var(--rui-on-action-accent)] hover:bg-[var(--rui-action-accent)]/90',
        outline:
          'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[var(--rui-active)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:
          "h-[var(--rui-button-height)] gap-1.5 px-[var(--rui-button-padding-x)] [&_svg:not([class*='size-'])]:size-3.5",
        xs: "text-sm h-[var(--rui-control-height-xs)] gap-1 px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-[var(--rui-control-height-sm)] gap-1 px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        md: 'h-[var(--rui-control-height)] gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        lg: 'h-[var(--rui-control-height-lg)] gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: "size-[var(--rui-button-height)] [&_svg:not([class*='size-'])]:size-3.5",
        'icon-xs': "size-[var(--rui-control-height-xs)] [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': "size-[var(--rui-control-height-sm)] [&_svg:not([class*='size-'])]:size-3.5",
        'icon-md': 'size-[var(--rui-control-height)]',
        'icon-lg': 'size-[var(--rui-control-height-lg)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  color,
  style,
  variant = 'default',
  size = 'default',
  ...props
}: Omit<ButtonPrimitive.Props, 'color'> & { color?: ThemeColor } & VariantProps<
    typeof buttonVariants
  >) {
  const colorStyle = useThemeColor(color);
  return (
    <ButtonPrimitive
      data-rui-color={color}
      style={
        typeof style === 'function'
          ? (state) => ({ ...colorStyle, ...style(state) })
          : { ...colorStyle, ...style }
      }
      data-slot="button"
      data-rui-button=""
      data-size={size}
      data-variant={variant}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
