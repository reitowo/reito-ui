import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-daterangepicker-日期范围';

async function open(page: Page, story: string, trigger: RegExp = /^日期范围：/, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const button = page.getByRole('button', { name: trigger });
  await expect(button).toBeVisible({ timeout: 15_000 });
  await button.click();
  await expect(page.locator('[data-slot="popover-content"]')).toBeVisible();
  return button;
}

test('default common presets are discoverable', async ({ page }) => {
  await open(page, 'preset-draft');
  const presets = page.locator('[data-slot="date-range-presets"]');
  await expect(presets).toBeVisible();
  for (const label of ['今天', '近 7 天', '近 30 天', '本月']) await expect(presets.getByRole('button', { name: label, exact: true })).toBeVisible();
});

test('preset changes draft and commits only after Apply', async ({ page }) => {
  await open(page, 'preset-draft');
  const output = page.getByTestId('preset-value');
  await expect(output).toHaveText('2026-09-01 / 2026-09-07');
  await page.getByRole('button', { name: '近 7 天', exact: true }).click();
  await expect(page.getByLabel('开始日期')).toHaveValue('2026-09-09');
  await expect(page.getByLabel('结束日期')).toHaveValue('2026-09-15');
  await expect(output).toHaveText('2026-09-01 / 2026-09-07');
  await page.getByRole('button', { name: '应用范围' }).click();
  await expect(output).toHaveText('2026-09-09 / 2026-09-15');
});

test('Cancel discards the selected preset draft', async ({ page }) => {
  const trigger = await open(page, 'preset-draft');
  await page.getByRole('button', { name: '本月', exact: true }).click();
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await trigger.click();
  await expect(page.getByLabel('开始日期')).toHaveValue('2026-09-01');
  await expect(page.getByLabel('结束日期')).toHaveValue('2026-09-07');
});

test('Escape discards input edits and returns focus to the trigger', async ({ page }) => {
  const trigger = await open(page, 'preset-draft');
  await page.getByLabel('开始日期').fill('2026-09-12');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.getByLabel('开始日期')).toHaveValue('2026-09-01');
});

test('bounds disable presets that would create an invalid range', async ({ page }) => {
  await open(page, 'preset-bounds');
  await expect(page.getByRole('button', { name: '今天', exact: true })).toBeEnabled();
  for (const label of ['近 7 天', '近 30 天', '本月']) {
    const preset = page.getByRole('button', { name: label, exact: true });
    await expect(preset).toBeDisabled();
    await expect(preset).toHaveAttribute('title', /(早于|晚于)允许范围/);
  }
});

test('locale and format callback update trigger and calendar language', async ({ page }) => {
  await open(page, 'english-locale', /^Reporting period：/);
  await expect(page.getByRole('grid', { name: 'September 2026' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Reporting period：Sep 1, 2026 — Sep 7, 2026$/ })).toBeVisible();
  await expect(page.locator('[data-slot="popover-content"] [lang="en-US"]')).toHaveCount(1);
});

test('presets can be removed or replaced by the host', async ({ page }) => {
  await open(page, 'without-presets');
  await expect(page.locator('[data-slot="date-range-presets"]')).toHaveCount(0);
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--custom-presets&viewMode=story`);
  await page.getByRole('button', { name: /^日期范围：/ }).click();
  await expect(page.getByRole('button', { name: '发布窗口', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '发布窗口', exact: true }).click();
  await expect(page.getByLabel('开始日期')).toHaveValue('2026-09-13');
  await expect(page.getByLabel('结束日期')).toHaveValue('2026-09-17');
});

test('Clear commits an empty controlled value', async ({ page }) => {
  await open(page, 'preset-draft');
  await page.getByRole('button', { name: '清除', exact: true }).click();
  await expect(page.getByTestId('preset-value')).toHaveText(' / ');
  await expect(page.getByRole('button', { name: /^日期范围：选择日期范围$/ })).toBeVisible();
});

test('Playground changes locale, format and presets without leaving the Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('button', { name: /^日期范围：/ })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('input[type="radio"][value="en-US"]').check();
  await page.locator('input[type="radio"][value="short"]').check();
  await expect(frame.getByRole('button', { name: /日期范围：.*Sep.*2026/ })).toBeVisible();
  await page.locator('[id="control-showPresets"]').evaluate((element: HTMLInputElement) => element.click());
  await frame.getByRole('button', { name: /^日期范围：/ }).click();
  await expect(frame.locator('[data-slot="date-range-presets"]')).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: preset popup passes axe and fits a narrow work surface`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 760 });
  await open(page, 'preset-draft', /^日期范围：/, `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/date-range-picker/${theme}-${density}.png`, fullPage: true });
});
