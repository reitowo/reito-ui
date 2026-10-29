import { useThemeColor, type ThemeColor } from '../theme.js';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';

const badgeVariants = cva(
  [
    // Layout
    'group/badge inline-flex w-fit shrink-0 items-center justify-center',
    // Spacing
    'gap-1',
    // Layout
    'overflow-hidden',
    // Surface
    'rounded-4xl border border-transparent',
    // Typography
    'font-medium whitespace-nowrap',
    // Motion
    'transition-all',
    // Keyboard focus
    'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
    // Child and composition rules
    'has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
    // Validation state
    'rui-validation',
    // Child and composition rules
    '[&>svg]:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        destructive:
          'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
        outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-[var(--rui-badge-height)] px-2 py-0.5 text-xs [&>svg]:size-3!',
        xs: 'h-4 rounded-xs px-1 text-2xs [&>svg]:size-2.5!',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Badge({
  className,
  color,
  style,
  variant = 'default',
  size = 'default',
  render,
  ...props
}: Omit<useRender.ComponentProps<'span'>, 'color'> & { color?: ThemeColor } & VariantProps<
    typeof badgeVariants
  >) {
  const colorStyle = useThemeColor(color);
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant, size }), className),
        ...{ 'data-rui-color': color, 'data-variant': variant, 'data-size': size },
        style: { ...colorStyle, ...style },
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
      size,
    },
  });
}

export { Badge, badgeVariants };
