import { useRef, useState } from 'react';
import { Check, Circle, CircleAlert, LoaderCircle, Pause, Play, RotateCcw, X } from 'lucide-react';
import { Button } from '../primitives/button.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../primitives/select.js';
import { classes } from './shared.js';

export type QueueTaskStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type TaskQueueFilter = 'all' | 'active' | 'attention' | 'completed' | 'cancelled';
export interface QueueTask { id: string; title: string; status: QueueTaskStatus; description?: string; error?: string }
export interface TaskQueueProps {
  tasks: QueueTask[];
  onPause?: (id: string) => void | Promise<void>;
  onResume?: (id: string) => void | Promise<void>;
  onCancel?: (id: string) => void | Promise<void>;
  onRetry?: (id: string) => void | Promise<void>;
  onOpen?: (id: string) => void;
  filter?: TaskQueueFilter;
  onFilterChange?: (filter: TaskQueueFilter) => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}
const labels: Record<QueueTaskStatus, string> = { queued: '排队中', running: '运行中', paused: '已暂停', completed: '已完成', failed: '失败', cancelled: '已取消' };
const filters: { value: TaskQueueFilter; label: string }[] = [{ value: 'all', label: '全部任务' }, { value: 'active', label: '进行中的任务' }, { value: 'attention', label: '需要处理的任务' }, { value: 'completed', label: '已完成的任务' }, { value: 'cancelled', label: '已取消的任务' }];

/** Queue status is caller-owned; this component does not schedule or execute jobs. */
export function TaskQueue({ tasks, onPause, onResume, onCancel, onRetry, onOpen, filter, onFilterChange, disabled = false, title = '任务队列', className }: TaskQueueProps) {
  const [internalFilter, setInternalFilter] = useState<TaskQueueFilter>('all');
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inFlight = useRef(new Set<string>());
  const activeFilter = filter ?? internalFilter;
  const activeCount = tasks.filter(task => task.status === 'queued' || task.status === 'running').length;
  const visible = tasks.filter(task => activeFilter === 'all' || (activeFilter === 'active' ? task.status === 'queued' || task.status === 'running' : activeFilter === 'attention' ? task.status === 'paused' || task.status === 'failed' : task.status === activeFilter));
  async function run(id: string, callback: (id: string) => void | Promise<void>) {
    if (disabled || inFlight.current.has(id)) return;
    inFlight.current.add(id); setPending(new Set(inFlight.current)); setErrors(current => ({ ...current, [id]: '' }));
    try { await callback(id); }
    catch (reason) { setErrors(current => ({ ...current, [id]: reason instanceof Error && reason.message ? reason.message : '任务操作失败，请重试。' })); }
    finally { inFlight.current.delete(id); setPending(new Set(inFlight.current)); }
  }
  return <section aria-label={title} className={classes('@container/task-queue grid min-w-0 gap-[var(--rui-content-gap)]', className)}>
    <header className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-medium">{title}</h3><span className="text-xs text-muted-foreground">{tasks.length} 项 · {activeCount} 项进行中</span><Select items={filters} value={activeFilter} onValueChange={next => { if (next && filters.some(item => item.value === next)) { if (filter === undefined) setInternalFilter(next); onFilterChange?.(next); } }}><SelectTrigger aria-label="筛选任务队列" size="sm" className="ml-auto"><SelectValue /></SelectTrigger><SelectContent align="end" alignItemWithTrigger={false}>{filters.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></header>
    {visible.length ? <ol aria-label="队列任务" className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-x-2 divide-y rounded-lg border">{visible.map(task => {
      const busy = pending.has(task.id);
      const Icon = task.status === 'running' ? LoaderCircle : task.status === 'completed' ? Check : task.status === 'failed' ? CircleAlert : task.status === 'paused' ? Pause : task.status === 'cancelled' ? X : Circle;
      const canCancel = ['queued', 'running', 'paused'].includes(task.status);
      const actions = [task.status === 'running' && onPause ? { label: '暂停', icon: Pause, callback: onPause } : null, task.status === 'paused' && onResume ? { label: '继续', icon: Play, callback: onResume } : null, task.status === 'failed' && onRetry ? { label: '重试', icon: RotateCcw, callback: onRetry } : null, canCancel && onCancel ? { label: '取消', icon: X, callback: onCancel } : null].filter(item => item !== null);
      return <li key={task.id} className="col-span-full grid min-w-0 grid-cols-subgrid px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)]">
        <div data-slot="task-queue-row" className="col-span-full grid min-h-[var(--rui-control-height-xs)] min-w-0 grid-cols-subgrid items-center">
          <Icon aria-hidden="true" className={classes('size-4 shrink-0', task.status === 'running' && 'motion-safe:animate-spin', task.status === 'failed' ? 'text-destructive' : 'text-muted-foreground')} />
          <div className="flex min-w-0 flex-1 items-center gap-2" title={[task.title, task.description].filter(Boolean).join('\n')}>
            {onOpen ? <button type="button" className="min-w-0 truncate rounded text-left text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-[length:var(--rui-outline-width)] focus-visible:outline-ring" onClick={() => onOpen(task.id)}>{task.title}</button> : <p className="min-w-0 truncate text-sm font-medium">{task.title}</p>}
            {task.description && <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{task.description}</p>}
          </div>
          <span className="whitespace-nowrap text-right text-xs text-muted-foreground">{busy ? '处理中…' : labels[task.status]}</span>
          <div className="flex items-center justify-end gap-1">{actions.map(action => <Button key={action.label} type="button" variant="ghost" size="xs" className="w-[var(--rui-control-height-xs)] px-0 @lg/task-queue:w-auto @lg/task-queue:px-2" disabled={disabled || busy} title={action.label} aria-label={`${action.label}任务：${task.title}`} onClick={() => { void run(task.id, action.callback); }}><action.icon aria-hidden="true" className="size-3" /><span className="hidden @lg/task-queue:inline">{action.label}</span></Button>)}</div>
        </div>
        {task.status === 'failed' && task.error && <p className="col-span-full mt-1 break-words pl-6 text-xs text-destructive">{task.error}</p>}
        {errors[task.id] && <p role="alert" className="col-span-full mt-1 break-words pl-6 text-xs text-destructive">{errors[task.id]}</p>}
      </li>;
    })}</ol> : <p className="py-[var(--rui-content-padding)] text-sm text-muted-foreground">{tasks.length ? '当前筛选下没有任务' : '还没有排队任务'}</p>}
  </section>;
}

