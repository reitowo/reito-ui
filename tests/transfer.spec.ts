import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-transfer-穿梭选择';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('[data-slot="transfer"]')).toBeVisible({ timeout: 15_000 });
  return page.locator('[data-slot="transfer"]');
}

test('renders two labelled multi-select listboxes', async ({ page }) => {
  await open(page, 'overview');
  await expect(page.getByRole('listbox', { name: '可用权限' })).toBeVisible();
  await expect(page.getByRole('listbox', { name: '已授予权限' })).toBeVisible();
  await expect(page.getByRole('listbox', { name: '已授予权限' }).getByRole('option', { name: /读取文件/ })).toBeVisible();
  await expect(page.getByRole('listbox', { name: '可用权限' }).getByRole('option', { name: /读取文件/ })).toHaveCount(0);
});

test('selected items move right and append in source order', async ({ page }) => {
  await open(page, 'controlled');
  const source = page.getByRole('listbox', { name: '可选项' });
  await source.getByRole('option', { name: /使用浏览器/ }).click();
  await source.getByRole('option', { name: /运行终端/ }).click();
  await page.getByRole('button', { name: '移到已选项', exact: true }).click();
  await expect(page.locator('output').last()).toContainText('value=read,terminal,browser');
  await expect(page.locator('output').last()).toContainText('to-target:terminal,browser');
});

test('selected target items move back without duplicating values', async ({ page }) => {
  await open(page, 'controlled');
  const target = page.getByRole('listbox', { name: '已选项' });
  await target.getByRole('option', { name: /读取文件/ }).click();
  await page.getByRole('button', { name: '移回可选项', exact: true }).click();
  await expect(page.locator('output').last()).toContainText('value=空');
  await expect(page.getByRole('listbox', { name: '可选项' }).getByRole('option', { name: /读取文件/ })).toBeVisible();
});

test('bulk move applies only to the current source search result', async ({ page }) => {
  await open(page, 'current-result-bulk');
  await page.getByRole('button', { name: '全部移到已选项' }).click();
  const target = page.getByRole('listbox', { name: '目标' });
  await expect(target.getByRole('option', { name: /读取文件/ })).toBeVisible();
  await expect(target.getByRole('option', { name: /写入文件/ })).toBeVisible();
  await expect(target.getByRole('option', { name: /运行终端/ })).toHaveCount(0);
});

test('disabled items stay in the source and cannot be selected or moved', async ({ page }) => {
  await open(page, 'disabled-items');
  const locked = page.getByRole('listbox', { name: '包含锁定项' }).getByRole('option', { name: /管理策略/ });
  await expect(locked).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('button', { name: '全部移到已选项' }).click();
  await expect(locked).toBeVisible();
  await expect(page.getByRole('listbox', { name: '已选项' }).getByRole('option', { name: /管理策略/ })).toHaveCount(0);
});

test('Alt+Right moves selected source items with the same callback path', async ({ page }) => {
  await open(page, 'keyboard-transfer');
  const source = page.getByRole('listbox', { name: 'Alt+右方向键移动' });
  await source.focus();
  await source.press('Alt+ArrowRight');
  await expect(page.getByRole('listbox', { name: 'Alt+左方向键移回' }).getByRole('option', { name: /写入文件/ })).toBeVisible();
});

test('Alt+Left moves selected target items back', async ({ page }) => {
  await open(page, 'keyboard-transfer');
  const source = page.getByRole('listbox', { name: 'Alt+右方向键移动' });
  await source.focus();
  await source.press('Alt+ArrowRight');
  const target = page.getByRole('listbox', { name: 'Alt+左方向键移回' });
  await target.getByRole('option', { name: /写入文件/ }).click();
  await target.press('Alt+ArrowLeft');
  await expect(source.getByRole('option', { name: /写入文件/ })).toBeVisible();
});

test('read only, disabled and loading states block transfer controls', async ({ page }) => {
  for (const story of ['read-only', 'disabled', 'loading']) {
    await open(page, story);
    await expect(page.getByRole('button', { name: '移到已选项', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: '移回可选项', exact: true })).toBeDisabled();
  }
});

test('empty source and target expose explicit status text', async ({ page }) => {
  await open(page, 'empty-source');
  await expect(page.getByText('没有可转移的选项')).toBeVisible();
  await open(page, 'empty-target');
  await expect(page.getByText('尚未选择任何选项')).toBeVisible();
});

