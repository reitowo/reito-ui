/** Popup enter/exit. Base UI sets data-starting-style and data-ending-style. */
export const popupMotionClassName = [
  'scale-100',
  'transition-[scale,opacity]',
  'duration-[var(--rui-motion-duration)]',
  'ease-[var(--rui-motion-easing)]',
  'data-starting-style:scale-[var(--rui-motion-popup-scale)]',
  'data-starting-style:opacity-0',
  'data-ending-style:scale-[var(--rui-motion-popup-scale)]',
  'data-ending-style:opacity-0',
  'data-instant:transition-none',
].join(' ');

/** Highlight and disabled menu rows. Geometry stays on the menu component tokens. */
export const menuItemStateClassName = [
  'bg-[var(--rui-component-menu-item-bg-rest)]',
  'focus:bg-[var(--rui-component-menu-item-bg-highlighted)]',
  'focus:text-[var(--rui-component-menu-item-fg-highlighted)]',
  'data-highlighted:bg-[var(--rui-component-menu-item-bg-highlighted)]',
  'data-highlighted:text-[var(--rui-component-menu-item-fg-highlighted)]',
  'data-open:bg-[var(--rui-component-menu-item-bg-highlighted)]',
  'data-open:text-[var(--rui-component-menu-item-fg-highlighted)]',
  'data-popup-open:bg-[var(--rui-component-menu-item-bg-highlighted)]',
  'data-popup-open:text-[var(--rui-component-menu-item-fg-highlighted)]',
  'not-data-[variant=destructive]:focus:**:text-[var(--rui-component-menu-item-fg-highlighted)]',
  'not-data-[variant=destructive]:data-highlighted:**:text-[var(--rui-component-menu-item-fg-highlighted)]',
  'data-[variant=destructive]:text-[var(--rui-component-menu-item-fg-destructive)]',
  'data-[variant=destructive]:focus:bg-[var(--rui-component-menu-item-bg-highlighted-destructive)]',
  'data-[variant=destructive]:focus:text-[var(--rui-component-menu-item-fg-destructive)]',
  'data-[variant=destructive]:data-highlighted:bg-[var(--rui-component-menu-item-bg-highlighted-destructive)]',
  'data-[variant=destructive]:data-highlighted:text-[var(--rui-component-menu-item-fg-destructive)]',
  'data-[variant=destructive]:data-open:bg-[var(--rui-component-menu-item-bg-highlighted-destructive)]',
  'data-[variant=destructive]:data-open:text-[var(--rui-component-menu-item-fg-destructive)]',
  'data-[variant=destructive]:*:[svg]:text-[var(--rui-component-menu-item-fg-destructive)]',
  'data-disabled:opacity-[var(--rui-component-menu-item-opacity-disabled)]',
].join(' ');

/** Shared field fill and border states. Read-only stays opaque; disabled uses shared opacity. */
export const fieldStateClassName = [
  'border-[var(--rui-component-input-border-rest)]',
  'bg-[var(--rui-component-input-bg-rest)]',
  'hover:bg-[var(--rui-component-input-bg-hover)]',
  'disabled:bg-[var(--rui-component-input-bg-disabled)]',
  'enabled:read-only:border-[var(--rui-component-input-border-readonly)]',
  'enabled:read-only:bg-[var(--rui-component-input-bg-readonly)]',
  'aria-invalid:border-[var(--rui-component-input-border-invalid)]',
  'transition-colors',
  'duration-[var(--rui-motion-duration)]',
  'ease-[var(--rui-motion-easing)]',
].join(' ');
