import { chooseThemeDensity, chooseThemeMode } from './theme-menu';
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('apps/lab/src/catalog-manifest.json', 'utf8'));

test('basic preview loads its layer without Home, complex or AI catalog runtimes', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', request => requested.push(request.url()));
  await page.goto('/?preview=basic%2Fbutton&theme=dark&density=compact');
  await expect(page.getByRole('button', { name: '保存更改', exact: true })).toBeVisible();
  expect(requested.some(url => /complex\/catalog|ai\/catalog|\/Home\.tsx|tiptap/i.test(url))).toBe(false);
});

test('inline previews render immediately and preserve state while scrolling and changing appearance', async ({ page }) => {
  const documents: string[] = [];
  page.on('request', request => { if (request.isNavigationRequest() && request.url().includes('preview=')) documents.push(request.url()); });
  await page.goto('/?view=overview');
  await page.getByRole('navigation', { name: '跳转组件' }).getByRole('link', { name: 'Button', exact: true }).click();
  const frame = page.locator('[data-component="basic/button"] .atlas-inline-preview');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByText('正在载入…', { exact: true })).toHaveCount(0);
  await expect(page.locator('[data-preview]')).toHaveCount(manifest.total);
  await expect(page.getByText('预览未能显示，请重置或在组件详情中打开。', { exact: true })).toHaveCount(0);
  const save = frame.getByRole('button', { name: '保存更改', exact: true });
  await save.click();
  await expect(frame.getByText('已保存 1 次')).toBeVisible();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.getByRole('navigation', { name: '跳转组件' }).getByRole('link', { name: 'Alert', exact: true }).click();
  await expect(page.locator('[data-component="basic/alert"]')).toBeInViewport();
  await page.getByRole('navigation', { name: '跳转组件' }).getByRole('link', { name: 'Button', exact: true }).click();
  await expect(frame.getByText('已保存 1 次')).toBeVisible();
  await chooseThemeMode(page,'light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await chooseThemeDensity(page, 'comfortable');
  await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');
  await expect(frame.getByText('已保存 1 次')).toBeVisible();
  expect(documents.filter(url => new URL(url).searchParams.get('preview') === 'basic/button')).toHaveLength(0);
  await page.locator('[data-component="basic/button"]').getByRole('button', { name: '重置', exact: true }).click();
  await expect(frame.getByText('已保存 0 次')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');
  expect(documents.filter(url => new URL(url).searchParams.get('preview') === 'basic/button')).toHaveLength(0);
  await page.screenshot({ path: '.logs/overview-direct-components.png' });
});
