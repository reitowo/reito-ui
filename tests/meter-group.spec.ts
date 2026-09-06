import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-metergroup';
async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot$="-group"]').first()).toBeVisible({ timeout: 15_000 });
}

test('meter exposes the summed value and named range', async ({ page }) => {
  await open(page, 'default');
  const meter = page.getByRole('meter', { name: '工作区存储构成' });
  await expect(meter).toHaveAttribute('aria-valuemin', '0');
  await expect(meter).toHaveAttribute('aria-valuenow', '72');
  await expect(meter).toHaveAttribute('aria-valuemax', '128');
  await expect(meter).toHaveAttribute('aria-valuetext', '72 / 128 GB');
  await expect(page.locator('[data-slot="meter-group-segment"]')).toHaveCount(3);
});

test('legend preserves readable labels, values and descriptions', async ({ page }) => {
  await open(page, 'long-labels');
  await expect(page.getByText('分钟行情与逐笔成交归档文件')).toBeVisible();
  await expect(page.getByText('最近 90 个交易日')).toBeVisible();
  await expect(page.getByText('48 GB')).toBeVisible();
});

test('zero values show a named empty state without visible segments', async ({ page }) => {
  await open(page, 'zero');
  await expect(page.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('[data-slot="meter-group-segment"]')).toHaveCount(0);
  await expect(page.locator('[data-slot="meter-group-empty"]')).toHaveText('本月尚未使用配额');
});

test('overflow keeps the exact value text while clamping aria-valuenow', async ({ page }) => {
  await open(page, 'overflow');
  const meter = page.getByRole('meter');
  await expect(meter).toHaveAttribute('aria-valuenow', '100');
  await expect(meter).toHaveAttribute('aria-valuetext', '¥114 / ¥100');
  await expect(meter).toHaveAttribute('data-overflow', 'true');
  await expect(page.locator('[data-slot="meter-group-overflow"]')).toHaveText(/超出预算 ¥14/);
});

test('negative and nonfinite segment values are normalized to zero', async ({ page }) => {
  await open(page, 'sanitized-values');
  await expect(page.getByRole('meter')).toHaveAttribute('aria-valuenow', '24');
  await expect(page.locator('[data-slot="meter-group-segment"]')).toHaveCount(1);
  await expect(page.getByText('0%', { exact: true })).toHaveCount(2);
});

test('legend placement and visibility are explicit', async ({ page }) => {
  await open(page, 'legend-first');
  const slots = await page.getByRole('meter').locator(':scope > *').evaluateAll(elements => elements.map(element => element.getAttribute('data-slot') ?? element.tagName.toLowerCase()));
  expect(slots.indexOf('meter-group-legend')).toBeLessThan(slots.indexOf('meter-group-track'));
  await open(page, 'without-legend');
  await expect(page.locator('[data-slot="meter-group-legend"]')).toHaveCount(0);
});

test('progress uses progressbar semantics distinct from measurements', async ({ page }) => {
  await open(page, 'progress');
  await expect(page.getByRole('progressbar', { name: '索引重建进度' })).toHaveAttribute('aria-valuenow', '72');
  await expect(page.getByRole('meter')).toHaveCount(0);
});

test('indeterminate progress omits aria-valuenow and announces busy state', async ({ page }) => {
  await open(page, 'indeterminate-progress');
  const progress = page.getByRole('progressbar');
  await expect(progress).not.toHaveAttribute('aria-valuenow');
  await expect(progress).toHaveAttribute('aria-valuetext', '进行中，进度未知');
  await expect(progress).toHaveAttribute('aria-busy', 'true');
});

test('Playground changes semantics and values without leaving the Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('meter')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('combobox', { name: 'kind' }).selectOption('progress');
  await expect(frame.getByRole('progressbar')).toBeVisible();
  await page.locator('[id="control-projects"]').fill('60');
  await page.locator('[id="control-projects"]').press('Enter');
  await expect(frame.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '90');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: compact segments fit narrow screens and pass axe`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 620 });
  await open(page, 'long-labels', `theme:${theme};density:${density}`);
  const track = page.locator('[data-slot="meter-group-track"]');
  expect(await track.evaluate(element => element.getBoundingClientRect().height)).toBe(8);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/meter-group/${theme}-${density}.png`, fullPage: true });
});

