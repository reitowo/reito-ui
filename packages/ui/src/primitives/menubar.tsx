'use client';

import { tokenMetrics } from '@reito/tokens/metrics';
import * as React from 'react';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { Menubar as MenubarPrimitive } from '@base-ui/react/menubar';
import { menuItemStateClassName } from '../lib/state.js';
import { cn } from '../lib/utils.js';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu.js';
import { CheckIcon } from 'lucide-react';

function Menubar({ className, ...props }: MenubarPrimitive.Props) {
  return (
    <MenubarPrimitive
      data-slot="menubar"
      className={cn(
        'flex h-[calc(var(--rui-button-height)+var(--rui-control-inset)*2)] items-center gap-0.5 rounded-[var(--rui-component-menu-popup-radius)] border p-[var(--rui-control-inset)]',
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({ ...props }: React.ComponentProps<typeof DropdownMenuGroup>) {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />;
}

function MenubarPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPortal>) {
  return <DropdownMenuPortal data-slot="menubar-portal" {...props} />;
}

function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenuTrigger
      data-slot="menubar-trigger"
      className={cn(
        'flex items-center h-[var(--rui-button-height)] rounded-control px-2 text-[length:var(--rui-action-font-size)] font-normal outline-hidden select-none hover:bg-muted aria-expanded:bg-muted',
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  align = 'start',
  alignOffset = -tokenMetrics['space-1'],
  sideOffset = tokenMetrics['space-2'],
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="menubar-content"
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        [
          // Layout
          'min-w-36',
          // Surface
          'rounded-[var(--rui-component-menu-popup-radius)] bg-popover',
          // Spacing
          'p-[var(--rui-component-menu-popup-padding)]',
          // Typography
          'text-popover-foreground',
          // Surface
          'shadow-md ring-1 ring-foreground/10',
          // Motion is inherited from DropdownMenuContent.
        ],
        className,
      )}
      {...props}
    />
  );
}

function MenubarItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        [
          // Layout
          'group/menubar-item',
          // Spacing
          'gap-[var(--rui-component-menu-item-gap)]',
          // Surface
          'rounded-[var(--rui-component-menu-item-radius)]',
          // Spacing
          'px-[var(--rui-component-menu-item-padding-x)] py-[var(--rui-component-menu-item-padding-y)]',
          // Typography
          'text-[length:var(--rui-component-menu-font-size)] leading-[var(--rui-component-menu-item-line-height)]',
          // Component state
          'data-inset:pl-[var(--rui-component-menu-inset-padding-x)]',
          // Child and composition rules
          "[&_svg:not([class*='size-'])]:size-[var(--rui-component-menu-icon-size)]",
          // Component state
          'data-[variant=destructive]:*:[svg]:text-[var(--rui-component-menu-item-fg-destructive)]!',
        ],
        className,
      )}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={inset}
      className={cn(
        [
          // Layout
          'relative flex cursor-default items-center',
          // Spacing
          'gap-[var(--rui-component-menu-item-gap)]',
          // Surface
          'rounded-[var(--rui-component-menu-item-radius)]',
          // Spacing
          'py-[var(--rui-component-menu-item-padding-y)] pr-[var(--rui-component-menu-item-padding-x)] pl-[var(--rui-component-menu-inset-padding-x)]',
          // Typography
          'text-[length:var(--rui-component-menu-font-size)] leading-[var(--rui-component-menu-item-line-height)]',
          // Surface
          'outline-hidden',
          // Layout
          'select-none',
          menuItemStateClassName,
          // Component state
          'data-inset:pl-[var(--rui-component-menu-inset-padding-x)]',
          // Disabled state
          'data-disabled:pointer-events-none',
          // Child and composition rules
          '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        ],
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-[var(--rui-component-menu-item-padding-x)] flex size-[var(--rui-component-menu-icon-size)] items-center justify-center [&_svg:not([class*='size-'])]:size-[var(--rui-component-menu-icon-size)]">
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function MenubarRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuRadioGroup>) {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />;
}

function MenubarRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="menubar-radio-item"
      data-inset={inset}
      className={cn(
        [
          // Layout
          'relative flex cursor-default items-center',
          // Spacing
          'gap-[var(--rui-component-menu-item-gap)]',
          // Surface
          'rounded-[var(--rui-component-menu-item-radius)]',
          // Spacing
          'py-[var(--rui-component-menu-item-padding-y)] pr-[var(--rui-component-menu-item-padding-x)] pl-[var(--rui-component-menu-inset-padding-x)]',
          // Typography
          'text-[length:var(--rui-component-menu-font-size)] leading-[var(--rui-component-menu-item-line-height)]',
          // Surface
          'outline-hidden',
          // Layout
          'select-none',
          menuItemStateClassName,
          // Component state
          'data-inset:pl-[var(--rui-component-menu-inset-padding-x)]',
          // Disabled state
          'data-disabled:pointer-events-none',
          // Child and composition rules
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--rui-component-menu-icon-size)]",
        ],
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-[var(--rui-component-menu-item-padding-x)] flex size-[var(--rui-component-menu-icon-size)] items-center justify-center [&_svg:not([class*='size-'])]:size-[var(--rui-component-menu-icon-size)]">
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuLabel
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        'px-[var(--rui-component-menu-item-padding-x)] py-[var(--rui-component-menu-item-padding-y)] text-xs font-medium data-inset:pl-[var(--rui-component-menu-inset-padding-x)]',
        className,
      )}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      data-slot="menubar-separator"
      className={cn(
        'mx-[var(--rui-component-menu-separator-inset)] my-[var(--rui-component-menu-separator-margin-y)] h-px bg-border',
        className,
      )}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuShortcut>) {
  return (
    <DropdownMenuShortcut
      data-slot="menubar-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground group-focus/menubar-item:text-accent-foreground',
        className,
      )}
      {...props}
    />
  );
}

function MenubarSub({ ...props }: React.ComponentProps<typeof DropdownMenuSub>) {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuSubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        [
          'gap-[var(--rui-component-menu-item-gap)] rounded-[var(--rui-component-menu-item-radius)] px-[var(--rui-component-menu-item-padding-x)] py-[var(--rui-component-menu-item-padding-y)]',
          'text-[length:var(--rui-component-menu-font-size)] leading-[var(--rui-component-menu-item-line-height)]',
          'data-inset:pl-[var(--rui-component-menu-inset-padding-x)]',
          "[&_svg:not([class*='size-'])]:size-[var(--rui-component-menu-icon-size)]",
        ],
        className,
      )}
      {...props}
    />
  );
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent>) {
  return (
    <DropdownMenuSubContent
      data-slot="menubar-sub-content"
      className={cn(
        [
          // Layout
          'min-w-32',
          // Surface
          'rounded-[var(--rui-component-menu-popup-radius)] bg-popover',
          // Spacing
          'p-[var(--rui-component-menu-popup-padding)]',
          // Typography
          'text-popover-foreground',
          // Surface
          'shadow-lg ring-1 ring-foreground/10',
          // Motion is inherited from DropdownMenuSubContent.
        ],
        className,
      )}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
