import * as React from 'react';
import { useGroupRef } from 'react-resizable-panels';
import { Button } from '../primitives/button.js';
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

export const WORKSPACE_PRESET_VERSION = 1 as const;
export type WorkspacePresetPanelId = 'navigation' | 'workspace' | 'inspector';
export interface WorkspacePresetView {
  navigationOpen: boolean;
  inspectorOpen: boolean;
  activePanel: WorkspacePresetPanelId;
}
export interface WorkspacePresetState extends WorkspacePresetView {
  version: typeof WORKSPACE_PRESET_VERSION;
}
export interface WorkspacePresetRestoreOptions {
  defaultNavigationOpen?: boolean;
  defaultInspectorOpen?: boolean;
  defaultActivePanel?: WorkspacePresetPanelId;
}
export interface WorkspacePresetRestoreResult {
  state: WorkspacePresetState;
  source: Exclude<WorkspaceLayoutSource, 'loading' | 'unavailable'>;
}

function isWorkspacePresetPanel(value: unknown): value is WorkspacePresetPanelId {
  return value === 'navigation' || value === 'workspace' || value === 'inspector';
}

function workspacePresetDefaults(options: WorkspacePresetRestoreOptions = {}): WorkspacePresetState {
  return {
    version: WORKSPACE_PRESET_VERSION,
    navigationOpen: options.defaultNavigationOpen ?? true,
    inspectorOpen: options.defaultInspectorOpen ?? true,
    activePanel: options.defaultActivePanel ?? 'workspace',
  };
}

/** Restores a preset's panel visibility without coupling it to ResizableWorkspace sizing. */
export function restoreWorkspacePresetState(serialized: string | null | undefined, options: WorkspacePresetRestoreOptions = {}): WorkspacePresetRestoreResult {
  const fallback = workspacePresetDefaults(options);
  if (!serialized) return { state: fallback, source: 'fallback' };
  let parsed: unknown;
  try { parsed = JSON.parse(serialized); } catch { return { state: fallback, source: 'fallback' }; }
  const value = record(parsed);
  if (!value) return { state: fallback, source: 'fallback' };
  if (value.version !== undefined && value.version !== WORKSPACE_PRESET_VERSION && value.version !== 0) return { state: fallback, source: 'fallback' };
  const navigationOpen = value.navigationOpen ?? value.navigation;
  const inspectorOpen = value.inspectorOpen ?? value.inspector;
  const activePanel = value.activePanel ?? value.panel;
  const recognized = typeof navigationOpen === 'boolean' || typeof inspectorOpen === 'boolean' || isWorkspacePresetPanel(activePanel);
  if (!recognized) return { state: fallback, source: 'fallback' };
  if (value.version === WORKSPACE_PRESET_VERSION && (typeof navigationOpen !== 'boolean' || typeof inspectorOpen !== 'boolean' || !isWorkspacePresetPanel(activePanel))) return { state: fallback, source: 'fallback' };
  return {
    state: {
      version: WORKSPACE_PRESET_VERSION,
      navigationOpen: typeof navigationOpen === 'boolean' ? navigationOpen : fallback.navigationOpen,
      inspectorOpen: typeof inspectorOpen === 'boolean' ? inspectorOpen : fallback.inspectorOpen,
      activePanel: isWorkspacePresetPanel(activePanel) ? activePanel : fallback.activePanel,
    },
    source: value.version === WORKSPACE_PRESET_VERSION ? 'current' : 'legacy',
  };
}

export function serializeWorkspacePresetState(view: WorkspacePresetView, options: WorkspacePresetRestoreOptions = {}) {
  const fallback = workspacePresetDefaults(options);
  return JSON.stringify({
    version: WORKSPACE_PRESET_VERSION,
    navigationOpen: typeof view.navigationOpen === 'boolean' ? view.navigationOpen : fallback.navigationOpen,
    inspectorOpen: typeof view.inspectorOpen === 'boolean' ? view.inspectorOpen : fallback.inspectorOpen,
    activePanel: isWorkspacePresetPanel(view.activePanel) ? view.activePanel : fallback.activePanel,
  } satisfies WorkspacePresetState);
}

