import { expect, test } from '@playwright/test';

test('selected color presets retain live palette references in nested scopes', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('reito-theme', 'dark');
    localStorage.setItem('reito-colors', JSON.stringify({ primary: 'blue', neutral: 'zinc' }));
  });
  await page.goto('/?view=theme-guide');
  const preview = page.getByLabel('主题效果预览');
  const save = preview.getByRole('button', { name: '保存工作区', exact: true });
  const green = page.getByRole('button', { name: '单独配色的操作', exact: true });
  await expect(save).toBeVisible();
  const before = await save.evaluate(n => getComputedStyle(n).backgroundColor);
  const greenColor = await green.evaluate(n => getComputedStyle(n).backgroundColor);
  const surface = await preview.evaluate(n => getComputedStyle(n).backgroundColor);
  expect(before).not.toBe(greenColor);
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--rui-palette-blue-300', 'var(--rui-palette-green-300)');
    document.documentElement.style.setProperty('--rui-palette-zinc-950', 'var(--rui-palette-slate-950)');
  });
  await expect(save).toHaveCSS('background-color', greenColor);
  await expect(green).toHaveCSS('background-color', greenColor);
  expect(await preview.evaluate(n => getComputedStyle(n).backgroundColor)).not.toBe(surface);
});

for (const mode of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`component tokens inherit live geometry and enter portals: ${mode}/${density}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${process.env.REITO_STORYBOOK_URL || 'http://127.0.0.1:6007'}/iframe.html?id=基础-theme--component-tokens&viewMode=story&args=mode:${mode}&globals=theme:${mode};density:${density}`);
    const example = page.getByRole('region', { name: '组件 token 继承示例' });
    const save = example.getByRole('button', { name: 'Token 示例保存', exact: true });
    const trigger = example.getByRole('button', { name: 'Token 示例菜单', exact: true });
    const nested = example.getByRole('button', { name: '嵌套继承操作', exact: true });
    const input = example.getByRole('textbox', { name: 'Token 示例工作区' });
    const initialHeight = density === 'compact' ? 32 : 36;
    const largerHeight = density === 'compact' ? 36 : 40;
    await expect(save).toHaveCSS('height', `${initialHeight}px`);
    expect(await example.evaluate(n => n.closest('[data-theme]')?.getAttribute('data-theme'))).toBe(mode);
    await expect(input).toHaveCSS('height', `${initialHeight}px`);
    await input.fill('切换尺寸仍保留草稿');
    await example.getByRole('combobox', { name: '共享动作尺寸' }).click();
    await page.getByRole('option', { name: '增加一级', exact: true }).click();
    await expect(save).toHaveCSS('height', `${largerHeight}px`);
    await expect(nested).toHaveCSS('height', `${largerHeight}px`);
    await trigger.click();
    const open = page.getByRole('menuitem', { name: '打开工作区', exact: true });
    await expect(open).toHaveCSS('height', `${largerHeight}px`);
    await expect(open).toHaveCSS('padding-top', `${(largerHeight - 20) / 2}px`);
    expect(await page.getByRole('menuitem', { name: /带说明的操作/ }).evaluate(n => n.getBoundingClientRect().height)).toBeGreaterThan(largerHeight);
    await expect(page.getByRole('menuitem', { name: '暂不可用', exact: true })).toBeDisabled();
    await open.focus();
    await open.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: '查看设置' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await example.getByRole('checkbox', { name: '仅按钮覆盖为 XS' }).check();
    await expect(save).toHaveCSS('height', density === 'compact' ? '24px' : '28px');
    await expect(nested).toHaveCSS('height', density === 'compact' ? '24px' : '28px');
    await trigger.click();
    await expect(open).toHaveCSS('height', `${largerHeight}px`);
    await page.keyboard.press('Escape');
    await example.getByRole('checkbox', { name: '卡片使用紧凑面板内距' }).check();
    const card = example.getByLabel('局部 token 卡片');
    for (const slot of ['card-header', 'card-content', 'card-footer']) {
      await expect(card.locator(`[data-slot=${slot}]`)).toHaveCSS('padding-left', density === 'compact' ? '12px' : '16px');
      await expect(card.locator(`[data-slot=${slot}]`)).toHaveCSS('padding-top', density === 'compact' ? '8px' : '10px');
    }
    // Controls outside the scope retain the original density.
    await expect(example.getByRole('button', { name: '重置尺寸示例' })).toHaveCSS('height', `${initialHeight}px`);
    await expect(input).toHaveValue('切换尺寸仍保留草稿');
    await page.screenshot({ path: `.logs/component-tokens-${mode}-${density}.png` });
    await example.getByRole('button', { name: '重置尺寸示例' }).click();
    await expect(save).toHaveCSS('height', `${initialHeight}px`);
    expect(errors).toEqual([]);
  });
}

