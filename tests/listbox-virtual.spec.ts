import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-listbox';
async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="listbox-viewport"]').first()).toBeVisible({ timeout: 15_000 });
}

test('fifty thousand options keep the rendered DOM bounded', async ({ page }) => {
  await open(page, 'virtual-large');
  const options = page.getByRole('option');
  await expect(options.first()).toBeVisible();
  expect(await options.count()).toBeLessThan(30);
  await expect(page.getByRole('listbox')).toHaveAttribute('aria-activedescendant', /option-240$/);
});

test('a distant selected option is positioned and retained for active-descendant', async ({ page }) => {
  await open(page, 'virtual-selected-position');
  const list = page.getByRole('listbox');
  await expect(list).toHaveAttribute('aria-activedescendant', /option-25000$/);
  await expect(page.getByRole('option', { name: /资源 25001/ })).toBeVisible();
  const activeId = await list.getAttribute('aria-activedescendant');
  await expect(page.locator(`#${activeId}`)).toHaveCount(1);
  expect(await page.locator('[data-slot="listbox-viewport"]').evaluate(element => element.scrollTop)).toBeGreaterThan(100_000);
});

test('End navigates to the last enabled virtual option', async ({ page }) => {
  await open(page, 'virtual-keyboard');
  const list = page.getByRole('listbox');
  await list.focus();
  await list.press('End');
  await expect(page.getByRole('option', { name: /资源 50000/ })).toBeVisible();
  await list.press('Enter');
  await expect(page.getByTestId('listbox-value')).toContainText('item-49999');
});

test('virtual search repairs a filtered-out active option', async ({ page }) => {
  await open(page, 'virtual-search');
  const search = page.getByLabel('搜索搜索资源');
  await search.fill('资源 00042');
  const list = page.getByRole('listbox');
  await expect(page.getByRole('option')).toHaveCount(1);
  await expect(page.getByRole('option')).toContainText('资源 00042');
  await expect(list).toHaveAttribute('aria-activedescendant', /option-41$/);
});

test('loading contracts distinguish empty and retained results', async ({ page }) => {
  await open(page, 'loading-empty');
  await expect(page.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('[data-slot="listbox-viewport"] [role="status"]')).toHaveText('正在加载选项…');
  await open(page, 'loading-with-options');
  await expect(page.getByRole('option')).toHaveCount(7);
  await expect(page.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('[data-slot="listbox-viewport"] div[role="status"]')).toContainText('正在加载选项');
});

test('load error exposes retry and transitions back to loading', async ({ page }) => {
  await open(page, 'load-error');
  await expect(page.getByRole('alert')).toHaveText('无法读取远程资源');
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('status')).toHaveText('正在加载选项…');
});

test('range callback reports visible and overscan windows while scrolling', async ({ page }) => {
  await open(page, 'virtual-range');
  await expect(page.getByTestId('range-value')).not.toContainText('尚未测量');
  const before = await page.getByTestId('range-value').textContent();
  await page.locator('[data-slot="listbox-viewport"]').evaluate(element => { element.scrollTop = 200_000; element.dispatchEvent(new Event('scroll')); });
  await expect(page.getByTestId('range-value')).not.toHaveText(before ?? '');
});

test('Playground toggles virtualization and load errors without changing tabs', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="listbox"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-virtual"]').evaluate((element: HTMLInputElement) => element.click());
  await expect(frame.locator('[data-slot="listbox-viewport"]')).toHaveAttribute('data-virtual', 'true');
  expect(await frame.getByRole('option').count()).toBeLessThan(30);
  await page.getByRole('combobox', { name: 'scenario' }).selectOption('error');
  await expect(frame.getByRole('alert')).toHaveText('无法读取选项');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: virtual list fits narrow screens and passes axe`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 620 });
  await open(page, 'virtual-large', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/listbox-virtual/${theme}-${density}.png`, fullPage: true });
});
