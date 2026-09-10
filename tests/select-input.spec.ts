import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { chooseSelectOption, storybookUrl } from './select-option';

const storyUrl = (story: string, theme = 'dark', density = 'compact') =>
  `${storybookUrl}/iframe.html?id=基础-select--${story}&viewMode=story&globals=theme:${theme};density:${density}`;

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`${theme}/${density}: the open menu inherits theme, disables unavailable choices and fits a narrow viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(storyUrl('input', theme, density));
    const input = page.getByRole('combobox', { name: '界面密度' });
    await input.click();
    await expect(page.getByRole('option', { name: '暂不可用' })).toHaveAttribute('aria-disabled', 'true');
    const menu = page.getByRole('listbox');
    await expect(menu).toBeVisible();
    expect(await menu.evaluate(element => getComputedStyle(element.closest('[data-slot="select-content"]')!).backgroundColor)).toBe(
      theme === 'dark' ? 'rgb(38, 38, 38)' : 'rgb(255, 255, 255)',
    );
    await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
    expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(input).toBeFocused();
    await input.press('ArrowDown');
    await expect(menu).toBeVisible();
    await expect(page.getByRole('option', { name: '紧凑', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: '舒适', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(input.getByText('舒适', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('select:visible')).toHaveCount(0);
  });
}

test('number options preserve their type, label association, ref focus and form serialization', async ({ page }) => {
  await page.goto(storyUrl('numeric-form'));
  const input = page.getByRole('combobox', { name: '每页记录数' });
  await page.getByRole('button', { name: '定位选择器' }).click();
  await expect(input).toBeFocused();
  await chooseSelectOption(input, '20 条');
  await expect(page.getByLabel('当前数值')).toHaveText('number:20');
  await page.getByRole('button', { name: '提交示例' }).click();
  await expect(page.getByLabel('表单结果')).toHaveText('20');
});

test('a chooser Escape closes its menu before cancelling the property draft', async ({ page }) => {
  await page.goto(`${storybookUrl}/iframe.html?id=复杂-propertylist-属性编辑--select-property&viewMode=story`);
  const edit = page.getByRole('button', { name: '编辑界面密度' });
  await edit.click();
  const input = page.getByRole('combobox', { name: '界面密度' });
  await expect(input).toBeFocused();
  await input.press('Enter');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(input).toBeFocused();
  await expect(page.getByRole('button', { name: '保存字段' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(edit).toBeFocused();
});
