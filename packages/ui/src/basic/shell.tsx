import type { ComponentProps } from 'react';
import { cn } from '../lib/utils.js';

/** The host supplies height. Navigation wraps above the main area in narrow containers without hiding content. */
function ShellRoot({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="shell"
      className={cn(
        '@container flex min-h-0 min-w-0 flex-col overflow-hidden',
        'bg-background text-foreground',
        className,
      )}
      {...props}
    >
      <div data-slot="shell-layout" className="flex min-h-0 min-w-0 flex-1 flex-col @2xl:flex-row">
        {children}
      </div>
    </div>
  );
}

function ShellSidebar({ className, ...props }: ComponentProps<'aside'>) {
  return (
    <aside
      data-slot="shell-sidebar"
      className={cn(
        'min-w-0 shrink-0 overflow-auto',
        'border-b border-border bg-muted/30 p-[var(--rui-content-padding)]',
        '@2xl:w-[var(--rui-sidebar-width)] @2xl:border-r @2xl:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

/** Main groups its topbar and scrolling content; it adds no padding or outside margins. */
function ShellMain({ className, ...props }: ComponentProps<'main'>) {
  return (
    <main
      data-slot="shell-main"
      className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}
      {...props}
    />
  );
}

function ShellTopbar({ className, ...props }: ComponentProps<'header'>) {
  return (
    <header
      data-slot="shell-topbar"
      className={cn(
        'flex min-w-0 shrink-0 flex-wrap items-center',
        'min-h-[var(--rui-titlebar-height)] gap-[var(--rui-content-gap-sm)] border-b border-border',
        'px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]',
        className,
      )}
      {...props}
    />
  );
}

/** Content owns scrolling; Page inset supplies the content edge once, including inside nested themes. */
function ShellContent({
  scroll = true,
  className,
  ...props
}: ComponentProps<'div'> & { scroll?: boolean }) {
  return (
    <div
      data-slot="shell-content"
      tabIndex={scroll ? 0 : undefined}
      role={scroll ? 'region' : undefined}
      aria-label={scroll ? '主内容' : undefined}
      className={cn(
        'min-h-0 min-w-0 flex-1',
        scroll && 'rui-scroll-focus overflow-auto overscroll-contain',
        className,
      )}
      {...props}
    />
  );
}

function ShellFooter({ className, ...props }: ComponentProps<'footer'>) {
  return (
    <footer
      data-slot="shell-footer"
      className={cn(
        'shrink-0 border-t border-border',
        'px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]',
        className,
      )}
      {...props}
    />
  );
}

/** Named navigation, topbar and content regions. AppShell/WorkspacePreset retain their existing interfaces. */
export const Shell = Object.assign(ShellRoot, {
  Sidebar: ShellSidebar,
  Main: ShellMain,
  Topbar: ShellTopbar,
  Content: ShellContent,
  Footer: ShellFooter,
});
