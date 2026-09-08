import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../primitives/button.js';
import { CommandSearch, type CommandGroupDefinition, type SearchCommand } from '../complex/command-search.js';
import { ChatOverlay } from './chat-overlay.js';
import type { ComposerProps } from './composer.js';

export interface ChatPaletteSession { id: string; label: string; description?: string; disabled?: boolean; }
export interface ChatPaletteProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  disabled?: boolean;
  groups: CommandGroupDefinition[];
  onCommand: (command: SearchCommand) => void | Promise<void>;
  sessions?: ChatPaletteSession[];
  onSessionSelect?: (id: string) => void | Promise<void>;
  children?: ReactNode;
  composer: ComposerProps;
  /** Opt-in global Mod+J shortcut; ignored in editable fields and during IME. */
  shortcut?: boolean;
}

export function ChatPalette({ open, defaultOpen = false, onOpenChange, title = '命令与对话', disabled = false, groups, onCommand, sessions = [], onSessionSelect, children, composer, shortcut = false }: ChatPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [view, setView] = useState<'commands' | 'sessions' | 'chat'>('commands');
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState('');
  const busy = useRef(false);
  const visible = open ?? internalOpen;
  function changeOpen(next: boolean) { if (open === undefined) setInternalOpen(next); onOpenChange?.(next); }
  useEffect(() => {
    if (!shortcut || disabled) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.isComposing || event.keyCode === 229 || event.altKey || event.shiftKey || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'j') return;
      const target = event.target;
      if (target instanceof Element && target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return;
      event.preventDefault(); changeOpen(!visible);
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  });
  async function select(command: SearchCommand) {
    if (busy.current || disabled) return;
    busy.current = true; setPending(true); setActionError('');
    try {
      if (view === 'sessions') await onSessionSelect?.(command.id);
      else await onCommand(command);
      setView('chat');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '操作失败，请重试');
    } finally { busy.current = false; setPending(false); }
  }
  const sessionGroups: CommandGroupDefinition[] = [{ id: 'sessions', label: '会话', commands: sessions.map(session => ({ ...session, disabled: session.disabled || !onSessionSelect })) }];
  return <ChatOverlay size="compact" open={visible} onOpenChange={changeOpen} title={title} description="选择命令或会话后继续对话" triggerLabel="打开命令与对话" disabled={disabled} composer={composer} composerVisible={view === 'chat'} navigation={<div role="group" aria-label="工作视图" className="flex flex-wrap gap-1">{(['commands','sessions','chat'] as const).map(mode => <Button key={mode} type="button" size="sm" variant={view === mode ? 'secondary' : 'ghost'} aria-pressed={view === mode} disabled={pending} onClick={() => { setView(mode); setActionError(''); }}>{mode === 'commands' ? '命令' : mode === 'sessions' ? '会话' : '对话'}</Button>)}</div>}>
    {view === 'chat' ? children : <CommandSearch key={view} groups={view === 'commands' ? groups : sessionGroups} onSelect={command => { void select(command); }} loading={pending} loadingMessage="正在处理选择…" error={actionError} onRetry={() => setActionError('')} disabled={disabled || pending} label={view === 'commands' ? '搜索命令' : '搜索会话'} emptyMessage={view === 'commands' ? '没有匹配的命令' : '没有匹配的会话'} />}
  </ChatOverlay>;
}
