import { test, expect } from '@playwright/test';

for (const density of ['compact', 'comfortable']) test(`tokens drive actual control styles without CSS slot overrides: ${density}`, async ({ page }) => {
  await page.addInitScript(density => localStorage.setItem('reito-density', density), density);
  await page.goto('/?layer=basic&component=input');
  const input = page.getByRole('textbox', { name: '项目名称', exact: true });
  await expect(input).toHaveCSS('height', density === 'compact' ? '32px' : '40px');
  await expect(input).toHaveCSS('font-size', '14px');
  await page.evaluate(() => {
    const root = document.documentElement.style;
    root.setProperty('--rui-control-height', '44px');
    root.setProperty('--rui-font-interface', '18px');
    root.setProperty('--rui-radius-lg', '3px');
    root.setProperty('--rui-space-1', '5px');
  });
  await expect(input).toHaveCSS('height', '44px');
  await expect(input).toHaveCSS('font-size', '18px');
  await expect(input).toHaveCSS('border-radius', '3px');
  await expect(input).toHaveCSS('padding-left', '12.5px');
  await input.fill('修改 token 后仍然能输入');
  await expect(input).toHaveValue('修改 token 后仍然能输入');

  await page.goto('/?layer=basic&component=button');
  const button = page.getByRole('button', { name: '保存更改', exact: true });
  await page.evaluate(() => {
    const root = document.documentElement.style;
    root.setProperty('--rui-control-height', '44px');
    root.setProperty('--rui-font-interface', '18px');
    root.setProperty('--rui-radius-lg', '3px');
    root.setProperty('--rui-font-weight-medium', '600');
  });
  await expect(button).toHaveCSS('height', '44px');
  await expect(button).toHaveCSS('font-size', '18px');
  await expect(button).toHaveCSS('border-radius', '3px');
  await expect(button).toHaveCSS('font-weight', '600');
  await button.click();
  await expect(page.getByText('已保存 1 次')).toBeVisible();

  await page.goto('/?layer=ai&component=composer');
  const composer = page.getByRole('textbox', { name: '消息草稿', exact: true }).locator('..');
  await expect(composer).toBeVisible();
  await page.evaluate(() => {
    const root = document.documentElement.style;
    root.setProperty('--rui-radius-composer', '22px');
    root.setProperty('--rui-composer-bg', 'rgb(33, 44, 55)');
  });
  await expect(composer).toHaveCSS('border-radius', '22px');
  await expect(composer).toHaveCSS('background-color', 'rgb(33, 44, 55)');
});

test('generated container breakpoints preserve desktop and narrow workspace layout', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:5175/');
  const panels = page.locator('.workbench-shell > div').first();
  await expect(panels).toHaveCSS('flex-direction', 'row');
  const navigation = page.getByRole('navigation', { name: '工作台导航' });
  expect((await navigation.boundingBox())!.width).toBeLessThan(300);
  await page.setViewportSize({ width: 640, height: 720 });
  await expect(panels).toHaveCSS('flex-direction', 'column');
  await expect(page.getByRole('textbox', { name: '消息草稿', exact: true })).toBeVisible();
});
