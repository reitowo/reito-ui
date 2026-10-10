import { cn } from '../lib/utils.js';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        [
          // Layout
          'pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center',
          // Spacing
          'gap-1',
          // Surface
          'rounded-sm bg-muted',
          // Spacing
          'px-1',
          // Typography
          'font-sans text-xs font-medium text-muted-foreground',
          // Layout
          'select-none',
          // Component state
          'in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background',
          // Dark theme
          'dark:in-data-[slot=tooltip-content]:bg-background/10',
          // Child and composition rules
          "[&_svg:not([class*='size-'])]:size-3",
        ],
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
