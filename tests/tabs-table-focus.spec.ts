import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { storybookUrl } from './select-option';

const story = (theme = 'dark', density = 'compact') => `${storybookUrl}/iframe.html?id=基础-tabs--reading-surfaces&viewMode=story&globals=theme:${theme};density:${density}`;
const openStory = async (page: Page, theme = 'dark', density = 'compact') => {
  await page.goto(story(theme, density));
  // A consuming site's generic fallback belongs below the shared focus contract.
  await page.addStyleTag({ content: '@layer base { [tabindex]:focus-visible { outline: var(--rui-outline-width) solid var(--rui-focus); outline-offset: var(--rui-space-1); } }' });
};
const quiet = async (surface: Locator) => {
  await expect(surface).toHaveCSS('outline-style', 'none');
  await expect(surface).toHaveCSS('box-shadow', 'none');
  await expect(surface).toHaveCSS('border-inline-start-color', 'rgba(0, 0, 0, 0)');
};
const keyboardMarker = async (surface: Locator) => {
  await expect(surface).toBeFocused();
  await expect(surface).toHaveCSS('outline-style', 'none');
  await expect(surface).toHaveCSS('box-shadow', 'none');
  await expect(surface).toHaveCSS('border-inline-start-style', 'solid');
  await expect(surface).toHaveCSS('border-inline-start-width', '1px');
};
const visibleLeadingMarker = async (page: Page, surface: Locator) => {
  const png = (await surface.screenshot()).toString('base64');
  const focusColor = await surface.evaluate(element => getComputedStyle(element).getPropertyValue('--rui-focus').trim());
  const markerWidth = await surface.evaluate(element => Math.ceil(parseFloat(getComputedStyle(element).borderInlineStartWidth)));
  const coverage = await page.evaluate(async ({ png, focusColor, markerWidth }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${png}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d')!;
    context.fillStyle = focusColor;
    context.fillRect(0, 0, 1, 1);
    const expected = context.getImageData(0, 0, 1, 1).data;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 2, markerWidth, image.height - 4).data;
    let matched = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if ([0, 1, 2].every(channel => Math.abs(pixels[index + channel] - expected[channel]) <= 2)) matched += 1;
    }
    return matched / (pixels.length / 4);
  }, { png, focusColor, markerWidth });
  expect(coverage).toBeGreaterThan(0.8);
};

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`TabsContent preserves quiet reading and keyboard navigation (${theme}/${density})`, async ({ page }, testInfo) => {
    await openStory(page, theme, density);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveAttribute('data-density', density);
    const notes = page.getByRole('tab', { name: '说明', exact: true });
    const panel = page.getByRole('tabpanel', { name: '说明', exact: true });
    await panel.click();
    await expect(panel).toBeFocused();
    await quiet(panel);
    const bounds = await panel.boundingBox();
    await page.keyboard.press('Shift+Tab');
    await expect(notes).toBeFocused();
    await page.keyboard.press('Tab');
    await keyboardMarker(panel);
    await visibleLeadingMarker(page, panel);
    await page.screenshot({ path: testInfo.outputPath('panel-keyboard-focus.png') });
    expect(await panel.boundingBox()).toEqual(bounds);
    await expect(notes).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!);
    await expect(panel).toHaveAttribute('aria-labelledby', (await notes.getAttribute('id'))!);
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('End');
    const history = page.getByRole('tab', { name: '历史', exact: true });
    await expect(history).toBeFocused();
    await expect(history).toHaveAttribute('aria-disabled', 'true');
    await page.keyboard.press('Enter');
    await expect(notes).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowLeft');
    const actions = page.getByRole('tab', { name: '操作', exact: true });
    await expect(actions).toBeFocused();
    await expect(notes).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(actions).toHaveAttribute('aria-selected', 'true');
    const actionsPanel = page.getByRole('tabpanel', { name: '操作', exact: true });
    await page.keyboard.press('Tab');
    await keyboardMarker(actionsPanel);
    await page.keyboard.press('Tab');
    const button = page.getByRole('button', { name: '示例按钮', exact: true });
    await expect(button).toBeFocused();
    await expect.poll(() => button.evaluate(element => element.matches(':focus-visible'))).toBe(true);
    await expect.poll(() => button.evaluate(element => getComputedStyle(element).boxShadow)).not.toBe('none');
    await quiet(actionsPanel);
    await actionsPanel.getByText('焦点进入以下按钮时，面板不显示额外焦点边界。').click();
    await quiet(actionsPanel);
    await actions.click();
    await page.keyboard.press('Home');
    await expect(notes).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: '记录', exact: true })).toBeFocused();
  });

  test(`Table keeps native scroll focus and a visible leading marker (${theme}/${density})`, async ({ page }, testInfo) => {
    await openStory(page, theme, density);
    const tab = page.getByRole('tab', { name: '记录', exact: true });
    await tab.click();
    const panel = page.getByRole('tabpanel', { name: '记录', exact: true });
    const table = panel.locator('[data-slot="table-container"]');
    await expect.poll(() => table.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
    // Chromium's scrollable-region tab stop is preserved without adding tabindex.
    await expect(table).not.toHaveAttribute('tabindex');
    await table.getByText('第一项', { exact: true }).click();
    await quiet(table);
    const bounds = await table.boundingBox();
    await tab.click();
    await page.keyboard.press('Tab');
    await keyboardMarker(panel);
    await page.keyboard.press('Tab');
    await keyboardMarker(table);
    await quiet(panel);
    await visibleLeadingMarker(page, table);
    await page.screenshot({ path: testInfo.outputPath('table-keyboard-focus.png') });
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => table.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => table.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    await visibleLeadingMarker(page, table);
    await page.screenshot({ path: testInfo.outputPath('table-scrolled-keyboard-focus.png') });
    expect(await table.boundingBox()).toEqual(bounds);
    await page.keyboard.press('Shift+Tab');
    await keyboardMarker(panel);
    await quiet(table);
    await table.getByText('第一项', { exact: true }).click();
    await quiet(table);
  });
}

