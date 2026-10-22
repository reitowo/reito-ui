import { expect, test } from '@playwright/test';

const pages = ['trace', 'events', 'inspector', 'commands', 'dashboard', 'files', 'settings'] as const;

const tabLabels = {
  trace: '活动轨迹',
  events: '事件流',
  inspector: '数据检查',
  commands: '命令面板',
  dashboard: '工作概览',
  files: '文件浏览',
  settings: '偏好设置',
} as const;

/** Visible landmark/content unique to each gallery page after switching tabs. */
const pageMarkers = {
  trace: '活动轨迹',
  events: '事件流',
  inspector: '模型目录',
  commands: null,
  dashboard: '工作概览',
  files: '文件浏览',
  settings: '偏好设置',
} as const;

test('gallery stays within a phone viewport without horizontal overflow', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=gallery&page=trace&theme=dark&density=dense');
  await expect(page.getByRole('banner')).toContainText('示例画廊');
  const tabs = page.locator('.gallery-page-tabs');
  await expect(tabs).toBeVisible();
  await expect(page.locator('.gallery-sidebar')).toBeHidden();

  for (const id of pages) {
    await tabs.getByRole('button', { name: tabLabels[id] }).click();
    if (id === 'commands') {
      await expect(page.getByRole('menuitem', { name: '文件' })).toBeVisible();
    } else {
      await expect(page.getByRole('region', { name: pageMarkers[id]! })).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  }

  await tabs.getByRole('button', { name: '事件流' }).click();
  await page.getByRole('row').nth(1).click();
  await expect(page.getByRole('button', { name: '返回' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await page.getByRole('button', { name: '返回' }).click();
  await expect(page.getByRole('table', { name: '事件' })).toBeVisible();
});

test('docs homepage shell fits a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible();
});
