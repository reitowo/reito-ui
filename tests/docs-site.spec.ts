import { expect, test } from '@playwright/test';

test('docs introduction, navigation and markdown mirror', async ({ page, request }) => {
  await page.goto('/docs/introduction');
  await expect(page.getByRole('heading', { level: 1, name: '介绍' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '文档导航' }).getByRole('link', { name: '安装' })).toBeVisible();
  await page.getByRole('navigation', { name: '文档导航' }).getByRole('link', { name: '安装' }).click();
  await expect(page).toHaveURL(/\/docs\/installation\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: '安装' })).toBeVisible();
  const markdown = await request.get('/docs/installation.md');
  expect(markdown.ok()).toBeTruthy();
  expect(markdown.headers()['content-type']).toMatch(/markdown|plain/);
  expect(await markdown.text()).toContain('npm install @reito/ui @reito/tokens');
});

test('theming and using-with-AI pages expose llms endpoints', async ({ page, request }) => {
  await page.goto('/docs/theming');
  await expect(page.getByRole('heading', { level: 1, name: '主题' })).toBeVisible();
  await expect(page.getByText('--rui-radius')).toBeVisible();
  await page.goto('/docs/ai');
  await expect(page.getByRole('heading', { level: 1, name: '与 AI 协作' })).toBeVisible();
  const index = await request.get('/llms.txt');
  expect(index.ok()).toBeTruthy();
  const listing = await index.text();
  expect(listing).toContain('# Reito UI');
  expect(listing).toContain('/docs/installation.md');
  expect(listing).toContain('/docs/components/button.md');
  const full = await request.get('/llms-full.txt');
  expect(full.ok()).toBeTruthy();
  const dump = await full.text();
  expect(dump).toContain('# 安装');
  expect(dump).toContain('# Button');
});

test('gallery lists components and opens a detail preview', async ({ page }) => {
  await page.goto('/gallery');
  await expect(page.getByRole('heading', { level: 1, name: '组件库' })).toBeVisible();
  await page.getByRole('textbox', { name: '搜索组件' }).fill('button');
  await page.locator('[data-component="button"]').click();
  await expect(page).toHaveURL(/\/gallery\/button\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();
  await expect(page.getByTestId('site-component-preview')).toBeVisible();
  await page.getByRole('main').getByRole('button', { name: '文档' }).click();
  await expect(page).toHaveURL(/\/docs\/components\/button\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();
});

test('homepage hero reaches docs, gallery and install', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '阅读文档', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/introduction\/?$/);
  await page.goto('/');
  await page.getByRole('button', { name: '安装', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/installation\/?$/);
  await page.goto('/');
  await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '组件', exact: true }).click();
  await expect(page).toHaveURL(/\/gallery\/?$/);
});