for (const target of ['panel', 'table'] as const) test(`${target} retains a system-color focus cue in forced colors`, async ({ page }) => {
  await openStory(page);
  await page.getByRole('tab', { name: target === 'panel' ? '说明' : '记录', exact: true }).click();
  await page.keyboard.press('Tab');
  if (target === 'table') await page.keyboard.press('Tab');
  const surface = target === 'panel' ? page.getByRole('tabpanel', { name: '说明', exact: true }) : page.locator('[data-slot="table-container"]');
  await keyboardMarker(surface);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(surface).toHaveCSS('outline-style', 'solid');
  await expect(surface).toHaveCSS('outline-width', '2px');
  await expect(surface).toHaveCSS('outline-offset', '-2px');
  await page.keyboard.press('Tab');
  await expect(surface).not.toBeFocused();
  await expect(surface).toHaveCSS('outline-style', 'none');
});

test('reading surfaces retain ARIA and table semantics', async ({ page }) => {
  await openStory(page);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  // This checks semantics, not complete accessibility. The native Table scroller's
  // existing Safari keyboard-access limitation is recorded in the validation note.
  const rules = ['aria-allowed-attr', 'aria-hidden-focus', 'aria-prohibited-attr', 'aria-required-attr', 'aria-required-children', 'aria-required-parent', 'aria-roles', 'aria-tab-name', 'aria-valid-attr-value', 'aria-valid-attr', 'table-fake-caption', 'td-headers-attr', 'th-has-data-cells'];
  for (const name of ['说明', '记录', '操作']) {
    await page.getByRole('tab', { name, exact: true }).click();
    const violations = await page.evaluate(async rules => (await (window as any).axe.run(document.body, { runOnly: { type: 'rule', values: rules } })).violations, rules);
    expect(violations).toEqual([]);
  }
});
