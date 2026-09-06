import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-asynccombobox';

async function open(page: Page, story = 'minimum-query', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const input = page.getByRole('combobox', { name: '异步查找技术栈', exact: true });
  await expect(input).toBeVisible();
  return input;
}

test('minimum query keeps the loader idle until the threshold is met', async ({ page }) => {
  const input = await open(page);
  await input.click();
  await expect(page.getByText('请输入至少 2 个字符')).toBeVisible();
  await input.fill('r');
  await expect(page.getByText('请输入至少 2 个字符')).toBeVisible();
  await input.fill('re');
  await expect(page.getByRole('option', { name: /React/ })).toBeVisible();
});

test('loading is announced and marks the input busy', async ({ page }) => {
  const input = await open(page, 'loading');
  await input.click();
  await expect(input).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByRole('status')).toHaveText('正在查询…');
});

test('empty results are distinct from idle and loading', async ({ page }) => {
  const input = await open(page, 'empty');
  await input.click();
  await expect(page.getByText('没有匹配的选项')).toBeVisible();
  await expect(page.locator('[data-slot="async-combobox"]')).toHaveAttribute('data-status', 'ready');
});

test('load failure remains visible and retry uses the same query', async ({ page }) => {
  const input = await open(page, 'error-retry');
  await input.click();
  await expect(page.getByRole('alert')).toHaveText(/本地目录暂时不可用/);
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.getByRole('option', { name: /React/ })).toBeVisible();
});

test('a slower obsolete response cannot replace the latest query results', async ({ page }) => {
  const input = await open(page, 'stale-results');
  await input.fill('r');
  await page.waitForTimeout(30);
  await input.fill('re');
  await expect(page.getByRole('option', { name: 'React' })).toBeVisible();
  await page.waitForTimeout(260);
  await expect(page.getByRole('option', { name: 'Rust' })).toHaveCount(0);
  await expect(page.locator('output')).toContainText('query="re"');
});

test('selected value and label survive an empty remote result page', async ({ page }) => {
  const input = await open(page, 'selected-cache');
  await expect(input).toHaveValue('React');
  await expect(page.locator('output')).toContainText('value=react');
  await input.click();
  await expect(page.getByText('没有匹配的选项')).toBeVisible();
  await expect(input).toHaveValue('React');
});

test('keyboard navigation selects a remote option', async ({ page }) => {
  const input = await open(page, 'overview');
  await input.fill('type');
  await expect(page.getByRole('option', { name: /TypeScript/ })).toBeVisible();
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(page.locator('output')).toContainText('value=typescript');
  await expect(input).toHaveValue('TypeScript');
});

test('disabled and invalid states retain native semantics', async ({ page }) => {
  const disabled = await open(page, 'disabled');
  await expect(disabled).toBeDisabled();
  const invalid = await open(page, 'invalid');
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('alert')).toHaveText('请选择一个可用技术栈。');
});

test('Playground changes query rules and disabled state in the same Storybook tab', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  const input = frame.getByRole('combobox', { name: '异步查找技术栈', exact: true });
  await expect(input).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-minQueryLength"]').fill('2');
  await input.click();
  await expect(frame.getByText('请输入至少 2 个字符')).toBeVisible();
  await page.getByRole('switch', { name: 'disabled' }).press('Space');
  await expect(frame.locator('input[data-slot="input-group-control"]')).toBeDisabled();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: token height, async popup accessibility and narrow containment`, async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 720 });
  const input = await open(page, 'minimum-query', `theme:${theme};density:${density}`);
  expect(await input.locator('..').evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 32 : 40);
  await input.fill('re');
  await expect(page.getByRole('option', { name: /React/ })).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/async-combobox/${theme}-${density}.png`, fullPage: true });
});
