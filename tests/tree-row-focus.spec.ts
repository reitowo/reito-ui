import { test, expect } from '@playwright/test';

for (const theme of ['dark','light']) for (const density of ['compact','comfortable']) {
  test('tree focus stays on one row and pointer selection stays quiet: ' + theme + '/' + density, async ({ page }) => {
    await page.addInitScript(({ theme, density }) => { localStorage.setItem('reito-theme', theme); localStorage.setItem('reito-density', density); }, { theme, density });
    await page.goto('/?layer=complex&component=tree-view');
    const tree = page.getByRole('tree', { name: '项目树' });
    const branch = tree.getByRole('treeitem', { name: 'components', exact: true });
    const row = branch.locator(':scope > [data-slot="tree-item-row"]');
    await row.click();
    await expect(branch).toBeFocused();
    await expect(row).toHaveCSS('box-shadow', 'none');
    await page.keyboard.press('ArrowRight');
    const file = tree.getByRole('treeitem', { name: 'button.tsx', exact: true });
    await expect(file).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(branch).toBeFocused();
    await expect(row).toHaveCSS('outline-style', 'none');
    const cue = await row.evaluate(node => getComputedStyle(node).boxShadow);
    expect(cue).toContain('0px 0px 0px 1px inset');
    const neutral = await row.evaluate(node => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--rui-text-muted)'; node.append(probe);
      const value = getComputedStyle(probe).color; probe.remove(); return value;
    });
    expect(cue).toContain(neutral);
    const shadows = await tree.locator('[data-slot="tree-item-row"]').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).boxShadow));
    expect(shadows.filter(shadow => shadow !== 'none')).toHaveLength(1);
    const childRows = branch.locator('[role="group"] [data-slot="tree-item-row"]');
    for (const child of await childRows.all()) await expect(child).toHaveCSS('box-shadow','none');
    await tree.screenshot({ path: '.logs/tree-focus-neutral-' + theme + '-' + density + '.png' });
    await page.keyboard.press('ArrowRight');
    await expect(file).toBeFocused();
    const fileRow = file.locator(':scope > [data-slot="tree-item-row"]');
    await expect(row).toHaveCSS('box-shadow','none');
    expect(await fileRow.evaluate(node => getComputedStyle(node).boxShadow)).toContain('inset');
    await page.keyboard.press('Enter');
    await expect(file).toHaveAttribute('aria-selected','true');
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(fileRow).toHaveCSS('outline-style','solid');
    for (const child of await childRows.all()) {
      if (await child.evaluate(node => node.parentElement?.matches(':focus-visible'))) continue;
      await expect(child).toHaveCSS('outline-style','none');
    }
    await page.emulateMedia({ forcedColors: 'none' });
    await page.goto('/?layer=complex&component=disclosure-tree');
    const nav = page.locator('[data-slot="disclosure-tree"]');
    const summary = nav.locator('summary').nth(1);
    await summary.click();
    await expect(summary).toHaveCSS('box-shadow','none');
    await summary.press('Tab');
    await page.keyboard.press('Shift+Tab');
    expect(await summary.evaluate(node => getComputedStyle(node).boxShadow)).toContain('inset');
    await expect.poll(() => nav.locator('.rui-navigation-row').evaluateAll(nodes => nodes.filter(node => getComputedStyle(node).boxShadow !== 'none').length)).toBe(1);
  });
}
