import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, Pause, Search, Trash2 } from 'lucide-react';
import { Badge } from '../primitives/badge.js';
import { Button } from '../primitives/button.js';
import { Input } from '../primitives/input.js';
import { cx } from './shared.js';

export type LogLevel = 'debug' | 'info' | 'warning' | 'error';
export interface LogEntry { id: string; level: LogLevel; message: string; time?: string; source?: string; }
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
  onClear?: () => void;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const allLevels: LogLevel[] = ['debug', 'info', 'warning', 'error'];
const levelNames: Record<LogLevel, string> = { debug: '调试', info: '信息', warning: '警告', error: '错误' };

/** Displays caller-owned logs. No shell input, execution, transport, or terminal emulation. */
export function LogViewer({
  entries, label = '日志', query, onQueryChange, levels, onLevelsChange,
  follow, defaultFollow = true, onFollowChange, onClear, loading = false, error, disabled = false, className,
}: LogViewerProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const [internalLevels, setInternalLevels] = useState<LogLevel[]>(allLevels);
  const [internalFollow, setInternalFollow] = useState(defaultFollow);
  const viewport = useRef<HTMLDivElement>(null);
  const search = query ?? internalQuery;
  const selectedLevels = levels ?? internalLevels;
  const following = follow ?? internalFollow;
  const filtered = useMemo(() => entries.filter(entry => selectedLevels.includes(entry.level)
    && `${entry.message} ${entry.source ?? ''}`.toLowerCase().includes(search.toLowerCase())), [entries, selectedLevels, search]);

  function changeFollow(next: boolean) {
    if (follow === undefined) setInternalFollow(next);
    onFollowChange?.(next);
    if (next && viewport.current) viewport.current.scrollTop = viewport.current.scrollHeight;
  }

  useEffect(() => {
    if (following && viewport.current) viewport.current.scrollTop = viewport.current.scrollHeight;
  }, [filtered, following]);

  function changeQuery(next: string) {
    if (query === undefined) setInternalQuery(next);
    onQueryChange?.(next);
  }

  function toggleLevel(level: LogLevel) {
    const next = selectedLevels.includes(level) ? selectedLevels.filter(value => value !== level) : [...selectedLevels, level];
    if (levels === undefined) setInternalLevels(next);
    onLevelsChange?.(next);
  }

  return <section aria-label={label} aria-busy={loading} className={cx('min-w-0 space-y-[var(--rui-content-gap)] font-sans text-sm text-foreground', className)}>
    <div className="flex flex-wrap items-center gap-[var(--rui-content-gap-sm)]">
      <div className="relative min-w-40 flex-1">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label={`搜索${label}`} value={search} placeholder="搜索日志或来源…" disabled={disabled} className="pl-9" onChange={event => changeQuery(event.target.value)} />
      </div>
      <Button variant="ghost" size="sm" aria-pressed={following} disabled={disabled} onClick={() => changeFollow(!following)}>
        {following ? <Pause aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}{following ? '暂停跟随' : '恢复跟随'}
      </Button>
      {onClear && <Button variant="ghost" size="sm" disabled={disabled || !entries.length} onClick={onClear}><Trash2 aria-hidden="true" />清除日志</Button>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-[var(--rui-content-gap-sm)]">
      <div role="group" aria-label="日志级别" className="flex flex-wrap gap-1">
        {allLevels.map(level => <Button key={level} size="sm" variant={selectedLevels.includes(level) ? 'secondary' : 'ghost'} aria-pressed={selectedLevels.includes(level)} disabled={disabled} onClick={() => toggleLevel(level)}>{levelNames[level]}</Button>)}
      </div>
      <p role="status" className="text-xs text-muted-foreground">显示 {filtered.length} / {entries.length} 条 · {following ? '跟随最新' : '跟随已暂停'}</p>
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div ref={viewport} role="region" aria-label={`${label}内容`} tabIndex={0}
      className="h-64 overflow-auto rounded-lg border border-border focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:-outline-offset-[var(--rui-outline-width)] focus-visible:outline-ring"
      onScroll={event => {
        const element = event.currentTarget;
        if (following && element.scrollHeight - element.clientHeight - element.scrollTop > 24) changeFollow(false);
      }}>
      {loading ? <p className="p-[var(--rui-content-padding)] text-muted-foreground">正在加载日志…</p>
        : filtered.length ? <ol className="divide-y divide-border">
          {filtered.map(entry => <li key={entry.id} className="flex min-w-0 items-start gap-[var(--rui-content-gap-sm)] px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]">
            {entry.time && <span className="shrink-0 pt-0.5 font-mono text-xs text-muted-foreground">{entry.time}</span>}
            <Badge variant={entry.level === 'error' ? 'destructive' : 'outline'}>{levelNames[entry.level]}</Badge>
            <div className="min-w-0 flex-1 font-mono text-xs leading-relaxed">
              {entry.source && <span className="mr-2 text-muted-foreground">[{entry.source}]</span>}
              <span className="whitespace-pre-wrap break-all">{entry.message}</span>
            </div>
          </li>)}
        </ol> : <p className="p-[var(--rui-content-padding)] text-muted-foreground">{entries.length ? '没有符合筛选条件的日志' : '还没有日志记录'}</p>}
    </div>
  </section>;
}
