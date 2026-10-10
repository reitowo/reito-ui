import { test, expect } from '@playwright/test';

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test('shared insets, button edges and stable scroll boundary: ' + theme + '/' + density, async ({ page }) => {
    test.setTimeout(120_000);
    await page.addInitScript(({ theme, density }) => {
      localStorage.setItem('reito-theme', theme); localStorage.setItem('reito-density', density);
    }, { theme, density });
    await page.setViewportSize({ width: 1303, height: 1244 });
    const x = density === 'compact' ? '12px' : '16px';
    const y = density === 'compact' ? '8px' : '12px';
    const menuY = density === 'compact' ? '8px' : '10px';
    for (const id of ['alert', 'card']) {
      await page.goto('/?layer=basic&component=' + id);
      const surfaces = page.locator(id === 'alert' ? '[data-slot="alert"]' : '[data-slot="card-footer"]');
      await expect(surfaces.first()).toBeVisible();
      for (const surface of await surfaces.all()) {
        await expect(surface).toHaveCSS('padding-left', id === 'card' ? (density === 'compact' ? '16px' : '20px') : x);
        await expect(surface).toHaveCSS('padding-right', id === 'card' ? (density === 'compact' ? '16px' : '20px') : x);
        await expect(surface).toHaveCSS('padding-top', id === 'card' ? (density === 'compact' ? '12px' : '16px') : y);
        await expect(surface).toHaveCSS('padding-bottom', id === 'card' ? (density === 'compact' ? '12px' : '16px') : y);
      }
    }
    await page.locator('.lab-demo').screenshot({ path: '.logs/feedback-card-' + theme + '-' + density + '.png' });
    await page.goto('/?layer=basic&component=alert');
    await page.locator('[role="alert"]').first().waitFor();
    await page.locator('.lab-demo').screenshot({ path: '.logs/feedback-alert-' + theme + '-' + density + '.png' });
    for (const id of ['context-menu', 'dropdown-menu', 'menubar']) {
      await page.goto('/?layer=basic&component=' + id);
      const trigger = page.locator('[data-slot="' + id + '-trigger"]').first();
      await trigger.click(id === 'context-menu' ? { button: 'right' } : {});
      const item = page.locator('[data-slot="' + id + '-item"]').first();
      await expect(item).toBeVisible();
      await expect(item).toHaveCSS('padding-left', x);
      await expect(item).toHaveCSS('padding-right', x);
      await expect(item).toHaveCSS('padding-top', menuY);
      await expect(item).toHaveCSS('font-size', '14px');
      await expect(item).toHaveCSS('height', density === 'compact' ? '36px' : '40px');
      await expect(item).toHaveCSS('border-radius', '6px');
      if (id === 'context-menu') await page.locator('[data-slot="context-menu-content"]').screenshot({ path: '.logs/feedback-menu-' + theme + '-' + density + '.png' });
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Escape');
      await expect(item).toBeHidden();
    }
    for (const id of ['select','combobox','async-combobox']) {
      await page.goto('/?layer=basic&component=' + id);
      const trigger=page.getByRole('combobox').first();
      const triggerHeight=await trigger.evaluate(n=>n.getBoundingClientRect().height);
      await trigger.click();
      const item=page.locator('[data-slot="' + (id === 'select' ? 'select-item' : 'combobox-item') + '"]').first();
      await expect(item).toBeVisible();
      await expect(item).toHaveCSS('font-size','14px');
      await expect(item).toHaveCSS('padding-top',menuY);
      await expect(item).toHaveCSS('padding-bottom',menuY);
      expect(await trigger.evaluate(n=>n.getBoundingClientRect().height)).toBe(triggerHeight);
      if (id === 'async-combobox') await page.locator('[data-slot=combobox-content]').screenshot({path:'.logs/popup-density-' + theme + '-' + density + '.png'});
      await page.keyboard.press('Escape');
    }
    for (const id of ['button', 'spinner', 'toggle', 'input-group']) {
      await page.goto('/?layer=basic&component=' + id);
      const buttons = page.locator(id === 'toggle' ? '[data-slot="toggle"]' : '.lab-demo [data-rui-button]');
      await expect(buttons.first()).toBeVisible();
      for (const button of await buttons.all()) await expect(button).toHaveCSS('border-radius', '6px');
    }
    await page.goto('/?layer=basic&component=button-group');
    const groupButtons = page.locator('[data-slot="button-group"] [data-slot="button"]');
    await expect(groupButtons.first()).toHaveCSS('border-top-left-radius', '6px');
    await expect(groupButtons.first()).toHaveCSS('border-top-right-radius', '0px');
    await expect(groupButtons.last()).toHaveCSS('border-top-left-radius', '0px');
    await expect(groupButtons.last()).toHaveCSS('border-top-right-radius', '6px');
    await page.goto('/?layer=basic&component=scroll-area');
    const root = page.locator('[data-slot="scroll-area"]');
    const viewport = page.locator('[data-slot="scroll-area-viewport"]');
    await expect(root).toHaveAttribute('data-variant', 'inset');
    const geometry = () => viewport.evaluate(node => {
      const outer = node.parentElement!.getBoundingClientRect(), inner = node.getBoundingClientRect();
      return { top: inner.top - outer.top, left: inner.left - outer.left, bottom: outer.bottom - inner.bottom, right: outer.right - inner.right };
    });
    await expect(root).toHaveCSS('padding-left', x);
    await expect(root).toHaveCSS('padding-top', '4px');
    const before = await geometry();
    const border = await root.evaluate(node => parseFloat(getComputedStyle(node).borderTopWidth));
    expect(before.top).toBe(4 + border);
    expect(before.left).toBe(parseFloat(x) + border);
    expect(before.bottom).toBeCloseTo(before.top);
    expect(before.right).toBeCloseTo(before.left);
    await viewport.click();
    await page.keyboard.press('End');
    await expect.poll(() => viewport.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
    expect(await geometry()).toEqual(before);
    await root.screenshot({ path: '.logs/feedback-scroll-bottom-' + theme + '-' + density + '.png' });
    await page.keyboard.press('Home');
    await expect.poll(() => viewport.evaluate(node => node.scrollTop)).toBe(0);
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--rui-compact-surface-padding-x', '20px');
      document.documentElement.style.setProperty('--rui-component-scroll-area-padding-y', '5px');
    });
    await expect(root).toHaveCSS('padding-left', '20px');
    await expect(root).toHaveCSS('padding-top', '5px');
  });
}
