import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-treetable-树表格';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="tree-table"]')).toBeVisible({ timeout: 15_000 });
  return page.getByRole('treegrid');
}

test('treegrid exposes hierarchy metadata and stable row ids', async ({ page }) => {
  const grid = await open(page, 'overview');
  await expect(grid).toHaveAccessibleName('项目文件');
  const components = grid.locator('[data-row-id="components"]');
  await expect(components).toHaveAttribute('aria-level', '2');
  await expect(components).toHaveAttribute('aria-expanded', 'true');
  await expect(grid.locator('[data-row-id="button"]')).toHaveAttribute('aria-level', '3');
});

test('pointer disclosure collapses without selecting the row', async ({ page }) => {
  const grid = await open(page, 'single');
  await grid.getByRole('button', { name: '折叠层级行 components' }).click();
  await expect(grid.locator('[data-row-id="button"]')).toHaveCount(0);
  await expect(page.locator('output')).toHaveText('value=button');
  await expect(grid.locator('[data-row-id="components"]')).not.toHaveAttribute('aria-selected', 'true');
  await expect(grid.locator('[data-row-id="components"]')).toBeFocused();
});

test('Right and Left navigate the visible hierarchy', async ({ page }) => {
  const grid = await open(page, 'collapsed');
  const src = grid.locator('[data-row-id="src"]');
  await src.focus();
  await src.press('ArrowRight');
  await expect(src).toHaveAttribute('aria-expanded', 'true');
  await src.press('ArrowRight');
  const components = grid.locator('[data-row-id="components"]');
  await expect(components).toBeFocused();
  await components.press('ArrowLeft');
  await expect(src).toBeFocused();
});

test('row arrows, Home and End follow visible row order', async ({ page }) => {
  const grid = await open(page, 'no-selection');
  const src = grid.locator('[data-row-id="src"]');
  await src.focus();
  await src.press('End');
  await expect(grid.locator('[data-row-id="archive"]')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(src).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(grid.locator('[data-row-id="components"]')).toBeFocused();
});

test('single row click and Enter update controlled selection', async ({ page }) => {
  const grid = await open(page, 'single');
  await grid.locator('[data-row-id="app"]').click();
  await expect(page.locator('output')).toHaveText('value=app');
  const input = grid.locator('[data-row-id="input"]');
  await input.focus();
  await input.press('Enter');
  await expect(page.locator('output')).toHaveText('value=input');
  await expect(input).toHaveAttribute('aria-selected', 'true');
});

test('partial check state is exposed on every ancestor', async ({ page }) => {
  const grid = await open(page, 'partial');
  await expect(grid.getByRole('checkbox', { name: '选择层级行 components' })).toHaveAttribute('data-indeterminate');
  await expect(grid.getByRole('checkbox', { name: '选择层级行 src' })).toHaveAttribute('data-indeterminate');
  await expect(grid.getByRole('checkbox', { name: '选择层级行 button' })).toBeChecked();
});

test('checking a branch cascades through enabled descendants', async ({ page }) => {
  const grid = await open(page, 'checkbox');
  await grid.getByRole('checkbox', { name: '选择层级行 components' }).click();
  await expect(grid.getByRole('checkbox', { name: '选择层级行 components' })).toBeChecked();
  await expect(grid.getByRole('checkbox', { name: '选择层级行 button' })).toBeChecked();
  await expect(grid.getByRole('checkbox', { name: '选择层级行 input' })).toBeChecked();
  await expect(grid.getByRole('checkbox', { name: '选择层级行 src' })).toHaveAttribute('data-indeterminate');
});

test('Space toggles a checkbox row without moving focus', async ({ page }) => {
  const grid = await open(page, 'checkbox');
  const app = grid.locator('[data-row-id="app"]');
  await app.focus();
  await app.press(' ');
  await expect(grid.getByRole('checkbox', { name: '选择层级行 app' })).toBeChecked();
  await expect(app).toBeFocused();
});

test('independent mode does not infer descendants or ancestors', async ({ page }) => {
  const grid = await open(page, 'independent');
  await expect(grid.getByRole('checkbox', { name: '选择层级行 components' })).toBeChecked();
  await expect(grid.getByRole('checkbox', { name: '选择层级行 button' })).not.toBeChecked();
  await expect(grid.getByRole('checkbox', { name: '选择层级行 src' })).not.toBeChecked();
});

test('header selection excludes disabled rows', async ({ page }) => {
  const grid = await open(page, 'disabled-row');
  await grid.getByRole('checkbox', { name: '选择全部层级行' }).click();
  await expect(grid.getByRole('checkbox', { name: '选择层级行 readme' })).toBeChecked();
  await expect(grid.getByRole('checkbox', { name: '选择层级行 archive' })).toBeDisabled();
  await expect(page.getByText('已选择 7 / 7 行')).toBeVisible();
});

test('controlled expansion writes back before rendering children', async ({ page }) => {
  const grid = await open(page, 'controlled-expansion');
  await expect(grid.locator('[data-row-id="components"]')).toBeVisible();
  await grid.getByRole('button', { name: '展开层级行 components' }).click();
  await expect(grid.locator('[data-row-id="button"]')).toBeVisible();
});

test('loading, error retry and empty states replace body rows', async ({ page }) => {
  await open(page, 'loading');
  await expect(page.getByRole('status')).toContainText('正在加载层级数据');
  await open(page, 'error-retry');
  await expect(page.getByRole('alert')).toContainText('层级数据暂不可用');
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.locator('[data-row-id="src"]')).toBeVisible();
  await open(page, 'empty');
  await expect(page.getByRole('treegrid')).toContainText('没有层级数据');
});

test('Playground changes selection mode and expansion without leaving the Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="tree-table"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('combobox', { name: 'selectionMode' }).selectOption('single');
  await expect(frame.getByRole('checkbox', { name: '选择全部层级行' })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'selectionMode' }).selectOption('checkbox');
  await expect(frame.getByRole('checkbox', { name: '选择全部层级行' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: treegrid stays compact, accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 760 });
  await open(page, 'checkbox', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/tree-table/${theme}-${density}.png`, fullPage: true });
});
