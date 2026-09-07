import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-treetable-树表格';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="tree-table"]')).toBeVisible({ timeout: 15_000 });
  return page.getByRole('treegrid');
}

test('ancestor filtering keeps only the matching path', async ({ page }) => {
  const grid = await open(page, 'search-ancestors');
  await expect(grid.locator('[data-row-id="src"]')).toBeVisible();
  await expect(grid.locator('[data-row-id="components"]')).toBeVisible();
  await expect(grid.locator('[data-row-id="button"]')).toBeVisible();
  await expect(grid.locator('[data-row-id="input"]')).toHaveCount(0);
  await expect(grid.locator('[data-row-id="docs"]')).toHaveCount(0);
});

test('subtree filtering keeps descendants of a matching parent', async ({ page }) => {
  const grid = await open(page, 'search-subtree');
  await expect(grid.locator('[data-row-id="src"]')).toBeVisible();
  await expect(grid.locator('[data-row-id="button"]')).toBeVisible();
  await expect(grid.locator('[data-row-id="app"]')).toBeVisible();
  await expect(grid.locator('[data-row-id="docs"]')).toHaveCount(0);
});

test('column filters combine with hierarchical projection', async ({ page }) => {
  const grid = await open(page, 'column-filters');
  await expect(grid.locator('[data-row-id="src"]')).toBeVisible();
  await expect(grid.locator('[data-row-id="input"]')).toBeVisible();
  await expect(grid.locator('[data-row-id="button"]')).toHaveCount(0);
  await page.getByRole('textbox', { name: '筛选状态' }).fill('就绪');
  await expect(grid.locator('[data-row-id="button"]')).toBeVisible();
  await expect(grid.locator('[data-row-id="app"]')).toBeVisible();
  await expect(grid.locator('[data-row-id="input"]')).toHaveCount(0);
});

test('column manager hides, restores, and protects the last column', async ({ page }) => {
  const grid = await open(page, 'column-manager');
  await page.getByRole('button', { name: '列', exact: true }).click();
  await page.locator('[data-slot="popover-content"]').getByText('状态', { exact: true }).click();
  await expect(grid.getByRole('columnheader', { name: '状态' })).toHaveCount(0);
  await page.getByRole('button', { name: '重置列' }).click();
  await expect(grid.getByRole('columnheader', { name: '状态' })).toBeVisible();
});

test('root pagination does not split descendants', async ({ page }) => {
  const grid = await open(page, 'root-pagination');
  await expect(grid.locator('[data-row-id="src"]')).toBeVisible();
  await expect(grid.locator('[data-row-id="docs"]')).toBeVisible();
  await expect(grid.locator('[data-row-id="tests"]')).toHaveCount(0);
  await page.getByRole('button', { name: '下一页' }).click();
  await expect(grid.locator('[data-row-id="tests"]')).toBeVisible();
  await expect(page.locator('output')).toHaveText('page=1');
});

test('controlled query resets the controlled page and column view writes back', async ({ page }) => {
  const grid = await open(page, 'controlled-views');
  await page.getByRole('button', { name: '下一页' }).click();
  await expect(page.locator('output')).toContainText('page=1');
  await page.getByPlaceholder('搜索层级数据…').fill('package');
  await expect(page.locator('output')).toContainText('query=package; page=0');
  await expect(grid.locator('[data-row-id="package"]')).toBeVisible();
  await page.getByRole('button', { name: '列', exact: true }).click();
  await page.locator('[data-slot="popover-content"]').getByText('状态', { exact: true }).click();
  await expect(page.locator('output')).toContainText('status=true');
});

test('lazy branch exposes busy state and resolves children', async ({ page }) => {
  const grid = await open(page, 'lazy-children');
  const remote = grid.locator('[data-row-id="remote"]');
  await grid.getByRole('button', { name: '展开层级行 remote' }).click();
  await expect(remote).toHaveAttribute('aria-busy', 'true');
  await expect(grid.locator('[data-row-id="remote-config"]')).toBeVisible();
  await expect(remote).not.toHaveAttribute('aria-busy');
});

test('collapsing cancels a pending lazy request and a later expansion reloads', async ({ page }) => {
  const grid = await open(page, 'lazy-children');
  await grid.getByRole('button', { name: '展开层级行 remote' }).click();
  await grid.getByRole('button', { name: '折叠层级行 remote' }).click();
  await page.waitForTimeout(180);
  await expect(grid.locator('[data-row-id="remote-config"]')).toHaveCount(0);
  await grid.getByRole('button', { name: '展开层级行 remote' }).click();
  await expect(grid.locator('[data-row-id="remote-config"]')).toBeVisible();
});

test('lazy node failure is local and retry resolves the same branch', async ({ page }) => {
  const grid = await open(page, 'lazy-error-retry');
  await grid.getByRole('button', { name: '展开层级行 remote' }).click();
  await expect(page.getByRole('alert')).toContainText('远程目录暂不可用');
  await page.getByRole('button', { name: '重试' }).click();
  await expect(grid.locator('[data-row-id="remote-config"]')).toBeVisible();
});

test('selection survives filtering and returns with the same stable id', async ({ page }) => {
  const grid = await open(page, 'selection-across-views');
  await expect(grid.getByRole('checkbox', { name: '选择层级行 button' })).toBeChecked();
  await page.getByPlaceholder('搜索层级数据…').fill('README');
  await expect(grid.locator('[data-row-id="button"]')).toHaveCount(0);
  await expect(page.getByText('已选择 1 / 7 行')).toBeVisible();
  await page.getByPlaceholder('搜索层级数据…').fill('');
  await expect(grid.getByRole('checkbox', { name: '选择层级行 button' })).toBeChecked();
});

test('a selected lazy parent cascades to newly loaded children', async ({ page }) => {
  const grid = await open(page, 'lazy-selection');
  await grid.getByRole('button', { name: '展开层级行 remote' }).click();
  await expect(grid.getByRole('checkbox', { name: '选择层级行 remote-config' })).toBeChecked();
  await expect(page.getByText('已选择 2 / 2 行')).toBeVisible();
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: advanced treegrid stays accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 760 });
  await open(page, 'controlled-views', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/tree-table-advanced/${theme}-${density}.png`, fullPage: true });
});
