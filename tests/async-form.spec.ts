import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function open(page: Page, args = 'manualResolution:true;validationMode:onSubmit', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=复杂-asyncform-异步表单--playground&viewMode=story&args=${args}&globals=${globals}`);
  await expect(page.getByRole('form', { name: '异步工作区设置' })).toBeVisible();
  return {
    name: page.getByRole('textbox', { name: '工作区名称', exact: true }),
    validate: page.getByRole('button', { name: '校验当前值', exact: true }),
    reset: page.getByRole('button', { name: '重置当前记录', exact: true }),
    save: page.getByRole('button', { name: '保存设置', exact: true }),
    status: page.getByRole('status'),
    reply: (id: number) => page.getByRole('button', { name: `返回请求 ${id}`, exact: true }),
  };
}
test('ABA: older same-value error cannot finish a newer validation', async ({ page }) => {
  const f = await open(page);
  await f.name.fill('已占用'); await f.validate.click();
  await f.name.fill('中间值'); await f.name.fill('已占用'); await f.validate.click();
  await f.reply(1).click();
  await expect(f.status).toContainText('校验中');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await f.reply(2).click();
  await expect(page.getByRole('alert')).toHaveText('名称已被占用');
});
test('editing without a second validation retires the old response', async ({ page }) => {
  const f = await open(page);
  await f.name.fill('已占用'); await f.validate.click();
  await f.name.fill('可用名称'); await f.reply(1).click();
  await expect(f.status).toContainText('就绪');
  await expect(page.getByRole('alert')).toHaveCount(0);
});
test('reset during submit validation cancels submission and preserves the new baseline', async ({ page }) => {
  const f = await open(page);
  await f.name.fill('旧记录'); await f.save.click();
  await expect(f.status).toContainText('提交中');
  await f.reset.click(); await f.reply(1).click();
  await expect(f.name).toBeEnabled(); await expect(f.name).toHaveValue('Graphite');
  await expect(f.status).toContainText('提交次数 0');
  await expect(page.getByLabel('提交数据')).toHaveCount(0);
  await f.save.click(); await f.reply(2).click();
  await expect(page.getByLabel('提交数据')).toContainText('Graphite');
});
test('same-value external record replacement retires pending validation', async ({ page }) => {
  const f = await open(page);
  await f.validate.click();
  await page.getByRole('button', { name: '切换同值记录' }).click();
  await f.reply(1).click();
  await expect(f.status).toContainText('就绪');
  await expect(f.status).toContainText('未修改');
});
test('cross-field errors associate with the field and recover after editing', async ({ page }) => {
  const f = await open(page);
  const confirmation = page.getByRole('textbox', { name: '确认邮箱', exact: true });
  await confirmation.fill('different@example.com'); await f.save.click(); await f.reply(1).click();
  await expect(confirmation).toHaveAttribute('aria-invalid', 'true');
  await expect(confirmation).toBeFocused();
  await confirmation.fill('reito@example.com');
  // After an invalid submit, editing starts revalidation with the current snapshot.
  await f.reply(2).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`${theme}/${density}: narrow form and errors remain readable and accessible`, async ({ page }) => {
    const f = await open(page, 'manualResolution:true;validationMode:onSubmit', `theme:${theme};density:${density}`);
    await page.setViewportSize({ width: 390, height: 900 });
    await f.name.fill('已占用'); await f.validate.click(); await f.reply(1).click();
    await expect(page.getByRole('alert')).toHaveText('名称已被占用');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
    const violations = await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { 'region': { enabled: false } } })).violations);
    expect(violations).toEqual([]);
    await page.screenshot({ path: `.logs/form-async/${theme}-${density}.png`, fullPage: true });
  });
}

test('Controls update async behavior without changing stories', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent('复杂-asyncform-异步表单--playground')}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('form', { name: '异步工作区设置' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('label[for="control-disabled"]').click();
  await expect(frame.getByRole('textbox', { name: '工作区名称', exact: true })).toBeDisabled();
  await page.locator('label[for="control-disabled"]').click();
  await page.locator('[id="control-validationMode"]').selectOption({ label: 'onChange' });
  await frame.getByRole('textbox', { name: '工作区名称', exact: true }).fill('已占用');
  await expect(frame.getByRole('alert')).toHaveText('名称已被占用');
  await page.locator('[id="control-submitBehavior"]').selectOption({ label: 'error' });
  await frame.getByRole('textbox', { name: '工作区名称', exact: true }).fill('可用名称');
  await frame.getByRole('button', { name: '保存设置' }).click();
  await expect(frame.getByRole('alert')).toHaveText('本地保存失败');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const mode of ['onSubmit', 'onBlur', 'onChange', 'onTouched', 'all']) {
  test(`${mode}: configured validation events remain distinct`, async ({ page }) => {
    const f = await open(page, `manualResolution:true;validationMode:${mode}`);
    await f.name.fill('已占用');
    if (mode === 'onChange' || mode === 'all') {
      await expect(f.reply(1)).toBeVisible();
    } else {
      await expect(f.reply(1)).toHaveCount(0);
      await f.name.press('Tab');
      if (mode === 'onSubmit') { await expect(f.reply(1)).toHaveCount(0); await f.save.click(); }
      await expect(f.reply(1)).toBeVisible();
    }
    // Resolve the transport without a pointer-induced blur creating a second request.
    await f.reply(1).dispatchEvent('click');
    await expect(page.getByRole('alert')).toHaveText('名称已被占用');
  });
}
