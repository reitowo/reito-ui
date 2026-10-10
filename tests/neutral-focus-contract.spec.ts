import { test, expect } from '@playwright/test';

for (const theme of ['dark','light']) for (const density of ['compact','comfortable']) {
  test('ordinary controls consume one neutral focus role: ' + theme + '/' + density, async ({ page }) => {
    await page.addInitScript(({ theme, density }) => { localStorage.setItem('reito-theme',theme); localStorage.setItem('reito-density',density); }, { theme,density });
    const cases = [
      { id:'input', selector:'[data-slot="input"]', label:'项目名称' },
      { id:'button', selector:'[data-slot="button"]', label:'保存更改' },
      { id:'select', selector:'[data-slot="select-trigger"]', label:'选择执行位置' },
    ];
    for (const item of cases) {
      await page.goto('/?layer=basic&component=' + item.id);
      const control = page.locator('.lab-demo').locator(item.selector).filter({ hasText: item.id === 'button' ? item.label : undefined }).first();
      await expect(control).toBeVisible();
      await control.click();
      if (item.id === 'select') await page.keyboard.press('Escape');
      await control.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(control).toBeFocused();
      const style = await control.evaluate(node => {
        const s = getComputedStyle(node);
        return { focus:s.getPropertyValue('--rui-focus').trim(), muted:s.getPropertyValue('--rui-text-muted').trim(), width:s.getPropertyValue('--rui-focus-width').trim(), shadow:s.boxShadow };
      });
      expect(style.focus).toBe(style.muted);
      expect(style.width).toBe('1px');
      await expect.poll(() => control.evaluate(node => getComputedStyle(node).boxShadow)).toContain('1px');
      await expect(control).toHaveCSS('border-left-width','1px');
    }
    await page.goto('/?layer=basic&component=input-group');
    const group = page.locator('.lab-demo [data-slot="input-group"]').first();
    const field = group.locator('input');
    await field.click(); await field.press('Tab'); await page.keyboard.press('Shift+Tab');
    await expect(field).toBeFocused();
    await expect.poll(() => group.evaluate(node => getComputedStyle(node).boxShadow)).toContain('1px');
  });
}
