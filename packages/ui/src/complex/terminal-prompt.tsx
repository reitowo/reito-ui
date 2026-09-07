import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type UIEvent } from 'react';
import { ArrowDown, CircleAlert, CornerDownLeft, LoaderCircle, Square, Trash2 } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Input } from '../primitives/input.js';
import { cx } from './shared.js';

export type TerminalPromptEntryStatus = 'running' | 'success' | 'error' | 'cancelled';

export interface TerminalPromptEntry {
  id: string;
  command: string;
  output?: ReactNode;
  status?: TerminalPromptEntryStatus;
  prompt?: string;
  time?: string;
}

export interface TerminalPromptProps {
  entries: TerminalPromptEntry[];
  onSubmit: (command: string) => void | Promise<void>;
  history?: string[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  running?: boolean;
  onCancel?: () => void | Promise<void>;
  onClear?: () => void;
  follow?: boolean;
  defaultFollow?: boolean;
  onFollowChange?: (follow: boolean) => void;
  welcome?: ReactNode;
  label?: string;
  outputLabel?: string;
  prompt?: string;
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  emptyMessage?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  name?: string;
  viewportClassName?: string;
  className?: string;
}

const statusLabels: Record<TerminalPromptEntryStatus, string> = {
  running: '运行中',
  success: '已完成',
  error: '失败',
  cancelled: '已取消',
};

/** Host-driven command history and response surface. It never executes commands or opens a PTY. */
export function TerminalPrompt({
  entries,
  onSubmit,
  history,
  value,
  defaultValue = '',
  onValueChange,
  running = false,
  onCancel,
  onClear,
  follow,
  defaultFollow = true,
  onFollowChange,
  welcome = '命令由当前应用处理；此组件不会直接执行 shell 或连接 PTY。',
  label = '命令输入',
  outputLabel = '命令记录',
  prompt = '$',
  placeholder = '输入命令…',
  submitLabel = '提交命令',
  cancelLabel = '取消当前命令',
  emptyMessage = '还没有命令记录',
  error,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  name,
  viewportClassName = 'h-[var(--rui-terminal-height)]',
  className,
}: TerminalPromptProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalFollow, setInternalFollow] = useState(defaultFollow);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [operationError, setOperationError] = useState<ReactNode>();
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const text = value === undefined ? internalValue : value;
  const following = follow === undefined ? internalFollow : follow;
  const availableHistory = useMemo(() => (history ?? entries.map(entry => entry.command)).filter(command => command.trim()), [entries, history]);
  const currentText = useRef(text);
  const draftBeforeHistory = useRef(text);
  const inFlight = useRef(false);
  const cancelInFlight = useRef(false);
  const composing = useRef(false);
  const viewport = useRef<HTMLDivElement>(null);
  const previousEntries = useRef(-1);
  const inputId = useId();
  const errorId = useId();
  const visibleError = error ?? operationError;
  const inputDisabled = disabled || submitting;

  currentText.current = text;

  function publish(next: string, resetHistory = true) {
    if (value === undefined) setInternalValue(next);
    currentText.current = next;
    onValueChange?.(next);
    if (resetHistory) {
      setHistoryIndex(null);
      draftBeforeHistory.current = next;
    }
    if (operationError) setOperationError(undefined);
  }

  function changeFollow(next: boolean) {
    if (follow === undefined) setInternalFollow(next);
    onFollowChange?.(next);
  }

  function scrollToLatest() {
    const element = viewport.current;
    if (element) element.scrollTop = element.scrollHeight;
  }

  useEffect(() => {
    const appended = entries.length !== previousEntries.current;
    previousEntries.current = entries.length;
    if (!following || (!appended && !running)) return;
    const frame = requestAnimationFrame(scrollToLatest);
    return () => cancelAnimationFrame(frame);
  }, [entries.length, following, running]);

  useEffect(() => {
    if (historyIndex !== null && historyIndex >= availableHistory.length) setHistoryIndex(null);
  }, [availableHistory.length, historyIndex]);

