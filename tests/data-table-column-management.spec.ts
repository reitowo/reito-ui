import { chooseSelectOption, storybookUrl } from './select-option';
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-datatable-数据表格';
async function open(page: Page, globals = 'theme:dark;density:compact') { await page.goto(`${storybookUrl}/iframe.html?id=${prefix}--column-management&viewMode=story&globals=${globals}`); const table = page.getByRole('region', { name: '可管理任务' }); await expect(table).toBeVisible(); return table; }
async function manager(page: Page, table: Awaited<ReturnType<typeof open>>) { await table.getByRole('button', { name: '列' }).click(); return page.getByText('显示、固定与排序；Alt+↑/↓ 可移动当前列。').locator('..').locator('..'); }

test('grouped headers retain structure while configured columns are hidden and pinned', async ({ page }) => {
  const table = await open(page); await expect(table.getByRole('columnheader', { name: '任务信息' })).toBeVisible(); await expect(table.getByRole('columnheader', { name: '任务指标' })).toBeVisible(); await expect(table.getByRole('columnheader', { name: '状态', exact: true })).toHaveCount(0); await expect(table.getByRole('columnheader', { name: /任务 调整任务列宽/ })).toHaveCSS('position', 'sticky'); await expect(table.getByRole('columnheader', { name: /更新日期/ })).toHaveCSS('position', 'sticky');
});

test('column manager shows a hidden column without losing grouped headers', async ({ page }) => {
  const table = await open(page); await manager(page, table); await page.getByRole('checkbox', { name: '状态' }).click(); await expect(table.getByRole('columnheader', { name: '状态' })).toBeVisible(); await expect(table.getByRole('columnheader', { name: '任务信息' })).toBeVisible();
});

test('buttons reorder center columns and controlled order reaches the table', async ({ page }) => {
  const table = await open(page); await manager(page, table); await page.getByRole('button', { name: '评分前移' }).click(); const leaf = table.getByRole('row').nth(1).getByRole('columnheader'); await expect(leaf.nth(2)).toContainText('评分');
});

test('Alt+Arrow moves the focused column with a keyboard equivalent', async ({ page }) => {
  const table = await open(page); await manager(page, table); const row = page.getByLabel('管理评分列'); await row.focus(); await row.press('Alt+ArrowUp'); const leaf = table.getByRole('row').nth(1).getByRole('columnheader'); await expect(leaf.nth(2)).toContainText('评分'); await expect(row).toBeFocused();
});

test('pin select moves a column to the right sticky region', async ({ page }) => {
  const table = await open(page); await manager(page, table); await chooseSelectOption(page.getByRole('combobox', { name: '负责人固定位置' }), "右侧"); await expect(table.getByRole('columnheader', { name: /负责人/ })).toHaveCSS('position', 'sticky'); const leaf = table.getByRole('row').nth(1).getByRole('columnheader'); await expect(leaf.last()).toContainText('负责人');
});

test('resize separator supports keyboard increments and reset', async ({ page }) => {
  const table = await open(page); const separator = table.getByRole('separator', { name: '调整任务列宽' }); const before = Number(await separator.getAttribute('aria-valuenow')); await separator.press('ArrowRight'); await expect(separator).toHaveAttribute('aria-valuenow', String(before + 16)); await separator.dblclick(); await expect(separator).toHaveAttribute('aria-valuenow', String(before));
});

test('Playground exposes manager and resize props in the same tab', async ({ page }) => {
  await page.goto(`${storybookUrl}/?path=/story/${prefix}--playground`); const frame = page.frameLocator('#storybook-preview-iframe'); await expect(frame.getByRole('region', { name: '本地任务' })).toBeVisible({ timeout: 15000 }); await page.getByRole('tab', { name: /^Controls/ }).click(); const path = new URL(page.url()).searchParams.get('path'); await page.locator('[id="control-manageColumns"]').evaluate((element: HTMLInputElement) => element.click()); await expect(frame.getByRole('button', { name: '列', exact: true })).toBeVisible(); await page.locator('[id="control-resizableColumns"]').evaluate((element: HTMLInputElement) => element.click()); await expect(frame.getByRole('separator')).toHaveCount(4); expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: pinned grouped table and manager stay accessible`, async ({ page }) => { await page.setViewportSize({ width: 640, height: 900 }); const table = await open(page, `theme:${theme};density:${density}`); await manager(page, table); await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') }); expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: `.logs/data-table-column-management/${theme}-${density}.png`, fullPage: true }); });
