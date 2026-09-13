import { storybookUrl, chooseSelectOption } from './select-option';
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-inputtime';
async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`${storybookUrl}/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="input-time"]').first()).toBeVisible({ timeout: 15_000 });
}

test('24-hour segments accept and commit a valid time', async ({ page }) => {
  await open(page, 'twenty-four-hour');
  await page.getByLabel('提醒时间时').fill('17');
  await page.getByLabel('提醒时间分').fill('45');
  await page.getByLabel('提醒时间分').press('Enter');
  await expect(page.locator('output')).toContainText('value=17:45');
  await expect(page.locator('output')).toContainText('committed=17:45');
});

test('12-hour display maps period changes back to a 24-hour value', async ({ page }) => {
  await open(page, 'twelve-hour');
  await expect(page.getByLabel('提醒时间时')).toHaveValue('03');
  const period = page.getByRole('button', { name: '切换上午下午' });
  await expect(period).toHaveText('PM');
  await period.click();
  await expect(period).toHaveText('AM');
  await expect(page.locator('output')).toContainText('value=03:30');
});

test('second precision retains and commits seconds', async ({ page }) => {
  await open(page, 'with-seconds');
  await page.getByLabel('提醒时间秒').fill('42');
  await page.getByLabel('提醒时间秒').press('Enter');
  await expect(page.locator('output')).toContainText('committed=09:30:42');
});

test('invalid and off-step drafts show an error and Escape restores', async ({ page }) => {
  await open(page, 'invalid-draft');
  await page.getByLabel('提醒时间分').fill('31');
  await expect(page.getByRole('alert')).toContainText('5 分钟');
  await page.getByLabel('提醒时间分').press('Escape');
  await expect(page.getByLabel('提醒时间分')).toHaveValue('30');
});

test('range validation does not commit an out-of-range time', async ({ page }) => {
  await open(page, 'range');
  await page.getByLabel('提醒时间时').fill('07');
  await page.getByLabel('提醒时间分').fill('30');
  await expect(page.getByRole('alert')).toContainText('08:30 至 18:00');
  await expect(page.locator('output')).toContainText('committed=09:30');
});

test('arrow keys use configured steps and Home/End move focus', async ({ page }) => {
  await open(page, 'keyboard-segments');
  const minute = page.getByLabel('提醒时间分');
  await minute.focus();
  await minute.press('ArrowUp');
  await expect(page.locator('output')).toContainText('value=09:35');
  await minute.press('Home');
  await expect(page.getByLabel('提醒时间时')).toBeFocused();
  await page.getByLabel('提醒时间时').press('End');
  await expect(page.getByLabel('提醒时间分')).toBeFocused();
});

test('hour adjustment wraps at midnight without inventing a date', async ({ page }) => {
  await open(page, 'twenty-four-hour');
  const hour = page.getByLabel('提醒时间时');
  await hour.fill('23');
  await hour.press('ArrowUp');
  await expect(page.locator('output')).toContainText('value=00:30');
});

test('clear emits null and restores focus to the hour segment', async ({ page }) => {
  await open(page, 'clearable');
  await page.getByRole('button', { name: '清除时间' }).click();
  await expect(page.locator('output')).toContainText('value=null');
  await expect(page.getByLabel('提醒时间时')).toBeFocused();
});

test('native form emits stable time text and ignores invalid drafts', async ({ page }) => {
  await open(page, 'native-form');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.locator('output')).toHaveText('form=09:30:15');
  await page.getByLabel('提醒时间秒').fill('99');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.locator('output')).toHaveText('form=09:30:15');
});

test('read-only keeps the time legible while disabled locks segments', async ({ page }) => {
  await open(page, 'read-only');
  await expect(page.getByLabel('提醒时间时')).toHaveAttribute('readonly', '');
  await expect(page.getByRole('button', { name: '打开时间选择器' })).toBeDisabled();
  await open(page, 'disabled');
  await expect(page.getByLabel('提醒时间时')).toBeDisabled();
});

test('Playground hour cycle and precision update in the same Storybook page', async ({ page }) => {
  await page.goto(`${storybookUrl}/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="input-time"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('combobox', { name: 'hourCycle' }).selectOption('12');
  await expect(frame.getByRole('button', { name: '切换上午下午' })).toBeVisible();
  await page.getByRole('combobox', { name: 'precision' }).selectOption('second');
  await expect(frame.getByLabel('提醒时间秒')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: field inherits tokens, fits narrow screens and passes axe`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 520 });
  await open(page, 'stepped', `theme:${theme};density:${density}`);
  const group = page.locator('[data-slot="input-time"]');
  expect(await group.evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 32 : 40);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  // Storybook's a11y addon can still own axe while its initial scan finishes.
  await expect(async () => {
    expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  }).toPass({ timeout: 5_000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/input-time/${theme}-${density}.png`, fullPage: true });
});


