import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-inputmask';
async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="input-mask"]').first()).toBeVisible({ timeout: 15_000 });
}

test('formats raw phone input and reports raw/display separately', async ({ page }) => {
  await open(page, 'empty');
  const input = page.getByLabel('格式值');
  await input.fill('02155551234');
  await expect(input).toHaveValue('021-5555-1234');
  await expect(page.locator('output')).toContainText('raw=02155551234');
  await expect(page.locator('output')).toContainText('complete=true');
});

test('formatted clipboard text is parsed through the input event path', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, 'paste-formatted');
  const input = page.getByLabel('格式值');
  await input.focus();
  await page.evaluate(() => navigator.clipboard.writeText('021-5555-1234'));
  await page.keyboard.press('Control+V');
  await expect(input).toHaveValue('021-5555-1234');
  await expect(page.locator('output')).toContainText('raw=02155551234');
});

test('optional extension does not affect required completion', async ({ page }) => {
  await open(page, 'optional-extension');
  await expect(page.getByLabel('格式值')).toHaveValue('021-5555-1234 x8001');
  await expect(page.locator('output')).toContainText('complete=true');
});

test('alphabetic, alphanumeric and custom definitions filter input', async ({ page }) => {
  await open(page, 'serial');
  const serial = page.getByLabel('格式值');
  await serial.fill('ABx1234Z9');
  await expect(serial).toHaveValue('AB-1234-Z9');
  await open(page, 'custom-definition');
  const custom = page.getByLabel('格式值');
  await custom.fill('xxRUI042');
  await expect(custom).toHaveValue('RUI-042');
});

test('Backspace at a formatting literal removes the preceding raw character', async ({ page }) => {
  await open(page, 'delete-across-literal');
  const input = page.getByLabel('格式值');
  await input.focus();
  await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(4, 4));
  await input.press('Backspace');
  await expect(page.locator('output')).toContainText('raw=0255551234');
  await expect(input).toHaveValue('025-5551-234');
});

test('allow keeps an incomplete raw value and exposes an associated error', async ({ page }) => {
  await open(page, 'incomplete-allow');
  const input = page.getByLabel('格式值');
  await input.focus();
  await input.blur();
  await expect(page.locator('output')).toContainText('committed=021');
  await expect(page.getByRole('alert')).toHaveText('输入尚未完整。');
  expect(await input.getAttribute('aria-describedby')).toContain(await page.getByRole('alert').getAttribute('id'));
});

test('clear removes an incomplete value on blur', async ({ page }) => {
  await open(page, 'incomplete-clear');
  const input = page.getByLabel('格式值');
  await input.focus();
  await input.blur();
  await expect(input).toHaveValue('');
  await expect(page.locator('output')).toContainText('raw=empty');
});

test('restore returns to the last committed value after an incomplete edit', async ({ page }) => {
  await open(page, 'incomplete-restore');
  const input = page.getByLabel('格式值');
  await input.fill('021');
  await input.blur();
  await expect(input).toHaveValue('021-5555-1234');
  await expect(page.locator('output')).toContainText('raw=02155551234');
});

test('composition waits until compositionend before publishing Unicode raw text', async ({ page }) => {
  await open(page, 'composition-input');
  const input = page.getByLabel('格式值');
  await input.dispatchEvent('compositionstart');
  await input.fill('中文');
  await expect(page.locator('output')).toContainText('raw=empty');
  await input.dispatchEvent('compositionend', { data: '中文' });
  await expect(page.locator('output')).toContainText('raw=中文');
});

test('native form submits raw instead of formatted text', async ({ page }) => {
  await open(page, 'native-form');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.locator('output')).toHaveText('form=02155551234');
});

test('read-only, disabled and host error states reach the native input', async ({ page }) => {
  await open(page, 'read-only');
  await expect(page.getByLabel('格式值')).toHaveAttribute('readonly', '');
  await open(page, 'disabled');
  await expect(page.getByLabel('格式值')).toBeDisabled();
  await open(page, 'field-error');
  await expect(page.getByLabel('格式值')).toHaveAttribute('aria-invalid', 'true');
});

test('Playground mask and incomplete behavior update in the same story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="input-mask"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('row').filter({ hasText: /mask\*/ }).getByRole('textbox').fill('999-999');
  await expect(frame.getByLabel('联系电话')).toHaveValue('021-555');
  await page.getByRole('combobox', { name: 'incompleteBehavior' }).selectOption('restore');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: field uses tokens, fits narrow screens and passes axe`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 520 });
  await open(page, 'optional-extension', `theme:${theme};density:${density}`);
  const input = page.locator('[data-slot="input-mask"]');
  expect(await input.evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 32 : 40);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/input-mask/${theme}-${density}.png`, fullPage: true });
});
