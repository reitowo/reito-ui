import {useEffect,useRef,useState} from 'react';
import Calendar,{type CalendarRef,type EventApi} from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import zhCn from '@fullcalendar/react/locales/zh-cn';
import {schedulerTheme} from './scheduler-theme.js';
import {Button} from '../primitives/button.js';
import {Input} from '../primitives/input.js';
import {Field,FieldLabel} from '../primitives/field.js';
import {cn} from '../lib/utils.js';
import {validateSchedulerEvent,validateSchedulerEvents,type SchedulerChange,type SchedulerEvent,type SchedulerView} from './scheduler-model.js';
export type {SchedulerEvent,SchedulerChange,SchedulerView} from './scheduler-model.js';
export interface SchedulerProps {
 label:string; events:readonly SchedulerEvent[]; date:string; view?:SchedulerView;
 timeZone?:'UTC'|'local'; readOnly?:boolean; loading?:boolean; error?:string;
 onEventChange?:(change:SchedulerChange)=>void|Promise<void>;
 onDateChange?:(date:string)=>void; onViewChange?:(view:SchedulerView)=>void;
 className?:string;
}
const viewNames={day:'timeGridDay',week:'timeGridWeek',month:'dayGridMonth'};
const viewLabels={day:'日',week:'周',month:'月'};
const fromApi=(event:EventApi,previous:SchedulerEvent):SchedulerEvent=>({...previous,title:event.title,start:event.startStr,end:event.endStr,allDay:event.allDay});
function inputTime(value:string,allDay:boolean,zone:'UTC'|'local') {
 if(allDay)return value;
 const date=new Date(value);
 if(zone==='UTC')return date.toISOString().slice(0,16);
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}
export function Scheduler({label,events,date,view='week',timeZone='UTC',readOnly=false,loading=false,error,onEventChange,onDateChange,onViewChange,className}:SchedulerProps) {
 const calendar=useRef<CalendarRef>(null);
 const root=useRef<HTMLElement>(null);
 const busy=useRef(false);
 const [pending,setPending]=useState(false);
 const [failure,setFailure]=useState('');
 const [draft,setDraft]=useState<SchedulerEvent|null>(null);
 const [retry,setRetry]=useState<SchedulerChange|null>(null);
 const [title,setTitle]=useState('');
 const problem=error||validateSchedulerEvents(events);
 useEffect(()=>{
  const element=root.current;if(!element)return;
  let frame=0;
  const update=()=>{
   for(const node of element.querySelectorAll<HTMLElement>('div')){
    const style=getComputedStyle(node);
    if((/auto|scroll/.test(style.overflowY)&&node.scrollHeight>node.clientHeight)||(/auto|scroll/.test(style.overflowX)&&node.scrollWidth>node.clientWidth)){
     // A focusable generic wrapper breaks grid ownership. Focus its existing cell.
     const target=node.querySelector<HTMLElement>('[role="gridcell"]')??node;
     target.tabIndex=0;target.title=`${label}滚动区域`;
     target.classList.add('outline-none','focus-visible:ring-[length:var(--rui-outline-width)]','focus-visible:ring-inset','focus-visible:ring-ring');
    }
   }
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
  const observer=new MutationObserver(schedule);observer.observe(element,{childList:true,subtree:true});
  const resize=new ResizeObserver(schedule);resize.observe(element);schedule();
  return()=>{observer.disconnect();resize.disconnect();cancelAnimationFrame(frame);};
 },[label]);
 useEffect(()=>{calendar.current?.getApi().changeView(viewNames[view]);},[view]);
 useEffect(()=>{calendar.current?.getApi().gotoDate(date);},[date]);
 async function save(change:SchedulerChange) {
  if(busy.current||readOnly||change.previous.readOnly||!onEventChange)return;
  const invalid=validateSchedulerEvent(change.event);
  if(invalid){setFailure(invalid);return;}
  busy.current=true;setPending(true);setFailure('');setRetry(null);
  try{await onEventChange(change);setDraft(null);}
  catch(error){setFailure(error instanceof Error?error.message:'保存失败');setRetry(change);}
  finally{busy.current=false;setPending(false);}
 }
 const propose=(event:EventApi,revert:()=>void,source:'move'|'resize')=>{
  const previous=events.find(item=>item.id===event.id);
  const next=previous&&fromApi(event,previous);
  revert(); // Only the host's successful controlled update changes persisted events.
  if(previous&&next)void save({previous,event:next,source});
 };
 const locked=readOnly||pending||!onEventChange||draft?.readOnly;
 return <section ref={root} data-slot="scheduler" aria-label={label} className={cn('@container/scheduler grid min-w-0 gap-[var(--rui-content-gap)] text-sm',className)}>
  <div className="flex flex-wrap items-center gap-[var(--rui-content-gap-sm)]"><h3 className="min-w-0 basis-full font-medium @sm/scheduler:basis-auto @sm/scheduler:flex-1">{label} · {title}</h3>{(['day','week','month'] as const).map(mode=><Button key={mode} size="sm" variant={view===mode?'secondary':'ghost'} aria-pressed={view===mode} onClick={()=>onViewChange?.(mode)}>{viewLabels[mode]}</Button>)}<Button size="sm" variant="outline" onClick={()=>calendar.current?.getApi().prev()} aria-label="上一时段">上一期</Button><Button size="sm" variant="outline" onClick={()=>calendar.current?.getApi().next()} aria-label="下一时段">下一期</Button></div>
  {loading?<p role="status">正在加载排程…</p>:problem?<p role="alert">{problem}</p>:<Calendar {...schedulerTheme} eventInteractive ref={calendar} plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin]} locale={zhCn} initialView={viewNames[view]} initialDate={date} timeZone={timeZone} headerToolbar={false} events={events.map(event=>({...event,editable:!event.readOnly}))} editable={!readOnly&&!pending&&!!onEventChange} eventClick={info=>{setDraft(events.find(event=>event.id===info.event.id)??null);setFailure('');setRetry(null);}} eventDrop={info=>propose(info.event,info.revert,'move')} eventResize={info=>propose(info.event,info.revert,'resize')} datesSet={info=>{setTitle(info.view.title);const current=calendar.current?.getApi().getDate();if(current){const next=inputTime(current.toISOString(),false,timeZone).slice(0,10);if(next!==date)onDateChange?.(next);}}} />}
  {!loading&&!problem&&!events.length&&<p role="status" className="text-muted-foreground">暂无排程事件</p>}
  {pending&&<p role="status">正在保存…</p>}
  {failure&&<div className="flex flex-wrap gap-[var(--rui-content-gap-sm)]"><p role="alert" className="text-destructive">{failure}</p>{retry&&<Button disabled={pending} onClick={()=>void save(retry)}>重试保存</Button>}</div>}
  {draft&&<form aria-label="编辑事件" className="grid gap-[var(--rui-content-gap-sm)]" onSubmit={event=>{event.preventDefault();const previous=events.find(item=>item.id===draft.id);if(previous)void save({previous,event:draft,source:'edit'});}}>
   <Field><FieldLabel htmlFor={`${draft.id}-title`}>标题</FieldLabel><Input id={`${draft.id}-title`} value={draft.title} disabled={!!locked} onChange={event=>setDraft({...draft,title:event.target.value})}/></Field>
   {(['start','end'] as const).map(part=><Field key={part}><FieldLabel htmlFor={`${draft.id}-${part}`}>{part==='start'?'开始':'结束'}{draft.allDay?'（日期不含结束日）':`（${timeZone==='UTC'?'UTC':'本地时间'}）`}</FieldLabel><Input id={`${draft.id}-${part}`} type={draft.allDay?'date':'datetime-local'} value={inputTime(draft[part],draft.allDay,timeZone)} disabled={!!locked} onChange={event=>{const value=event.target.value;if(value)setDraft({...draft,[part]:draft.allDay?value:timeZone==='UTC'?`${value}:00Z`:new Date(value).toISOString()});}} /></Field>)}
   <div className="flex gap-[var(--rui-content-gap-sm)]"><Button type="submit" disabled={!!locked}>保存事件</Button><Button type="button" variant="ghost" disabled={pending} onClick={()=>setDraft(null)}>关闭编辑</Button></div>
  </form>}
 </section>;
}
