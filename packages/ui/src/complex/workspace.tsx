import type * as React from 'react';
import { useId } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../primitives/resizable.js';
import { cx } from './shared.js';

export interface WorkspacePaneProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
}

/** A pane owns exactly one scrollable content region. It does not own application state. */
export function WorkspacePane({ title, description, actions, footer, scroll = true, className, children, ...props }: WorkspacePaneProps) {
  const titleId = useId();
  return <section {...props} data-slot="workspace-pane" className={cx('flex min-h-0 min-w-0 flex-col bg-background text-foreground', className)}>
    {(title || actions) && <header className="flex shrink-0 items-center justify-between gap-[var(--rui-content-gap)] border-b border-border px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]">
      <div className="min-w-0">{title && <h2 id={titleId} className="truncate text-sm font-medium">{title}</h2>}{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}</div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>}
    <div data-slot="workspace-pane-body" tabIndex={scroll ? 0 : undefined} role={scroll ? 'region' : undefined} aria-labelledby={scroll && title ? titleId : undefined} aria-label={scroll && !title ? '面板内容' : undefined} className={cx('min-h-0 min-w-0 flex-1', scroll && 'overflow-auto overscroll-contain focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:-outline-offset-[var(--rui-outline-width)] focus-visible:outline-ring')}>{children}</div>
    {footer && <footer className="shrink-0 border-t border-border px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]">{footer}</footer>}
  </section>;
}

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  inspector?: React.ReactNode;
  footer?: React.ReactNode;
}

/** Height is supplied by the host. Narrow containers wrap support panels instead of hiding content. */
export function AppShell({ header, sidebar, inspector, footer, children, className, ...props }: AppShellProps) {
  return <div {...props} data-slot="app-shell" className={cx('@container flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-background font-sans text-sm text-foreground', className)}>
    {header && <header className="shrink-0 border-b border-border bg-muted/40 px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]">{header}</header>}
    <div className="flex min-h-0 flex-1 flex-col @2xl:flex-row">
      {sidebar && <aside className="shrink-0 overflow-auto border-b border-border bg-muted/30 p-[var(--rui-content-padding)] @2xl:w-[var(--rui-sidebar-width)] @2xl:border-r @2xl:border-b-0">{sidebar}</aside>}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      {inspector && <aside className="shrink-0 overflow-auto border-t border-border p-[var(--rui-content-padding)] @2xl:w-[var(--rui-inspector-width)] @2xl:border-t-0 @2xl:border-l">{inspector}</aside>}
    </div>
    {footer && <footer className="shrink-0 border-t border-border px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)] text-xs text-muted-foreground">{footer}</footer>}
  </div>;
}

export interface ResizableWorkspaceProps {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  orientation?: 'horizontal' | 'vertical';
  defaultPrimaryPercent?: number;
  minPanelPercent?: number;
  onSizesChange?: (sizes: { primary: number; secondary: number }) => void;
  className?: string;
}

/** A two-pane split with pointer and keyboard resizing. Sizes passed to the callback are percentages. */
export function ResizableWorkspace({ primary, secondary, primaryLabel = '主面板', secondaryLabel = '辅助面板', orientation = 'horizontal', defaultPrimaryPercent = 60, minPanelPercent = 20, onSizesChange, className }: ResizableWorkspaceProps) {
  const minimum = Math.min(45, Math.max(5, minPanelPercent));
  const initial = Math.min(100 - minimum, Math.max(minimum, defaultPrimaryPercent));
  return <ResizablePanelGroup orientation={orientation} className={cx('min-h-0 min-w-0', className)} onLayoutChanged={layout => onSizesChange?.({ primary: layout.primary, secondary: layout.secondary })}>
    <ResizablePanel id="primary" aria-label={primaryLabel} defaultSize={`${initial}%`} minSize={`${minimum}%`}>{primary}</ResizablePanel>
    <ResizableHandle withHandle aria-label={`调整${primaryLabel}与${secondaryLabel}的大小`} />
    <ResizablePanel id="secondary" aria-label={secondaryLabel} defaultSize={`${100 - initial}%`} minSize={`${minimum}%`}>{secondary}</ResizablePanel>
  </ResizablePanelGroup>;
}
