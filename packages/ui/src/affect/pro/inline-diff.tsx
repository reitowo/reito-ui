import { useEffect, useImperativeHandle, useMemo, useState, type Ref } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Inline, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { cn } from '../../lib/utils.js';

export type DiffSegment =
  | { type: 'equal'; text: string }
  | { type: 'change'; remove: string; insert: string };
export type InlineDiffHandle = {
  highlight: (index: number | null) => void;
  accept: (index: number) => void;
  reject: (index: number) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  undo: () => void;
  reset: () => void;
};
export type InlineDiffProps = {
  original?: string;
  suggested?: string;
  changes?: DiffSegment[];
  onChange?: (text: string) => void;
  onDone?: (text: string) => void;
  label?: string;
  ref?: Ref<InlineDiffHandle>;
  className?: string;
};

function tokenize(text: string) {
  return text.split(/(\s+)/).filter(Boolean);
}

/** Word-level diff used when original/suggested are passed. */
export function diffWords(original: string, suggested: string): DiffSegment[] {
  const left = tokenize(original);
  const right = tokenize(suggested);
  const rows = left.length;
  const cols = right.length;
  const table: number[][] = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0));
  for (let i = rows - 1; i >= 0; i -= 1) {
    for (let j = cols - 1; j >= 0; j -= 1) {
      table[i]![j] =
        left[i] === right[j]
          ? (table[i + 1]![j + 1] ?? 0) + 1
          : Math.max(table[i + 1]![j] ?? 0, table[i]![j + 1] ?? 0);
    }
  }
  const raw: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < rows || j < cols) {
    if (i < rows && j < cols && left[i] === right[j]) {
      raw.push({ type: 'equal', text: left[i]! });
      i += 1;
      j += 1;
    } else if (j < cols && (i === rows || (table[i]![j + 1] ?? 0) >= (table[i + 1]![j] ?? 0))) {
      raw.push({ type: 'change', remove: '', insert: right[j]! });
      j += 1;
    } else {
      raw.push({ type: 'change', remove: left[i]!, insert: '' });
      i += 1;
    }
  }
  const merged: DiffSegment[] = [];
  for (const part of raw) {
    const last = merged[merged.length - 1];
    if (part.type === 'equal' && last?.type === 'equal') last.text += part.text;
    else if (part.type === 'change' && last?.type === 'change') {
      last.remove += part.remove;
      last.insert += part.insert;
    } else merged.push({ ...part });
  }
  return merged.filter((part) => (part.type === 'equal' ? part.text : part.remove || part.insert));
}

function assemble(parts: DiffSegment[], decisions: Record<number, 'accept' | 'reject'>) {
  return parts
    .map((part, index) => {
      if (part.type === 'equal') return part.text;
      const decision = decisions[index];
      if (decision === 'accept') return part.insert;
      return part.remove;
    })
    .join('');
}

