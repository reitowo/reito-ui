'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../primitives/alert-dialog.js';
import { Button } from '../primitives/button.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../primitives/dialog.js';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../primitives/sheet.js';

export type OverlayKind = 'dialog' | 'sheet' | 'alert-dialog';
export type OverlaySide = 'top' | 'right' | 'bottom' | 'left';
export type OverlayDismissReason =
  | 'cancel'
  | 'close'
  | 'escape'
  | 'outside'
  | 'programmatic'
  | 'close-all'
  | 'ancestor-close'
  | 'provider-unmount';

export type OverlayOutcome<Value = void> =
  | { status: 'closed'; value: Value }
  | { status: 'dismissed'; reason: OverlayDismissReason };

export interface OverlayRenderContext<Value = void> {
  id: string;
  close: (value?: Value) => void;
  dismiss: (reason?: OverlayDismissReason) => void;
  patch: (options: Partial<OverlayOptions<Value>>) => void;
  open: <NextValue = void>(options: OverlayOptions<NextValue>) => OverlayHandle<NextValue>;
}

export interface OverlayOptions<Value = void> {
  kind?: OverlayKind;
  title: React.ReactNode;
  description?: React.ReactNode;
  content?: React.ReactNode | ((context: OverlayRenderContext<Value>) => React.ReactNode);
  footer?: React.ReactNode | ((context: OverlayRenderContext<Value>) => React.ReactNode);
  confirmLabel?: string;
  confirmValue?: Value;
  cancelLabel?: string;
  closeLabel?: string;
  showCancel?: boolean;
  destructive?: boolean;
  dismissible?: boolean;
  sheetSide?: OverlaySide;
  className?: string;
}

export interface OverlayHandle<Value = void> {
  readonly id: string;
  readonly result: Promise<OverlayOutcome<Value>>;
  readonly isOpen: boolean;
  close: (value?: Value) => void;
  dismiss: (reason?: OverlayDismissReason) => void;
  patch: (options: Partial<OverlayOptions<Value>>) => void;
}

export interface OverlayService {
  open: <Value = void>(options: OverlayOptions<Value>) => OverlayHandle<Value>;
  close: <Value = void>(id: string, value?: Value) => void;
  dismiss: (id: string, reason?: OverlayDismissReason) => void;
  patch: <Value = void>(id: string, options: Partial<OverlayOptions<Value>>) => void;
  closeAll: (reason?: OverlayDismissReason) => void;
  isOpen: (id: string) => boolean;
}

interface InternalOverlay {
  id: string;
  options: OverlayOptions<unknown>;
  resolve: (outcome: OverlayOutcome<unknown>) => void;
  returnFocus: HTMLElement | null;
}

const OverlayContext = React.createContext<OverlayService | null>(null);

function activeElement() {
  if (typeof document === 'undefined') return null;
  return document.activeElement instanceof HTMLElement ? document.activeElement : null;
}

function nextFrame(callback: () => void) {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(callback);
  else queueMicrotask(callback);
}

function restoreFocus(origin: HTMLElement | null, remaining?: InternalOverlay) {
  nextFrame(() => {
    if (origin?.isConnected && (!remaining || origin.closest(`[data-overlay-id="${remaining.id}"]`))) {
      origin.focus();
      return;
    }
    if (remaining && typeof document !== 'undefined') {
      const popup = document.querySelector<HTMLElement>(`[data-overlay-id="${remaining.id}"]`);
      const target = popup?.querySelector<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])');
      (target ?? popup)?.focus();
      return;
    }
    if (origin?.isConnected) origin.focus();
  });
}

function dismissReason(reason: string): OverlayDismissReason {
  if (reason === 'escape-key' || reason === 'close-watcher') return 'escape';
  if (reason === 'outside-press' || reason === 'focus-out') return 'outside';
  if (reason === 'close-press') return 'close';
  return 'programmatic';
}

function contentFor(entry: InternalOverlay, context: OverlayRenderContext<unknown>) {
  return typeof entry.options.content === 'function' ? entry.options.content(context) : entry.options.content;
}

