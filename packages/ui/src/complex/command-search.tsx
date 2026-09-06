import { useId, useRef, useState, type ReactNode } from 'react';
import { useCommandState } from 'cmdk';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from '../primitives/command.js';
import { cx } from './shared.js';

export interface SearchCommand { id: string; label: string; description?: string; keywords?: string[]; shortcut?: string; disabled?: boolean; icon?: ReactNode; }
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
  className?: string;
}

interface CommandSearchContentProps extends Pick<CommandSearchProps, 'groups' | 'onSelect' | 'label' | 'placeholder' | 'emptyMessage' | 'loading'> {
  value: string;
  onValueChange: (value: string) => void;
  composing: { current: boolean };
}

function CommandSearchContent({ groups, onSelect, label, placeholder, emptyMessage, loading, value, onValueChange, composing }: CommandSearchContentProps) {
  const resultCount = useCommandState(state => state.filtered.count);
  const selectedItemId = useCommandState(state => state.selectedItemId);
  const statusId = useId();
  const showResults = !loading && resultCount > 0;
  return <>
    <CommandInput asChild aria-label={label} placeholder={placeholder} value={value} onValueChange={onValueChange} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}>
      <input aria-expanded={showResults} aria-activedescendant={showResults ? selectedItemId : undefined} aria-describedby={!showResults ? statusId : undefined} />
    </CommandInput>
    {/* Keep items registered for cmdk filtering; expose a listbox only while it has results. */}
    <CommandList label={`${label}结果`} hidden={!showResults}>{groups.map(group => <CommandGroup key={group.id} heading={group.label}>{group.commands.map(command => <CommandItem key={command.id} value={command.id} keywords={[command.label, command.description ?? '', ...(command.keywords ?? [])]} disabled={loading || command.disabled} onSelect={() => onSelect(command)}>{command.icon}<span className="min-w-0 flex-1"><span className="block">{command.label}</span>{command.description && <span className="mt-0.5 block text-xs text-muted-foreground">{command.description}</span>}</span>{command.shortcut && <CommandShortcut>{command.shortcut}</CommandShortcut>}</CommandItem>)}</CommandGroup>)}</CommandList>
    {!showResults && <p id={statusId} role="status" className="px-[var(--rui-content-padding)] py-[var(--rui-empty-padding)] text-center text-sm text-muted-foreground">{loading ? '正在加载命令…' : emptyMessage}</p>}
  </>;
}

export function CommandSearch({ groups, onSelect, query, onQueryChange, label = '搜索命令', placeholder = '搜索命令或关键词…', emptyMessage = '没有找到匹配的命令', loading = false, className }: CommandSearchProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const composing = useRef(false);
  return <Command label={label} className={cx('rounded-xl border border-border font-sans', className)} onKeyDownCapture={event => { if (event.key === 'Enter' && (composing.current || event.nativeEvent.isComposing || event.keyCode === 229)) { event.preventDefault(); event.stopPropagation(); } }}>
    <CommandSearchContent groups={groups} onSelect={onSelect} label={label} placeholder={placeholder} emptyMessage={emptyMessage} loading={loading} value={query ?? internalQuery} onValueChange={text => { if (query === undefined) setInternalQuery(text); onQueryChange?.(text); }} composing={composing} />
    <p className="border-t border-border px-[var(--rui-content-padding)] py-[var(--rui-content-gap-sm)] text-xs text-muted-foreground">↑ ↓ 选择 · Enter 执行 · 中文输入法候选确认不会执行</p>
  </Command>;
}
