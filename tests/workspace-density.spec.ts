import { test, expect } from '@playwright/test';

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`workspace directory keyboard and pointer controls ${theme} ${density}`, async ({ page }) => {
    await page.addInitScript(({ theme, density }) => {
      localStorage.setItem('reito-theme', theme);
      localStorage.setItem('reito-density', density);
    }, { theme, density });
    await page.goto('/?layer=complex&component=workspace');
    const tree = page.getByRole('navigation', { name: '文件目录', exact: true });
    const src = tree.locator('summary').filter({ hasText: /^src$/ });
    await src.focus();
    await page.keyboard.press('Enter');
    await expect(src.locator('..')).not.toHaveAttribute('open');
    await expect(tree.getByRole('button', { name: 'button.tsx', exact: true })).toBeHidden();
    await page.keyboard.press('Space');
    await expect(src.locator('..')).toHaveAttribute('open');
    const input = tree.getByRole('button', { name: 'input.tsx', exact: true });
    await input.focus();
    await page.keyboard.press('Enter');
    await expect(input).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('region', { name: '文件预览', exact: true }).getByRole('heading', { name: 'input', exact: true })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(tree.getByRole('button', { name: 'App.tsx', exact: true })).toBeFocused();
    await expect(tree.getByRole('button', { name: 'private.tsx', exact: true })).toBeDisabled();
    const separator = page.getByRole('separator', { name: '调整文件目录与文件预览的大小' });
    const directory = page.getByRole('region', { name: '文件目录', exact: true });
    const before = (await directory.boundingBox())!.width;
    const handle = (await separator.boundingBox())!;
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    await page.mouse.move(handle.x + handle.width / 2 + 80, handle.y + handle.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect.poll(async () => (await directory.boundingBox())!.width).toBeGreaterThan(before + 40);
    const dragged = (await directory.boundingBox())!.width;
    await separator.focus();
    await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => (await directory.boundingBox())!.width).toBeLessThan(dragged);
    await expect(separator).toBeFocused();
  });
}
