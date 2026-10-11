import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync('apps/lab/src/catalog-manifest.json', 'utf8'));
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

test('overview discovers the complete catalog and supports search, embedded interaction and reset', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?view=overview');
  await expect(page.getByRole('heading', { name: '全组件总览', exact: true })).toBeVisible({ timeout: 30_000 });
  const tiles = page.locator('[data-component]');
  await expect(tiles).toHaveCount(manifest.entries.length);
  expect(await tiles.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-component')).sort())).toEqual(manifest.entries.map((entry: { layer: string; id: string }) => `${entry.layer}/${entry.id}`).sort());
  const search = page.getByRole('textbox', { name: '搜索全部组件' });
  await search.fill('button');
  const tile = page.locator('[data-component="basic/button"]');
  const preview = tile.locator('.atlas-inline-preview');
  await expect(preview).toBeVisible();
  const frame = tile.locator('.atlas-inline-preview');
  await frame.getByRole('button', { name: '保存更改', exact: true }).click();
  await expect(frame.getByText('已保存 1 次')).toBeVisible();
  await tile.getByRole('button', { name: '放大预览' }).click();
  await expect(tile).toHaveClass(/is-expanded/);
  await tile.getByRole('button', { name: '重置', exact: true }).click();
  await expect(frame.getByText('已保存 0 次')).toBeVisible();
  await expect(tile.getByRole('link', { name: 'Storybook' })).toHaveAttribute('href', /playground/);
  await search.fill('不存在的组件 xyz');
  await expect(page.getByText('没有匹配的组件。')).toBeVisible();
  await page.getByRole('button', { name: '清除筛选' }).click();
  await expect(tiles).toHaveCount(manifest.entries.length);
  expect(errors).toEqual([]);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`overview ${theme}/${density}: portal theme, keyboard and responsive layout`, async ({ page }) => {
    await page.addInitScript(({ theme, density }) => { localStorage.setItem('reito-theme', theme); localStorage.setItem('reito-density', density); }, { theme, density });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?view=overview');
    const trigger = page.locator('[data-component="basic/dialog"]').getByRole('button', { name: '紧凑确认弹窗' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: '启用任务通知' });
    const allow = dialog.getByRole('button', { name: '允许', exact: true });
    const insetX = density === 'compact' ? '12px' : '16px';
    const insetY = density === 'compact' ? '8px' : '10px';
    const textGap = density === 'compact' ? '4px' : '6px';
    const headers = [dialog.locator('[data-slot="dialog-header"]')];
    const footers = [dialog.locator('[data-slot="dialog-footer"]')];
    for (const surface of [...headers, ...footers]) {
      await expect(surface).toHaveCSS('padding-left', insetX);
      await expect(surface).toHaveCSS('padding-right', insetX);
      await expect(surface).toHaveCSS('padding-top', insetY);
      await expect(surface).toHaveCSS('padding-bottom', insetY);
    }
    for (const header of headers) await expect(header).toHaveCSS('row-gap', textGap);
    await expect(dialog.locator('[data-slot="dialog-title"]')).toHaveCSS('line-height', '20px');
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--rui-compact-surface-padding-x', '17px');
      document.documentElement.style.setProperty('--rui-compact-surface-padding-y', '5px');
      document.documentElement.style.setProperty('--rui-compact-surface-gap', '6px');
    });
    for (const surface of [...headers, ...footers]) {
      await expect(surface).toHaveCSS('padding-left', '17px');
      await expect(surface).toHaveCSS('padding-top', '5px');
    }
    for (const header of headers) await expect(header).toHaveCSS('row-gap', '6px');
    await page.evaluate(() => {
      document.documentElement.style.removeProperty('--rui-compact-surface-padding-x');
      document.documentElement.style.removeProperty('--rui-compact-surface-padding-y');
      document.documentElement.style.removeProperty('--rui-compact-surface-gap');
    });
    await expect(dialog).toHaveCSS('border-radius', '8px');
    await expect(allow).toHaveCSS('height', density === 'compact' ? '24px' : '28px');
    await expect(allow).toHaveCSS('font-size', '13px');
    await expect(allow).toHaveCSS('border-radius', '6px');
    await dialog.screenshot({ path: `.logs/overview-dialog-${theme}-${density}.png` });
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await trigger.click();
    await allow.click();
    await expect(page.getByText('已允许示例提醒 · 未申请浏览器通知权限', { exact: true })).toBeVisible();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('[data-slot="dialog-overlay"]:visible')).toHaveCount(0);
    await page.setViewportSize({ width: 1303, height: 1244 });
    const scrollFrame = page.locator('[data-component="basic/scroll-top"] .atlas-inline-preview');
    const readingSurface = scrollFrame.getByRole('region', { name: '文档滚动面板' });
    await expect(readingSurface).toHaveCSS('padding-left', insetX);
    await expect(readingSurface).toHaveCSS('padding-top', insetY);
    await expect(scrollFrame.getByRole('heading', { name: '本地文档示例' })).toHaveCSS('line-height', '20px');
    expect(await readingSurface.evaluate(node => {
      const heading = node.querySelector('h3')!;
      const paragraph = node.querySelector('p')!;
      return paragraph.getBoundingClientRect().top - heading.getBoundingClientRect().bottom;
    })).toBe(parseFloat(textGap));
    await readingSurface.screenshot({ path: `.logs/surface-rhythm-${theme}-${density}-scroll.png` });
    await page.screenshot({ path: `.logs/surface-rhythm-${theme}-${density}-page.png` });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: `.logs/overview-${theme}-${density}-desktop.png` });
    await page.getByRole('textbox', { name: '搜索全部组件' }).fill('input-time');
    const frame = page.locator('[data-component="basic/input-time"] .atlas-inline-preview');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveAttribute('data-density', density);
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => (await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map((item: any) => ({ id: item.id, targets: item.nodes.map((node: any) => node.target) })));
    expect(violations).toEqual([]);
    for (const size of [{ width: 960, height: 720 }, { width: 480, height: 360 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(size);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('#atlas-main').evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      await expect(page.locator('[data-component="basic/input-time"]')).toBeVisible();
    }
    await page.screenshot({ path: `.logs/overview-${theme}-${density}.png` });
  });
}
