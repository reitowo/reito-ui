import { useRef, useState } from 'react';
import { Button } from '../primitives/button.js';
import { Input } from '../primitives/input.js';
import { cn } from '../lib/utils.js';
import {
  moveKanbanCard,
  validateKanban,
  type KanbanCard,
  type KanbanColumn,
  type KanbanMove,
} from './kanban-model.js';
export type { KanbanCard, KanbanColumn, KanbanMove } from './kanban-model.js';
export interface KanbanProps {
  label: string;
  cards: readonly KanbanCard[];
  columns: readonly KanbanColumn[];
  onMove?: (columns: KanbanColumn[], move: KanbanMove) => void | Promise<void>;
  readOnly?: boolean;
  loading?: boolean;
  className?: string;
}
export function Kanban({
  label,
  cards,
  columns,
  onMove,
  readOnly = false,
  loading = false,
  className,
}: KanbanProps) {
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState<KanbanMove | null>(null);
  const [notice, setNotice] = useState('');
  const busy = useRef(false);
  const [actions, setActions] = useState<string | null>(null);
  const dragged = useRef<string | null>(null);
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const invalid = validateKanban(cards, columns);
  const locked = readOnly || pending || loading || !onMove;
  async function move(request: KanbanMove) {
    if (locked || busy.current) return;
    let next: KanbanColumn[];
    try {
      next = moveKanbanCard(cards, columns, request);
    } catch (error) {
      setError((error as Error).message);
      return;
    }
    if (JSON.stringify(next) === JSON.stringify(columns)) return;
    busy.current = true;
    setPending(true);
    setError('');
    setRetry(null);
    try {
      await onMove?.(next, request);
      setNotice(`已移动 ${cards.find((card) => card.id === request.cardId)?.title}`);
      requestAnimationFrame(() => handles.current.get(request.cardId)?.focus());
    } catch (error) {
      setError(error instanceof Error ? error.message : '移动保存失败');
      setRetry(request);
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  function step(cardId: string, columnIndex: number, direction: 'up' | 'down' | 'left' | 'right') {
    const column = columns[columnIndex];
    const index = column.cardIds.indexOf(cardId);
    if (direction === 'up' && index > 0)
      void move({ cardId, columnId: column.id, beforeId: column.cardIds[index - 1] });
    if (direction === 'down' && index < column.cardIds.length - 1)
      void move({ cardId, columnId: column.id, beforeId: column.cardIds[index + 2] });
    const target =
      columns[columnIndex + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0)];
    if ((direction === 'left' || direction === 'right') && target)
      void move({ cardId, columnId: target.id });
  }
  return (
    <section
      aria-label={label}
      data-slot="kanban"
      className={cn('grid min-w-0 gap-[var(--rui-content-gap)]', className)}
    >
      <h3 className="text-sm font-medium">{label}</h3>
      <Input
        aria-label="筛选卡片"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索标题或描述"
      />
      <p className="text-xs text-muted-foreground">聚焦卡片后 Alt+上下排序，Alt+左右跨列移动。</p>
      {invalid ? (
        <p role="alert">{invalid}</p>
      ) : loading ? (
        <p role="status">正在加载看板…</p>
      ) : (
        <div
          role="region"
          aria-label="看板列滚动区域"
          tabIndex={0}
          className="flex min-w-0 gap-[var(--rui-content-gap)] overflow-x-auto pb-[var(--rui-space-2)] outline-none focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring"
        >
          {columns.map((column, columnIndex) => {
            const visible = column.cardIds
              .map((id) => cards.find((card) => card.id === id)!)
              .filter((card) =>
                `${card.title} ${card.description ?? ''}`
                  .toLocaleLowerCase()
                  .includes(query.toLocaleLowerCase()),
              );
            return (
              <section
                key={column.id}
                aria-label={column.title}
                className="w-64 shrink-0 rounded-md border border-border bg-card p-[var(--rui-content-padding)]"
                onDragOver={(event) => {
                  if (dragged.current && !locked && !column.disabled) event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragged.current) void move({ cardId: dragged.current, columnId: column.id });
                  dragged.current = null;
                }}
              >
                <h4 className="mb-[var(--rui-content-gap)] text-sm font-medium">
                  {column.title} · {visible.length}/{column.cardIds.length}
                </h4>
                <ol className="grid gap-[var(--rui-content-gap-sm)]">
                  {visible.map((card) => (
                    <li
                      key={card.id}
                      className="rounded-md border border-border bg-background p-[var(--rui-content-padding)]"
                      onDragOver={(event) => {
                        if (dragged.current && !locked && !column.disabled) event.preventDefault();
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (dragged.current)
                          void move({
                            cardId: dragged.current,
                            columnId: column.id,
                            beforeId: card.id,
                          });
                        dragged.current = null;
                      }}
                    >
                      <Button
                        ref={(node) => {
                          if (node) handles.current.set(card.id, node);
                          else handles.current.delete(card.id);
                        }}
                        variant="ghost"
                        className="h-auto w-full justify-start border-0 px-0 whitespace-normal text-left"
                        aria-label={`移动 ${card.title}`}
                        aria-expanded={actions === card.id}
                        onClick={() =>
                          setActions((current) => (current === card.id ? null : card.id))
                        }
                        disabled={locked || card.disabled || column.disabled}
                        draggable={!locked && !card.disabled && !column.disabled}
                        onDragStart={(event) => {
                          dragged.current = card.id;
                          event.dataTransfer.setData('text/plain', card.id);
                          event.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={() => {
                          dragged.current = null;
                        }}
                        onKeyDown={(event) => {
                          if (!event.altKey || event.nativeEvent.isComposing) return;
                          const direction = (
                            {
                              ArrowUp: 'up',
                              ArrowDown: 'down',
                              ArrowLeft: 'left',
                              ArrowRight: 'right',
                            } as const
                          )[event.key as 'ArrowUp'];
                          if (direction) {
                            event.preventDefault();
                            event.stopPropagation();
                            step(card.id, columnIndex, direction);
                          }
                        }}
                      >
                        {card.title}
                      </Button>
                      {card.description && (
                        <p className="mt-[var(--rui-space-1)] break-words text-xs text-muted-foreground">
                          {card.description}
                        </p>
                      )}
                      {actions === card.id && (
                        <div
                          aria-label={`${card.title}移动操作`}
                          className="mt-[var(--rui-space-2)] flex flex-wrap gap-[var(--rui-space-1)]"
                        >
                          {(['up', 'down', 'left', 'right'] as const).map((direction) => (
                            <Button
                              key={direction}
                              size="xs"
                              variant="outline"
                              disabled={
                                locked ||
                                card.disabled ||
                                column.disabled ||
                                (direction === 'up' && column.cardIds[0] === card.id) ||
                                (direction === 'down' && column.cardIds.at(-1) === card.id) ||
                                (direction === 'left' && columnIndex === 0) ||
                                (direction === 'right' && columnIndex === columns.length - 1)
                              }
                              onClick={() => step(card.id, columnIndex, direction)}
                            >
                              {
                                { up: '上移', down: '下移', left: '上一列', right: '下一列' }[
                                  direction
                                ]
                              }
                            </Button>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
                {!visible.length && (
                  <p className="text-xs text-muted-foreground">
                    {column.cardIds.length ? '没有匹配卡片' : '暂无卡片'}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}
      {error && (
        <div className="flex flex-wrap gap-[var(--rui-content-gap-sm)]">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          {retry && (
            <Button disabled={locked} onClick={() => void move(retry)}>
              重试移动
            </Button>
          )}
        </div>
      )}
      <p role="status" className="text-xs text-muted-foreground">
        {pending ? '正在保存移动…' : notice}
      </p>
    </section>
  );
}
