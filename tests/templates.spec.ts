import { expect, test } from '@playwright/test';

test('hero actions use the extra-large button', async ({ page }) => {
  await page.goto('/');
  const primary = page.getByRole('button', { name: '阅读文档', exact: true });
  const secondary = page.getByRole('button', { name: '浏览组件', exact: true });
  await expect(primary).toHaveAttribute('data-size', 'xl');
  await expect(secondary).toHaveAttribute('data-size', 'xl');
  await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
  await expect(primary).toHaveCSS('height', '48px');
  await expect(primary).toHaveCSS('border-radius', '6px');
});

test('template paths list the apps and open the dashboard inbox', async ({ page }) => {
  await page.goto('/templates');
  await expect(page.getByRole('heading', { level: 1, name: '示例' })).toBeVisible();
  for (const name of ['工作台', '对话', '落地页', '南窗']) {
    await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
  }
  await page.goto('/templates/dashboard/inbox');
  await expect(page.getByRole('heading', { level: 1, name: '收件箱' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '席位还差两份合同' })).toBeVisible();
  await expect(page).toHaveURL(/\/templates\/dashboard\/inbox/);
  await page.goto('/?view=examples');
  await expect(page).toHaveURL(/\/templates\/?$/);
  await page.goto('/?view=gallery&page=trace&theme=dark');
  await expect(page).toHaveURL(/\/templates\/nanchuang\/trace/);
  expect(page.url()).toContain('theme=dark');
  expect(page.url()).not.toContain('view=');
});

test('dashboard fills the home page and opens notifications', async ({ page }) => {
  await page.goto('/templates/dashboard/home?theme=dark&density=compact');
  await expect(page.getByRole('heading', { level: 1, name: '本周' })).toBeVisible();
  await expect(page.getByText('¥128,400')).toBeVisible();
  await page.getByRole('link', { name: '客户' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '客户' })).toBeVisible();
  await expect(page.getByText('江岸印务')).toBeVisible();
  await page.goto('/templates/dashboard/home?theme=dark&density=compact');
  await page.getByRole('button', { name: '通知' }).click();
  await expect(page.getByRole('dialog', { name: '通知' })).toBeVisible();
  await expect(page.getByText('陈可回复了合同')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '搜索或跳转' }).click();
  await page.getByRole('option', { name: '设置' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '设置' })).toBeVisible();
  await page.getByRole('tab', { name: '外观' }).click();
  await expect(page.getByRole('combobox', { name: '密度' })).toBeVisible();
});

test('example sidebars grow from dense to comfortable', async ({ page }) => {
  await page.goto('/templates/dashboard/home?density=dense&theme=dark');
  const link = page.getByRole('link', { name: '收件箱' });
  const denseHeight = await link.evaluate((element) => element.getBoundingClientRect().height);
  const denseFont = await link.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  await page.getByRole('button', { name: '林夏的菜单' }).click();
  await page.getByRole('menuitemradio', { name: '舒适' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');
  const comfortableHeight = await link.evaluate((element) => element.getBoundingClientRect().height);
  const comfortableFont = await link.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(comfortableHeight).toBeGreaterThan(denseHeight);
  expect(comfortableFont).toBeGreaterThan(denseFont);

  await page.goto('/templates/nanchuang/dashboard?density=dense&theme=dark');
  const row = page.locator('.gallery-sidebar').getByRole('button', { name: '校样' });
  const denseRow = await row.evaluate((element) => element.getBoundingClientRect().height);
  const denseRowFont = await row.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  await page.getByRole('button', { name: '林夏的菜单' }).click();
  await page.getByRole('menuitemradio', { name: '舒适' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');
  const comfortableRow = await row.evaluate((element) => element.getBoundingClientRect().height);
  const comfortableRowFont = await row.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  expect(comfortableRow).toBeGreaterThan(denseRow);
  expect(comfortableRowFont).toBeGreaterThan(denseRowFont);
});

test('chat keeps a local reply and the landing page uses xl actions', async ({ page }) => {
  await page.goto('/templates/chat');
  await page.getByRole('button', { name: /周宁/ }).click();
  await page.getByRole('textbox', { name: '消息' }).fill('发票我补上。');
  await page.getByRole('button', { name: '发送' }).click();
  await expect(page.getByRole('region', { name: '消息' }).getByText('发票我补上。')).toBeVisible();
  await page.goto('/templates/landing');
  const pricing = page.getByRole('button', { name: '查看价格', exact: true });
  await expect(pricing).toHaveAttribute('data-size', 'xl');
  await pricing.click();
  await expect(page.getByRole('heading', { level: 2, name: '价格写在页面上。' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/templates/dashboard/home?theme=dark&density=compact');
  await expect(page.getByRole('heading', { level: 1, name: '本周' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
});
