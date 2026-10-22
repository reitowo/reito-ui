import { expect, test } from '@playwright/test';
import { chooseThemeDensity } from './theme-menu';

for (const theme of ['dark', 'light']) {
  test(`${theme}: density shares the theme menu, preserves demos and persists across Lab routes`, async ({ page }) => {
    await page.addInitScript(theme => {
      if (sessionStorage.getItem('density-test-ready')) return;
      localStorage.setItem('reito-theme', theme);
      localStorage.setItem('reito-density', 'compact');
      sessionStorage.setItem('density-test-ready', '1');
    }, theme);
    await page.goto('/?view=overview');
    await expect(page.getByRole('heading', { name: '全组件总览' })).toBeVisible();
    await expect(page.getByRole('button', { name: '切换组件密度' })).toHaveCount(0);
    const tile = page.locator('#component-basic-button');
    const save = tile.getByRole('button', { name: '保存更改', exact: true });
    await expect(save).toBeVisible();
    await save.click();
    await chooseThemeDensity(page, 'comfortable');
    await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');
    await expect(save).toHaveCSS('height', '32px');
    await expect(tile.getByText('已保存 1 次')).toBeVisible();
    await page.getByRole('button', { name: '主题', exact: true }).click();
    await expect(page.getByRole('menuitemradio', { name: '舒适', exact: true })).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    for (const route of ['/?layer=basic&component=input', '/?view=theme-guide', '/']) {
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');
      await expect(page.getByRole('button', { name: '切换组件密度' })).toHaveCount(0);
      await page.getByRole('button', { name: '主题', exact: true }).click();
      await expect(page.getByRole('menuitemradio', { name: '舒适', exact: true })).toHaveAttribute('aria-checked', 'true');
      await page.keyboard.press('Escape');
    }
    await page.goto('/?view=overview');
    await expect(page.getByRole('heading', { name: '全组件总览' })).toBeVisible();
    await page.getByRole('button', { name: '主题', exact: true }).click();
    await page.getByRole('menuitem', { name: '恢复默认主题', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
    await expect(page.getByRole('heading', { name: '全组件总览' })).toBeVisible();
    const saveAfterReload = page.locator('#component-basic-button').getByRole('button', { name: '保存更改', exact: true });
    await expect(saveAfterReload).toBeVisible();
    await expect(saveAfterReload).toHaveCSS('height', '28px');
  });
}