/** Recreated from public Inline Diff docs. Not Pro source. */
export function InlineDiff({
  original = '',
  suggested = '',
  changes,
  onChange,
  onDone,
  label,
  ref,
  className,
}: InlineDiffProps) {
  const parts = useMemo(
    () => changes ?? diffWords(original, suggested),
    [changes, original, suggested],
  );
  const changeIndexes = useMemo(
    () => parts.flatMap((part, index) => (part.type === 'change' ? [index] : [])),
    [parts],
  );
  const [decisions, setDecisions] = useState<Record<number, 'accept' | 'reject'>>({});
  const [focus, setFocus] = useState<number | null>(changeIndexes[0] ?? null);
  const [history, setHistory] = useState<Record<number, 'accept' | 'reject'>[]>([]);
  const [live, setLive] = useState('');
  const pending = changeIndexes.filter((index) => !decisions[index]);
  const text = assemble(parts, decisions);

  useEffect(() => {
    onChange?.(text);
    if (!pending.length && changeIndexes.length) onDone?.(text);
  }, [text, pending.length, changeIndexes.length, onChange, onDone]);

  function decide(index: number, decision: 'accept' | 'reject') {
    if (parts[index]?.type !== 'change' || decisions[index]) return;
    const next = { ...decisions, [index]: decision };
    setHistory((current) => [...current, decisions]);
    setDecisions(next);
    const left = changeIndexes.filter((item) => item !== index && !next[item]);
    setFocus(left[0] ?? null);
    setLive(`${decision === 'accept' ? '已接受' : '已拒绝'}，还剩 ${left.length} 处`);
  }

  function undo() {
    const previous = history[history.length - 1];
    if (!previous) return;
    setDecisions(previous);
    setHistory((current) => current.slice(0, -1));
    setFocus(changeIndexes.find((index) => !previous[index]) ?? null);
    setLive('已撤销上一处决定');
  }

  useImperativeHandle(ref, () => ({
    highlight: setFocus,
    accept: (index) => decide(index, 'accept'),
    reject: (index) => decide(index, 'reject'),
    acceptAll: () => {
      const next = { ...decisions };
      for (const index of pending) next[index] = 'accept';
      setHistory((current) => [...current, decisions]);
      setDecisions(next);
      setFocus(null);
      setLive('已全部接受');
    },
    rejectAll: () => {
      const next = { ...decisions };
      for (const index of pending) next[index] = 'reject';
      setHistory((current) => [...current, decisions]);
      setDecisions(next);
      setFocus(null);
      setLive('已全部拒绝');
    },
    undo,
    reset: () => {
      setDecisions({});
      setHistory([]);
      setFocus(changeIndexes[0] ?? null);
    },
  }));

  function step(delta: number) {
    if (!pending.length) return;
    const current = focus != null ? pending.indexOf(focus) : 0;
    const next = pending[(current + delta + pending.length) % pending.length];
    setFocus(next ?? null);
  }

  return (
    <section
      className={cn(
        'grid gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      {label ? (
        <Text variant="caption" tone="muted">
          {label}
        </Text>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      <p className="text-[length:var(--rui-font-reading)] leading-[var(--rui-line-reading)]">
        {parts.map((part, index) => {
          if (part.type === 'equal') return <span key={index}>{part.text}</span>;
          const decision = decisions[index];
          const order = changeIndexes.indexOf(index) + 1;
          if (decision === 'accept') return <span key={index}>{part.insert}</span>;
          if (decision === 'reject') return <span key={index}>{part.remove}</span>;
          return (
            <button
              key={index}
              type="button"
              className={cn(
                'rounded-sm px-0.5 focus-visible:outline-[length:var(--rui-focus-width)] focus-visible:outline-ring',
                focus === index && 'ring-[length:var(--rui-focus-width)] ring-ring',
              )}
              aria-label={`建议 ${order} / ${changeIndexes.length}：用「${part.insert}」替换「${part.remove}」。Y 接受，N 拒绝`}
              onClick={() => setFocus(index)}
              onKeyDown={(event) => {
                if (event.key === 'y' || event.key === 'Y' || event.key === 'Enter')
                  decide(index, 'accept');
                if (event.key === 'n' || event.key === 'N' || event.key === 'Backspace')
                  decide(index, 'reject');
                if (event.key === 'Escape') setFocus(null);
              }}
            >
              {part.remove ? (
                <span className="bg-destructive/15 text-destructive line-through">
                  {part.remove}
                </span>
              ) : null}
              {part.insert ? (
                <span className="bg-success/15 text-success">{part.insert}</span>
              ) : null}
            </button>
          );
        })}
      </p>
      <Inline className="justify-between">
        {pending.length ? (
          <Inline>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="上一处"
              onClick={() => step(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="下一处"
              onClick={() => step(1)}
            >
              <ChevronRight />
            </Button>
            <Button
              type="button"
              size="xs"
              onClick={() => focus != null && decide(focus, 'accept')}
            >
              接受
            </Button>
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => focus != null && decide(focus, 'reject')}
            >
              拒绝
            </Button>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => pending.forEach((index) => decide(index, 'accept'))}
            >
              全部接受
            </Button>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => pending.forEach((index) => decide(index, 'reject'))}
            >
              全部拒绝
            </Button>
          </Inline>
        ) : (
          <Inline>
            <Check className="size-4 text-success" aria-hidden="true" />
            <Text as="span" variant="interface">
              已审完全部改动
            </Text>
          </Inline>
        )}
        <Button type="button" size="xs" variant="ghost" onClick={undo} disabled={!history.length}>
          撤销
        </Button>
      </Inline>
    </section>
  );
}
