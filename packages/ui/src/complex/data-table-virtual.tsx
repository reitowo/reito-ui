import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface DataTableVirtualRange {
  startIndex: number;
  endIndex: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
  startRowId?: string;
  endRowId?: string;
  atStart: boolean;
  atEnd: boolean;
}

export interface DataTableVirtualRowsOptions {
  overscan?: number;
  estimateSize?: number;
  scrollToRowId?: string;
  onRangeChange?: (range: DataTableVirtualRange) => void;
  viewportHeight?: number | string;
}

export interface DataTableVirtualEntry {
  key: string;
  rowId?: string;
}

export function DataTableVirtualBody<TEntry extends DataTableVirtualEntry>({ entries, scrollElement, options, renderEntry }: {
  entries: TEntry[];
  scrollElement: HTMLDivElement | null;
  options: DataTableVirtualRowsOptions;
  renderEntry: (entry: TEntry, index: number, virtual: { ref: RefCallback<Element>; style: CSSProperties; ariaRowIndex: number }) => ReactNode;
}) {
  const [estimate, setEstimate] = useState(options.estimateSize ?? 36);
  const callback = useRef(options.onRangeChange); callback.current = options.onRangeChange;
  const virtualizer = useVirtualizer<HTMLDivElement, Element>({
    count: entries.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => Math.max(1, options.estimateSize ?? estimate),
    getItemKey: index => entries[index]?.key ?? index,
    overscan: Math.max(0, Math.floor(options.overscan ?? 6)),
  });
  useLayoutEffect(() => {
    if (options.estimateSize || !scrollElement) return;
    const update = () => {
      const probe = scrollElement.ownerDocument.createElement('div');
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;height:var(--rui-row-height);';
      scrollElement.appendChild(probe);
      const token = probe.getBoundingClientRect().height;
      probe.remove();
      if (Number.isFinite(token) && token > 0) setEstimate(current => current === token ? current : token);
    };
    update();
    const densityRoot = scrollElement.closest('[data-density]') ?? scrollElement.ownerDocument.documentElement;
    const observer = new MutationObserver(update);
    observer.observe(densityRoot, { attributes: true, attributeFilter: ['data-density'] });
    return () => observer.disconnect();
  }, [options.estimateSize, scrollElement]);
  const targetIndex = options.scrollToRowId ? entries.findIndex(entry => entry.rowId === options.scrollToRowId) : -1;
  useEffect(() => {
    if (targetIndex >= 0) virtualizer.scrollToIndex(targetIndex, { align: 'center' });
  }, [targetIndex, virtualizer]);
  const items = virtualizer.getVirtualItems();
  const startIndex = items[0]?.index ?? -1;
  const endIndex = items[items.length - 1]?.index ?? -1;
  const visibleStartIndex = virtualizer.range?.startIndex ?? -1;
  const visibleEndIndex = virtualizer.range?.endIndex ?? -1;
  const startRowId = entries[visibleStartIndex]?.rowId;
  const endRowId = entries[visibleEndIndex]?.rowId;
  useEffect(() => {
    callback.current?.({ startIndex, endIndex, visibleStartIndex, visibleEndIndex, startRowId, endRowId, atStart: visibleStartIndex <= 0, atEnd: visibleEndIndex >= entries.length - 1 });
  }, [endIndex, endRowId, entries.length, startIndex, startRowId, visibleEndIndex, visibleStartIndex]);
  return <tbody data-virtualized="true" className="relative grid" style={{ height: virtualizer.getTotalSize() }}>
    {items.map(item => renderEntry(entries[item.index], item.index, { ref: virtualizer.measureElement, style: { position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }, ariaRowIndex: item.index + 2 }))}
  </tbody>;
}