test('picker drafts can cancel and confirming commits the selected time', async ({ page }) => {
  await open(page, 'twenty-four-hour');
  const trigger = page.getByRole('button', { name: '打开时间选择器' });
  await trigger.click();
  const picker = page.getByRole('dialog', { name: '提醒时间选择器' });
  await chooseSelectOption(picker.getByRole('combobox', { name: '选择时' }), '17');
  await expect(picker.getByRole('combobox', { name: '选择分' })).toHaveText('30');
  await chooseSelectOption(picker.getByRole('combobox', { name: '选择分' }), '45');
  await expect(page.locator('output')).toContainText('value=09:30');
  await picker.getByRole('button', { name: '取消', exact: true }).click();
  await expect(trigger).toBeFocused();
  await expect(page.locator('output')).toContainText('value=09:30');
  await trigger.click();
  await chooseSelectOption(picker.getByRole('combobox', { name: '选择时' }), '17');
  await chooseSelectOption(picker.getByRole('combobox', { name: '选择分' }), '45');
  await picker.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('output')).toContainText('committed=17:45');
  await expect(trigger).toBeFocused();
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`picker respects range and minute steps (${theme}/${density})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await open(page, 'playground', `theme:${theme};density:${density}`);
    await page.getByRole('button', { name: '打开时间选择器' }).click();
    const picker = page.getByRole('dialog', { name: '提醒时间选择器' });
    await chooseSelectOption(picker.getByRole('combobox', { name: '选择时' }), '18');
    await expect(picker.getByRole('combobox', { name: '选择分' })).toHaveText('00');
    await picker.getByRole('combobox', { name: '选择分' }).click();
    await expect(page.getByRole('option')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(picker).toBeVisible();
    await expect(page.getByRole('listbox')).toBeHidden();
    await picker.screenshot({ path: `.logs/feedback-time-${theme}-${density}.png` });
    await picker.getByRole('button', { name: '确定', exact: true }).click();
    await expect(page.locator('output')).toContainText('value=18:00');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('picker supports seconds, 12-hour labels and a range with no valid step', async ({ page }) => {
  await open(page, 'stepped');
  await page.getByRole('button', { name: '打开时间选择器' }).click();
  await chooseSelectOption(page.getByRole('combobox', { name: '选择秒' }), '50');
  await page.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('output')).toContainText('committed=09:30:50');
  await open(page, 'twelve-hour');
  await page.getByRole('button', { name: '打开时间选择器' }).click();
  await chooseSelectOption(page.getByRole('combobox', { name: '选择时' }), '上午 12');
  await page.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('output')).toContainText('committed=00:30');
  await open(page, 'no-available-time');
  await page.getByRole('button', { name: '打开时间选择器' }).click();
  await expect(page.getByText('当前范围与步进下没有可选时间')).toBeVisible();
  await expect(page.getByRole('button', { name: '确定', exact: true })).toBeDisabled();
});
