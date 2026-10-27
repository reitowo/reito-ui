import { useMemo, useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { formatDollars, initials } from '../shared.js';

export type CursorAgent = {
  id: string;
  name: string;
  color?: string;
  avatar?: ReactNode;
  tint?: string;
  cost?: number;
};
export type DocBlock = {
  id: string;
  kind?: 'title' | 'heading' | 'paragraph' | 'item' | 'code' | 'image';
  text?: string;
  src?: string;
  alt?: string;
};
export type AgentCursor = {
  block: string;
  at?: number;
  in?: string;
  select?: number;
  doing?: string;
  typing?: boolean;
};
export type DocComment = {
  id: string;
  agent: string;
  block: string;
  at?: number;
  text: string;
  open?: boolean;
};
export type DocSuggestion = {
  id: string;
  agent: string;
  block: string;
  at: number;
  remove?: string;
  insert?: string;
  note?: string;
};
export type AgentCursorsProps = {
  agents: CursorAgent[];
  blocks: DocBlock[];
  cursors?: Record<string, AgentCursor | null>;
  comments?: DocComment[];
  suggestions?: DocSuggestion[];
  onAccept?: (suggestion: DocSuggestion) => void;
  onReject?: (suggestion: DocSuggestion) => void;
  onAcceptAll?: () => void;
  onResolveComment?: (comment: DocComment) => void;
  onReply?: (comment: DocComment, text: string) => void;
  following?: string | null;
  defaultFollowing?: string | null;
  onFollowingChange?: (id: string | null) => void;
  title?: string;
  formatCost?: (amount: number) => string;
  tabs?: { id: string; label: string }[];
  tab?: string;
  onTabChange?: (id: string) => void;
  className?: string;
};

export function acceptSuggestion(
  blocks: DocBlock[],
  suggestions: DocSuggestion[],
  id: string,
): { blocks: DocBlock[]; suggestions: DocSuggestion[] } {
  const suggestion = suggestions.find((item) => item.id === id);
  if (!suggestion) return { blocks, suggestions };
  return {
    blocks: blocks.map((block) => {
      if (block.id !== suggestion.block || block.text == null) return block;
      const before = block.text.slice(0, suggestion.at);
      const after = block.text.slice(suggestion.at + (suggestion.remove?.length ?? 0));
      return { ...block, text: `${before}${suggestion.insert ?? ''}${after}` };
    }),
    suggestions: suggestions.filter((item) => item.id !== id),
  };
}

/** Recreated from public Agent Cursors docs. Not Pro source. */
export function AgentCursors({
  agents,
  blocks,
  cursors = {},
  comments = [],
  suggestions = [],
  onAccept,
  onReject,
  onAcceptAll,
  onResolveComment,
  following,
  defaultFollowing = null,
  onFollowingChange,
  title = '未命名',
  formatCost = formatDollars,
  tabs,
  tab,
  onTabChange,
  className,
}: AgentCursorsProps) {
  const [internalFollow, setInternalFollow] = useState<string | null>(defaultFollowing);
  const [openId, setOpenId] = useState<string | null>(suggestions[0]?.id ?? null);
  const currentFollow = following === undefined ? internalFollow : following;
  const total = agents.reduce((sum, agent) => sum + (agent.cost ?? 0), 0);

  function follow(id: string) {
    const next = currentFollow === id ? null : id;
    if (following === undefined) setInternalFollow(next);
    onFollowingChange?.(next);
  }

  const byBlock = useMemo(() => {
    const map = new Map<
      string,
      { cursor?: { agent: CursorAgent; cursor: AgentCursor }; marks: DocSuggestion[] }
    >();
    for (const block of blocks) map.set(block.id, { marks: [] });
    for (const suggestion of suggestions) {
      map.get(suggestion.block)?.marks.push(suggestion);
    }
    for (const agent of agents) {
      const cursor = cursors[agent.id];
      if (cursor && map.has(cursor.block)) map.get(cursor.block)!.cursor = { agent, cursor };
    }
    return map;
  }, [agents, blocks, cursors, suggestions]);

  return (
    <section
      className={cn(
        'grid max-w-xl gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        <Text variant="caption" tone="muted">
          {suggestions.length} 处建议
          {total ? ` · ${formatCost(total)}` : ''}
        </Text>
      </Inline>
      <Inline>
        {agents.map((agent) => {
          const cursor = cursors[agent.id];
          return (
            <Button
              key={agent.id}
              type="button"
              size="sm"
              variant={currentFollow === agent.id ? 'secondary' : 'ghost'}
              aria-pressed={currentFollow === agent.id}
              aria-label={`${agent.name}${cursor?.doing ? `：${cursor.doing}` : ''}`}
              className={cn(currentFollow && currentFollow !== agent.id && 'opacity-70')}
              onClick={() => follow(agent.id)}
            >
              <span className="grid size-5 place-items-center rounded-full bg-muted text-[length:var(--rui-font-caption)]">
                {agent.avatar ?? initials(agent.name)}
              </span>
              {agent.name}
              {cursor?.doing ? (
                <Text as="span" variant="caption" tone="muted">
                  {cursor.doing}
                </Text>
              ) : null}
            </Button>
          );
        })}
        {suggestions.length > 1 && onAcceptAll ? (
          <Button type="button" size="xs" variant="outline" onClick={onAcceptAll}>
            全部接受
          </Button>
        ) : null}
      </Inline>
      {tabs?.length ? (
        <Inline>
          {tabs.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="xs"
              variant={tab === item.id ? 'secondary' : 'ghost'}
              onClick={() => onTabChange?.(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </Inline>
      ) : null}
      <div className="grid gap-[var(--rui-content-gap-sm)]">
        {blocks.map((block) => {
          const meta = byBlock.get(block.id);
          const Tag = block.kind === 'title' || block.kind === 'heading' ? 'h3' : 'p';
          return (
            <div key={block.id} className="relative">
              <Tag
                className={cn(
                  'text-[length:var(--rui-font-reading)] leading-[var(--rui-line-reading)]',
                  block.kind === 'code' && 'font-mono',
                  block.kind === 'item' && 'pl-4',
                )}
              >
                {block.kind === 'item' ? '• ' : ''}
                {block.text}
              </Tag>
              {meta?.cursor ? (
                <span className="sr-only">
                  {meta.cursor.agent.name}
                  {meta.cursor.cursor.doing ? ` ${meta.cursor.cursor.doing}` : ''}
                </span>
              ) : null}
              {meta?.marks.map((suggestion) => {
                const agent = agents.find((item) => item.id === suggestion.agent);
                return (
                  <div key={suggestion.id} className="mt-1">
                    <button
                      type="button"
                      className="rounded-sm bg-muted px-1 text-left text-[length:var(--rui-font-caption)] focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring"
                      aria-label={`${agent?.name ?? '代理'}建议：${suggestion.insert ?? suggestion.remove ?? ''}`}
                      onClick={() => setOpenId(openId === suggestion.id ? null : suggestion.id)}
                    >
                      {suggestion.remove ? (
                        <span className="text-destructive line-through">{suggestion.remove}</span>
                      ) : null}
                      {suggestion.insert ? (
                        <span className="text-success underline">{suggestion.insert}</span>
                      ) : null}
                    </button>
                    {openId === suggestion.id ? (
                      <Inline className="mt-1">
                        <Text variant="caption" tone="muted">
                          {suggestion.note ?? agent?.name}
                        </Text>
                        <Button type="button" size="xs" onClick={() => onAccept?.(suggestion)}>
                          <Check className="size-3" />
                          接受
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => onReject?.(suggestion)}
                        >
                          <X className="size-3" />
                          拒绝
                        </Button>
                      </Inline>
                    ) : null}
                  </div>
                );
              })}
              {comments
                .filter((comment) => comment.block === block.id)
                .map((comment) => {
                  const agent = agents.find((item) => item.id === comment.agent);
                  return (
                    <Stack
                      key={comment.id}
                      gap="small"
                      className="mt-1 rounded-[var(--rui-radius)] bg-muted p-2"
                    >
                      <Text variant="caption">
                        {agent?.name}：{comment.text}
                      </Text>
                      {onResolveComment ? (
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          onClick={() => onResolveComment(comment)}
                        >
                          解决
                        </Button>
                      ) : null}
                    </Stack>
                  );
                })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
