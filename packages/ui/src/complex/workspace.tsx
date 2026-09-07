import * as React from 'react';
import { useGroupRef } from 'react-resizable-panels';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../primitives/resizable.js';
import { cx } from './shared.js';

export const WORKSPACE_LAYOUT_VERSION = 1 as const;
export interface WorkspaceLayoutState {
  version: typeof WORKSPACE_LAYOUT_VERSION;
  sidebarOpen: boolean;
  primaryPercent: number;
}
export type WorkspaceLayoutSource = 'loading' | 'current' | 'legacy' | 'fallback' | 'unavailable';
export interface WorkspaceLayoutStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem?: (key: string) => void;
}
export interface WorkspaceLayoutRestoreOptions {
  defaultSidebarOpen?: boolean;
  defaultPrimaryPercent?: number;
  minPanelPercent?: number;
}
export interface WorkspaceLayoutRestoreResult {
  state: WorkspaceLayoutState;
  source: Exclude<WorkspaceLayoutSource, 'loading' | 'unavailable'>;
}

function workspaceMinimum(value = 20) {
  return Math.min(45, Math.max(5, Number.isFinite(value) ? value : 20));
}

function validPrimaryPercent(value: unknown, minimum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= 100 - minimum;
}

function workspaceDefaults(options: WorkspaceLayoutRestoreOptions = {}): WorkspaceLayoutState {
  const minimum = workspaceMinimum(options.minPanelPercent);
  const candidate = options.defaultPrimaryPercent ?? 60;
  const primaryPercent = validPrimaryPercent(candidate, minimum) ? candidate : Math.min(100 - minimum, Math.max(minimum, 60));
  return { version: WORKSPACE_LAYOUT_VERSION, sidebarOpen: options.defaultSidebarOpen ?? true, primaryPercent };
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function browserLayoutStorage(): WorkspaceLayoutStorage | null {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage; } catch { return null; }
}

function scheduleWorkspaceLayout(callback: () => void) {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(callback);
  else queueMicrotask(callback);
}

/** Restores current and legacy workspace JSON without trusting unavailable sizes or versions. */
export function restoreWorkspaceLayoutState(serialized: string | null | undefined, options: WorkspaceLayoutRestoreOptions = {}): WorkspaceLayoutRestoreResult {
  const fallback = workspaceDefaults(options);
  if (!serialized) return { state: fallback, source: 'fallback' };
  let parsed: unknown;
  try { parsed = JSON.parse(serialized); } catch { return { state: fallback, source: 'fallback' }; }
  const value = record(parsed);
  if (!value) return { state: fallback, source: 'fallback' };
  const minimum = workspaceMinimum(options.minPanelPercent);

  if (value.version === WORKSPACE_LAYOUT_VERSION) {
    if (typeof value.sidebarOpen !== 'boolean' || !validPrimaryPercent(value.primaryPercent, minimum)) return { state: fallback, source: 'fallback' };
    return { state: { version: WORKSPACE_LAYOUT_VERSION, sidebarOpen: value.sidebarOpen, primaryPercent: value.primaryPercent }, source: 'current' };
  }
  if (value.version !== undefined && value.version !== 0) return { state: fallback, source: 'fallback' };

  const legacyLayout = record(value.layout);
  const sidebar = value.sidebarOpen ?? value.sidebar ?? value.open;
  const primary = value.primaryPercent ?? value.primary ?? legacyLayout?.primary;
  const recognized = typeof sidebar === 'boolean' || typeof primary === 'number';
  if (!recognized) return { state: fallback, source: 'fallback' };
  return {
    state: {
      version: WORKSPACE_LAYOUT_VERSION,
      sidebarOpen: typeof sidebar === 'boolean' ? sidebar : fallback.sidebarOpen,
      primaryPercent: validPrimaryPercent(primary, minimum) ? primary : fallback.primaryPercent,
    },
    source: 'legacy',
  };
}

export function serializeWorkspaceLayoutState(state: WorkspaceLayoutState, options: WorkspaceLayoutRestoreOptions = {}) {
  const fallback = workspaceDefaults(options);
  const minimum = workspaceMinimum(options.minPanelPercent);
  return JSON.stringify({
    version: WORKSPACE_LAYOUT_VERSION,
    sidebarOpen: typeof state.sidebarOpen === 'boolean' ? state.sidebarOpen : fallback.sidebarOpen,
    primaryPercent: validPrimaryPercent(state.primaryPercent, minimum) ? state.primaryPercent : fallback.primaryPercent,
  } satisfies WorkspaceLayoutState);
}

export interface UseWorkspaceLayoutStateOptions extends WorkspaceLayoutRestoreOptions {
  storageKey?: string;
  storage?: WorkspaceLayoutStorage | null;
  onStorageError?: (error: unknown) => void;
}
export interface UseWorkspaceLayoutStateResult {
  state: WorkspaceLayoutState;
  source: WorkspaceLayoutSource;
  setSidebarOpen: (open: boolean) => void;
  setPrimaryPercent: (primaryPercent: number) => void;
  reset: () => void;
}

