import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-inlineedit-行内编辑';
async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const inlineEdit = page.locator('[data-slot="inline-edit"]').first();
  await expect(inlineEdit).toBeVisible({ timeout: 15_000 });
  return inlineEdit;
}

test('display opens a labelled editor and successful submit commits value', async ({ page }) => {
  let inlineEdit = await open(page);
  await inlineEdit.getByRole('button', { name: '编辑工作区名称' }).click();
  inlineEdit = page.locator('[data-slot="inline-edit"]');
  const input = inlineEdit.getByRole('textbox', { name: '工作区名称' });
  await expect.poll(() => input.evaluate(element => element === document.activeElement)).toBe(true);
  await input.fill('个人工作区');
  await inlineEdit.getByRole('button', { name: '保存' }).click();
  await expect(page.getByRole('status')).toHaveText('当前名称：个人工作区');
  const edit = page.getByRole('button', { name: '编辑工作区名称' });
  await expect(edit).toBeVisible();
  await expect.poll(() => edit.evaluate(element => element === document.activeElement)).toBe(true);
});

test('Escape cancels the draft and restores focus to the edit button', async ({ page }) => {
  let inlineEdit = await open(page);
  const edit = inlineEdit.getByRole('button', { name: '编辑工作区名称' });
  await edit.click();
  const input = page.getByRole('textbox', { name: '工作区名称' });
  await input.fill('未保存草稿');
  await input.press('Escape');
  inlineEdit = page.locator('[data-slot="inline-edit"]');
  await expect(inlineEdit).toContainText('Graphite 工作区');
  await expect.poll(() => edit.evaluate(element => element === document.activeElement)).toBe(true);
});

test('required and numeric range errors preserve the current draft', async ({ page }) => {
  let inlineEdit = await open(page, 'required-error');
  const text = inlineEdit.getByRole('textbox', { name: '工作区名称' });
  await inlineEdit.getByRole('button', { name: '保存' }).click();
  await expect(inlineEdit.getByText('此项不能为空')).toBeVisible();
  await expect(text).toHaveValue('');
  inlineEdit = await open(page, 'number-value');
  const number = inlineEdit.getByRole('spinbutton', { name: '保留天数' });
  await number.fill('400');
  await inlineEdit.getByRole('button', { name: '保存' }).click();
  await expect(inlineEdit.getByText('不能大于 365')).toBeVisible();
  await expect(number).toHaveValue('400');
});

test('async failure keeps editor open, exposes alert text and allows retry', async ({ page }) => {
  const inlineEdit = await open(page, 'async-failure');
  const input = inlineEdit.getByRole('textbox', { name: '工作区名称' });
  await input.fill('保留的草稿');
  await inlineEdit.getByRole('button', { name: '保存' }).click();
  await expect(inlineEdit.getByText('名称已被本地记录使用。')).toBeVisible();
  await expect(input).toHaveValue('保留的草稿');
  await expect(inlineEdit).toHaveAttribute('data-state', 'editing');
  await expect(inlineEdit.getByRole('button', { name: '保存' })).toBeEnabled();
});

test('pending submission blocks repeats while cancel aborts and restores display', async ({ page }) => {
  let inlineEdit = await open(page, 'async-pending');
  await expect(inlineEdit).toHaveAttribute('aria-busy', 'true');
  await expect(inlineEdit.getByRole('button', { name: '正在保存…' })).toBeDisabled();
  await inlineEdit.getByRole('button', { name: '取消' }).click();
  inlineEdit = page.locator('[data-slot="inline-edit"]');
  await expect(inlineEdit).toHaveAttribute('data-state', 'display');
  await expect(inlineEdit).toContainText('Graphite 工作区');
});

test('read-only is static while disabled display cannot enter editing', async ({ page }) => {
  let inlineEdit = await open(page, 'read-only');
  await expect(inlineEdit).toHaveAttribute('data-readonly', 'true');
  await expect(inlineEdit.getByRole('button')).toHaveCount(0);
  inlineEdit = await open(page, 'disabled');
  await expect(inlineEdit.getByRole('button', { name: '编辑工作区名称' })).toBeDisabled();
});

test('custom display and editor slots preserve the shared transaction shell', async ({ page }) => {
  let inlineEdit = await open(page, 'custom-display');
  await expect(inlineEdit).toContainText('workspace/Graphite 工作区');
  inlineEdit = await open(page, 'custom-editor');
  await expect(inlineEdit).toContainText('workspace/');
  await expect(inlineEdit.getByRole('textbox', { name: '工作区名称' })).toHaveValue('Graphite 工作区');
});

test('Playground Controls change state in the same story', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  const inlineEdit = frame.locator('[data-slot="inline-edit"]');
  await expect(inlineEdit).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-editing"]').evaluate((element: HTMLInputElement) => element.click());
  await expect(inlineEdit).toHaveAttribute('data-state', 'editing');
  await page.locator('[id="control-label"]').fill('显示名称');
  await expect(inlineEdit.getByRole('textbox', { name: '显示名称' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: inline edit stays compact and accessible`, async ({ page }) => {
  const inlineEdit = await open(page, 'default', `theme:${theme};density:${density}`);
  expect((await inlineEdit.boundingBox())!.height).toBeLessThan(52);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  await page.screenshot({ path: `.logs/inline-edit/${theme}-${density}.png`, fullPage: true });
});
