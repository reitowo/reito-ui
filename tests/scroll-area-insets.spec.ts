import { expect, test } from '@playwright/test';

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`${theme}/${density}: scroll edges stay thin and file rows follow menu density`, async ({ page }) => {
    await page.addInitScript(({ theme, density }) => {
      localStorage.setItem('reito-theme', theme);
      localStorage.setItem('reito-density', density);
    }, { theme, density });
    await page.goto('/?layer=basic&component=scroll-area');
    const root = page.locator('[data-slot="scroll-area"]');
    const viewport = root.locator('[data-slot="scroll-area-viewport"]');
    await expect(viewport).toBeVisible();
    await expect(root).toHaveCSS('padding-top', '4px');
    await expect(root).toHaveCSS('padding-bottom', '4px');
    await expect(root).toHaveCSS('padding-left', density === 'compact' ? '12px' : '16px');
    const firstRow = viewport.getByText('component-01.tsx', { exact: true });
    const lastRow = viewport.getByText('component-18.tsx', { exact: true });
    await expect(firstRow).toHaveCSS('height', density === 'compact' ? '28px' : '32px');
    const size = await root.boundingBox();
    const edge = () => viewport.evaluate(n => {
      const r = n.parentElement!.getBoundingClientRect();
      const v = n.getBoundingClientRect();
      return { top: v.top - r.top, bottom: r.bottom - v.bottom, scrollTop: n.scrollTop };
    });
    const initial = await edge();
    expect(initial.top).toBeCloseTo(initial.bottom, 1);
    // The viewport remains keyboard-scrollable; fixed edge spacing is outside it.
    await viewport.focus();
    await expect(viewport).toBeFocused();
    await page.keyboard.press('PageDown');
    await expect.poll(async () => (await edge()).scrollTop).toBeGreaterThan(0);
    await expect(root).toHaveCSS('height', `${size!.height}px`);
    const middle = await edge();
    expect(middle.top).toBeCloseTo(initial.top, 1);
    expect(middle.bottom).toBeCloseTo(initial.bottom, 1);
    await page.keyboard.press('Control+End');
    await expect.poll(() => viewport.evaluate(n => n.scrollHeight - n.clientHeight - n.scrollTop)).toBeLessThan(1);
    await expect(lastRow).toBeInViewport();
    const end = await edge();
    expect(end.top).toBeCloseTo(initial.top, 1);
    expect(end.bottom).toBeCloseTo(initial.bottom, 1);
    await page.keyboard.press('Control+Home');
    await expect.poll(async () => (await edge()).scrollTop).toBe(0);
    await expect(firstRow).toBeInViewport();
    // Component aliases can be adjusted without changing row geometry.
    await root.evaluate(n => n.style.setProperty('--rui-component-scroll-area-padding-y', 'var(--rui-space-2)'));
    await expect(root).toHaveCSS('padding-top', '8px');
    await expect(firstRow).toHaveCSS('height', density === 'compact' ? '28px' : '32px');
  });
}
