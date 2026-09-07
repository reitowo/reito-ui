import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function open(page: Page, family: 'multiselect' | 'asyncmultiselect', story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=基础-${family}--${story}&viewMode=story&globals=${globals}`);
  const input = page.getByRole('combobox', { name: family === 'multiselect' ? '项目技术栈' : '异步选择技术栈', exact: true });
  try { await expect(input).toBeVisible({ timeout: 15_000 }); }
  catch { await page.reload(); await expect(input).toBeVisible({ timeout: 15_000 }); }
  return input;
}

test('local options expose group labels and disabled option semantics', async ({ page }) => {
  const input = await open(page, 'multiselect', 'grouped');
  await input.click();
  await expect(page.getByText('前端', { exact: true })).toBeVisible();
  await expect(page.getByText('工具', { exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: /Rust/ })).toBeDisabled();
});

test('visible-result action exposes mixed state and excludes disabled options', async ({ page }) => {
  const input = await open(page, 'multiselect', 'partial-selection');
  await input.click();
  const toggle = page.getByRole('checkbox', { name: /全选当前结果/ });
  await expect(toggle).toHaveAttribute('aria-checked', 'mixed');
  await toggle.click();
  await expect(page.getByRole('button', { name: '移除TypeScript' })).toBeVisible();
  await expect(page.locator('[data-slot="combobox-chip"]').getByText('Tailwind CSS', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '移除Storybook' })).toBeVisible();
  await expect(page.getByRole('button', { name: '移除Rust' })).toHaveCount(0);
});

test('filtered bulk selection preserves values outside the current result', async ({ page }) => {
  const input = await open(page, 'multiselect', 'filtered-bulk');
  await input.fill('前端');
  const toggle = page.getByRole('checkbox', { name: /全选当前结果/ });
  await expect(toggle).toContainText('0/2');
  await toggle.click();
  await expect(page.getByRole('button', { name: '移除React' })).toBeVisible();
  await expect(page.getByRole('button', { name: '移除TypeScript' })).toBeVisible();
  await expect(page.locator('[data-slot="combobox-chip"]').getByText('Tailwind CSS', { exact: true })).toBeVisible();
  await toggle.click();
  await expect(page.getByRole('button', { name: '移除React' })).toHaveCount(0);
  await expect(page.locator('[data-slot="combobox-chip"]').getByText('Tailwind CSS', { exact: true })).toBeVisible();
});

test('bulk clear and chip removal retain a disabled selected value', async ({ page }) => {
  const input = await open(page, 'multiselect', 'disabled-boundary');
  const locked = page.getByRole('button', { name: '移除Rust' });
  await expect(locked).toBeDisabled();
  await input.click();
  await page.getByRole('button', { name: '清除已选' }).click();
  await input.press('Escape');
  await expect(locked).toBeVisible();
  await expect(page.getByRole('button', { name: '移除React' })).toHaveCount(0);
});

test('local creation caches and selects the returned option', async ({ page }) => {
  const input = await open(page, 'multiselect', 'create-option');
  await input.fill('Vue');
  await page.getByRole('button', { name: /创建“Vue”/ }).click();
  await expect(page.getByRole('button', { name: '移除Vue' })).toBeVisible();
  await expect(input).toHaveValue('');
});

test('exact option labels suppress duplicate creation', async ({ page }) => {
  const input = await open(page, 'multiselect', 'create-option');
  await input.fill('React');
  await expect(page.getByRole('button', { name: /创建“React”/ })).toHaveCount(0);
  await expect(page.getByRole('option', { name: /React/ })).toBeVisible();
});

test('async result pages support groups, mixed state and page-scoped selection', async ({ page }) => {
  const input = await open(page, 'asyncmultiselect', 'partial-selection');
  await input.click();
  await expect(page.getByText('前端', { exact: true })).toBeVisible();
  const toggle = page.getByRole('checkbox', { name: /全选当前结果/ });
  await expect(toggle).toHaveAttribute('aria-checked', 'mixed');
  await toggle.click();
  await expect(page.locator('output')).toContainText('"storybook"');
  await expect(page.locator('output')).not.toContainText('"rust"');
});

test('async creation waits for the host and retains the new chip', async ({ page }) => {
  const input = await open(page, 'asyncmultiselect', 'create-option');
  await input.fill('Solid');
  await expect(page.getByRole('button', { name: /创建“Solid”/ })).toBeVisible();
  await page.getByRole('button', { name: /创建“Solid”/ }).click();
  await expect(page.getByRole('button', { name: /正在创建/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: '移除Solid' })).toBeVisible();
  await expect(page.locator('output')).toContainText('"solid"');
});

test('async creation failure keeps the query and exposes the host error', async ({ page }) => {
  const input = await open(page, 'asyncmultiselect', 'create-failure');
  await input.fill('Unknown');
  await page.getByRole('button', { name: /创建“Unknown”/ }).click();
  await expect(page.getByRole('alert')).toHaveText('无法创建这个技术标签');
  await expect(input).toHaveValue('Unknown');
});

test('both Playgrounds expose enhancement switches without changing Story tabs', async ({ page }) => {
  for (const family of ['multiselect', 'asyncmultiselect']) {
    await page.goto(`http://127.0.0.1:6007/?path=/story/基础-${family}--playground`);
    const frame = page.frameLocator('#storybook-preview-iframe');
    await expect(frame.locator('[data-slot$="multi-select"]')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('tab', { name: /^Controls/ }).click();
    const path = new URL(page.url()).searchParams.get('path');
    await expect(page.getByRole('switch', { name: 'showSelectAll' })).toBeVisible();
    await expect(page.getByRole('switch', { name: 'allowCreate' })).toBeVisible();
    expect(new URL(page.url()).searchParams.get('path')).toBe(path);
  }
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: grouped bulk popup is accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 680 });
  const input = await open(page, 'multiselect', 'partial-selection', `theme:${theme};density:${density}`);
  await input.click();
  await expect(page.getByRole('checkbox', { name: /全选当前结果/ })).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/multi-select-advanced/${theme}-${density}.png`, fullPage: true });
});
