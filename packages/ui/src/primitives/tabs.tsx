'use client';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';

function Tabs({ className, orientation = 'horizontal', ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex gap-2 data-horizontal:flex-col', className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  [
    // Layout
    'group/tabs-list inline-flex w-fit items-center justify-center',
    // Surface
    'rounded-lg',
    // Spacing
    'p-[var(--rui-control-inset)]',
    // Typography
    'text-muted-foreground',
    // Component state
    'group-data-horizontal/tabs:h-[calc(var(--rui-button-height)+var(--rui-control-inset)*2)] data-[variant=line]:h-[var(--rui-button-height)] data-[variant=line]:p-0 group-data-vertical/tabs:h-fit',
    'group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none',
  ],
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function TabsList({
  className,
  variant = 'default',
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        [
          // Layout
          'relative inline-flex h-[var(--rui-button-height)] flex-1 items-center justify-center',
          // Spacing
          'gap-1.5',
          // Surface
          'rounded-sm border border-transparent',
          // Spacing
          'px-1.5 py-0',
          // Typography
          'text-[length:var(--rui-action-font-size)] font-normal whitespace-nowrap text-muted-foreground',
          // Motion
          'transition-all',
          // Component state
          'group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start',
          // Pointer interaction
          'hover:text-foreground',
          // Keyboard focus
          'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring',
          // Disabled state
          'disabled:pointer-events-none disabled:opacity-[var(--rui-opacity-disabled)]',
          // Child and composition rules
          'has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1',
          // Disabled state
          'aria-disabled:pointer-events-none aria-disabled:opacity-[var(--rui-opacity-disabled)]',
          // Dark theme
          'dark:text-muted-foreground dark:hover:text-foreground',
          // Component state
          'group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none',
          // Child and composition rules
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
        ],
        'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
        'data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground',
        [
          // Layout
          'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity',
          // Component state
          'group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[calc(-1*(var(--rui-control-inset)+2*var(--rui-border-width)))] group-data-horizontal/tabs:after:h-[var(--rui-outline-width)]',
          'group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-[var(--rui-outline-width)] group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        ],
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('rui-scroll-focus flex-1 text-sm', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