export interface UseWorkspacePresetStateOptions extends WorkspacePresetRestoreOptions {
  storageKey?: string;
  storage?: WorkspaceLayoutStorage | null;
  onStorageError?: (error: unknown) => void;
}
export interface UseWorkspacePresetStateResult {
  state: WorkspacePresetState;
  source: WorkspaceLayoutSource;
  setView: (view: WorkspacePresetView | ((current: WorkspacePresetState) => WorkspacePresetView)) => void;
  setNavigationOpen: (open: boolean) => void;
  setInspectorOpen: (open: boolean) => void;
  setActivePanel: (panel: WorkspacePresetPanelId) => void;
  reset: () => void;
}

/** Persists visibility and the narrow-layout panel independently from split percentages. */
export function useWorkspacePresetState({
  storageKey = 'reito.workspace.preset',
  storage,
  defaultNavigationOpen = true,
  defaultInspectorOpen = true,
  defaultActivePanel = 'workspace',
  onStorageError,
}: UseWorkspacePresetStateOptions = {}): UseWorkspacePresetStateResult {
  const restoreOptions = React.useMemo(() => ({ defaultNavigationOpen, defaultInspectorOpen, defaultActivePanel }), [defaultActivePanel, defaultInspectorOpen, defaultNavigationOpen]);
  const fallback = React.useMemo(() => workspacePresetDefaults(restoreOptions), [restoreOptions]);
  const [state, setState] = React.useState<WorkspacePresetState>(fallback);
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
      const restored = restoreWorkspacePresetState(target.getItem(storageKey), restoreOptions);
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
    try { target.setItem(storageKey, serializeWorkspacePresetState(state, restoreOptions)); }
    catch (error) {
      setSource('unavailable');
      storageError.current?.(error);
    }
  }, [restoreOptions, source, state, storageKey, target]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !target || target !== browserLayoutStorage()) return;
    const synchronize = (event: StorageEvent) => {
      if (event.storageArea !== target || event.key !== storageKey) return;
      const restored = restoreWorkspacePresetState(event.newValue, restoreOptions);
      setState(restored.state);
      setSource(restored.source);
    };
    window.addEventListener('storage', synchronize);
    return () => window.removeEventListener('storage', synchronize);
  }, [restoreOptions, storageKey, target]);

  const setView = React.useCallback((next: WorkspacePresetView | ((current: WorkspacePresetState) => WorkspacePresetView)) => {
    setState(current => {
      const view = typeof next === 'function' ? next(current) : next;
      return { version: WORKSPACE_PRESET_VERSION, ...view };
    });
    setSource('current');
  }, []);
  const setNavigationOpen = React.useCallback((navigationOpen: boolean) => setView(current => ({ ...current, navigationOpen })), [setView]);
  const setInspectorOpen = React.useCallback((inspectorOpen: boolean) => setView(current => ({ ...current, inspectorOpen })), [setView]);
  const setActivePanel = React.useCallback((activePanel: WorkspacePresetPanelId) => setView(current => ({ ...current, activePanel })), [setView]);
  const reset = React.useCallback(() => {
    setState(fallback);
    setSource('fallback');
  }, [fallback]);
  return { state, source, setView, setNavigationOpen, setInspectorOpen, setActivePanel, reset };
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
  bodyRef?: React.Ref<HTMLDivElement>;
}

