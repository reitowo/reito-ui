import { useCallback, useEffect, useRef, useState } from 'react';
import { VirtualList, type VirtualListHandle, type VirtualListRange } from './virtual-list.js';
import { Button } from '../primitives/button.js';

interface Item { id: number; name: string }
export interface VirtualListDemoProps { count?: number; overscan?: number; scenario?: 'ready' | 'loading' | 'empty' | 'error'; sparse?: boolean; viewportSize?: 'small' | 'default' | 'large' }
export function VirtualListDemo({ count = 10000, overscan = 4, scenario = 'ready', sparse = false, viewportSize = 'default' }: VirtualListDemoProps) {
  const list = useRef<VirtualListHandle>(null);
  const [range, setRange] = useState<VirtualListRange>();
  const [failed, setFailed] = useState(scenario === 'error');
  const [loaded, setLoaded] = useState(new Set<number>());
  useEffect(() => { setFailed(scenario === 'error'); }, [scenario]);
  useEffect(() => { setLoaded(new Set()); }, [count, sparse]);
  const total = scenario === 'empty' || scenario === 'loading' ? 0 : Math.max(0, Math.floor(count));
  const onRangeChange = useCallback((next: VirtualListRange) => {
    setRange(next);
  }, []);
  useEffect(() => {
    if (!sparse || !range || range.startIndex < 0) return;
    // A bounded local page fill demonstrates the host callback; this is not a network integration.
    const timer = setTimeout(() => setLoaded(previous => {
      const next = new Set(previous);
      for (let index = range.startIndex; index <= range.endIndex; index++) next.add(index);
      return next;
    }), 300);
    return () => clearTimeout(timer);
  }, [range, sparse, count]);
  return <div className="grid min-w-0 gap-[var(--rui-content-gap)]">
    <div className="flex flex-wrap gap-[var(--rui-content-gap-sm)]">
      <Button variant="outline" disabled={!total || failed} onClick={() => list.current?.scrollToIndex(0, 'start')}>回到首项</Button>
      <Button variant="outline" disabled={!total || failed} onClick={() => list.current?.scrollToIndex(Math.floor(total / 2), 'center')}>定位中间</Button>
      <Button variant="outline" disabled={!total || failed} onClick={() => list.current?.scrollToIndex(total - 1, 'end')}>定位末项</Button>
    </div>
    <VirtualList<Item> ref={list} count={total} overscan={overscan} viewportClassName={viewportSize === 'small' ? 'h-64' : viewportSize === 'large' ? 'h-96' : undefined} label="本地虚拟项目" loading={scenario === 'loading'} error={failed ? '本地加载失败' : undefined} onRetry={() => setFailed(false)}
      getItemKey={useCallback(index => `item-${index}`, [])}
      getItem={index => sparse && !loaded.has(index) ? undefined : { id: index, name: `项目 ${index + 1}` }}
      renderItem={item => <span className="truncate">{item.name}</span>} onRangeChange={onRangeChange} />
    <p role="status" className="text-xs text-muted-foreground">共 {total} 项{range && total > 0 && !failed ? ` · 渲染 ${range.startIndex + 1}–${range.endIndex + 1} · 可见 ${range.visibleStartIndex + 1}–${range.visibleEndIndex + 1}` : ''} · 本地示例</p>
  </div>;
}
