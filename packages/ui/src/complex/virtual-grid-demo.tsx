import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../primitives/button.js';
import { VirtualGrid, type VirtualGridHandle, type VirtualGridRange } from './virtual-grid.js';

export interface VirtualGridDemoProps {
  rows?: number;
  columns?: number;
  overscanRows?: number;
  overscanColumns?: number;
  rowSize?: number;
  columnSize?: number;
  scenario?: 'ready' | 'loading' | 'empty' | 'error';
  viewportSize?: 'small' | 'default' | 'large';
}

export function VirtualGridDemo({ rows = 10000, columns = 1000, overscanRows = 2, overscanColumns = 1,
  rowSize = 0, columnSize = 0, scenario = 'ready', viewportSize = 'default' }: VirtualGridDemoProps) {
  const grid = useRef<VirtualGridHandle>(null);
  const [range, setRange] = useState<VirtualGridRange>();
  const [failed, setFailed] = useState(scenario === 'error');
  useEffect(() => setFailed(scenario === 'error'), [scenario]);
  const rowCount = scenario === 'empty' || scenario === 'loading' ? 0 : Math.max(0, Math.floor(rows));
  const columnCount = scenario === 'empty' || scenario === 'loading' ? 0 : Math.max(0, Math.floor(columns));
  const getRowKey = useCallback((index: number) => `row-${index}`, []);
  const getColumnKey = useCallback((index: number) => `column-${index}`, []);
  const getCellKey = useCallback((row: number, column: number) => `cell-${row}-${column}`, []);
  return <div className="grid min-w-0 gap-[var(--rui-content-gap)]">
    <div className="flex flex-wrap gap-[var(--rui-content-gap-sm)]">
      <Button variant="outline" disabled={!rowCount || !columnCount || failed} onClick={() => grid.current?.scrollToCell(0, 0, { row: 'start', column: 'start' })}>定位左上</Button>
      <Button variant="outline" disabled={!rowCount || !columnCount || failed} onClick={() => grid.current?.scrollToCell(Math.floor(rowCount / 2), Math.floor(columnCount / 2), { row: 'center', column: 'center' })}>定位中间</Button>
      <Button variant="outline" disabled={!rowCount || !columnCount || failed} onClick={() => grid.current?.scrollToCell(rowCount - 1, columnCount - 1, { row: 'end', column: 'end' })}>定位右下</Button>
    </div>
    <VirtualGrid ref={grid} label="本地二维数据" rowCount={rowCount} columnCount={columnCount} overscanRows={overscanRows} overscanColumns={overscanColumns}
      rowSize={rowSize || undefined} columnSize={columnSize || undefined} loading={scenario === 'loading'} error={failed ? '本地二维数据加载失败' : undefined} onRetry={() => setFailed(false)}
      viewportClassName={viewportSize === 'small' ? 'h-64' : viewportSize === 'large' ? 'h-96' : undefined}
      getRowKey={getRowKey} getColumnKey={getColumnKey} getCellKey={getCellKey} onRangeChange={setRange}
      renderCell={(row, column) => <span className="truncate" title={`行 ${row + 1}，列 ${column + 1}`}>R{row + 1} · C{column + 1}</span>} />
    <p role="status" className="text-xs text-muted-foreground">{rowCount} 行 × {columnCount} 列{range && rowCount && columnCount ? ` · 行 ${range.visibleRowStartIndex + 1}–${range.visibleRowEndIndex + 1} · 列 ${range.visibleColumnStartIndex + 1}–${range.visibleColumnEndIndex + 1}` : ''} · 本地示例</p>
  </div>;
}
