import type { ReactNode } from 'react';
import { ArrowUpRight, CircleAlert, ShieldCheck } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { classes, ExecutionIcon, executionLabels, type ExecutionStatus } from './shared.js';

export type PermissionDecision = 'pending' | 'allowed' | 'denied';
export interface PermissionRequestProps {
  title: string;
  description: string;
  detail?: ReactNode;
  decision: PermissionDecision;
  onDecision: (decision: 'allowed' | 'denied') => void;
  disabled?: boolean;
  allowLabel?: string;
  denyLabel?: string;
  className?: string;
}

export function PermissionRequest({ title, description, detail, decision, onDecision, disabled = false, allowLabel = '允许一次', denyLabel = '拒绝', className }: PermissionRequestProps) {
  return <section aria-label={`权限请求：${title}`} className={classes('grid min-w-0 gap-[var(--rui-content-gap)] rounded-lg border bg-card p-[var(--rui-content-padding)]', className)}>
    <div className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><div className="min-w-0"><h3 className="text-sm font-medium">{title}</h3><p className="mt-1 break-words text-sm leading-6 text-muted-foreground">{description}</p></div></div>
    {detail && <div className="min-w-0 rounded-md bg-muted/50 p-[var(--rui-content-gap-sm)] text-sm">{detail}</div>}
    {decision === 'pending' ? <div className="flex flex-wrap justify-end gap-2"><Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => onDecision('denied')}>{denyLabel}</Button><Button type="button" size="sm" disabled={disabled} onClick={() => onDecision('allowed')}>{allowLabel}</Button></div> : <p role="status" className="text-sm text-muted-foreground">{decision === 'allowed' ? '已允许' : '已拒绝'}</p>}
  </section>;
}

export interface TokenUsageProps {
  input?: number;
  output?: number;
  contextUsed?: number;
  contextLimit?: number;
  sourceLabel: string;
  className?: string;
}

function count(value?: number) { return value !== undefined && Number.isFinite(value) && value >= 0 ? Math.floor(value).toLocaleString('en-US') : '—'; }

/** Values must come from the caller. This component never estimates tokens from character count. */
export function TokenUsage({ input, output, contextUsed, contextLimit, sourceLabel, className }: TokenUsageProps) {
  const percent = contextUsed !== undefined && contextLimit !== undefined && Number.isFinite(contextUsed) && Number.isFinite(contextLimit) && contextUsed >= 0 && contextLimit > 0 ? Math.min(100, Math.max(0, Math.round(contextUsed / contextLimit * 100))) : undefined;
  return <section aria-label="Token 用量" className={classes('grid min-w-0 gap-[var(--rui-content-gap)] rounded-lg border p-[var(--rui-content-padding)]', className)}>
    <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-medium">Token 用量</h3><span className="ml-auto text-xs text-muted-foreground">{sourceLabel}</span></div>
    <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm"><div><dt className="text-xs text-muted-foreground">输入</dt><dd className="mt-0.5 font-mono">{count(input)}</dd></div><div><dt className="text-xs text-muted-foreground">输出</dt><dd className="mt-0.5 font-mono">{count(output)}</dd></div><div><dt className="text-xs text-muted-foreground">上下文</dt><dd className="mt-0.5 font-mono">{count(contextUsed)} / {count(contextLimit)}</dd></div></dl>
    {percent !== undefined && <div className="grid gap-1.5"><div role="progressbar" aria-label="上下文占用" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div><p className="text-xs text-muted-foreground">上下文占用 {percent}%</p></div>}
  </section>;
}

export interface AgentTaskCardProps {
  title: string;
  description?: string;
  status: ExecutionStatus | 'needs-attention';
  context?: string;
  updatedLabel?: string;
  onOpen?: () => void;
  actions?: ReactNode;
  className?: string;
}

export function AgentTaskCard({ title, description, status, context, updatedLabel, onOpen, actions, className }: AgentTaskCardProps) {
  const statusLabel = status === 'needs-attention' ? '需要处理' : executionLabels[status];
  return <article aria-label={`任务：${title}`} className={classes('grid min-w-0 gap-[var(--rui-content-gap)] rounded-lg border bg-card p-[var(--rui-content-padding)]', className)}>
    <div className="flex min-w-0 items-start gap-2">{status === 'needs-attention' ? <CircleAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : <ExecutionIcon status={status} className="mt-0.5" />}<div className="min-w-0 flex-1"><h3 className="break-words text-sm font-medium">{title}</h3>{description && <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">{description}</p>}</div>{onOpen && <Button type="button" variant="ghost" size="icon-sm" className="shrink-0" aria-label={`打开任务${title}`} onClick={onOpen}><ArrowUpRight className="size-4" aria-hidden="true" /></Button>}</div>
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><span>{statusLabel}</span>{context && <span className="min-w-0 break-all">{context}</span>}{updatedLabel && <span className="ml-auto">{updatedLabel}</span>}</div>
    {actions && <div className="flex flex-wrap gap-2 border-t pt-[var(--rui-content-gap-sm)]">{actions}</div>}
  </article>;
}
