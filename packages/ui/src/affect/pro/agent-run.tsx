import { useEffect, useState } from 'react';
import { tokenMetrics } from '@reito/tokens/metrics';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Button } from '../../primitives/button.js';
import { AgentPlan, type PlanStep } from './agent-plan.js';
import { ApprovalCard } from './approval-card.js';
import { InlineDiff } from './inline-diff.js';
import { ToolCallCard } from '../tool-call-card.js';
import { ThinkingLoader } from '../thinking-loader.js';
import { AppShellWorkspace, type AppShellProps } from './app-shell.js';

export type RunToolCall = {
  name: string;
  summary: string;
  icon?: string;
  args?: unknown;
  result?: unknown;
  duration?: number;
};
export type RunApproval = {
  title: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  details?: { label: string; value: string }[];
};
export type RunStep = {
  id: string;
  title: string;
  detail?: string;
  tool?: string;
  calls?: RunToolCall[];
  approval?: RunApproval;
};
export type AgentRunScreenProps = Pick<
  AppShellProps,
  'onNavigate' | 'workspace' | 'user' | 'className'
> & {
  title?: string;
  steps?: RunStep[];
  draft?: { original: string; suggested: string; label?: string };
  agent?: string;
  autoRun?: boolean;
  onApprove?: (stepId: string) => void;
  onDeny?: (stepId: string) => void;
  onStop?: () => void;
  onDone?: () => void;
};

const defaultRunSteps: RunStep[] = [
  {
    id: 'collect',
    title: '收集材料',
    detail: '读取本地示例备忘',
    tool: 'files',
    calls: [{ name: 'read', summary: 'board-memo.md', duration: 4 }],
  },
  {
    id: 'draft',
    title: '起草备忘',
    detail: '生成董事会更新草稿',
    tool: 'write',
    approval: {
      title: '发送董事会备忘',
      description: '将覆盖共享文档中的草稿。',
      risk: 'medium',
      details: [{ label: '范围', value: '只读示例' }],
    },
  },
  { id: 'publish', title: '整理附录', detail: '附上指标表' },
];

const defaultRunDraft = {
  original: '本季度进展平稳，细节稍后补充。',
  suggested: '本季度通过率升至 96%，等待审查的项减少 3 个。',
  label: '董事会备忘 · Q3',
};

/** Recreated from public Agent Run docs. Not Pro source. */
export function AgentRunScreen({
  title = '准备三季度董事会更新',
  steps = defaultRunSteps,
  draft = defaultRunDraft,
  agent = 'Board prep',
  autoRun = true,
  onApprove,
  onDeny,
  onStop,
  onDone,
  onNavigate,
  workspace = 'Acme',
  user = { name: 'Alex Morgan' },
  className,
}: AgentRunScreenProps) {
  const [cursor, setCursor] = useState(0);
  const [denied, setDenied] = useState(false);
  const [done, setDone] = useState(false);
  const current = steps[Math.min(cursor, steps.length - 1)];
  const plan: PlanStep[] = steps.map((step, index) => ({
    id: step.id,
    title: step.title,
    detail: step.detail,
    tool: step.tool,
    status:
      denied && index >= cursor
        ? 'error'
        : index < cursor || done
          ? 'success'
          : index === cursor
            ? 'running'
            : 'pending',
  }));

  useEffect(() => {
    if (!autoRun || denied || done) return;
    if (current?.approval) return;
    const timer = window.setTimeout(() => {
      if (cursor >= steps.length - 1) {
        setDone(true);
        onDone?.();
        return;
      }
      setCursor((value) => value + 1);
    }, tokenMetrics['motion-duration-lg'] * 2);
    return () => window.clearTimeout(timer);
  }, [autoRun, cursor, current, denied, done, onDone, steps.length]);

  return (
    <AppShellWorkspace
      active="New chat"
      workspace={workspace}
      user={user}
      onNavigate={onNavigate}
      header={{
        title,
        actions: (
          <Inline>
            <Badge variant="secondary">{agent}</Badge>
            <Button type="button" size="xs" variant="ghost" onClick={onStop}>
              停止
            </Button>
          </Inline>
        ),
      }}
      panelTitle={draft.label ?? '草稿'}
      panel={
        <div className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
          <Heading size="item">{draft.label ?? '草稿'}</Heading>
          <InlineDiff original={draft.original} suggested={draft.suggested} label={draft.label} />
        </div>
      }
      className={className}
    >
      <div className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)] @lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="grid gap-[var(--rui-content-gap)]">
          <Heading size="item">{title}</Heading>
          {!done && !denied ? (
            <ThinkingLoader phases={['执行步骤', '调用工具', '等待确认']} done={done} />
          ) : null}
          <AgentPlan title="计划" steps={plan} status={done ? 'done' : 'running'} />
          <Text variant="caption" tone="muted" aria-live="polite">
            {done
              ? '全部完成'
              : denied
                ? `已在 ${current?.title ?? ''} 停下`
                : `当前：${current?.title ?? ''}`}
          </Text>
        </section>
        <section className="grid gap-[var(--rui-content-gap)]">
          {current?.calls?.map((call) => (
            <ToolCallCard
              key={call.name}
              name={call.name}
              summary={call.summary}
              status={done || cursor > 0 ? 'success' : 'running'}
              args={call.args}
              result={call.result}
              duration={call.duration}
            />
          ))}
          {current?.approval ? (
            <ApprovalCard
              title={current.approval.title}
              description={current.approval.description}
              risk={current.approval.risk}
              details={current.approval.details}
              shortcuts
              onApprove={() => {
                onApprove?.(current.id);
                if (cursor >= steps.length - 1) {
                  setDone(true);
                  onDone?.();
                } else setCursor((value) => value + 1);
              }}
              onDeny={() => {
                setDenied(true);
                onDeny?.(current.id);
              }}
            />
          ) : null}
        </section>
      </div>
    </AppShellWorkspace>
  );
}
