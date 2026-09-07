import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Key, type ReactNode, type Ref } from 'react';
import { defaultRangeExtractor, useVirtualizer, type Range } from '@tanstack/react-virtual';
import { Button } from '../primitives/button.js';
import { cn } from '../lib/utils.js';

export interface VirtualListRange { startIndex: number; endIndex: number; visibleStartIndex: number; visibleEndIndex: number }
export interface VirtualListHandle { scrollToIndex: (index: number, align?: 'start' | 'center' | 'end' | 'auto') => void }
export interface VirtualListProps<T> {
  count: number;
  getItem: (index: number) => T | undefined;
  getItemKey: (index: number) => Key;
  renderItem: (item: T, index: number) => ReactNode;
  renderPlaceholder?: (index: number) => ReactNode;
  onRangeChange?: (range: VirtualListRange) => void;
  overscan?: number;
  label: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  className?: string;
  viewportClassName?: string;
  /** Measure rendered rows and retain their stable-key anchor across data changes. */
  dynamic?: boolean;
  /** Stay at the end only when the viewport was already at the end before an append. */
  followOnAppend?: boolean;
  ref?: Ref<VirtualListHandle>;
}

/** Fixed token-height or measured rows. The host owns data fetching and stable item keys. */
export function VirtualList<T>({ count, getItem, getItemKey, renderItem, renderPlaceholder, onRangeChange, overscan = 4, label,
  loading = false, error, onRetry, emptyMessage = '暂无项目', className, viewportClassName, dynamic = false, followOnAppend = false, ref }: VirtualListProps<T>) {
  const viewport = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const densityAnchor = useRef<{ key: Key; relativeTop: number } | null>(null);
  const readingAnchor = useRef<{ key: Key; relativeTop: number } | null>(null);
  const dataAnchor = useRef<{ key: Key; relativeTop: number } | null>(null);
  const previousEdges = useRef<{ count: number; first: Key | null; last: Key | null } | null>(null);
  const wasAtEnd = useRef(false);
  const [rowHeight, setRowHeight] = useState(0);
  const itemCount = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  const [focusedKey, setFocusedKey] = useState<Key | null>(null);
  const focusedIndex = useMemo(() => {
    if (focusedKey === null) return -1;
    for (let index = 0; index < itemCount; index++) if (getItemKey(index) === focusedKey) return index;
    return -1;
  }, [focusedKey, getItemKey, itemCount]);
  const captureViewportAnchor = useCallback(() => {
    if (!viewport.current) return null;
    const viewportRect = viewport.current.getBoundingClientRect();
    const visibleRows = Array.from(viewport.current.querySelectorAll<HTMLElement>('[data-index]'))
      .map(row => ({ row, rect: row.getBoundingClientRect() }))
      .filter(({ rect }) => rect.bottom > viewportRect.top && rect.top < viewportRect.bottom)
      .sort((a, b) => Math.abs(a.rect.top - viewportRect.top) - Math.abs(b.rect.top - viewportRect.top));
    const anchor = visibleRows[0];
    const index = Number(anchor?.row.dataset.index);
    return anchor && Number.isInteger(index)
      ? { key: getItemKey(index), relativeTop: anchor.rect.top - viewportRect.top }
      : null;
  }, [getItemKey]);
  const nextEdges = { count: itemCount, first: itemCount ? getItemKey(0) : null, last: itemCount ? getItemKey(itemCount - 1) : null };
  const priorEdges = previousEdges.current;
  const appendedAtEnd = priorEdges && followOnAppend && wasAtEnd.current && nextEdges.count > priorEdges.count && nextEdges.first === priorEdges.first;
  if (priorEdges && !appendedAtEnd && (nextEdges.count !== priorEdges.count || nextEdges.first !== priorEdges.first || nextEdges.last !== priorEdges.last)) {
    dataAnchor.current = readingAnchor.current;
  }
  previousEdges.current = nextEdges;
  let dataAnchorIndex = -1;
  if (dataAnchor.current) {
    while (++dataAnchorIndex < itemCount && getItemKey(dataAnchorIndex) !== dataAnchor.current.key) { /* stable-key lookup */ }
    if (dataAnchorIndex >= itemCount) dataAnchorIndex = -1;
  }
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: itemCount, getScrollElement: () => viewport.current,
    estimateSize: useCallback(() => rowHeight || 1, [rowHeight]),
    getItemKey, overscan: Math.max(0, Math.floor(Number.isFinite(overscan) ? overscan : 0)), enabled: rowHeight > 0 && !error,
    anchorTo: 'end', followOnAppend,
    rangeExtractor: useCallback((range: Range) => {
      const indexes = defaultRangeExtractor(range);
      const retained = [focusedIndex, dataAnchorIndex].filter(index => index >= 0 && !indexes.includes(index));
      return retained.length ? [...indexes, ...retained].sort((a, b) => a - b) : indexes;
    }, [dataAnchorIndex, focusedIndex]),
  });
  virtualizer.shouldAdjustScrollPositionOnItemSizeChange = item => {
    const scrollOffset = virtualizer.scrollOffset ?? 0;
    return scrollOffset > 1 && item.start < scrollOffset + 1;
  };
  useLayoutEffect(() => {
    const element = probe.current;
    if (!element) return;
    const update = () => {
      const nextHeight = element.getBoundingClientRect().height;
      setRowHeight(currentHeight => {
        if (currentHeight > 0 && nextHeight !== currentHeight) densityAnchor.current ??= captureViewportAnchor();
        return nextHeight;
      });
    };
    update();
    const observer = new ResizeObserver(update); observer.observe(element);
    const densityRoot = viewport.current?.closest('[data-density]') ?? document.documentElement;
    const densityObserver = new MutationObserver(() => { densityAnchor.current = captureViewportAnchor(); });
    densityObserver.observe(densityRoot, { attributes: true, attributeFilter: ['data-density'] });
    return () => { observer.disconnect(); densityObserver.disconnect(); };
  }, [captureViewportAnchor, virtualizer]);
  useLayoutEffect(() => {
    if (!rowHeight) return;
    const anchor = densityAnchor.current;
    virtualizer.measure();
    if (!anchor) return;
    densityAnchor.current = null;
    let index = 0;
    while (index < itemCount && getItemKey(index) !== anchor.key) index++;
    if (index >= itemCount) return;
    virtualizer.scrollToIndex(index, { align: 'start' });
    if (anchor.relativeTop) virtualizer.scrollBy(-anchor.relativeTop);
  }, [getItemKey, itemCount, rowHeight, virtualizer]);
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const pending = dataAnchor.current;
    if (!pending) {
      readingAnchor.current = captureViewportAnchor();
      wasAtEnd.current = element.scrollHeight - element.clientHeight - element.scrollTop <= 1;
      return;
    }
    let frame = 0;
    let attempts = 0;
    const correct = () => {
      if (dataAnchor.current !== pending) return;
      const anchoredRow = Array.from(element.querySelectorAll<HTMLElement>('[data-index]')).find(row => {
        const index = Number(row.dataset.index);
        return Number.isInteger(index) && getItemKey(index) === pending.key;
      });
      if (anchoredRow) {
        const currentTop = anchoredRow.getBoundingClientRect().top - element.getBoundingClientRect().top;
        const difference = currentTop - pending.relativeTop;
        if (Math.abs(difference) > 0.5) element.scrollTop += difference;
        if (Math.abs(difference) <= 0.5 || attempts >= 7) {
          dataAnchor.current = null;
          readingAnchor.current = captureViewportAnchor();
          wasAtEnd.current = element.scrollHeight - element.clientHeight - element.scrollTop <= 1;
          return;
        }
      }
      attempts++;
      frame = requestAnimationFrame(correct);
    };
    frame = requestAnimationFrame(correct);
    return () => cancelAnimationFrame(frame);
  });
  useLayoutEffect(() => {
    if (focusedKey !== null && focusedIndex < 0) {
      viewport.current?.focus({ preventScroll: true });
      setFocusedKey(null);
    }
  }, [focusedKey, focusedIndex]);
  useImperativeHandle(ref, () => ({ scrollToIndex: (index, align = 'auto') => {
    if (!itemCount || !Number.isFinite(index)) return;
    virtualizer.scrollToIndex(Math.min(itemCount - 1, Math.max(0, Math.floor(index))), { align });
  } }), [itemCount, virtualizer]);
  const rows = virtualizer.getVirtualItems();
  const start = rows[0]?.index ?? -1;
  const end = rows[rows.length - 1]?.index ?? -1;
  const visibleStart = virtualizer.range?.startIndex ?? -1;
  const visibleEnd = virtualizer.range?.endIndex ?? -1;
  const callback = useRef(onRangeChange); callback.current = onRangeChange;
  useEffect(() => {
    callback.current?.({ startIndex: start, endIndex: end, visibleStartIndex: visibleStart, visibleEndIndex: visibleEnd });
  }, [start, end, visibleStart, visibleEnd]);
  return <div className={cn('relative min-w-0 rounded-md border border-border font-sans text-sm text-foreground', className)} data-slot="virtual-list">
    <div ref={probe} aria-hidden="true" className="pointer-events-none invisible absolute h-[var(--rui-row-height)] w-0" />
    {error ? <div className="grid gap-[var(--rui-content-gap-sm)] p-[var(--rui-content-padding)]"><p role="alert" className="text-destructive">{error}</p>{onRetry && <Button variant="outline" onClick={onRetry}>重试</Button>}</div>
      : !itemCount ? <p role="status" className="p-[var(--rui-content-padding)] text-muted-foreground">{loading ? '加载中…' : emptyMessage}</p>
        : <div ref={viewport} role="list" aria-label={label} aria-busy={loading} tabIndex={0} className={cn('h-80 overflow-auto outline-none focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring', viewportClassName)}
          onScroll={event => {
            const element = event.currentTarget;
            readingAnchor.current = captureViewportAnchor();
            wasAtEnd.current = element.scrollHeight - element.clientHeight - element.scrollTop <= 1;
          }}
          onFocusCapture={event => { const row = (event.target as HTMLElement).closest<HTMLElement>('[data-index]'); if (row) setFocusedKey(getItemKey(Number(row.dataset.index))); }}
          onBlurCapture={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setFocusedKey(null); }}
          onKeyDown={event => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); virtualizer.scrollToIndex(event.key === 'Home' ? 0 : itemCount - 1, { align: event.key === 'Home' ? 'start' : 'end' }); }
        }}>
          <div role="presentation" className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {rows.map(row => {
              const item = getItem(row.index);
              return <div key={row.key} ref={dynamic ? virtualizer.measureElement : undefined} role="listitem" aria-posinset={row.index + 1} aria-setsize={itemCount} data-index={row.index}
                className={cn('absolute top-0 left-0 flex w-full min-w-0 items-center border-b border-border px-[var(--rui-cell-padding-x)]', dynamic && 'min-h-[var(--rui-row-height)] py-[var(--rui-cell-padding-y)]')}
                style={{ height: dynamic ? undefined : row.size, transform: `translateY(${row.start}px)` }}>
                {item === undefined ? renderPlaceholder?.(row.index) ?? <span className="text-muted-foreground">加载第 {row.index + 1} 项…</span> : renderItem(item, row.index)}
              </div>;
            })}
          </div>
        </div>}
  </div>;
}
