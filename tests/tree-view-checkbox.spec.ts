import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-treeview-树形导航';
async function open(page: Page, variant: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${variant}&viewMode=story&globals=${globals}`);
  const tree = page.getByRole('tree'); await expect(tree).toBeVisible(); return tree;
}

test('partial descendants expose mixed ancestors', async ({ page }) => {
  const tree = await open(page, 'partial');
  await expect(tree.getByRole('treeitem', { name: 'button.tsx' })).toHaveAttribute('aria-checked', 'true');
  await expect(tree.getByRole('treeitem', { name: 'components' })).toHaveAttribute('aria-checked', 'mixed');
  await expect(tree.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-checked', 'mixed');
});

test('cascade selection round-trips parent and child state', async ({ page }) => {
  const tree = await open(page, 'cascade');
  const components = tree.getByRole('treeitem', { name: 'components' });
  const input = tree.getByRole('treeitem', { name: 'input.tsx' });
  await expect(input).toHaveAttribute('aria-checked', 'true');
  await input.press(' '); await expect(components).toHaveAttribute('aria-checked', 'mixed');
  await components.press(' '); await expect(components).toHaveAttribute('aria-checked', 'true');
  await expect(input).toHaveAttribute('aria-checked', 'true');
});

test('Shift range applies to visible enabled nodes', async ({ page }) => {
  const tree = await open(page, 'partial');
  const button = tree.getByRole('treeitem', { name: 'button.tsx' });
  await button.press(' ');
  await tree.getByRole('treeitem', { name: 'App.tsx' }).click({ modifiers: ['Shift'] });
  await expect(button).toHaveAttribute('aria-checked', 'true');
  await expect(tree.getByRole('treeitem', { name: 'input.tsx' })).toHaveAttribute('aria-checked', 'true');
  await expect(tree.getByRole('treeitem', { name: 'components' })).toHaveAttribute('aria-checked', 'true');
  await expect(tree.getByRole('treeitem', { name: 'private.tsx' })).not.toHaveAttribute('aria-checked');
});

test('Control+A toggles all enabled nodes in one batch', async ({ page }) => {
  const tree = await open(page, 'partial');
  const button = tree.getByRole('treeitem', { name: 'button.tsx' }); await button.focus(); await button.press('Control+a');
  await expect(tree.getByRole('treeitem', { name: 'README.md' })).toHaveAttribute('aria-checked', 'true');
  await button.press('Control+a'); await expect(button).toHaveAttribute('aria-checked', 'false');
  await expect(tree.getByRole('treeitem', { name: 'private.tsx' })).not.toHaveAttribute('aria-checked');
});

test('disabled branches form a cascade barrier', async ({ page }) => {
  const tree = await open(page, 'disabled-barrier');
  await expect(tree.getByRole('treeitem', { name: 'workspace' })).toHaveAttribute('aria-checked', 'true');
  await expect(tree.getByRole('treeitem', { name: 'public.ts' })).toHaveAttribute('aria-checked', 'true');
  await expect(tree.getByRole('treeitem', { name: 'locked' })).not.toHaveAttribute('aria-checked');
  await expect(tree.getByRole('treeitem', { name: 'secret.txt' })).toHaveAttribute('aria-checked', 'false');
});

test('independent mode does not derive child or ancestor state', async ({ page }) => {
  const tree = await open(page, 'independent');
  await expect(tree.getByRole('treeitem', { name: 'components' })).toHaveAttribute('aria-checked', 'true');
  await expect(tree.getByRole('treeitem', { name: 'button.tsx' })).toHaveAttribute('aria-checked', 'false');
  await expect(tree.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-checked', 'false');
});

test('Playground keeps controlled checkbox args synchronized in the same tab', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe'); await expect(frame.getByRole('tree')).toBeVisible({ timeout: 15000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('[id="control-selectionMode"]').selectOption('checkbox');
  const tree = frame.getByRole('tree'); const input = tree.getByRole('treeitem', { name: 'input.tsx' });
  await input.click(); await expect(input).toHaveAttribute('aria-checked', 'true');
  await expect(tree.getByRole('treeitem', { name: 'components' })).toHaveAttribute('aria-checked', 'true');
  expect(new URL(page.url()).searchParams.get('path')).toBe(`/story/${prefix}--playground`);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: checkbox tree is compact and accessible`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 }); const tree = await open(page, 'partial', `theme:${theme};density:${density}`);
  const first = tree.getByRole('treeitem', { name: 'src' });
  expect(await first.locator(':scope > [data-slot="tree-item-row"]').evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 24 : 32);
  await first.focus();
  expect(await first.locator(':scope > [data-slot="tree-item-row"]').evaluate(element => getComputedStyle(element).boxShadow)).not.toBe('none');
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/tree-view-checkbox/${theme}-${density}.png`, fullPage: true });
});
