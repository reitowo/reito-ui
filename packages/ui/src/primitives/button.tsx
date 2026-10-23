import { useThemeColor, type ThemeColor } from '../theme.js';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';

const buttonVariants = cva(
  [
    // Layout
    'group/button inline-flex shrink-0 items-center justify-center',
    // Surface
    'rounded-[var(--rui-component-button-radius)] border border-transparent bg-clip-padding',
    // Typography
    'text-[length:var(--rui-component-button-font-size)] font-normal whitespace-nowrap',
    // Motion
    'transition-all duration-[var(--rui-motion-duration)] ease-[var(--rui-motion-easing)]',
    // Surface
    'outline-none',
    // Layout
    'select-none',
    // Keyboard focus
    'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
    // Pointer interaction
    'active:not-aria-[haspopup]:translate-y-[var(--rui-motion-press-distance)]',
    // Disabled state
    'disabled:pointer-events-none disabled:opacity-[var(--rui-opacity-disabled)]',
    // Validation state
    'rui-validation',
    // Child and composition rules
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-[var(--rui-component-button-primary-bg-rest)] text-[var(--rui-component-button-primary-fg)]',
          'hover:bg-[var(--rui-component-button-primary-bg-hover)]',
          'active:not-aria-[haspopup]:bg-[var(--rui-component-button-primary-bg-pressed)]',
          'disabled:bg-[var(--rui-component-button-primary-bg-disabled)]',
        ].join(' '),
        accent: [
          'bg-[var(--rui-component-button-accent-bg-rest)] text-[var(--rui-component-button-accent-fg)]',
          'hover:bg-[var(--rui-component-button-accent-bg-hover)]',
          'active:not-aria-[haspopup]:bg-[var(--rui-component-button-accent-bg-pressed)]',
          'disabled:bg-[var(--rui-component-button-accent-bg-disabled)]',
        ].join(' '),
        outline: [
          'border-[var(--rui-component-button-outline-border)] bg-[var(--rui-component-button-outline-bg-rest)]',
          'text-[var(--rui-component-button-outline-fg)]',
          'hover:bg-[var(--rui-component-button-outline-bg-hover)]',
          'active:not-aria-[haspopup]:bg-[var(--rui-component-button-outline-bg-pressed)]',
          'aria-expanded:bg-[var(--rui-component-button-outline-bg-expanded)]',
          'disabled:bg-[var(--rui-component-button-outline-bg-rest)]',
        ].join(' '),
        secondary: [
          'bg-[var(--rui-component-button-secondary-bg-rest)] text-[var(--rui-component-button-secondary-fg)]',
          'hover:bg-[var(--rui-component-button-secondary-bg-hover)]',
          'active:not-aria-[haspopup]:bg-[var(--rui-component-button-secondary-bg-pressed)]',
          'aria-expanded:bg-[var(--rui-component-button-secondary-bg-expanded)]',
          'disabled:bg-[var(--rui-component-button-secondary-bg-rest)]',
        ].join(' '),
        ghost: [
          'bg-[var(--rui-component-button-ghost-bg-rest)] text-[var(--rui-component-button-ghost-fg)]',
          'hover:bg-[var(--rui-component-button-ghost-bg-hover)]',
          'active:not-aria-[haspopup]:bg-[var(--rui-component-button-ghost-bg-pressed)]',
          'aria-expanded:bg-[var(--rui-component-button-ghost-bg-expanded)]',
          'disabled:bg-[var(--rui-component-button-ghost-bg-rest)]',
        ].join(' '),
        destructive: [
          'bg-[var(--rui-component-button-destructive-bg-rest)] text-[var(--rui-component-button-destructive-fg)]',
          'hover:bg-[var(--rui-component-button-destructive-bg-hover)]',
          'active:not-aria-[haspopup]:bg-[var(--rui-component-button-destructive-bg-pressed)]',
          'disabled:bg-[var(--rui-component-button-destructive-bg-disabled)]',
          'focus-visible:border-destructive/40 focus-visible:ring-destructive/20',
          'dark:focus-visible:ring-destructive/40',
        ].join(' '),
        link: 'text-[var(--rui-component-button-link-fg)] underline-offset-4 hover:underline',
      },
      size: {
        default:
          "h-[var(--rui-component-button-height)] gap-1.5 px-[var(--rui-component-button-padding-x)] [&_svg:not([class*='size-'])]:size-3.5",
        xs: "text-sm h-[var(--rui-control-height-xs)] gap-1 px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-[var(--rui-control-height-sm)] gap-1 px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        md: 'h-[var(--rui-control-height)] gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        lg: 'h-[var(--rui-control-height-lg)] gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xl: 'h-[var(--rui-control-height-xl)] gap-[var(--rui-space-3)] px-[var(--rui-space-6)] text-[length:var(--rui-text-lg)] font-medium [&_svg:not([class*="size-"])]:size-4',
        icon: "size-[var(--rui-component-button-height)] [&_svg:not([class*='size-'])]:size-3.5",
        'icon-xs': "size-[var(--rui-control-height-xs)] [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': "size-[var(--rui-control-height-sm)] [&_svg:not([class*='size-'])]:size-3.5",
        'icon-md': 'size-[var(--rui-control-height)]',
        'icon-lg': 'size-[var(--rui-control-height-lg)]',
        'icon-xl': 'size-[var(--rui-control-height-xl)]',
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
