import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-asynctreeview-异步树';
async function open(page: Page, variant: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${variant}&viewMode=story&globals=${globals}`);
  const tree = page.getByRole('tree'); await expect(tree).toBeVisible(); return tree;
}

test('expanded loadable nodes expose busy state and resolve children', async ({ page }) => {
  const loadingTree = await open(page, 'loading');
  await expect(loadingTree.getByRole('treeitem', { name: /remote/ })).toHaveAttribute('aria-busy', 'true');
  await expect(loadingTree.getByRole('status')).toHaveText('正在加载');
  const tree = await open(page, 'playground');
  await expect(tree.getByRole('treeitem', { name: 'App.tsx' })).toBeVisible();
  await expect(tree.getByRole('treeitem', { name: /workspace/ })).not.toHaveAttribute('aria-busy');
});

test('resolved empty children use the node-level empty state', async ({ page }) => {
  const tree = await open(page, 'empty');
  await expect(tree.getByText('没有子节点', { exact: true })).toBeVisible();
  await expect(tree.getByRole('treeitem', { name: /empty/ })).not.toHaveAttribute('aria-busy');
});

test('node load errors expose retry and recover in place', async ({ page }) => {
  const tree = await open(page, 'error-retry');
  await expect(tree.getByRole('alert')).toContainText('目录暂不可用');
  await tree.getByRole('button', { name: '重试' }).click();
  await expect(tree.getByRole('treeitem', { name: 'recovered.ts' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('2');
});

test('refresh keeps only the newest response when an old request resolves later', async ({ page }) => {
  const tree = await open(page, 'refresh-stale');
  await page.getByRole('button', { name: '刷新到新版' }).click();
  await expect(tree.getByRole('treeitem', { name: 'revision-2.tsx' })).toBeVisible();
  await page.waitForTimeout(800);
  await expect(tree.getByRole('treeitem', { name: 'revision-1.tsx' })).toHaveCount(0);
});

test('collapsing aborts a node request and a later expansion starts again', async ({ page }) => {
  const tree = await open(page, 'collapse-cancellation');
  await expect(tree.getByRole('treeitem', { name: /workspace/ })).toHaveAttribute('aria-busy', 'true');
  await page.getByRole('button', { name: '折叠', exact: true }).click();
  await expect(page.getByText('已取消：1', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '重新展开' }).click();
  await expect(tree.getByRole('treeitem', { name: 'late.ts' })).toBeVisible();
});

test('a checked async parent cascades to children loaded later', async ({ page }) => {
  const tree = await open(page, 'checkbox-after-load');
  await expect(tree.getByRole('treeitem', { name: 'App.tsx' })).toHaveAttribute('aria-checked', 'true');
  await expect(tree.getByRole('treeitem', { name: /workspace/ })).toHaveAttribute('aria-checked', 'true');
});

test('Playground refreshKey reloads in Controls without changing Story tabs', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe'); await expect(frame.getByRole('treeitem', { name: 'App.tsx' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('tab', { name: /^Controls/ }).click(); const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-refreshKey"]').fill('1'); await page.locator('[id="control-refreshKey"]').press('Enter');
  await expect(frame.getByRole('treeitem', { name: /workspace/ })).toHaveAttribute('aria-busy', 'true');
  await expect(frame.getByRole('treeitem', { name: 'App.tsx' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: loaded async tree stays compact and accessible`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 }); const tree = await open(page, 'playground', `theme:${theme};density:${density}`);
  const workspace = tree.getByRole('treeitem', { name: /workspace/ }); await expect(tree.getByRole('treeitem', { name: 'App.tsx' })).toBeVisible();
  expect(await workspace.locator(':scope > [data-slot="tree-item-row"]').evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 24 : 32);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/async-tree-view/${theme}-${density}.png`, fullPage: true });
});
