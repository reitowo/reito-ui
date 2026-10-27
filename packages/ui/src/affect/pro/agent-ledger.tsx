import { useMemo, useState } from 'react';
import { Lock, RotateCcw, Undo2 } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';
import { formatAgo, useTickingNow } from '../shared.js';

export type LedgerEntry = {
  id: string;
  action: string;
  target?: string;
  system: string;
  icon?: React.ReactNode;
  at: number;
  change?: [string, string];
  detail?: string;
  reversible?: boolean;
  dependsOn?: string[];
};
export type AgentLedgerProps = {
  entries: LedgerEntry[];
  agent?: string;
  now?: number;
  undone?: string[];
  defaultUndone?: string[];
  onUndo?: (ids: string[]) => void;
  onRedo?: (ids: string[]) => void;
  pointAt?: string | null;
  title?: string;
  className?: string;
};

function dependents(entries: LedgerEntry[], id: string) {
  const extra = entries.filter((entry) => entry.dependsOn?.includes(id)).map((entry) => entry.id);
  return [id, ...extra.flatMap((item) => dependents(entries, item))];
}

/** Recreated from public Agent Ledger docs. Not Pro source. */
export function AgentLedger({
  entries,
  agent,
  now,
  undone,
  defaultUndone = [],
  onUndo,
  onRedo,
  pointAt,
  title = '账本',
  className,
}: AgentLedgerProps) {
  const clock = useTickingNow(true, now);
  const [internal, setInternal] = useState(defaultUndone);
  const [hover, setHover] = useState<string | null>(null);
  const reverted = undone ?? internal;
  const focus = pointAt ?? hover;
  const chain = focus ? dependents(entries, focus) : [];
  const ordered = useMemo(() => entries.slice().sort((a, b) => b.at - a.at), [entries]);

  function setReverted(ids: string[], redo = false) {
    const next = redo
      ? reverted.filter((id) => !ids.includes(id))
      : [...new Set([...reverted, ...ids])];
    if (undone === undefined) setInternal(next);
    if (redo) onRedo?.(ids);
    else onUndo?.(ids);
  }

  return (
    <section
      className={cn(
        '@container grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Heading size="item">
          {title}
          {agent ? ` · ${agent}` : ''}
        </Heading>
        <Text variant="caption" tone="muted">
          {entries.length} 项改动
        </Text>
      </Inline>
      <ol aria-label={title} className="grid gap-2">
        {ordered.map((entry, index) => {
          const gone = reverted.includes(entry.id);
          const also = focus != null && chain.includes(entry.id) && entry.id !== focus;
          const locked = entry.reversible === false;
          return (
            <li
              key={entry.id}
              className={cn(
                'grid gap-1 rounded-[var(--rui-radius)] border border-border p-2',
                gone && 'opacity-70',
                also && 'border-ring bg-muted',
              )}
            >
              <Inline className="justify-between">
                <Inline>
                  <Text as="span" variant="caption" tone="muted">
                    {index + 1}.
                  </Text>
                  {entry.icon}
                  <Text as="span" variant="interface">
                    {entry.action}
                  </Text>
                  {entry.target ? (
                    <Text as="span" variant="caption" tone="muted">
                      {entry.target}
                    </Text>
                  ) : null}
                </Inline>
                <Inline>
                  <Text
                    as="span"
                    variant="caption"
                    tone="muted"
                    className="@min-[480px]:inline hidden"
                  >
                    {formatAgo(entry.at, clock)} · {entry.system}
                  </Text>
                  {locked ? (
                    <span className="inline-flex items-center gap-1 text-[length:var(--rui-font-caption)] text-warning">
                      <Lock className="size-3" />
                      无法撤销
                    </span>
                  ) : gone ? (
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      onClick={() => setReverted([entry.id], true)}
                    >
                      <RotateCcw className="size-3" />
                      重做
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      aria-label={
                        chain.length > 1
                          ? `撤销 ${entry.action}，另有 ${chain.length - 1} 项`
                          : `撤销 ${entry.action}`
                      }
                      onMouseEnter={() => setHover(entry.id)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(entry.id)}
                      onBlur={() => setHover(null)}
                      onClick={() =>
                        setReverted(
                          dependents(entries, entry.id).filter((id) => {
                            const item = entries.find((row) => row.id === id);
                            return item?.reversible !== false;
                          }),
                        )
                      }
                    >
                      <Undo2 className="size-3" />
                      撤销
                    </Button>
                  )}
                </Inline>
              </Inline>
              {entry.change ? (
                <Text variant="caption">
                  <span className="line-through text-muted-foreground">{entry.change[0]}</span>
                  {' 到 '}
                  <span>{entry.change[1]}</span>
                </Text>
              ) : entry.detail ? (
                <Text variant="caption" tone="muted">
                  {entry.detail}
                </Text>
              ) : null}
              {also ? (
                <Text
                  variant="caption"
                  className={locked ? 'text-warning' : 'text-muted-foreground'}
                >
                  {locked ? '无法撤销' : '也会撤销'}
                </Text>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
