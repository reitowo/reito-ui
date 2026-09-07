import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-rating';
async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="rating"]').first()).toBeVisible({ timeout: 15_000 });
}

test('rating exposes a named radio group and checked value', async ({ page }) => {
  await open(page, 'default');
  await expect(page.getByRole('radiogroup', { name: '本次回答质量' })).toBeVisible();
  await expect(page.getByRole('radio', { name: '3 星，共 5 星' })).toBeChecked();
  await expect(page.getByTestId('rating-value')).toHaveText('value=3');
});

test('clicking a rating updates controlled state', async ({ page }) => {
  await open(page, 'default');
  await page.getByRole('radio', { name: '5 星，共 5 星' }).check({ force: true });
  await expect(page.getByTestId('rating-value')).toHaveText('value=5');
  await expect(page.getByRole('radio', { name: '5 星，共 5 星' })).toBeChecked();
});

test('native radio arrows move and commit the rating', async ({ page }) => {
  await open(page, 'default');
  const selected = page.getByRole('radio', { name: '3 星，共 5 星' });
  await selected.focus();
  await selected.press('ArrowRight');
  await expect(page.getByRole('radio', { name: '4 星，共 5 星' })).toBeChecked();
  await expect(page.getByTestId('rating-value')).toHaveText('value=4');
});

test('half and quarter precision create exact choices', async ({ page }) => {
  await open(page, 'half-step');
  await expect(page.getByRole('radio', { name: '2.5 星，共 5 星' })).toBeChecked();
  await page.getByRole('radio', { name: '3.5 星，共 5 星' }).check({ force: true });
  await expect(page.getByTestId('rating-value')).toHaveText('value=3.5');
  await open(page, 'quarter-step');
  await expect(page.getByRole('radio', { name: '3.75 星，共 5 星' })).toBeChecked();
});

test('clear returns an optional rating to empty', async ({ page }) => {
  await open(page, 'default');
  await page.getByRole('button', { name: '清除本次回答质量' }).click();
  await expect(page.getByTestId('rating-value')).toHaveText('value=null');
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
});

test('hover previews a value without committing it', async ({ page }) => {
  await open(page, 'default');
  await page.getByRole('radio', { name: '4 星，共 5 星' }).locator('..').hover();
  await expect(page.locator('[data-slot="rating-item"][data-filled="true"]')).toHaveCount(4);
  await expect(page.getByTestId('rating-value')).toHaveText('value=3');
  await page.mouse.move(800, 600);
  await expect(page.locator('[data-slot="rating-item"][data-filled="true"]')).toHaveCount(3);
});

test('required ratings expose semantics and cannot be cleared', async ({ page }) => {
  await open(page, 'required');
  await expect(page.getByRole('radiogroup')).toHaveAttribute('aria-required', 'true');
  await expect(page.getByRole('button', { name: /清除/ })).toHaveCount(0);
});

test('read-only and disabled ratings cannot be edited', async ({ page }) => {
  await open(page, 'read-only');
  const readonly = page.getByRole('radiogroup');
  await expect(readonly).toHaveAttribute('aria-readonly', 'true');
  await expect(page.getByRole('radio').first()).toBeDisabled();
  await open(page, 'disabled');
  await expect(page.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('radio').first()).toBeDisabled();
});

test('errors are connected to the group', async ({ page }) => {
  await open(page, 'invalid');
  const group = page.getByRole('radiogroup');
  const alert = page.getByRole('alert');
  await expect(group).toHaveAttribute('aria-invalid', 'true');
  expect(await group.getAttribute('aria-describedby')).toContain(await alert.getAttribute('id'));
});

test('native form submits the exact stepped value', async ({ page }) => {
  await open(page, 'native-form');
  await page.getByRole('button', { name: '读取 FormData' }).click();
  await expect(page.getByTestId('form-value')).toHaveText('3.5');
});

test('Playground changes tone, size and precision without leaving the Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('radiogroup')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.getByRole('radio', { name: 'lg' }).click();
  await page.getByRole('combobox', { name: 'tone' }).selectOption('success');
  await page.getByRole('radio', { name: '0.25' }).click();
  await expect(frame.locator('[data-slot="rating"]')).toHaveAttribute('data-size', 'lg');
  await expect(frame.locator('[data-slot="rating"]')).toHaveAttribute('data-tone', 'success');
  await expect(frame.getByRole('radio')).toHaveCount(20);
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: rating fits narrow screens and passes axe`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 620 });
  await open(page, 'half-step', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/rating/${theme}-${density}.png`, fullPage: true });
});
