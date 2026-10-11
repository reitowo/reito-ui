import { expect, test, type Locator } from '@playwright/test';

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`${theme}/${density}: theme and shared menu rows keep desktop density`, async ({ page }) => {
    await page.addInitScript(({ theme, density }) => {
      localStorage.setItem('reito-theme', theme);
      localStorage.setItem('reito-density', density);
    }, { theme, density });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const rowHeight = density === 'compact' ? 28 : 32;
    async function expectRow(row: Locator) {
      await expect(row).toHaveCSS('font-size', '13px');
      await expect(row).toHaveCSS('height', `${rowHeight}px`);
      const padding = await row.evaluate(n => {
        const style = getComputedStyle(n);
        return { x: parseFloat(style.paddingLeft), y: parseFloat(style.paddingTop) };
      });
      expect(padding.x).toBeGreaterThan(padding.y);
    }

    await page.goto('/?view=overview');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveAttribute('data-density', density);
    const trigger = page.getByRole('button', { name: '主题', exact: true });
    await trigger.click();
    const primary = page.getByRole('menuitem', { name: /^主色 / });
    await expectRow(primary);
    await primary.press('ArrowRight');
    const blue = page.getByRole('menuitemradio', { name: 'Blue', exact: true });
    await expectRow(blue);
    const colors = page.locator('[data-slot=dropdown-menu-sub-content]');
    await expect(colors.getByRole('menuitemradio')).toHaveCount(18);
    // A full compact palette fits 18 rows without the former 648px column.
    const paletteHeight = await colors.evaluate(n => n.getBoundingClientRect().height);
    expect(paletteHeight).toBeLessThanOrEqual(18 * rowHeight + 8);
    await blue.press('End');
    const rose = page.getByRole('menuitemradio', { name: 'Rose', exact: true });
    await expect(rose).toBeFocused();
    await rose.press('Enter');
    await expect(rose).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();

    await page.goto('/?layer=basic&component=dropdown-menu');
    await page.getByRole('button', { name: '任务操作', exact: true }).click();
    await expectRow(page.getByRole('menuitem', { name: /复制链接/ }));
    await expectRow(page.getByRole('menuitemcheckbox', { name: '置顶任务', exact: true }));
    await expect(page.getByRole('menuitem', { name: '发布到云端', exact: true })).toBeDisabled();
    await page.keyboard.press('Escape');

    await page.goto('/?layer=basic&component=context-menu');
    await page.getByText('在此区域右键', { exact: true }).click({ button: 'right' });
    await expectRow(page.getByRole('menuitem', { name: '打开任务', exact: true }));
    await page.keyboard.press('Escape');

    await page.goto('/?layer=basic&component=select');
    await page.getByRole('combobox', { name: '选择执行位置', exact: true }).click();
    await expectRow(page.getByRole('option', { name: '本地工作区', exact: true }));
  });
}
