import { ThemePortalScope } from '../theme.js';
import { tokenMetrics } from '@reito/tokens/metrics';
import * as React from 'react';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { menuItemStateClassName, popupMotionClassName } from '../lib/state.js';
import { cn } from '../lib/utils.js';
import { ChevronRightIcon, CheckIcon } from 'lucide-react';

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return (
    <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props}>
      <ThemePortalScope>{props.children}</ThemePortalScope>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = tokenMetrics['space-1'],
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  return (
    <MenuPrimitive.Portal>
      <ThemePortalScope>
        <MenuPrimitive.Positioner
          className="isolate z-[var(--rui-z-popover)] outline-none"
          align={align}
          alignOffset={alignOffset}
          side={side}
          sideOffset={sideOffset}
        >
          <MenuPrimitive.Popup
            data-slot="dropdown-menu-content"
            className={cn(
              [
                // Layout
                'z-[var(--rui-z-popover)] max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto',
                // Surface
                'rounded-[var(--rui-component-menu-popup-radius)] bg-popover',
                // Spacing
                'p-[var(--rui-component-menu-popup-padding)]',
                // Typography
                'text-popover-foreground',
                // Surface
                'shadow-md ring-1 ring-foreground/10',
                // Surface
                'outline-none',
                // Motion
                popupMotionClassName,
                'data-ending-style:overflow-hidden',
              ],
              className,
            )}
            {...props}
          />
        </MenuPrimitive.Positioner>
      </ThemePortalScope>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'px-[var(--rui-component-menu-item-padding-x)] py-[var(--rui-component-menu-item-padding-y)] text-xs font-medium text-muted-foreground data-inset:pl-[var(--rui-component-menu-inset-padding-x)]',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        [
          // Layout
          'group/dropdown-menu-item relative flex cursor-default items-center',
          // Spacing
          'gap-[var(--rui-component-menu-item-gap)]',
          // Surface
          'rounded-[var(--rui-component-menu-item-radius)]',
          // Spacing
          'px-[var(--rui-component-menu-item-padding-x)] py-[var(--rui-component-menu-item-padding-y)]',
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
    />
  );
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        [
          // Layout
          'flex cursor-default items-center',
          // Spacing
          'gap-[var(--rui-component-menu-item-gap)]',
          // Surface
          'rounded-[var(--rui-component-menu-item-radius)]',
          // Spacing
          'px-[var(--rui-component-menu-item-padding-x)] py-[var(--rui-component-menu-item-padding-y)]',
          // Typography
          'text-[length:var(--rui-component-menu-font-size)] leading-[var(--rui-component-menu-item-line-height)]',
          // Surface
          'outline-hidden',
          // Layout
          'select-none',
          menuItemStateClassName,
          // Component state
          'data-inset:pl-[var(--rui-component-menu-inset-padding-x)]',
          // Child and composition rules
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--rui-component-menu-icon-size)]",
        ],
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  align = 'start',
  alignOffset = -tokenMetrics['control-inset'],
  side = 'right',
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        [
          // Layout
          'w-auto min-w-24',
          // Surface
          'rounded-[var(--rui-component-menu-popup-radius)] bg-popover',
          // Spacing
          'p-[var(--rui-component-menu-popup-padding)]',
          // Typography
          'text-popover-foreground',
          // Surface
          'shadow-lg ring-1 ring-foreground/10',
        ],
        className,
      )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
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
      data-slot="dropdown-menu-checkbox-item"
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
          'py-[var(--rui-component-menu-item-padding-y)] pr-[var(--rui-component-menu-inset-padding-x)] pl-[var(--rui-component-menu-item-padding-x)]',
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
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-[var(--rui-component-menu-item-padding-x)] flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean;
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
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
          'py-[var(--rui-component-menu-item-padding-y)] pr-[var(--rui-component-menu-inset-padding-x)] pl-[var(--rui-component-menu-item-padding-x)]',
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
      <span
        className="pointer-events-none absolute right-[var(--rui-component-menu-item-padding-x)] flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(
        'mx-[var(--rui-component-menu-separator-inset)] my-[var(--rui-component-menu-separator-margin-y)] h-px bg-border',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-[var(--rui-component-menu-item-fg-highlighted)]',
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
