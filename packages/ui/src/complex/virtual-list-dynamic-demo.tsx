import { useCallback, useRef, useState } from 'react';
import { VirtualList, type VirtualListHandle } from './virtual-list.js';
import { Button } from '../primitives/button.js';

interface DynamicItem { id: string; label: string; detailLines: number }
const initialItems = () => Array.from({ length: 160 }, (_, index) => ({ id: `record-${index + 1}`, label: `记录 ${index + 1}`, detailLines: 0 }));

/** Local proof surface for measured rows, key anchors and focus recovery. */
export function DynamicVirtualListDemo() {
  const list = useRef<VirtualListHandle>(null);
  const next = useRef(161);
  const [items, setItems] = useState<DynamicItem[]>(initialItems);
  const insertFirst = () => setItems(previous => [{ id: `record-new-${next.current}`, label: `新增记录 ${next.current++}`, detailLines: 0 }, ...previous]);
  const append = () => setItems(previous => [...previous, { id: `record-new-${next.current}`, label: `新增记录 ${next.current++}`, detailLines: 0 }]);
  const remove = (id: string) => setItems(previous => previous.filter(item => item.id !== id));
  const grow = (id: string) => setItems(previous => previous.map(item => item.id === id ? { ...item, detailLines: Math.min(4, item.detailLines + 1) } : item));
  const getItemKey = useCallback((index: number) => items[index]?.id ?? `missing-${index}`, [items]);
  return <div className="grid min-w-0 gap-[var(--rui-content-gap)]">
    <div className="flex flex-wrap gap-[var(--rui-content-gap-sm)]">
      <Button variant="outline" onClick={insertFirst}>在首项前插入</Button>
      <Button variant="outline" onClick={append}>追加末项</Button>
      <Button variant="outline" onClick={() => list.current?.scrollToIndex(Math.min(80, items.length - 1), 'start')}>定位记录 81</Button>
      <Button variant="outline" onClick={() => setItems(initialItems())}>恢复本地数据</Button>
    </div>
    <VirtualList<DynamicItem> ref={list} dynamic followOnAppend count={items.length} label="动态本地记录" getItem={index => items[index]} getItemKey={getItemKey}
      renderItem={item => <div className="grid min-w-0 gap-[var(--rui-content-gap-sm)]">
        <div className="flex min-w-0 flex-wrap items-center gap-[var(--rui-content-gap-sm)]">
          <Button size="xs" variant="ghost" aria-expanded={item.detailLines > 0} onClick={() => grow(item.id)}>追加内容{item.label}</Button>
          <span className="min-w-0 truncate">{item.label}</span>
          <Button size="xs" variant="ghost" onClick={() => remove(item.id)}>删除{item.label}</Button>
        </div>
        {item.detailLines > 0 && <div className="grid gap-1 text-muted-foreground">{Array.from({ length: item.detailLines }, (_, index) => <p key={index}>本地流式明细 {index + 1}：内容增长后保持当前阅读位置。</p>)}</div>}
      </div>} />
    <p role="status" className="text-xs text-muted-foreground">{items.length} 条本地记录；首项插入保持阅读锚点，末尾追加只在已到末尾时跟随。</p>
  </div>;
}
