import { ThemePortalScope } from '../theme.js';
import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { cn } from '../lib/utils.js';

import { Button } from './button.js';
import { XIcon } from 'lucide-react';

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal" {...props}>
      <ThemePortalScope>{props.children}</ThemePortalScope>
    </DialogPrimitive.Portal>
  );
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 isolate z-[var(--rui-z-dialog)] bg-[var(--rui-overlay)] duration-[var(--rui-duration-fast)] supports-backdrop-filter:backdrop-blur-[var(--rui-blur-overlay)] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  keepMounted = false,
  variant = 'default',
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
  keepMounted?: boolean;
  variant?: 'default' | 'compact';
}) {
  return (
    <DialogPortal keepMounted={keepMounted}>
      <DialogOverlay className={keepMounted ? 'data-closed:hidden' : undefined} />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-variant={variant}
        className={cn(
          [
            // Layout
            'group/dialog-content fixed top-1/2 left-1/2 z-[var(--rui-z-dialog)] grid w-full max-w-[calc(100%-var(--rui-space-8))] -translate-x-1/2 -translate-y-1/2',
            // Spacing
            'gap-4',
            // Surface
            'rounded-xl bg-popover',
            // Spacing
            'p-4',
            // Typography
            'text-sm text-popover-foreground',
            // Surface
            'ring-1 ring-foreground/10',
            // Motion
            'duration-[var(--rui-duration-fast)]',
            // Surface
            'outline-none',
            // Layout
            'sm:max-w-sm',
            // Component state
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          ],
          keepMounted && 'data-closed:hidden',
          variant === 'compact' &&
            'gap-0 rounded-md p-0 shadow-[var(--rui-shadow-dialog)] sm:max-w-lg',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={<Button variant="ghost" className="absolute top-2 right-2" size="icon-sm" />}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & {
  variant?: 'default' | 'compact';
}) {
  return (
    <div
      data-slot="dialog-header"
      data-variant={variant}
      className={cn(
        'flex flex-col gap-2 group-data-[variant=compact]/dialog-content:gap-[var(--rui-compact-surface-gap)] group-data-[variant=compact]/dialog-content:px-[var(--rui-compact-surface-padding-x)] group-data-[variant=compact]/dialog-content:py-[var(--rui-compact-surface-padding-y)]',
        variant === 'compact' &&
          'gap-[var(--rui-compact-surface-gap)] px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-compact-surface-padding-y)]',
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean;
  variant?: 'default' | 'compact';
}) {
  return (
    <div
      data-slot="dialog-footer"
      data-variant={variant}
      className={cn(
        '-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 px-4 py-[var(--rui-action-footer-padding-y)] sm:flex-row sm:justify-end',
        variant === 'compact' &&
          'mx-0 mb-0 flex-row flex-wrap justify-end rounded-b-md bg-transparent px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-compact-surface-padding-y)]',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>Close</DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        'font-heading text-base leading-none font-medium group-data-[variant=compact]/dialog-content:text-sm group-data-[variant=compact]/dialog-content:leading-[var(--rui-line-interface)] group-data-[variant=compact]/dialog-content:font-semibold',
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
