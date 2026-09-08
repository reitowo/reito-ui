import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-splitbutton-拆分按钮';

async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const group = page.locator('[data-slot="split-button"]').first();
  await expect(group).toBeVisible({ timeout: 15_000 });
  return group;
}

test('main command and related menu commands remain distinct host callbacks', async ({ page }) => {
  const group = await open(page);
  await group.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('已运行主操作：保存（本地示例）');
  await group.getByRole('button', { name: '更多保存操作' }).click();
  await page.getByRole('menuitem', { name: /保存副本/ }).click();
  await expect(page.getByRole('status')).toHaveText('已选择：保存副本（本地示例）');
});

test('menu trigger opens with ArrowDown and Escape restores its focus', async ({ page }) => {
  const group = await open(page, 'keyboard-navigation');
  const trigger = group.getByRole('button', { name: '更多保存操作' });
  await trigger.focus();
  await trigger.press('ArrowDown');
  const firstItem = page.getByRole('menuitem', { name: /保存副本/ });
  await expect(firstItem).toBeVisible();
  await expect(firstItem).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(firstItem).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('menu supports arrow navigation, typeahead, shortcuts and item activation', async ({ page }) => {
  const group = await open(page, 'keyboard-navigation');
  const trigger = group.getByRole('button', { name: '更多保存操作' });
  await trigger.focus();
  await trigger.press('Enter');
  await expect(page.getByRole('menuitem', { name: /保存副本/ })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  const branch = page.getByRole('menuitem', { name: /保存并创建分支/ });
  await expect(branch).toBeFocused();
  await expect(page.getByText('Ctrl+Alt+S', { exact: true })).toBeVisible();
  await page.keyboard.press('Home');
  await page.keyboard.type('b');
  await expect(branch).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toHaveText('菜单操作已执行：保存并创建分支');
  await expect(trigger).toBeFocused();
});

test('whole-group and per-button disabled contracts are independent', async ({ page }) => {
  const groups = page.locator('[data-slot="split-button"]');
  await open(page, 'independent-disabled');
  await expect(groups).toHaveCount(3);
  await expect(groups.nth(0).getByRole('button', { name: '仅菜单可用', exact: true })).toBeDisabled();
  await expect(groups.nth(0).getByRole('button', { name: '仅菜单可用的相关操作' })).toBeEnabled();
  await expect(groups.nth(1).getByRole('button', { name: '仅主操作可用', exact: true })).toBeEnabled();
  await expect(groups.nth(1).getByRole('button', { name: '已禁用的相关操作' })).toBeDisabled();
  for (const button of await groups.nth(2).getByRole('button').all()) await expect(button).toBeDisabled();
});

test('main loading disables only the main command and exposes busy state', async ({ page }) => {
  const group = await open(page, 'main-loading');
  const main = group.getByRole('button', { name: '正在保存' });
  await expect(main).toBeDisabled();
  await expect(main).toHaveAttribute('aria-busy', 'true');
  await expect(group.getByRole('button', { name: '保存期间仍可用的相关操作' })).toBeEnabled();
  await expect(group.locator('[data-slot="spinner"]')).toHaveCount(0);
  await expect(main.locator('svg')).toHaveCount(1);
});

test('menu loading remains inspectable and exposes a labelled status', async ({ page }) => {
  const group = await open(page, 'menu-loading');
  const trigger = group.getByRole('button', { name: '查看正在加载的操作' });
  await expect(trigger).toBeEnabled();
  await expect(trigger).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByRole('status', { name: '' })).toHaveText('正在加载操作…');
  await expect(page.getByRole('menuitem')).toHaveAttribute('aria-disabled', 'true');
});

test('an item can be busy without disabling the other menu commands', async ({ page }) => {
  await open(page, 'item-loading');
  const loadingItem = page.getByRole('menuitem', { name: '保存副本，正在执行' });
  await expect(loadingItem).toHaveAttribute('aria-busy', 'true');
  await expect(loadingItem).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('menuitem', { name: /保存并创建分支/ })).not.toHaveAttribute('aria-disabled', 'true');
});

test('empty menus explain the absence of related actions', async ({ page }) => {
  await open(page, 'empty');
  const empty = page.getByRole('menuitem', { name: '当前没有其他保存方式' });
  await expect(empty).toHaveAttribute('aria-disabled', 'true');
});

test('Playground Controls update the same story and callbacks synchronize args', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="split-button"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-label"]').fill('提交');
  await expect(frame.getByRole('button', { name: '保存当前草稿' })).toHaveText('提交');
  await page.locator('[id="control-actionLabel"]').fill('提交当前草稿');
  await expect(frame.getByRole('button', { name: '提交当前草稿' })).toBeVisible();
  await page.locator('[id="control-menuLabel"]').fill('更多提交操作');
  const trigger = frame.getByRole('button', { name: '更多提交操作' });
  await trigger.click();
  await expect(page.locator('[id="control-open"]')).toBeChecked();
  await frame.getByRole('menuitem', { name: /保存副本/ }).click();
  await expect(page.locator('[id="control-open"]')).not.toBeChecked();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: shared edges keep one control height and pass axe`, async ({ page }) => {
  const group = await open(page, 'default', `theme:${theme};density:${density}`);
  const buttons = group.getByRole('button');
  await expect(buttons).toHaveCount(2);
  const boxes = await buttons.evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { left: rect.left, right: rect.right, height: rect.height, radiusLeft: style.borderTopLeftRadius, radiusRight: style.borderTopRightRadius };
  }));
  expect(boxes[0]!.right).toBeCloseTo(boxes[1]!.left, 1);
  expect(boxes[0]!.height).toBe(boxes[1]!.height);
  expect(boxes[0]!.radiusRight).toBe('0px');
  expect(boxes[1]!.radiusLeft).toBe('0px');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  await page.screenshot({ path: `.logs/split-button/${theme}-${density}.png`, fullPage: true });
});
