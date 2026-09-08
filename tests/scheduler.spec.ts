import {test,expect} from '@playwright/test';
async function open(page:import('@playwright/test').Page,story='playground'){
 await page.goto(`http://127.0.0.1:6007/iframe.html?id=复杂-scheduler-排程--${story}&viewMode=story`);
 await expect(page.getByRole('region',{name:'本地工作排程',exact:true})).toBeVisible({timeout:20000});
}
test('day week month navigation preserves event access',async({page})=>{
 await open(page);
 await expect(page.getByText('工作区评审',{exact:true})).toBeVisible();
 for(const name of ['日','月','周']){await page.getByRole('button',{name,exact:true}).click();await expect(page.getByRole('button',{name,exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.getByText('工作区评审',{exact:true})).toBeVisible();}
});
test('event editor persists controlled title and time changes',async({page})=>{
 await open(page,'day');
 await page.getByText('工作区评审',{exact:true}).click();
 await page.getByLabel('标题',{exact:true}).fill('更新后的评审');
 await page.getByLabel('结束（UTC）',{exact:true}).fill('2026-09-08T10:30');
 await page.getByRole('button',{name:'保存事件',exact:true}).click();
 await expect(page.getByRole('form',{name:'编辑事件'})).toHaveCount(0);
 await page.getByText('更新后的评审',{exact:true}).click();
 await expect(page.getByLabel('结束（UTC）',{exact:true})).toHaveValue('2026-09-08T10:30');
});
test('save failure retains original event and retry entry',async({page})=>{
 await open(page,'save-failure');
 await page.getByText('工作区评审',{exact:true}).click();
 await page.getByLabel('标题',{exact:true}).fill('未保存标题');
 await page.getByRole('button',{name:'保存事件',exact:true}).click();
 await expect(page.getByRole('alert')).toHaveText('本地保存失败，请重试');
 await expect(page.getByText('工作区评审',{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'重试保存'})).toBeEnabled();
});
test('readonly events cannot be edited',async({page})=>{
 await open(page,'read-only');
 await page.getByText('工作区评审',{exact:true}).click();
 await expect(page.getByLabel('标题',{exact:true})).toBeDisabled();
 await expect(page.getByRole('button',{name:'保存事件',exact:true})).toBeDisabled();
});
test('keyboard can open an event and change its time',async({page})=>{
 await open(page,'day');
 const event=page.getByText('工作区评审',{exact:true}).locator('xpath=ancestor::*[@tabindex][1]');
 await event.focus();await event.press('Enter');
 await page.getByLabel('开始（UTC）',{exact:true}).fill('2026-09-08T08:30');
 await page.getByRole('button',{name:'保存事件',exact:true}).press('Enter');
 await expect(page.getByRole('form',{name:'编辑事件'})).toHaveCount(0);
});
test('pointer moves an event to another day',async({page})=>{
 await open(page);
 const event=page.getByText('工作区评审',{exact:true});
 const box=await event.boundingBox();
 const next=await page.getByText('9日周三',{exact:true}).boundingBox();
 if(!box||!next)throw new Error('Missing drag geometry');
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 await page.mouse.down();await page.mouse.move(next.x+next.width/2,box.y+box.height/2,{steps:20});await page.mouse.up();
 await expect(event).toHaveCount(1);
 await event.click();
 await expect(page.getByLabel('开始（UTC）',{exact:true})).toHaveValue('2026-09-09T09:00');
});
test('pointer adjusts event end time',async({page})=>{
 await open(page,'day');
 const event=page.getByText('工作区评审',{exact:true}).locator('xpath=ancestor::*[@tabindex][1]');
 const handle=event.locator('.rui-scheduler-resize-end');
 await expect(handle).toBeVisible();
 const box=await handle.boundingBox();if(!box)throw new Error('Missing resize handle');
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2+34,{steps:15});await page.mouse.up();
 await page.getByText('工作区评审',{exact:true}).click();
 await expect(page.getByLabel('结束（UTC）',{exact:true})).not.toHaveValue('2026-09-08T10:00');
});
test('Controls switch views and recover a failed save on the same story',async({page})=>{
 await page.goto('http://127.0.0.1:6007/?path=/story/复杂-scheduler-排程--playground');
 const frame=page.frameLocator('#storybook-preview-iframe');
 await expect(frame.getByText('工作区评审',{exact:true})).toBeVisible({timeout:20000});
 await page.getByRole('tab',{name:/^Controls/}).click();
 await page.locator('#control-initialView').selectOption({label:'day'});
 await expect(frame.getByRole('button',{name:'日',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.locator('label[for="control-failSave"]').click();
 await frame.getByText('工作区评审',{exact:true}).click();
 await frame.getByLabel('标题',{exact:true}).fill('重试已保存');
 await frame.getByRole('button',{name:'保存事件',exact:true}).click();
 await expect(frame.getByRole('alert')).toHaveText('本地保存失败，请重试');
 await page.locator('label[for="control-failSave"]').click();
 await frame.getByRole('button',{name:'重试保存'}).click();
 await expect(frame.getByRole('alert')).toHaveCount(0);
 await expect(frame.getByText('重试已保存',{exact:true})).toBeVisible();
 expect(new URL(page.url()).searchParams.get('path')).toBe('/story/复杂-scheduler-排程--playground');
});
test('empty calendar has a keyboard reachable scrolling cell',async({page})=>{
 await open(page,'empty');
 const cell=page.locator('[role="gridcell"][tabindex="0"]').first();
 await expect(cell).toBeVisible();await cell.focus();await expect(cell).toBeFocused();
 const offset=()=>cell.evaluate(element=>{let node=element.parentElement;while(node&&!/auto|scroll/.test(getComputedStyle(node).overflowY))node=node.parentElement;return node?.scrollTop??0;});
 const before=await offset();await cell.press('PageDown');
 await expect.poll(offset).toBeGreaterThan(before);
});
for(const theme of ['dark','light'])for(const density of ['compact','comfortable'])test(`${theme}/${density} narrow day view`,async({page})=>{
 await page.setViewportSize({width:390,height:850});
 await page.goto(`http://127.0.0.1:6007/iframe.html?id=复杂-scheduler-排程--day&viewMode=story&globals=theme:${theme};density:${density}`);
 await expect(page.getByText('工作区评审',{exact:true})).toBeVisible({timeout:20000});
 await page.getByText('工作区评审',{exact:true}).click();
 await expect(page.getByLabel('标题',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`.logs/scheduler/${theme}-${density}.png`,fullPage:true});
});
