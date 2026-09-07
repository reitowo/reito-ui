import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-organizationchart-组织结构图';

async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const tree = page.getByRole('tree');
  await expect(tree).toBeVisible({ timeout: 15_000 });
  return tree;
}

test('chart exposes the hierarchy as an ARIA tree', async ({ page }) => {
  const tree = await open(page);
  const lead = tree.getByRole('treeitem', { name: /Reito/ });
  const design = tree.getByRole('treeitem', { name: /界面设计/ });
  const quality = tree.getByRole('treeitem', { name: /质量验证/ });
  await expect(lead).toHaveAttribute('aria-level', '1');
  await expect(lead).toHaveAttribute('aria-posinset', '1');
  await expect(lead).toHaveAttribute('aria-setsize', '1');
  await expect(design).toHaveAttribute('aria-level', '2');
  await expect(design).toHaveAttribute('aria-posinset', '1');
  await expect(design).toHaveAttribute('aria-setsize', '2');
  await expect(quality).toHaveAttribute('aria-level', '3');
  await expect(tree.getByRole('group')).toHaveCount(3);
});

test('arrow keys follow visible hierarchy and collapse branches', async ({ page }) => {
  const tree = await open(page);
  const lead = tree.getByRole('treeitem', { name: /Reito/ });
  const design = tree.getByRole('treeitem', { name: /界面设计/ });
  const tokens = tree.getByRole('treeitem', { name: /设计令牌/ });
  await lead.focus();
  await lead.press('ArrowDown');
  await expect(design).toBeFocused();
  await design.press('ArrowRight');
  await expect(tokens).toBeFocused();
  await tokens.press('ArrowLeft');
  await expect(design).toBeFocused();
  await design.press('ArrowLeft');
  await expect(design).toHaveAttribute('aria-expanded', 'false');
  await expect(tokens).toHaveCount(0);
  await design.press('ArrowLeft');
  await expect(lead).toBeFocused();
});

test('Home and End use the current visible order', async ({ page }) => {
  const tree = await open(page, 'initially-collapsed');
  const lead = tree.getByRole('treeitem', { name: /Reito/ });
  await lead.focus();
  await lead.press('End');
  await expect(tree.getByRole('treeitem', { name: /工程实现/ })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(lead).toBeFocused();
});

test('click, Enter and Space update controlled selection', async ({ page }) => {
  const tree = await open(page, 'controlled');
  const engineering = tree.getByRole('treeitem', { name: /工程实现/ });
  await engineering.locator(':scope > [data-slot="organization-chart-node"]').click();
  await expect(engineering).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('organization-state')).toContainText('选中：engineering');
  const runtime = tree.getByRole('treeitem', { name: /本地运行时/ });
  await runtime.focus();
  await runtime.press('Enter');
  await expect(runtime).toHaveAttribute('aria-selected', 'true');
  const quality = tree.getByRole('treeitem', { name: /质量验证/ });
  await quality.focus();
  await quality.press(' ');
  await expect(quality).toHaveAttribute('aria-selected', 'true');
});

test('collapse buttons update controlled state and preserve node focus', async ({ page }) => {
  const tree = await open(page, 'controlled');
  const design = tree.getByRole('treeitem', { name: /界面设计/ });
  await page.getByRole('button', { name: '折叠 界面设计' }).click();
  await expect(design).toHaveAttribute('aria-expanded', 'false');
  await expect(design).toBeFocused();
  await expect(page.getByTestId('organization-state')).toContainText('折叠：design');
  await page.getByRole('button', { name: '展开 界面设计' }).click();
  await expect(design).toHaveAttribute('aria-expanded', 'true');
});