function footerFor(entry: InternalOverlay, context: OverlayRenderContext<unknown>) {
  const { options } = entry;
  if (typeof options.footer === 'function') return options.footer(context);
  if (options.footer !== undefined) return options.footer;
  const confirmLabel = options.confirmLabel ?? (options.kind === 'alert-dialog' ? '确认' : undefined);
  const showCancel = options.showCancel ?? Boolean(confirmLabel);
  if (options.kind === 'alert-dialog') return <AlertDialogFooter>
    {showCancel && <AlertDialogCancel size="sm" onClick={() => context.dismiss('cancel')}>{options.cancelLabel ?? '取消'}</AlertDialogCancel>}
    <AlertDialogAction size="sm" variant={options.destructive ? 'destructive' : 'default'} onClick={() => context.close(options.confirmValue)}>{confirmLabel ?? options.closeLabel ?? '关闭'}</AlertDialogAction>
  </AlertDialogFooter>;
  if (options.kind === 'sheet') return <>
    {showCancel && <Button type="button" size="sm" variant="outline" onClick={() => context.dismiss('cancel')}>{options.cancelLabel ?? '取消'}</Button>}
    <Button type="button" size="sm" variant={options.destructive ? 'destructive' : 'default'} onClick={() => confirmLabel ? context.close(options.confirmValue) : context.dismiss('close')}>{confirmLabel ?? options.closeLabel ?? '关闭'}</Button>
  </>;
  return <DialogFooter>
    {showCancel && <Button type="button" size="sm" variant="outline" onClick={() => context.dismiss('cancel')}>{options.cancelLabel ?? '取消'}</Button>}
    <Button type="button" size="sm" variant={options.destructive ? 'destructive' : 'default'} onClick={() => confirmLabel ? context.close(options.confirmValue) : context.dismiss('close')}>{confirmLabel ?? options.closeLabel ?? '关闭'}</Button>
  </DialogFooter>;
}

