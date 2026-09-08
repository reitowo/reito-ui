import {useEffect,useState} from 'react';
import {Scheduler,type SchedulerEvent,type SchedulerView} from './scheduler.js';
export const schedulerDemoEvents:SchedulerEvent[]=[
 {id:'review',title:'工作区评审',start:'2026-09-08T09:00:00Z',end:'2026-09-08T10:00:00Z',allDay:false},
 {id:'overlap',title:'组件验收（重叠）',start:'2026-09-08T09:30:00Z',end:'2026-09-08T11:00:00Z',allDay:false},
 {id:'release',title:'跨日发布窗口',start:'2026-09-08',end:'2026-09-10',allDay:true},
];
export function SchedulerDemo({initialView='week',readOnly=false,failSave=false,loading=false,empty=false}:{initialView?:SchedulerView;readOnly?:boolean;failSave?:boolean;loading?:boolean;empty?:boolean}){
 const [view,setView]=useState<SchedulerView>(initialView);
 useEffect(()=>setView(initialView),[initialView]);
 const [date,setDate]=useState('2026-09-08');
 const [events,setEvents]=useState(schedulerDemoEvents);
 return <Scheduler label="本地工作排程" events={empty?[]:events} date={date} view={view} onViewChange={setView} onDateChange={setDate} readOnly={readOnly} loading={loading} onEventChange={async change=>{if(failSave)throw new Error('本地保存失败，请重试');setEvents(current=>current.map(event=>event.id===change.event.id?change.event:event));}} />;
}
