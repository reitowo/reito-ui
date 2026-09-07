import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-treeselect-树选择';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="tree-select"]')).toBeVisible({ timeout: 15_000 });
}

async function openPopup(page: Page) {
  const trigger = page.locator('[data-slot="popover-trigger"]');
  await trigger.click();
  await expect(page.locator('[data-slot="popover-content"]')).toBeVisible();
  return trigger;
}

test('single selection closes popup and returns focus', async ({ page }) => {
  await open(page, 'single');
  const trigger = await openPopup(page);
  await page.getByLabel('搜索节点').fill('App');
  await page.getByRole('treeitem', { name: /App\.tsx/ }).click();
  await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(0);
  await expect(trigger).toContainText('App.tsx');
  await expect(trigger).toBeFocused();
});

test('checkbox selection keeps popup open and cascades descendants', async ({ page }) => {
  await open(page, 'checkbox');
  const trigger = await openPopup(page);
  const components = page.getByRole('treeitem', { name: /components/ });
  await expect(components).toHaveAttribute('aria-checked', 'mixed');
  await components.click();
  await expect(components).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('treeitem', { name: /input\.tsx/ })).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('[data-slot="popover-content"]')).toBeVisible();
  await page.getByRole('button', { name: '完成' }).click();
  await expect(trigger).toContainText('已选择 2 项');
});

test('search is a visibility projection and preserves hidden checked nodes', async ({ page }) => {
  await open(page, 'checkbox');
  await openPopup(page);
  const search = page.getByLabel('搜索节点');
  await search.fill('input');
  await expect(page.getByRole('treeitem', { name: /input\.tsx/ })).toBeVisible();
  await expect(page.getByRole('treeitem', { name: /button\.tsx/ })).toHaveCount(0);
  await page.getByRole('treeitem', { name: /input\.tsx/ }).click();
  await search.fill('');
  await expect(page.getByRole('treeitem', { name: /button\.tsx/ })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('treeitem', { name: /input\.tsx/ })).toHaveAttribute('aria-checked', 'true');
});

test('searching a parent keeps its current subtree visible', async ({ page }) => {
  await open(page, 'single');
  await openPopup(page);
  await page.getByLabel('搜索节点').fill('components');
  await expect(page.getByRole('treeitem', { name: /button\.tsx/ })).toBeVisible();
  await expect(page.getByRole('treeitem', { name: /input\.tsx/ })).toBeVisible();
});

test('no search match renders an explicit empty state', async ({ page }) => {
  await open(page, 'no-results');
  await openPopup(page);
  await expect(page.getByRole('status')).toHaveText('没有匹配节点');
  await expect(page.getByRole('tree')).toHaveCount(0);
});

test('tree keyboard behavior remains available inside the popup', async ({ page }) => {
  await open(page, 'single');
  await openPopup(page);
  await page.getByLabel('搜索节点').press('Tab');
  const src = page.getByRole('treeitem', { name: /^src/ });
  await expect(src).toBeFocused();
  await src.press('ArrowRight');
  await src.press('ArrowRight');
  await expect(page.getByRole('treeitem', { name: /^components/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-slot="popover-trigger"]')).toContainText('components');
});

test('clear resets single and checkbox values', async ({ page }) => {
  await open(page, 'overview');
  const trigger = await openPopup(page);
  await page.getByRole('button', { name: '清除' }).click();
  await expect(trigger).toContainText('请选择');
  await open(page, 'checkbox');
  const checkboxTrigger = await openPopup(page);
  await page.getByRole('button', { name: '清除' }).click();
  await page.getByRole('button', { name: '完成' }).click();
  await expect(checkboxTrigger).toContainText('请选择');
});

test('Escape restores focus without changing selection', async ({ page }) => {
  await open(page, 'focus-return');
  const trigger = await openPopup(page);
  await page.getByLabel('搜索节点').fill('input');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText('button.tsx');
});

test('lazy roots load children and loaded labels become searchable', async ({ page }) => {
  await open(page, 'lazy');
  await openPopup(page);
  await expect(page.locator('[data-load-state="loading"]')).toBeVisible();
  const src = page.getByRole('treeitem', { name: /^src/ });
  await expect(src).toBeVisible();
  await src.locator('[data-slot="tree-toggle"]').click();
  await expect(page.getByRole('treeitem', { name: /App\.tsx/ })).toBeVisible();
  await page.getByLabel('搜索节点').fill('tokens');
  await expect(page.getByRole('treeitem', { name: /tokens\.json/ })).toBeVisible();
  await expect(page.getByRole('treeitem', { name: /archive/ })).toHaveCount(0);
});

test('lazy load error can retry without stale responses', async ({ page }) => {
  await open(page, 'lazy-error-retry');
  await openPopup(page);
  await expect(page.getByRole('alert')).toContainText('目录暂不可用');
  await page.getByRole('button', { name: '重试', exact: true }).click();
  await expect(page.getByRole('treeitem', { name: /recovered\.ts/ })).toBeVisible();
  await expect(page.locator('output')).toHaveText('尝试次数：2');
});

test('checkbox values submit as repeated native form entries', async ({ page }) => {
  await open(page, 'native-form');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.getByTestId('form-value')).toHaveText('form=button,input');
});

test('disabled and invalid states remain explicit', async ({ page }) => {
  await open(page, 'disabled');
  await expect(page.locator('[data-slot="popover-trigger"]')).toBeDisabled();
  await open(page, 'field-error');
  await expect(page.getByRole('alert')).toHaveText('请选择一个可用入口。');
  await expect(page.locator('[data-slot="popover-trigger"]')).toHaveAttribute('aria-invalid', 'true');
});

test('Playground switches to checkbox mode and filters without leaving the Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="tree-select"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('combobox', { name: 'selectionMode' }).selectOption('checkbox');
  await page.locator('#control-query').fill('input');
  await frame.locator('[data-slot="popover-trigger"]').click();
  await expect(frame.getByRole('treeitem', { name: /input\.tsx/ })).toHaveAttribute('aria-checked');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: open popup fits a narrow surface and passes axe`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 760 });
  await open(page, 'checkbox', `theme:${theme};density:${density}`);
  await openPopup(page);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/tree-select/${theme}-${density}.png`, fullPage: true });
});
