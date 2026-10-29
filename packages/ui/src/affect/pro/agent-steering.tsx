import { useId, useState } from 'react';
import { Check, Pause, Play, X } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Textarea } from '../../primitives/textarea.js';
import { cn } from '../../lib/utils.js';
import { formatDuration, useTickingNow } from '../shared.js';

export type SteerNote = { id: string; text: string; picked?: 'next' | 'now' };
export type SteerStep = {
  id: string;
  title: string;
  status?: 'done' | 'active' | 'pending';
  duration?: number;
  startedAt?: number;
  notes?: SteerNote[];
};
export type AgentSteeringProps = {
  title: string;
  agent?: string;
  steps: SteerStep[];
  queue?: SteerNote[];
  status?: 'running' | 'paused' | 'done';
  startedAt?: number | Date;
  onQueue?: (text: string) => void;
  onInterrupt?: (text: string, queuedId?: string) => void;
  onRemove?: (id: string) => void;
  onPause?: () => void;
  onResume?: () => void;
  draft?: string;
  onDraftChange?: (text: string) => void;
  placeholder?: string;
  className?: string;
};

/** Recreated from public Agent Steering docs. Not Pro source. */
export function AgentSteering({
  title,
  agent,
  steps,
  queue = [],
  status = 'running',
  startedAt,
  onQueue,
  onInterrupt,
  onRemove,
  onPause,
  onResume,
  draft,
  onDraftChange,
  placeholder = '引导代理…',
  className,
}: AgentSteeringProps) {
  const hintId = useId();
  const [internalDraft, setInternalDraft] = useState('');
  const [localQueue, setLocalQueue] = useState<SteerNote[]>([]);
  const [live, setLive] = useState('');
  const text = draft ?? internalDraft;
  const waiting = queue.length ? queue : localQueue;
  const start = startedAt instanceof Date ? startedAt.getTime() : startedAt;
  const clock = useTickingNow(status === 'running', undefined);
  const elapsed = start ? Math.max(0, Math.round((clock - start) / 1000)) : 0;

  function setText(next: string) {
    if (draft === undefined) setInternalDraft(next);
    onDraftChange?.(next);
  }

  function queueNote(value: string) {
    const note = value.trim();
    if (!note) return;
    onQueue?.(note);
    if (!queue.length) {
      setLocalQueue((current) => [...current, { id: `note-${current.length + 1}`, text: note }]);
    }
    setLive(`已排队：${note}`);
    setText('');
  }

  function interrupt(value: string, queuedId?: string) {
    const note = value.trim();
    if (!note) return;
    onInterrupt?.(note, queuedId);
    if (queuedId) setLocalQueue((current) => current.filter((item) => item.id !== queuedId));
    setLive(`已立即应用：${note}`);
    setText('');
  }

  return (
    <section
      aria-label={title}
      className={cn(
        'grid max-w-md gap-[var(--rui-content-gap)] rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Inline className="justify-between">
        <Stack gap="none">
          <Heading size="item">{title}</Heading>
          <Text variant="caption" tone="muted">
            {status === 'running'
              ? `运行中 · ${formatDuration(elapsed)}`
              : status === 'paused'
                ? '已暂停'
                : '已完成'}
            {agent ? ` · ${agent}` : ''}
          </Text>
        </Stack>
        {status !== 'done' && (onPause || onResume) ? (
          <Button
            type="button"
            size="xs"
            variant="ghost"
            aria-label={status === 'running' ? '暂停' : '继续'}
            onClick={status === 'running' ? onPause : onResume}
          >
            {status === 'running' ? <Pause className="size-3" /> : <Play className="size-3" />}
            {status === 'running' ? '暂停' : '继续'}
          </Button>
        ) : null}
      </Inline>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      <ol aria-label="计划" className="grid gap-[var(--rui-content-gap-sm)]">
        {steps.map((step, index) => (
          <li
            key={step.id}
            aria-current={step.status === 'active' ? 'step' : undefined}
            className="grid gap-1"
          >
            <Inline>
              <span className="grid size-6 place-items-center rounded-full border border-border text-[length:var(--rui-font-caption)]">
                {step.status === 'done' ? <Check className="size-3 text-success" /> : index + 1}
              </span>
              <Text as="span" variant="interface">
                {step.title}
              </Text>
              {step.duration != null ? (
                <Text as="span" variant="caption" tone="muted">
                  {formatDuration(Math.round(step.duration / 1000))}
                </Text>
              ) : null}
            </Inline>
            {step.notes?.length ? (
              <ul className="ml-8 grid gap-1">
                {step.notes.map((note) => (
                  <li
                    key={note.id}
                    className="text-[length:var(--rui-font-caption)] text-muted-foreground"
                  >
                    {note.picked === 'now' ? '立即：' : '下一步：'}
                    {note.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
      {status !== 'done' ? (
        <Stack gap="small">
          {waiting.length ? (
            <ul className="grid gap-1">
              {waiting.map((note) => (
                <li
                  key={note.id}
                  className="flex items-center justify-between gap-2 rounded-[var(--rui-radius)] bg-muted px-2 py-1"
                >
                  <Text as="span" variant="caption">
                    {note.text}
                  </Text>
                  <Inline>
                    {onInterrupt ? (
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        onClick={() => interrupt(note.text, note.id)}
                      >
                        现在
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label={`移除「${note.text}」`}
                      onClick={() => {
                        onRemove?.(note.id);
                        setLocalQueue((current) => current.filter((item) => item.id !== note.id));
                      }}
                    >
                      <X />
                    </Button>
                  </Inline>
                </li>
              ))}
            </ul>
          ) : null}
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={placeholder}
            aria-label="引导代理"
            aria-describedby={hintId}
            rows={2}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setText('');
              if (event.key === 'Enter' && event.shiftKey) return;
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                interrupt(text);
              } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault();
                queueNote(text);
              }
            }}
          />
          <Text id={hintId} variant="caption" tone="muted">
            ↵ 排队到下一步{onInterrupt ? ' · ⌘↵ 立即应用' : ''}
          </Text>
        </Stack>
      ) : null}
    </section>
  );
}
