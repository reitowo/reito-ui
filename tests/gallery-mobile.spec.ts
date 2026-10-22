import { expect, test } from '@playwright/test';

const pages = ['dashboard', 'files', 'events', 'inspector', 'trace', 'commands', 'settings'] as const;

const tabLabels = {
  dashboard: '本期',
  files: '稿件',
  events: '审稿',
  inspector: '作者',
  trace: '校样',
  commands: '发稿',
  settings: '室规',
} as const;

const pageMarkers = {
  dashboard: '本期',
  files: '稿件',
  events: '审稿',
  inspector: '作者名册',
  trace: '校样',
  commands: '发稿',
  settings: '室规',
} as const;

test('gallery stays within a phone viewport without horizontal overflow', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=gallery&page=dashboard&theme=dark&density=dense');
  await expect(page.getByRole('banner')).toContainText('南窗');
  const tabs = page.locator('.gallery-page-tabs');
  await expect(tabs).toBeVisible();
  await expect(page.locator('.gallery-sidebar')).toBeHidden();

  for (const id of pages) {
    await tabs.getByRole('button', { name: tabLabels[id], exact: true }).click();
    await expect(page.getByRole('region', { name: pageMarkers[id], exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  }

  await tabs.getByRole('button', { name: '审稿', exact: true }).click();
  await page.getByRole('row').nth(1).click();
  await expect(page.getByRole('button', { name: '返回' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await page.getByRole('button', { name: '返回' }).click();
  await expect(page.getByRole('table', { name: '审稿' })).toBeVisible();
});

test('docs homepage shell fits a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible();
});
