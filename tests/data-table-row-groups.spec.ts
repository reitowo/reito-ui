import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-datatable-数据表格';
async function open(page: Page, story: 'row-expansion' | 'row-grouping', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const table = page.getByRole('region', { name: story === 'row-expansion' ? '层级任务' : '分组任务' });
  await expect(table).toBeVisible();
  return table;
}

test('hierarchical parent expansion reveals stable child rows', async ({ page }) => {
  const table = await open(page, 'row-expansion');
  await expect(table.getByText('压缩表格密度')).toBeVisible();
  await table.getByRole('button', { name: '折叠记录 EPIC-01' }).click();
  await expect(table.getByText('压缩表格密度')).toHaveCount(0);
  await table.getByRole('button', { name: '展开记录 EPIC-01' }).click();
  await expect(table.getByText('压缩表格密度')).toBeVisible();
});

test('leaf detail row expands with an announced toggle', async ({ page }) => {
  const table = await open(page, 'row-expansion');
  const toggle = table.getByRole('button', { name: '展开记录 TASK-101' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(table.getByText('统一使用 cell padding tokens，并完成四种主题密度检查。')).toBeVisible();
  await expect(table.getByRole('button', { name: '折叠记录 TASK-101' })).toHaveAttribute('aria-expanded', 'true');
});

test('selection survives parent collapse and restore', async ({ page }) => {
  const table = await open(page, 'row-expansion');
  await table.getByRole('checkbox', { name: '选择记录 TASK-101' }).click();
  await expect(table.getByText('共 2 条 · 已选 1 条')).toBeVisible();
  await table.getByRole('button', { name: '折叠记录 EPIC-01' }).click();
  await table.getByRole('button', { name: '展开记录 EPIC-01' }).click();
  await expect(table.getByRole('checkbox', { name: '选择记录 TASK-101' })).toBeChecked();
});

test('row grouping renders group labels, summaries and aggregated cells', async ({ page }) => {
  const table = await open(page, 'row-grouping');
  await expect(table.getByText('1 层分组', { exact: false })).toBeVisible();
  await expect(table.getByText(/Reito · 4 项/)).toBeVisible();
  await expect(table.getByText('分组汇总：4 项任务').first()).toBeVisible();
  await expect(table.getByText(/平均 \d+/).first()).toBeVisible();
});

test('group expansion hides descendants while retaining summary', async ({ page }) => {
  const table = await open(page, 'row-grouping');
  const toggle = table.getByRole('button', { name: /折叠分组 owner:Reito/ });
  await toggle.click();
  await expect(table.getByText('远程任务 1', { exact: true })).toHaveCount(0);
  await expect(table.getByText('分组汇总：4 项任务').first()).toBeVisible();
  await expect(table.getByRole('button', { name: /展开分组 owner:Reito/ })).toHaveAttribute('aria-expanded', 'false');
});

test('group selection selects only stable leaf IDs and survives collapse', async ({ page }) => {
  const table = await open(page, 'row-grouping');
  await table.getByRole('checkbox', { name: /选择分组 owner:Reito/ }).click();
  await expect(table.getByText('共 12 条 · 已选 4 条')).toBeVisible();
  await expect(table.getByRole('checkbox', { name: '选择记录 REMOTE-01' })).toBeChecked();
  await table.getByRole('button', { name: /折叠分组 owner:Reito/ }).click();
  await expect(table.getByRole('checkbox', { name: /选择分组 owner:Reito/ })).toBeChecked();
});

test('leaf-first filtering keeps only matching grouped descendants', async ({ page }) => {
  const table = await open(page, 'row-grouping');
  await userFilter(table, '远程任务 1');
  await expect(table.getByText(/Reito · 2 项/)).toBeVisible();
  await expect(table.getByText(/Lin · 1 项/)).toBeVisible();
  await expect(table.getByText(/Ming · 1 项/)).toBeVisible();
  await expect(table.getByText('共 4 条', { exact: false })).toBeVisible();
});

async function userFilter(table: Awaited<ReturnType<typeof open>>, value: string) {
  const input = table.getByRole('textbox', { name: '筛选分组任务' });
  await input.fill(value);
}

test('grouping menu adds and reorders a second level with keyboard parity', async ({ page }) => {
  const table = await open(page, 'row-grouping');
  await table.getByRole('button', { name: /行分组，已选 1 项/ }).click();
  await page.getByRole('checkbox', { name: '状态' }).click();
  await expect(table.getByText('2 层分组', { exact: false })).toBeVisible();
  const status = page.getByLabel('管理状态分组');
  await status.focus();
  await status.press('Alt+ArrowUp');
  await expect(status).toBeFocused();
  await expect(page.getByRole('button', { name: '状态上移一层' })).toBeDisabled();
});

test('grouping can be cleared without changing the current story', async ({ page }) => {
  const table = await open(page, 'row-grouping');
  await table.getByRole('button', { name: /行分组，已选 1 项/ }).click();
  await page.getByRole('button', { name: '清除行分组' }).click();
  await expect(table.getByText('1 层分组', { exact: false })).toHaveCount(0);
  await expect(table.getByText('远程任务 1', { exact: true })).toBeVisible();
});

test('Playground exposes grouping and expansion props in the same tab', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('region', { name: '本地任务' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-groupByOwner"]').evaluate((element: HTMLInputElement) => element.click());
  await expect(frame.getByText('1 层分组', { exact: false })).toBeVisible();
  await page.locator('[id="control-expandableRows"]').evaluate((element: HTMLInputElement) => element.click());
  await expect(frame.getByText('的本地详情预览。', { exact: false }).first()).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: grouped rows remain dense, accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  const table = await open(page, 'row-grouping', `theme:${theme};density:${density}`);
  const firstRow = table.locator('tbody tr').first();
  const height = (await firstRow.boundingBox())?.height ?? 0;
  expect(height).toBeLessThan(density === 'compact' ? 38 : 50);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/data-table-row-groups/${theme}-${density}.png`, fullPage: true });
});
