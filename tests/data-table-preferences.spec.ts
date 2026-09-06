import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-datatable-数据表格';

async function open(page: Page, story: 'export-scopes' | 'remote-export' | 'saved-views', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const names = { 'export-scopes': '本地导出任务', 'remote-export': '远程导出任务', 'saved-views': '偏好视图任务' };
  const table = page.getByRole('region', { name: names[story] });
  await expect(table).toBeVisible();
  return table;
}

test('local current-page export sends five source rows and visible columns', async ({ page }) => {
  const table = await open(page, 'export-scopes');
  await table.getByRole('button', { name: '导出' }).click();
  await page.getByRole('button', { name: '请求导出', exact: true }).click();
  await expect(page.getByText('current-page · csv · cols=5 · loaded=5 · ids=5 · host=false')).toBeVisible();
});

test('filtered export uses the full filtered row model rather than the current page', async ({ page }) => {
  const table = await open(page, 'export-scopes');
  await table.getByRole('textbox', { name: '筛选本地导出任务' }).fill('远程任务 1');
  await table.getByRole('button', { name: '导出' }).click();
  await page.getByRole('combobox', { name: '导出范围' }).selectOption('filtered');
  await page.getByRole('button', { name: '请求导出', exact: true }).click();
  await expect(page.getByText(/filtered · csv · cols=5 · loaded=11 · ids=11 · host=false/)).toBeVisible();
});

test('selected export preserves stable selected IDs', async ({ page }) => {
  const table = await open(page, 'export-scopes');
  await table.getByRole('checkbox', { name: '选择记录 REMOTE-01' }).click();
  await table.getByRole('checkbox', { name: '选择记录 REMOTE-02' }).click();
  await table.getByRole('button', { name: '导出' }).click();
  await page.getByRole('combobox', { name: '导出范围' }).selectOption('selected');
  await page.getByRole('combobox', { name: '导出格式' }).selectOption('json');
  await page.getByRole('button', { name: '请求导出', exact: true }).click();
  await expect(page.getByText('selected · json · cols=5 · loaded=2 · ids=2 · host=false')).toBeVisible();
});

test('manual all export marks that the host must resolve the complete dataset', async ({ page }) => {
  const table = await open(page, 'remote-export');
  await table.getByRole('button', { name: '导出' }).click();
  await page.getByRole('combobox', { name: '导出范围' }).selectOption('all');
  await page.getByRole('button', { name: '请求导出', exact: true }).click();
  await expect(page.getByText('all · csv · cols=5 · loaded=5 · ids=5 · host=true')).toBeVisible();
});

test('compatible view restores query, visibility, pinning, sorting and page size', async ({ page }) => {
  const table = await open(page, 'saved-views');
  await table.getByRole('button', { name: '视图' }).click();
  await page.getByRole('button', { name: '最近待审', exact: true }).click();
  await expect(table.getByRole('textbox', { name: '筛选偏好视图任务' })).toHaveValue('远程任务 1');
  await expect(table.getByRole('columnheader', { name: '评分' })).toHaveCount(0);
  await expect(table.getByRole('combobox', { name: '每页记录数' })).toHaveValue('10');
  await expect(table.getByRole('columnheader', { name: /更新日期/ })).toHaveAttribute('aria-sort', 'descending');
});

test('schema mismatch disables a stale view with an explicit reason', async ({ page }) => {
  const table = await open(page, 'saved-views');
  await table.getByRole('button', { name: '视图' }).click();
  const stale = page.getByRole('button', { name: '旧版布局 已失效', exact: true });
  await expect(stale).toBeDisabled();
  await expect(stale).toHaveAttribute('title', '视图版本已失效');
});

test('host can save and delete named view snapshots', async ({ page }) => {
  const table = await open(page, 'saved-views');
  await table.getByRole('button', { name: '视图' }).click();
  await page.getByRole('textbox', { name: '新视图名称' }).fill('我的紧凑视图');
  await page.getByRole('button', { name: '保存' }).click();
  await expect(page.getByRole('button', { name: '我的紧凑视图', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '删除视图 我的紧凑视图' }).click();
  await expect(page.getByRole('button', { name: '我的紧凑视图', exact: true })).toHaveCount(0);
});

test('Playground enables export and view props without changing tabs', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('switch', { name: 'toolbarActions' }).press('Space');
  await expect(frame.getByRole('button', { name: '导出' })).toBeVisible();
  await expect(frame.getByRole('button', { name: '视图' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: preference popover stays accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  const table = await open(page, 'saved-views', `theme:${theme};density:${density}`);
  await table.getByRole('button', { name: '视图' }).click();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/data-table-preferences/${theme}-${density}.png`, fullPage: true });
});
