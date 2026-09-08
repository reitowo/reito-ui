import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-commandsearch-命令搜索';

async function openStory(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('#storybook-root')).toBeVisible({ timeout: 15_000 });
}

test('application search exposes current context and cross-resource actions', async ({ page }) => {
  await openStory(page, 'application-dialog');
  await expect(page.getByText('当前工作')).toBeVisible();
  await expect(page.getByText('reito-ui / Workspace.stories.tsx')).toBeVisible();
  await expect(page.getByRole('group', { name: '文件' })).toBeVisible();
  await expect(page.getByRole('group', { name: '任务' })).toBeVisible();
  await expect(page.getByRole('group', { name: '操作' })).toBeVisible();
  await expect(page.getByRole('option', { name: /Workspace\.stories\.tsx.*打开/ })).toBeVisible();
  await expect(page.getByRole('option', { name: /统一应用搜索.*查看/ })).toBeVisible();
  await expect(page.getByRole('option', { name: /运行组件检查.*运行/ })).toBeVisible();
});

test('Ctrl+K opens the dialog and Escape restores trigger focus', async ({ page }) => {
  await openStory(page, 'shortcut-and-focus');
  const trigger = page.getByRole('button', { name: /搜索文件、任务与操作/ });
  await trigger.focus();
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('combobox', { name: '搜索应用' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('IME composition shortcut event does not open the search', async ({ page }) => {
  await openStory(page, 'shortcut-and-focus');
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, isComposing: true })));
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('successful asynchronous action reports progress, closes and restores focus', async ({ page }) => {
  await openStory(page, 'shortcut-and-focus');
  const trigger = page.getByRole('button', { name: /搜索文件、任务与操作/ });
  await trigger.click();
  const input = page.getByRole('combobox', { name: '搜索应用' });
  await input.fill('运行组件');
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(page.getByRole('status')).toContainText('正在执行操作…');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('status')).toContainText('已选择：运行组件检查');
  await expect(trigger).toBeFocused();
});

test('failed asynchronous action remains open and can return to results', async ({ page }) => {
  await openStory(page, 'action-failure');
  const input = page.getByRole('combobox', { name: '搜索应用' });
  await input.fill('运行组件');
  await input.press('ArrowDown');
  await input.press('Enter');
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('操作未完成，请重试。');
  await alert.getByRole('button', { name: '重试' }).click();
  await expect(page.getByRole('option', { name: /运行组件检查/ })).toBeVisible();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('host-injected async source distinguishes loading, results, failure and retry', async ({ page }) => {
  await openStory(page, 'async-sources');
  const input = page.getByRole('combobox', { name: '异步搜索应用资源' });
  await input.fill('Workspace');
  await expect(input).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByRole('status')).toContainText('正在加载命令…');
  await expect(page.getByRole('option', { name: /Workspace\.stories\.tsx/ })).toBeVisible();
  await input.fill('失败');
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('本地索引暂时不可用');
  await alert.getByRole('button', { name: '重试' }).click();
  await expect(page.getByRole('option', { name: /失败恢复结果/ })).toBeVisible();
});

test('Playground Controls switch inline/dialog states without changing stories', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('dialog')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('switch', { name: 'modal' }).press('Space');
  await expect(frame.getByRole('dialog')).toHaveCount(0);
  await expect(frame.getByRole('combobox', { name: '搜索应用' })).toBeVisible();
  await page.locator('[id="control-context"]').fill('当前项目 / docs');
  await expect(frame.getByText('当前项目 / docs')).toBeVisible();
  await page.locator('[id="control-error"]').fill('索引离线');
  await expect(frame.getByRole('alert')).toContainText('索引离线');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: application search dialog is accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 760 });
  await openStory(page, 'application-dialog', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/application-search/${theme}-${density}.png`, fullPage: true });
});
