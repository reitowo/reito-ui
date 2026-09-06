import type { ReactNode } from 'react';
import { Check, Circle, CircleAlert, LoaderCircle } from 'lucide-react';
import { cx } from './shared.js';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: ReactNode;
  time?: string;
  dateTime?: string;
  status?: 'complete' | 'current' | 'error' | 'pending';
  content?: ReactNode;
}
export interface TimelineProps { events: TimelineEvent[]; label?: string; emptyMessage?: string; className?: string; }
export function Timeline({ events, label = '活动时间线', emptyMessage = '还没有活动记录', className }: TimelineProps) {
  if (!events.length) return <p className={cx('py-[var(--rui-empty-padding)] text-center font-sans text-sm text-muted-foreground', className)}>{emptyMessage}</p>;
  const statusLabels = { complete: '已完成', current: '进行中', error: '失败', pending: '待开始' };
  return <ol aria-label={label} className={cx('space-y-0 font-sans text-sm text-foreground', className)}>
    {events.map((event, index) => {
      const status = event.status ?? 'complete';
      const Icon = status === 'error' ? CircleAlert : status === 'current' ? LoaderCircle : status === 'complete' ? Check : Circle;
      return <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
        {index < events.length - 1 && <span aria-hidden="true" className="absolute top-6 bottom-0 left-3 w-px bg-border" />}
        <span className={cx('relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background', status === 'error' ? 'text-destructive' : 'text-muted-foreground')} aria-label={statusLabels[status]} role="img"><Icon aria-hidden="true" className={cx('size-3.5', status === 'current' && 'motion-safe:animate-spin')} /></span>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-medium">{event.title}</h3>{event.time && <time dateTime={event.dateTime} className="text-xs text-muted-foreground">{event.time}</time>}</div>
          {event.description && <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{event.description}</div>}{event.content && <div className="mt-3">{event.content}</div>}
        </div>
      </li>;
    })}
  </ol>;
}
