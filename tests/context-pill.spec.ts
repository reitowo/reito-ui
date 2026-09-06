import { test, expect } from '@playwright/test';

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`${theme}/${density}: context variants align and keyboard removal preserves the draft`, async ({ page }) => {
    await page.addInitScript(({ theme, density }) => {
      localStorage.setItem('reito-theme', theme);
      localStorage.setItem('reito-density', density);
    }, { theme, density });
    await page.goto('/?layer=ai&component=context-pill');
    const demo = page.locator('.lab-demo');
    const expectedHeight = density === 'compact' ? 28 : 36;
    for (const name of ['当前工作区', 'design-language.md', '只读上下文']) {
      const pill = demo.getByTitle(name, { exact: true }).locator('..');
      await expect(pill).toHaveCSS('height', `${expectedHeight}px`);
      const geometry = await pill.evaluate(element => {
        const outer = element.getBoundingClientRect();
        const action = element.querySelector('button')?.getBoundingClientRect();
        return action ? {
          square: action.width === action.height,
          contained: action.top >= outer.top && action.bottom <= outer.bottom && action.right <= outer.right,
        } : null;
      });
      if (geometry) expect(geometry).toEqual({ square: true, contained: true });
    }
    const remove = demo.getByRole('button', { name: '移除design-language.md', exact: true });
    const disabled = demo.getByRole('button', { name: '移除只读上下文', exact: true });
    await expect(disabled).toBeDisabled();
    await remove.focus();
    await page.keyboard.press('Tab');
    await expect(disabled).not.toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(remove).toBeFocused();
    expect(await remove.evaluate(element => element.matches(':focus-visible'))).toBe(true);
    await page.keyboard.press('Enter');
    await expect(remove).toHaveCount(0);
    await demo.getByRole('button', { name: '添加规范上下文', exact: true }).press('Space');
    await remove.press('Space');
    await expect(remove).toHaveCount(0);
    await expect(demo.getByTitle('只读上下文', { exact: true })).toBeVisible();

    await page.goto('/?layer=ai&component=composer');
    const input = page.getByRole('textbox', { name: '消息草稿', exact: true });
    await input.fill('删除上下文后继续编辑');
    const context = page.getByTitle('design-language.md', { exact: true }).locator('..');
    await expect(context).toHaveCSS('height', `${expectedHeight}px`);
    await page.getByRole('button', { name: '移除design-language.md', exact: true }).press('Enter');
    await expect(context).toHaveCount(0);
    await expect(input).toHaveValue('删除上下文后继续编辑');
    await expect(page.locator('.lab-demo').getByRole('status')).toHaveText('写下请求，检查多行输入与工具栏。');
  });
}
