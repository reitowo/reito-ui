import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-logviewer-日志查看';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const viewer = page.locator('[data-slot="log-viewer"]');
  await expect(viewer).toBeVisible({ timeout: 15_000 });
  return viewer;
}

function relativeTop(row: Locator) {
  return row.evaluate(element => {
    const list = element.closest('[data-slot="virtual-list"]')?.querySelector('[role="list"]');
    return element.getBoundingClientRect().top - (list?.getBoundingClientRect().top ?? 0);
  });
}

function readingAnchor(list: Locator) {
  return list.evaluate(element => {
    const viewport = element.getBoundingClientRect();
    const rows = [...element.querySelectorAll<HTMLElement>('[data-log-id]')]
      .map(row => ({ id: row.dataset.logId || '', top: row.getBoundingClientRect().top - viewport.top, rect: row.getBoundingClientRect() }))
      .filter(row => row.rect.bottom > viewport.top && row.rect.top < viewport.bottom)
      .sort((a, b) => Math.abs(a.top) - Math.abs(b.top));
    return { id: rows[0]?.id ?? '', top: rows[0]?.top ?? 0 };
  });
}

test('virtualizes ten thousand dynamic log entries and starts at the latest entry', async ({ page }) => {
  const viewer = await open(page, 'virtual-large');
  const rows = viewer.getByRole('listitem');
  await expect(viewer.getByText('任务 9999 已完成本地日志阶段。')).toBeVisible();
  expect(await rows.count()).toBeLessThan(80);
  await expect(viewer.getByText('已加载 10000 · 跟随最新')).toBeVisible();
});

test('query and level controls filter loaded logs', async ({ page }) => {
  const viewer = await open(page, 'playground');
  const search = viewer.getByRole('textbox', { name: '搜索日志' });
  await search.fill('认证');
  await expect(viewer.getByText('显示 1 / 已加载 25 · 跟随最新')).toBeVisible();
  await viewer.getByRole('button', { name: '错误' }).click();
  await expect(viewer.getByText('没有符合筛选条件的日志')).toBeVisible();
});

test('append follows when pinned and keeps a paused reading position', async ({ page }) => {
  let viewer = await open(page, 'append-following');
  await viewer.locator('xpath=..').getByRole('button', { name: '追加 4 条日志' }).click();
  await expect(viewer.getByText('流式任务 123 已写入本地日志。')).toBeVisible();
  await expect(viewer.getByText('已加载 124 · 跟随最新')).toBeVisible();

  viewer = await open(page, 'append-paused');
  const list = viewer.getByRole('list', { name: '日志内容' });
  await list.evaluate(element => { element.scrollTop = element.scrollHeight / 2; element.dispatchEvent(new Event('scroll')); });
  await page.waitForTimeout(250);
  const anchor = await readingAnchor(list);
  await viewer.locator('xpath=..').getByRole('button', { name: '追加 4 条日志' }).click();
  await expect(viewer.getByText('已加载 124 · 跟随已暂停')).toBeVisible();
  const retained = viewer.locator(`[data-log-id="${anchor.id}"]`);
  await expect(retained).toBeVisible();
  await expect.poll(async () => Math.abs((await relativeTop(retained)) - anchor.top)).toBeLessThanOrEqual(2);
});

test('scrolling away from the end pauses follow and resume jumps to latest', async ({ page }) => {
  const viewer = await open(page, 'append-following');
  const list = viewer.getByRole('list', { name: '日志内容' });
  await list.dispatchEvent('wheel', { deltaY: -120 });
  await list.evaluate(element => { element.scrollTop = 0; element.dispatchEvent(new Event('scroll')); });
  await expect(viewer.getByRole('button', { name: '恢复跟随' })).toBeVisible();
  await viewer.getByRole('button', { name: '恢复跟随' }).click();
  await expect(viewer.getByText('流式任务 119 已写入本地日志。')).toBeVisible();
  await list.focus();
  await list.press('Home');
  await expect(viewer.getByRole('button', { name: '恢复跟随' })).toBeVisible();
});

test('prepending older logs preserves the stable reading anchor', async ({ page }) => {
  const viewer = await open(page, 'load-older');
  const list = viewer.getByRole('list', { name: '日志内容' });
  await list.evaluate(element => { element.scrollTop = element.scrollHeight / 2; element.dispatchEvent(new Event('scroll')); });
  await page.waitForTimeout(250);
  const anchor = await readingAnchor(list);
  await viewer.getByRole('button', { name: '加载更早日志' }).click();
  const retained = viewer.locator(`[data-log-id="${anchor.id}"]`);
  await expect(retained).toBeVisible();
  await expect.poll(async () => Math.abs((await relativeTop(retained)) - anchor.top)).toBeLessThanOrEqual(2);
  await expect(viewer.getByText('已加载 60 / 共 200 · 跟随已暂停')).toBeVisible();
});

test('view preferences toggle the log columns and wrapping', async ({ page }) => {
  let viewer = await open(page, 'long-wrapped');
  await viewer.getByRole('button', { name: '视图' }).click();
  const body = page.locator('body');
  await body.getByRole('menuitemcheckbox', { name: '显示来源' }).click();
  await expect(viewer.getByText('[workspace/indexer]', { exact: true })).toHaveCount(0);
  viewer = await open(page, 'minimal-view');
  await expect(viewer.getByText('10:00:00', { exact: true })).toHaveCount(0);
  await expect(viewer.locator('[data-log-id]').getByText('信息', { exact: true })).toHaveCount(0);
});

test('unwrapped long lines keep overflow inside the log viewport', async ({ page }) => {
  const viewer = await open(page, 'long-unwrapped');
  const list = viewer.getByRole('list', { name: '日志内容' });
  await list.evaluate(element => { element.scrollTop = 0; });
  await expect.poll(() => list.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('incremental and initial states remain explicit', async ({ page }) => {
  let viewer = await open(page, 'load-older-pending');
  await expect(viewer.getByText('正在加载更早日志…')).toBeVisible();
  await expect(viewer.getByRole('button', { name: '加载更早日志' })).toBeDisabled();
  viewer = await open(page, 'load-older-error');
  await expect(viewer.getByRole('alert')).toContainText('更早日志加载失败');
  await expect(viewer.getByRole('button', { name: '重试加载' })).toBeEnabled();
  viewer = await open(page, 'initial-loading');
  await expect(viewer.getByText('正在加载日志…')).toBeVisible();
  viewer = await open(page, 'empty');
  await expect(viewer.getByText('还没有日志记录')).toBeVisible();
});

test('disabled state blocks every viewer control', async ({ page }) => {
  const viewer = await open(page, 'disabled');
  await expect(viewer.getByRole('textbox')).toBeDisabled();
  for (const button of await viewer.getByRole('button').all()) await expect(button).toBeDisabled();
});

test('Playground controls update preferences without switching Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="log-viewer"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('[id="control-showSource"]').evaluate((element: HTMLInputElement) => element.click());
  await expect(frame.getByText('[local-preview]', { exact: true })).toHaveCount(0);
  await page.locator('[id="control-query"]').fill('认证');
  await expect(frame.getByText('显示 1 / 已加载 25 · 跟随最新')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(`/story/${prefix}--playground`);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: narrow log viewer stays accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 760 });
  const viewer = await open(page, 'narrow', `theme:${theme};density:${density}`);
  await expect(viewer.getByRole('listitem').first()).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/log-viewer/${theme}-${density}.png`, fullPage: true });
});
