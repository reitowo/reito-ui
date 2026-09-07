import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-overlayprovider-命令式浮层';

async function openStory(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('#storybook-root')).toBeVisible({ timeout: 15_000 });
}

test('Dialog close returns a typed result and restores the invocation focus', async ({ page }) => {
  await openStory(page, 'default');
  const trigger = page.getByRole('button', { name: '打开设置浮层' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('应用本地设置？');
  await dialog.getByRole('button', { name: '应用' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('status')).toHaveText('已应用本地设置');
  await expect(trigger).toBeFocused();
});

test('explicit cancel resolves with a stable dismiss reason', async ({ page }) => {
  await openStory(page, 'default');
  const trigger = page.getByRole('button', { name: '打开设置浮层' });
  await trigger.click();
  await page.getByRole('dialog').getByRole('button', { name: '取消' }).click();
  await expect(page.getByRole('status')).toHaveText('已关闭：cancel');
  await expect(trigger).toBeFocused();
});

test('Escape maps to a dismiss outcome and restores focus', async ({ page }) => {
  await openStory(page, 'default');
  const trigger = page.getByRole('button', { name: '打开设置浮层' });
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('status')).toHaveText('已关闭：escape');
  await expect(trigger).toBeFocused();
});

test('Sheet uses the requested side and resolves its result', async ({ page }) => {
  await openStory(page, 'sheet-result');
  const sheet = page.getByRole('dialog');
  await expect(sheet).toHaveAttribute('data-side', 'right');
  await sheet.getByRole('button', { name: '完成' }).click();
  await expect(sheet).toBeHidden();
  await expect(page.getByRole('status')).toHaveText('已返回：done');
});

test('AlertDialog preserves the alert role and destructive confirmation result', async ({ page }) => {
  await openStory(page, 'alert-dialog-result');
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toContainText('移除这份草稿？');
  await dialog.getByRole('button', { name: '移除' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('status')).toHaveText('已返回：true');
});

test('non-dismissible mode blocks Escape and outside press but keeps explicit actions', async ({ page }) => {
  await openStory(page, 'non-dismissible');
  await page.getByRole('button', { name: '打开关键步骤' }).click();
  const dialog = page.getByRole('dialog');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '完成' }).click();
  await expect(page.getByRole('status')).toHaveText('已返回：true');
});

test('nested confirmation closes to its parent entry and then to the original trigger', async ({ page }) => {
  await openStory(page, 'nested');
  const trigger = page.getByRole('button', { name: '编辑工作区' });
  await trigger.click();
  const parent = page.getByRole('dialog');
  const nestedTrigger = parent.getByRole('button', { name: '打开嵌套确认' });
  await nestedTrigger.click();
  const child = page.getByRole('alertdialog');
  await expect(child).toBeVisible();
  await child.getByRole('button', { name: '取消' }).click();
  await expect(child).toBeHidden();
  await expect(nestedTrigger).toBeFocused();
  await parent.getByRole('button', { name: '保存' }).click();
  await expect(parent).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('已返回：saved');
});

test('concurrent calls form a stack and both result promises settle', async ({ page }) => {
  await openStory(page, 'concurrent-stack');
  const trigger = page.getByRole('button', { name: '同时打开两层' });
  await trigger.click();
  await expect(page.locator('[role="dialog"]')).toHaveCount(2);
  await page.getByRole('dialog').getByRole('button', { name: '完成第二层' }).click();
  await expect(page.locator('[role="dialog"]')).toHaveCount(1);
  await page.getByRole('dialog').filter({ hasText: '第一层任务' }).getByRole('button', { name: '完成第一层' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('已返回：undefined；已返回：undefined');
  await expect(trigger).toBeFocused();
});

test('patch updates the active entry without replacing its transaction', async ({ page }) => {
  await openStory(page, 'patch-open-overlay');
  await page.getByRole('button', { name: '打开并更新' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('正在读取任务');
  await expect(dialog).toContainText('任务详情已更新');
  await expect(dialog).toContainText('已读取 3 条本地记录。');
  await dialog.getByRole('button', { name: '关闭' }).click();
  await expect(page.getByRole('status')).toHaveText('已关闭：close');
});

test('closeAll settles every open transaction with the same reason', async ({ page }) => {
  await openStory(page, 'close-all');
  const trigger = page.getByRole('button', { name: '打开批处理浮层' });
  await trigger.click();
  await expect(page.locator('[role="dialog"]')).toHaveCount(2);
  await page.getByRole('button', { name: '关闭全部浮层' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText('已关闭：close-all；已关闭：close-all');
  await expect(trigger).toBeFocused();
});

test('closing an ancestor settles every child above it', async ({ page }) => {
  await openStory(page, 'ancestor-close');
  await page.getByRole('button', { name: '打开父子事务' }).click();
  await expect(page.locator('[role="dialog"]')).toHaveCount(2);
  await page.getByRole('button', { name: '关闭父层事务' }).click();
  await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText('已返回：undefined；已关闭：ancestor-close');
});

test('provider unmount settles unresolved promises and removes the portal', async ({ page }) => {
  await openStory(page, 'provider-unmount');
  await page.getByRole('button', { name: '打开卸载示例' }).click();
  await page.getByRole('dialog').getByRole('button', { name: '卸载 Provider' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText('已关闭：provider-unmount');
  await expect(page.getByRole('button', { name: '重新挂载 Provider' })).toBeVisible();
});

test('handle dismisses its own transaction after opening', async ({ page }) => {
  await openStory(page, 'handle-dismiss');
  await page.getByRole('button', { name: '打开并由句柄关闭' }).click();
  await expect(page.getByRole('dialog')).toContainText('可由句柄关闭');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('status')).toHaveText('已关闭：programmatic');
});

test('Playground Controls update kind, copy and actions without changing stories', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  const trigger = frame.getByRole('button', { name: '打开参数浮层' });
  await expect(trigger).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-kind"]').selectOption('alert-dialog');
  await page.locator('[id="control-title"]').fill('确认重建本地索引？');
  await page.locator('[id="control-confirmLabel"]').fill('重建');
  await trigger.click();
  const dialog = frame.getByRole('alertdialog');
  await expect(dialog).toContainText('确认重建本地索引？');
  await expect(dialog.getByRole('button', { name: '重建' })).toBeVisible();
  await dialog.getByRole('button', { name: '取消' }).click();
  await expect(frame.getByRole('status')).toHaveText('已关闭：cancel');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: open overlay stays contained and accessible`, async ({ page }) => {
  await openStory(page, 'default', `theme:${theme};density:${density}`);
  await page.getByRole('button', { name: '打开设置浮层' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(1280);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  await page.screenshot({ path: `.logs/overlay-provider/${theme}-${density}.png`, fullPage: true });
});
