import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-inputdate';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="input-date"]').first()).toBeVisible({ timeout: 15_000 });
}

test('locale derives YMD, MDY and DMY segment orders', async ({ page }) => {
  await open(page, 'localized-order');
  const groups = page.locator('[data-slot="input-date"]');
  await expect(groups).toHaveCount(3);
  await expect(groups.nth(0).locator('[data-segment]').first()).toHaveAttribute('data-segment', 'year');
  await expect(groups.nth(1).locator('[data-segment]').first()).toHaveAttribute('data-segment', 'month');
  await expect(groups.nth(2).locator('[data-segment]').first()).toHaveAttribute('data-segment', 'day');
});

test('invalid calendar dates stay as drafts and Escape restores committed parts', async ({ page }) => {
  await open(page, 'invalid-draft');
  await page.getByLabel('交付日期月').fill('02');
  await page.getByLabel('交付日期日').fill('30');
  await expect(page.getByRole('alert')).toHaveText('请输入有效日期。');
  await page.getByLabel('交付日期日').press('Escape');
  await expect(page.getByLabel('交付日期月')).toHaveValue('09');
  await expect(page.getByLabel('交付日期日')).toHaveValue('07');
});

test('leap day commits as a valid local date', async ({ page }) => {
  await open(page, 'empty');
  await page.getByLabel('交付日期年').fill('2028');
  await page.getByLabel('交付日期月').fill('02');
  await page.getByLabel('交付日期日').fill('29');
  await page.getByLabel('交付日期日').press('Enter');
  await expect(page.locator('output')).toContainText('value=2028-02-29');
  await expect(page.locator('output')).toContainText('committed=2028-02-29');
});

test('out-of-range and disabled dates expose distinct validation errors', async ({ page }) => {
  await open(page, 'range');
  await page.getByLabel('交付日期月').fill('10');
  await page.getByLabel('交付日期日').fill('01');
  await expect(page.getByRole('alert')).toContainText('2026-09-01 至 2026-09-30');
  await open(page, 'disabled-dates');
  await page.getByLabel('交付日期日').fill('12');
  await expect(page.getByRole('alert')).toHaveText('该日期不可选择。');
});

test('arrow keys adjust a segment, preserve a valid date and commit', async ({ page }) => {
  await open(page, 'keyboard-segments');
  const month = page.getByLabel('交付日期月');
  await month.focus();
  await month.press('ArrowUp');
  await expect(page.locator('output')).toContainText('value=2026-10-07');
  await expect(page.locator('output')).toContainText('committed=2026-10-07');
  await month.press('Home');
  await expect(page.getByLabel('交付日期年')).toBeFocused();
  await page.getByLabel('交付日期年').press('End');
  await expect(page.getByLabel('交付日期日')).toBeFocused();
});

test('calendar selection updates and commits the segmented date', async ({ page }) => {
  await open(page, 'calendar-sync');
  const eighth = page.locator('button[data-day]').filter({ hasText: /^8$/ }).first();
  await expect(eighth).toBeVisible();
  await eighth.click();
  await expect(page.locator('output')).toContainText('value=2026-09-08');
  await expect(page.getByLabel('交付日期日')).toHaveValue('08');
});

test('clear emits null and leaves focus in the first locale segment', async ({ page }) => {
  await open(page, 'clearable');
  await page.getByRole('button', { name: '清除日期' }).click();
  await expect(page.locator('output')).toContainText('value=null');
  await expect(page.getByLabel('交付日期年')).toBeFocused();
});

test('Escape closes the calendar and restores focus to its trigger', async ({ page }) => {
  await open(page, 'controlled-commit');
  const trigger = page.getByRole('button', { name: '打开日历' });
  await trigger.click();
  await expect(page.getByRole('grid')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('grid')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('native form submits a stable local YYYY-MM-DD string', async ({ page }) => {
  await open(page, 'native-form');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.locator('output')).toHaveText('form=2026-09-07');
  await page.getByLabel('交付日期月').fill('02');
  await page.getByLabel('交付日期日').fill('30');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.locator('output')).toHaveText('form=2026-09-07');
});

test('read-only preserves values without actions while disabled locks segments', async ({ page }) => {
  await open(page, 'read-only');
  await expect(page.getByLabel('交付日期年')).toHaveAttribute('readonly', '');
  await expect(page.getByRole('button')).toHaveCount(0);
  await open(page, 'disabled');
  await expect(page.getByLabel('交付日期年')).toBeDisabled();
  await expect(page.getByRole('button', { name: '打开日历' })).toBeDisabled();
});

test('Playground locale, order and calendar props update in one Storybook page', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="input-date"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('combobox', { name: 'localeCode' }).selectOption('en-US');
  await expect(frame.locator('[data-segment]').first()).toHaveAttribute('data-segment', 'month');
  await page.getByRole('combobox', { name: 'order' }).selectOption('dmy');
  await expect(frame.locator('[data-segment]').first()).toHaveAttribute('data-segment', 'day');
  await page.getByRole('switch', { name: 'calendarOpen' }).press('Space');
  await expect(frame.getByRole('grid')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: field and popup inherit tokens, fit narrow screens and pass axe`, async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 720 });
  await open(page, 'controlled-commit', `theme:${theme};density:${density}`);
  const group = page.locator('[data-slot="input-date"]');
  expect(await group.evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 32 : 40);
  await page.getByRole('button', { name: '打开日历' }).click();
  await expect(page.getByRole('grid')).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/input-date/${theme}-${density}.png`, fullPage: true });
});
