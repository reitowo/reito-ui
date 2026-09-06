import { test, expect, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function open(page: Page, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=复杂-virtuallist-虚拟列表--dynamic-rows&viewMode=story&globals=${globals}`);
  const list = page.getByRole('list', { name: '动态本地记录' });
  await expect(list).toBeVisible();
  return { list, locate: page.getByRole('button', { name: '定位记录 81' }), prepend: page.getByRole('button', { name: '在首项前插入' }), append: page.getByRole('button', { name: '追加末项' }) };
}
const row = (text: Locator) => text.locator('xpath=ancestor-or-self::*[@data-index][1]');
async function relativeTop(element: Locator) {
  return element.evaluate(node => {
    const list = node.closest('[data-slot="virtual-list"]')?.querySelector('[role="list"]');
    return node.getBoundingClientRect().top - (list?.getBoundingClientRect().top ?? 0);
  });
}

test('stable-key anchor survives prepend and growth above the reading row', async ({ page }) => {
  const f = await open(page);
  await f.locate.click();
  const record81 = row(page.getByText('记录 81', { exact: true }));
  await expect(record81).toBeVisible();
  const beforeInsert = await relativeTop(record81);
  await f.prepend.click();
  await expect(record81).toBeVisible();
  await expect.poll(async () => Math.abs((await relativeTop(record81)) - beforeInsert)).toBeLessThanOrEqual(1);
  const beforeGrowth = await relativeTop(record81);
  await page.getByRole('button', { name: '追加内容记录 80' }).evaluate((element: HTMLButtonElement) => element.click());
  await expect(page.getByText('本地流式明细 1：内容增长后保持当前阅读位置。')).toBeVisible();
  await expect.poll(async () => Math.abs((await relativeTop(record81)) - beforeGrowth)).toBeLessThanOrEqual(1);
});

test('focus stays rendered while scrolled away and returns to the viewport when its row is removed', async ({ page }) => {
  const f = await open(page);
  await f.locate.click();
  const remove = page.getByRole('button', { name: '删除记录 81' });
  await remove.focus();
  await f.list.evaluate(element => { element.scrollTop = element.scrollHeight; element.dispatchEvent(new Event('scroll')); });
  await expect.poll(() => remove.count()).toBe(1);
  await expect(remove).toBeFocused();
  await remove.click();
  await expect(f.list).toBeFocused();
  await expect(page.getByText('记录 81', { exact: true })).toHaveCount(0);
});

test('append follows only from the end and live density remeasures without dropping the anchor', async ({ page }) => {
  const f = await open(page);
  await f.list.evaluate(element => { element.scrollTop = element.scrollHeight; element.dispatchEvent(new Event('scroll')); });
  await expect(page.getByText('记录 160', { exact: true })).toBeVisible();
  await f.append.click();
  await expect(page.getByText('新增记录 161', { exact: true })).toBeVisible();
  await f.locate.click();
  const record81 = row(page.getByText('记录 81', { exact: true }));
  const before = await relativeTop(record81);
  await page.locator('.reito-root').evaluate(element => element.setAttribute('data-density', 'comfortable'));
  await expect.poll(() => record81.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(36);
  expect(Math.abs((await relativeTop(record81)) - before)).toBeLessThanOrEqual(1);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: measured rows, keyboard and narrow surface`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  const f = await open(page, `theme:${theme};density:${density}`);
  await f.locate.click();
  await page.getByRole('button', { name: '追加内容记录 81' }).click();
  await expect(page.getByText('本地流式明细 1：内容增长后保持当前阅读位置。')).toBeVisible();
  await f.list.focus(); await f.list.press('End'); await expect(page.getByText('记录 160', { exact: true })).toBeVisible();
  await f.list.press('Home'); await expect(page.getByText('记录 1', { exact: true })).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/virtual-list-dynamic/${theme}-${density}.png`, fullPage: true });
});
