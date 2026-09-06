import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-datatable-数据表格';
type EditingStory = 'row-editing' | 'cell-editing' | 'editing-failure' | 'controlled-editing';

async function open(page: Page, story: EditingStory, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const names: Record<EditingStory, string> = { 'row-editing': '行编辑任务', 'cell-editing': '单元格编辑任务', 'editing-failure': '失败重试任务', 'controlled-editing': '受控编辑任务' };
  const table = page.getByRole('region', { name: names[story] });
  await expect(table).toBeVisible();
  return table;
}

test('row editing creates a draft and disables competing edit actions', async ({ page }) => {
  const table = await open(page, 'row-editing');
  await table.getByRole('button', { name: '编辑记录 TASK-01' }).click();
  await expect(table.getByRole('textbox', { name: '编辑任务', exact: true })).toBeFocused();
  await expect(table.getByRole('button', { name: '编辑记录 TASK-02' })).toBeDisabled();
  await expect(table.getByRole('combobox', { name: '编辑负责人' })).toHaveValue('Reito');
});

test('required and custom validators retain the draft and focus the invalid field', async ({ page }) => {
  const table = await open(page, 'row-editing');
  await table.getByRole('button', { name: '编辑记录 TASK-01' }).click();
  const input = table.getByRole('textbox', { name: '编辑任务', exact: true });
  await input.fill('x');
  await table.getByRole('button', { name: '保存记录 TASK-01' }).click();
  await expect(table.getByText('任务名称至少需要 3 个字符')).toBeVisible();
  await expect(input).toHaveValue('x');
  await expect(input).toBeFocused();
});

test('Escape cancels a row draft and restores focus to its edit action', async ({ page }) => {
  const table = await open(page, 'row-editing');
  await table.getByRole('button', { name: '编辑记录 TASK-01' }).click();
  const input = table.getByRole('textbox', { name: '编辑任务', exact: true });
  await input.fill('不会保存的标题');
  await input.press('Escape');
  await expect(table.getByText('整理设计 tokens')).toBeVisible();
  await expect(table.getByText('不会保存的标题')).toHaveCount(0);
  await expect(table.getByRole('button', { name: '编辑记录 TASK-01' })).toBeFocused();
});

test('Ctrl+Enter submits a row and the host replaces its data', async ({ page }) => {
  const table = await open(page, 'row-editing');
  await table.getByRole('button', { name: '编辑记录 TASK-01' }).click();
  const input = table.getByRole('textbox', { name: '编辑任务', exact: true });
  await input.fill('修订设计 tokens');
  await input.press('Control+Enter');
  await expect(page.getByText('已保存 TASK-01：name')).toBeVisible();
  await expect(table.getByText('修订设计 tokens')).toBeVisible();
  await expect(table.getByRole('button', { name: '编辑记录 TASK-01' })).toBeFocused();
});

test('select editors commit typed values through the same row transaction', async ({ page }) => {
  const table = await open(page, 'row-editing');
  await table.getByRole('button', { name: '编辑记录 TASK-01' }).click();
  await table.getByRole('combobox', { name: '编辑负责人' }).selectOption('Ming');
  await table.getByRole('button', { name: '保存记录 TASK-01' }).click();
  await expect(page.getByText('已保存 TASK-01：owner')).toBeVisible();
  await expect(table.getByRole('row').nth(1)).toContainText('Ming');
});

test('pending state prevents duplicate submission', async ({ page }) => {
  const table = await open(page, 'row-editing');
  await table.getByRole('button', { name: '编辑记录 TASK-01' }).click();
  const save = table.getByRole('button', { name: '保存记录 TASK-01' });
  await save.click();
  await expect(save).toBeDisabled();
  await expect(page.getByText('已保存 TASK-01：没有字段变化')).toBeVisible();
});

test('async failure keeps values and retry commits the same draft', async ({ page }) => {
  const table = await open(page, 'editing-failure');
  await table.getByRole('button', { name: '编辑记录 TASK-01' }).click();
  const input = table.getByRole('textbox', { name: '编辑任务', exact: true });
  await input.fill('失败后保留的草稿');
  await table.getByRole('button', { name: '保存记录 TASK-01' }).click();
  await expect(page.getByRole('alert').filter({ hasText: '本地保存模拟失败' })).toBeVisible();
  await expect(input).toHaveValue('失败后保留的草稿');
  await page.getByRole('button', { name: '重试保存' }).click();
  await expect(page.getByText('已保存 TASK-01：name')).toBeVisible();
  await expect(table.getByText('失败后保留的草稿')).toBeVisible();
});

test('cell mode starts with Enter and commits with Enter', async ({ page }) => {
  const table = await open(page, 'cell-editing');
  const cell = table.getByRole('cell', { name: /编辑任务，整理设计 tokens/ });
  await cell.focus();
  await cell.press('Enter');
  const input = table.getByRole('textbox', { name: '编辑任务', exact: true });
  await input.fill('单元格提交标题');
  await input.press('Enter');
  await expect(page.getByText('已保存 TASK-01：name')).toBeVisible();
  await expect(table.getByRole('cell', { name: /编辑任务，单元格提交标题/ })).toBeFocused();
});

test('cell mode Escape restores the original display and cell focus', async ({ page }) => {
  const table = await open(page, 'cell-editing');
  const cell = table.getByRole('cell', { name: /编辑任务，整理设计 tokens/ });
  await cell.dblclick();
  const input = table.getByRole('textbox', { name: '编辑任务', exact: true });
  await input.fill('取消的单元格草稿');
  await input.press('Escape');
  await expect(table.getByText('整理设计 tokens')).toBeVisible();
  await expect(cell).toBeFocused();
});

test('controlled editing state receives every draft update', async ({ page }) => {
  const table = await open(page, 'controlled-editing');
  await table.getByRole('button', { name: '编辑记录 TASK-01' }).click();
  await expect(page.getByText(/draft=整理设计 tokens/)).toBeVisible();
  await table.getByRole('textbox', { name: '编辑任务', exact: true }).fill('受控草稿标题');
  await expect(page.getByText(/draft=受控草稿标题/)).toBeVisible();
});

test('Playground switches editing and failure behavior without changing tabs', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('region', { name: '本地任务' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-editing"]').selectOption('row');
  await expect(frame.getByRole('button', { name: '编辑记录 TASK-01' })).toBeVisible();
  await page.locator('[id="control-saveBehavior"]').selectOption('error');
  await frame.getByRole('button', { name: '编辑记录 TASK-01' }).click();
  await frame.getByRole('button', { name: '保存记录 TASK-01' }).click();
  await expect(frame.getByRole('alert').filter({ hasText: '本地保存模拟失败' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: active row editing stays accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  const table = await open(page, 'row-editing', `theme:${theme};density:${density}`);
  await table.getByRole('button', { name: '编辑记录 TASK-01' }).click();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/data-table-editing/${theme}-${density}.png`, fullPage: true });
});
