import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-carousel-轮播';

async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const carousel = page.getByRole('region', { name: '本地任务流程' });
  await expect(carousel).toBeVisible({ timeout: 15_000 });
  return carousel;
}

test('previous and next controls update the active page and boundaries', async ({ page }) => {
  const carousel = await open(page);
  const status = carousel.getByRole('status');
  await expect(status).toHaveText('1 / 4');
  await expect(carousel.getByRole('button', { name: '上一页' })).toBeDisabled();
  await carousel.getByRole('button', { name: '下一页' }).click();
  await expect(status).toHaveText('2 / 4');
  await carousel.getByRole('button', { name: '转到第 4 页' }).click();
  await expect(carousel.getByRole('button', { name: '下一页' })).toBeDisabled();
});

test('indicator keyboard navigation uses roving focus', async ({ page }) => {
  const carousel = await open(page);
  const first = carousel.getByRole('button', { name: '转到第 1 页' });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(carousel.getByRole('button', { name: '转到第 2 页' })).toBeFocused();
  await page.keyboard.press('End');
  await expect(carousel.getByRole('button', { name: '转到第 4 页' })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(first).toBeFocused();
});

test('carousel region supports direct arrow, Home and End navigation', async ({ page }) => {
  const carousel = await open(page);
  await carousel.focus();
  await page.keyboard.press('End');
  await expect(carousel.getByRole('status')).toHaveText('4 / 4');
  await page.keyboard.press('ArrowLeft');
  await expect(carousel.getByRole('status')).toHaveText('3 / 4');
  await page.keyboard.press('Home');
  await expect(carousel.getByRole('status')).toHaveText('1 / 4');
});

test('controlled story reports the selected item', async ({ page }) => {
  const carousel = await open(page, 'controlled');
  await expect(page.getByTestId('carousel-event')).toHaveText('活动项：运行任务');
  await carousel.getByRole('button', { name: '下一页' }).click();
  await expect(page.getByTestId('carousel-event')).toHaveText('活动项：预览产物');
});

test('multiple visible items form stable pages', async ({ page }) => {
  const carousel = await open(page, 'multiple-visible');
  const slides = carousel.locator('[aria-roledescription="slide"]');
  await expect(slides.filter({ has: page.getByText('检查变更') })).toHaveAttribute('aria-hidden', 'false');
  await expect(slides.filter({ has: page.getByText('运行任务') })).toHaveAttribute('aria-hidden', 'false');
  await carousel.getByRole('button', { name: '下一页' }).click();
  await expect(carousel.getByRole('status')).toHaveText('2 / 2');
  await expect(slides.filter({ has: page.getByText('预览产物') })).toHaveAttribute('aria-hidden', 'false');
  await expect(slides.filter({ has: page.getByText('交付结果') })).toHaveAttribute('aria-hidden', 'false');
});

test('pointer drag advances one page', async ({ page }) => {
  const carousel = await open(page);
  const viewport = carousel.locator('[aria-live]');
  const box = await viewport.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * 0.75, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.25, box!.y + box!.height / 2);
  await page.mouse.up();
  await expect(carousel.getByRole('status')).toHaveText('2 / 4');
});

test('looping wraps in both directions', async ({ page }) => {
  const carousel = await open(page, 'looping');
  await carousel.getByRole('button', { name: '上一页' }).click();
  await expect(carousel.getByRole('status')).toHaveText('4 / 4');
  await carousel.getByRole('button', { name: '下一页' }).click();
  await expect(carousel.getByRole('status')).toHaveText('1 / 4');
});

test('autoplay advances and exposes an explicit pause control', async ({ page }) => {
  await page.mouse.move(0, 0);
  const carousel = await open(page, 'autoplay');
  const status = carousel.getByRole('status');
  await expect(status).not.toHaveText('1 / 4', { timeout: 2_000 });
  await carousel.getByRole('button', { name: '暂停自动播放' }).click();
  const pausedAt = await status.textContent();
  await page.mouse.move(0, 0);
  await page.locator('body').focus();
  await page.waitForTimeout(1_000);
  await expect(status).toHaveText(pausedAt!);
  await expect(carousel.getByRole('button', { name: '继续自动播放' })).toHaveAttribute('aria-pressed', 'true');
});

test('focus within the carousel temporarily suspends autoplay', async ({ page }) => {
  await page.mouse.move(0, 0);
  const carousel = await open(page, 'autoplay');
  await carousel.focus();
  const pausedAt = await carousel.getByRole('status').textContent();
  await page.waitForTimeout(1_000);
  await expect(carousel.getByRole('status')).toHaveText(pausedAt!);
  await expect(carousel.locator('[aria-live]')).toHaveAttribute('aria-live', 'polite');
});

test('resize keeps the active slide aligned to the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 560 });
  const carousel = await open(page);
  await carousel.getByRole('button', { name: '下一页' }).click();
  await page.setViewportSize({ width: 440, height: 560 });
  const viewport = carousel.locator('[aria-live]');
  await expect.poll(() => viewport.evaluate(element => Math.abs(element.scrollLeft - (element.firstElementChild?.children[1] as HTMLElement).offsetLeft))).toBeLessThan(2);
  await expect(carousel.getByRole('status')).toHaveText('2 / 4');
});

test('interactive elements in inactive slides stay outside the tab order', async ({ page }) => {
  const carousel = await open(page, 'interactive-content');
  await carousel.focus();
  await page.keyboard.press('Tab');
  await expect(carousel.getByRole('button', { name: '查看 检查变更' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(carousel.getByRole('button', { name: '下一页' })).toBeFocused();
});

test('single, empty and disabled states remove unavailable interaction', async ({ page }) => {
  let carousel = await open(page, 'single');
  await expect(carousel.getByRole('button', { name: '上一页' })).toBeDisabled();
  await expect(carousel.getByRole('button', { name: '下一页' })).toBeDisabled();
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--empty&viewMode=story`);
  await expect(page.getByRole('region', { name: '本地任务流程' })).toHaveText('当前没有轮播内容');
  carousel = await open(page, 'disabled');
  await expect(carousel).toHaveAttribute('aria-disabled', 'true');
  await expect(carousel.getByRole('button', { name: '下一页' })).toBeDisabled();
  await expect(carousel.getByRole('button', { name: '转到第 2 页' })).toBeDisabled();
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: carousel stays accessible in a narrow work surface`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 520 });
  const carousel = await open(page, 'narrow', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect((await page.evaluate(async () => (await (window as any).axe.run(document.body)).violations))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/carousel/${theme}-${density}.png`, fullPage: true });
  await expect(carousel.getByRole('status')).toHaveText('1 / 4');
});
