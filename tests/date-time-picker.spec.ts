import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-datetimepicker';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="date-time-picker"]').first()).toBeVisible({ timeout: 15_000 });
}

test('keeps a local date and time as one committed value', async ({ page }) => {
  await open(page, 'local-date-time');
  await page.getByLabel('时间分').fill('45');
  await page.getByLabel('时间分').press('Enter');
  await expect(page.locator('output')).toContainText('value=2026-09-07T17:45');
  await expect(page.locator('output')).toContainText('committed=2026-09-07T17:45');
});

test('waits for both parts before emitting an empty draft', async ({ page }) => {
  await open(page, 'empty');
  await page.getByLabel('日期年').fill('2026');
  await page.getByLabel('日期月').fill('09');
  await page.getByLabel('日期日').fill('08');
  await expect(page.locator('output')).toContainText('value=null');
  await page.getByLabel('时间时').fill('09');
  await page.getByLabel('时间分').fill('30');
  await page.getByLabel('时间分').press('Enter');
  await expect(page.locator('output')).toContainText('committed=2026-09-08T09:30');
});

test('applies the minimum time only on the minimum date', async ({ page }) => {
  await open(page, 'cross-day-range');
  await page.getByLabel('时间时').fill('15');
  await page.getByLabel('时间分').fill('30');
  await expect(page.getByRole('alert')).toContainText('16:00');
  await expect(page.locator('output')).toContainText('committed=2026-09-07T17:30');
  await page.getByLabel('日期日').fill('08');
  await page.getByLabel('日期日').press('Enter');
  await page.getByLabel('时间时').fill('09');
  await page.getByLabel('时间分').fill('30');
  await page.getByLabel('时间分').press('Enter');
  await expect(page.locator('output')).toContainText('committed=2026-09-08T09:30');
});

test('applies the maximum time on the maximum date', async ({ page }) => {
  await open(page, 'cross-day-range');
  await page.getByLabel('日期日').fill('08');
  await page.getByLabel('日期日').press('Enter');
  await page.getByLabel('时间时').fill('11');
  await page.getByLabel('时间分').fill('00');
  await expect(page.getByRole('alert')).toContainText('10:00');
});

test('supports second precision and stable serialization', async ({ page }) => {
  await open(page, 'with-seconds');
  await page.getByLabel('时间秒').fill('42');
  await page.getByLabel('时间秒').press('Enter');
  await expect(page.locator('output')).toContainText('committed=2026-09-07T17:30:42');
});

test('12-hour display changes the stored local hour through the period control', async ({ page }) => {
  await open(page, 'twelve-hour');
  const period = page.getByRole('button', { name: '切换上午下午' });
  await expect(period).toHaveText('PM');
  await period.click();
  await expect(page.locator('output')).toContainText('value=2026-09-07T05:30');
});

test('required empty state keeps both segmented fields present', async ({ page }) => {
  await open(page, 'required');
  await expect(page.getByLabel('日期年')).toHaveAttribute('required', '');
  await expect(page.getByLabel('时间时')).toHaveAttribute('required', '');
  await expect(page.locator('output')).toContainText('value=null');
});

test('disabled dates remain unavailable in the composed calendar', async ({ page }) => {
  await open(page, 'disabled-date');
  await page.getByRole('button', { name: '打开日历' }).click();
  const saturday = page.getByRole('button', { name: /^2026年9月12日/ });
  await expect(saturday).toBeDisabled();
});

test('native form submits committed text and ignores invalid drafts', async ({ page }) => {
  await open(page, 'native-form');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.locator('output')).toHaveText('form=2026-09-07T17:30');
  await page.getByLabel('时间时').fill('99');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.locator('output')).toHaveText('form=2026-09-07T17:30');
});

test('read-only and disabled states reach both composed inputs', async ({ page }) => {
  await open(page, 'read-only');
  await expect(page.getByLabel('日期年')).toHaveAttribute('readonly', '');
  await expect(page.getByLabel('时间时')).toHaveAttribute('readonly', '');
  await open(page, 'disabled');
  await expect(page.getByLabel('日期年')).toBeDisabled();
  await expect(page.getByLabel('时间时')).toBeDisabled();
});

test('Playground updates hour cycle and precision without changing stories', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="date-time-picker"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('combobox', { name: 'hourCycle' }).selectOption('12');
  await expect(frame.getByRole('button', { name: '切换上午下午' })).toBeVisible();
  await page.getByRole('combobox', { name: 'precision' }).selectOption('second');
  await expect(frame.getByLabel('时间秒')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: composition uses tokens, fits narrow screens and passes axe`, async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 760 });
  await open(page, 'cross-day-range', `theme:${theme};density:${density}`);
  const date = page.locator('[data-slot="input-date"]');
  const time = page.locator('[data-slot="input-time"]');
  const expectedHeight = density === 'compact' ? 32 : 40;
  expect(await date.evaluate(element => element.getBoundingClientRect().height)).toBe(expectedHeight);
  expect(await time.evaluate(element => element.getBoundingClientRect().height)).toBe(expectedHeight);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/date-time-picker/${theme}-${density}.png`, fullPage: true });
});
