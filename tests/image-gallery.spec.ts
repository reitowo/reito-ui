import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-imagegallery-图片画廊';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.getByRole('region', { name: /图片画廊|当前没有图片/ }).first()).toBeVisible({ timeout: 15_000 });
}

test('overview opens a modal, navigates and restores the preview trigger focus', async ({ page }) => {
  await open(page, 'overview');
  const trigger = page.getByRole('button', { name: /放大预览/ });
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('thumbnail tabs expose selection and update the active image', async ({ page }) => {
  await open(page, 'narrow');
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(3);
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('工作区布局', { exact: true })).toBeVisible();
});

test('thumbnail keyboard uses arrows, Home and End with roving focus', async ({ page }) => {
  await open(page, 'narrow');
  const tabs = page.getByRole('tab');
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await page.keyboard.press('End');
  await expect(tabs.nth(2)).toBeFocused();
  await page.keyboard.press('Home');
  await expect(tabs.nth(0)).toBeFocused();
});

test('non-looping preview disables controls at collection boundaries', async ({ page }) => {
  await open(page, 'narrow');
  await page.getByRole('button', { name: /放大预览/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: '上一张' })).toBeDisabled();
  await dialog.getByRole('button', { name: '下一张' }).click();
  await dialog.getByRole('button', { name: '下一张' }).click();
  await expect(dialog.getByRole('button', { name: '下一张' })).toBeDisabled();
});

test('looping preview wraps with arrow keys', async ({ page }) => {
  await open(page, 'loop');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('status')).toHaveText('1 / 3');
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByRole('status')).toHaveText('3 / 3');
});

test('controlled loading state is stable and announced', async ({ page }) => {
  await open(page, 'loading');
  await expect(page.getByRole('status', { name: '' })).toContainText('正在加载图像');
});

test('error state opens a retryable modal without nested controls', async ({ page }) => {
  await open(page, 'error-state');
  await expect(page.getByRole('alert')).toHaveText('本地图像解码失败');
  await page.getByRole('button', { name: /放大预览/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: '重试' })).toBeVisible();
  await dialog.getByRole('button', { name: '重试' }).click();
});

test('empty and disabled states remain non-interactive', async ({ page }) => {
  await open(page, 'empty');
  await expect(page.getByText('当前没有图片', { exact: true })).toBeVisible();
  await open(page, 'disabled');
  await expect(page.getByRole('button', { name: /放大预览/ })).toBeDisabled();
  await expect(page.getByRole('tab').first()).toBeDisabled();
});

test('Playground controls change active item and preview without switching Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('region', { name: '图片画廊' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('[id="control-activeId"]').selectOption('gallery-2');
  await expect(frame.getByText('工作区布局', { exact: true })).toBeVisible();
  await page.locator('[id="control-previewOpen"]').focus();
  await page.keyboard.press('Space');
  await expect(frame.getByRole('dialog')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(`/story/${prefix}--playground`);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: gallery remains accessible in a narrow work surface`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 800 });
  await open(page, 'narrow', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect((await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/image-gallery/${theme}-${density}.png`, fullPage: true });
});
