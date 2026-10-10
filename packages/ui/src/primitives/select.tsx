'use client';
import { ThemePortalScope } from '../theme.js';

import { tokenMetrics } from '@reito/tokens/metrics';
import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { cn } from '../lib/utils.js';
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from 'lucide-react';

/** Graphite-themed product select. The browser picker lives in the separate native entry. */
const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('scroll-my-1 p-1', className)}
      {...props}
    />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('flex min-w-0 flex-1 truncate text-left', className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: 'xs' | 'sm' | 'default';
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        [
          // Layout
          'flex min-w-0 w-fit max-w-full items-center justify-between',
          // Spacing
          'gap-1.5',
          // Surface
          'rounded-lg border border-input bg-transparent',
          // Spacing
          'py-2 pr-2 pl-2.5',
          // Typography
          'text-[length:var(--rui-action-font-size)] whitespace-nowrap',
          // Motion
          'transition-colors',
          // Surface
          'outline-none',
          // Layout
          'select-none',
          // Keyboard focus
          'focus-visible:border-ring focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring/50',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-[var(--rui-opacity-disabled)]',
          // Validation state
          'rui-validation',
          // Component state
          'data-placeholder:text-muted-foreground data-[size=default]:h-[var(--rui-control-height)] data-[size=sm]:h-[var(--rui-control-height-sm)] data-[size=xs]:h-[var(--rui-button-height)] data-[size=xs]:py-0',
          'data-[size=xs]:rounded-sm',
          // Child and composition rules
          'data-[size=xs]:[&_svg]:size-3',
          // Component state
          'data-[size=sm]:rounded-md',
          // Child and composition rules
          '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5',
          // Dark theme
          'dark:bg-input/30 dark:hover:bg-input/50',
          // Validation state
          // Child and composition rules
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        ],
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        children={null}
        render={<ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />}
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  side = 'bottom',
  sideOffset = tokenMetrics['space-1'],
  align = 'start',
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
  >) {
  return (
    <SelectPrimitive.Portal>
      <ThemePortalScope>
        <SelectPrimitive.Positioner
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          alignItemWithTrigger={alignItemWithTrigger}
          className="isolate z-[var(--rui-z-popover)]"
        >
          <SelectPrimitive.Popup
            data-slot="select-content"
            data-align-trigger={alignItemWithTrigger}
            className={cn(
              [
                // Layout
                'relative isolate z-[var(--rui-z-popover)] max-h-(--available-height) max-w-(--available-width) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto',
                // Surface
                'rounded-lg bg-popover',
                // Typography
                'text-popover-foreground',
                // Surface
                'shadow-md ring-1 ring-foreground/10',
                // Motion
                'duration-[var(--rui-duration-fast)]',
                // Component state
                'data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2',
                'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
              ],
              className,
            )}
            {...props}
          >
            <SelectScrollUpButton />
            <SelectPrimitive.List>{children}</SelectPrimitive.List>
            <SelectScrollDownButton />
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </ThemePortalScope>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        'px-[var(--rui-component-menu-item-padding-x)] py-1 text-xs text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        [
          // Layout
          'relative flex min-h-[var(--rui-component-menu-item-height)] w-full cursor-default items-center',
          // Spacing
          'gap-1.5',
          // Surface
          'rounded-md',
          // Spacing
          'py-[var(--rui-component-menu-item-padding-y)] pr-8 pl-[var(--rui-component-menu-item-padding-x)]',
          // Typography
          'text-[length:var(--rui-component-menu-font-size)] leading-[var(--rui-component-menu-item-line-height)]',
          // Surface
          'outline-hidden',
          // Layout
          'select-none',
          // Keyboard focus
          'focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground',
          // Disabled state
          'data-disabled:pointer-events-none data-disabled:opacity-[var(--rui-opacity-disabled)]',
          // Child and composition rules
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        ],
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex min-w-0 flex-1 gap-2 break-words whitespace-normal">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
