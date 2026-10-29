import { expect, test, type Locator } from '@playwright/test';

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`validation fades inward without geometry changes: ${theme}/${density}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${process.env.REITO_STORYBOOK_URL || 'http://127.0.0.1:6007'}/iframe.html?id=基础-input--validation-glow&viewMode=story&globals=theme:${theme};density:${density}`);
    const input = page.getByRole('textbox', { name: '渐变输入框', exact: true });
    const textarea = page.getByRole('textbox', { name: '渐变多行输入', exact: true });
    const select = page.getByRole('combobox', { name: '渐变选择器', exact: true });
    const groupedInput = page.getByRole('textbox', { name: '渐变组合输入', exact: true });
    const group = page.locator('[data-slot=input-group]');
    const number = page.locator('[data-slot=number-field-group]');
    const toggle = page.getByRole('checkbox', { name: '显示错误状态' });
    await expect(input).toBeVisible();
    async function shadow(node: Locator) { return node.evaluate(n => getComputedStyle(n).boxShadow); }
    const controls = [input, textarea, select, group, number];
    const sizes = await Promise.all(controls.map(node => node.evaluate(n => ({ w:n.getBoundingClientRect().width, h:n.getBoundingClientRect().height }))));
    for (const node of controls) {
      await expect.poll(() => shadow(node)).toContain('inset');
      expect((await shadow(node)).match(/inset/g)).toHaveLength(1);
    }
    await expect(groupedInput).toHaveCSS('box-shadow', 'none');
    const unfocusedShadow = await shadow(input);
    await input.fill('错误切换不丢草稿');
    await toggle.focus();
    await toggle.press('Tab');
    await expect(input).toBeFocused();
    expect(await input.evaluate(n => n.matches(':focus-visible'))).toBe(true);
    await expect.poll(() => shadow(input)).toContain('inset');
    expect(await shadow(input)).not.toBe(unfocusedShadow);
    await page.screenshot({path:`.logs/validation-glow-${theme}-${density}.png`});
    await toggle.uncheck();
    for (const node of controls) expect(await shadow(node)).not.toContain('inset');
    await expect(input).toHaveValue('错误切换不丢草稿');
    for (let index = 0; index < controls.length; index++) {
      expect(await controls[index].evaluate(n => ({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height}))).toEqual(sizes[index]);
    }
    await select.click();
    await page.getByRole('option', {name:'隔离工作区',exact:true}).click();
    await expect(select).toContainText('隔离工作区');
    await toggle.check();
    await page.evaluate(() => document.documentElement.style.setProperty('--rui-validation-glow-blur', '4px'));
    await expect.poll(() => shadow(input)).toMatch(/4px 1px inset/);
    await page.emulateMedia({forcedColors:'active'});
    await expect(input).toHaveCSS('box-shadow', 'none');
    await toggle.focus();
    await toggle.press('Tab');
    await expect(input).toHaveCSS('outline-style', 'solid');
    await expect(input).toHaveCSS('outline-width', '1px');
  });
}
