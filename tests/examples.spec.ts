import { test, expect } from '@playwright/test';

test('homepage points at the examples index, and 南窗 opens full screen', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: '主导航' });
  await expect(nav).not.toContainText('南窗');
  await expect(nav.getByRole('link', { name: '示例', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '查看示例', exact: true }).click();
  await expect(page).toHaveURL(/\/templates\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: '示例' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '工作台' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '南窗' })).toBeVisible();
  await expect(page.getByRole('banner')).toContainText('Reito UI');
  await expect(page.getByRole('banner')).not.toContainText('南窗');
  await page.getByRole('button', { name: '打开南窗', exact: true }).click();
  await expect(page.getByRole('banner')).toContainText('南窗');
  await expect(page.getByRole('banner')).not.toContainText('Reito UI');
  await expect(page).toHaveURL(/\/templates\/nanchuang\/dashboard/);
  await page.getByRole('button', { name: '回到示例', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: '示例' })).toBeVisible();
  await expect(page).toHaveURL(/\/templates\/?$/);
});

test('legacy example query opens 南窗 on its path', async ({ page }) => {
  await page.goto('/?view=examples&example=nanchuang&page=dashboard');
  await expect(page.getByRole('banner')).toContainText('南窗');
  await expect(page).toHaveURL(/\/templates\/nanchuang\/dashboard/);
  expect(page.url()).not.toContain('view=');
  expect(page.url()).not.toContain('page=');
});
