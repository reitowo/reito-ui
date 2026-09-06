import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Clock3, ListChecks } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../primitives/collapsible.js';
import { classes, ExecutionIcon, executionLabels, type ExecutionStatus } from './shared.js';

export interface ReasoningProps {
  children: ReactNode;
  status?: 'idle' | 'running' | 'complete';
  elapsedSeconds?: number;
  title?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/** Displays caller-provided explanatory content; it does not produce or reveal model reasoning. */
export function Reasoning({ children, status = 'complete', elapsedSeconds, title = '过程说明', open, defaultOpen = false, onOpenChange, className }: ReasoningProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [measuredSeconds, setMeasuredSeconds] = useState(0);
  const start = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (status !== 'running' || elapsedSeconds !== undefined) return;
    start.current = Date.now();
    setMeasuredSeconds(0);
    const timer = setInterval(() => setMeasuredSeconds(Math.floor((Date.now() - (start.current ?? Date.now())) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [status, elapsedSeconds]);
  const suppliedSeconds = elapsedSeconds ?? measuredSeconds;
  const seconds = Number.isFinite(suppliedSeconds) ? Math.max(0, Math.floor(suppliedSeconds)) : 0;
  const expanded = open ?? internalOpen;
  return <Collapsible open={expanded} onOpenChange={next => { if (open === undefined) setInternalOpen(next); onOpenChange?.(next); }} className={classes('min-w-0', className)}>
    <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md py-[var(--rui-cell-padding-y)] text-left text-sm text-muted-foreground hover:text-foreground focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:outline-ring">
      <ChevronDown aria-hidden="true" className={classes('size-3.5 shrink-0 transition-transform motion-reduce:transition-none', !expanded && '-rotate-90')} /><span>{title}</span><span className="ml-auto flex shrink-0 items-center gap-1 text-xs"><Clock3 className="size-3" aria-hidden="true" />{status === 'running' ? `进行中 · ${seconds}s` : status === 'complete' ? `${seconds}s` : '尚未开始'}</span>
    </CollapsibleTrigger>
    <CollapsibleContent><div className="my-2 border-l pl-[var(--rui-content-padding)] text-sm leading-6 text-muted-foreground">{children}</div></CollapsibleContent>
  </Collapsible>;
}

export interface ToolCallProps {
  title: string;
  status: ExecutionStatus;
  children?: ReactNode;
  variant?: 'inline' | 'card';
  durationLabel?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRetry?: () => void;
  className?: string;
}

export function ToolCall({ title, status, children, variant = 'inline', durationLabel, open, defaultOpen = false, onOpenChange, onRetry, className }: ToolCallProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const expanded = open ?? internalOpen;
  return <Collapsible open={expanded} onOpenChange={next => { if (open === undefined) setInternalOpen(next); onOpenChange?.(next); }} className={classes('min-w-0', variant === 'card' && 'overflow-hidden rounded-lg border bg-card', className)}>
    <CollapsibleTrigger className={classes('group flex w-full min-w-0 items-center gap-2 rounded-md px-[var(--rui-content-gap-sm)] py-[var(--rui-cell-padding-y)] text-left text-sm hover:bg-muted/60 focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:outline-ring', variant === 'card' && 'px-[var(--rui-content-padding)]')}>
      <ChevronDown className={classes('size-3 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none', !expanded && '-rotate-90')} aria-hidden="true" /><ExecutionIcon status={status} /><span className="min-w-0 flex-1 break-words">{title}</span><span className={classes('shrink-0 text-xs', status === 'error' ? 'text-destructive' : 'text-muted-foreground')}>{executionLabels[status]}{durationLabel ? ` · ${durationLabel}` : ''}</span>
    </CollapsibleTrigger>
    <CollapsibleContent><div className={classes('min-w-0 px-[var(--rui-content-padding)] pb-[var(--rui-content-padding)] text-sm leading-6', variant === 'card' ? 'border-t pt-[var(--rui-content-gap-sm)]' : 'ml-3 border-l pt-2')}>
      {children || <p className="text-muted-foreground">{status === 'pending' ? '等待开始此步骤。' : status === 'running' ? '正在处理此步骤。' : status === 'success' ? '此步骤已完成。' : '此步骤失败，请查看错误信息。'}</p>}
      {status === 'error' && onRetry && <Button type="button" size="sm" variant="outline" className="mt-[var(--rui-content-gap-sm)]" onClick={onRetry}>重试此步骤</Button>}
    </div></CollapsibleContent>
  </Collapsible>;
}

export interface PlanStep { id: string; title: string; description?: string; status: ExecutionStatus }
export function PlanSteps({ steps, onStepSelect, title = '执行计划', className }: { steps: PlanStep[]; onStepSelect?: (id: string) => void; title?: string; className?: string }) {
  const completed = steps.filter(step => step.status === 'success').length;
  return <section aria-label={title} className={classes('grid min-w-0 gap-[var(--rui-content-gap)]', className)}>
    <div className="flex items-center gap-2 text-sm"><ListChecks className="size-4 text-muted-foreground" aria-hidden="true" /><h3 className="font-medium">{title}</h3><span className="ml-auto text-xs text-muted-foreground">{completed} / {steps.length}</span></div>
    {steps.length ? <ol className="grid gap-2">{steps.map(step => <li key={step.id} className="flex min-w-0 gap-2.5"><span className="pt-1"><ExecutionIcon status={step.status} /></span><div className="min-w-0 flex-1">{onStepSelect ? <button type="button" onClick={() => onStepSelect(step.id)} className="rounded text-left text-sm underline-offset-4 hover:underline focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:outline-ring">{step.title}</button> : <p className="text-sm">{step.title}</p>}{step.description && <p className="text-xs leading-5 text-muted-foreground">{step.description}</p>}</div><span className="shrink-0 pt-0.5 text-xs text-muted-foreground">{executionLabels[step.status]}</span></li>)}</ol> : <p className="text-sm text-muted-foreground">暂无计划步骤</p>}
  </section>;
}
