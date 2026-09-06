import type { ReactNode } from 'react';
import { Check, Circle, CircleAlert, LoaderCircle } from 'lucide-react';
import { cn } from '../lib/utils.js';

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'error';

export const executionLabels: Record<ExecutionStatus, string> = {
  pending: '等待中', running: '进行中', success: '已完成', error: '失败',
};

export function classes(...values: (string | undefined | false)[]) {
  return cn(...values);
}

export function ExecutionIcon({ status, className }: { status: ExecutionStatus; className?: string }) {
  const Icon = status === 'running' ? LoaderCircle : status === 'success' ? Check : status === 'error' ? CircleAlert : Circle;
  return <Icon aria-hidden="true" className={classes('size-4 shrink-0', status === 'running' && 'motion-safe:animate-spin', status === 'error' ? 'text-destructive' : 'text-muted-foreground', className)} />;
}

export function AiDemoFrame({ children, note = '本地交互示例 · 未连接模型或外部服务' }: { children: ReactNode; note?: string }) {
  return <div className="grid min-w-0 gap-[var(--rui-content-gap)]"><p className="text-xs text-muted-foreground">{note}</p>{children}</div>;
}