  async function submit() {
    const command = currentText.current.trim();
    if (!command || disabled || readOnly || running || inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setOperationError(undefined);
    try {
      await onSubmit(command);
      if (currentText.current.trim() === command) publish('');
    } catch (reason) {
      setOperationError(reason instanceof Error ? reason.message : '命令提交失败，输入已保留。');
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  async function cancel() {
    if (!onCancel || disabled || !running || cancelInFlight.current) return;
    cancelInFlight.current = true;
    setCancelling(true);
    setOperationError(undefined);
    try {
      await onCancel();
    } catch (reason) {
      setOperationError(reason instanceof Error ? reason.message : '取消请求失败，请重试。');
    } finally {
      cancelInFlight.current = false;
      setCancelling(false);
    }
  }

  function navigateHistory(direction: -1 | 1) {
    if (!availableHistory.length) return;
    if (historyIndex === null) {
      if (direction > 0) return;
      draftBeforeHistory.current = currentText.current;
      const nextIndex = availableHistory.length - 1;
      setHistoryIndex(nextIndex);
      publish(availableHistory[nextIndex]!, false);
      return;
    }
    const nextIndex = historyIndex + direction;
    if (nextIndex < 0) {
      setHistoryIndex(0);
      return;
    }
    if (nextIndex >= availableHistory.length) {
      setHistoryIndex(null);
      publish(draftBeforeHistory.current, false);
      return;
    }
    setHistoryIndex(nextIndex);
    publish(availableHistory[nextIndex]!, false);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const ime = composing.current || event.nativeEvent.isComposing || event.keyCode === 229;
    if (ime) {
      if (event.key === 'Enter') event.preventDefault();
      return;
    }
    if (running) {
      if (event.key === 'Escape' && onCancel) {
        event.preventDefault();
        void cancel();
      }
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      void submit();
    } else if (!event.altKey && !event.ctrlKey && !event.metaKey && event.key === 'ArrowUp') {
      event.preventDefault();
      navigateHistory(-1);
    } else if (!event.altKey && !event.ctrlKey && !event.metaKey && event.key === 'ArrowDown') {
      event.preventDefault();
      navigateHistory(1);
    }
  }

  function onOutputScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const atEnd = element.scrollHeight - element.clientHeight - element.scrollTop <= 2;
    if (atEnd !== following) changeFollow(atEnd);
  }

  return <section data-slot="terminal-prompt" aria-label={`${label}终端`} aria-busy={submitting || running || cancelling} className={cx('min-w-0 overflow-hidden rounded-lg border border-border bg-card font-sans text-foreground', className)}>
    <div className="flex h-[var(--rui-control-height-sm)] items-center gap-[var(--rui-space-1)] border-b border-border px-[var(--rui-cell-padding-x)]">
      <h3 className="min-w-0 flex-1 truncate text-xs font-medium">{outputLabel}</h3>
      {!following && entries.length > 0 && <Button type="button" variant="ghost" size="xs" disabled={disabled} onClick={() => { changeFollow(true); requestAnimationFrame(scrollToLatest); }}><ArrowDown aria-hidden="true" />回到最新</Button>}
      {onClear && <Button type="button" variant="ghost" size="icon-xs" aria-label="清除命令记录" title="清除命令记录" disabled={disabled || running || submitting || entries.length === 0} onClick={onClear}><Trash2 aria-hidden="true" /></Button>}
    </div>
    <div ref={viewport} role="region" aria-label={outputLabel} tabIndex={0} onScroll={onOutputScroll} className={cx('min-w-0 overflow-auto bg-background outline-none focus-visible:ring-inset focus-visible:ring-[length:var(--rui-outline-width)] focus-visible:ring-ring/50', viewportClassName)}>
      {welcome && <div className="border-b border-border px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-xs leading-relaxed text-muted-foreground">{welcome}</div>}
      {entries.length > 0 ? <div role="log" aria-live="polite" aria-relevant="additions text"><ol className="divide-y divide-border">
        {entries.map(entry => {
          const status = entry.status ?? 'success';
          return <li key={entry.id} data-terminal-id={entry.id} data-status={status} aria-busy={status === 'running' || undefined} className="min-w-0 px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] font-mono text-xs">
            <div className="flex min-w-0 items-start gap-[var(--rui-space-2)]">
              <span aria-hidden="true" className="shrink-0 text-muted-foreground">{entry.prompt ?? prompt}</span>
              <code className="min-w-0 flex-1 whitespace-pre-wrap break-words text-foreground">{entry.command}</code>
              <span className={cx('inline-flex shrink-0 items-center gap-[var(--rui-space-1)] font-sans text-[length:var(--rui-text-xs)]', status === 'error' ? 'text-destructive' : 'text-muted-foreground')}>
                {status === 'running' && <LoaderCircle aria-hidden="true" className="size-3 motion-safe:animate-spin" />}
                {status === 'error' && <CircleAlert aria-hidden="true" className="size-3" />}
                {entry.time && <span>{entry.time}</span>}
                <span>{statusLabels[status]}</span>
              </span>
            </div>
            {entry.output !== undefined && <div className={cx('mt-[var(--rui-space-1)] min-w-0 whitespace-pre-wrap break-words ps-[var(--rui-space-4)] leading-relaxed', status === 'error' ? 'text-destructive' : 'text-muted-foreground')}>{entry.output}</div>}
            {status === 'running' && entry.output === undefined && <p className="mt-[var(--rui-space-1)] ps-[var(--rui-space-4)] text-muted-foreground">正在等待宿主响应…</p>}
          </li>;
        })}
      </ol></div> : <p role="status" className="px-[var(--rui-cell-padding-x)] py-[var(--rui-empty-padding)] text-center text-sm text-muted-foreground">{emptyMessage}</p>}
    </div>
    <form onSubmit={event => { event.preventDefault(); if (!composing.current) void submit(); }} className="border-t border-border">
      <label htmlFor={inputId} className="sr-only">{label}</label>
      <div className="flex min-w-0 items-center gap-[var(--rui-space-1)] px-[var(--rui-cell-padding-x)] py-[var(--rui-space-1)]">
        <span aria-hidden="true" className="shrink-0 font-mono text-xs text-muted-foreground">{prompt}</span>
        <Input id={inputId} name={name} autoFocus={autoFocus} aria-describedby={visibleError ? errorId : undefined} aria-invalid={Boolean(visibleError) || undefined} aria-keyshortcuts={running && onCancel ? 'Escape' : undefined} value={text} readOnly={readOnly || running} disabled={inputDisabled} placeholder={placeholder} autoComplete="off" spellCheck={false}
          onChange={event => publish(event.target.value)} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={onInputKeyDown}
          className="h-[var(--rui-control-height-xs)] min-w-0 flex-1 rounded-none border-0 bg-transparent px-[var(--rui-space-1)] font-mono text-xs shadow-none focus-visible:ring-0 dark:bg-transparent" />
        {running && onCancel ? <Button type="button" variant="ghost" size="xs" aria-label={cancelLabel} title={cancelLabel} disabled={disabled || cancelling} onClick={() => void cancel()}>{cancelling ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <Square aria-hidden="true" />}取消</Button>
          : <Button type="submit" variant="ghost" size="xs" aria-label={submitLabel} title={submitLabel} disabled={disabled || readOnly || submitting || !text.trim()}>{submitting ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <CornerDownLeft aria-hidden="true" />}运行</Button>}
      </div>
      {visibleError && <div id={errorId} role="alert" className="flex items-start gap-[var(--rui-space-1)] border-t border-destructive/30 px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-xs text-destructive"><CircleAlert aria-hidden="true" className="mt-px size-3 shrink-0" /><span className="min-w-0">{visibleError}</span></div>}
    </form>
  </section>;
}
