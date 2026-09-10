import { chooseSelectOption, storybookUrl } from './select-option';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-keyvalueeditor-键值编辑';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`${storybookUrl}/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const editor = page.locator('section[aria-label="键值配置"]');
  await expect(editor).toBeVisible({ timeout: 15_000 });
  return editor;
}

test('existing add, duplicate validation, secret reveal, submit and remove remain intact', async ({ page }) => {
  const editor = await open(page, 'interactive');
  await expect(editor.getByLabel('键 3')).toHaveCount(0);
  await expect(editor.getByRole('status')).toContainText('1 项更改尚未应用');
  await expect(editor.getByLabel('值 2（敏感）')).toHaveAttribute('type', 'password');
});

test('number values preserve invalid drafts and enforce configured bounds', async ({ page }) => {
  const editor = await open(page, 'typed-values');
  const number = editor.getByRole('spinbutton', { name: '值 1' });
  await expect(number).toHaveValue('5173');
  await number.fill('70000');
  await expect(editor.getByRole('alert')).toHaveText('不能大于 65535');
  await expect(number).toHaveValue('70000');
});

test('boolean, select and date adapters update the controlled entries', async ({ page }) => {
  const editor = await open(page, 'typed-values');
  const toggle = editor.getByRole('switch', { name: '值 2' });
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  const select = editor.getByRole('combobox', { name: '值 3' });
  await chooseSelectOption(select, "舒适");
  await expect(select.locator('[data-slot="select-value"]')).toHaveText('舒适');
  const date = editor.getByLabel('值 4');
  await expect(date).toHaveAttribute('type', 'date');
  await expect(date).toHaveAttribute('min', '2026-09-01');
  await date.fill('2026-10-15');
  await expect(date).toHaveValue('2026-10-15');
});

test('nested path is displayed and included in draft notifications', async ({ page }) => {
  const editor = await open(page, 'nested-paths');
  await expect(editor.getByText('editor.appearance.fontSize', { exact: true })).toBeVisible();
  await editor.getByRole('spinbutton', { name: '值 1' }).fill('16');
  await expect(page.getByText('editor.appearance.fontSize = 16', { exact: true })).toBeVisible();
});

test('entry disabled and read-only states remain distinct', async ({ page }) => {
  const editor = await open(page, 'per-entry-disabled');
  await expect(editor.getByLabel('键 1')).toBeEditable();
  await expect(editor.getByLabel('键 2')).toBeDisabled();
  await expect(editor.getByLabel('值 2')).toBeDisabled();
  await expect(editor.getByLabel('键 3')).toHaveAttribute('readonly', '');
  await expect(editor.getByLabel('值 3')).toHaveAttribute('readonly', '');
  await expect(editor.getByRole('button', { name: '删除第 2 项' })).toBeDisabled();
  await expect(editor.getByRole('button', { name: '删除第 3 项' })).toBeDisabled();
});

test('required and duplicate validation still report each affected draft', async ({ page }) => {
  let editor = await open(page, 'required-value');
  await expect(editor.getByRole('alert')).toHaveText('值不能为空');
  editor = await open(page, 'duplicate-keys');
  await expect(editor.getByText('键不能重复')).toHaveCount(2);
});

test('Playground controls switch field recipes without leaving the Story', async ({ page }) => {
  await page.goto(`${storybookUrl}/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('section[aria-label="键值配置"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('[id="control-kind"]').selectOption('boolean');
  await page.locator('[id="control-fieldValue"]').fill('true');
  await expect(frame.getByRole('switch', { name: '值 1' })).toBeChecked();
  await page.locator('[id="control-nestedPath"]').focus();
  await page.keyboard.press('Space');
  await expect(frame.getByText('workspace.workspace_name', { exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(`/story/${prefix}--playground`);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: typed entries remain accessible in a narrow panel`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 900 });
  const editor = await open(page, 'narrow', `theme:${theme};density:${density}`);
  await expect(editor.getByRole('switch', { name: '值 2' })).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      try { return (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations; }
      catch (error) { if (!String(error).includes('Axe is already running')) throw error; await new Promise(resolve => setTimeout(resolve, 50)); }
    }
    throw new Error('等待现有 axe 扫描结束超时');
  })).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/key-value-editor/${theme}-${density}.png`, fullPage: true });
});
