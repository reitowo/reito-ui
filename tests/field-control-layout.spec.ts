import { test, expect } from '@playwright/test';
const storybook = process.env.REITO_STORYBOOK_URL || 'http://127.0.0.1:6007';
for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`editable field actions align with controls: ${theme}/${density}`, async ({ page }) => {
    await page.goto(`${storybook}/iframe.html?id=基础-field--editable-group-layout&viewMode=story&globals=theme:${theme};density:${density}`);
    const input = page.getByRole('textbox', { name: '组名', exact: true });
    const action = page.getByRole('button', { name: '删除功能组 1', exact: true });
    await expect(input).toBeVisible();
    const inputBox = await input.boundingBox();
    const actionBox = await action.boundingBox();
    expect(inputBox).not.toBeNull(); expect(actionBox).not.toBeNull();
    expect(Math.abs(inputBox!.y + inputBox!.height / 2 - actionBox!.y - actionBox!.height / 2)).toBeLessThan(1);
    await page.getByText('组名', { exact: true }).click();
    await expect(input).toBeFocused();
    await input.press('Tab'); await expect(action).toBeFocused();
    await action.press('Enter');
    await page.getByRole('button', { name: '恢复示例功能组' }).click();
    await expect(input).toHaveValue('取证试用');
    await page.setViewportSize({ width: 360, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.logs/field-merge-${theme}-${density}.png` });
  });
}
test('outlined field groups retain error relationships and disabled controls', async ({ page }) => {
  await page.goto(`${storybook}/iframe.html?id=基础-field--editable-group-invalid&viewMode=story`);
  const input = page.getByRole('textbox', { name: '组名', exact: true });
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription('请填写组名。');
  await expect(page.getByRole('alert')).toHaveText('请填写组名。');
  await page.goto(`${storybook}/iframe.html?id=基础-field--editable-group-disabled&viewMode=story`);
  await expect(page.getByRole('textbox', { name: '组名', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '删除功能组 1', exact: true })).toBeDisabled();
});
