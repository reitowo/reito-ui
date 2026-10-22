import { test, expect } from '@playwright/test';

test('homepage points at the examples index, and 南窗 opens full screen', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: '主导航' });
  await expect(nav).not.toContainText('南窗');
  await expect(nav.getByRole('link', { name: '示例', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '查看示例', exact: true }).click();
  await expect(page).toHaveURL(/view=examples$/);
  await expect(page.getByRole('heading', { level: 1, name: '示例' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '南窗' })).toBeVisible();
  await expect(page.getByRole('banner')).toContainText('Reito UI');
  await expect(page.getByRole('banner')).not.toContainText('南窗');
  await page.getByRole('button', { name: '打开南窗', exact: true }).click();
  await expect(page.getByRole('banner')).toContainText('南窗');
  await expect(page.getByRole('banner')).not.toContainText('Reito UI');
  await expect(page).toHaveURL(/view=gallery/);
  await page.getByRole('button', { name: '回到示例', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: '示例' })).toBeVisible();
  await expect(page).toHaveURL(/view=examples/);
});

test('example deep link opens 南窗 and keeps the gallery address', async ({ page }) => {
  await page.goto('/?view=examples&example=nanchuang&page=dashboard');
  await expect(page.getByRole('banner')).toContainText('南窗');
  await expect(page).toHaveURL(/view=gallery/);
  await expect(page).toHaveURL(/page=dashboard/);
});
