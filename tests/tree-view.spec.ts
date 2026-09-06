import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const story = '复杂-treeview-树形导航--playground';
async function open(page: Page, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${story}&viewMode=story&globals=${globals}`);
  const tree = page.getByRole('tree', { name: '项目树' }); await expect(tree).toBeVisible(); return tree;
}

test('ARIA hierarchy and arrow navigation follow the visible tree order', async ({ page }) => {
  const tree = await open(page);
  const button = tree.getByRole('treeitem', { name: 'button.tsx' });
  await expect(button).toHaveAttribute('aria-level', '3'); await expect(button).toHaveAttribute('aria-selected', 'true');
  await button.focus(); await button.press('ArrowDown'); await expect(tree.getByRole('treeitem', { name: 'input.tsx' })).toBeFocused();
  await page.keyboard.press('ArrowLeft'); await expect(tree.getByRole('treeitem', { name: 'components' })).toBeFocused();
  await page.keyboard.press('ArrowLeft'); await expect(tree.getByRole('treeitem', { name: 'components' })).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('ArrowRight'); await expect(tree.getByRole('treeitem', { name: 'components' })).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('ArrowRight'); await expect(tree.getByRole('treeitem', { name: 'button.tsx' })).toBeFocused();
  await page.keyboard.press('End'); await expect(tree.getByRole('treeitem', { name: /README.md/ })).toBeFocused();
  await page.keyboard.press('Home'); await expect(tree.getByRole('treeitem', { name: 'src' })).toBeFocused();
});

test('selection is controlled and disabled nodes stay navigable but cannot activate', async ({ page }) => {
  const tree = await open(page);
  const input = tree.getByRole('treeitem', { name: 'input.tsx' }); await input.focus(); await input.press('Enter');
  await expect(input).toHaveAttribute('aria-selected', 'true');
  const disabled = tree.getByRole('treeitem', { name: 'private.tsx' }); await input.press('ArrowDown'); await expect(disabled).toBeFocused();
  await expect(disabled).toHaveAttribute('aria-disabled', 'true'); await disabled.press(' ');
  await expect(disabled).not.toHaveAttribute('aria-selected');
});

test('collapsing an ancestor restores focus to the closest visible parent', async ({ page }) => {
  await page.goto('http://127.0.0.1:6007/iframe.html?id=复杂-treeview-树形导航--focus-recovery&viewMode=story');
  const input = page.getByRole('treeitem', { name: 'input.tsx' }); await input.focus();
  await page.getByRole('button', { name: '折叠 src' }).evaluate((element: HTMLButtonElement) => element.click());
  await expect(page.getByRole('treeitem', { name: 'src' })).toBeFocused();
  await expect(input).toHaveCount(0);
});

test('Playground Controls update selection and expansion without changing tabs', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe'); await expect(frame.getByRole('tree')).toBeVisible({ timeout: 15000 });
  await page.getByRole('tab', { name: /^Controls/ }).click(); const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-value"]').selectOption({ label: 'readme' });
  await expect(frame.getByRole('treeitem', { name: /README.md/ })).toHaveAttribute('aria-selected', 'true');
  await page.getByLabel('src', { exact: true }).uncheck();
  await expect(frame.getByRole('treeitem', { name: 'button.tsx' })).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: compact rows, axe and narrow tree`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 }); const tree = await open(page, `theme:${theme};density:${density}`);
  const first = tree.getByRole('treeitem', { name: 'src' });
  expect(await first.locator(':scope > [data-slot="tree-item-row"]').evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 24 : 32);
  await first.focus(); await first.press('End'); await expect(tree.getByRole('treeitem', { name: /README.md/ })).toBeFocused();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/tree-view/${theme}-${density}.png`, fullPage: true });
});
