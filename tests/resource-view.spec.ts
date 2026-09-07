import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-resourceview-资源视图';
async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="resource-view"]')).toBeVisible({ timeout: 15_000 });
  return page.locator('[data-slot="resource-view"]');
}

test('switches list and grid with pressed layout controls', async ({ page }) => {
  const view = await open(page, 'controlled-layout');
  await expect(view.getByRole('button', { name: '列表视图' })).toHaveAttribute('aria-pressed', 'true');
  await view.getByRole('button', { name: '网格视图' }).click();
  await expect(view.getByRole('list', { name: '受控布局网格' })).toBeVisible();
  await expect(view.getByRole('button', { name: '网格视图' })).toHaveAttribute('aria-pressed', 'true');
});

test('layout switch preserves page and selection in one state owner', async ({ page }) => {
  const view = await open(page, 'state-continuity');
  await view.getByRole('checkbox', { name: '选择 surface-01.tsx' }).click();
  await view.getByRole('button', { name: '下一页' }).click();
  await view.getByRole('button', { name: '列表视图' }).click();
  await expect(page.locator('output')).toHaveText('layout=list; page=1; selected=view-01');
  await expect(view.getByRole('list', { name: '连续状态资源列表' })).toBeVisible();
});

test('local pagination renders one shared projected page', async ({ page }) => {
  const view = await open(page, 'pagination');
  await expect(view.getByText('26 项 · 第 1 / 5 页 · 已选择 0 项')).toBeVisible();
  await expect(view.locator('[data-resource-id]')).toHaveCount(6);
  await view.getByRole('button', { name: '下一页' }).click();
  await expect(view.getByText('26 项 · 第 2 / 5 页 · 已选择 0 项')).toBeVisible();
  await expect(view.locator('[data-resource-id="view-07"]')).toBeVisible();
});

test('query changes reset controlled page to zero', async ({ page }) => {
  const view = await open(page, 'query-resets-page');
  await expect(page.locator('output')).toHaveText('page=2');
  await view.getByRole('textbox', { name: '搜索查询分页资源' }).fill('文档');
  await expect(page.locator('output')).toHaveText('page=0');
  await expect(view.getByText('9 项 · 第 1 / 2 页 · 已选择 0 项')).toBeVisible();
});

test('remote pagination requests and renders host page data', async ({ page }) => {
  const view = await open(page, 'remote-page');
  await view.getByRole('button', { name: '下一页' }).click();
  await expect(view.locator('[data-resource-id="view-07"]')).toBeVisible();
  await expect(view.getByText('26 项 · 第 2 / 5 页 · 已选择 0 项')).toBeVisible();
});

test('current page bulk selection remains selected after layout switch', async ({ page }) => {
  const view = await open(page, 'multiple-grid');
  await view.getByRole('checkbox', { name: '选择当前页' }).click();
  await expect(view.getByText('26 项 · 第 1 / 5 页 · 已选择 6 项')).toBeVisible();
  await view.getByRole('button', { name: '列表视图' }).click();
  await expect(view.getByRole('checkbox', { name: '选择 surface-01.tsx' })).toBeChecked();
});

test('single selection uses the same stable ID in grid and list', async ({ page }) => {
  const view = await open(page, 'single-selection');
  await view.getByRole('button', { name: '选择 surface-02.tsx' }).click();
  await expect(view.getByText('8 项 · 第 1 / 1 页 · 已选择 1 项')).toBeVisible();
  await view.getByRole('button', { name: '列表视图' }).click();
  await expect(view.getByRole('button', { name: '选择 surface-02.tsx' })).toHaveAttribute('aria-pressed', 'true');
});

test('custom grid content and shared actions remain available', async ({ page }) => {
  await open(page, 'custom-grid-content');
  await expect(page.getByText('view-01')).toBeVisible();
  const view = await open(page, 'shared-actions');
  await view.getByRole('button', { name: '打开 surface-01.tsx' }).click();
  await expect(page.locator('output')).toHaveText('surface-01.tsx');
  await view.getByRole('button', { name: '列表视图' }).click();
  await expect(view.getByRole('button', { name: '打开 surface-01.tsx' })).toBeVisible();
});

test('loading, error and empty states are explicit', async ({ page }) => {
  await open(page, 'loading'); await expect(page.getByText('正在加载资源…')).toBeVisible();
  await open(page, 'error'); await expect(page.getByRole('alert')).toContainText('资源视图加载失败');
  await open(page, 'empty'); await expect(page.getByText('没有资源')).toBeVisible();
});

test('disabled state blocks layout, filter, paging and selection', async ({ page }) => {
  const view = await open(page, 'disabled');
  await expect(view.getByRole('textbox')).toBeDisabled();
  await expect(view.getByRole('button', { name: '列表视图' })).toBeDisabled();
  await expect(view.getByRole('checkbox', { name: '选择 surface-01.tsx' })).toBeDisabled();
});

test('Playground changes layout in Controls without switching Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="resource-view"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('[id="control-layout"]').selectOption('grid');
  await expect(frame.getByRole('list', { name: '组件资源网格' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(`/story/${prefix}--playground`);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: resource view stays accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 760 });
  await open(page, 'narrow', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/resource-view/${theme}-${density}.png`, fullPage: true });
});
