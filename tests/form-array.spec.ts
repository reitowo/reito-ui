import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function open(page: Page, extra = '', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=复杂-form-表单管理--array-playground&viewMode=story&args=initialCount:2;showFieldState:true;${extra}&globals=${globals}`);
  await expect(page.getByRole('form', { name: '联系人设置' })).toBeVisible();
  return { rows: page.locator('[data-field-id]'), save: page.getByRole('button', { name: '保存联系人' }), reset: page.getByRole('button', { name: '重置', exact: true }) };
}
test('move keeps item identity, touched and error with the edited item', async ({ page }) => {
  const f = await open(page);
  const id = await f.rows.nth(1).getAttribute('data-field-id');
  await f.rows.nth(1).getByRole('textbox').fill('invalid');
  await f.rows.nth(1).getByRole('textbox').press('Tab');
  await f.save.click();
  await expect(f.rows.nth(1).getByRole('alert')).toHaveText('请输入有效邮箱');
  await page.getByRole('button', { name: '上移联系人 2' }).click();
  await expect(f.rows.nth(0)).toHaveAttribute('data-field-id', id!);
  await expect(f.rows.nth(0).getByRole('textbox')).toHaveValue('invalid');
  await expect(f.rows.nth(0).getByRole('alert')).toHaveText('请输入有效邮箱');
  await expect(f.rows.nth(0).locator('[data-touched]')).toHaveAttribute('data-touched', 'true');
  await expect(f.rows.nth(0).locator('[data-dirty]')).toHaveAttribute('data-dirty', 'true');
  await expect(f.rows.nth(1).getByRole('alert')).toHaveCount(0);
});
test('remove keeps surviving state and restores a useful keyboard focus', async ({ page }) => {
  const f = await open(page);
  const survivor = await f.rows.nth(1).getAttribute('data-field-id');
  await f.rows.nth(1).getByRole('textbox').fill('bad'); await f.save.click();
  await page.getByRole('button', { name: '移除联系人 1' }).click();
  await expect(f.rows).toHaveCount(1);
  await expect(f.rows.first()).toHaveAttribute('data-field-id', survivor!);
  await expect(f.rows.first().getByRole('textbox')).toBeFocused();
  await expect(f.rows.first().getByRole('alert')).toHaveText('请输入有效邮箱');
  await page.getByRole('button', { name: '移除联系人 1' }).click();
  await expect(page.getByRole('button', { name: '添加联系人' })).toBeFocused();
  await expect(page.getByText('暂无联系人，添加后可继续填写。')).toBeVisible();
  await f.save.click();
  await expect(page.getByRole('alert')).toHaveText('至少添加一个联系人');
  await expect(page.getByRole('button', { name: '添加联系人' })).toBeFocused();
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`${theme}/${density}: keyboard array editing in a narrow pane`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    const f = await open(page, '', `theme:${theme};density:${density}`);
    const move = page.getByRole('button', { name: '上移联系人 2' });
    await move.focus(); await move.press('Enter');
    await expect(f.rows.first().getByRole('textbox')).toHaveValue('contact2@example.com');
    await page.getByRole('button', { name: '移除联系人 1' }).focus();
    await page.keyboard.press('Enter');
    await expect(f.rows.first().getByRole('textbox')).toBeFocused();
    await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
    expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `.logs/form-array/${theme}-${density}.png`, fullPage: true });
  });
}

test('array Controls change initial data, state display and read-only in the same story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent('复杂-form-表单管理--array-playground')}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('form', { name: '联系人设置' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-initialCount"]').fill('0');
  await expect(frame.getByText('暂无联系人，添加后可继续填写。')).toBeVisible();
  await page.locator('[id="control-initialCount"]').fill('2');
  await expect(frame.locator('[data-field-id]')).toHaveCount(2);
  await page.locator('label[for="control-showFieldState"]').click();
  await expect(frame.locator('[data-touched]')).toHaveCount(2);
  await page.locator('label[for="control-readOnly"]').click();
  await expect(frame.getByRole('button', { name: '添加联系人' })).toBeDisabled();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});
test('reset restores nested defaults, array order and field metadata', async ({ page }) => {
  const f = await open(page);
  await page.getByRole('textbox', { name: '工作区名称' }).fill('x');
  await f.rows.nth(1).getByRole('textbox').fill('bad'); await f.save.click();
  await page.getByRole('button', { name: '上移联系人 2' }).click();
  await page.getByRole('button', { name: '添加联系人' }).click();
  await f.reset.click();
  await expect(f.rows).toHaveCount(2);
  await expect(f.rows.nth(0).getByRole('textbox')).toHaveValue('reito@example.com');
  await expect(f.rows.nth(1).getByRole('textbox')).toHaveValue('contact2@example.com');
  await expect(page.getByRole('textbox', { name: '工作区名称' })).toHaveValue('研究工作区');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('[data-touched="true"], [data-dirty="true"]')).toHaveCount(0);
});
test('read-only recipe preserves values and prevents structural editing', async ({ page }) => {
  const f = await open(page, 'readOnly:true');
  await expect(f.rows.first().getByRole('textbox')).toHaveAttribute('readonly', '');
  await expect(page.getByRole('button', { name: '添加联系人' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '移除联系人 1' })).toBeDisabled();
  await expect(f.save).toBeDisabled();
});

test('append preserves existing IDs and move-back restores positional dirty baseline', async ({ page }) => {
  const f = await open(page);
  const ids = await f.rows.evaluateAll(rows => rows.map(row => row.getAttribute('data-field-id')));
  await page.getByRole('button', { name: '上移联系人 2' }).click();
  await expect(page.locator('[data-dirty="true"]')).toHaveCount(2);
  await page.getByRole('button', { name: '上移联系人 2' }).click();
  await expect(page.locator('[data-dirty="true"]')).toHaveCount(0);
  await page.getByRole('button', { name: '添加联系人' }).click();
  await expect(f.rows.nth(2).getByRole('textbox')).toBeFocused();
  expect(await f.rows.evaluateAll(rows => rows.slice(0, 2).map(row => row.getAttribute('data-field-id')))).toEqual(ids);
  await f.save.click();
  await expect(f.rows.nth(2).getByRole('alert')).toHaveText('请输入有效邮箱');
  await expect(f.rows.nth(0).getByRole('alert')).toHaveCount(0);
  await expect(f.rows.nth(1).getByRole('alert')).toHaveCount(0);
});
