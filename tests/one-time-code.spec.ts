import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?layer=basic&component=one-time-code');
  await expect(page.getByRole('group', { name: 'JumpServer 验证码' })).toBeVisible();
});

test('locked and expired values are absent from the rendered code and copy action', async ({ page }) => {
  const display = page.getByRole('group', { name: 'JumpServer 验证码' });
  await expect(display.locator('code')).toHaveText('123456');
  await page.getByRole('button', { name: '锁定示例码' }).click();
  await expect(display).toContainText('解锁后可查看');
  await expect(display.locator('code')).toHaveCount(0);
  await expect(display).not.toContainText('123456');
  await expect(display.getByRole('button')).toHaveCount(0);
  await page.getByRole('button', { name: '解锁示例码' }).click();
  await page.getByRole('button', { name: '使示例码过期' }).click();
  await expect(display).toContainText('已过期，等待刷新');
  await expect(display.locator('code')).toHaveCount(0);
  await expect(display.getByRole('button')).toHaveCount(0);
});

test('copy awaits the host, prevents duplicates, and suppresses stale feedback after rotation', async ({ page }) => {
  await page.getByRole('checkbox', { name: '延迟完成复制' }).check();
  const copy = page.getByRole('button', { name: '复制JumpServer 验证码' });
  await copy.focus();
  await page.keyboard.press('Enter');
  await expect(copy).toBeDisabled();
  await expect(page.getByText('已请求复制 1 次', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '轮换示例码' }).click();
  await page.getByRole('button', { name: '完成复制回调' }).click();
  await expect(copy).toBeEnabled();
  await expect(page.getByRole('group', { name: 'JumpServer 验证码' }).getByRole('status')).toHaveCount(0);
});

test('copy failure stays local and can be retried successfully', async ({ page }) => {
  const display = page.getByRole('group', { name: 'JumpServer 验证码' });
  await page.getByRole('checkbox', { name: '模拟复制失败' }).check();
  await display.getByRole('button').click();
  await expect(display.getByRole('status')).toHaveText('复制失败，请重试');
  await page.getByRole('checkbox', { name: '模拟复制失败' }).uncheck();
  await display.getByRole('button').click();
  await expect(display.getByRole('status')).toHaveText('已复制');
});

test('locking during a rejected copy keeps the value and feedback hidden', async ({ page }) => {
  await page.getByRole('checkbox', { name: '延迟完成复制' }).check();
  await page.getByRole('checkbox', { name: '模拟复制失败' }).check();
  await page.getByRole('button', { name: '复制JumpServer 验证码' }).click();
  await page.getByRole('button', { name: '锁定示例码' }).click();
  await page.getByRole('button', { name: '完成复制回调' }).click();
  const display = page.getByRole('group', { name: 'JumpServer 验证码' });
  await expect(display).toContainText('解锁后可查看');
  await expect(display.locator('code')).toHaveCount(0);
  await expect(display.getByRole('status')).toHaveCount(0);
});

test('loading and empty states hide the code; disabled copying keeps it readable', async ({ page }) => {
  const display = page.getByRole('group', { name: 'JumpServer 验证码' });
  await page.getByRole('checkbox', { name: '正在刷新' }).check();
  await expect(display.locator('code')).toHaveCount(0);
  await expect(display.getByRole('button')).toHaveCount(0);
  await page.getByRole('checkbox', { name: '正在刷新' }).uncheck();
  await page.getByRole('checkbox', { name: '空验证码' }).check();
  await expect(display).toHaveText('暂无验证码');
  await page.getByRole('checkbox', { name: '空验证码' }).uncheck();
  await page.getByRole('checkbox', { name: '禁用复制' }).check();
  await expect(display.locator('code')).toHaveText('123456');
  await expect(display.getByRole('button')).toBeDisabled();
});

test('unlocking again before an old callback settles does not restore its feedback', async ({ page }) => {
  await page.getByRole('checkbox', { name: '延迟完成复制' }).check();
  await page.getByRole('button', { name: '复制JumpServer 验证码' }).click();
  await page.getByRole('button', { name: '锁定示例码' }).click();
  await page.getByRole('button', { name: '解锁示例码' }).click();
  await page.getByRole('button', { name: '完成复制回调' }).click();
  await expect(page.getByRole('group', { name: 'JumpServer 验证码' }).getByRole('status')).toHaveCount(0);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`${theme}/${density}: token height, keyboard copying and narrow containment`, async ({ page }) => {
    if (theme === 'light') await page.getByRole('button', { name: '切换明暗主题' }).click();
    if (density === 'comfortable') await page.getByRole('button', { name: '切换组件密度' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveAttribute('data-density', density);
    const display = page.getByRole('group', { name: 'JumpServer 验证码' });
    const copy = display.getByRole('button');
    await expect.poll(async () => (await copy.boundingBox())!.height).toBe(density === 'compact' ? 24 : 32);
    await copy.focus();
    await page.keyboard.press('Enter');
    await expect(display.getByRole('status')).toHaveText('已复制');
    await page.getByTestId('component-preview').screenshot({ path: `.logs/one-time-code/${theme}-${density}.png` });
    await page.setViewportSize({ width: 390, height: 850 });
    const bounds = (await display.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  });
}
