import { chooseSelectOption, storybookUrl } from './select-option';
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-datatable-数据表格';
async function open(page: Page, story = 'remote-controlled', globals = 'theme:dark;density:compact') { await page.goto(`${storybookUrl}/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`); const table = page.getByRole('region', { name: '远程任务' }); await expect(table).toBeVisible(); return table; }

test('manual mode renders one remote page with the server total', async ({ page }) => {
  const table = await open(page); await expect(table.getByText('共 23 条 · 已选 0 条')).toBeVisible(); await expect(table.getByRole('row')).toHaveCount(6); await expect(table.getByText('第 1 / 5 页')).toBeVisible();
});

test('stable row IDs preserve controlled selection across remote pages', async ({ page }) => {
  const table = await open(page); await table.getByRole('checkbox', { name: '选择记录 REMOTE-01' }).click(); await table.getByRole('button', { name: '下一页' }).click(); await table.getByRole('checkbox', { name: '选择记录 REMOTE-06' }).click(); await expect(table.getByText('共 23 条 · 已选 2 条')).toBeVisible(); await table.getByRole('button', { name: '上一页' }).click(); await expect(table.getByRole('checkbox', { name: '选择记录 REMOTE-01' })).toBeChecked();
});

test('remote sorting resets pagination and delegates the sorted page to the host', async ({ page }) => {
  const table = await open(page); await table.getByRole('button', { name: '下一页' }).click(); await expect(table.getByText('第 2 / 5 页')).toBeVisible(); await table.getByRole('button', { name: '任务' }).click(); await expect(table.getByText('第 1 / 5 页')).toBeVisible(); await expect(table.getByRole('columnheader', { name: /任务/ })).toHaveAttribute('aria-sort', 'ascending');
});

test('remote filter resets pagination and updates the host total', async ({ page }) => {
  const table = await open(page); await table.getByRole('button', { name: '下一页' }).click(); await table.getByRole('textbox', { name: '筛选远程任务' }).fill('Reito'); await expect(table.getByText('共 8 条 · 已选 0 条')).toBeVisible(); await expect(table.getByText('第 1 / 2 页')).toBeVisible();
});

test('controlled page size recalculates page count', async ({ page }) => {
  const table = await open(page); await chooseSelectOption(table.getByRole('combobox', { name: '每页记录数' }), "10 条"); await expect(table.getByText('第 1 / 3 页')).toBeVisible(); await expect(table.getByRole('row')).toHaveCount(11);
});

test('Playground Controls toggle manual props without changing tabs', async ({ page }) => {
  await page.goto(`${storybookUrl}/?path=/story/${prefix}--playground`); const frame = page.frameLocator('#storybook-preview-iframe'); await expect(frame.getByRole('region', { name: '本地任务' })).toBeVisible({ timeout: 15000 }); await page.getByRole('tab', { name: /^Controls/ }).click(); const path = new URL(page.url()).searchParams.get('path'); await page.locator('[id="control-manual"]').evaluate((element: HTMLInputElement) => element.click()); await page.locator('[id="control-pageIndex"]').fill('2'); await page.locator('[id="control-pageIndex"]').press('Enter'); await expect(frame.getByText('第 3 / 5 页')).toBeVisible(); expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: remote table is accessible and has no page overflow`, async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 }); const table = await open(page, 'remote-controlled', `theme:${theme};density:${density}`); await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') }); expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await expect(table.getByRole('row')).toHaveCount(6); await page.screenshot({ path: `.logs/data-table-controlled/${theme}-${density}.png`, fullPage: true });
});
