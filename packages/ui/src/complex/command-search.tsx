import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { useCommandState } from 'cmdk';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Command, CommandDialog, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from '../primitives/command.js';
import { cx } from './shared.js';

export interface SearchCommand { id: string; label: string; description?: string; keywords?: string[]; shortcut?: string; actionLabel?: string; disabled?: boolean; icon?: ReactNode; }
export interface CommandGroupDefinition { id: string; label: string; commands: SearchCommand[]; }
export interface CommandSearchProps {
  groups: CommandGroupDefinition[];
  onSelect: (command: SearchCommand) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
  label?: string;
  placeholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  error?: string;
  onRetry?: () => void;
  disabled?: boolean;
  context?: ReactNode;
  contextLabel?: string;
  footer?: ReactNode | false;
  className?: string;
}

interface CommandSearchContentProps extends Pick<CommandSearchProps, 'groups' | 'onSelect' | 'label' | 'placeholder' | 'emptyMessage' | 'loading' | 'loadingMessage' | 'error' | 'onRetry' | 'disabled'> {
  value: string;
  onValueChange: (value: string) => void;
  composing: { current: boolean };
}

function CommandSearchContent({ groups, onSelect, label, placeholder, emptyMessage, loading, loadingMessage, error, onRetry, disabled, value, onValueChange, composing }: CommandSearchContentProps) {
  const resultCount = useCommandState(state => state.filtered.count);
  const selectedItemId = useCommandState(state => state.selectedItemId);
  const statusId = useId();
  const showResults = !loading && !error && resultCount > 0;
  return <>
    <CommandInput asChild aria-label={label} placeholder={placeholder} value={value} onValueChange={onValueChange} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}>
      <input disabled={disabled} aria-busy={loading || undefined} aria-expanded={showResults} aria-activedescendant={showResults ? selectedItemId : undefined} aria-describedby={!showResults ? statusId : undefined} />
    </CommandInput>
    {/* Keep items registered for cmdk filtering; expose a listbox only while it has results. */}
    <CommandList label={`${label}结果`} hidden={!showResults}>{groups.map(group => <CommandGroup key={group.id} heading={group.label}>{group.commands.map(command => <CommandItem key={command.id} value={command.id} keywords={[command.label, command.description ?? '', ...(command.keywords ?? [])]} disabled={disabled || loading || command.disabled} onSelect={() => onSelect(command)}>{command.icon}<span className="min-w-0 flex-1"><span className="block truncate" title={command.label}>{command.label}</span>{command.description && <span className="mt-0.5 block truncate text-xs text-muted-foreground" title={command.description}>{command.description}</span>}</span>{command.actionLabel && <span className="shrink-0 text-xs text-muted-foreground group-data-selected/command-item:text-foreground">{command.actionLabel}</span>}{command.shortcut && <CommandShortcut>{command.shortcut}</CommandShortcut>}</CommandItem>)}</CommandGroup>)}</CommandList>
    {!showResults && <div id={statusId} role={error ? 'alert' : 'status'} className="flex flex-col items-center justify-center gap-[var(--rui-content-gap-sm)] px-[var(--rui-content-padding)] py-[var(--rui-empty-padding)] text-center text-sm text-muted-foreground">
      {error ? <><AlertCircle className="size-4 text-destructive" aria-hidden="true" /><span>{error}</span>{onRetry && <Button type="button" size="xs" variant="outline" onClick={onRetry}><RotateCcw />重试</Button>}</> : <span>{loading ? loadingMessage : emptyMessage}</span>}
    </div>}
  </>;
}

