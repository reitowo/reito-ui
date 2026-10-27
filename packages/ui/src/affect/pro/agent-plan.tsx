import { useState } from 'react';
import { GripVertical, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Input } from '../../primitives/input.js';
import { cn } from '../../lib/utils.js';
import { formatDuration } from '../shared.js';

export type PlanStepStatus = 'pending' | 'running' | 'success' | 'error';
export type PlanStep = {
  id: string;
  title: string;
  detail?: string;
  tool?: string;
  status?: PlanStepStatus;
  duration?: number;
  error?: string;
};
export type AgentPlanProps = {
  steps?: PlanStep[];
  defaultSteps?: PlanStep[];
  status?: 'draft' | 'running' | 'done';
  onChange?: (steps: PlanStep[]) => void;
  onRun?: (steps: PlanStep[]) => void;
  onCancel?: () => void;
  onRetry?: (stepId: string) => void;
  title?: string;
  estimate?: string;
  className?: string;
};

/** Recreated from public Agent Plan docs. Editing is draft-only. */
export function AgentPlan({
  steps,
  defaultSteps = [],
  status = 'draft',
  onChange,
  onRun,
  onCancel,
  onRetry,
  title = '代理计划',
  estimate,
  className,
}: AgentPlanProps) {
  const [internal, setInternal] = useState(defaultSteps);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [live, setLive] = useState('');
  const items = steps ?? internal;
  const editable = status === 'draft';

  function commit(next: PlanStep[]) {
    if (steps === undefined) setInternal(next);
    onChange?.(next);
  }

  function move(id: string, delta: number) {
    const index = items.findIndex((item) => item.id === id);
    const nextIndex = index + delta;
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return;
    const next = items.slice();
    const [removed] = next.splice(index, 1);
    next.splice(nextIndex, 0, removed!);
    commit(next);
    setLive(`已将「${removed!.title}」移到第 ${nextIndex + 1} 步，共 ${next.length} 步`);
  }

  return (
    <section
      aria-label={title}
      className={cn(
        'rounded-[var(--rui-radius-surface)] border border-border bg-card p-[var(--rui-content-padding)]',
        className,
      )}
    >
      <Stack>
        <Inline className="justify-between">
          <Heading size="item">{title}</Heading>
          {estimate ? (
            <Text as="span" variant="caption" tone="muted">
              {estimate}
            </Text>
          ) : null}
        </Inline>
        <p className="sr-only" aria-live="polite">
          {live}
        </p>
        <ol className="grid gap-[var(--rui-content-gap-sm)]">
          {items.map((step, index) => (
            <li key={step.id} className="flex min-w-0 items-start gap-2">
              <span className="mt-1 size-6 shrink-0 rounded-full border border-border text-center text-[length:var(--rui-font-caption)]">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                {editing === step.id && editable ? (
                  <Input
                    aria-label={`重命名 ${step.title}`}
                    defaultValue={step.title}
                    autoFocus
                    onBlur={(event) => {
                      commit(
                        items.map((item) =>
                          item.id === step.id
                            ? { ...item, title: event.target.value || item.title }
                            : item,
                        ),
                      );
                      setEditing(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur();
                      if (event.key === 'Escape') setEditing(null);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="text-left text-[length:var(--rui-font-interface)] underline-offset-4 hover:underline"
                    aria-current={step.status === 'running' ? 'step' : undefined}
                    onClick={() => editable && setEditing(step.id)}
                    onKeyDown={(event) => {
                      if (!editable) return;
                      if (event.altKey && event.key === 'ArrowUp') {
                        event.preventDefault();
                        move(step.id, -1);
                      }
                      if (event.altKey && event.key === 'ArrowDown') {
                        event.preventDefault();
                        move(step.id, 1);
                      }
                      if (event.key === 'Delete')
                        commit(items.filter((item) => item.id !== step.id));
                    }}
                  >
                    {step.title}
                  </button>
                )}
                {step.detail ? (
                  <Text variant="caption" tone="muted">
                    {step.detail}
                    {step.tool ? ` · ${step.tool}` : ''}
                  </Text>
                ) : null}
                {step.status === 'error' ? (
                  <Inline>
                    <Text as="span" variant="caption" className="text-destructive">
                      {step.error ?? '此步失败'}
                    </Text>
                    {onRetry ? (
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        onClick={() => onRetry(step.id)}
                      >
                        <RotateCcw className="size-3" />
                        从此步重试
                      </Button>
                    ) : null}
                  </Inline>
                ) : step.duration != null ? (
                  <Text variant="caption" tone="muted">
                    {formatDuration(Math.round(step.duration / 1000))}
                  </Text>
                ) : null}
              </div>
              {editable ? (
                <Inline>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`上移 ${step.title}`}
                    onClick={() => move(step.id, -1)}
                  >
                    <GripVertical />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`删除步骤：${step.title}`}
                    onClick={() => commit(items.filter((item) => item.id !== step.id))}
                  >
                    <Trash2 />
                  </Button>
                </Inline>
              ) : null}
            </li>
          ))}
        </ol>
        {editable ? (
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const titleText = draft.trim();
              if (!titleText) return;
              commit([
                ...items,
                { id: `step-${items.length + 1}`, title: titleText, status: 'pending' },
              ]);
              setDraft('');
              setLive(`已添加「${titleText}」`);
            }}
          >
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="添加步骤"
              aria-label="添加步骤"
            />
            <Button type="submit" size="sm" variant="outline">
              <Plus />
              添加
            </Button>
          </form>
        ) : null}
        <Inline>
          {status === 'draft' ? (
            <>
              {onCancel ? (
                <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
                  取消
                </Button>
              ) : null}
              <Button type="button" size="sm" onClick={() => onRun?.(items)}>
                运行计划
              </Button>
            </>
          ) : (
            <Text as="span" variant="caption" tone="muted">
              {status === 'running'
                ? `运行中 · ${items.filter((item) => item.status === 'success').length} / ${items.length}`
                : '已完成'}
            </Text>
          )}
        </Inline>
      </Stack>
    </section>
  );
}
