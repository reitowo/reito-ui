'use client';
import { ThemePortalScope } from '../theme.js';
import { fieldStateClassName } from '../lib/state.js';

import { tokenMetrics } from '@reito/tokens/metrics';
import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { menuItemStateClassName, popupMotionClassName } from '../lib/state.js';
import { cn } from '../lib/utils.js';
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from 'lucide-react';

/** Graphite-themed product select. The browser picker lives in the separate native entry. */
const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('scroll-my-1 p-[var(--rui-component-menu-popup-padding)]', className)}
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
          'rounded-[var(--rui-component-input-radius)] border',
          fieldStateClassName,
          // Spacing
          'py-0 px-[var(--rui-component-input-padding-x)]',
          // Typography
          'text-[length:var(--rui-component-input-font-size)] whitespace-nowrap',
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
          'data-placeholder:text-muted-foreground data-[size=default]:h-[var(--rui-component-input-height)] data-[size=sm]:h-[var(--rui-control-height-sm)] data-[size=xs]:h-[var(--rui-control-height-xs)] data-[size=xs]:py-0',
          // Child and composition rules
          'data-[size=xs]:[&_svg]:size-3',
          // Component state
          // Child and composition rules
          '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5',
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
                'rounded-[var(--rui-component-menu-popup-radius)] bg-popover',
                // Typography
                'text-popover-foreground',
                // Surface
                'shadow-md ring-1 ring-foreground/10',
                // Motion
                popupMotionClassName,
                'data-[align-trigger=true]:transition-none',
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
          'gap-[var(--rui-component-menu-item-gap)]',
          // Surface
          'rounded-[var(--rui-component-menu-item-radius)]',
          // Spacing
          'py-[var(--rui-component-menu-item-padding-y)] pr-[var(--rui-component-menu-inset-padding-x)] pl-[var(--rui-component-menu-item-padding-x)]',
          // Typography
          'text-[length:var(--rui-component-menu-font-size)] leading-[var(--rui-component-menu-item-line-height)]',
          // Surface
          'outline-hidden',
          // Layout
          'select-none',
          menuItemStateClassName,
          // Disabled state
          'data-disabled:pointer-events-none',
          // Child and composition rules
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--rui-component-menu-icon-size)] *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
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
          <span className="pointer-events-none absolute right-[var(--rui-component-menu-item-padding-x)] flex size-[var(--rui-component-menu-icon-size)] items-center justify-center" />
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
      className={cn(
        'pointer-events-none mx-[var(--rui-component-menu-separator-inset)] my-[var(--rui-component-menu-separator-margin-y)] h-px bg-border',
        className,
      )}
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
