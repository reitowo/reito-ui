import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/?layer=basic&component=scroll-top'); });
test('threshold visibility and keyboard return restore focus to the heading', async ({ page }) => {
  const top = page.getByRole('button', { name: '返回顶部', exact: true });
  await expect(top).toHaveCount(0);
  await page.getByRole('button', { name: '滚到示例末尾' }).click();
  await expect(top).toBeVisible();
  await top.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: '本地文档示例' })).toBeFocused();
  await expect.poll(() => page.getByRole('region', { name: '文档滚动面板' }).evaluate(el => el.scrollTop)).toBe(0);
  await expect(top).toHaveCount(0);
});
test('reduced motion returns immediately and leaves the page scroll unchanged', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: '滚到示例末尾' }).click();
  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole('button', { name: '返回顶部', exact: true }).click();
  await expect.poll(() => page.getByRole('region', { name: '文档滚动面板' }).evaluate(el => el.scrollTop)).toBe(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});
test('disabled, short content and independent panels respect their target', async ({ page }) => {
  const open = (story: string) => page.goto(`http://127.0.0.1:6007/iframe.html?id=基础-scrolltop--${story}&viewMode=story`);
  await open('disabled'); await page.getByRole('button', { name: '滚到示例末尾' }).click();
  await expect(page.getByRole('button', { name: '返回顶部', exact: true })).toBeDisabled();
  await open('short-content'); await page.getByRole('button', { name: '滚到示例末尾' }).click();
  await expect(page.getByRole('button', { name: '返回顶部', exact: true })).toHaveCount(0);
  await open('independent-panels');
  await page.getByRole('button', { name: '滚到示例末尾' }).nth(1).click();
  await expect(page.getByRole('button', { name: '返回顶部', exact: true })).toHaveCount(1);
  expect(await page.getByRole('region').nth(0).evaluate(el => el.scrollTop)).toBe(0);
  await page.getByRole('button', { name: '返回顶部', exact: true }).click();
  await expect(page.getByRole('heading', { name: '本地文档示例' }).nth(1)).toBeFocused();
});
test('window target returns the window and restores heading focus', async ({ page }) => {
  await page.goto('http://127.0.0.1:6007/iframe.html?id=基础-scrolltop--window-target&viewMode=story');
  await page.getByRole('button', { name: '滚到页面末尾' }).click();
  await page.getByRole('button', { name: '返回顶部', exact: true }).click();
  await expect(page.getByRole('heading', { name: '页面顶部示例' })).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
test('same-page Controls change threshold, disabled and content length', async ({ page }) => {
  await page.goto('http://127.0.0.1:6007/?path=/story/基础-scrolltop--playground');
  const frame = page.frameLocator('#storybook-preview-iframe');
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await frame.getByRole('button', { name: '滚到示例末尾' }).click();
  const button = frame.getByRole('button', { name: '返回顶部', exact: true });
  await expect(button).toBeEnabled();
  await page.locator('label[for="control-disabled"]').click();
  await expect(button).toBeDisabled();
  await page.locator('#control-threshold').fill('100000');
  await page.locator('#control-threshold').blur();
  await expect(button).toHaveCount(0);
  await page.locator('#control-threshold').fill('0'); await page.locator('#control-threshold').blur();
  await expect(button).toBeVisible();
  await page.locator('label[for="control-short"]').click();
  await expect(button).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('path')).toBe('/story/基础-scrolltop--playground');
});
for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`${theme}/${density}: narrow panel preserves accessible action`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 850 });
    await page.evaluate(({ theme, density }) => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.density = density; }, { theme, density });
    await page.getByRole('button', { name: '滚到示例末尾' }).click();
    await expect(page.getByRole('button', { name: '返回顶部', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.logs/scroll-top/${theme}-${density}.png` });
  });
}
