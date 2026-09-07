import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-propertylist-属性编辑';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const list = page.locator('dl[aria-label="属性"]');
  await expect(list).toBeVisible({ timeout: 15_000 });
  return list;
}

test('existing text and number validation, save, cancel and focus remain intact', async ({ page }) => {
  await open(page, 'interactive');
  await expect(page.getByText('60', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '编辑工作区名称' }).click();
  await page.getByRole('textbox', { name: '工作区名称' }).fill('未保存名称');
  await page.keyboard.press('Escape');
  await expect(page.getByText('Graphite 工作区', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '编辑工作区名称' })).toBeFocused();
});

test('boolean adapter edits a boolean value through the shared Switch', async ({ page }) => {
  await open(page, 'boolean-property');
  await page.getByRole('button', { name: '编辑自动保存' }).click();
  const toggle = page.getByRole('switch', { name: '自动保存' });
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByRole('button', { name: '保存字段' }).click();
  await expect(page.getByText('已关闭', { exact: true })).toBeVisible();
});

test('select adapter saves an enabled option', async ({ page }) => {
  await open(page, 'select-property');
  await page.getByRole('button', { name: '编辑界面密度' }).click();
  await page.getByRole('combobox', { name: '界面密度' }).selectOption('comfortable');
  await page.getByRole('button', { name: '保存字段' }).click();
  await expect(page.getByText('舒适', { exact: true })).toBeVisible();
});

test('date adapter keeps local date text and native bounds', async ({ page }) => {
  await open(page, 'date-property');
  await page.getByRole('button', { name: '编辑归档日期' }).click();
  const input = page.getByLabel('归档日期');
  await expect(input).toHaveAttribute('type', 'date');
  await expect(input).toHaveAttribute('min', '2026-09-01');
  await input.fill('2026-10-15');
  await page.getByRole('button', { name: '保存字段' }).click();
  await expect(page.getByText('2026-10-15', { exact: true })).toBeVisible();
});

test('nested path is reported for drafts and committed values', async ({ page }) => {
  await open(page, 'nested-paths');
  await page.getByRole('button', { name: '编辑字号' }).click();
  const input = page.getByRole('spinbutton', { name: '字号' });
  await input.fill('16');
  await expect(page.getByRole('status')).toHaveText('草稿 editor.appearance.fontSize = 16');
  await page.getByRole('button', { name: '保存字段' }).click();
  await expect(page.getByRole('status')).toHaveText('已保存 editor.appearance.fontSize = 16');
});

test('number adapter enforces item bounds before custom validation', async ({ page }) => {
  await open(page, 'nested-paths');
  await page.getByRole('button', { name: '编辑字号' }).click();
  await page.getByRole('spinbutton', { name: '字号' }).fill('30');
  await page.getByRole('button', { name: '保存字段' }).click();
  await expect(page.getByRole('alert')).toHaveText('不能大于 24');
});

test('Escape cancels select drafts and restores the edit trigger focus', async ({ page }) => {
  await open(page, 'select-property');
  const edit = page.getByRole('button', { name: '编辑界面密度' });
  await edit.click();
  await page.getByRole('combobox', { name: '界面密度' }).selectOption('comfortable');
  await page.keyboard.press('Escape');
  await expect(page.getByText('紧凑', { exact: true })).toBeVisible();
  await expect(edit).toBeFocused();
});

test('per-item disabled differs from read-only and global disabled', async ({ page }) => {
  await open(page, 'per-item-disabled');
  await expect(page.getByRole('button', { name: '编辑可编辑属性' })).toBeEnabled();
  await expect(page.getByRole('button', { name: '编辑禁用属性' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '编辑只读属性' })).toHaveCount(0);
  await open(page, 'disabled');
  await expect(page.getByRole('button', { name: '编辑名称' })).toBeDisabled();
});

test('Playground changes kind and nested path without leaving the Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('dl[aria-label="属性"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('[id="control-kind"]').selectOption('boolean');
  await page.locator('[id="control-fieldValue"]').fill('true');
  await expect(frame.getByText('开启', { exact: true })).toBeVisible();
  await page.locator('[id="control-nestedPath"]').focus();
  await page.keyboard.press('Space');
  await expect(frame.getByText('workspace.example', { exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(`/story/${prefix}--playground`);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: nested properties remain accessible in a narrow panel`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 800 });
  await open(page, 'narrow', `theme:${theme};density:${density}`);
  await expect(page.getByText('editor.appearance.fontSize', { exact: true })).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      try { return (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations; }
      catch (error) { if (!String(error).includes('Axe is already running')) throw error; await new Promise(resolve => setTimeout(resolve, 50)); }
    }
    throw new Error('等待现有 axe 扫描结束超时');
  })).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/property-list/${theme}-${density}.png`, fullPage: true });
});