function OverlayLayer({ entries, index, service }: { entries: InternalOverlay[]; index: number; service: OverlayService }) {
  const entry = entries[index];
  if (!entry) return null;
  const context: OverlayRenderContext<unknown> = {
    id: entry.id,
    close: value => service.close(entry.id, value),
    dismiss: reason => service.dismiss(entry.id, reason),
    patch: options => service.patch(entry.id, options),
    open: service.open,
  };
  const nested = <OverlayLayer entries={entries} index={index + 1} service={service} />;
  const requestClose = (open: boolean, reason: string, cancel: () => void) => {
    if (open) return;
    if (reason === 'sibling-open') {
      cancel();
      return;
    }
    const mapped = dismissReason(reason);
    if (entry.options.dismissible === false && (mapped === 'escape' || mapped === 'outside')) {
      cancel();
      return;
    }
    context.dismiss(mapped);
  };
  const body = contentFor(entry, context);
  const footer = footerFor(entry, context);
  const kind = entry.options.kind ?? 'dialog';

  if (kind === 'alert-dialog') return <AlertDialog open onOpenChange={(open, details) => requestClose(open, details.reason, details.cancel)}>
    <AlertDialogContent data-overlay-id={entry.id} className={entry.options.className}>
      <AlertDialogHeader>
        <AlertDialogTitle>{entry.options.title}</AlertDialogTitle>
        {entry.options.description && <AlertDialogDescription>{entry.options.description}</AlertDialogDescription>}
      </AlertDialogHeader>
      {body && <div className="min-w-0 text-sm">{body}</div>}
      {footer}
    </AlertDialogContent>
    {nested}
  </AlertDialog>;

  if (kind === 'sheet') return <Sheet open onOpenChange={(open, details) => requestClose(open, details.reason, details.cancel)}>
    <SheetContent data-overlay-id={entry.id} side={entry.options.sheetSide ?? 'right'} showCloseButton={false} className={entry.options.className}>
      <SheetHeader>
        <SheetTitle>{entry.options.title}</SheetTitle>
        {entry.options.description && <SheetDescription>{entry.options.description}</SheetDescription>}
      </SheetHeader>
      {body && <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-[var(--rui-content-padding)] text-sm">{body}</div>}
      <SheetFooter>{footer}</SheetFooter>
    </SheetContent>
    {nested}
  </Sheet>;

  return <Dialog open onOpenChange={(open, details) => requestClose(open, details.reason, details.cancel)} disablePointerDismissal={entry.options.dismissible === false}>
    <DialogContent data-overlay-id={entry.id} showCloseButton={false} className={entry.options.className}>
      <DialogHeader>
        <DialogTitle>{entry.options.title}</DialogTitle>
        {entry.options.description && <DialogDescription>{entry.options.description}</DialogDescription>}
      </DialogHeader>
      {body && <div className="min-w-0 text-sm">{body}</div>}
      {footer}
    </DialogContent>
    {nested}
  </Dialog>;
}

export interface OverlayProviderProps { children: React.ReactNode; }

/** Adds an optional imperative transaction layer above the declarative overlay primitives. */
export function OverlayProvider({ children }: OverlayProviderProps) {
  const overlays = React.useRef(new Map<string, InternalOverlay>());
  const sequence = React.useRef(0);
  const mounted = React.useRef(false);
  const renderBusy = React.useRef(false);
  const renderQueue = React.useRef<InternalOverlay[]>([]);
  const [entries, setEntries] = React.useState<InternalOverlay[]>([]);

  const refresh = React.useCallback(() => setEntries(current => current.flatMap(entry => {
    const latest = overlays.current.get(entry.id);
    return latest ? [latest] : [];
  })), []);
  const renderNext = React.useCallback(function processQueue() {
    let next = renderQueue.current.shift();
    while (next && !overlays.current.has(next.id)) next = renderQueue.current.shift();
    if (!next) {
      renderBusy.current = false;
      return;
    }
    setEntries(current => [...current, next!]);
    nextFrame(processQueue);
  }, []);
  const mountEntry = React.useCallback((entry: InternalOverlay) => {
    if (renderBusy.current) {
      renderQueue.current.push(entry);
      return;
    }
    renderBusy.current = true;
    setEntries(current => [...current, entry]);
    nextFrame(renderNext);
  }, [renderNext]);
  const settle = React.useCallback((id: string, outcome: OverlayOutcome<unknown>) => {
    const current = [...overlays.current.values()];
    const index = current.findIndex(entry => entry.id === id);
    if (index < 0) return;
    const removed = current.slice(index);
    for (const entry of removed) overlays.current.delete(entry.id);
    refresh();
    removed.forEach((entry, removedIndex) => entry.resolve(removedIndex === 0 ? outcome : { status: 'dismissed', reason: 'ancestor-close' }));
    restoreFocus(removed[0].returnFocus, current[index - 1]);
  }, [refresh]);
  const close = React.useCallback(<Value,>(id: string, value?: Value) => settle(id, { status: 'closed', value } as OverlayOutcome<unknown>), [settle]);
  const dismiss = React.useCallback((id: string, reason: OverlayDismissReason = 'programmatic') => settle(id, { status: 'dismissed', reason }), [settle]);
  const patch = React.useCallback(<Value,>(id: string, options: Partial<OverlayOptions<Value>>) => {
    const entry = overlays.current.get(id);
    if (!entry) return;
    entry.options = { ...entry.options, ...options } as OverlayOptions<unknown>;
    refresh();
  }, [refresh]);
  const open = React.useCallback(<Value,>(options: OverlayOptions<Value>): OverlayHandle<Value> => {
    const id = `reito-overlay-${++sequence.current}`;
    let resolveResult!: (outcome: OverlayOutcome<Value>) => void;
    const result = new Promise<OverlayOutcome<Value>>(resolve => { resolveResult = resolve; });
    overlays.current.set(id, {
      id,
      options: options as OverlayOptions<unknown>,
      resolve: outcome => resolveResult(outcome as OverlayOutcome<Value>),
      returnFocus: activeElement(),
    });
    mountEntry(overlays.current.get(id)!);
    return {
      id,
      result,
      get isOpen() { return overlays.current.has(id); },
      close: value => close(id, value),
      dismiss: reason => dismiss(id, reason),
      patch: next => patch(id, next),
    };
  }, [close, dismiss, mountEntry, patch]);
  const closeAll = React.useCallback((reason: OverlayDismissReason = 'close-all') => {
    const current = [...overlays.current.values()];
    if (!current.length) return;
    overlays.current.clear();
    refresh();
    current.forEach(entry => entry.resolve({ status: 'dismissed', reason }));
    restoreFocus(current[0].returnFocus);
  }, [refresh]);
  const isOpen = React.useCallback((id: string) => overlays.current.has(id), []);
  const service = React.useMemo<OverlayService>(() => ({ open, close, dismiss, patch, closeAll, isOpen }), [close, closeAll, dismiss, isOpen, open, patch]);

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      queueMicrotask(() => {
        if (mounted.current) return;
        const pending = [...overlays.current.values()];
        overlays.current.clear();
        renderQueue.current = [];
        pending.forEach(entry => entry.resolve({ status: 'dismissed', reason: 'provider-unmount' }));
      });
    };
  }, []);

  return <OverlayContext.Provider value={service}>
    {children}
    <OverlayLayer entries={entries} index={0} service={service} />
  </OverlayContext.Provider>;
}

export function useOverlay() {
  const service = React.useContext(OverlayContext);
  if (!service) throw new Error('useOverlay must be used inside OverlayProvider.');
  return service;
}
