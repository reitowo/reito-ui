import { chooseSelectOption, storybookUrl } from './select-option';
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
async function open(page: Page, args = '', globals = 'theme:dark;density:compact') {
  await page.goto(`${storybookUrl}/iframe.html?id=复杂-form-表单管理--dynamic-playground&viewMode=story&args=${args}&globals=${globals}`);
  const form = page.getByRole('form', { name: '动态工作区设置' });
  await expect(form).toBeVisible();
  return { form, mode: page.getByRole('combobox', { name: '工作区类型' }), team: page.getByRole('textbox', { name: '团队名称' }), email: page.getByRole('textbox', { name: '通知邮箱' }), notifications: page.getByRole('switch', { name: '接收通知' }), save: page.getByRole('button', { name: '保存配置' }), reset: page.getByRole('button', { name: '重置配置' }) };
}
for (const policy of ['retain', 'discard']) test(`${policy}: conditional values follow the selected hidden-field lifecycle`, async ({ page }) => {
  const f = await open(page, `hiddenValuePolicy:${policy}`);
  await chooseSelectOption(f.mode, "团队"); await f.team.fill('设计团队');
  await f.notifications.click(); await f.email.fill('design@example.com');
  await chooseSelectOption(f.mode, "个人"); await f.notifications.click();
  await expect(f.team).toHaveCount(0); await expect(f.email).toHaveCount(0);
  await f.save.click();
  await expect(page.getByLabel('配置提交数据')).toBeVisible();
  const payload = JSON.parse(await page.getByLabel('配置提交数据').innerText());
  expect(payload).toEqual({ name: 'Graphite', mode: 'personal', notifications: false });
  await chooseSelectOption(f.mode, "团队"); await f.notifications.click();
  await expect(f.team).toHaveValue(policy === 'retain' ? '设计团队' : '');
  await expect(f.email).toHaveValue(policy === 'retain' ? 'design@example.com' : '');
});
test('hidden invalid fields stop blocking submission and validate again when revealed', async ({ page }) => {
  const f = await open(page, 'initialMode:team;initialNotifications:true');
  await f.save.click();
  await expect(page.getByRole('alert')).toHaveCount(2);
  await expect(f.team).toBeFocused();
  await chooseSelectOption(f.mode, "个人"); await f.notifications.click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await f.save.click(); await expect(page.getByLabel('配置提交数据')).toBeVisible();
  await chooseSelectOption(f.mode, "团队"); await f.save.click();
  await expect(page.getByRole('alert')).toHaveText('请填写团队名称');
});
test('reset restores condition defaults and clears revealed drafts and errors', async ({ page }) => {
  const f = await open(page);
  await chooseSelectOption(f.mode, "团队"); await f.team.fill('草稿');
  await f.notifications.click(); await f.email.fill('bad'); await f.save.click();
  await expect(page.getByRole('alert')).toHaveText('请输入有效通知邮箱');
  await f.reset.click();
  await expect(f.mode.locator('[data-slot="select-value"]')).toHaveText('个人'); await expect(f.notifications).not.toBeChecked();
  await expect(f.team).toHaveCount(0); await expect(page.getByRole('alert')).toHaveCount(0);
  await chooseSelectOption(f.mode, "团队"); await expect(f.team).toHaveValue('');
});
test('disabled dynamic form blocks condition changes and submission', async ({ page }) => {
  const f = await open(page, 'disabled:true');
  await expect(f.mode).toBeDisabled(); await expect(f.notifications).toBeDisabled(); await expect(f.save).toBeDisabled();
});
for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: visible conditional fields fit the narrow working surface`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const f = await open(page, 'initialMode:team;initialNotifications:true', `theme:${theme};density:${density}`);
  await f.save.click(); await expect(page.getByRole('alert')).toHaveCount(2);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/form-dynamic/${theme}-${density}.png`, fullPage: true });
});
test('Controls change defaults and allow failed submission recovery without switching story', async ({ page }) => {
  await page.goto(`${storybookUrl}/?path=/story/${encodeURIComponent('复杂-form-表单管理--dynamic-playground')}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('form', { name: '动态工作区设置' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-initialMode"]').selectOption({ label: 'team' });
  await frame.getByRole('textbox', { name: '团队名称' }).fill('团队草稿');
  await page.locator('[id="control-submitBehavior"]').selectOption({ label: 'error' });
  await frame.getByRole('button', { name: '保存配置' }).click();
  await expect(frame.getByRole('alert')).toHaveText('本地保存失败');
  await expect(frame.getByRole('textbox', { name: '团队名称' })).toHaveValue('团队草稿');
  await page.locator('[id="control-submitBehavior"]').selectOption({ label: 'success' });
  await frame.getByRole('button', { name: '保存配置' }).click();
  await expect(frame.getByLabel('配置提交数据')).toContainText('团队草稿');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});
