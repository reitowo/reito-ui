import { useMemo, useState } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';

export type ReviewRisk = 'high' | 'medium' | 'low';
export type ReviewFilter = 'all' | 'high' | 'unsure';
export type ReviewItem = {
  id: string;
  title: string;
  agent: string;
  model?: string;
  type: string;
  risk: ReviewRisk;
  confidence: number;
  createdAt: number;
  reasoning?: string;
  body?: string;
};
export type ReviewDecision = { decision: 'approved' | 'rejected'; reason?: string; text?: string };
export type ReviewCenterProps = {
  items: ReviewItem[];
  onDecide?: (item: ReviewItem, result: ReviewDecision) => void;
  onUndo?: (item: ReviewItem, result: ReviewDecision) => void;
  onSkip?: (item: ReviewItem) => void;
  reviewed?: number;
  total?: number;
  lowConfidence?: number;
  reasons?: string[];
  order?: 'risk' | 'oldest' | 'given';
  filter?: ReviewFilter;
  defaultFilter?: ReviewFilter;
  onFilterChange?: (filter: ReviewFilter) => void;
  title?: string;
  className?: string;
};

const riskWeight = { high: 0, medium: 1, low: 2 };
const riskLabel = { high: '高风险', medium: '中风险', low: '低风险' };

/** Recreated from public Review Center docs. One item at a time. */
export function ReviewCenter({
  items,
  onDecide,
  onUndo,
  onSkip,
  reviewed = 0,
  total,
  lowConfidence = 0.7,
  reasons = ['信息不准确', '语气', '不允许', '其他'],
  order = 'risk',
  filter,
  defaultFilter = 'all',
  onFilterChange,
  title = '审查中心',
  className,
}: ReviewCenterProps) {
  const [internalFilter, setInternalFilter] = useState(defaultFilter);
  const [hidden, setHidden] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [last, setLast] = useState<{ item: ReviewItem; result: ReviewDecision } | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [count, setCount] = useState(reviewed);
  const currentFilter = filter ?? internalFilter;

  const queue = useMemo(() => {
    const visible = items.filter((item) => !hidden.includes(item.id));
    const filtered = visible.filter((item) => {
      if (currentFilter === 'high') return item.risk === 'high';
      if (currentFilter === 'unsure') return item.confidence < lowConfidence;
      return true;
    });
    if (order === 'given') return filtered;
    return filtered.slice().sort((a, b) => {
      if (order === 'oldest') return a.createdAt - b.createdAt;
      return riskWeight[a.risk] - riskWeight[b.risk] || a.createdAt - b.createdAt;
    });
  }, [items, hidden, currentFilter, lowConfidence, order]);

  const current = queue[Math.min(index, Math.max(0, queue.length - 1))];
  const totalCount = total ?? reviewed + items.length;

  function setFilterValue(next: ReviewFilter) {
    if (filter === undefined) setInternalFilter(next);
    onFilterChange?.(next);
    setIndex(0);
  }

  function decide(item: ReviewItem, result: ReviewDecision) {
    onDecide?.(item, result);
    setLast({ item, result });
    setHidden((currentHidden) => [...currentHidden, item.id]);
    setCount((value) => value + 1);
    setRejecting(false);
    setIndex(0);
  }

  return (
    <section
      aria-label={title}
      className={cn(
        'grid min-w-0 gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
      onKeyDown={(event) => {
        if (!current) return;
        if (event.key === 'a' || event.key === 'A') decide(current, { decision: 'approved' });
        if (event.key === 'r' || event.key === 'R') setRejecting(true);
        if (event.key === 's' || event.key === 'S') {
          onSkip?.(current);
          setIndex((value) => Math.min(queue.length - 1, value + 1));
        }
        if (event.key === 'j' || event.key === 'J' || event.key === 'ArrowDown')
          setIndex((value) => Math.min(queue.length - 1, value + 1));
        if (event.key === 'k' || event.key === 'K' || event.key === 'ArrowUp')
          setIndex((value) => Math.max(0, value - 1));
        if ((event.key === 'z' || event.key === 'Z') && last) {
          onUndo?.(last.item, last.result);
          setHidden((currentHidden) => currentHidden.filter((id) => id !== last.item.id));
          setLast(null);
        }
      }}
      tabIndex={0}
    >
      <Inline className="justify-between">
        <Heading size="item">{title}</Heading>
        <Text as="span" variant="caption" tone="muted">
          已审查 {count} / {totalCount}
        </Text>
      </Inline>
      <Inline>
        {(['all', 'high', 'unsure'] as const).map((item) => (
          <Button
            key={item}
            type="button"
            size="xs"
            variant={item === currentFilter ? 'secondary' : 'ghost'}
            onClick={() => setFilterValue(item)}
          >
            {item === 'all' ? '全部' : item === 'high' ? '高风险' : '不确定'}
          </Button>
        ))}
      </Inline>
      <div className="grid gap-[var(--rui-content-gap)] md:grid-cols-[minmax(0,var(--rui-container-xs))_minmax(0,1fr)]">
        <ol className="grid content-start gap-1">
          {queue.map((item, itemIndex) => (
            <li key={item.id}>
              <button
                type="button"
                aria-current={item.id === current?.id}
                className={cn(
                  'w-full rounded-[var(--rui-radius)] px-2 py-1 text-left text-[length:var(--rui-font-caption)]',
                  item.id === current?.id ? 'bg-muted' : 'hover:bg-muted/60',
                )}
                onClick={() => setIndex(itemIndex)}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ol>
        {current ? (
          <Stack>
            <Inline>
              <Heading size="item">{current.title}</Heading>
              <Badge variant={current.risk === 'high' ? 'destructive' : 'secondary'}>
                {riskLabel[current.risk]}
              </Badge>
            </Inline>
            <Text variant="caption" tone="muted">
              {current.agent}
              {current.model ? ` · ${current.model}` : ''} · {current.type}
            </Text>
            {current.reasoning ? <Text variant="interface">{current.reasoning}</Text> : null}
            {current.body ? (
              <pre className="overflow-auto rounded-[var(--rui-radius)] bg-muted p-[var(--rui-content-padding)] font-mono text-[length:var(--rui-font-caption)]">
                {current.body}
              </pre>
            ) : null}
            {rejecting ? (
              <Inline>
                {reasons.map((reason, reasonIndex) => (
                  <Button
                    key={reason}
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-keyshortcuts={String(reasonIndex + 1)}
                    onClick={() => decide(current, { decision: 'rejected', reason })}
                  >
                    {reasonIndex + 1} {reason}
                  </Button>
                ))}
              </Inline>
            ) : (
              <Inline>
                <Button
                  type="button"
                  size="sm"
                  aria-keyshortcuts="A"
                  onClick={() => decide(current, { decision: 'approved' })}
                >
                  批准
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-keyshortcuts="R"
                  onClick={() => setRejecting(true)}
                >
                  拒绝
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-keyshortcuts="S"
                  onClick={() => {
                    onSkip?.(current);
                    setIndex((value) => Math.min(queue.length - 1, value + 1));
                  }}
                >
                  跳过
                </Button>
              </Inline>
            )}
          </Stack>
        ) : (
          <Text variant="caption" tone="muted">
            队列已清空。
          </Text>
        )}
      </div>
    </section>
  );
}
