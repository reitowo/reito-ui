import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-knob';
async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="knob"]').first()).toBeVisible({ timeout: 15_000 });
}

test('knob exposes a named bounded slider and readable value', async ({ page }) => {
  await open(page, 'default');
  const knob = page.getByRole('slider', { name: '上下文预算' });
  await expect(knob).toHaveAttribute('aria-valuemin', '0');
  await expect(knob).toHaveAttribute('aria-valuenow', '50');
  await expect(knob).toHaveAttribute('aria-valuemax', '100');
  await expect(knob).toHaveAttribute('aria-valuetext', '50%');
});

test('arrows, Home, End and Page keys update and commit', async ({ page }) => {
  await open(page, 'default');
  const knob = page.getByRole('slider');
  await knob.focus();
  await knob.press('ArrowRight');
  await expect(knob).toHaveAttribute('aria-valuenow', '51');
  await knob.press('PageUp');
  await expect(knob).toHaveAttribute('aria-valuenow', '61');
  await knob.press('Home');
  await expect(knob).toHaveAttribute('aria-valuenow', '0');
  await knob.press('End');
  await expect(knob).toHaveAttribute('aria-valuenow', '100');
  await expect(page.getByTestId('knob-value')).toHaveText('value=100; committed=100');
});

test('circular pointer drag maps position to the dial arc', async ({ page }) => {
  await open(page, 'default');
  const knob = page.getByRole('slider');
  const box = await knob.boundingBox();
  if (!box) throw new Error('Knob has no bounds');
  await page.mouse.move(box.x + box.width / 2, box.y + 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2);
  await page.mouse.up();
  await expect(knob).toHaveAttribute('aria-valuenow', '83');
  await expect(page.getByTestId('knob-value')).toHaveText('value=83; committed=83');
});

test('custom min, max and step clamp keyboard movement', async ({ page }) => {
  await open(page, 'fine-step');
  const knob = page.getByRole('slider');
  await expect(knob).toHaveAttribute('aria-valuenow', '1.25');
  await knob.focus();
  await knob.press('ArrowUp');
  await expect(knob).toHaveAttribute('aria-valuenow', '1.5');
  await knob.press('End');
  await expect(knob).toHaveAttribute('aria-valuenow', '2');
  await knob.press('ArrowUp');
  await expect(knob).toHaveAttribute('aria-valuenow', '2');
});

test('read-only and disabled values cannot receive input', async ({ page }) => {
  await open(page, 'read-only');
  let knob = page.getByRole('slider');
  await expect(knob).toHaveAttribute('aria-readonly', 'true');
  await expect(knob).toHaveAttribute('tabindex', '-1');
  await open(page, 'disabled');
  knob = page.getByRole('slider');
  await expect(knob).toHaveAttribute('aria-disabled', 'true');
  await expect(knob).toHaveAttribute('tabindex', '-1');
});

test('errors are connected to the slider', async ({ page }) => {
  await open(page, 'invalid');
  const knob = page.getByRole('slider');
  const alert = page.getByRole('alert');
  await expect(knob).toHaveAttribute('aria-invalid', 'true');
  expect(await knob.getAttribute('aria-describedby')).toContain(await alert.getAttribute('id'));
});

test('range labels use the supplied formatter', async ({ page }) => {
  await open(page, 'min-max');
  await expect(page.locator('[data-slot="knob-range"]')).toContainText('-12 dB');
  await expect(page.locator('[data-slot="knob-range"]')).toContainText('+12 dB');
});

test('native form submits the normalized current value', async ({ page }) => {
  await open(page, 'native-form');
  await page.getByRole('button', { name: '读取 FormData' }).click();
  await expect(page.getByTestId('form-value')).toHaveText('65');
});

test('Playground changes size, stroke and tone without leaving the Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('slider')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('radio', { name: 'lg' }).click();
  await page.getByRole('radio', { name: 'thick' }).click();
  await page.getByRole('combobox', { name: 'tone' }).selectOption('success');
  await expect(frame.locator('[data-slot="knob-field"]')).toHaveAttribute('data-size', 'lg');
  await expect(frame.locator('[data-slot="knob-field"]')).toHaveAttribute('data-tone', 'success');
  await expect(frame.locator('[data-slot="knob"]')).toHaveCSS('width', '96px');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: compact knob fits narrow screens and passes axe`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 620 });
  await open(page, 'default', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/knob/${theme}-${density}.png`, fullPage: true });
});

