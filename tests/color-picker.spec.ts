import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-colorpicker';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.getByRole('textbox').first()).toBeVisible();
}

test('text input commits valid values, rejects invalid drafts and Escape restores the last color', async ({ page }) => {
  await open(page, 'invalid-draft');
  const input = page.getByRole('textbox', { name: '界面强调色' });
  await input.fill('rgb(41, 163, 106)');
  await input.press('Enter');
  await expect(input).toHaveValue('#29A36A');
  await expect(page.locator('output')).toContainText('committed=#29A36A');
  await input.fill('rgb(999, 0, 0)');
  await input.press('Enter');
  await expect(page.getByRole('alert')).toHaveText('请输入有效的 HEX、RGB 或 HSL 颜色。');
  await input.press('Escape');
  await expect(input).toHaveValue('#29A36A');
});

test('format variants convert one color to HEX, RGB and HSL', async ({ page }) => {
  await open(page, 'formats');
  await expect(page.getByRole('textbox', { name: 'HEX' })).toHaveValue('#4F7DFF');
  await expect(page.getByRole('textbox', { name: 'RGB' })).toHaveValue('rgb(79, 125, 255)');
  await expect(page.getByRole('textbox', { name: 'HSL' })).toHaveValue('hsl(224, 100%, 65%)');
});

test('popup preset commits and Escape restores focus to the trigger', async ({ page }) => {
  await open(page, 'popup');
  const trigger = page.getByRole('button', { name: '打开颜色选择器' });
  await trigger.click();
  await expect(page.getByRole('slider', { name: '色相' })).toBeVisible();
  await page.getByRole('button', { name: '选择颜色 #29A36A' }).click();
  await expect(page.locator('output')).toContainText('committed=#29A36A');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('slider', { name: '色相' })).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('two-axis area exposes values and arrow keys commit saturation and brightness', async ({ page }) => {
  await open(page, 'keyboard-area');
  const area = page.getByRole('slider', { name: '饱和度与亮度' });
  const before = await page.locator('output').textContent();
  await area.focus();
  await area.press('ArrowLeft');
  await area.press('ArrowUp');
  await expect(page.locator('output')).not.toHaveText(before ?? '');
  await expect(area).toHaveAttribute('aria-valuetext', /饱和度 .*亮度/);
});

test('RGB channel input is bounded and commits the canonical value', async ({ page }) => {
  await open(page, 'inline');
  const red = page.getByLabel('R');
  await red.fill('0');
  await red.press('Enter');
  await expect(page.locator('output')).toContainText('committed=#007DFF');
  await expect(red).toHaveAttribute('min', '0');
  await expect(red).toHaveAttribute('max', '255');
});

test('alpha slider and channel retain zero and full transparency boundaries', async ({ page }) => {
  await open(page, 'alpha');
  const alpha = page.getByLabel('A %');
  await alpha.fill('0');
  await alpha.press('Enter');
  await expect(page.locator('output')).toContainText('committed=#4F7DFF00');
  await alpha.fill('100');
  await alpha.press('Enter');
  await expect(page.locator('output')).toContainText('committed=#4F7DFFFF');
});

test('native form submits the committed color string', async ({ page }) => {
  await open(page, 'native-form');
  const input = page.getByRole('textbox', { name: '界面强调色' });
  await input.fill('hsl(152, 60%, 40%)');
  await input.press('Enter');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.locator('output')).toHaveText('form=#29A36A');
});

test('read-only keeps copyable text and disables the picker while disabled locks both', async ({ page }) => {
  await open(page, 'read-only');
  await expect(page.getByRole('textbox', { name: '锁定颜色' })).toHaveAttribute('readonly', '');
  await expect(page.getByRole('button', { name: '打开颜色选择器' })).toHaveCount(0);
  await open(page, 'disabled');
  await expect(page.getByRole('textbox', { name: '不可用颜色' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '打开颜色选择器' })).toBeDisabled();
});

test('Playground format and inline props update inside one Storybook page', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('textbox', { name: '界面强调色' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('combobox', { name: 'format' }).selectOption('rgb');
  await expect(frame.getByRole('textbox', { name: '界面强调色' })).toHaveValue('rgba(79, 125, 255, 1)');
  await page.getByRole('switch', { name: 'inline' }).press('Space');
  await expect(frame.getByRole('slider', { name: '饱和度与亮度' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: popup inherits theme, stays compact and passes axe`, async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 720 });
  await open(page, 'popup', `theme:${theme};density:${density}`);
  const input = page.getByRole('textbox', { name: '界面强调色' });
  expect(await input.evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 32 : 40);
  await page.getByRole('button', { name: '打开颜色选择器' }).click();
  await expect(page.locator('[data-slot="color-picker-panel"]')).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/color-picker/${theme}-${density}.png`, fullPage: true });
});
