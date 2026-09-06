import { test, expect, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '基础-inputtags';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const input = page.locator('[data-slot="input-tags-input"]');
  await expect(input).toBeVisible();
  return input;
}

async function paste(input: Locator, text: string) {
  await input.evaluate((element, pasted) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData('text', pasted);
    element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData }));
  }, text);
}

test('pasted comma, Chinese comma, newline and tab values commit as one controlled update', async ({ page }) => {
  const input = await open(page, 'paste-batch');
  await paste(input, 'React, TypeScript，Tailwind CSS\nStorybook\tRust');
  await expect(page.locator('output')).toContainText('value=["React","TypeScript","Tailwind CSS","Storybook","Rust"]');
  await expect(input).toHaveValue('');
});

test('IME composition does not commit a separator until composition ends', async ({ page }) => {
  const input = await open(page, 'ime-safe');
  await input.dispatchEvent('compositionstart');
  await input.fill('中文，');
  await expect(page.locator('output')).toContainText('value=[]');
  await input.dispatchEvent('compositionend');
  await expect(page.locator('output')).toContainText('value=["中文"]');
});

test('local suggestions expose descriptions, disabled items and explicit create choice', async ({ page }) => {
  const input = await open(page, 'suggestions');
  await input.fill('type');
  await expect(page.getByRole('option', { name: /TypeScript/ })).toBeVisible();
  await expect(page.getByText('类型系统')).toBeVisible();
  await input.fill('rust');
  await expect(page.getByRole('option', { name: /Rust/ })).toBeDisabled();
  await input.fill('Graphite');
  await expect(page.getByRole('option', { name: '创建“Graphite”' })).toBeVisible();
});

test('suggestion keyboard navigation selects a value and clears the query', async ({ page }) => {
  const input = await open(page, 'suggestions');
  await input.fill('tail');
  await expect(page.getByRole('option', { name: /Tailwind CSS/ })).toBeVisible();
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(page.locator('output')).toContainText('value=["Tailwind CSS"]');
  await expect(input).toHaveValue('');
});

test('async suggestions announce loading before returning options', async ({ page }) => {
  const input = await open(page, 'async-suggestions');
  await input.fill('re');
  await expect(page.getByText('正在查找建议…', { exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: /React/ })).toBeVisible();
});

test('suggestion error retries the current query', async ({ page }) => {
  const input = await open(page, 'suggestion-error-retry');
  await input.fill('react');
  await expect(page.getByRole('alert')).toHaveText('建议服务暂时不可用');
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.getByRole('option', { name: /React/ })).toBeVisible();
});

test('obsolete suggestion result cannot replace the latest query', async ({ page }) => {
  const input = await open(page, 'stale-suggestions');
  await input.fill('r');
  await page.waitForTimeout(30);
  await input.fill('re');
  await expect(page.getByRole('option', { name: 'React' })).toBeVisible();
  await page.waitForTimeout(260);
  await expect(page.getByRole('option', { name: 'Rust' })).toHaveCount(0);
});

test('async create locks the entry, announces progress and appends after success', async ({ page }) => {
  const input = await open(page, 'async-create');
  await input.fill('Graphite');
  await input.press('Enter');
  await expect(input).toHaveAttribute('readonly', '');
  await expect(page.getByLabel('正在创建标签：Graphite')).toBeVisible();
  await expect(page.locator('output')).toContainText('value=["Graphite"]');
  await expect(input).not.toHaveAttribute('readonly', '');
});

test('failed async create preserves the draft and exposes the host error', async ({ page }) => {
  const input = await open(page, 'create-failure');
  await input.fill('Rejected');
  await input.press('Enter');
  await expect(page.getByRole('alert')).toHaveText('标签名称未通过工作区校验');
  await expect(input).toHaveValue('Rejected');
  await expect(page.locator('output')).toContainText('value=[]');
});

test('disabled and invalid tag metadata blocks mutation and remains described', async ({ page }) => {
  await open(page, 'tag-states');
  await expect(page.getByRole('button', { name: '编辑标签 React' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '移除标签 React' })).toHaveCount(0);
  const invalidTag = page.locator('[data-tag-index="1"]');
  await expect(invalidTag).toHaveAttribute('aria-invalid', 'true');
  await expect(invalidTag.locator('.sr-only')).toHaveText('该标签已在远程删除');
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
});

test('chip keyboard navigation moves from entry across tags and Delete restores focus', async ({ page }) => {
  const input = await open(page, 'keyboard-navigation');
  await input.press('ArrowLeft');
  const typeScript = page.getByRole('button', { name: '编辑标签 TypeScript' });
  const react = page.getByRole('button', { name: '编辑标签 React' });
  await expect(typeScript).toBeFocused();
  await typeScript.press('ArrowLeft');
  await expect(react).toBeFocused();
  await react.press('ArrowRight');
  await expect(typeScript).toBeFocused();
  await typeScript.press('Delete');
  await expect(page.locator('output')).toContainText('value=["React"]');
  await expect(react).toBeFocused();
});

test('Playground toggles batch paste and suggestion props without leaving the story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  const input = frame.locator('[data-slot="input-tags-input"]');
  await expect(input).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await input.fill('type');
  await expect(frame.getByRole('option', { name: /TypeScript/ })).toBeVisible();
  await page.getByRole('switch', { name: 'splitOnPaste' }).press('Space');
  await input.fill('');
  await paste(input, 'One,Two');
  await expect(frame.getByRole('button', { name: '编辑标签 React' })).toHaveCount(1);
  await expect(frame.getByText('One', { exact: true })).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: suggestion popup keeps token height, accessibility and containment`, async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 720 });
  const input = await open(page, 'keyboard-navigation', `theme:${theme};density:${density}`);
  expect(await page.locator('[data-slot="input-tags"]').evaluate(element => element.getBoundingClientRect().height)).toBe(density === 'compact' ? 32 : 40);
  await input.fill('tail');
  await expect(page.getByRole('option', { name: /Tailwind CSS/ })).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/input-tags-advanced/${theme}-${density}.png`, fullPage: true });
});
