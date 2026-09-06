import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-reorderabletreeview-树重排';
async function open(page: Page, variant = 'playground', globals = 'theme:dark;density:compact') { await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${variant}&viewMode=story&globals=${globals}`); const tree = page.getByRole('tree'); await expect(tree).toBeVisible(); return tree; }

test('Alt arrows reorder, indent and outdent while preserving selection and focus', async ({ page }) => {
  const tree = await open(page); const input = tree.getByRole('treeitem', { name: 'input.tsx' }); await input.focus(); await input.press('Alt+ArrowUp');
  await expect(tree.getByRole('treeitem').nth(2)).toHaveAccessibleName('input.tsx'); await expect(input).toBeFocused();
  const button = tree.getByRole('treeitem', { name: 'button.tsx' }); await button.focus(); await button.press('Alt+ArrowRight');
  await expect(button).toHaveAttribute('aria-level', '4'); await expect(button).toHaveAttribute('aria-selected', 'true'); await expect(button).toBeFocused();
  await button.press('Alt+ArrowLeft'); await expect(button).toHaveAttribute('aria-level', '3'); await expect(button).toBeFocused();
});

test('pointer drop reparents a node inside a valid target', async ({ page }) => {
  const tree = await open(page); const button = tree.getByRole('treeitem', { name: 'button.tsx' }); const app = tree.getByRole('treeitem', { name: 'App.tsx' });
  await button.dragTo(app); await expect(button).toHaveAttribute('aria-level', '3'); await expect(button).toHaveAttribute('aria-selected', 'true');
});

test('cycle and disabled target drops are rejected', async ({ page }) => {
  let tree = await open(page, 'invalid-cycle'); const src = tree.getByRole('treeitem', { name: 'src' }); await src.dragTo(tree.getByRole('treeitem', { name: 'components' })); await expect(src).toHaveAttribute('aria-level', '1');
  tree = await open(page, 'disabled-target'); const file = tree.getByRole('treeitem', { name: 'file.ts' }); await file.dragTo(tree.getByRole('treeitem', { name: 'locked' })); await expect(file).toHaveAttribute('aria-level', '2');
});

test('matching scopes allow a controlled cross-tree transfer', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--cross-tree&viewMode=story`); const source = page.getByRole('tree', { name: '来源树' }); const target = page.getByRole('tree', { name: '目标树' }); await expect(source).toBeVisible(); await expect(target).toBeVisible(); const draft = source.getByRole('treeitem', { name: 'draft.md' });
  await draft.dragTo(target.getByRole('treeitem', { name: 'archive' }), { targetPosition: { x: 40, y: 12 } }); await expect(source.getByRole('treeitem', { name: 'draft.md' })).toHaveCount(0); await expect(target.getByRole('treeitem', { name: 'draft.md' })).toHaveAttribute('aria-level', '2');
});

test('Playground Controls keep value and expansion on the same Story tab', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`); const frame = page.frameLocator('#storybook-preview-iframe'); await expect(frame.getByRole('tree')).toBeVisible({ timeout: 15000 }); await page.getByRole('tab', { name: /^Controls/ }).click(); const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-value"]').selectOption('input'); await expect(frame.getByRole('treeitem', { name: 'input.tsx' })).toHaveAttribute('aria-selected', 'true'); expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: reorder tree remains compact and accessible`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 }); const tree = await open(page, 'playground', `theme:${theme};density:${density}`); const src = tree.getByRole('treeitem', { name: 'src' }); expect(await src.locator(':scope > [data-slot="tree-item-row"]').evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 24 : 32);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') }); expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: `.logs/reorderable-tree-view/${theme}-${density}.png`, fullPage: true });
});
