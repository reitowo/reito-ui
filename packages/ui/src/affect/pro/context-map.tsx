import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';

export type ContextKind = 'system' | 'tools' | 'memory' | 'file' | 'chat' | 'result' | 'summary';
export type ContextBlock = {
  id: string;
  label: string;
  kind: ContextKind;
  tokens: number;
  detail?: string;
  icon?: ReactNode;
  items?: { label: string; icon?: ReactNode }[];
};
export type ContextAgent = { id: string; name: string; limit?: number; icon?: ReactNode };
export type ContextCompaction = {
  before: ContextBlock[];
  summarized?: string[];
  dropped?: string[];
  summary?: ContextBlock;
};
export type ContextMapProps = {
  blocks: ContextBlock[];
  limit: number;
  model?: string;
  modelIcon?: ReactNode;
  agents?: ContextAgent[];
  agent?: string;
  onAgentChange?: (id: string) => void;
  compaction?: ContextCompaction | null;
  view?: 'before' | 'after';
  onViewChange?: (view: 'before' | 'after') => void;
  status?: string;
  onSelect?: (block: ContextBlock | null) => void;
  title?: string;
  className?: string;
};

const kindLabel: Record<ContextKind, string> = {
  system: '系统',
  tools: '工具',
  memory: '记忆',
  file: '文件',
  chat: '对话',
  result: '结果',
  summary: '摘要',
};

/** Recreated from public Context Map docs. Not Pro source. */
export function ContextMap({
  blocks,
  limit,
  model,
  modelIcon,
  agents,
  agent,
  onAgentChange,
  compaction,
  view,
  onViewChange,
  status,
  onSelect,
  title = '上下文',
  className,
}: ContextMapProps) {
  const [internalView, setInternalView] = useState<'before' | 'after'>('after');
  const [pinned, setPinned] = useState<string | null>(null);
  const side = view ?? internalView;
  const currentAgent = agents?.find((item) => item.id === (agent ?? agents[0]?.id));
  const windowSize = currentAgent?.limit ?? limit;
  const shown = side === 'before' && compaction ? compaction.before : blocks;
  const used = shown.reduce((sum, block) => sum + Math.max(0, block.tokens), 0);
  const free = Math.max(0, windowSize - used);
  const open = shown.find((block) => block.id === pinned);

  function setSide(next: 'before' | 'after') {
    if (view === undefined) setInternalView(next);
    onViewChange?.(next);
  }

  function select(block: ContextBlock | null) {
    setPinned(block && pinned === block.id ? null : (block?.id ?? null));
    onSelect?.(block && pinned === block.id ? null : block);
  }

  const tiles = useMemo(() => {
    const total = used + free;
    return [
      ...shown.map((block) => ({ ...block, share: total ? block.tokens / total : 0 })),
      {
        id: 'free',
        label: '空闲',
        kind: 'summary' as const,
        tokens: free,
        share: total ? free / total : 0,
      },
    ];
  }, [shown, used, free]);

  return (
    <section
      className={cn(
        '@container grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Inline>
          <Heading size="item">{title}</Heading>
          {model ? (
            <Badge variant="secondary">
              {modelIcon}
              {model}
            </Badge>
          ) : null}
          <Text variant="caption" tone="muted">
            {windowSize.toLocaleString()} tokens
          </Text>
        </Inline>
        <Inline>
          {compaction !== undefined ? (
            <Inline>
              <Button
                type="button"
                size="xs"
                variant={side === 'before' ? 'secondary' : 'ghost'}
                onClick={() => setSide('before')}
              >
                压缩前
              </Button>
              <Button
                type="button"
                size="xs"
                variant={side === 'after' ? 'secondary' : 'ghost'}
                onClick={() => setSide('after')}
              >
                压缩后
              </Button>
            </Inline>
          ) : null}
          {agents?.length ? (
            <label className="inline-flex items-center gap-1 text-[length:var(--rui-font-caption)]">
              代理
              <select
                value={currentAgent?.id}
                onChange={(event) => onAgentChange?.(event.target.value)}
                className="rounded-[var(--rui-radius)] border border-border bg-background px-1"
              >
                {agents.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </Inline>
      </Inline>
      <Text variant="caption" tone="muted">
        已用 {used.toLocaleString()} / {windowSize.toLocaleString()}
        {status ? ` · ${status}` : ''}
        {compaction === null ? ' · 尚未压缩' : ''}
      </Text>
      <ul aria-label={title} className="flex min-h-[var(--rui-space-16)] flex-wrap gap-1">
        {tiles.map((tile) => {
          const block =
            tile.id === 'free' ? null : (shown.find((item) => item.id === tile.id) ?? null);
          return (
            <li
              key={tile.id}
              style={{
                flexGrow: Math.max(1, Math.round(tile.share * 100)),
                flexBasis: `${Math.max(8, tile.share * 100)}%`,
              }}
            >
              <button
                type="button"
                aria-pressed={pinned === tile.id}
                className={cn(
                  'grid h-full min-h-[var(--rui-control-height)] w-full place-items-start rounded-[var(--rui-radius)] border p-2 text-left',
                  tile.id === 'free'
                    ? 'border-dashed border-border bg-transparent'
                    : 'border-border bg-muted',
                  pinned === tile.id && 'border-ring',
                )}
                onClick={() => select(block)}
              >
                <Text as="span" variant="caption">
                  {tile.icon} {tile.label}
                </Text>
                <Text as="span" variant="caption" tone="muted">
                  {tile.id === 'free' ? '' : kindLabel[tile.kind]} {tile.tokens.toLocaleString()}
                </Text>
              </button>
            </li>
          );
        })}
      </ul>
      {open ? (
        <aside
          role="dialog"
          aria-label={open.label}
          className="rounded-[var(--rui-radius)] bg-muted p-2"
        >
          <Stack gap="small">
            <Inline className="justify-between">
              <Text variant="interface">{open.label}</Text>
              <Button type="button" size="xs" variant="ghost" onClick={() => select(null)}>
                关闭
              </Button>
            </Inline>
            <Text variant="caption" tone="muted">
              {kindLabel[open.kind]} · {open.tokens.toLocaleString()} tokens
              {open.detail ? ` · ${open.detail}` : ''}
            </Text>
            {open.items?.length ? (
              <ul className="grid gap-1">
                {open.items.map((item) => (
                  <li key={item.label}>
                    <Text variant="caption">
                      {item.icon} {item.label}
                    </Text>
                  </li>
                ))}
              </ul>
            ) : null}
          </Stack>
        </aside>
      ) : null}
    </section>
  );
}
