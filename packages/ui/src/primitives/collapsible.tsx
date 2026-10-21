import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import { cn } from '../lib/utils.js';

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

/** `row` is a full-width disclosure row; a child with data-slot="collapsible-chevron" rotates when open. */
function CollapsibleTrigger({
  className,
  variant = 'plain',
  ...props
}: CollapsiblePrimitive.Trigger.Props & { variant?: 'plain' | 'row' }) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      data-variant={variant}
      className={cn(
        variant === 'row' && [
          // Layout
          'group/collapsible-trigger flex min-h-[var(--rui-control-height-xs)] w-full min-w-0 items-center',
          // Spacing
          'gap-1.5 px-[var(--rui-cell-padding-x)]',
          // Surface
          'rounded-xs',
          // Typography
          'text-left text-xs text-muted-foreground',
          // Pointer interaction
          'hover:bg-muted hover:text-foreground',
          // Keyboard focus
          'focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring',
          // Disabled state
          'disabled:pointer-events-none disabled:opacity-[var(--rui-opacity-disabled)]',
          // Child and composition rules
          "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--rui-icon-size)]",
          '[&_[data-slot=collapsible-chevron]]:transition-transform motion-reduce:[&_[data-slot=collapsible-chevron]]:transition-none',
          'data-panel-open:[&_[data-slot=collapsible-chevron]]:rotate-90',
        ],
        className,
      )}
      {...props}
    />
  );
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