test('Playground updates values and queries in Controls without changing Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="transfer"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-sourceQuery"]').fill('终端');
  await expect(frame.getByRole('listbox', { name: '可用权限' }).getByRole('option')).toHaveCount(1);
  await expect(frame.locator('[data-slot=listbox-option-icon] svg')).toHaveCount(2);
  await page.locator('[id="control-showIcons"]').evaluate((n: HTMLInputElement) => n.click());
  await expect(frame.locator('[data-slot=listbox-option-icon]')).toHaveCount(0);
  await page.locator('[id="control-showIcons"]').evaluate((n: HTMLInputElement) => n.click());
  await expect(frame.locator('[data-slot=listbox-option-icon] svg')).toHaveCount(2);

  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: transfer stays accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 820 });
  await open(page, 'overview', `theme:${theme};density:${density}`);
  const write = page.getByRole('option', { name: /写入文件/ });
  await expect(write).toHaveCSS('padding-left', density === 'compact' ? '12px' : '16px');
  await expect(write).toHaveCSS('padding-top', density === 'compact' ? '6px' : '10px');
  // Inspect the composed desktop width before testing the narrow stacked sides.
  await page.setViewportSize({ width: 1303, height: 900 });
  const icon=write.locator('[data-slot=listbox-option-icon]');
  await expect(icon.locator('svg')).toBeVisible();
  await expect(icon).toHaveCSS('width','16px');
  await expect(icon).toHaveCSS('height','16px');
  expect(await write.evaluate(n=>n.getBoundingClientRect().height)).toBe(density === 'compact' ? 32 : 40);
  const shortRow = await write.evaluate(n => {
    const label=n.querySelector('[data-slot=listbox-option-label]')!.getBoundingClientRect();
    const detail=n.querySelector('[data-slot=listbox-option-description]')!.getBoundingClientRect();
    return {dy:Math.abs(label.top-detail.top),gap:detail.left-label.right};
  });
  expect(shortRow.dy).toBeLessThan(2);
  expect(shortRow.gap).toBeGreaterThanOrEqual(density === 'compact' ? 12 : 16);
  const sideTops=await page.locator('[data-slot="transfer"] > div > [data-slot="listbox-field"]').evaluateAll(ns=>ns.map(n=>n.getBoundingClientRect().top));
  expect(sideTops).toHaveLength(2);expect(sideTops[0]).toBe(sideTops[1]);
  await page.locator('[data-slot="transfer"]').screenshot({path:'.logs/transfer-inline-' + theme + '-' + density + '.png'});
  await page.setViewportSize({width:560,height:820});
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/transfer/${theme}-${density}.png`, fullPage: true });
});

test('long transfer details wrap visibly inside the option', async ({ page }) => {
  await page.setViewportSize({width:420,height:820});
  await open(page,'long-content');
  const row=page.getByRole('option',{name:/读取非常长/});
  await expect(row.getByText('长内容保持在自己的列表面板内，不挤压转移操作。')).toBeVisible();
  expect(await row.evaluate(n=>n.scrollWidth<=n.clientWidth)).toBe(true);
  expect(await row.locator('[data-slot=listbox-option-description]').evaluate(n=>n.scrollHeight<=n.clientHeight)).toBe(true);
});

test('an option keeps its icon when transferred in either direction', async ({ page }) => {
  await open(page,'controlled');
  const source=page.getByRole('listbox',{name:'可选项'});
  const target=page.getByRole('listbox',{name:'已选项'});
  const write=source.getByRole('option',{name:/写入文件/});
  await expect(write.locator('[data-slot=listbox-option-icon] svg')).toBeVisible();
  const icon=await write.locator('[data-slot=listbox-option-icon] svg').getAttribute('class');
  await write.click();await page.getByRole('button',{name:'移到已选项',exact:true}).click();
  const moved=target.getByRole('option',{name:/写入文件/});
  await expect(moved.locator('[data-slot=listbox-option-icon] svg')).toHaveAttribute('class',icon!);
  await moved.click();await page.getByRole('button',{name:'移回可选项',exact:true}).click();
  await expect(source.getByRole('option',{name:/写入文件/}).locator('[data-slot=listbox-option-icon] svg')).toHaveAttribute('class',icon!);
});

test('mixed icons align option labels; no-icon lists omit the icon column', async ({ page }) => {
  await open(page,'mixed-icons');
  const source=page.getByRole('listbox',{name:'可选项'});
  const write=source.getByRole('option',{name:/写入文件/});
  const browser=source.getByRole('option',{name:/使用浏览器/});
  const left=(row:any)=>row.locator('[data-slot=listbox-option-label]').evaluate((n:Element)=>n.getBoundingClientRect().left);
  expect(await left(write)).toBe(await left(browser));
  await expect(browser.locator('[data-slot=listbox-option-icon]')).toHaveCSS('width','16px');
  await expect(browser.locator('[data-slot=listbox-option-icon] svg')).toHaveCount(0);
  await open(page,'without-icons');
  await expect(page.locator('[data-slot=listbox-option-icon]')).toHaveCount(0);
});
