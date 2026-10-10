'use client';

import { tokenMetrics } from '@reito/tokens/metrics';
import * as React from 'react';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { Menubar as MenubarPrimitive } from '@base-ui/react/menubar';
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
        'flex h-[calc(var(--rui-button-height)+var(--rui-control-inset)*2)] items-center gap-0.5 rounded-lg border p-[var(--rui-control-inset)]',
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
        'flex items-center h-[var(--rui-button-height)] rounded-sm px-2 text-[length:var(--rui-action-font-size)] font-normal outline-hidden select-none hover:bg-muted aria-expanded:bg-muted',
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
          'rounded-lg bg-popover',
          // Spacing
          'p-1',
          // Typography
          'text-popover-foreground',
          // Surface
          'shadow-md ring-1 ring-foreground/10',
          // Motion
          'duration-[var(--rui-duration-fast)]',
          // Component state
          'data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
          'data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
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
          'gap-1.5',
          // Surface
          'rounded-sm',
          // Spacing
          'px-[var(--rui-menu-item-padding-x)] py-[var(--rui-menu-item-padding-y)]',
          // Typography
          'text-[length:var(--rui-menu-font-size)] leading-5',
          // Keyboard focus
          'focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground',
          // Component state
          'data-inset:pl-7 data-[variant=destructive]:text-destructive',
          // Keyboard focus
          'data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20',
          // Disabled state
          'data-disabled:opacity-[var(--rui-opacity-disabled)]',
          // Child and composition rules
          "[&_svg:not([class*='size-'])]:size-4",
          // Component state
          'data-[variant=destructive]:*:[svg]:text-destructive!',
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
          'gap-1.5',
          // Surface
          'rounded-sm',
          // Spacing
          'py-[var(--rui-menu-item-padding-y)] pr-[var(--rui-menu-item-padding-x)] pl-7',
          // Typography
          'text-[length:var(--rui-menu-font-size)] leading-5',
          // Surface
          'outline-hidden',
          // Layout
          'select-none',
          // Keyboard focus
          'focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground',
          // Component state
          'data-inset:pl-7',
          // Disabled state
          'data-disabled:pointer-events-none data-disabled:opacity-[var(--rui-opacity-disabled)]',
          // Child and composition rules
          '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        ],
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
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
          'gap-1.5',
          // Surface
          'rounded-sm',
          // Spacing
          'py-[var(--rui-menu-item-padding-y)] pr-[var(--rui-menu-item-padding-x)] pl-7',
          // Typography
          'text-[length:var(--rui-menu-font-size)] leading-5',
          // Surface
          'outline-hidden',
          // Layout
          'select-none',
          // Keyboard focus
          'focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground',
          // Component state
          'data-inset:pl-7',
          // Disabled state
          'data-disabled:pointer-events-none data-disabled:opacity-[var(--rui-opacity-disabled)]',
          // Child and composition rules
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        ],
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-1.5 flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
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
        'px-[var(--rui-menu-item-padding-x)] py-[var(--rui-menu-item-padding-y)] text-xs font-medium data-inset:pl-7',
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
      className={cn('-mx-1 my-1 h-px bg-border', className)}
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
        "gap-1.5 rounded-sm px-[var(--rui-menu-item-padding-x)] py-[var(--rui-menu-item-padding-y)] text-[length:var(--rui-menu-font-size)] leading-5 focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-4",
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
          'rounded-lg bg-popover',
          // Spacing
          'p-1',
          // Typography
          'text-popover-foreground',
          // Surface
          'shadow-lg ring-1 ring-foreground/10',
          // Motion
          'duration-[var(--rui-duration-fast)]',
          // Component state
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
          'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
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
