import { useMemo, useState, type ReactNode } from 'react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { usePrefersReducedMotion } from '../shared.js';

export type ContextItem = { id: string; label: string; tokens: number };
export type ContextPart = {
  id: string;
  label: string;
  tokens?: number;
  items?: ContextItem[];
  locked?: boolean;
  compact?: boolean;
  color?: string;
};
export type ContextWindowProps = {
  parts: ContextPart[];
  limit: number;
  title?: string;
  model?: string;
  modelIcon?: ReactNode;
  onRemoveItem?: (partId: string, itemId: string) => void;
  onCompact?: (partId: string) => void | Promise<void>;
  action?: { label: string; onClick: () => void };
  warnAt?: number;
  cells?: number;
  columns?: number;
  className?: string;
};

function partTokens(part: ContextPart) {
  if (part.items?.length) return part.items.reduce((sum, item) => sum + item.tokens, 0);
  return part.tokens ?? 0;
}

/** Recreated from public Context Window docs. Not Pro source. */
export function ContextWindow({
  parts,
  limit,
  title = '上下文窗口',
  model,
  modelIcon,
  onRemoveItem,
  onCompact,
  action,
  warnAt,
  cells,
  columns,
  className,
}: ContextWindowProps) {
  const warn = warnAt ?? 0.8;
  const field = cells ?? 216;
  const cols = columns ?? 36;
  const reduced = usePrefersReducedMotion();
  const [removed, setRemoved] = useState<Record<string, string[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [compacting, setCompacting] = useState<string | null>(null);
  const [shrunk, setShrunk] = useState<Record<string, boolean>>({});
  const visible = parts.map((part) => ({
    ...part,
    items: part.items?.filter((item) => !removed[part.id]?.includes(item.id)),
  }));
  const resolved = visible.map((part) => ({
    ...part,
    tokens: shrunk[part.id] ? Math.round(partTokens(part) * 0.2) : partTokens(part),
  }));
  const used = resolved.reduce((sum, part) => sum + part.tokens, 0);
  const ratio = limit ? used / limit : 0;
  const full = ratio >= 0.95;
  const warning = ratio >= warn;
  const hover = resolved.find((part) => part.id === hoverId);
  const focus = hover ?? { id: 'all', label: title, tokens: used };

  const allotment = useMemo(() => {
    const weights = resolved.map((part) => Math.max(part.tokens, 1));
    const total = weights.reduce((sum, value) => sum + value, 0);
    let leftover = field;
    return resolved.map((part, index) => {
      const count =
        index === resolved.length - 1
          ? leftover
          : Math.max(1, Math.round((weights[index] / total) * field));
      leftover -= count;
      return { id: part.id, count: Math.max(1, count) };
    });
  }, [resolved, field]);

  async function compact(part: ContextPart) {
    setCompacting(part.id);
    try {
      if (onCompact) await onCompact(part.id);
      else setShrunk((current) => ({ ...current, [part.id]: true }));
    } finally {
      setCompacting(null);
    }
  }

  function remove(partId: string, itemId: string) {
    if (!onRemoveItem) {
      setRemoved((current) => ({ ...current, [partId]: [...(current[partId] ?? []), itemId] }));
    }
    onRemoveItem?.(partId, itemId);
  }

  const live = compacting
    ? '正在压缩对话'
    : full
      ? '窗口已满'
      : warning
        ? `还剩 ${Math.max(0, limit - used).toLocaleString()} tokens`
        : `${used.toLocaleString()} / ${limit.toLocaleString()}`;

  return (
    <section
      aria-label={title}
      className={cn(
        '@container grid max-w-[var(--rui-container-sm)] gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        <Inline>
          {model ? (
            <Badge variant="secondary">
              {modelIcon}
              {model}
            </Badge>
          ) : null}
          {action ? (
            <Button type="button" size="xs" variant="outline" onClick={action.onClick}>
              {action.label}
            </Button>
          ) : null}
        </Inline>
      </Inline>
      <Text
        variant="caption"
        className={cn(warning && 'text-warning', full && 'text-destructive')}
        aria-hidden="true"
      >
        {focus.label} {focus.tokens.toLocaleString()}
      </Text>
      <div
        aria-hidden="true"
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {allotment.flatMap((slot) =>
          Array.from({ length: slot.count }, (_, index) => (
            <span
              key={`${slot.id}-${index}`}
              className={cn(
                'aspect-square rounded-[var(--rui-radius-2xs)] bg-muted',
                hoverId && hoverId !== slot.id && 'opacity-40',
                compacting === slot.id && !reduced && 'animate-pulse',
              )}
            />
          )),
        )}
      </div>
      <ul className="grid gap-1">
        {resolved.map((part) => (
          <li key={part.id} className="grid gap-1">
            <Inline className="justify-between">
              <button
                type="button"
                className="text-left"
                aria-expanded={part.items ? openId === part.id : undefined}
                disabled={!part.items}
                onMouseEnter={() => setHoverId(part.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(part.id)}
                onBlur={() => setHoverId(null)}
                onClick={() => part.items && setOpenId(openId === part.id ? null : part.id)}
              >
                <Text as="span" variant="interface">
                  {part.label}
                </Text>
                <Text as="span" variant="caption" tone="muted">
                  {' '}
                  {part.tokens.toLocaleString()}
                  {part.locked ? ' · 锁定' : ''}
                </Text>
              </button>
              {part.compact && !shrunk[part.id] ? (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={compacting === part.id}
                  onClick={() => void compact(part)}
                >
                  {compacting === part.id ? '压缩中' : '压缩'}
                </Button>
              ) : shrunk[part.id] ? (
                <Badge variant="secondary">已压缩</Badge>
              ) : null}
            </Inline>
            {part.items && openId === part.id ? (
              <ul className="grid gap-1 pl-3">
                {part.items.map((item) => (
                  <li key={item.id}>
                    <Inline className="justify-between">
                      <Text variant="caption">
                        {item.label} · {item.tokens.toLocaleString()}
                      </Text>
                      {!part.locked ? (
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          aria-label={`移除 ${item.label}`}
                          onClick={() => remove(part.id, item.id)}
                        >
                          移除
                        </Button>
                      ) : null}
                    </Inline>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
      <Text variant="caption" tone="muted" aria-live="polite">
        {live}
      </Text>
    </section>
  );
}
