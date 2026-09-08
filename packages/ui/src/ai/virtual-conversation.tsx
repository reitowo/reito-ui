import { useCallback, useRef, useState, type Key, type ReactNode } from 'react';
import { Button } from '../primitives/button.js';
import { VirtualList, type VirtualListHandle } from '../complex/virtual-list.js';
import { classes } from './shared.js';

export interface VirtualConversationProps<T> {
  items: readonly T[];
  getKey: (item: T) => Key;
  renderMessage: (item: T, index: number) => ReactNode;
  label?: string;
  follow?: boolean;
  overscan?: number;
  hasEarlier?: boolean;
  loadingEarlier?: boolean;
  historyError?: string;
  onLoadEarlier?: () => void | Promise<void>;
  emptyMessage?: string;
  className?: string;
  viewportClassName?: string;
}

/** Virtual message surface; history fetching and message/part updates remain host controlled. */
export function VirtualConversation<T>({ items, getKey, renderMessage, label = '虚拟对话', follow = true, overscan = 4, hasEarlier = false, loadingEarlier = false, historyError, onLoadEarlier, emptyMessage = '还没有消息', className, viewportClassName }: VirtualConversationProps<T>) {
  const list = useRef<VirtualListHandle>(null);
  const [atEnd, setAtEnd] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const busy = useRef(false);
  const getItem = useCallback((index: number) => items[index], [items]);
  const getItemKey = useCallback((index: number) => getKey(items[index]), [items, getKey]);
  async function load() {
    if (busy.current || loadingEarlier || !onLoadEarlier) return;
    busy.current = true; setRequesting(true); setLoadError('');
    try { await onLoadEarlier(); }
    catch (error) { setLoadError(error instanceof Error ? error.message : '历史加载失败'); }
    finally { busy.current = false; setRequesting(false); }
  }
  return <section aria-label={label} className={classes('relative grid min-w-0 gap-[var(--rui-content-gap-sm)]', className)}>
    {(hasEarlier || historyError || loadError) && <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="ghost" size="sm" disabled={loadingEarlier || requesting || !onLoadEarlier} onClick={() => { void load(); }}>{loadingEarlier || requesting ? '正在加载历史…' : historyError || loadError ? '重试加载历史' : '加载更早消息'}</Button>{(historyError || loadError) && <p role="alert" className="text-xs text-destructive">{historyError || loadError}</p>}</div>}
    <VirtualList className="border-0" rowClassName="items-start border-0 py-[var(--rui-content-gap-sm)]" ref={list} count={items.length} getItem={getItem} getItemKey={getItemKey} renderItem={renderMessage} dynamic preserveSelection initialPosition="end" followOnAppend={follow} onAtEndChange={setAtEnd} overscan={overscan} label={`${label}消息`} emptyMessage={emptyMessage} viewportClassName={viewportClassName} />
    {!atEnd && <Button type="button" variant="outline" size="sm" className="justify-self-center" onClick={() => { list.current?.scrollToEnd(); }}>回到最新</Button>}
  </section>;
}
