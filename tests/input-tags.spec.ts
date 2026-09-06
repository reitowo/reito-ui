import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-inputtags';

async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const input = page.getByRole('textbox', { name: '项目标签', exact: true });
  await expect(input).toBeVisible();
  return input;
}

test('Enter and both separator keys create normalized tags', async ({ page }) => {
  const input = await open(page, 'separators');
  await input.fill('  Graphite  ');
  await input.press('Enter');
  await expect(page.locator('output')).toContainText('"Graphite"');
  await input.type('Cursor,Claude，');
  await expect(page.locator('output')).toContainText('["Graphite","Cursor","Claude"]');
});

test('blank entries are ignored', async ({ page }) => {
  const input = await open(page, 'separators');
  await input.fill('   ');
  await input.press('Enter');
  await expect(page.locator('output')).toContainText('value=[]');
});

test('case-insensitive duplicate ignore clears the draft without changing value', async ({ page }) => {
  const input = await open(page, 'duplicate-ignored');
  await input.fill('react');
  await input.press('Enter');
  await expect(input).toHaveValue('');
  await expect(page.getByText('已忽略重复标签：react', { exact: true })).toBeVisible();
  await expect(page.locator('output')).toContainText('value=["React"]');
});

test('duplicate reject keeps the draft and reports a typed rejection', async ({ page }) => {
  const input = await open(page, 'duplicate-rejected');
  await input.fill('react');
  await input.press('Enter');
  await expect(input).toHaveValue('react');
  await expect(page.getByRole('alert')).toHaveText('标签已存在：react');
  await expect(page.locator('output')).toContainText('reject=duplicate:react');
});

test('duplicate allow appends another tag', async ({ page }) => {
  const input = await open(page, 'duplicate-allowed');
  await input.fill('React');
  await input.press('Enter');
  await expect(page.locator('output')).toContainText('value=["React","React"]');
});

test('max tag limit rejects additions and exposes the limit', async ({ page }) => {
  const input = await open(page, 'limit-reached');
  await expect(input).toHaveAttribute('placeholder', '已达到 3 个标签上限');
  await input.fill('Graphite');
  await input.press('Enter');
  await expect(page.getByRole('alert')).toHaveText('最多可添加 3 个标签');
  await expect(page.locator('output')).toContainText('reject=limit:Graphite');
});

test('tag editing commits with Enter and cancels with Escape', async ({ page }) => {
  await open(page, 'editable');
  await page.getByRole('button', { name: '编辑标签 React' }).click();
  const edit = page.getByRole('textbox', { name: '编辑标签 React' });
  await edit.fill('React 19');
  await edit.press('Enter');
  await expect(page.locator('output')).toContainText('value=["React 19","TypeScript"]');
  await page.getByRole('button', { name: '编辑标签 TypeScript' }).click();
  const cancel = page.getByRole('textbox', { name: '编辑标签 TypeScript' });
  await cancel.fill('Discarded');
  await cancel.press('Escape');
  await expect(page.locator('output')).toContainText('value=["React 19","TypeScript"]');
});

test('empty edit removes the tag and returns focus to the entry', async ({ page }) => {
  const input = await open(page, 'editable');
  await page.getByRole('button', { name: '编辑标签 React' }).click();
  const edit = page.getByRole('textbox', { name: '编辑标签 React' });
  await edit.fill('');
  await edit.press('Enter');
  await expect(page.locator('output')).toContainText('value=["TypeScript"]');
  await expect(input).toBeFocused();
});

test('remove action updates value and returns focus to the entry', async ({ page }) => {
  const input = await open(page, 'duplicate-ignored');
  await page.getByRole('button', { name: '移除标签 React' }).click();
  await expect(page.locator('output')).toContainText('value=[]');
  await expect(input).toBeFocused();
});

test('read-only and disabled modes expose native input state and hide mutations', async ({ page }) => {
  const readOnly = await open(page, 'read-only');
  await expect(readOnly).toHaveAttribute('readonly', '');
  await expect(page.getByRole('button', { name: /编辑标签|移除标签/ })).toHaveCount(0);
  const disabled = await open(page, 'disabled');
  await expect(disabled).toBeDisabled();
  await expect(page.getByRole('button', { name: '编辑标签 React' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '移除标签 React' })).toBeDisabled();
});

test('native form submission preserves repeated tag values', async ({ page }) => {
  await open(page, 'form-value');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.locator('output')).toContainText('form=["React","TypeScript"]');
});

test('Playground changes behavior props without leaving the story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="input-tags-input"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-duplicateBehavior"]').selectOption({ label: 'allow' });
  const input = frame.locator('[data-slot="input-tags-input"]');
  await input.fill('React');
  await input.press('Enter');
  await expect(frame.getByRole('button', { name: '编辑标签 React' })).toHaveCount(2);
  await page.getByRole('switch', { name: 'disabled', exact: true }).press('Space');
  await expect(input).toBeDisabled();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: compact tokens, accessibility and narrow containment`, async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 720 });
  const input = await open(page, 'editable', `theme:${theme};density:${density}`);
  const field = page.locator('[data-slot="input-tags"]');
  expect(await field.evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 32 : 40);
  await input.fill('Graphite');
  await input.press('Enter');
  await expect(page.getByRole('button', { name: '编辑标签 Graphite' })).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/input-tags/${theme}-${density}.png`, fullPage: true });
});
