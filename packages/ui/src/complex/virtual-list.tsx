import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type Key, type ReactNode, type Ref } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
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
  ref?: Ref<VirtualListHandle>;
}

/** Fixed token-height rows. The host owns data fetching and a stable key for every index. */
export function VirtualList<T>({ count, getItem, getItemKey, renderItem, renderPlaceholder, onRangeChange, overscan = 4, label,
  loading = false, error, onRetry, emptyMessage = '暂无项目', className, viewportClassName, ref }: VirtualListProps<T>) {
  const viewport = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(0);
  const itemCount = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  useLayoutEffect(() => {
    const element = probe.current;
    if (!element) return;
    const update = () => setRowHeight(element.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update); observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: itemCount, getScrollElement: () => viewport.current,
    estimateSize: useCallback(() => rowHeight || 1, [rowHeight]),
    getItemKey, overscan: Math.max(0, Math.floor(Number.isFinite(overscan) ? overscan : 0)), enabled: rowHeight > 0 && !error,
  });
  useLayoutEffect(() => { virtualizer.measure(); }, [rowHeight, virtualizer]);
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
        : <div ref={viewport} role="list" aria-label={label} aria-busy={loading} tabIndex={0} className={cn('h-80 overflow-auto outline-none focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring', viewportClassName)} onKeyDown={event => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); virtualizer.scrollToIndex(event.key === 'Home' ? 0 : itemCount - 1, { align: event.key === 'Home' ? 'start' : 'end' }); }
        }}>
          <div role="presentation" className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {rows.map(row => {
              const item = getItem(row.index);
              return <div key={row.key} role="listitem" aria-posinset={row.index + 1} aria-setsize={itemCount} data-index={row.index}
                className="absolute top-0 left-0 flex w-full min-w-0 items-center border-b border-border px-[var(--rui-cell-padding-x)]"
                style={{ height: row.size, transform: `translateY(${row.start}px)` }}>
                {item === undefined ? renderPlaceholder?.(row.index) ?? <span className="text-muted-foreground">加载第 {row.index + 1} 项…</span> : renderItem(item, row.index)}
              </div>;
            })}
          </div>
        </div>}
  </div>;
}
