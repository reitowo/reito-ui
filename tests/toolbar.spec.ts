import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-toolbar-工具栏';
async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const toolbar = page.getByRole('toolbar').first();
  await expect(toolbar).toBeVisible({ timeout: 15_000 });
  return toolbar;
}

test('toolbar exposes labelled groups and one roving tab stop', async ({ page }) => {
  const toolbar = await open(page);
  await expect(toolbar).toHaveAttribute('aria-label', '编辑操作');
  await expect(toolbar.getByRole('group', { name: '历史' })).toBeVisible();
  await expect(toolbar.getByRole('group', { name: '格式' })).toBeVisible();
  await expect(toolbar.locator('button[tabindex="0"]')).toHaveCount(1);
  await expect(toolbar.getByRole('button', { name: '撤销' })).toHaveAttribute('tabindex', '0');
});

test('toggle state is controlled and announced with aria-pressed', async ({ page }) => {
  const toolbar = await open(page);
  const bold = toolbar.getByRole('button', { name: '加粗' });
  await expect(bold).toHaveAttribute('aria-pressed', 'true');
  await bold.click();
  await expect(bold).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('status')).toHaveText('加粗：关闭');
});

test('arrow keys skip disabled actions and Home/End include the overflow trigger', async ({ page }) => {
  const toolbar = await open(page);
  const undo = toolbar.getByRole('button', { name: '撤销' });
  await undo.focus();
  await page.keyboard.press('ArrowRight');
  expect(await toolbar.getByRole('button', { name: '加粗' }).evaluate(element => element === document.activeElement)).toBe(true);
  await page.keyboard.press('End');
  expect(await toolbar.getByRole('button', { name: '更多操作' }).evaluate(element => element === document.activeElement)).toBe(true);
  await page.keyboard.press('Home');
  expect(await undo.evaluate(element => element === document.activeElement)).toBe(true);
});

test('menu overflow keeps moved actions reachable with Base UI keyboard behavior', async ({ page }) => {
  const toolbar = await open(page);
  const trigger = toolbar.getByRole('button', { name: '更多操作' });
  await expect(toolbar.getByRole('button', { name: '预览' })).toHaveCount(0);
  await trigger.click();
  const first = page.getByRole('menuitem', { name: '预览' });
  await expect(first).toBeVisible();
  await first.focus();
  await page.keyboard.press('End');
  expect(await page.getByRole('menuitem', { name: '检查器' }).evaluate(element => element === document.activeElement)).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(() => trigger.evaluate(element => element === document.activeElement)).toBe(true);
});

test('scroll overflow keeps every action in the toolbar and creates no menu', async ({ page }) => {
  const toolbar = await open(page, 'scroll-overflow');
  await expect(toolbar.getByRole('button', { name: '打开预览' })).toBeVisible();
  await expect(toolbar.getByRole('button', { name: '打开检查器' })).toBeVisible();
  await expect(toolbar.getByRole('button', { name: '更多操作' })).toHaveCount(0);
  const scroller = toolbar.locator('[data-slot="toolbar-items"]');
  expect(await scroller.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
});

test('loading overflow items and disabled toolbar cannot repeat actions', async ({ page }) => {
  let toolbar = await open(page, 'disabled-and-loading');
  await toolbar.getByRole('button', { name: '更多操作' }).click();
  const loading = page.getByRole('menuitem', { name: '共享快照' });
  await expect(loading).toHaveAttribute('aria-busy', 'true');
  await expect(loading).toHaveAttribute('data-disabled');
  toolbar = await open(page, 'entire-toolbar-disabled');
  await expect(toolbar).toHaveAttribute('aria-disabled', 'true');
  for (const button of await toolbar.getByRole('button').all()) await expect(button).toBeDisabled();
});

test('Playground Controls update layout props without changing story', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  const toolbar = frame.getByRole('toolbar');
  await expect(toolbar).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-showLabels"]').evaluate((element: HTMLInputElement) => element.click());
  await expect(toolbar.getByRole('button', { name: '撤销' })).toContainText('撤销');
  await page.locator('[id="control-size"]').selectOption('sm');
  await expect(toolbar).toHaveAttribute('data-size', 'sm');
  await page.locator('[id="control-status"]').fill('检查完成');
  await expect(toolbar.locator('[data-slot="toolbar-status"]')).toHaveText('检查完成');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: toolbar stays contained and accessible`, async ({ page }) => {
  const toolbar = await open(page, 'default', `theme:${theme};density:${density}`);
  expect((await toolbar.boundingBox())!.height).toBeLessThan(52);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  await page.screenshot({ path: `.logs/toolbar/${theme}-${density}.png`, fullPage: true });
});
