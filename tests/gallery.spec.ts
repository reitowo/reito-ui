import { expect, test } from '@playwright/test';

test('gallery switches pages, theme and density while staying interactive', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=gallery&page=trace&theme=dark&density=dense');
  await expect(page.locator('html')).toHaveAttribute('data-density', 'dense');
  await expect(page.getByRole('banner')).toContainText('示例画廊');
  await expect(page.getByRole('navigation', { name: '示例页面' })).toBeVisible();

  const nav = page.getByRole('navigation', { name: '示例页面' });
  await nav.getByRole('button', { name: '事件流' }).click();
  await expect(page.locator('main h1')).toHaveText('事件流');
  await page.getByRole('button', { name: '视图' }).click();
  await expect(page.getByRole('menuitemcheckbox', { name: '自动换行' })).toBeVisible();
  await page.keyboard.press('Escape');

  await nav.getByRole('button', { name: '数据检查' }).click();
  await page.getByRole('button', { name: 'alpha-large 操作' }).click();
  await expect(page.getByRole('menuitem', { name: '移动到' })).toBeVisible();
  await page.keyboard.press('Escape');

  await nav.getByRole('button', { name: '活动轨迹' }).click();
  const timeline = page.getByRole('group', { name: '事件总览' });
  await timeline.getByRole('button', { pressed: true }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(timeline.locator('button[tabindex="0"]')).toBeFocused();

  await nav.getByRole('button', { name: '工作概览' }).click();
  await expect(page.getByRole('progressbar', { name: '示例任务进度' })).toBeVisible();

  await nav.getByRole('button', { name: '文件浏览' }).click();
  await expect(page.getByText('概览.md')).toBeVisible();
  await page.getByRole('button', { name: '打开 概览.md' }).click();

  await nav.getByRole('button', { name: '偏好设置' }).click();
  const telemetry = page.locator('[data-slot=settings-row]', { hasText: '诊断数据' }).getByRole('switch');
  await telemetry.click();
  await expect(telemetry).toBeChecked();

  await page.getByRole('button', { name: '紧凑' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
  await page.getByRole('button', { name: '切换到浅色' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(page.url()).toContain('view=gallery');
  expect(page.url()).toContain('density=compact');
  expect(page.url()).toContain('theme=light');
});