for (const mode of ['dark', 'light']) test(`one radius base scales control, surface and menu radii together: ${mode}`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${process.env.REITO_STORYBOOK_URL || 'http://127.0.0.1:6007'}/iframe.html?id=基础-theme--component-tokens&viewMode=story&args=mode:${mode}&globals=theme:${mode}`);
  const example = page.getByRole('region', { name: '组件 token 继承示例' });
  const save = example.getByRole('button', { name: 'Token 示例保存', exact: true });
  const input = example.getByRole('textbox', { name: 'Token 示例工作区' });
  const card = example.getByLabel('局部 token 卡片');
  const outside = example.getByRole('button', { name: '重置尺寸示例' });
  const trigger = example.getByRole('button', { name: 'Token 示例菜单', exact: true });
  const expectRadii = async (control: string, surface: string, item: string) => {
    await expect(save).toHaveCSS('border-radius', control);
    await expect(input).toHaveCSS('border-radius', control);
    await expect(card).toHaveCSS('border-radius', surface);
    await trigger.click();
    await expect(page.locator('[data-slot=dropdown-menu-content]')).toHaveCSS('border-radius', surface);
    await expect(page.getByRole('menuitem', { name: '打开工作区', exact: true })).toHaveCSS('border-radius', item);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  };
  await expectRadii('6px', '8px', '4px');
  await example.getByRole('combobox', { name: '全局圆角' }).click();
  await page.getByRole('option', { name: '柔和 0.375rem', exact: true }).click();
  await expectRadii('9px', '12px', '6px');
  await expect(outside).toHaveCSS('border-radius', '6px');
  await example.getByRole('combobox', { name: '全局圆角' }).click();
  await page.getByRole('option', { name: '方正 0.125rem', exact: true }).click();
  await expectRadii('3px', '4px', '2px');
  await outside.click();
  await expectRadii('6px', '8px', '4px');
});

test('raw --rui-radius on the document rescales control and surface roles', async ({ page }) => {
  await page.goto('/?layer=basic&component=card');
  const card = page.locator('[data-slot=card]').first();
  const button = card.locator('[data-slot=button]').first();
  await expect(card).toHaveCSS('border-radius', '8px');
  await expect(button).toHaveCSS('border-radius', '6px');
  await page.evaluate(() => document.documentElement.style.setProperty('--rui-radius', '0.5rem'));
  await expect(card).toHaveCSS('border-radius', '16px');
  await expect(button).toHaveCSS('border-radius', '12px');
});

test('raw CSS base aliases remain live at the document and density scopes', async ({ page }) => {
  await page.goto('/?layer=basic&component=button');
  const save = page.getByRole('button', { name: '保存更改', exact: true });
  await page.evaluate(() => { document.documentElement.style.setProperty('--rui-control-height', '34px'); document.documentElement.style.setProperty('--rui-control-height-sm', '34px'); });
  await expect(save).toHaveCSS('height', '34px');
  await page.goto('/?layer=basic&component=dropdown-menu');
  await page.evaluate(() => { document.documentElement.style.setProperty('--rui-control-height', '34px'); document.documentElement.style.setProperty('--rui-control-height-sm', '34px'); });
  await page.getByRole('button', { name: '任务操作', exact: true }).click();
  await expect(page.getByRole('menuitemcheckbox', { name: '置顶任务' })).toHaveCSS('height', '34px');
  await page.evaluate(() => document.documentElement.style.setProperty('--rui-line-interface', '22px'));
  await expect(page.getByRole('menuitemcheckbox', { name: '置顶任务' })).toHaveCSS('height', '34px');
  await expect(page.getByRole('menuitemcheckbox', { name: '置顶任务' })).toHaveCSS('padding-top', '6px');
  await page.goto('/?layer=basic&component=select');
  const select = page.getByRole('combobox', { name: '选择执行位置', exact: true });
  await expect(select).toBeVisible();
  await page.evaluate(() => document.documentElement.style.setProperty('--rui-component-menu-item-height', '24px'));
  await select.click();
  await expect(page.getByRole('option', { name: '本地工作区', exact: true })).toHaveCSS('height', '24px');
});
