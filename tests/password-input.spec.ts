import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-passwordinput';
async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="password-input"]').first()).toBeVisible({ timeout: 15_000 });
}

test('visibility toggle has a readable name and restores input focus', async ({ page }) => {
  await open(page, 'visibility-toggle');
  const input = page.getByLabel('访问密码');
  await expect(input).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: '显示密码' }).click();
  await expect(input).toHaveAttribute('type', 'text');
  await expect(input).toBeFocused();
  await page.getByRole('button', { name: '隐藏密码' }).click();
  await expect(input).toHaveAttribute('type', 'password');
});

test('rule results and strength meter update from the current value', async ({ page }) => {
  await open(page, 'with-rules');
  const input = page.getByLabel('访问密码');
  await expect(page.getByRole('meter', { name: '密码强度' })).toHaveAttribute('aria-valuenow', '4');
  await input.fill('short');
  await expect(page.getByRole('meter', { name: '密码强度' })).toHaveAttribute('aria-valuenow', '1');
  await expect(page.getByText('至少 10 个字符')).toBeVisible();
});

test('host strength algorithm can replace the default score', async ({ page }) => {
  await open(page, 'custom-strength');
  await expect(page.getByRole('meter')).toHaveAttribute('aria-valuetext', '长度不足');
  await page.getByLabel('访问密码').fill('abcdefghijklmnop');
  await expect(page.getByRole('meter')).toHaveAttribute('aria-valuetext', '组织标准');
});

test('blur commits the controlled value', async ({ page }) => {
  await open(page, 'controlled');
  const input = page.getByLabel('访问密码');
  await input.fill('NewSecret42!');
  await expect(page.locator('output')).toContainText('committed=10');
  await input.blur();
  await expect(page.locator('output')).toContainText('committed=12');
});

test('feedback can be omitted while keeping the password control', async ({ page }) => {
  await open(page, 'without-feedback');
  await expect(page.getByRole('meter')).toHaveCount(0);
  await expect(page.getByLabel('访问密码')).toBeVisible();
});

test('required, read-only and disabled preserve native field semantics', async ({ page }) => {
  await open(page, 'required');
  await expect(page.getByLabel('访问密码')).toHaveAttribute('required', '');
  await open(page, 'read-only');
  await expect(page.getByLabel('访问密码')).toHaveAttribute('readonly', '');
  await expect(page.getByRole('button')).toHaveCount(0);
  await open(page, 'disabled');
  await expect(page.getByLabel('访问密码')).toBeDisabled();
  await expect(page.getByRole('button', { name: '显示密码' })).toBeDisabled();
});

test('host validation error is associated with the input', async ({ page }) => {
  await open(page, 'host-validation');
  const input = page.getByLabel('访问密码');
  const error = page.getByRole('alert');
  await expect(error).toContainText('常见单词 password');
  const describedBy = await input.getAttribute('aria-describedby');
  expect(describedBy).toContain(await error.getAttribute('id'));
  await input.fill('Graphite9!');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('native form keeps the actual password input as the submitted control', async ({ page }) => {
  await open(page, 'native-form');
  await page.getByRole('button', { name: '读取表单' }).click();
  await expect(page.locator('output')).toHaveText('form-length=10');
});

test('autocomplete modes are forwarded to the native inputs', async ({ page }) => {
  await open(page, 'auto-complete-modes');
  await expect(page.getByLabel('当前密码')).toHaveAttribute('autocomplete', 'current-password');
  await expect(page.getByLabel('新密码')).toHaveAttribute('autocomplete', 'new-password');
});

test('Playground changes feedback and state without changing stories', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="password-input"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('switch', { name: 'feedback' }).press('Space');
  await expect(frame.getByRole('meter')).toHaveCount(0);
  await page.getByRole('switch', { name: 'readOnly' }).press('Space');
  await expect(frame.getByLabel('访问密码')).toHaveAttribute('readonly', '');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: field uses tokens, fits narrow screens and passes axe`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 620 });
  await open(page, 'with-rules', `theme:${theme};density:${density}`);
  const group = page.locator('[data-slot="password-input"]');
  expect(await group.evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 32 : 40);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/password-input/${theme}-${density}.png`, fullPage: true });
});
