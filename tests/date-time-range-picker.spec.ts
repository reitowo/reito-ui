import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-datetimerangepicker-日期时间范围';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="date-time-range-picker"]')).toBeVisible({ timeout: 15_000 });
}

test('serializes a cross-day range in stable key order', async ({ page }) => {
  await open(page, 'cross-day');
  await expect(page.getByTestId('range-value')).toContainText('value={"start":"2026-09-07T17:30","end":"2026-09-08T09:30"}');
});

test('rejects an inverted range and keeps it visible for correction', async ({ page }) => {
  await open(page, 'inverted');
  await expect(page.getByRole('alert')).toHaveText('结束时间不能早于开始时间');
  await expect(page.getByTestId('range-value')).toContainText('value=invalid');
  await expect(page.getByTestId('range-value')).toContainText('committed=none');
});

test('validates lower and upper datetime bounds on their boundary days', async ({ page }) => {
  await open(page, 'cross-day');
  await page.getByLabel('开始时间时').fill('15');
  await expect(page.getByText(/16:00 至 不限/)).toBeVisible();
  await page.getByLabel('结束时间时').fill('11');
  await expect(page.getByText(/不限 至 10:00/)).toBeVisible();
});

test('commits a corrected range after endpoint editing', async ({ page }) => {
  await open(page, 'inverted');
  await page.getByLabel('结束日期日').fill('08');
  await page.getByLabel('结束日期日').press('Enter');
  await expect(page.getByTestId('range-value')).toContainText('value={"start":"2026-09-08T09:30","end":"2026-09-08T17:30"}');
  await expect(page.getByTestId('range-value')).toContainText('committed={"start":"2026-09-08T09:30","end":"2026-09-08T17:30"}');
});

test('preserves second precision in both endpoints', async ({ page }) => {
  await open(page, 'with-seconds');
  await expect(page.getByTestId('range-value')).toContainText('{"start":"2026-09-07T17:30:15","end":"2026-09-07T17:31:45"}');
  await expect(page.getByLabel('开始时间秒')).toHaveValue('15');
  await expect(page.getByLabel('结束时间秒')).toHaveValue('45');
});

test('submits IANA time zone as metadata without adding an offset', async ({ page }) => {
  await open(page, 'native-form');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.getByTestId('form-value')).toHaveText('form={"start":"2026-09-07T17:30:00","end":"2026-09-08T09:30:00","timeZone":"Asia/Shanghai"}');
});

test('invalid time zone prevents serialization', async ({ page }) => {
  await open(page, 'invalid-time-zone');
  await expect(page.getByRole('alert')).toHaveText('时区标识无效');
  await expect(page.getByTestId('range-value')).toContainText('value=invalid');
});

test('partial range reports its missing endpoint', async ({ page }) => {
  await open(page, 'partial');
  await expect(page.getByRole('alert')).toHaveText('请选择结束时间');
});

test('12-hour, read-only, disabled and required states reach both endpoints', async ({ page }) => {
  await open(page, 'twelve-hour');
  await expect(page.getByRole('button', { name: '切换上午下午' })).toHaveCount(2);
  await open(page, 'read-only');
  await expect(page.getByLabel('开始日期年')).toHaveAttribute('readonly', '');
  await expect(page.getByLabel('结束时间时')).toHaveAttribute('readonly', '');
  await open(page, 'disabled');
  await expect(page.getByLabel('开始日期年')).toBeDisabled();
  await expect(page.getByLabel('结束时间时')).toBeDisabled();
  await open(page, 'required');
  await expect(page.getByLabel('开始日期年')).toHaveAttribute('required', '');
  await expect(page.getByLabel('结束时间时')).toHaveAttribute('required', '');
});

test('Playground changes precision and zone without switching Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="date-time-range-picker"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('combobox', { name: 'precision' }).selectOption('second');
  await expect(frame.getByLabel('开始时间秒')).toBeVisible();
  await page.locator('#control-timeZone').fill('UTC');
  await expect(frame.locator('[data-slot="date-time-range-time-zone"]')).toContainText('UTC');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: range fits a narrow work surface and passes axe`, async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 900 });
  await open(page, 'time-zone-metadata', `theme:${theme};density:${density}`);
  const expectedHeight = density === 'compact' ? 32 : 40;
  for (const slot of ['input-date', 'input-time']) {
    const heights = await page.locator(`[data-slot="${slot}"]`).evaluateAll(elements => elements.map(element => element.getBoundingClientRect().height));
    expect(heights).toEqual([expectedHeight, expectedHeight]);
  }
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/date-time-range-picker/${theme}-${density}.png`, fullPage: true });
});
