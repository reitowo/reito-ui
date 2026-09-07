import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-imagegallery-图片画廊';

async function open(page: Page, story = 'viewer-tools', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  return dialog;
}

test('zoom controls respect configured min, max and step', async ({ page }) => {
  const dialog = await open(page);
  const stage = dialog.locator('[data-image-stage]');
  await dialog.getByRole('button', { name: '放大' }).click();
  await expect(stage).toHaveAttribute('data-scale', '1.5');
  await dialog.getByRole('button', { name: '放大' }).click();
  await dialog.getByRole('button', { name: '放大' }).click();
  await dialog.getByRole('button', { name: '放大' }).click();
  await expect(stage).toHaveAttribute('data-scale', '3');
  await expect(dialog.getByRole('button', { name: '放大' })).toBeDisabled();
  for (let index = 0; index < 5; index++) await dialog.getByRole('button', { name: '缩小' }).click();
  await expect(stage).toHaveAttribute('data-scale', '0.5');
  await expect(dialog.getByRole('button', { name: '缩小' })).toBeDisabled();
});

test('keyboard zoom and reset operate inside the viewer', async ({ page }) => {
  const dialog = await open(page);
  const stage = dialog.locator('[data-image-stage]');
  await page.keyboard.press('+');
  await expect(stage).toHaveAttribute('data-scale', '1.5');
  await page.keyboard.press('0');
  await expect(stage).toHaveAttribute('data-scale', '1');
});

test('rotation and flips expose pressed state and transform metadata', async ({ page }) => {
  const dialog = await open(page);
  const stage = dialog.locator('[data-image-stage]');
  await dialog.getByRole('button', { name: '向右旋转' }).click();
  await expect(stage).toHaveAttribute('data-rotation', '90');
  const horizontal = dialog.getByRole('button', { name: '水平翻转' });
  const vertical = dialog.getByRole('button', { name: '垂直翻转' });
  await horizontal.click(); await vertical.click();
  await expect(horizontal).toHaveAttribute('aria-pressed', 'true');
  await expect(vertical).toHaveAttribute('aria-pressed', 'true');
  await expect(stage).toHaveAttribute('data-flip-x', 'true');
  await expect(stage).toHaveAttribute('data-flip-y', 'true');
});

test('zoomed image can be panned with pointer drag', async ({ page }) => {
  const dialog = await open(page);
  await dialog.getByRole('button', { name: '放大' }).click();
  await dialog.getByRole('button', { name: '放大' }).click();
  const stage = dialog.locator('[data-image-stage]');
  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 32, box!.y + box!.height / 2 + 18);
  await page.mouse.up();
  await expect(stage).toHaveAttribute('data-x', '32');
  await expect(stage).toHaveAttribute('data-y', '18');
});

test('changing the active image resets viewer transforms', async ({ page }) => {
  const dialog = await open(page);
  const stage = dialog.locator('[data-image-stage]');
  await dialog.getByRole('button', { name: '放大' }).click();
  await dialog.getByRole('button', { name: '向右旋转' }).click();
  await dialog.getByRole('button', { name: '下一张' }).click();
  await expect(stage).toHaveAttribute('data-scale', '1');
  await expect(stage).toHaveAttribute('data-rotation', '0');
});

test('closing and reopening resets transforms and restores focus', async ({ page }) => {
  const dialog = await open(page);
  await dialog.getByRole('button', { name: '放大' }).click();
  await dialog.getByRole('button', { name: '关闭预览' }).click();
  const trigger = page.getByRole('button', { name: /放大预览/ });
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.getByRole('dialog').locator('[data-image-stage]')).toHaveAttribute('data-scale', '1');
});

test('download action only reports the current item to the host', async ({ page }) => {
  const dialog = await open(page, 'download-action');
  await dialog.getByRole('button', { name: '下一张' }).click();
  await dialog.getByRole('button', { name: '下载当前图片' }).click();
  await expect(page.getByTestId('viewer-event')).toHaveText('请求下载 工作区布局');
});

test('viewer tools can be omitted without removing navigation', async ({ page }) => {
  const dialog = await open(page, 'tools-hidden');
  await expect(dialog.getByRole('toolbar', { name: '图像查看工具' })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: '下一张' })).toBeVisible();
});

test('Fullscreen API state is reflected and exited when the dialog closes', async ({ page }) => {
  await page.addInitScript(() => {
    let current: Element | null = null;
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => current });
    Element.prototype.requestFullscreen = async function () { current = this; document.dispatchEvent(new Event('fullscreenchange')); };
    document.exitFullscreen = async () => { current = null; document.dispatchEvent(new Event('fullscreenchange')); };
  });
  const dialog = await open(page);
  await dialog.getByRole('button', { name: '进入全屏' }).click();
  await expect(dialog.getByRole('button', { name: '退出全屏' })).toHaveAttribute('aria-pressed', 'true');
  await dialog.getByRole('button', { name: '关闭预览' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: viewer toolbar fits the dialog`, async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 680 });
  const dialog = await open(page, 'viewer-tools', `theme:${theme};density:${density}`);
  await expect(dialog.getByRole('toolbar', { name: '图像查看工具' })).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect((await page.evaluate(async () => (await (window as any).axe.run(document.body)).violations))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/image-gallery-viewer/${theme}-${density}.png`, fullPage: true });
});
