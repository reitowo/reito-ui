import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
async function expectNoAxeViolations(page: Page) {
  await page.addScriptTag({ content: axe });
  const violations = await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map((item: any) => `${item.id}: ${item.nodes.map((node: any) => node.target.join(' ')).join(', ')}`));
  expect(violations).toEqual([]);
}

for (const theme of ['dark', 'light']) {
  test(`${theme}/dense: trace card geometry follows dense tokens`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/?view=dense&page=trace&theme=${theme}`);
    await expect(page.locator('html')).toHaveAttribute('data-density', 'dense');
    const card = page.locator('[data-slot=tool-call][data-variant=trace]').nth(3);
    await expect(card).toHaveCSS('border-radius', '6px');
    await expect(card).toHaveCSS('padding', '4px 8px');
    await expect(card).toHaveCSS('box-shadow', 'none');
    await expect(card.locator('[data-slot=tool-call-header]')).toHaveCSS('height', '18px');
    await expect(card.locator('[data-slot=tool-call-input]')).toHaveCSS('height', '18px');
    await expect(card.locator('[data-slot=tool-call-output]')).toHaveCSS('height', '18px');
    await expect(card.locator('[data-slot=tool-call-header] span.truncate')).toHaveCSS('font-size', '12px');
    await expect(card.locator('[data-slot=tool-call-output] span.font-mono')).toHaveCSS('font-size', '11px');
    await expect(card.locator('[data-slot=badge]')).toHaveCSS('height', '16px');
    await expect(page.locator('[data-slot=section-label]').first()).toHaveCSS('font-size', '10px');
    await expect(page.locator('main h1')).toHaveCSS('font-size', '12px');
    await expect(page.locator('main h1')).toHaveCSS('font-weight', '600');
    await expect(page.getByText('49 条')).toHaveCSS('font-size', '11px');
    await expect(page.locator('[data-slot=mini-timeline] span.leading-none').first()).toHaveCSS('font-size', '10px');
    await expect(card.locator('[data-slot=tool-call-header] time')).toHaveCSS('font-size', '10px');
    await expect(page.locator('[data-slot=toggle-group-item] svg').first()).toHaveCSS('width', '10px');
    const error = page.locator('[data-slot=tool-call][data-status=error]');
    await expect(error.locator('[data-slot=tool-call-error]')).toContainText('browser surface not found');
    const errorBackground = await error.evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(errorBackground).toBe(await card.evaluate((node) => getComputedStyle(node).backgroundColor));

    const preview = page.getByRole('button', { name: '读正文与大纲源码，13 行' });
    await expect(preview).toHaveAttribute('aria-expanded', 'false');
    await preview.press('Enter');
    await expect(preview).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByLabel('javascript代码').first()).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test(`${theme}/dense: mini timeline is one tab stop with arrow navigation`, async ({ page }) => {
    await page.goto(`/?view=dense&page=trace&theme=${theme}`);
    const timeline = page.getByRole('group', { name: '事件总览' });
    const selected = timeline.getByRole('button', { pressed: true });
    await expect(selected).toHaveAttribute('tabindex', '0');
    await expect(timeline.locator('button[tabindex="0"]')).toHaveCount(1);
    await selected.focus();
    await page.keyboard.press('Home');
    const first = timeline.getByRole('button', { name: 'open · 本地事件 1 · open' });
    await expect(first).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(timeline.getByRole('button', { name: 'open · 本地事件 2 · open' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(timeline.getByRole('button', { name: 'open · 本地事件 2 · open' })).toHaveAttribute('aria-pressed', 'true');
  });

  test(`${theme}/dense: jump to latest appears away from the end and returns there`, async ({ page }) => {
    await page.goto(`/?view=dense&page=trace&theme=${theme}`);
    const region = page.getByRole('region', { name: '事件列表' });
    const jump = page.getByRole('button', { name: '回到最新' });
    await expect(jump).toBeVisible();
    await jump.click();
    await expect(jump).toHaveCount(0);
    expect(await region.evaluate((node) => node.scrollHeight - node.clientHeight - node.scrollTop)).toBeLessThan(8);
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
    await expect(item).toHaveCSS('padding-left', { compact: '8px', comfortable: '10px', dense: '6px' }[density]);
    await expect(item).toHaveCSS('height', { compact: '28px', comfortable: '32px', dense: '20px' }[density]);
    await expect(popup.locator('[data-slot=dropdown-menu-separator]').first()).toHaveCSS('margin-left', '4px');
    await page.keyboard.press('ArrowDown');
    await expect(popup.getByRole('menuitem').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(popup).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}

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
      await page.getByRole('button', { name: 'graphite-large 操作' }).click();
      await page.getByRole('menuitem', { name: '移动到' }).press('ArrowRight');
      await expect(page.getByRole('menuitem', { name: '生产目录' })).toBeFocused();
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');
      await page.getByRole('row', { name: /sage-reasoner/ }).click({ button: 'right' });
      await expect(page.getByRole('menuitem', { name: '重新同步' })).toBeVisible();
    } else if (example === 'commands') {
      await page.getByRole('menuitem', { name: '编辑' }).click();
      await expect(page.getByRole('menuitem', { name: '重命名' })).toBeVisible();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByRole('menuitemcheckbox', { name: '自动换行' })).toBeVisible();
    } else {
      await page.getByRole('button', { name: '视图' }).click();
      await page.getByRole('menuitemcheckbox', { name: '自动换行' }).click();
      await expect(page.getByRole('cell', { name: /remote method/ }).first()).toHaveClass(/whitespace-normal/);
    }
  });
}
