import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-imagecompare-图像对比';

async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const slider = page.getByRole('slider', { name: '图像前后对比' });
  await expect(slider).toBeVisible({ timeout: 15_000 });
  return { slider, stage: page.getByRole('group', { name: '图像前后对比' }) };
}

test('default comparison exposes native range semantics and source text', async ({ page }) => {
  const { slider, stage } = await open(page);
  await expect(slider).toHaveAttribute('min', '0');
  await expect(slider).toHaveAttribute('max', '100');
  await expect(slider).toHaveValue('48');
  await expect(slider).toHaveAttribute('aria-valuetext', '调整前 48%，调整后 52%');
  await expect(stage.getByRole('img', { name: '调整前的山形工作区' })).toBeAttached();
  await expect(stage.getByRole('img', { name: '调整后的面板工作区' })).toBeAttached();
});

test('range keyboard supports arrows, Home and End', async ({ page }) => {
  const { slider } = await open(page, 'overview');
  await slider.focus();
  await page.keyboard.press('Home');
  await expect(slider).toHaveValue('0');
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('1');
  await page.keyboard.press('ArrowUp');
  await expect(slider).toHaveValue('2');
  await page.keyboard.press('End');
  await expect(slider).toHaveValue('100');
});

test('PageUp and PageDown make larger range changes', async ({ page }) => {
  const { slider } = await open(page, 'controlled');
  await slider.focus();
  await page.keyboard.press('PageUp');
  await expect(slider).toHaveValue('45');
  await page.keyboard.press('PageDown');
  await expect(slider).toHaveValue('35');
});

test('horizontal pointer position updates the controlled value', async ({ page }) => {
  const { slider, stage } = await open(page, 'controlled');
  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width * 0.75, box!.y + box!.height / 2);
  await expect(slider).toHaveValue('75');
  await expect(page.getByTestId('compare-event')).toHaveText('对比比例：75%');
});

test('vertical pointer position follows the y axis', async ({ page }) => {
  const { slider, stage } = await open(page, 'vertical');
  await expect(stage.getByRole('img').first()).toHaveCSS('opacity', '1');
  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height * 0.25);
  await expect(slider).toHaveValue('25');
  await expect(slider).toHaveAttribute('aria-valuetext', '调整前 25%，调整后 75%');
});

test('pointer drag continuously updates the split', async ({ page }) => {
  const { slider, stage } = await open(page, 'controlled');
  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.8, box!.y + box!.height / 2);
  await page.mouse.up();
  await expect(slider).toHaveValue('80');
});

test('fine step is preserved by native keyboard input', async ({ page }) => {
  const { slider } = await open(page, 'fine-step');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('50.5');
});

test('before and after labels stay available in both orientations', async ({ page }) => {
  let opened = await open(page, 'default');
  await expect(opened.stage.getByText('调整前', { exact: true })).toBeVisible();
  await expect(opened.stage.getByText('调整后', { exact: true })).toBeVisible();
  opened = await open(page, 'vertical');
  await expect(opened.stage.getByText('调整前', { exact: true })).toBeVisible();
  await expect(opened.stage.getByText('调整后', { exact: true })).toBeVisible();
});

test('loading state identifies the pending side', async ({ page }) => {
  await open(page, 'loading-before');
  await expect(page.getByText('正在加载对比前图像')).toBeVisible();
  await open(page, 'loading-after');
  await expect(page.getByText('正在加载对比后图像')).toBeVisible();
});

test('retry callback identifies each failed source', async ({ page }) => {
  let opened = await open(page, 'error-before');
  await expect(page.getByRole('alert')).toHaveText('调整前图像解码失败');
  await page.getByRole('button', { name: '重试调整前图像' }).click();
  await expect(page.getByTestId('retry-event')).toHaveText('请求重试：调整前');
  opened = await open(page, 'error-after');
  await expect(page.getByRole('alert')).toHaveText('调整后图像解码失败');
  await page.getByRole('button', { name: '重试调整后图像' }).click();
  await expect(page.getByTestId('retry-event')).toHaveText('请求重试：调整后');
});

test('disabled comparison blocks range and pointer changes', async ({ page }) => {
  const { slider, stage } = await open(page, 'disabled');
  await expect(slider).toBeDisabled();
  await expect(stage).toHaveAttribute('aria-disabled', 'true');
  const box = await stage.boundingBox();
  await page.mouse.click(box!.x + box!.width * 0.8, box!.y + box!.height / 2);
  await expect(slider).toHaveValue('50');
});

test('aspect ratio remains stable when the container width changes', async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 600 });
  const { stage } = await open(page);
  let box = await stage.boundingBox();
  expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);
  await page.setViewportSize({ width: 420, height: 600 });
  box = await stage.boundingBox();
  expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: image comparison remains accessible in a narrow work surface`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 480 });
  const { slider } = await open(page, 'narrow', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect((await page.evaluate(async () => (await (window as any).axe.run(document.body)).violations))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/image-compare/${theme}-${density}.png`, fullPage: true });
  await expect(slider).toHaveValue('50');
});
