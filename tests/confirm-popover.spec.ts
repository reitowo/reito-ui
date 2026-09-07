import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-confirmpopover-锚点确认';

async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const trigger = page.getByRole('button').first();
  await expect(trigger).toBeVisible({ timeout: 15_000 });
  return trigger;
}

test('opens an anchored alertdialog and Cancel closes with focus restoration', async ({ page }) => {
  const trigger = await open(page);
  await trigger.click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('删除这份草稿？');
  await dialog.getByRole('button', { name: '取消' }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Escape closes the modal surface and restores its trigger', async ({ page }) => {
  const trigger = await open(page, 'keyboard-focus');
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('alertdialog');
  await expect(dialog.getByRole('button', { name: '取消' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('modal focus stays inside the two confirmation actions', async ({ page }) => {
  const trigger = await open(page, 'keyboard-focus');
  await trigger.click();
  const dialog = page.getByRole('alertdialog');
  const cancel = dialog.getByRole('button', { name: '取消' });
  const confirm = dialog.getByRole('button', { name: '归档' });
  await expect(cancel).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(confirm).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(cancel).toBeFocused();
});

test('successful async confirmation exposes pending, blocks duplicates and refocuses', async ({ page }) => {
  const trigger = await open(page, 'async-success');
  await trigger.click();
  const dialog = page.getByRole('alertdialog');
  const confirm = dialog.getByRole('button', { name: '运行' });
  await confirm.click();
  await expect(dialog).toHaveAttribute('aria-busy', 'true');
  await expect(dialog.getByRole('button', { name: '正在运行…' })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: '取消' })).toBeDisabled();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('status')).toHaveText('已完成');
  await expect(trigger).toBeFocused();
});

test('failed async confirmation stays open, explains failure and permits retry', async ({ page }) => {
  const trigger = await open(page, 'async-failure');
  await trigger.click();
  const dialog = page.getByRole('alertdialog');
  await dialog.getByRole('button', { name: '运行' }).click();
  await expect(dialog.getByRole('alert')).toHaveText('本地示例执行失败，可以再次尝试。');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: '运行' })).toBeEnabled();
  await dialog.getByRole('button', { name: '运行' }).click();
  await expect(dialog.getByRole('button', { name: '正在运行…' })).toBeDisabled();
});

test('external pending prevents Escape and exposes a labelled status', async ({ page }) => {
  await open(page, 'external-pending');
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toHaveAttribute('aria-busy', 'true');
  await expect(dialog.getByRole('status')).toHaveText('正在归档…');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
});

test('host error is announced without hiding available actions', async ({ page }) => {
  await open(page, 'host-error');
  const dialog = page.getByRole('alertdialog');
  await expect(dialog.getByRole('alert')).toContainText('工作区正在使用中');
  await expect(dialog.getByRole('button', { name: '重试' })).toBeEnabled();
  await expect(dialog.getByRole('button', { name: '取消' })).toBeEnabled();
});

test('disabled trigger cannot open confirmation', async ({ page }) => {
  const trigger = await open(page, 'disabled');
  await expect(trigger).toBeDisabled();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
});

test('Playground Controls update the same story and controlled open stays synchronized', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  const trigger = frame.getByRole('button', { name: '归档项目' });
  await expect(trigger).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-title"]').fill('确认归档当前工作区？');
  await page.locator('[id="control-confirmLabel"]').fill('确认归档');
  await trigger.click();
  await expect(page.locator('[id="control-open"]')).toBeChecked();
  const dialog = frame.getByRole('alertdialog');
  await expect(dialog).toContainText('确认归档当前工作区？');
  await expect(dialog.getByRole('button', { name: '确认归档' })).toBeVisible();
  await dialog.getByRole('button', { name: '取消' }).click();
  await expect(page.locator('[id="control-open"]')).not.toBeChecked();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: confirmation stays anchored, contained and accessible`, async ({ page }) => {
  const trigger = await open(page, 'keyboard-focus', `theme:${theme};density:${density}`);
  await trigger.click();
  const dialog = page.getByRole('alertdialog');
  const [triggerBox, dialogBox] = await Promise.all([trigger.boundingBox(), dialog.boundingBox()]);
  expect(triggerBox).not.toBeNull();
  expect(dialogBox).not.toBeNull();
  expect(Math.abs((triggerBox!.x + triggerBox!.width / 2) - (dialogBox!.x + dialogBox!.width / 2))).toBeLessThan(2);
  expect(dialogBox!.y).toBeGreaterThanOrEqual(triggerBox!.y + triggerBox!.height - 2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  await page.screenshot({ path: `.logs/confirm-popover/${theme}-${density}.png`, fullPage: true });
});