export function CommandSearch({ groups, onSelect, query, onQueryChange, label = '搜索命令', placeholder = '搜索命令或关键词…', emptyMessage = '没有找到匹配的命令', loading = false, loadingMessage = '正在加载命令…', error, onRetry, disabled = false, context, contextLabel = '当前范围', footer, className }: CommandSearchProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const composing = useRef(false);
  return <Command label={label} data-state={error ? 'error' : loading ? 'loading' : 'ready'} className={cx('rounded-xl border border-border font-sans', className)} onKeyDownCapture={(event: ReactKeyboardEvent) => { if (event.key === 'Enter' && (composing.current || event.nativeEvent.isComposing || event.keyCode === 229)) { event.preventDefault(); event.stopPropagation(); } }}>
    {context && <div data-slot="command-search-context" className="flex min-w-0 items-center gap-[var(--rui-content-gap-sm)] border-b border-border px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)] text-xs"><span className="shrink-0 text-muted-foreground">{contextLabel}</span><span className="truncate font-medium" title={typeof context === 'string' ? context : undefined}>{context}</span></div>}
    <CommandSearchContent groups={groups} onSelect={onSelect} label={label} placeholder={placeholder} emptyMessage={emptyMessage} loading={loading} loadingMessage={loadingMessage} error={error} onRetry={onRetry} disabled={disabled} value={query ?? internalQuery} onValueChange={text => { if (query === undefined) setInternalQuery(text); onQueryChange?.(text); }} composing={composing} />
    {footer !== false && <div className="border-t border-border px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-xs text-muted-foreground">{footer ?? '↑ ↓ 选择 · Enter 执行 · 中文输入法候选确认不会执行'}</div>}
  </Command>;
}

function matchesShortcut(event: KeyboardEvent, shortcut: string) {
  if (event.isComposing || event.keyCode === 229) return false;
  const parts = shortcut.toLowerCase().split('+').map(part => part.trim()).filter(Boolean);
  const key = parts.at(-1);
  if (!key || event.key.toLowerCase() !== key) return false;
  const mod = parts.includes('mod');
  if (mod && !(event.ctrlKey || event.metaKey)) return false;
  if (parts.includes('ctrl') !== event.ctrlKey && !mod) return false;
  if (parts.includes('meta') !== event.metaKey && !mod) return false;
  if (parts.includes('shift') !== event.shiftKey) return false;
  if (parts.includes('alt') !== event.altKey) return false;
  return true;
}

export interface ApplicationSearchProps extends Omit<CommandSearchProps, 'onSelect'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect: (command: SearchCommand) => void | Promise<void>;
  shortcut?: string | false;
  shortcutLabel?: string;
  title?: string;
  description?: string;
  closeOnSelect?: boolean;
  actionErrorMessage?: string;
}

/** A dashboard search dialog. The host owns groups, search transport and selected command effects. */
export function ApplicationSearch({ open: openProp, defaultOpen = false, onOpenChange, onSelect, shortcut = 'mod+k', shortcutLabel = 'Ctrl K', title = '应用搜索', description = '搜索当前应用提供的文件、任务和操作。', closeOnSelect = true, actionErrorMessage = '操作未完成，请重试。', loadingMessage = '正在搜索…', footer, disabled, ...searchProps }: ApplicationSearchProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState('');
  const open = openProp ?? internalOpen;
  const request = useRef(0);
  const setOpen = useCallback((next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
    if (!next) {
      request.current += 1;
      setActionPending(false);
      setActionError('');
    }
  }, [onOpenChange, openProp]);

  useEffect(() => {
    if (!shortcut || disabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!matchesShortcut(event, shortcut)) return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [disabled, setOpen, shortcut]);

  const select = useCallback(async (command: SearchCommand) => {
    if (actionPending) return;
    const current = ++request.current;
    setActionPending(true);
    setActionError('');
    try {
      await onSelect(command);
      if (request.current !== current) return;
      setActionPending(false);
      if (closeOnSelect) setOpen(false);
    } catch {
      if (request.current !== current) return;
      setActionPending(false);
      setActionError(actionErrorMessage);
    }
  }, [actionErrorMessage, actionPending, closeOnSelect, onSelect, setOpen]);

  const searchError = actionError || searchProps.error;
  return <CommandDialog open={open} onOpenChange={setOpen} title={title} description={description} className="h-[min(var(--rui-container-md),calc(100vh-var(--rui-space-8)))] max-w-2xl gap-0">
    <CommandSearch {...searchProps} disabled={disabled || actionPending} loading={searchProps.loading || actionPending} loadingMessage={actionPending ? '正在执行操作…' : loadingMessage} error={searchError} onRetry={actionError ? () => setActionError('') : searchProps.onRetry} onSelect={select} className="min-h-0 flex-1 rounded-none border-0" footer={footer ?? <><span>{shortcutLabel} 打开</span><span className="px-2">·</span><span>Esc 关闭</span></>} />
  </CommandDialog>;
}
