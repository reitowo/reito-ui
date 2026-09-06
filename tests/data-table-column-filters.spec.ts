import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-datatable-数据表格';
async function open(page: Page, story = 'column-filters', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const table = page.getByRole('region', { name: story === 'remote-column-filters' ? '远程筛选任务' : '可筛选任务' });
  await expect(table).toBeVisible();
  return table;
}

async function applyTextFilter(page: Page, table: ReturnType<Page['getByRole']>, text: string) {
  await table.getByRole('button', { name: '任务列筛选' }).click();
  await page.getByRole('textbox', { name: '任务筛选值' }).fill(text);
  await page.getByRole('button', { name: '应用' }).last().click();
}

test('text filter applies case-insensitive contains and clear-all restores rows', async ({ page }) => {
  const table = await open(page);
  await applyTextFilter(page, table, '任务 1');
  await expect(table.getByText('共 11 条 · 已选 0 条 · 1 个列筛选')).toBeVisible();
  await table.getByRole('button', { name: '清除列筛选' }).click();
  await expect(table.getByText('共 23 条 · 已选 0 条')).toBeVisible();
});

test('select filter combines selected values with OR', async ({ page }) => {
  const table = await open(page);
  await table.getByRole('button', { name: '负责人列筛选' }).click();
  await page.getByRole('checkbox', { name: 'Reito' }).click();
  await page.getByRole('checkbox', { name: 'Lin' }).click();
  await page.getByRole('button', { name: '应用' }).last().click();
  await expect(table.getByText('共 16 条 · 已选 0 条 · 1 个列筛选')).toBeVisible();
});

test('inclusive numeric range filters column values', async ({ page }) => {
  const table = await open(page);
  await table.getByRole('button', { name: '评分列筛选' }).click();
  await page.getByRole('spinbutton', { name: '评分最小值' }).fill('30');
  await page.getByRole('spinbutton', { name: '评分最大值' }).fill('50');
  await page.getByRole('button', { name: '应用' }).last().click();
  await expect(table.getByText('共 7 条 · 已选 0 条 · 1 个列筛选')).toBeVisible();
});

test('date range and select filters combine across columns with AND', async ({ page }) => {
  const table = await open(page);
  await table.getByRole('button', { name: '负责人列筛选' }).click();
  await page.getByRole('checkbox', { name: 'Reito' }).click();
  await page.getByRole('button', { name: '应用' }).last().click();
  await table.getByRole('button', { name: '更新日期列筛选' }).click();
  await page.getByLabel('更新日期开始日期').fill('2026-09-05');
  await page.getByLabel('更新日期结束日期').fill('2026-09-10');
  await page.getByRole('button', { name: '应用' }).last().click();
  await expect(table.getByText('共 2 条 · 已选 0 条 · 2 个列筛选')).toBeVisible();
  await expect(table.getByText('远程任务 7')).toBeVisible();
  await expect(table.getByText('远程任务 10')).toBeVisible();
});

test('invalid ranges keep Apply disabled and explain the error', async ({ page }) => {
  const table = await open(page);
  await table.getByRole('button', { name: '评分列筛选' }).click();
  await page.getByRole('spinbutton', { name: '评分最小值' }).fill('80');
  await page.getByRole('spinbutton', { name: '评分最大值' }).fill('20');
  await expect(page.getByRole('alert')).toHaveText('最小值不能大于最大值');
  await expect(page.getByRole('button', { name: '应用' })).toBeDisabled();
});

test('manual filters reset pagination and emit a stable server query', async ({ page }) => {
  const table = await open(page, 'remote-column-filters');
  await expect(table.getByText('共 8 条 · 已选 0 条 · 1 个列筛选')).toBeVisible();
  await table.getByRole('button', { name: '下一页' }).click();
  await expect(table.getByText('第 2 / 2 页')).toBeVisible();
  await table.getByRole('button', { name: '评分列筛选' }).click();
  await page.getByRole('combobox', { name: '评分匹配方式' }).selectOption('atLeast');
  await page.getByRole('spinbutton', { name: '评分数值' }).fill('50');
  await page.getByRole('button', { name: '应用' }).last().click();
  await expect(table.getByText('共 4 条 · 已选 0 条 · 2 个列筛选')).toBeVisible();
  await expect(table.getByText('第 1 / 1 页')).toBeVisible();
  await expect(page.getByLabel('远程筛选查询')).toHaveText('[{"field":"owner","kind":"select","operator":"in","values":["Reito"]},{"field":"score","kind":"number","operator":"atLeast","value":50}]');
});

test('Playground Controls change filter props without changing tabs', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('region', { name: '本地任务' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-ownerFilter"]').selectOption('Reito');
  await expect(frame.getByText('共 3 条 · 已选 0 条 · 1 个列筛选')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: filter menus are accessible and page width stays bounded`, async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  const table = await open(page, 'column-filters', `theme:${theme};density:${density}`);
  await table.getByRole('button', { name: '负责人列筛选' }).click();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/data-table-column-filters/${theme}-${density}.png`, fullPage: true });
});
