import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
async function expectNoAxeViolations(page: Page) {
  await page.addScriptTag({ content: axe });
  const violations = await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map((item: any) => `${item.id}: ${item.nodes.map((node: any) => node.target.join(' ')).join(', ')}`));
  expect(violations).toEqual([]);
}

for (const theme of ['dark', 'light']) {
  test(`${theme}/dense: proof desk keeps dense chrome without showcase widgets`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?view=dense&page=trace&theme=${theme}`);
    await expect(page.locator('html')).toHaveAttribute('data-density', 'dense');
    await expect(page.locator('.reito-root > header')).toHaveCSS('height', '28px');
    await expect(page.locator('main h1').locator('..')).toHaveCSS('height', '32px');
    await expect(page.locator('main h1')).toHaveCSS('font-size', '12px');
    await expect(page.locator('main h1')).toHaveCSS('font-weight', '600');
    await expect(page.locator('main h1')).toHaveText('校样');
    await expect(page.locator('[data-slot=tool-call]')).toHaveCount(0);
    await expect(page.locator('[data-slot=mini-timeline]')).toHaveCount(0);
    await expect(page.getByText('油墨未干')).toBeVisible();
    expect(await page.evaluate(() => [...document.querySelectorAll('main *')].filter((el) => [...el.childNodes].some((node) => node.nodeType === 3 && node.textContent!.trim()) && parseFloat(getComputedStyle(el).fontSize) > 12).length)).toBe(0);
    await expectNoAxeViolations(page);
  });
}

for (const density of ['compact', 'comfortable', 'dense'] as const) {
  test(`${density}: menus keep concentric popup geometry and keyboard behavior`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript((value) => localStorage.setItem('reito-density', value), density);
    await page.goto('/?layer=basic&component=dropdown-menu');
    const trigger = page.getByTestId('component-preview').getByRole('button').first();
    await trigger.click();
    const popup = page.locator('[data-slot=dropdown-menu-content]');
    await expect(popup).toHaveCSS('border-radius', '8px');
    await expect(popup).toHaveCSS('padding-top', '4px');
    const item = popup.locator('[data-slot=dropdown-menu-item]').first();
    await expect(item).toHaveCSS('border-radius', '4px');
    await expect(item).toHaveCSS('padding-left', { compact: '16px', comfortable: '20px', dense: '12px' }[density]);
    await expect(item).toHaveCSS('height', { compact: '32px', comfortable: '36px', dense: '24px' }[density]);
    await expect(popup.locator('[data-slot=dropdown-menu-separator]').first()).toHaveCSS('margin-left', '4px');
    await page.keyboard.press('ArrowDown');
    await expect(popup.getByRole('menuitem').first()).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--rui-motion-duration').trim())).toBe('0ms');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--rui-motion-popup-scale').trim())).toBe('1');
    const highlighted = await item.evaluate((el) => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--rui-hover)';
      document.body.append(probe);
      const hover = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return { item: getComputedStyle(el).backgroundColor, hover };
    });
    expect(highlighted.item).toBe(highlighted.hover);
    await page.keyboard.press('Escape');
    await expect(popup).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}

test('menu popup uses motion tokens when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?layer=basic&component=dropdown-menu');
  const trigger = page.getByTestId('component-preview').getByRole('button').first();
  await trigger.click();
  const popup = page.locator('[data-slot=dropdown-menu-content]');
  await expect(popup).toBeVisible();
  const motion = await popup.evaluate((el) => {
    const style = getComputedStyle(el);
    const root = getComputedStyle(document.documentElement);
    return {
      duration: style.transitionDuration,
      token: root.getPropertyValue('--rui-motion-duration').trim(),
      scale: root.getPropertyValue('--rui-motion-popup-scale').trim(),
      easing: style.transitionTimingFunction,
    };
  });
  expect(motion.token).toBe('150ms');
  expect(motion.scale).toBe('0.96');
  expect(motion.duration === '150ms' || motion.duration === '0.15s').toBe(true);
  expect(motion.easing).toContain('cubic-bezier');
  await expect(popup).toHaveCSS('padding-top', '4px');
});

for (const theme of ['dark', 'light']) for (const example of ['events', 'inspector', 'commands']) {
  test(`${theme}/dense: ${example} example opens its menus and passes axe`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?view=dense&page=${example}&theme=${theme}`);
    await expect(page.locator('main')).toBeVisible();
    // No dense example text exceeds the 12px interface size.
    expect(await page.evaluate(() => [...document.querySelectorAll('main *')].filter((el) => [...el.childNodes].some((node) => node.nodeType === 3 && node.textContent!.trim()) && parseFloat(getComputedStyle(el).fontSize) > 12).length)).toBe(0);
    if (example !== 'commands') await expect(page.locator('[data-slot=table-head]').first()).toHaveCSS('font-size', '11px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await expectNoAxeViolations(page);
    if (example === 'inspector') {
      await page.getByRole('button', { name: '林夏 操作' }).click();
      await page.getByRole('menuitem', { name: '转到栏目' }).press('ArrowRight');
      await expect(page.getByRole('menuitem', { name: '封面' })).toBeFocused();
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');
      await page.getByRole('row', { name: /周宁/ }).click({ button: 'right' });
      await expect(page.getByRole('menuitem', { name: '再约一次' })).toBeVisible();
    } else if (example === 'commands') {
      await page.getByRole('button', { name: '本期操作' }).click();
      await expect(page.getByRole('menuitem', { name: '重命名' })).toBeVisible();
      await expect(page.getByRole('menuitemcheckbox', { name: '自动换行' })).toBeVisible();
    } else {
      await page.getByRole('button', { name: '显示' }).click();
      await page.getByRole('menuitemcheckbox', { name: '自动换行' }).click();
      await expect(page.getByRole('cell', { name: /油墨未干/ }).first()).toHaveClass(/whitespace-normal/);
    }
  });
}
