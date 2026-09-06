import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-listbox';
async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="listbox"]').first()).toBeVisible({ timeout: 15_000 });
}

test('single selection changes independently from the active option', async ({ page }) => {
  await open(page, 'single');
  const list = page.getByRole('listbox');
  await list.focus();
  await list.press('ArrowDown');
  await expect(page.locator('[data-slot="listbox-option"][data-active="true"]')).toContainText('TypeScript');
  await expect(page.locator('output')).toContainText('"react"');
  await list.press('Enter');
  await expect(page.locator('output')).toContainText('"typescript"');
});

test('multiple selection toggles options with Space', async ({ page }) => {
  await open(page, 'multiple');
  const list = page.getByRole('listbox');
  await list.focus();
  await list.press('ArrowDown');
  await list.press('ArrowDown');
  await list.press('Space');
  await expect(page.getByTestId('listbox-value')).toContainText('["react","typescript","tailwind"]');
});

test('Home, End and arrows skip disabled options', async ({ page }) => {
  await open(page, 'disabled-option');
  const list = page.getByRole('listbox');
  await list.focus();
  await list.press('End');
  await expect(page.locator('[data-slot="listbox-option"][data-active="true"]')).toContainText('Agent runtime');
  await list.press('Home');
  await expect(page.locator('[data-slot="listbox-option"][data-active="true"]')).toContainText('React');
});

test('group labels name accessible groups', async ({ page }) => {
  await open(page, 'grouped');
  await expect(page.getByRole('group', { name: '应用' })).toBeVisible();
  await expect(page.getByRole('group', { name: '工具' })).toBeVisible();
});

test('search filters labels, descriptions and keywords', async ({ page }) => {
  await open(page, 'searchable');
  const search = page.getByLabel('搜索搜索技术栈');
  await search.fill('frontend');
  await expect(page.getByRole('option')).toHaveCount(1);
  await expect(page.getByRole('option')).toContainText('React');
  await search.fill('类型系统');
  await expect(page.getByRole('option')).toContainText('TypeScript');
});

test('ArrowDown from search transfers focus to the persistent list', async ({ page }) => {
  await open(page, 'searchable');
  const search = page.getByLabel('搜索搜索技术栈');
  await search.focus();
  await search.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeFocused();
  await expect(page.locator('[data-slot="listbox-option"][data-active="true"]')).toContainText('React');
});

test('unsearchable list supports typeahead navigation', async ({ page }) => {
  await open(page, 'single');
  const list = page.getByRole('listbox');
  await list.focus();
  await list.press('s');
  await expect(page.locator('[data-slot="listbox-option"][data-active="true"]')).toContainText('Storybook');
});

test('Shift click adds the enabled contiguous range', async ({ page }) => {
  await open(page, 'range-selection');
  await page.getByRole('option', { name: /React/ }).click();
  await page.getByRole('option', { name: /Storybook/ }).click({ modifiers: ['Shift'] });
  await expect(page.getByTestId('listbox-value')).toContainText('["react","typescript","tailwind","storybook"]');
});

test('Shift Arrow extends multiple selection and Ctrl+A toggles visible enabled options', async ({ page }) => {
  await open(page, 'range-selection');
  const list = page.getByRole('listbox');
  await page.getByRole('option', { name: /React/ }).click();
  await list.press('Shift+ArrowDown');
  await expect(page.getByTestId('listbox-value')).toContainText('["react","typescript"]');
  await list.press('Control+a');
  await expect(page.getByTestId('listbox-value')).toContainText('["react","typescript","tailwind","storybook","terminal","agent"]');
  await list.press('Control+a');
  await expect(page.getByTestId('listbox-value')).toContainText('[]');
});

test('clear resets multiple selection and returns focus to the list', async ({ page }) => {
  await open(page, 'multiple');
  await page.getByRole('button', { name: '清除' }).click();
  await expect(page.getByTestId('listbox-value')).toContainText('[]');
  await expect(page.getByRole('listbox')).toBeFocused();
});

test('empty and no-match states remain named listboxes', async ({ page }) => {
  await open(page, 'empty');
  await expect(page.getByRole('listbox', { name: '成员' })).toBeVisible();
  await expect(page.locator('[data-slot="listbox-viewport"] [role="status"]')).toHaveText('还没有成员');
  await open(page, 'no-matches');
  await expect(page.locator('[data-slot="listbox-viewport"] [role="status"]')).toHaveText('未找到匹配项');
});

test('read-only and disabled prevent selection changes', async ({ page }) => {
  await open(page, 'read-only');
  const readonly = page.getByRole('listbox');
  await expect(readonly).toHaveAttribute('aria-readonly', 'true');
  await readonly.press('End');
  await readonly.press('Space');
  await expect(page.getByTestId('listbox-value')).toContainText('["react","typescript"]');
  await open(page, 'disabled');
  await expect(page.getByRole('listbox')).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('option', { name: /TypeScript/ }).click({ force: true });
  await expect(page.getByTestId('listbox-value')).toContainText('"react"');
});

test('required and error semantics are attached to the listbox', async ({ page }) => {
  await open(page, 'field-error');
  const list = page.getByRole('listbox');
  await expect(list).toHaveAttribute('aria-required', 'true');
  await expect(list).toHaveAttribute('aria-invalid', 'true');
  expect(await list.getAttribute('aria-describedby')).toContain(await page.getByRole('alert').getAttribute('id'));
});

test('native form submits repeated values in option order', async ({ page }) => {
  await open(page, 'native-form');
  await page.getByRole('button', { name: '读取 FormData' }).click();
  await expect(page.getByTestId('form-value')).toHaveText('["react","storybook"]');
});

test('controlled active value reports keyboard navigation', async ({ page }) => {
  await open(page, 'controlled-active');
  const list = page.getByRole('listbox');
  await list.focus();
  await list.press('ArrowDown');
  await expect(page.locator('output')).toHaveText('active=tailwind');
});

test('Playground changes selection mode and search on the same Storybook page', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="listbox"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('combobox', { name: 'selectionMode' }).selectOption('single');
  await expect(frame.getByRole('listbox')).not.toHaveAttribute('aria-multiselectable', 'true');
  await page.getByRole('row').filter({ hasText: /query/ }).getByRole('textbox').fill('Agent');
  await expect(frame.getByRole('option')).toHaveCount(1);
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: rows use density tokens, fit narrow screens and pass axe`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 620 });
  await open(page, 'rich-options', `theme:${theme};density:${density}`);
  const row = page.locator('[data-slot="listbox-option"]').first();
  expect(await row.evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 36 : 40);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/listbox/${theme}-${density}.png`, fullPage: true });
});
