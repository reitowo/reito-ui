import { expect, test, type Page } from '@playwright/test';

const prefix = '复杂-keyvalueeditor-键值编辑';

async function open(page: Page, story = 'transactional', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const editor = page.locator('section[aria-label="键值配置"]');
  await expect(editor).toBeVisible({ timeout: 15_000 });
  return editor;
}

test('controlled edits remain pending until the array transaction succeeds', async ({ page }) => {
  const editor = await open(page);
  await editor.getByRole('spinbutton', { name: '值 2' }).fill('6000');
  await expect(editor.getByRole('status')).toHaveText('1 项更改尚未应用');
  await expect(page.getByTestId('key-value-receipt')).toHaveText('尚未应用');
  await editor.getByRole('button', { name: '应用配置' }).click();
  await expect(editor.getByRole('status')).toHaveText('全部配置已应用');
  await expect(page.getByTestId('key-value-receipt')).toHaveText('已应用 2 项 / 1 处更改');
  await expect(editor.getByRole('button', { name: '应用配置' })).toBeDisabled();
});

test('cross-row validation maps by stable id and focuses the invalid row', async ({ page }) => {
  const editor = await open(page);
  await editor.getByRole('combobox', { name: '值 1' }).selectOption('production');
  await editor.getByRole('spinbutton', { name: '值 2' }).fill('80');
  await editor.getByRole('button', { name: '应用配置' }).click();
  const row = editor.locator('[data-entry-id="port"]');
  await expect(row).toBeFocused();
  await expect(row.getByRole('alert')).toHaveText('生产模式端口不能小于 1024');
  await expect(editor.getByRole('status')).toHaveText('校验未通过');
  await expect(editor.getByRole('spinbutton', { name: '值 2' })).toHaveValue('80');
});

test('server entry errors preserve the row and clear when its value changes', async ({ page }) => {
  const editor = await open(page);
  await editor.getByRole('combobox', { name: '值 1' }).selectOption('reserved');
  await editor.getByRole('button', { name: '应用配置' }).click();
  const row = editor.locator('[data-entry-id="mode"]');
  await expect(row).toBeFocused();
  await expect(row.getByRole('alert')).toHaveText('该模式值已被策略保留');
  await expect(editor.getByRole('combobox', { name: '值 1' })).toHaveValue('reserved');
  await editor.getByRole('combobox', { name: '值 1' }).selectOption('local');
  await expect(editor.getByRole('alert')).toHaveCount(0);
});

test('cancel restores additions, removals and edits to the last applied array', async ({ page }) => {
  const editor = await open(page);
  await editor.getByLabel('键 1').fill('RUNTIME_MODE');
  await editor.getByRole('button', { name: '删除第 2 项' }).click();
  await editor.getByRole('button', { name: '添加键值' }).click();
  await editor.getByLabel('键 2').fill('REGION');
  await editor.getByLabel('值 2').fill('local');
  await editor.getByRole('button', { name: '取消更改' }).click();
  await expect(editor.getByLabel('键 1')).toHaveValue('MODE');
  await expect(editor.getByLabel('键 2')).toHaveValue('PORT');
  await expect(editor.getByLabel('值 2')).toHaveValue('5173');
  await expect(editor.getByRole('status')).toHaveText('已恢复到最近一次应用');
});

test('reset restores the explicit default array but keeps it pending', async ({ page }) => {
  const editor = await open(page);
  await editor.getByRole('button', { name: '恢复默认' }).click();
  await expect(editor.getByRole('spinbutton', { name: '值 2' })).toHaveValue('3000');
  await expect(editor.getByRole('status')).toHaveText('已恢复默认值，尚未应用');
  await expect(editor.getByRole('button', { name: '应用配置' })).toBeEnabled();
});

test('global async failure keeps the full controlled array available for retry', async ({ page }) => {
  const editor = await open(page, 'submit-failure');
  await editor.getByRole('spinbutton', { name: '值 2' }).fill('7000');
  await editor.getByRole('button', { name: '应用配置' }).click();
  await expect(page.getByRole('alert')).toHaveText('本地配置服务暂时不可用，草稿仍然保留。');
  await expect(editor.getByRole('status')).toHaveText('应用失败，草稿已保留');
  await expect(editor.getByRole('spinbutton', { name: '值 2' })).toHaveValue('7000');
  await expect(editor.getByRole('button', { name: '应用配置' })).toBeEnabled();
  await editor.getByRole('spinbutton', { name: '值 2' }).fill('7100');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: transaction actions remain compact at narrow width`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 900 });
  const editor = await open(page, 'transactional', `theme:${theme};density:${density}`);
  await expect(editor.getByRole('button', { name: '应用配置' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/key-value-editor-transaction/${theme}-${density}.png`, fullPage: true });
});
