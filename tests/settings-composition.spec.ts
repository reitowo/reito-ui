import { expect, test } from '@playwright/test';
import { storybookUrl } from './select-option';
const story = (name: string, theme = 'dark', density = 'compact') => `${storybookUrl}/iframe.html?id=复杂-settingssection-设置分组--${name}&viewMode=story&globals=theme:${theme};density:${density}`;
for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`settings ${theme}/${density}: labels, keyboard, cancellation and saved draft`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto(story('settings-dialog', theme, density));
    const dialog = page.getByRole('dialog', { name: '提醒设置' });
    const enabled = dialog.getByRole('switch', { name: '桌面提醒' });
    await expect(enabled).toBeChecked();
    await dialog.locator('label').filter({ hasText: '桌面提醒' }).click();
    await expect(enabled).not.toBeChecked();
    await expect(dialog.getByRole('switch', { name: '仅新消息' })).toBeDisabled();
    await expect(dialog.getByRole('radio').first()).toBeDisabled();
    await dialog.getByRole('button', { name: '取消', exact: true }).click();
    const trigger = page.getByRole('button', { name: '打开提醒设置' });
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(enabled).toBeChecked();
    const group = dialog.getByRole('radiogroup', { name: '提醒范围' });
    await expect(group).toHaveAccessibleDescription('选择需要提醒的消息。');
    await group.getByRole('radio', { name: '仅提及我', exact: true }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(group.getByRole('radio', { name: '提及与回复', exact: true })).toBeChecked();
    await dialog.screenshot({ path: `.logs/settings-${theme}-${density}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await dialog.getByRole('button', { name: '保存', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('已保存本地示例设置');
    await trigger.click();
    await expect(group.getByRole('radio', { name: '提及与回复', exact: true })).toBeChecked();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });
}
test('settings loading prevents saving and a load error can be retried', async ({ page }) => {
  await page.goto(story('loading-dialog'));
  await expect(page.getByRole('button', { name: '保存', exact: true })).toBeDisabled();
  await expect(page.getByText('正在读取示例设置…')).toBeVisible();
  await page.goto(story('error-dialog'));
  await expect(page.getByRole('alert')).toContainText('示例设置读取失败');
  await page.getByRole('button', { name: '重试', exact: true }).click();
  await expect(page.getByRole('switch', { name: '桌面提醒' })).toBeVisible();
  await expect(page.getByRole('button', { name: '保存', exact: true })).toBeEnabled();
});
