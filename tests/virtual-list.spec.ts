import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
async function open(page: Page, args = '', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=复杂-virtuallist-虚拟列表--playground&viewMode=story&args=${args}&globals=${globals}`);
  const list = page.getByRole('list', { name: '本地虚拟项目' });
  return { list, rows: page.getByRole('listitem'), middle: page.getByRole('button', { name: '定位中间' }), end: page.getByRole('button', { name: '定位末项' }), start: page.getByRole('button', { name: '回到首项' }) };
}
test('100000 items retain a bounded DOM and can locate middle and last rows', async ({ page }) => {
  const f = await open(page, 'count:100000');
  await expect(f.rows.first()).toHaveAttribute('aria-posinset', '1');
  expect(await f.rows.count()).toBeLessThan(30);
  await f.middle.click(); await expect(page.getByText('项目 50001', { exact: true })).toBeVisible();
  expect(await f.rows.count()).toBeLessThan(30);
  await f.end.click(); await expect(page.getByText('项目 100000', { exact: true })).toBeVisible();
  await expect(f.rows.last()).toHaveAttribute('aria-setsize', '100000');
  await f.start.click(); await expect(page.getByText('项目 1', { exact: true })).toBeVisible();
});
test('sparse range reports allow host filling at a distant index', async ({ page }) => {
  const f = await open(page, 'sparse:true');
  await expect(page.getByText('项目 1', { exact: true })).toBeVisible();
  await f.middle.click();
  await expect(page.getByText('项目 5001', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('可见');
  expect(await f.rows.count()).toBeLessThan(30);
});
test('load failure retries into the list', async ({ page }) => {
  const f = await open(page, 'scenario:error');
  await expect(page.getByRole('alert')).toHaveText('本地加载失败');
  await page.getByRole('button', { name: '重试' }).click();
  await expect(f.rows.first()).toHaveText('项目 1');
});
for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: token row size, keyboard and narrow list semantics`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const f = await open(page, '', `theme:${theme};density:${density}`);
  await expect(f.rows.first()).toBeVisible();
  expect(await f.rows.first().evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 36 : 46);
  await f.list.focus(); await f.list.press('End'); await expect(page.getByText('项目 10000', { exact: true })).toBeVisible();
  await f.list.press('Home'); await expect(page.getByText('项目 1', { exact: true })).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/virtual-list/${theme}-${density}.png`, fullPage: true });
});
test('Controls adjust count and overscan and recover from empty without leaving the story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent('复杂-virtuallist-虚拟列表--playground')}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('listitem').first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-count"]').fill('100');
  await frame.getByRole('button', { name: '定位末项' }).click();
  await expect(frame.getByText('项目 100', { exact: true })).toBeVisible();
  await page.locator('[id="control-count"]').fill('10');
  await expect(frame.getByText('项目 10', { exact: true })).toBeVisible();
  await page.locator('[id="control-count"]').fill('100');
  await frame.getByRole('button', { name: '回到首项' }).click();
  await page.locator('[id="control-overscan"]').fill('0');
  const low = await frame.getByRole('listitem').count();
  await page.locator('[id="control-overscan"]').fill('10');
  await expect.poll(() => frame.getByRole('listitem').count()).toBeGreaterThan(low);
  await page.locator('[id="control-scenario"]').selectOption({ label: 'empty' });
  await expect(frame.getByText('暂无项目')).toBeVisible();
  await page.locator('[id="control-scenario"]').selectOption({ label: 'ready' });
  await expect(frame.getByRole('listitem').first()).toBeVisible();
  await page.locator('[id="control-viewportSize"]').selectOption({ label: 'small' });
  await expect.poll(() => frame.getByRole('list').evaluate(element => element.getBoundingClientRect().height)).toBe(256);
  await page.locator('[id="control-viewportSize"]').selectOption({ label: 'large' });
  await expect.poll(() => frame.getByRole('list').evaluate(element => element.getBoundingClientRect().height)).toBe(384);
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});
