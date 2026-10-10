'use client';
import { ThemePortalScope } from '../theme.js';

import { tokenMetrics } from '@reito/tokens/metrics';
import * as React from 'react';
import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';
import { cn } from '../lib/utils.js';
import { ChevronRightIcon, CheckIcon } from 'lucide-react';

function ContextMenu({ ...props }: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuPortal({ ...props }: ContextMenuPrimitive.Portal.Props) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props}>
      <ThemePortalScope>{props.children}</ThemePortalScope>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuTrigger({ className, ...props }: ContextMenuPrimitive.Trigger.Props) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn('select-none', className)}
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  align = 'start',
  alignOffset = tokenMetrics['space-1'],
  side = 'right',
  sideOffset = 0,
  ...props
}: ContextMenuPrimitive.Popup.Props &
  Pick<ContextMenuPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ThemePortalScope>
        <ContextMenuPrimitive.Positioner
          className="isolate z-[var(--rui-z-popover)] outline-none"
          align={align}
          alignOffset={alignOffset}
          side={side}
          sideOffset={sideOffset}
        >
          <ContextMenuPrimitive.Popup
            data-slot="context-menu-content"
            className={cn(
              [
                // Layout
                'z-[var(--rui-z-popover)] max-h-(--available-height) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto',
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
                // Surface
                'outline-none',
                // Component state
                'data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
                'data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
              ],
              className,
            )}
            {...props}
          />
        </ContextMenuPrimitive.Positioner>
      </ThemePortalScope>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuGroup({ ...props }: ContextMenuPrimitive.Group.Props) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        'px-[var(--rui-component-menu-item-padding-x)] py-[var(--rui-component-menu-item-padding-y)] text-xs font-medium text-muted-foreground data-inset:pl-7',
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: ContextMenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        [
          // Layout
          'group/context-menu-item relative flex cursor-default items-center',
          // Spacing
          'gap-1.5',
          // Surface
          'rounded-sm',
          // Spacing
          'px-[var(--rui-component-menu-item-padding-x)] py-[var(--rui-component-menu-item-padding-y)]',
          // Typography
          'text-[length:var(--rui-component-menu-font-size)] leading-[var(--rui-component-menu-item-line-height)]',
          // Surface
          'outline-hidden',
          // Layout
          'select-none',
          // Keyboard focus
          'focus:bg-accent focus:text-accent-foreground',
          // Component state
          'data-inset:pl-7 data-[variant=destructive]:text-destructive',
          // Keyboard focus
          'data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20',
          // Disabled state
          'data-disabled:pointer-events-none data-disabled:opacity-[var(--rui-opacity-disabled)]',
          // Child and composition rules
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          // Keyboard focus
          'focus:*:[svg]:text-accent-foreground',
          // Component state
          'data-[variant=destructive]:*:[svg]:text-destructive',
        ],
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSub({ ...props }: ContextMenuPrimitive.SubmenuRoot.Props) {
  return <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />;
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        [
          // Layout
          'flex cursor-default items-center',
          // Spacing
          'gap-1.5',
          // Surface
          'rounded-sm',
          // Spacing
          'px-[var(--rui-component-menu-item-padding-x)] py-[var(--rui-component-menu-item-padding-y)]',
          // Typography
          'text-[length:var(--rui-component-menu-font-size)] leading-[var(--rui-component-menu-item-line-height)]',
          // Surface
          'outline-hidden',
          // Layout
          'select-none',
          // Keyboard focus
          'focus:bg-accent focus:text-accent-foreground',
          // Component state
          'data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground',
          // Child and composition rules
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        ],
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

function ContextMenuSubContent({ ...props }: React.ComponentProps<typeof ContextMenuContent>) {
  return (
    <ContextMenuContent
      data-slot="context-menu-sub-content"
      className="shadow-lg"
      side="right"
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: ContextMenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
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
          'py-[var(--rui-component-menu-item-padding-y)] pr-8 pl-[var(--rui-component-menu-item-padding-x)]',
          // Typography
          'text-[length:var(--rui-component-menu-font-size)] leading-[var(--rui-component-menu-item-line-height)]',
          // Surface
          'outline-hidden',
          // Layout
          'select-none',
          // Keyboard focus
          'focus:bg-accent focus:text-accent-foreground',
          // Component state
          'data-inset:pl-7',
          // Disabled state
          'data-disabled:pointer-events-none data-disabled:opacity-[var(--rui-opacity-disabled)]',
          // Child and composition rules
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        ],
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute right-2">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioGroup({ ...props }: ContextMenuPrimitive.RadioGroup.Props) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

function ContextMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: ContextMenuPrimitive.RadioItem.Props & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
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
          'py-[var(--rui-component-menu-item-padding-y)] pr-8 pl-[var(--rui-component-menu-item-padding-x)]',
          // Typography
          'text-[length:var(--rui-component-menu-font-size)] leading-[var(--rui-component-menu-item-line-height)]',
          // Surface
          'outline-hidden',
          // Layout
          'select-none',
          // Keyboard focus
          'focus:bg-accent focus:text-accent-foreground',
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
      <span className="pointer-events-none absolute right-2">
        <ContextMenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuSeparator({ className, ...props }: ContextMenuPrimitive.Separator.Props) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground group-focus/context-menu-item:text-accent-foreground',
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
