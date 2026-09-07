import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
const prefix = '复杂-sortablelist-排序列表';
async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="sortable-list"]')).toBeVisible({ timeout: 15_000 });
  return page.getByRole('listbox');
}
const ids = async (page: Page) => page.locator('[data-item-id]').evaluateAll(rows => rows.map(row => row.getAttribute('data-item-id')));

test('exposes ordered options and disabled barrier', async ({ page }) => {
  const list = await open(page, 'overview');
  await expect(list.getByRole('option')).toHaveCount(5);
  await expect(list.locator('[data-item-id="approval"]')).toHaveAttribute('aria-disabled', 'true');
  expect(await ids(page)).toEqual(['context', 'plan', 'approval', 'execute', 'report']);
});
test('button movement updates controlled order', async ({ page }) => {
  await open(page, 'controlled');
  await page.getByRole('button', { name: '下移' }).click();
  await expect(page.locator('output')).toContainText('approval > report > execute');
  expect(await ids(page)).toEqual(['context', 'plan', 'approval', 'report', 'execute']);
});
test('disabled item blocks movement across its position', async ({ page }) => {
  const list = await open(page, 'locked-barrier');
  await page.getByRole('button', { name: '置顶' }).click();
  expect(await ids(page)).toEqual(['context', 'plan', 'approval', 'execute', 'report']);
});
test('multiple selected items move as an ordered batch', async ({ page }) => {
  const list = await open(page, 'batch');
  await list.locator('[data-item-id="plan"]').click();
  await page.getByRole('button', { name: '下移' }).click();
  expect(await ids(page)).toEqual(['plan', 'context', 'approval', 'execute', 'report']);
});
test('Alt+Down reorders and keeps focus on the moved item', async ({ page }) => {
  const list = await open(page, 'keyboard');
  const item = list.locator('[data-item-id="execute"]');
  await item.focus();
  await item.press('Alt+ArrowDown');
  expect(await ids(page)).toEqual(['context', 'plan', 'approval', 'report', 'execute']);
  await expect(item).toBeFocused();
});
test('arrow navigation and Space change selection', async ({ page }) => {
  const list = await open(page, 'no-drag');
  const context = list.locator('[data-item-id="context"]');
  await context.focus();
  await context.press('ArrowDown');
  const plan = list.locator('[data-item-id="plan"]');
  await expect(plan).toBeFocused();
  await plan.press(' ');
  await expect(plan).toHaveAttribute('aria-selected', 'true');
});
test('native drag reorders within an unlocked segment', async ({ page }) => {
  const list = await open(page, 'overview');
  await list.locator('[data-item-id="context"]').dragTo(list.locator('[data-item-id="plan"]'), { targetPosition: { x: 20, y: 30 } });
  expect(await ids(page)).toEqual(['plan', 'context', 'approval', 'execute', 'report']);
});
test('native drag cannot cross a disabled barrier', async ({ page }) => {
  const list = await open(page, 'overview');
  await list.locator('[data-item-id="context"]').dragTo(list.locator('[data-item-id="execute"]'));
  expect(await ids(page)).toEqual(['context', 'plan', 'approval', 'execute', 'report']);
});
test('read only, disabled and empty states are explicit', async ({ page }) => {
  for (const story of ['read-only', 'disabled']) { await open(page, story); await expect(page.getByRole('button', { name: '上移' })).toBeDisabled(); }
  await open(page, 'empty'); await expect(page.getByText('没有可排序的项目')).toBeVisible();
});
test('Playground updates order in Controls without leaving the Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="sortable-list"]')).toBeVisible({ timeout: 15_000 });
  await frame.getByRole('button', { name: '置顶' }).click();
  await expect(frame.locator('[data-item-id="plan"]')).toContainText('1');
  expect(new URL(page.url()).searchParams.get('path')).toBe('/story/' + prefix + '--playground');
});
for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: sortable list stays accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 760 }); await open(page, 'narrow', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/sortable-list/${theme}-${density}.png`, fullPage: true });
});
