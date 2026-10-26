import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) for (const density of ['compact', 'comfortable', 'dense']) {
  test(`compiled consumer needs no application CSS: ${theme}/${density}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/?theme=${theme}&density=${density}`);
    const height = { compact: 32, comfortable: 36, dense: 24 }[density]!;
    const inset = { compact: 12, comfortable: 16, dense: 8 }[density]!;
    const empty = { compact: 24, comfortable: 32, dense: 16 }[density]!;
    const input = page.getByLabel('消息内容', { exact: true });
    const select = page.getByRole('combobox', { name: '范围' });
    const action = page.getByRole('button', { name: '查询', exact: true });
    for (const control of [input, select, action]) {
      await expect(control).toHaveCSS('height', `${height}px`);
      await expect(control).toHaveCSS('border-radius', '6px');
      await expect(control).toHaveCSS('font-size', density === 'dense' ? '12px' : '13px');
    }
    await expect(select).toContainText('全部会话');
    await input.fill('输入草稿');
    await select.click();
    const mine = page.getByRole('option', { name: '我的会话', exact: true });
    await expect(mine).toBeVisible();
    const portal = mine.locator('xpath=ancestor::*[@data-rui-theme="portal"]');
    await expect(portal).toHaveAttribute('data-theme', theme);
    await mine.click();
    await expect(select).toContainText('我的会话');
    await select.click();
    await page.getByRole('option', { name: '全部会话', exact: true }).click();
    await expect(select).toContainText('全部会话');
    await expect(input).toHaveValue('输入草稿');
    await action.click();
    await expect(page.getByText('已应用本地查询：输入草稿')).toBeVisible();
    await expect(page.locator('[data-slot=panel-body]').first()).toHaveCSS('padding', `${inset}px`);
    await expect(page.locator('[data-slot=panel-body][data-flush]').first()).toHaveCSS('padding', '0px');
    await expect(page.locator('[data-slot=empty]')).toHaveCSS('padding', `${empty}px`);
    await expect(page.getByTestId('mono')).toHaveCSS('font-family', /Cascadia Code/);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.dev/composition-${theme}-${density}.png` });
    await page.setViewportSize({ width: 390, height: 900 });
    await expect(input).toHaveValue('输入草稿');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.dev/composition-${theme}-${density}-narrow.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

test('theme overrides reach composition slots and do not double inset lists', async ({ page }) => {
  await page.goto('/?theme=light&customized');
  await expect(page.locator('[data-slot=panel]').first()).toHaveCSS('border-radius', '12px');
  await expect(page.locator('[data-slot=panel-body]').first()).toHaveCSS('padding', '20px');
  await expect(page.locator('[data-slot=item]').first()).toHaveCSS('padding', '20px');
  await expect(page.locator('[data-slot=item-group]')).toHaveCSS('row-gap', '0px');
  await expect(page.locator('[data-slot=panel-body][data-flush]').first()).toHaveCSS('padding', '0px');
});
