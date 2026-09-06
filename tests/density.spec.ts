import { test, expect } from '@playwright/test';

// Regression for nested padding and the shared density switch, independent of font size.
for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`${theme}/${density}: table cells and AI content share the density contract`, async ({page}) => {
    const compact = density === 'compact';
    await page.addInitScript(({theme, density}) => {
      localStorage.setItem('reito-theme', theme);
      localStorage.setItem('reito-density', density);
    }, {theme, density});
    for (const layer of ['basic', 'complex']) {
      await page.goto(`/?layer=${layer}&component=${layer === 'basic' ? 'table' : 'data-table'}`);
      const cell = page.locator('.lab-demo tbody td').first();
      await expect(cell).toHaveCSS('padding-top', compact ? '6px' : '10px');
      await expect(cell).toHaveCSS('padding-left', compact ? '10px' : '16px');
    }
    await page.goto('/?layer=ai&component=artifact');
    await expect(page.getByRole('tabpanel')).toHaveCSS('padding', compact ? '12px' : '20px');
    await page.getByRole('tab', {name: '代码', exact: true}).click();
    await expect(page.getByRole('tabpanel')).toHaveCSS('padding', '0px');
    await expect(page.getByRole('tabpanel').locator('pre')).toHaveCSS('padding', compact ? '12px' : '20px');
    await page.goto('/?layer=ai&component=permission');
    await expect(page.getByRole('region', {name: /^权限请求：/})).toHaveCSS('padding', compact ? '12px' : '20px');
    await page.goto('/?layer=ai&component=composer');
    const input = page.getByRole('textbox', {name: '消息草稿', exact: true});
    await expect(input).toHaveCSS('min-height', compact ? '80px' : '112px');
    await expect(input).toHaveCSS('font-size', '16px');
    await input.fill('测试共享密度后的输入');
    await page.getByRole('button', {name: '发送消息', exact: true}).click();
    await expect(input).toHaveValue('');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
