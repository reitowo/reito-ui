import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-banner-通知条';
async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const banner = page.locator('[data-slot="banner"]').first();
  await expect(banner).toBeVisible({ timeout: 15_000 });
  return banner;
}

test('static banner is a labelled region with readable content and actions', async ({ page }) => {
  const banner = await open(page);
  await expect(banner).toHaveAttribute('role', 'region');
  await expect(banner).toHaveAttribute('aria-label', '通知');
  await expect(banner).toContainText('组件索引可以更新');
  await expect(banner.getByRole('button', { name: '关闭通知' })).toBeVisible();
});

test('action and dismiss callbacks remain independent', async ({ page }) => {
  const banner = await open(page);
  await banner.getByRole('button', { name: '查看' }).click();
  await expect(page.getByRole('status')).toHaveText('已触发查看操作（本地示例）。');
  await banner.getByRole('button', { name: '关闭通知' }).click();
  await expect(banner).toBeHidden();
  await expect(page.getByRole('status')).toHaveText('已关闭本地通知。');
});

test('controlled dismiss can be reopened by the host', async ({ page }) => {
  let banner = await open(page, 'controlled-dismiss');
  await banner.getByRole('button', { name: '关闭通知' }).click();
  await expect(banner).toBeHidden();
  await page.getByRole('button', { name: '重新显示' }).click();
  banner = page.locator('[data-slot="banner"]');
  await expect(banner).toBeVisible();
});

test('live modes opt into status or alert semantics', async ({ page }) => {
  let banner = await open(page, 'polite-live');
  await expect(banner).toHaveAttribute('role', 'status');
  banner = await open(page, 'assertive-live');
  await expect(banner).toHaveAttribute('role', 'alert');
});

test('disabled and loading actions stay readable and non-repeatable', async ({ page }) => {
  let banner = await open(page, 'action-disabled');
  await expect(banner.getByRole('button', { name: '更新' })).toBeDisabled();
  banner = await open(page, 'action-loading');
  const action = banner.getByRole('button', { name: '更新中…' });
  await expect(action).toBeDisabled();
  await expect(action).toHaveAttribute('aria-busy', 'true');
  await expect(banner.getByRole('button', { name: '关闭通知' })).toBeEnabled();
});

test('long content wraps inside a narrow container without hiding actions', async ({ page }) => {
  const banner = await open(page, 'narrow');
  expect((await banner.boundingBox())!.width).toBeLessThanOrEqual(288);
  await expect(banner.getByRole('button', { name: '查看' })).toBeVisible();
  await expect(banner.getByRole('button', { name: '关闭通知' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Playground Controls update content and controlled visibility in one story', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  const banner = frame.locator('[data-slot="banner"]');
  await expect(banner).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-title"]').fill('新的本地通知');
  await expect(banner).toContainText('新的本地通知');
  await page.locator('[id="control-open"]').evaluate((element: HTMLInputElement) => element.click());
  await expect(banner).toBeHidden();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: banner stays compact, contained and accessible`, async ({ page }) => {
  const banner = await open(page, 'default', `theme:${theme};density:${density}`);
  expect((await banner.boundingBox())!.height).toBeLessThan(96);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  await page.screenshot({ path: `.logs/banner/${theme}-${density}.png`, fullPage: true });
});