test('focus returns to the closest visible ancestor after a controlled collapse', async ({ page }) => {
  const tree = await open(page, 'controlled');
  const quality = tree.getByRole('treeitem', { name: /质量验证/ });
  await quality.focus();
  await page.getByRole('button', { name: '全部折叠' }).evaluate((button: HTMLButtonElement) => button.click());
  await expect(tree.getByRole('treeitem', { name: /Reito/ })).toBeFocused();
  await expect(tree.getByRole('treeitem')).toHaveCount(1);
});

test('disabled nodes remain readable but cannot select or collapse', async ({ page }) => {
  const tree = await open(page, 'disabled-node');
  const locked = tree.getByRole('treeitem', { name: /受保护模块/ });
  await expect(locked).toHaveAttribute('aria-disabled', 'true');
  await locked.focus();
  await locked.press('Enter');
  await expect(locked).not.toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('button', { name: '折叠 受保护模块' })).toBeDisabled();
  await expect(tree.getByRole('treeitem', { name: /内部实现/ })).toBeVisible();
});

test('non-collapsible charts keep all nodes visible without toggle controls', async ({ page }) => {
  const tree = await open(page, 'non-collapsible');
  await expect(tree.getByRole('treeitem')).toHaveCount(7);
  await expect(page.getByRole('button', { name: /折叠|展开/ })).toHaveCount(0);
  await expect(tree.getByRole('treeitem', { name: /Reito/ })).toHaveAttribute('aria-expanded', 'true');
});

test('custom templates keep chart behavior around custom content', async ({ page }) => {
  const tree = await open(page, 'custom-template');
  await expect(tree.getByText('Owner')).toBeVisible();
  const runtime = tree.getByRole('treeitem', { name: /本地运行时/ });
  await runtime.locator('[data-slot="organization-chart-node"]').click();
  await expect(runtime).toHaveAttribute('aria-selected', 'true');
});

test('empty data renders a named status instead of an empty tree', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--empty&viewMode=story`);
  await expect(page.getByRole('region', { name: '空团队结构' })).toContainText('当前没有组织关系');
  await expect(page.getByRole('tree')).toHaveCount(0);
});

test('long content overflows only inside the chart viewport', async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 640 });
  const tree = await open(page, 'long-content');
  const chart = page.locator('[data-slot="organization-chart"]');
  await expect(tree.getByRole('treeitem')).toHaveCount(6);
  expect(await chart.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(tree.getByRole('treeitem', { name: /跨桌面端与浏览器端复用/ }).locator(':scope > [data-slot="organization-chart-node"]')).toHaveAttribute('title', /负责主题/);
});

test('Playground Controls write selection and collapse state back without changing stories', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('tree')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-selectedId"]').selectOption({ label: 'quality' });
  await expect(frame.getByRole('treeitem', { name: /质量验证/ })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('group', { name: 'collapsedIds' }).getByLabel('engineering', { exact: true }).check();
  await expect(frame.getByRole('treeitem', { name: /质量验证/ })).toHaveCount(0);
  await frame.getByRole('treeitem', { name: /界面设计/ }).locator(':scope > [data-slot="organization-chart-node"]').click();
  await expect(page.locator('[id="control-selectedId"] option:checked')).toHaveText('design');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: token density, axe and narrow viewport`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 720 });
  const tree = await open(page, 'narrow', `theme:${theme};density:${density}`);
  const chart = page.locator('[data-slot="organization-chart"]');
  const leaf = tree.getByRole('treeitem', { name: /界面设计/ }).locator(':scope > [data-slot="organization-chart-node"]');
  await expect(chart).toHaveCSS('overflow-x', 'auto');
  expect(await chart.evaluate(element => getComputedStyle(element).paddingTop)).toBe(density === 'compact' ? '12px' : '20px');
  expect(await leaf.evaluate(element => element.getBoundingClientRect().width)).toBe(160);
  expect(await leaf.evaluate(element => element.getBoundingClientRect().height)).toBeLessThan(60);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body)).violations)).toEqual([]);
  await page.screenshot({ path: `.logs/organization-chart/${theme}-${density}.png`, fullPage: true });
});
