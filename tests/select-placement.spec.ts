import { expect, test } from '@playwright/test';

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`Select anchors its popup outside the trigger: ${theme}/${density}`, async ({ page }) => {
    await page.goto('/?layer=basic&component=select');
    await page.evaluate(({ theme, density }) => {
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.density = density;
    }, { theme, density });
    const trigger = page.getByRole('combobox', { name: '选择执行位置', exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const popup = page.locator('[data-slot="select-content"]');
    await expect(popup).toBeVisible();
    await expect(popup).toHaveAttribute('data-align-trigger', 'false');
    await expect.poll(async () => {
      const a = (await trigger.boundingBox())!;
      const b = (await popup.boundingBox())!;
      return Math.abs(a.x - b.x) < 2 && (b.y >= a.y + a.height || b.y + b.height <= a.y);
    }).toBe(true);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await trigger.press('ArrowDown');
    await page.getByRole('option', { name: '隔离工作区', exact: true }).click();
    await expect(trigger).toContainText('隔离工作区');
    await trigger.click();
    await expect(popup).toBeVisible();
    const a = (await trigger.boundingBox())!;
    await expect.poll(async () => {
      const b = (await popup.boundingBox())!;
      return b.y >= a.y + a.height || b.y + b.height <= a.y;
    }).toBe(true);
  });
}
