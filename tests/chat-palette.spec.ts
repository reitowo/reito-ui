import {expect,test} from '@playwright/test';

test('command and session selection return to shared conversation', async ({page}) => {
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-chatpalette--playground&viewMode=story');
 await page.getByRole('button',{name:'打开命令与对话'}).click();
 await page.getByRole('combobox',{name:'搜索命令'}).fill('审查');
 await page.getByRole('combobox',{name:'搜索命令'}).press('Enter');
 await expect(page.getByRole('article')).toContainText('审查当前文件');
 await page.getByRole('textbox',{name:'消息草稿'}).fill('保留这条草稿');
 await page.getByRole('button',{name:'会话',exact:true}).click();
 await page.getByRole('combobox',{name:'搜索会话'}).fill('设计');
 await page.getByRole('combobox',{name:'搜索会话'}).press('Enter');
 await expect(page.getByRole('article')).toContainText('design');
 await expect(page.getByRole('textbox',{name:'消息草稿'})).toHaveValue('保留这条草稿');
});

test('opt-in shortcut opens palette and Escape restores entry focus', async ({page}) => {
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-chatpalette--playground&viewMode=story&args=shortcut:true');
 const trigger=page.getByRole('button',{name:'打开命令与对话'});
 await trigger.focus();
 await page.keyboard.press('Control+j');
 await expect(page.getByRole('dialog')).toBeVisible();
 const search=page.getByRole('combobox',{name:'搜索命令'});
 await search.focus();
 await page.keyboard.press('Control+j');
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(trigger).toBeFocused();
});

test('same-page Controls allow command failure recovery', async ({page}) => {
 await page.goto('http://127.0.0.1:6007/?path=/story/ai-chatpalette--playground');
 const frame=page.frameLocator('#storybook-preview-iframe');
 await expect(frame.getByRole('button',{name:'打开命令与对话'})).toBeVisible();
 await page.getByRole('tab',{name:/^Controls/}).click();
 await page.locator('label[for="control-fail"]').click();
 await frame.getByRole('button',{name:'打开命令与对话'}).click();
 await frame.getByRole('combobox',{name:'搜索命令'}).fill('审查');
 await frame.getByRole('combobox',{name:'搜索命令'}).press('Enter');
 await expect(frame.getByRole('alert')).toContainText('本地命令失败');
 await page.locator('label[for="control-fail"]').click();
 await frame.getByRole('button',{name:'重试',exact:true}).click();
 await frame.getByRole('combobox',{name:'搜索命令'}).press('Enter');
 await expect(frame.getByRole('article')).toContainText('审查当前文件');
 expect(new URL(page.url()).searchParams.get('path')).toBe('/story/ai-chatpalette--playground');
});

test('empty command and session lists have explicit feedback', async ({page}) => {
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-chatpalette--empty&viewMode=story');
 await page.getByRole('button',{name:'打开命令与对话'}).click();
 await expect(page.getByRole('status')).toHaveText('没有匹配的命令');
 await page.getByRole('button',{name:'会话',exact:true}).click();
 await expect(page.getByRole('status')).toHaveText('没有匹配的会话');
});

test('stop preserves palette and composer draft', async ({page}) => {
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-chatpalette--running&viewMode=story');
 await page.getByRole('button',{name:'打开命令与对话'}).click();
 await page.getByRole('button',{name:'对话',exact:true}).click();
 await page.getByRole('textbox',{name:'消息草稿'}).fill('后续消息');
 await page.getByRole('button',{name:'停止生成'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await expect(page.getByRole('textbox',{name:'消息草稿'})).toHaveValue('后续消息');
});

test('pending selection locks view changes and survives closing', async ({page}) => {
 await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-chatpalette--pending-selection&viewMode=story');
 await page.getByRole('combobox',{name:'搜索命令'}).fill('延迟');
 await page.getByRole('combobox',{name:'搜索命令'}).press('Enter');
 await expect(page.getByRole('button',{name:'会话',exact:true})).toBeDisabled();
 await expect(page.getByRole('status')).toHaveText('正在处理选择…');
 await page.getByRole('button',{name:'关闭助手'}).click();
 await page.getByRole('button',{name:'打开命令与对话'}).click();
 await expect(page.getByRole('article')).toContainText('操作已完成');
});
