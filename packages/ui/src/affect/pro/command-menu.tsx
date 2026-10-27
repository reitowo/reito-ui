import { useEffect, useState, type ReactNode } from 'react';
import {
  CommandSearch,
  type CommandGroupDefinition,
  type SearchCommand,
} from '../../complex/command-search.js';
import { cn } from '../../lib/utils.js';

export type CommandItem = {
  id: string;
  label: string;
  hint?: string;
  logo?: ReactNode;
  icon?: ReactNode;
  keys?: string;
  keywords?: string[];
};
export type CommandGroup = { id: string; label: string; commands: CommandItem[] };
export type CommandMenuProps = {
  groups?: CommandGroup[];
  placeholder?: string;
  onRun?: (id: string, query?: string) => void;
  onClose?: () => void;
  autoFocus?: boolean;
  className?: string;
};

const defaultGroups: CommandGroup[] = [
  {
    id: 'suggestions',
    label: '建议',
    commands: [
      { id: 'review', label: '审查当前改动', keys: '⌘1' },
      { id: 'search', label: '搜索文件', keys: '⌘2' },
    ],
  },
  {
    id: 'general',
    label: '通用',
    commands: [
      { id: 'settings', label: '打开设置' },
      { id: 'ask', label: '询问助手' },
    ],
  },
];

/** Recreated from public Command Menu docs. Wraps Reito CommandSearch. */
export function CommandMenu({
  groups = defaultGroups,
  placeholder = '输入命令或搜索…',
  onRun,
  onClose,
  autoFocus = true,
  className,
}: CommandMenuProps) {
  const [query, setQuery] = useState('');
  const [ran, setRan] = useState('');
  const mapped: CommandGroupDefinition[] = groups.map((group) => ({
    id: group.id,
    label: group.label,
    commands: group.commands.map((command) => ({
      id: command.id,
      label: command.label,
      description: command.hint,
      keywords: command.keywords,
      shortcut: command.keys,
      icon: command.logo ?? command.icon,
    })),
  }));

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
      }
      if (event.key === 'Escape' && !query) onClose?.();
      if ((event.metaKey || event.ctrlKey) && /^[1-5]$/.test(event.key)) {
        const suggestions = groups.find((group) => group.id === 'suggestions')?.commands ?? [];
        const command = suggestions[Number(event.key) - 1];
        if (command) {
          event.preventDefault();
          onRun?.(command.id, query);
          setRan(command.label);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [groups, onClose, onRun, query]);

  return (
    <div
      className={cn('rounded-[var(--rui-radius-surface)] border border-border bg-card', className)}
    >
      <CommandSearch
        groups={mapped}
        query={query}
        onQueryChange={setQuery}
        placeholder={placeholder}
        emptyMessage="没有匹配的命令。按 Enter 询问助手。"
        onSelect={(command: SearchCommand) => {
          onRun?.(command.id, query);
          setRan(command.label);
        }}
      />
      {ran ? (
        <p
          role="status"
          className="border-t border-border px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)] text-[length:var(--rui-font-caption)] text-muted-foreground"
        >
          已运行：{ran}
        </p>
      ) : null}
    </div>
  );
}
