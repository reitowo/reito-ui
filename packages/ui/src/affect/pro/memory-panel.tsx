import { useMemo, useState } from 'react';
import { tokenMetrics } from '@reito/tokens/metrics';
import { Pause, Play, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { Switch } from '../../primitives/switch.js';
import { Label } from '../../primitives/label.js';
import { Textarea } from '../../primitives/textarea.js';
import { cn } from '../../lib/utils.js';

export type Memory = {
  id: string;
  text: string;
  category: string;
  source?: string;
  date?: string;
  paused?: boolean;
};
export type MemoryPanelProps = {
  memories: Memory[];
  onChange?: (memories: Memory[]) => void;
  onAdd?: (memory: Memory) => void;
  onEdit?: (id: string, text: string) => void;
  onPause?: (id: string, paused: boolean) => void;
  onForget?: (id: string) => void;
  onRestore?: (memory: Memory) => void;
  enabled?: boolean;
  defaultEnabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  categories?: string[];
  title?: string;
  maxHeight?: string;
  undoFor?: number;
  addedSource?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
};

/** Recreated from public Memory Panel docs. Not Pro source. */
export function MemoryPanel({
  memories,
  onChange,
  onAdd,
  onEdit,
  onPause,
  onForget,
  onRestore,
  enabled,
  defaultEnabled = true,
  onEnabledChange,
  categories,
  title = '记忆',
  maxHeight = 'var(--rui-container-xs)',
  undoFor,
  addedSource = '你添加的',
  action,
  className,
}: MemoryPanelProps) {
  const hold = undoFor ?? tokenMetrics['motion-duration-lg'] * 10;
  const [internal, setInternal] = useState(memories);
  const [useMemory, setUseMemory] = useState(defaultEnabled);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [creating, setCreating] = useState(false);
  const [createCategory, setCreateCategory] = useState(
    categories?.[0] ?? memories[0]?.category ?? '工作',
  );
  const [forgotten, setForgotten] = useState<Memory | null>(null);
  const items = onChange ? memories : internal;
  const on = enabled ?? useMemory;
  const groups = categories ?? [...new Set(items.map((item) => item.category))];
  const visible = items.filter((item) => {
    const matchGroup = filter === 'all' || item.category === filter;
    const matchQuery = !query || item.text.includes(query);
    return matchGroup && matchQuery;
  });

  function commit(next: Memory[]) {
    if (!onChange) setInternal(next);
    onChange?.(next);
  }

  function forget(memory: Memory) {
    commit(items.filter((item) => item.id !== memory.id));
    onForget?.(memory.id);
    setForgotten(memory);
    window.setTimeout(
      () => setForgotten((current) => (current?.id === memory.id ? null : current)),
      hold,
    );
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Memory[]>();
    for (const item of visible) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return groups
      .filter((group) => map.has(group))
      .map((group) => [group, map.get(group)!] as const);
  }, [visible, groups]);

  return (
    <section
      className={cn(
        'grid max-w-sm gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">
          {title} {items.length}
        </Heading>
        <Inline>
          <Label htmlFor="affect-memory-enabled">使用记忆</Label>
          <Switch
            id="affect-memory-enabled"
            checked={on}
            onCheckedChange={(value) => {
              const next = value === true;
              if (enabled === undefined) setUseMemory(next);
              onEnabledChange?.(next);
            }}
          />
        </Inline>
      </Inline>
      {!on ? (
        <Text variant="caption" tone="muted">
          新对话不会使用或保存记忆。这里的内容不会删除。
        </Text>
      ) : null}
      <div role="radiogroup" aria-label="分类" className="flex gap-1 overflow-x-auto">
        {['all', ...groups].map((group) => (
          <Button
            key={group}
            type="button"
            size="xs"
            variant={filter === group ? 'secondary' : 'ghost'}
            aria-checked={filter === group}
            role="radio"
            onClick={() => setFilter(group)}
          >
            {group === 'all' ? '全部' : group}
          </Button>
        ))}
      </div>
      <Inline>
        <Search className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索记忆"
          aria-label="搜索记忆"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setQuery('');
          }}
        />
      </Inline>
      <div
        className={cn('grid gap-[var(--rui-content-gap)] overflow-auto', !on && 'opacity-70')}
        style={{ maxHeight }}
      >
        {grouped.length ? (
          grouped.map(([group, list]) => (
            <section key={group} aria-label={group} className="grid gap-2">
              <Text variant="interface">{group}</Text>
              <ul className="grid gap-2">
                {list.map((memory) => (
                  <li
                    key={memory.id}
                    className="grid gap-1 rounded-[var(--rui-radius)] border border-border p-2"
                  >
                    {editing === memory.id ? (
                      <Textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        autoFocus
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            commit(
                              items.map((item) =>
                                item.id === memory.id ? { ...item, text: draft } : item,
                              ),
                            );
                            onEdit?.(memory.id, draft);
                            setEditing(null);
                          }
                          if (event.key === 'Escape') setEditing(null);
                        }}
                      />
                    ) : (
                      <Text className={cn(memory.paused && 'text-muted-foreground')}>
                        {memory.text}
                      </Text>
                    )}
                    <Inline className="justify-between">
                      <Text as="span" variant="caption" tone="muted">
                        {memory.source}
                        {memory.date ? ` · ${memory.date}` : ''}
                        {memory.paused ? ' · 已暂停' : ''}
                      </Text>
                      <Inline>
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          aria-label={`编辑「${memory.text}」`}
                          onClick={() => {
                            setEditing(memory.id);
                            setDraft(memory.text);
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          aria-label={`${memory.paused ? '恢复' : '暂停'}「${memory.text}」`}
                          onClick={() => {
                            commit(
                              items.map((item) =>
                                item.id === memory.id ? { ...item, paused: !item.paused } : item,
                              ),
                            );
                            onPause?.(memory.id, !memory.paused);
                          }}
                        >
                          {memory.paused ? <Play /> : <Pause />}
                        </Button>
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          aria-label={`忘记「${memory.text}」`}
                          onClick={() => forget(memory)}
                        >
                          <Trash2 />
                        </Button>
                      </Inline>
                    </Inline>
                  </li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <Text tone="muted">这里还没有记忆</Text>
        )}
      </div>
      {creating ? (
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            const memory: Memory = {
              id: `mem-${items.length + 1}`,
              text: draft.trim(),
              category: createCategory,
              source: addedSource,
              date: '今天',
            };
            commit([...items, memory]);
            onAdd?.(memory);
            setDraft('');
            setCreating(false);
          }}
        >
          <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="新记忆分类">
            {groups.map((group) => (
              <Button
                key={group}
                type="button"
                size="xs"
                variant={createCategory === group ? 'secondary' : 'ghost'}
                role="radio"
                aria-checked={createCategory === group}
                onClick={() => setCreateCategory(group)}
              >
                {group}
              </Button>
            ))}
          </div>
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="一条新记忆"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Escape') setCreating(false);
            }}
          />
          <Inline className="justify-end">
            <Button type="button" size="xs" variant="ghost" onClick={() => setCreating(false)}>
              取消
            </Button>
            <Button type="submit" size="xs">
              保存
            </Button>
          </Inline>
        </form>
      ) : (
        <Button type="button" size="sm" variant="outline" onClick={() => setCreating(true)}>
          <Plus />
          新记忆
        </Button>
      )}
      <Inline className="justify-between">
        <Text variant="caption" tone="muted" aria-live="polite">
          {forgotten ? `已忘记「${forgotten.text}」` : `${visible.length} / ${items.length} 条`}
        </Text>
        {forgotten ? (
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => {
              commit([...items, forgotten]);
              onRestore?.(forgotten);
              setForgotten(null);
            }}
          >
            <RotateCcw className="size-3" />
            撤销
          </Button>
        ) : action ? (
          <Button type="button" size="xs" variant="ghost" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : null}
      </Inline>
    </section>
  );
}
