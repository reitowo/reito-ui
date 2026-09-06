import { test, expect, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-datatable-数据表格';
type VirtualStory = 'virtual-rows' | 'virtual-remote-page' | 'virtual-pinned-expansion';

async function open(page: Page, story: VirtualStory, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const names = { 'virtual-rows': '五万行虚拟任务', 'virtual-remote-page': '远程虚拟任务', 'virtual-pinned-expansion': '可展开虚拟任务' };
  const region = page.getByRole('region', { name: names[story] });
  await expect(region).toBeVisible();
  await expect(region.locator('tbody[data-virtualized="true"] tr').first()).toBeVisible();
  return region;
}

function viewport(region: Locator) {
  return region.locator(':scope > div.overflow-auto');
}

test('50,000 rows keep a bounded DOM window', async ({ page }) => {
  const region = await open(page, 'virtual-rows');
  await expect(region.getByText('共 50000 条', { exact: false })).toBeVisible();
  const rendered = region.locator('tbody[data-virtualized="true"] tr');
  expect(await rendered.count()).toBeGreaterThan(3);
  expect(await rendered.count()).toBeLessThan(40);
});

test('row ID scroll targeting reaches a deep item without rendering the intervening rows', async ({ page }) => {
  const region = await open(page, 'virtual-rows');
  await page.getByRole('button', { name: '定位第 40001 行' }).click();
  await expect(region.locator('[data-row-id="VIRTUAL-040001"]')).toBeVisible();
  const output = await page.locator('output').innerText();
  const visible = output.match(/visible=VIRTUAL-(\d+)…VIRTUAL-(\d+)/);
  expect(Number(visible?.[1])).toBeLessThanOrEqual(40001);
  expect(Number(visible?.[2])).toBeGreaterThanOrEqual(40001);
  expect(await viewport(region).evaluate(element => element.scrollTop)).toBeGreaterThan(1_000_000);
  expect(await region.locator('tbody[data-virtualized="true"] tr').count()).toBeLessThan(40);
});

test('stable row selection survives virtual unmount and remount', async ({ page }) => {
  const region = await open(page, 'virtual-rows');
  const first = region.getByRole('checkbox', { name: '选择记录 VIRTUAL-000001' });
  await first.click();
  await page.getByRole('button', { name: '定位第 40001 行' }).click();
  await expect(first).toHaveCount(0);
  await page.getByRole('button', { name: '回到第 1 行' }).click();
  await expect(region.getByRole('checkbox', { name: '选择记录 VIRTUAL-000001' })).toBeChecked();
  await expect(region.getByText('已选 1 条', { exact: false })).toBeVisible();
});

test('pinned edge cells retain their viewport position during horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 900 });
  const region = await open(page, 'virtual-rows');
  const scroller = viewport(region);
  const left = region.getByText('虚拟任务 1', { exact: true });
  const right = region.getByText('2026-09-02', { exact: true });
  const beforeLeft = await left.boundingBox();
  const beforeRight = await right.boundingBox();
  await expect(left).toBeVisible();
  await expect(right).toBeVisible();
  await scroller.evaluate(element => { element.scrollLeft = element.scrollWidth; element.dispatchEvent(new Event('scroll')); });
  await expect.poll(() => scroller.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  const afterLeft = await left.boundingBox();
  const afterRight = await right.boundingBox();
  expect(Math.abs((afterLeft?.x ?? 0) - (beforeLeft?.x ?? 0))).toBeLessThan(2);
  expect(Math.abs((afterRight?.x ?? 0) - (beforeRight?.x ?? 0))).toBeLessThan(2);
});

test('expanded details are measured as independent virtual entries', async ({ page }) => {
  const region = await open(page, 'virtual-pinned-expansion');
  await region.getByRole('checkbox', { name: '选择记录 VIRTUAL-000001' }).click();
  await region.getByRole('button', { name: '展开记录 VIRTUAL-000001' }).click();
  const detail = region.locator('[data-expanded-row="VIRTUAL-000001"]');
  await expect(detail).toContainText('虚拟化详情');
  await expect(region.getByRole('checkbox', { name: '选择记录 VIRTUAL-000001' })).toBeChecked();
  const rowBox = await region.locator('[data-row-id="VIRTUAL-000002"]').boundingBox();
  const detailBox = await detail.boundingBox();
  expect(rowBox?.y ?? 0).toBeGreaterThanOrEqual((detailBox?.y ?? 0) + (detailBox?.height ?? 0) - 1);
});

test('manual page reports its loading boundary and requests the next page', async ({ page }) => {
  const region = await open(page, 'virtual-remote-page');
  const scroller = viewport(region);
  await scroller.evaluate(element => { element.scrollTop = element.scrollHeight; element.dispatchEvent(new Event('scroll')); });
  await expect(page.locator('output')).toContainText('第 1 页末端');
  await region.getByRole('button', { name: '下一页' }).click();
  await expect(region.locator('[data-row-id="VIRTUAL-001001"]')).toBeVisible();
  await expect(region.getByText('第 2 / 100 页')).toBeVisible();
  expect(await region.locator('tbody[data-virtualized="true"] tr').count()).toBeLessThan(40);
});

test('Playground enables virtualization with a prop in the same Storybook tab', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('switch', { name: 'virtualized' }).press('Space');
  await expect(frame.locator('tbody[data-virtualized="true"]')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: virtual expansion remains compact, contained and accessible`, async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  const region = await open(page, 'virtual-pinned-expansion', `theme:${theme};density:${density}`);
  await region.getByRole('button', { name: '展开记录 VIRTUAL-000001' }).click();
  const first = region.locator('[data-row-id="VIRTUAL-000001"]');
  const rowHeight = await first.evaluate(element => element.getBoundingClientRect().height);
  expect(rowHeight).toBeLessThan(density === 'compact' ? 42 : 50);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/data-table-virtual/${theme}-${density}.png`, fullPage: true });
});
