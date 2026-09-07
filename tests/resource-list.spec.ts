import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-resourcelist-资源列表';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="resource-list"]')).toBeVisible({ timeout: 15_000 });
  return page.locator('[data-slot="resource-list"]');
}

test('keeps local search, sorting and stable selection behavior', async ({ page }) => {
  const list = await open(page, 'playground');
  await list.getByRole('checkbox', { name: '选择 specs.md' }).click();
  await list.getByRole('textbox', { name: '搜索项目资源' }).fill('tokens');
  await expect(list.getByText('显示 1 / 4 项 · 已选择 1 项')).toBeVisible();
  await list.getByRole('checkbox', { name: '选择筛选结果' }).click();
  await expect(list.getByText('显示 1 / 4 项 · 已选择 2 项')).toBeVisible();
  await list.getByRole('textbox', { name: '搜索项目资源' }).fill('');
  await expect(list.getByRole('checkbox', { name: '选择 specs.md' })).toBeChecked();
});

test('virtualizes a large resource collection', async ({ page }) => {
  const list = await open(page, 'virtualized');
  await expect(list.locator('[data-slot="virtual-list"]')).toBeVisible();
  expect(await list.getByRole('listitem').count()).toBeLessThan(80);
  await expect(list.getByText('已加载 80 / 80 项 · 已选择 0 项')).toBeVisible();
});

test('manual incremental loading reports loaded and total boundaries', async ({ page }) => {
  const list = await open(page, 'manual-incremental');
  await expect(list.getByText('已加载 16 / 80 项 · 已选择 1 项')).toBeVisible();
  await expect(list.getByText('还有 64 项可加载')).toBeVisible();
  await list.getByRole('button', { name: '加载更多' }).click();
  await expect(list.getByText('已加载 32 / 80 项 · 已选择 1 项')).toBeVisible();
});

test('automatic incremental loading fires near the virtual window end once per window', async ({ page }) => {
  const list = await open(page, 'automatic-incremental');
  const viewport = list.getByRole('list', { name: '自动增量资源列表' });
  await viewport.evaluate(element => { element.scrollTop = element.scrollHeight; element.dispatchEvent(new Event('scroll')); });
  await expect(list.getByText('已加载 32 / 80 项 · 已选择 1 项')).toBeVisible();
});

test('remote query replacement preserves selection for unloaded IDs', async ({ page }) => {
  const list = await open(page, 'query-replacement');
  await expect(list.getByRole('checkbox', { name: '选择 resource-003.md' })).toBeChecked();
  await list.getByRole('textbox', { name: '搜索远程查询资源' }).fill('next');
  await expect(list.getByText('已加载 8 / 8 项 · 已选择 1 项')).toBeVisible();
  await expect(list.getByRole('checkbox', { name: '选择 resource-003.md' })).toHaveCount(0);
  await list.getByRole('textbox', { name: '搜索远程查询资源' }).fill('');
  await expect(list.getByRole('checkbox', { name: '选择 resource-003.md' })).toBeChecked();
});

test('selection survives explicit data-window changes', async ({ page }) => {
  await open(page, 'selection-across-windows');
  await expect(page.getByRole('checkbox', { name: '选择 resource-003.md' })).toBeChecked();
  await page.getByRole('button', { name: '切换数据窗口' }).click();
  await expect(page.getByText('已选：resource-003')).toBeVisible();
  await page.getByRole('checkbox', { name: '选择 resource-013.md' }).click();
  await page.getByRole('button', { name: '切换数据窗口' }).click();
  await expect(page.getByRole('checkbox', { name: '选择 resource-003.md' })).toBeChecked();
  await expect(page.getByText('已选：resource-003, resource-013')).toBeVisible();
});

test('bulk selection in remote mode affects only loaded results', async ({ page }) => {
  const list = await open(page, 'manual-incremental');
  await list.getByRole('checkbox', { name: '选择已加载结果' }).click();
  await expect(list.getByText('已加载 16 / 80 项 · 已选择 16 项')).toBeVisible();
});

test('incremental load errors expose a retry action', async ({ page }) => {
  const list = await open(page, 'load-more-error');
  await expect(list.getByRole('alert')).toContainText('下一批资源加载失败');
  await expect(list.getByRole('button', { name: '重试加载更多' })).toBeEnabled();
});

test('initial loading, initial error and empty states stay explicit', async ({ page }) => {
  await open(page, 'initial-loading');
  await expect(page.getByText('正在加载资源…')).toBeVisible();
  await open(page, 'initial-error');
  await expect(page.getByRole('alert')).toContainText('无法加载资源');
  await open(page, 'empty');
  await expect(page.getByText('没有资源')).toBeVisible();
});

test('disabled state blocks query, sorting and row selection', async ({ page }) => {
  const list = await open(page, 'disabled');
  await expect(list.getByRole('textbox')).toBeDisabled();
  await expect(list.getByRole('combobox')).toBeDisabled();
  await expect(list.getByRole('button', { name: '选择 specs.md' })).toBeDisabled();
});

test('Playground updates query without switching Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="resource-list"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('[id="control-query"]').fill('tokens');
  await expect(frame.getByText('显示 1 / 4 项 · 已选择 0 项')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(`/story/${prefix}--playground`);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: resource list stays accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 760 });
  await open(page, 'narrow', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/resource-list/${theme}-${density}.png`, fullPage: true });
});
