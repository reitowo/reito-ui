import { expect, test } from '@playwright/test';

test('gallery is one editorial desk with working pages', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=gallery&page=trace&theme=dark&density=dense');
  await expect(page.locator('html')).toHaveAttribute('data-density', 'dense');
  await expect(page.getByRole('banner')).toContainText('南窗');
  await expect(page.getByRole('banner')).toContainText('雨季的书店');
  await expect(page.locator('main h1')).toHaveText('校样');
  await expect(page.locator('[data-slot=tool-call]')).toHaveCount(0);
  await expect(page.locator('[data-slot=mini-timeline]')).toHaveCount(0);
  await expect(page.getByText('油墨未干')).toBeVisible();

  await page.getByRole('button', { name: '问印刷厂' }).click();
  await expect(page.getByText('正在问江岸印务')).toBeVisible();
  await expect(page.getByText('周五前可以重印')).toBeVisible();
  await page.getByRole('button', { name: '重新送印' }).click();
  await expect(page.getByText('已重新送印')).toBeVisible();

  const nav = page.getByRole('navigation', { name: '南窗' });
  await nav.getByRole('button', { name: '审稿' }).click();
  await expect(page.locator('main h1')).toHaveText('审稿');
  await page.getByRole('button', { name: '显示' }).click();
  await page.getByRole('menuitemcheckbox', { name: '自动换行' }).click();
  await expect(page.getByRole('cell', { name: /油墨未干/ })).toHaveClass(/whitespace-normal/);
  await page.keyboard.press('Escape');
  await page.getByRole('row', { name: /油墨未干/ }).click();
  await page.getByRole('button', { name: '处理完' }).click();
  await expect(page.getByRole('row', { name: /油墨未干/ })).toContainText('已处理');
  await page.getByRole('combobox', { name: '处理状态' }).click();
  await page.getByRole('option', { name: '待处理' }).click();
  await expect(page.getByRole('row', { name: /油墨未干/ })).toHaveCount(0);

  await nav.getByRole('button', { name: '作者' }).click();
  await expect(page.getByRole('complementary', { name: '作者详情' })).toContainText('封面');
  await page.getByRole('button', { name: '林夏 操作' }).click();
  await page.getByRole('menuitem', { name: '转到栏目' }).press('ArrowRight');
  await page.getByRole('menuitem', { name: '书评' }).click();
  await expect(page.getByRole('complementary', { name: '作者详情' })).toContainText('书评');
  await page.getByRole('row', { name: /周宁/ }).click({ button: 'right' });
  await page.getByRole('menuitem', { name: '再约一次' }).click();
  await expect(page.getByRole('complementary', { name: '作者详情' })).toContainText('已约周宁再交一稿');

  await nav.getByRole('button', { name: '本期' }).click();
  await expect(page.getByRole('progressbar', { name: '本期进度' })).toBeVisible();
  await page.getByRole('button', { name: /封面字体/ }).click();
  await page.getByRole('combobox', { name: '移到' }).click();
  await page.getByRole('option', { name: '付印' }).click();
  await expect(page.getByRole('region', { name: '付印' }).getByRole('button', { name: /封面字体/ })).toBeVisible();
  await page.getByRole('searchbox', { name: '在这一期里找' }).fill('没有这稿');
  await expect(page.getByText('没有对上的稿件')).toBeVisible();
  await page.getByRole('searchbox', { name: '在这一期里找' }).fill('');

  await nav.getByRole('button', { name: '稿件', exact: true }).click();
  await page.getByRole('button', { name: '雨季的书店.md' }).click();
  await page.getByRole('textbox', { name: '稿纸' }).fill('周四的雨还在下。');
  await page.getByRole('button', { name: '收进草稿箱' }).click();
  await expect(page.getByText('已收进草稿箱')).toBeVisible();

  await nav.getByRole('button', { name: '发稿' }).click();
  await page.getByRole('button', { name: '本期操作' }).click();
  await page.getByRole('menuitem', { name: '重命名' }).click();
  await page.getByRole('textbox', { name: '本期标题' }).fill('雨停之后');
  await page.getByRole('button', { name: '保存标题' }).click();
  await expect(page.getByRole('banner')).toContainText('雨停之后');

  await nav.getByRole('button', { name: '室规' }).click();
  const telemetry = page.locator('[data-slot=settings-row]', { hasText: '截稿提醒' }).getByRole('switch');
  await telemetry.click();
  await expect(telemetry).toBeChecked();

  await page.getByRole('button', { name: '林夏的菜单' }).click();
  await page.getByRole('menuitemradio', { name: '紧凑' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '林夏的菜单' }).click();
  await page.getByRole('menuitem', { name: '切换到浅色' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(page.url()).toContain('view=gallery');
  expect(page.url()).toContain('density=compact');
  expect(page.url()).toContain('theme=light');
  expect(page.url()).toContain('page=settings');
});