/** Restores, migrates and persists the shared Sidebar/ResizableWorkspace state. */
export function useWorkspaceLayoutState({
  storageKey = 'reito.workspace.layout',
  storage,
  defaultSidebarOpen = true,
  defaultPrimaryPercent = 60,
  minPanelPercent = 20,
  onStorageError,
}: UseWorkspaceLayoutStateOptions = {}): UseWorkspaceLayoutStateResult {
  const restoreOptions = React.useMemo(() => ({ defaultSidebarOpen, defaultPrimaryPercent, minPanelPercent }), [defaultPrimaryPercent, defaultSidebarOpen, minPanelPercent]);
  const fallback = React.useMemo(() => workspaceDefaults(restoreOptions), [restoreOptions]);
  const [state, setState] = React.useState<WorkspaceLayoutState>(fallback);
  const [source, setSource] = React.useState<WorkspaceLayoutSource>('loading');
  const target = storage === undefined ? browserLayoutStorage() : storage;
  const storageError = React.useRef(onStorageError);
  storageError.current = onStorageError;

  React.useEffect(() => {
    if (!target) {
      setState(fallback);
      setSource('unavailable');
      return;
    }
    try {
      const restored = restoreWorkspaceLayoutState(target.getItem(storageKey), restoreOptions);
      setState(restored.state);
      setSource(restored.source);
    } catch (error) {
      setState(fallback);
      setSource('unavailable');
      storageError.current?.(error);
    }
  }, [fallback, restoreOptions, storageKey, target]);

  React.useEffect(() => {
    if (!target || source === 'loading' || source === 'unavailable') return;
    try { target.setItem(storageKey, serializeWorkspaceLayoutState(state, restoreOptions)); }
    catch (error) {
      setSource('unavailable');
      storageError.current?.(error);
    }
  }, [restoreOptions, source, state, storageKey, target]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !target || target !== browserLayoutStorage()) return;
    const synchronize = (event: StorageEvent) => {
      if (event.storageArea !== target || event.key !== storageKey) return;
      const restored = restoreWorkspaceLayoutState(event.newValue, restoreOptions);
      setState(restored.state);
      setSource(restored.source);
    };
    window.addEventListener('storage', synchronize);
    return () => window.removeEventListener('storage', synchronize);
  }, [restoreOptions, storageKey, target]);

  const setSidebarOpen = React.useCallback((sidebarOpen: boolean) => {
    setState(current => ({ ...current, sidebarOpen }));
    setSource('current');
  }, []);
  const setPrimaryPercent = React.useCallback((primaryPercent: number) => {
    const minimum = workspaceMinimum(minPanelPercent);
    if (!validPrimaryPercent(primaryPercent, minimum)) return;
    setState(current => ({ ...current, primaryPercent }));
    setSource('current');
  }, [minPanelPercent]);
  const reset = React.useCallback(() => {
    setState(fallback);
    setSource('fallback');
  }, [fallback]);
  return { state, source, setSidebarOpen, setPrimaryPercent, reset };
}

export interface WorkspacePaneProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
}

/** A pane owns exactly one scrollable content region. It does not own application state. */
export function WorkspacePane({ title, description, actions, footer, scroll = true, className, children, ...props }: WorkspacePaneProps) {
  const titleId = React.useId();
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
  primaryPercent?: number;
  minPanelPercent?: number;
  onSizesChange?: (sizes: WorkspaceSizes, meta: WorkspaceSizeChangeMeta) => void;
  onPrimaryPercentChange?: (primaryPercent: number, meta: WorkspaceSizeChangeMeta) => void;
  className?: string;
}

export interface WorkspaceSizes { primary: number; secondary: number; }
export interface WorkspaceSizeChangeMeta { isUserInteraction: boolean; }

/** A two-pane split with pointer and keyboard resizing. Controlled and callback sizes are percentages. */
export function ResizableWorkspace({ primary, secondary, primaryLabel = '主面板', secondaryLabel = '辅助面板', orientation = 'horizontal', defaultPrimaryPercent = 60, primaryPercent, minPanelPercent = 20, onSizesChange, onPrimaryPercentChange, className }: ResizableWorkspaceProps) {
  const minimum = workspaceMinimum(minPanelPercent);
  const fallback = validPrimaryPercent(defaultPrimaryPercent, minimum) ? defaultPrimaryPercent : Math.min(100 - minimum, Math.max(minimum, 60));
  const controlled = primaryPercent === undefined ? undefined : (validPrimaryPercent(primaryPercent, minimum) ? primaryPercent : fallback);
  const initial = controlled ?? fallback;
  const groupRef = useGroupRef();
  const controlledRef = React.useRef(controlled);
  controlledRef.current = controlled;

  React.useEffect(() => {
    if (controlled === undefined) return;
    groupRef.current?.setLayout({ primary: controlled, secondary: 100 - controlled });
  }, [controlled, groupRef, orientation]);

  return <ResizablePanelGroup groupRef={groupRef} orientation={orientation} defaultLayout={{ primary: initial, secondary: 100 - initial }} className={cx('min-h-0 min-w-0', className)} onLayoutChanged={(layout, meta) => {
    const sizes = { primary: layout.primary, secondary: layout.secondary };
    const changeMeta = { isUserInteraction: meta.isUserInteraction };
    onSizesChange?.(sizes, changeMeta);
    onPrimaryPercentChange?.(layout.primary, changeMeta);
    if (controlledRef.current !== undefined && meta.isUserInteraction) scheduleWorkspaceLayout(() => {
      const expected = controlledRef.current;
      if (expected !== undefined) groupRef.current?.setLayout({ primary: expected, secondary: 100 - expected });
    });
  }}>
    <ResizablePanel id="primary" aria-label={primaryLabel} defaultSize={`${initial}%`} minSize={`${minimum}%`}>{primary}</ResizablePanel>
    <ResizableHandle withHandle aria-label={`调整${primaryLabel}与${secondaryLabel}的大小`} />
    <ResizablePanel id="secondary" aria-label={secondaryLabel} defaultSize={`${100 - initial}%`} minSize={`${minimum}%`}>{secondary}</ResizablePanel>
  </ResizablePanelGroup>;
}
