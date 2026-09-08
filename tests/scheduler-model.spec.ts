import {test,expect} from '@playwright/test';
import {validateSchedulerEvent,validateSchedulerEvents,type SchedulerEvent} from '../packages/ui/src/complex/scheduler-model.js';
const event:SchedulerEvent={id:'a',title:'本地事件',start:'2026-09-08T09:00:00+08:00',end:'2026-09-08T10:00:00+08:00',allDay:false};
test('timed ranges compare instants rather than wall clock labels',()=>{
 expect(validateSchedulerEvent(event)).toBeUndefined();
 expect(validateSchedulerEvent({...event,end:'2026-09-08T02:00:00Z'})).toBeUndefined();
 expect(validateSchedulerEvent({...event,end:'2026-09-08T01:00:00Z'})).toContain('晚于');
 expect(validateSchedulerEvent({...event,start:'2026-09-08T09:00:00'})).toContain('时区');
});
test('all-day exclusive end and impossible calendar dates are checked',()=>{
 expect(validateSchedulerEvent({...event,allDay:true,start:'2026-09-08',end:'2026-09-10'})).toBeUndefined();
 expect(validateSchedulerEvent({...event,allDay:true,start:'2026-09-08',end:'2026-09-08'})).toContain('晚于');
 expect(validateSchedulerEvent({...event,allDay:true,start:'2026-02-30',end:'2026-03-02'})).toContain('无效');
});
test('overlap is allowed but duplicate identities are not',()=>{
 expect(validateSchedulerEvents([event,{...event,id:'b'}])).toBeUndefined();
 expect(validateSchedulerEvents([event,event])).toContain('唯一');
});