/** A pane owns exactly one scrollable content region. It does not own application state. */
export function WorkspacePane({ title, description, actions, footer, scroll = true, bodyRef, className, children, ...props }: WorkspacePaneProps) {
  const titleId = React.useId();
  return <section {...props} data-slot="workspace-pane" className={cx('flex min-h-0 min-w-0 flex-col bg-background text-foreground', className)}>
    {(title || actions) && <header className="flex shrink-0 items-center justify-between gap-[var(--rui-content-gap)] border-b border-border px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]">
      <div className="min-w-0">{title && <h2 id={titleId} className="truncate text-sm font-medium">{title}</h2>}{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}</div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>}
    <div ref={bodyRef} data-slot="workspace-pane-body" tabIndex={scroll ? 0 : undefined} role={scroll ? 'region' : undefined} aria-labelledby={scroll && title ? titleId : undefined} aria-label={scroll && !title ? '面板内容' : undefined} className={cx('min-h-0 min-w-0 flex-1', scroll && 'rui-scroll-focus overflow-auto overscroll-contain')}>{children}</div>
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

export interface WorkspacePresetSlot {
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  content: React.ReactNode;
  scroll?: boolean;
  bodyRef?: React.Ref<HTMLDivElement>;
}
export interface WorkspacePresetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'onChange'> {
  title?: React.ReactNode;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  navigation?: WorkspacePresetSlot;
  workspace: WorkspacePresetSlot;
  inspector?: WorkspacePresetSlot;
  view?: WorkspacePresetView;
  defaultView?: Partial<WorkspacePresetView>;
  onViewChange?: (view: WorkspacePresetView) => void;
  mode?: 'auto' | 'wide' | 'narrow';
  navigationLabel?: string;
  workspaceLabel?: string;
  inspectorLabel?: string;
  wideControlsLabel?: string;
  narrowControlsLabel?: string;
}

function presetPanelClass(mode: NonNullable<WorkspacePresetProps['mode']>, narrowVisible: boolean, wideVisible: boolean, position: WorkspacePresetPanelId) {
  const common = 'min-h-0 min-w-0 flex-col';
  const narrow = narrowVisible ? 'flex flex-1' : 'hidden';
  const wide = position === 'workspace'
    ? 'flex min-w-0 flex-1'
    : position === 'navigation'
      ? 'flex w-[var(--rui-sidebar-width)] shrink-0 border-r border-border'
      : 'flex w-[var(--rui-inspector-width)] shrink-0 border-l border-border';
  if (mode === 'narrow') return cx(common, narrow);
  if (mode === 'wide') return cx(common, wideVisible ? wide : 'hidden');
  const autoWide = wideVisible
    ? position === 'workspace'
      ? '@4xl:flex @4xl:min-w-0 @4xl:flex-1'
      : position === 'navigation'
        ? '@4xl:flex @4xl:w-[var(--rui-sidebar-width)] @4xl:flex-none @4xl:border-r @4xl:border-border'
        : '@4xl:flex @4xl:w-[var(--rui-inspector-width)] @4xl:flex-none @4xl:border-l @4xl:border-border'
    : '@4xl:hidden';
  return cx(common, narrow, autoWide);
}

/** A responsive three-slot composition. WorkspacePane owns each slot's scroll region. */
export function WorkspacePreset({ title, toolbar, footer, navigation, workspace, inspector, view: viewProp, defaultView, onViewChange, mode = 'auto', navigationLabel = '导航', workspaceLabel = '工作区', inspectorLabel = '检查器', wideControlsLabel = '宽布局面板', narrowControlsLabel = '窄布局面板', className, ...props }: WorkspacePresetProps) {
  const navigationId = React.useId();
  const workspaceId = React.useId();
  const inspectorId = React.useId();
  const [internalView, setInternalView] = React.useState<WorkspacePresetView>({
    navigationOpen: defaultView?.navigationOpen ?? Boolean(navigation),
    inspectorOpen: defaultView?.inspectorOpen ?? Boolean(inspector),
    activePanel: defaultView?.activePanel ?? 'workspace',
  });
  const suppliedView = viewProp ?? internalView;
  const activePanel = suppliedView.activePanel === 'navigation' && !navigation
    ? 'workspace'
    : suppliedView.activePanel === 'inspector' && !inspector
      ? 'workspace'
      : suppliedView.activePanel;
  const view = { ...suppliedView, activePanel };
  const updateView = (next: WorkspacePresetView) => {
    if (viewProp === undefined) setInternalView(next);
    onViewChange?.(next);
  };
  const choosePanel = (active: WorkspacePresetPanelId) => updateView({ ...view, activePanel: active });
  const wideControls = mode !== 'narrow' && (navigation || inspector);
  const narrowControls = mode !== 'wide' && (navigation || inspector);
  const autoWideClass = mode === 'auto' ? 'hidden @4xl:flex' : 'flex';
  const autoNarrowClass = mode === 'auto' ? 'flex @4xl:hidden' : 'flex';
  const renderSlot = (slot: WorkspacePresetSlot, id: string) => <WorkspacePane id={id} title={slot.title} description={slot.description} actions={slot.actions} footer={slot.footer} scroll={slot.scroll} bodyRef={slot.bodyRef} className="h-full">{slot.content}</WorkspacePane>;

  return <div {...props} data-slot="workspace-preset" data-mode={mode} data-active-panel={view.activePanel} className={cx('@container flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-background font-sans text-sm text-foreground', className)}>
    {(title || toolbar || wideControls || narrowControls) && <header className="flex shrink-0 items-center gap-[var(--rui-content-gap-sm)] border-b border-border bg-muted/30 px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]">
      {title && <div className="min-w-0 flex-1 truncate font-medium">{title}</div>}
      {!title && <div className="min-w-0 flex-1" />}
      {toolbar && <div className="flex min-w-0 items-center gap-[var(--rui-content-gap-sm)]">{toolbar}</div>}
      {wideControls && <div role="group" aria-label={wideControlsLabel} className={cx('shrink-0 items-center gap-[var(--rui-space-1)]', autoWideClass)}>
        {navigation && <Button type="button" size="xs" variant={view.navigationOpen ? 'secondary' : 'ghost'} aria-controls={navigationId} aria-pressed={view.navigationOpen} onClick={() => updateView({ ...view, navigationOpen: !view.navigationOpen })}>{navigationLabel}</Button>}
        {inspector && <Button type="button" size="xs" variant={view.inspectorOpen ? 'secondary' : 'ghost'} aria-controls={inspectorId} aria-pressed={view.inspectorOpen} onClick={() => updateView({ ...view, inspectorOpen: !view.inspectorOpen })}>{inspectorLabel}</Button>}
      </div>}
      {narrowControls && <div role="group" aria-label={narrowControlsLabel} className={cx('min-w-0 shrink-0 items-center gap-[var(--rui-space-1)]', autoNarrowClass)}>
        {navigation && <Button type="button" size="xs" variant={view.activePanel === 'navigation' ? 'secondary' : 'ghost'} aria-controls={navigationId} aria-pressed={view.activePanel === 'navigation'} onClick={() => choosePanel('navigation')}>{navigationLabel}</Button>}
        <Button type="button" size="xs" variant={view.activePanel === 'workspace' ? 'secondary' : 'ghost'} aria-controls={workspaceId} aria-pressed={view.activePanel === 'workspace'} onClick={() => choosePanel('workspace')}>{workspaceLabel}</Button>
        {inspector && <Button type="button" size="xs" variant={view.activePanel === 'inspector' ? 'secondary' : 'ghost'} aria-controls={inspectorId} aria-pressed={view.activePanel === 'inspector'} onClick={() => choosePanel('inspector')}>{inspectorLabel}</Button>}
      </div>}
    </header>}
    <div className="flex min-h-0 min-w-0 flex-1">
      {navigation && <div className={presetPanelClass(mode, view.activePanel === 'navigation', view.navigationOpen, 'navigation')}>{renderSlot(navigation, navigationId)}</div>}
      <div className={presetPanelClass(mode, view.activePanel === 'workspace', true, 'workspace')}>{renderSlot(workspace, workspaceId)}</div>
      {inspector && <div className={presetPanelClass(mode, view.activePanel === 'inspector', view.inspectorOpen, 'inspector')}>{renderSlot(inspector, inspectorId)}</div>}
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
