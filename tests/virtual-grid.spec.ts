import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function open(page: Page, args = '', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=复杂-virtualgrid-虚拟网格--playground&viewMode=story&args=${args}&globals=${globals}`);
  const grid = page.getByRole('grid', { name: '本地二维数据' });
  return { grid, cells: page.getByRole('gridcell'), middle: page.getByRole('button', { name: '定位中间' }), end: page.getByRole('button', { name: '定位右下' }), start: page.getByRole('button', { name: '定位左上' }) };
}

test('100000 by 10000 cells keep both axes bounded and retain stable identities', async ({ page }) => {
  const f = await open(page, 'rows:100000;columns:10000');
  await expect(f.grid).toHaveAttribute('aria-rowcount', '100000');
  await expect(f.grid).toHaveAttribute('aria-colcount', '10000');
  expect(await f.cells.count()).toBeLessThan(150);
  await f.middle.click();
  const middle = page.getByText('R50001 · C5001', { exact: true });
  await expect(middle).toBeVisible();
  await expect(middle.locator('xpath=ancestor-or-self::*[@role="gridcell"][1]')).toHaveAttribute('data-cell-key', 'cell-50000-5000');
  expect(await f.cells.count()).toBeLessThan(150);
  await f.end.click(); await expect(page.getByText('R100000 · C10000', { exact: true })).toBeVisible();
  await f.start.click(); await expect(page.getByText('R1 · C1', { exact: true })).toBeVisible();
});

test('keyboard changes the active cell across both axes and reaches corners', async ({ page }) => {
  const f = await open(page, 'rows:200;columns:100');
  await f.grid.focus();
  await f.grid.press('ArrowRight'); await f.grid.press('ArrowDown');
  await expect(page.getByRole('gridcell').filter({ hasText: 'R2 · C2' })).toHaveAttribute('data-active', 'true');
  await f.grid.press('End'); await expect(page.getByText('R200 · C100', { exact: true })).toBeVisible();
  await f.grid.press('Home'); await expect(page.getByText('R1 · C1', { exact: true })).toBeVisible();
});

test('explicit dimensions and range reporting update without replacing the story', async ({ page }) => {
  const f = await open(page, 'rows:1000;columns:500;rowSize:28;columnSize:112');
  const first = page.getByRole('gridcell', { name: 'R1 · C1', exact: true });
  await expect(first).toBeVisible();
  expect(await first.evaluate(element => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }))).toEqual({ width: 112, height: 28 });
  await f.middle.click();
  await expect(page.getByText('R501 · C251', { exact: true })).toBeVisible();
  const visible = await page.getByRole('status').textContent();
  const match = visible?.match(/行 (\d+)–(\d+) · 列 (\d+)–(\d+)/);
  expect(match).not.toBeNull();
  expect(Number(match?.[1])).toBeLessThanOrEqual(501); expect(Number(match?.[2])).toBeGreaterThanOrEqual(501);
  expect(Number(match?.[3])).toBeLessThanOrEqual(251); expect(Number(match?.[4])).toBeGreaterThanOrEqual(251);
});

test('empty, loading and error states recover locally', async ({ page }) => {
  await open(page, 'scenario:empty').then(async () => expect(page.getByText('暂无单元格')).toBeVisible());
  await open(page, 'scenario:loading').then(async () => expect(page.getByText('加载中…')).toBeVisible());
  await page.goto('http://127.0.0.1:6007/iframe.html?id=复杂-virtualgrid-虚拟网格--playground&viewMode=story&args=scenario:error');
  await expect(page.getByRole('alert')).toHaveText('本地二维数据加载失败');
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.getByText('R1 · C1', { exact: true })).toBeVisible();
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: token dimensions, keyboard, axe and narrow surface`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const f = await open(page, 'rows:1000;columns:500', `theme:${theme};density:${density}`);
  const first = page.getByRole('gridcell', { name: 'R1 · C1', exact: true });
  const expected = density === 'compact' ? { width: 160, height: 36 } : { width: 192, height: 46 };
  expect(await first.evaluate(element => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }))).toEqual(expected);
  await f.grid.focus(); await f.grid.press('End'); await expect(page.getByText('R1000 · C500', { exact: true })).toBeVisible();
  await f.grid.press('Home'); await expect(page.getByText('R1 · C1', { exact: true })).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/virtual-grid/${theme}-${density}.png`, fullPage: true });
});

test('Controls resize the grid and change both counts on one Storybook tab', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent('复杂-virtualgrid-虚拟网格--playground')}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('gridcell').first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-rows"]').fill('200');
  await page.locator('[id="control-columns"]').fill('80');
  await frame.getByRole('button', { name: '定位右下' }).click();
  await expect(frame.getByText('R200 · C80', { exact: true })).toBeVisible();
  await page.locator('[id="control-rowSize"]').fill('30');
  await page.locator('[id="control-columnSize"]').fill('120');
  await frame.getByRole('button', { name: '定位左上' }).click();
  const first = frame.getByRole('gridcell', { name: 'R1 · C1', exact: true });
  await expect.poll(() => first.evaluate(element => element.getBoundingClientRect().height)).toBe(30);
  await expect.poll(() => first.evaluate(element => element.getBoundingClientRect().width)).toBe(120);
  await page.locator('[id="control-viewportSize"]').selectOption({ label: 'small' });
  await expect.poll(() => frame.getByRole('grid').evaluate(element => element.getBoundingClientRect().height)).toBe(256);
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});
