import { Temporal } from 'temporal-polyfill';

export type SchedulerView = 'day' | 'week' | 'month';
export interface SchedulerEvent {
  id: string;
  title: string;
  start: string;
  /** Exclusive end. All-day events use dates; timed events use explicit offsets. */
  end: string;
  allDay: boolean;
  readOnly?: boolean;
}
export interface SchedulerChange {
  previous: SchedulerEvent;
  event: SchedulerEvent;
  source: 'edit' | 'move' | 'resize';
}

export function validateSchedulerEvent(event: SchedulerEvent): string | undefined {
  if (!event.id.trim()) return '事件 id 不能为空';
  if (!event.title.trim()) return '事件标题不能为空';
  try {
    if (event.allDay) {
      if (![event.start,event.end].every(value=>/^\d{4}-\d{2}-\d{2}$/.test(value))) return '全天事件需要 YYYY-MM-DD 日期';
      const start=Temporal.PlainDate.from(event.start);
      const end=Temporal.PlainDate.from(event.end);
      if (Temporal.PlainDate.compare(start,end)>=0) return '结束必须晚于开始（结束日期不包含在内）';
    } else {
      if (![event.start,event.end].every(value=>/T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(value))) return '定时事件需要明确的时区偏移';
      if (Temporal.Instant.compare(Temporal.Instant.from(event.start),Temporal.Instant.from(event.end))>=0) return '结束必须晚于开始';
    }
  } catch { return '事件包含无效的日期或时间'; }
  return undefined;
}

export function validateSchedulerEvents(events: readonly SchedulerEvent[]): string | undefined {
  if(new Set(events.map(event=>event.id)).size!==events.length) return '事件 id 必须唯一';
  for(const event of events) { const error=validateSchedulerEvent(event); if(error) return `${event.title || event.id}：${error}`; }
  return undefined;
}
