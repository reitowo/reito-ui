import {expect,test} from '@playwright/test';

for (const theme of ['dark','light']) for (const density of ['compact','comfortable']) test(`${theme}/${density}: narrow conversation remains readable`,async({page})=>{
 await page.setViewportSize({width:390,height:850});
 await page.goto(`http://127.0.0.1:6007/iframe.html?id=ai-virtualconversation--playground&viewMode=story&globals=theme:${theme};density:${density}`);
 const list=page.getByRole('list',{name:'虚拟对话消息'});
 await expect(list.getByText(/本地消息 999：/)).toBeVisible();
 await list.focus(); await list.press('Home');
 await expect(list.getByText(/本地消息 0：/)).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`.logs/virtual-conversation/${theme}-${density}.png`,fullPage:true});
});

test('Controls change history behavior without changing Story',async({page})=>{
 await page.goto('http://127.0.0.1:6007/?path=/story/ai-virtualconversation--playground');
 const frame=page.frameLocator('#storybook-preview-iframe');
 await frame.getByRole('button',{name:'加载更早消息'}).waitFor();
 await page.getByRole('tab',{name:/^Controls/}).click();
 await page.locator('label[for="control-failHistory"]').click();
 await expect(page.locator('#control-failHistory')).toBeChecked();
 await frame.getByRole('button',{name:'加载更早消息'}).click();
 await expect(frame.getByRole('alert')).toHaveText('本地历史加载失败');
 await page.locator('label[for="control-failHistory"]').click();
 await frame.getByRole('button',{name:'重试加载历史'}).click();
 await expect(frame.getByRole('alert')).toHaveCount(0);
 expect(new URL(page.url()).searchParams.get('path')).toBe('/story/ai-virtualconversation--playground');
});

test('empty and pending history states are explicit',async({page})=>{
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-virtualconversation--empty&viewMode=story');
 await expect(page.getByRole('status')).toHaveText('还没有消息');
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-virtualconversation--loading-history&viewMode=story');
 await expect(page.getByRole('button',{name:'正在加载历史…'})).toBeDisabled();
 await expect(page.getByText('加载历史时保留当前消息。')).toBeVisible();
});

test('failed history retains messages and offers retry',async({page})=>{
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-virtualconversation--history-failure&viewMode=story');
 await page.getByRole('button',{name:'加载更早消息'}).click();
 await expect(page.getByRole('alert')).toHaveText('本地历史加载失败');
 await expect(page.getByText(/本地消息 999：/)).toBeVisible();
 await page.getByRole('button',{name:'重试加载历史'}).click();
 await expect(page.getByRole('alert')).toHaveText('本地历史加载失败');
});

test('follow disabled retains scroll position on append',async({page})=>{
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-virtualconversation--follow-disabled&viewMode=story');
 const list=page.getByRole('list',{name:'虚拟对话消息'});
 await expect(list.getByText(/本地消息 999：/)).toBeVisible();
 await list.click({position:{x:5,y:5}});
 const offset=await list.evaluate(element=>element.scrollTop);
 await page.getByRole('button',{name:'追加消息',exact:true}).click();
 await expect.poll(()=>list.evaluate(element=>element.scrollTop)).toBe(offset);
});

test('long conversation renders a bounded window at the latest message',async({page})=>{
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-virtualconversation--playground&viewMode=story');
 const list=page.getByRole('list',{name:'虚拟对话消息'});
 await expect(list.getByText(/本地消息 999：/)).toBeVisible();
 expect(await list.getByRole('listitem').count()).toBeLessThan(50);
 await page.getByRole('button',{name:'增长末条消息'}).click();
 await expect.poll(()=>list.evaluate(element=>element.scrollHeight-element.clientHeight-element.scrollTop)).toBeLessThan(3);
 await page.getByRole('button',{name:'追加消息',exact:true}).click();
 await expect(list.getByText('追加的本地消息')).toBeVisible();
});

test('scrolling up pauses following and loading history preserves the visible message',async({page})=>{
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-virtualconversation--playground&viewMode=story');
 const list=page.getByRole('list',{name:'虚拟对话消息'});
 await expect(list.getByText(/本地消息 999：/)).toBeVisible();
 await list.focus();
 await list.press('Home');
 await expect(list.getByText(/本地消息 0：/)).toBeVisible();
 await expect(page.getByRole('button',{name:'回到最新'})).toBeVisible();
 const message=list.getByText(/本地消息 0：/);
 const top=await message.evaluate(element=>element.getBoundingClientRect().top);
 await page.getByRole('button',{name:'追加消息',exact:true}).click();
 await expect(message).toBeVisible();
 await expect.poll(()=>message.evaluate(element=>element.getBoundingClientRect().top)).toBe(top);
 await page.getByRole('button',{name:'加载更早消息'}).click();
 await expect(message).toBeVisible();
 await expect.poll(async()=>Math.abs(await message.evaluate(element=>element.getBoundingClientRect().top)-top)).toBeLessThanOrEqual(1);
 await page.getByRole('button',{name:'回到最新'}).click();
 await expect(list.getByText('追加的本地消息')).toBeVisible();
});

test('selected message text stays mounted when scrolled out of the window',async({page})=>{
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-virtualconversation--playground&viewMode=story');
 const list=page.getByRole('list',{name:'虚拟对话消息'});
 const message=list.getByText(/本地消息 999：/);
 await expect(message).toBeVisible();
 const selected=await message.evaluate(element=>{
   const range=document.createRange(); range.selectNodeContents(element);
   const selection=getSelection()!; selection.removeAllRanges(); selection.addRange(range);
   document.dispatchEvent(new Event('selectionchange'));
   return selection.toString();
 });
 await expect.poll(()=>page.evaluate(()=>getSelection()?.toString())).toBe(selected);
 await list.evaluate(element=>{element.scrollTop=0; element.dispatchEvent(new Event('scroll'));});
 await expect(list.getByText(/本地消息 0：/)).toBeVisible();
 await expect(message).toHaveCount(1);
 expect(await page.evaluate(()=>getSelection()?.toString())).toBe(selected);
 await page.evaluate(()=>{getSelection()?.removeAllRanges();document.dispatchEvent(new Event('selectionchange'));});
 await expect(message).toHaveCount(0);
});

test('streaming message parts grow while the reader remains at the latest content',async({page})=>{
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-virtualconversation--streaming-parts&viewMode=story');
 const list=page.getByRole('list',{name:'虚拟对话消息'});
 await expect(list.getByText('本地流式示例。',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'开始本地流式追加'}).click();
 await expect(page.getByRole('button',{name:'开始本地流式追加'})).toBeEnabled({timeout:10000});
 await expect(list.getByText(/本地流式示例。追加一段/)).toBeVisible();
 await expect.poll(()=>list.evaluate(element=>element.scrollHeight-element.clientHeight-element.scrollTop)).toBeLessThan(3);
 expect(await list.getByRole('listitem').count()).toBeLessThan(50);
});
