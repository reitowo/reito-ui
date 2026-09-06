import { useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, type Key, type ReactNode, type Ref } from 'react';
import { defaultRangeExtractor, useVirtualizer, type Range } from '@tanstack/react-virtual';
import { Button } from '../primitives/button.js';
import { cn } from '../lib/utils.js';

type GridAlign = 'start' | 'center' | 'end' | 'auto';
export interface VirtualGridRange {
  rowStartIndex: number; rowEndIndex: number; visibleRowStartIndex: number; visibleRowEndIndex: number;
  columnStartIndex: number; columnEndIndex: number; visibleColumnStartIndex: number; visibleColumnEndIndex: number;
}
export interface VirtualGridHandle { scrollToCell: (rowIndex: number, columnIndex: number, align?: { row?: GridAlign; column?: GridAlign }) => void }
export interface VirtualGridProps {
  rowCount: number;
  columnCount: number;
  getRowKey: (rowIndex: number) => Key;
  getColumnKey: (columnIndex: number) => Key;
  getCellKey: (rowIndex: number, columnIndex: number) => Key;
  renderCell: (rowIndex: number, columnIndex: number) => ReactNode;
  onRangeChange?: (range: VirtualGridRange) => void;
  overscanRows?: number;
  overscanColumns?: number;
  rowSize?: number;
  columnSize?: number;
  label: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  className?: string;
  viewportClassName?: string;
  ref?: Ref<VirtualGridHandle>;
}

const boundedCount = (value: number) => Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
const boundedOverscan = (value: number) => Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
const explicitSize = (value: number | undefined) => value !== undefined && Number.isFinite(value) && value > 0 ? value : undefined;

