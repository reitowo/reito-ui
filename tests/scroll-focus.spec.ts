import { expect, test } from '@playwright/test';

const surfaces = [
  { name: 'Conversation', url: '/?layer=ai&component=conversation', selector: '[role="region"][aria-label="本地示例对话"]' },
  { name: 'WorkspacePane', url: '/?layer=complex&component=workspace', selector: '[data-slot="workspace-pane-body"]', index: 1 },
  { name: 'ScrollArea', url: '/?layer=basic&component=scroll-area', selector: '[data-slot="scroll-area-viewport"]' },
];

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  for (const surface of surfaces) test(`${surface.name}: quiet pointer and visible keyboard focus (${theme}/${density})`, async ({ page }, testInfo) => {
    await page.addInitScript(({ theme, density }) => { localStorage.setItem('reito-theme', theme); localStorage.setItem('reito-density', density); }, { theme, density });
    await page.goto(surface.url);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveAttribute('data-density', density);
    const viewport = page.locator(surface.selector).nth(surface.index ?? 0);
    await expect(viewport).toBeVisible();
    await viewport.click({ position: { x: 10, y: 10 } });
    await expect(viewport).toBeFocused();
    await expect(viewport).toHaveCSS('outline-style', 'none');
    await expect(viewport).toHaveCSS('box-shadow', 'none');
    // Navigate out and back through the normal tab order, not a synthetic focus event.
    await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
    await expect(viewport).toBeFocused();
    await expect(viewport).toHaveCSS('outline-style', 'none');
    await expect.poll(() => viewport.evaluate(el => getComputedStyle(el).boxShadow)).toContain('inset');
    const rect = await viewport.boundingBox();
    await page.screenshot({ path: testInfo.outputPath('keyboard-focus.png') });
    await page.keyboard.press('Tab');
    await expect(viewport).not.toBeFocused();
    await expect(viewport).toHaveCSS('box-shadow', 'none');
    expect(await viewport.boundingBox()).toEqual(rect);
    // Mouse re-entry after keyboard navigation must also remain quiet.
    await viewport.click({ position: { x: 10, y: 10 } });
    await expect(viewport).toHaveCSS('box-shadow', 'none');
  });
}

test('scroll keys and forced-colors keep the viewport accessible', async ({ page }) => {
  await page.goto('/?layer=basic&component=scroll-area');
  const viewport = page.locator('[data-slot="scroll-area-viewport"]');
  await viewport.click({ position: { x: 10, y: 10 } });
  await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
  await expect(viewport).toBeFocused();
  await page.keyboard.press('End');
  await expect.poll(() => viewport.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(viewport).toHaveCSS('outline-style', 'solid');
  await expect(viewport).toHaveCSS('outline-width', '2px');
  await expect(viewport).toHaveCSS('outline-offset', '-2px');
});
