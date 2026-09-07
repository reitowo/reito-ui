import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react';
import { ArrowDown, Pause, Search, Settings2, Trash2 } from 'lucide-react';
import { Button } from '../primitives/button.js';
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuLabel, DropdownMenuTrigger,
} from '../primitives/dropdown-menu.js';
import { Input } from '../primitives/input.js';
import { VirtualList, type VirtualListHandle, type VirtualListRange } from './virtual-list.js';
import { cx } from './shared.js';

export type LogLevel = 'debug' | 'info' | 'warning' | 'error';
export interface LogEntry { id: string; level: LogLevel; message: string; time?: string; source?: string; }
export interface LogViewerViewPreferences {
  wrapLines: boolean;
  showTimestamp: boolean;
  showLevel: boolean;
  showSource: boolean;
}
export interface LogViewerProps {
  entries: LogEntry[];
  label?: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  levels?: LogLevel[];
  onLevelsChange?: (levels: LogLevel[]) => void;
  follow?: boolean;
  defaultFollow?: boolean;
  onFollowChange?: (follow: boolean) => void;
  viewPreferences?: Partial<LogViewerViewPreferences>;
  defaultViewPreferences?: Partial<LogViewerViewPreferences>;
  onViewPreferencesChange?: (preferences: LogViewerViewPreferences) => void;
  virtualized?: boolean;
  overscan?: number;
  viewportClassName?: string;
  onVisibleRangeChange?: (range: VirtualListRange) => void;
  totalCount?: number;
  hasOlder?: boolean;
  loadingOlder?: boolean;
  loadOlderError?: string;
  onLoadOlder?: () => void;
  onClear?: () => void;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

const allLevels: LogLevel[] = ['debug', 'info', 'warning', 'error'];
const levelNames: Record<LogLevel, string> = { debug: '调试', info: '信息', warning: '警告', error: '错误' };
const levelTone: Record<LogLevel, string> = { debug: 'text-muted-foreground', info: 'text-foreground', warning: 'text-warning', error: 'text-destructive' };
const defaultPreferences: LogViewerViewPreferences = { wrapLines: true, showTimestamp: true, showLevel: true, showSource: true };

interface LogRowProps { entry: LogEntry; preferences: LogViewerViewPreferences; }
function LogRow({ entry, preferences }: LogRowProps) {
  return <div data-log-id={entry.id} className={cx('flex min-w-full items-start gap-[var(--rui-content-gap-sm)] font-mono text-xs', preferences.wrapLines ? 'w-full' : 'w-max')}>
    {preferences.showTimestamp && <span className="shrink-0 text-muted-foreground">{entry.time || '—'}</span>}
    {preferences.showLevel && <span className={cx('w-10 shrink-0 font-medium', levelTone[entry.level])}>{levelNames[entry.level]}</span>}
    <p className={cx('min-w-0 flex-1', preferences.wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre')}>
      {preferences.showSource && entry.source && <span className="mr-2 text-muted-foreground">[{entry.source}]</span>}
      <span>{entry.message}</span>
    </p>
  </div>;
}

/** Displays caller-owned logs. It does not execute commands, fetch logs, or persist view preferences. */
export function LogViewer({
  entries, label = '日志', query, onQueryChange, levels, onLevelsChange,
  follow, defaultFollow = true, onFollowChange, viewPreferences, defaultViewPreferences, onViewPreferencesChange,
  virtualized = true, overscan = 6, viewportClassName = 'h-64', onVisibleRangeChange,
  totalCount, hasOlder = false, loadingOlder = false, loadOlderError, onLoadOlder,
  onClear, loading = false, error, emptyMessage = '还没有日志记录', disabled = false, className,
}: LogViewerProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const [internalLevels, setInternalLevels] = useState<LogLevel[]>(allLevels);
  const [internalFollow, setInternalFollow] = useState(defaultFollow);
  const [internalPreferences, setInternalPreferences] = useState<LogViewerViewPreferences>(() => ({ ...defaultPreferences, ...defaultViewPreferences }));
  const virtualHandle = useRef<VirtualListHandle>(null);
  const plainViewport = useRef<HTMLDivElement>(null);
  const pointerScrollIntent = useRef(false);
  const search = query ?? internalQuery;
  const selectedLevels = levels ?? internalLevels;
  const following = follow ?? internalFollow;
  const preferences = { ...internalPreferences, ...viewPreferences };
  const filtered = useMemo(() => {
    const normalizedQuery = search.trim().toLocaleLowerCase();
    return entries.filter(entry => selectedLevels.includes(entry.level)
      && `${entry.message} ${entry.source ?? ''} ${entry.time ?? ''}`.toLocaleLowerCase().includes(normalizedQuery));
  }, [entries, selectedLevels, search]);
  const normalizedTotal = Math.max(entries.length, Math.floor(Number.isFinite(totalCount) ? Number(totalCount) : entries.length));
  const locked = disabled || loading;
  const previousFilteredCount = useRef(filtered.length);

  function changeFollow(next: boolean) {
    if (follow === undefined) setInternalFollow(next);
    onFollowChange?.(next);
  }

  function scrollToLatest() {
    if (virtualized) virtualHandle.current?.scrollToEnd();
    else if (plainViewport.current) plainViewport.current.scrollTop = plainViewport.current.scrollHeight;
  }

  useEffect(() => {
    const countChanged = previousFilteredCount.current !== filtered.length;
    previousFilteredCount.current = filtered.length;
    if (!following || !filtered.length || (!countChanged && virtualized)) return;
    const timeout = window.setTimeout(scrollToLatest, 0);
    return () => window.clearTimeout(timeout);
  }, [filtered.length, following, preferences.showLevel, preferences.showSource, preferences.showTimestamp, preferences.wrapLines, virtualized]);

  function changeQuery(next: string) {
    if (query === undefined) setInternalQuery(next);
    onQueryChange?.(next);
  }

  function toggleLevel(level: LogLevel) {
    const next = selectedLevels.includes(level) ? selectedLevels.filter(value => value !== level) : [...selectedLevels, level];
    if (levels === undefined) setInternalLevels(next);
    onLevelsChange?.(next);
  }

  function changePreference(key: keyof LogViewerViewPreferences, value: boolean) {
    const next = { ...preferences, [key]: value };
    setInternalPreferences(next);
    onViewPreferencesChange?.(next);
  }

  function handleScrollCapture(event: UIEvent<HTMLElement>) {
    if (!following || !pointerScrollIntent.current) return;
    const element = event.target;
    if (!(element instanceof HTMLElement) || element.scrollHeight <= element.clientHeight) return;
    if (element.scrollHeight - element.clientHeight - element.scrollTop > 2) changeFollow(false);
  }

  const row = (entry: LogEntry) => <LogRow entry={entry} preferences={preferences} />;

  return <section aria-label={label} aria-busy={loading || loadingOlder} data-slot="log-viewer" className={cx('min-w-0 space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <div className="flex flex-wrap items-center gap-[var(--rui-content-gap-sm)]">
      <div className="relative min-w-40 flex-1">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label={`搜索${label}`} value={search} placeholder="搜索日志、来源或时间…" disabled={locked} className="pl-9" onChange={event => changeQuery(event.target.value)} />
      </div>
      <Button variant="ghost" size="sm" aria-pressed={following} disabled={locked} onClick={() => {
        const next = !following;
        changeFollow(next);
        if (next) requestAnimationFrame(scrollToLatest);
      }}>
        {following ? <Pause aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}{following ? '暂停跟随' : '恢复跟随'}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="sm" disabled={locked} />}><Settings2 aria-hidden="true" />视图</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>日志视图</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={preferences.wrapLines} onCheckedChange={checked => changePreference('wrapLines', checked)}>自动换行</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={preferences.showTimestamp} onCheckedChange={checked => changePreference('showTimestamp', checked)}>显示时间</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={preferences.showLevel} onCheckedChange={checked => changePreference('showLevel', checked)}>显示级别</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={preferences.showSource} onCheckedChange={checked => changePreference('showSource', checked)}>显示来源</DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {onClear && <Button variant="ghost" size="sm" disabled={locked || !entries.length} onClick={onClear}><Trash2 aria-hidden="true" />清除</Button>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)]">
      <div role="group" aria-label="日志级别" className="flex flex-wrap gap-1">
        {allLevels.map(level => <Button key={level} size="sm" variant={selectedLevels.includes(level) ? 'secondary' : 'ghost'} aria-pressed={selectedLevels.includes(level)} disabled={locked} onClick={() => toggleLevel(level)}>{levelNames[level]}</Button>)}
      </div>
      <p role="status" className="text-xs text-muted-foreground">{search || selectedLevels.length !== allLevels.length ? `显示 ${filtered.length} / 已加载 ${entries.length}` : `已加载 ${entries.length}`}{normalizedTotal !== entries.length && ` / 共 ${normalizedTotal}`} · {following ? '跟随最新' : '跟随已暂停'}</p>
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {(hasOlder || loadingOlder || loadOlderError) && <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)] border-b border-border pb-[var(--rui-content-gap-sm)]">
      <p role={loadOlderError ? 'alert' : 'status'} className={loadOlderError ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>{loadOlderError ?? (loadingOlder ? '正在加载更早日志…' : `还有 ${Math.max(0, normalizedTotal - entries.length)} 条更早日志`)}</p>
      {(hasOlder || loadOlderError) && <Button size="sm" variant="outline" disabled={locked || loadingOlder || !onLoadOlder} onClick={onLoadOlder}>{loadOlderError ? '重试加载' : '加载更早日志'}</Button>}
    </div>}
    <div onScrollCapture={handleScrollCapture}
      onWheelCapture={event => { if (following && event.deltaY < 0) changeFollow(false); }}
      onTouchMoveCapture={() => { if (following) changeFollow(false); }}
      onKeyDownCapture={event => { if (following && ['ArrowUp', 'PageUp', 'Home'].includes(event.key)) changeFollow(false); }}
      onPointerDownCapture={() => { pointerScrollIntent.current = true; }}
      onPointerUpCapture={() => { pointerScrollIntent.current = false; }}>
      {loading && !entries.length ? <p className="rounded-md border border-border p-[var(--rui-content-padding)] text-muted-foreground">正在加载日志…</p>
        : !filtered.length ? <p className="rounded-md border border-border p-[var(--rui-content-padding)] text-muted-foreground">{entries.length ? '没有符合筛选条件的日志' : emptyMessage}</p>
          : virtualized ? <VirtualList ref={virtualHandle} count={filtered.length} getItem={index => filtered[index]} getItemKey={index => filtered[index]?.id ?? index}
            renderItem={row} label={`${label}内容`} overscan={overscan} dynamic initialPosition={following ? 'end' : 'start'} viewportClassName={cx('overflow-x-auto', viewportClassName)} onRangeChange={onVisibleRangeChange} />
            : <div ref={plainViewport} role="region" aria-label={`${label}内容`} tabIndex={0} className={cx('overflow-auto rounded-md border border-border outline-none focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring', viewportClassName)}>
              <ol className="divide-y divide-border">{filtered.map(entry => <li key={entry.id} className="flex min-w-0 items-start px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]">{row(entry)}</li>)}</ol>
            </div>}
    </div>
  </section>;
}