/** Two-axis fixed-size window. The host owns data loading and stable row, column and cell identities. */
export function VirtualGrid({ rowCount, columnCount, getRowKey, getColumnKey, getCellKey, renderCell, onRangeChange,
  overscanRows = 2, overscanColumns = 1, rowSize, columnSize, label, loading = false, error, onRetry,
  emptyMessage = '暂无单元格', className, viewportClassName, ref }: VirtualGridProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const [tokenSize, setTokenSize] = useState({ row: 0, column: 0 });
  const rowsTotal = boundedCount(rowCount);
  const columnsTotal = boundedCount(columnCount);
  const resolvedRowSize = explicitSize(rowSize) ?? tokenSize.row;
  const resolvedColumnSize = explicitSize(columnSize) ?? tokenSize.column;
  const [active, setActive] = useState({ row: 0, column: 0 });
  const gridId = useId();
  const domIds = useRef(new Map<Key, string>());
  const domSerial = useRef(0);
  const cellDomId = useCallback((key: Key) => {
    const existing = domIds.current.get(key);
    if (existing) return existing;
    const id = `${gridId}-cell-${++domSerial.current}`;
    domIds.current.set(key, id);
    return id;
  }, [gridId]);
  const includeActive = useCallback((index: number, count: number) => (range: Range) => {
    const indexes = defaultRangeExtractor(range);
    return index >= 0 && index < count && !indexes.includes(index) ? [...indexes, index].sort((a, b) => a - b) : indexes;
  }, []);
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: rowsTotal, getScrollElement: () => viewport.current, estimateSize: useCallback(() => resolvedRowSize || 1, [resolvedRowSize]),
    getItemKey: getRowKey, overscan: boundedOverscan(overscanRows), enabled: resolvedRowSize > 0 && !error,
    rangeExtractor: useCallback(includeActive(active.row, rowsTotal), [active.row, includeActive, rowsTotal]),
  });
  const columnVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    horizontal: true, count: columnsTotal, getScrollElement: () => viewport.current, estimateSize: useCallback(() => resolvedColumnSize || 1, [resolvedColumnSize]),
    getItemKey: getColumnKey, overscan: boundedOverscan(overscanColumns), enabled: resolvedColumnSize > 0 && !error,
    rangeExtractor: useCallback(includeActive(active.column, columnsTotal), [active.column, columnsTotal, includeActive]),
  });
  useLayoutEffect(() => {
    const element = probe.current;
    if (!element) return;
    const update = () => setTokenSize({ row: element.getBoundingClientRect().height, column: element.getBoundingClientRect().width });
    update();
    const observer = new ResizeObserver(update); observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => { rowVirtualizer.measure(); }, [resolvedRowSize, rowVirtualizer]);
  useLayoutEffect(() => { columnVirtualizer.measure(); }, [columnVirtualizer, resolvedColumnSize]);
  useEffect(() => {
    if (!rowsTotal || !columnsTotal) return;
    setActive(current => ({ row: Math.min(current.row, rowsTotal - 1), column: Math.min(current.column, columnsTotal - 1) }));
  }, [columnsTotal, rowsTotal]);
  useImperativeHandle(ref, () => ({ scrollToCell: (rowIndex, columnIndex, align = {}) => {
    if (!rowsTotal || !columnsTotal || !Number.isFinite(rowIndex) || !Number.isFinite(columnIndex)) return;
    const next = { row: Math.min(rowsTotal - 1, Math.max(0, Math.floor(rowIndex))), column: Math.min(columnsTotal - 1, Math.max(0, Math.floor(columnIndex))) };
    setActive(next);
    rowVirtualizer.scrollToIndex(next.row, { align: align.row ?? 'auto' });
    columnVirtualizer.scrollToIndex(next.column, { align: align.column ?? 'auto' });
  } }), [columnVirtualizer, columnsTotal, rowVirtualizer, rowsTotal]);
  const rows = rowVirtualizer.getVirtualItems();
  const columns = columnVirtualizer.getVirtualItems();
  const callback = useRef(onRangeChange); callback.current = onRangeChange;
  const range: VirtualGridRange = {
    rowStartIndex: rows[0]?.index ?? -1, rowEndIndex: rows.at(-1)?.index ?? -1,
    visibleRowStartIndex: rowVirtualizer.range?.startIndex ?? -1, visibleRowEndIndex: rowVirtualizer.range?.endIndex ?? -1,
    columnStartIndex: columns[0]?.index ?? -1, columnEndIndex: columns.at(-1)?.index ?? -1,
    visibleColumnStartIndex: columnVirtualizer.range?.startIndex ?? -1, visibleColumnEndIndex: columnVirtualizer.range?.endIndex ?? -1,
  };
  useEffect(() => { callback.current?.(range); }, [range.rowStartIndex, range.rowEndIndex, range.visibleRowStartIndex, range.visibleRowEndIndex, range.columnStartIndex, range.columnEndIndex, range.visibleColumnStartIndex, range.visibleColumnEndIndex]);
  const activeKey = rowsTotal && columnsTotal ? getCellKey(active.row, active.column) : null;
  const move = (row: number, column: number) => {
    const next = { row: Math.min(rowsTotal - 1, Math.max(0, row)), column: Math.min(columnsTotal - 1, Math.max(0, column)) };
    setActive(next); rowVirtualizer.scrollToIndex(next.row, { align: 'auto' }); columnVirtualizer.scrollToIndex(next.column, { align: 'auto' });
  };
  return <div className={cn('relative min-w-0 rounded-md border border-border font-sans text-sm text-foreground', className)} data-slot="virtual-grid">
    <div ref={probe} aria-hidden="true" className="pointer-events-none invisible absolute h-[var(--rui-row-height)] w-[var(--rui-virtual-column-width)]" />
    {error ? <div className="grid gap-[var(--rui-content-gap-sm)] p-[var(--rui-content-padding)]"><p role="alert" className="text-destructive">{error}</p>{onRetry && <Button variant="outline" onClick={onRetry}>重试</Button>}</div>
      : !rowsTotal || !columnsTotal ? <p role="status" className="p-[var(--rui-content-padding)] text-muted-foreground">{loading ? '加载中…' : emptyMessage}</p>
        : <div ref={viewport} role="grid" aria-label={label} aria-busy={loading} aria-rowcount={rowsTotal} aria-colcount={columnsTotal}
          aria-activedescendant={activeKey === null ? undefined : cellDomId(activeKey)} tabIndex={0}
          className={cn('h-80 overflow-auto outline-none focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring', viewportClassName)}
          onKeyDown={event => {
            if (event.target !== event.currentTarget) return;
            const keys: Record<string, [number, number]> = { ArrowUp: [active.row - 1, active.column], ArrowDown: [active.row + 1, active.column], ArrowLeft: [active.row, active.column - 1], ArrowRight: [active.row, active.column + 1], Home: [0, 0], End: [rowsTotal - 1, columnsTotal - 1] };
            const next = keys[event.key]; if (!next) return; event.preventDefault(); move(...next);
          }}>
          <div role="presentation" className="relative" style={{ height: rowVirtualizer.getTotalSize(), width: columnVirtualizer.getTotalSize() }}>
            {rows.map(row => <div key={row.key} role="row" aria-rowindex={row.index + 1} data-row-index={row.index}
              className="absolute top-0 left-0" style={{ height: row.size, width: columnVirtualizer.getTotalSize(), transform: `translateY(${row.start}px)` }}>
              {columns.map(column => {
                const key = getCellKey(row.index, column.index);
                const selected = row.index === active.row && column.index === active.column;
                return <div key={key} id={cellDomId(key)} role="gridcell" aria-colindex={column.index + 1}
                  data-cell-key={String(key)} data-row-key={String(row.key)} data-column-key={String(column.key)}
                  className="absolute top-0 left-0 flex min-w-0 items-center overflow-hidden border-r border-b border-border px-[var(--rui-cell-padding-x)] data-[active=true]:bg-muted/60"
                  data-active={selected || undefined} style={{ height: row.size, width: column.size, transform: `translateX(${column.start}px)` }}
                  onMouseDown={() => setActive({ row: row.index, column: column.index })}>{renderCell(row.index, column.index)}</div>;
              })}
            </div>)}
          </div>
        </div>}
  </div>;
}
