import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-cascader-级联选择';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="cascader"]')).toBeVisible({ timeout: 15_000 });
}

async function openPopup(page: Page) {
  const trigger = page.locator('[data-slot="popover-trigger"]');
  await trigger.click();
  await expect(page.locator('[data-slot="popover-content"]')).toBeVisible();
  return trigger;
}

test('leaf-only navigation opens columns and commits a full path', async ({ page }) => {
  await open(page, 'leaf-only');
  const trigger = await openPopup(page);
  await page.getByRole('option', { name: /前端/ }).click();
  await expect(page.getByRole('listbox')).toHaveCount(2);
  await page.getByRole('option', { name: 'Vue' }).click();
  await expect(page.getByRole('listbox')).toHaveCount(3);
  await page.getByRole('option', { name: '文档站' }).click();
  await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(0);
  await expect(trigger).toContainText('前端 / Vue / 文档站');
  await expect(trigger).toBeFocused();
});

test('branch rows navigate without committing in leaf mode', async ({ page }) => {
  await open(page, 'leaf-only');
  const trigger = await openPopup(page);
  await page.getByRole('option', { name: /后端/ }).click();
  await expect(page.locator('[data-slot="popover-content"]')).toBeVisible();
  await expect(trigger).toContainText('前端 / React / 组件库');
});

test('any-level mode exposes a deliberate branch commit action', async ({ page }) => {
  await open(page, 'any-level');
  const trigger = await openPopup(page);
  await page.getByRole('option', { name: /前端/ }).click();
  await page.getByRole('button', { name: '选择当前层级' }).click();
  await expect(trigger).toContainText('前端');
  await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(0);
});

test('label display mode keeps the value as a complete path', async ({ page }) => {
  await open(page, 'label-only');
  await expect(page.locator('[data-slot="popover-trigger"]')).toContainText('文档站');
  await expect(page.locator('[data-slot="popover-trigger"]')).not.toContainText('前端');
});

test('arrow keys traverse levels and Enter selects the leaf', async ({ page }) => {
  await open(page, 'controlled');
  const trigger = await openPopup(page);
  const frontend = page.getByRole('option', { name: /前端/ });
  await frontend.focus();
  await frontend.press('ArrowRight');
  await expect(page.getByRole('option', { name: 'React' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('option', { name: '组件库' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('option', { name: '桌面应用' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(trigger).toContainText('前端 / React / 桌面应用');
  await expect(page.locator('output')).toContainText('["frontend","react","desktop-app"]');
});

test('Left returns to the parent column and Escape restores trigger focus', async ({ page }) => {
  await open(page, 'controlled');
  const trigger = await openPopup(page);
  const leaf = page.getByRole('option', { name: '桌面应用' });
  await leaf.focus();
  await leaf.press('ArrowLeft');
  await expect(page.getByRole('option', { name: 'React' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('disabled branches remain visible but unavailable', async ({ page }) => {
  await open(page, 'disabled-option');
  await openPopup(page);
  await page.getByRole('option', { name: /后端/ }).click();
  await expect(page.getByRole('option', { name: /Rust/ })).toBeDisabled();
  await expect(page.getByRole('option', { name: /Rust/ })).toHaveAttribute('aria-disabled', 'true');
});

test('clear removes the selected path without opening the popup', async ({ page }) => {
  await open(page, 'overview');
  await page.getByRole('button', { name: '清除选择' }).click();
  await expect(page.locator('[data-slot="popover-trigger"]')).toContainText('请选择');
  await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(0);
});

test('empty, loading and global error states are explicit', async ({ page }) => {
  await open(page, 'empty');
  await expect(page.locator('[data-slot="popover-content"]')).toContainText('没有可用选项');
  await open(page, 'loading');
  await expect(page.getByRole('status')).toContainText('正在加载选项');
  await open(page, 'load-error');
  await expect(page.getByRole('alert')).toContainText('选项服务暂不可用');
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.getByRole('option', { name: /前端/ })).toBeVisible();
});

test('lazy branches resolve into further columns', async ({ page }) => {
  await open(page, 'lazy');
  await openPopup(page);
  await page.getByRole('option', { name: /云端工作区/ }).click();
  await expect(page.getByRole('status')).toContainText('正在加载选项');
  await expect(page.getByRole('option', { name: 'design-system' })).toBeVisible();
  await page.getByRole('option', { name: 'design-system' }).click();
  await page.getByRole('option', { name: 'Storybook' }).click();
  await expect(page.locator('[data-slot="popover-trigger"]')).toContainText('云端工作区 / design-system / Storybook');
});

test('lazy branch failure retries in place', async ({ page }) => {
  await open(page, 'lazy-error-retry');
  await openPopup(page);
  await page.getByRole('option', { name: /云端工作区/ }).click();
  await expect(page.getByRole('alert')).toContainText('子层级暂不可用');
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.getByRole('option', { name: '已恢复选项' })).toBeVisible();
  await expect(page.locator('output')).toHaveText('尝试次数：2');
});

test('path submits as stable JSON and invalid state is exposed', async ({ page }) => {
  await open(page, 'native-form');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.getByTestId('form-value')).toHaveText('form=["frontend","react","component-library"]');
  await open(page, 'field-error');
  await expect(page.getByRole('alert')).toContainText('请选择一个可用的叶节点');
  await expect(page.locator('[data-slot="popover-trigger"]')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('[data-slot="popover-trigger"]')).toHaveAttribute('aria-required', 'true');
});

test('Playground updates boundary and loading props without leaving the Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="cascader"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('combobox', { name: 'selectionBoundary' }).selectOption('any');
  await page.getByRole('switch', { name: 'loading' }).press('Space');
  await frame.locator('[data-slot="popover-trigger"]').click();
  await expect(frame.getByRole('status')).toContainText('正在加载选项');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: columns fit a narrow surface and pass axe`, async ({ page }) => {
  await page.setViewportSize({ width: 440, height: 760 });
  await open(page, 'leaf-only', `theme:${theme};density:${density}`);
  await openPopup(page);
  await page.getByRole('option', { name: /前端/ }).click();
  await page.getByRole('option', { name: 'React' }).click();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/cascader/${theme}-${density}.png`, fullPage: true });
});
