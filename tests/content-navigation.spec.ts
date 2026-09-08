import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-contentnavigation-文档导航';

async function openStory(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('#storybook-root')).toBeVisible({ timeout: 15_000 });
}

test('content navigation exposes a tree, document and current location', async ({ page }) => {
  await openStory(page, 'default');
  await expect(page.getByRole('tree', { name: '文档目录' })).toBeVisible();
  await expect(page.getByRole('article', { name: '文档正文' })).toBeVisible();
  await expect(page.getByRole('treeitem', { name: /概览/ })).toHaveAttribute('aria-current', 'location');
  await expect(page.getByRole('heading', { name: '概览' })).toBeVisible();
});

test('tree keyboard selection navigates the document', async ({ page }) => {
  await openStory(page, 'interactive');
  await expect(page.getByRole('status')).toContainText('当前位置：usage · navigation');
  await expect(page.getByRole('treeitem', { name: /使用方式/ })).toHaveAttribute('aria-current', 'location');
  expect(await page.getByRole('region', { name: '组件设计' }).evaluate(element => element.scrollTop)).toBeGreaterThan(0);
});

test('an external route value scrolls to the requested section', async ({ page }) => {
  await openStory(page, 'controlled-route');
  const content = page.getByRole('region', { name: '组件设计' });
  const initialScrollTop = await content.evaluate(element => element.scrollTop);
  await page.getByRole('button', { name: '路由到边界' }).click();
  await expect(page.getByRole('treeitem', { name: /宿主集成边界/ })).toHaveAttribute('aria-current', 'location');
  await expect.poll(() => content.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await page.getByRole('button', { name: '路由到概览' }).click();
  await expect.poll(() => content.evaluate(element => element.scrollTop)).toBe(initialScrollTop);
});

test('reading scroll updates the controlled current section', async ({ page }) => {
  await openStory(page, 'scroll-synchronization');
  const content = page.getByRole('region', { name: '组件设计' });
  await content.evaluate(element => element.scrollTo({ top: element.scrollHeight }));
  await expect(page.getByRole('status')).toContainText('当前位置：boundary · scroll');
  await expect(page.getByRole('treeitem', { name: /宿主集成边界/ })).toHaveAttribute('aria-current', 'location');
});

test('nested current location remains visible in an expanded tree', async ({ page }) => {
  await openStory(page, 'nested');
  await expect(page.getByRole('treeitem', { name: /键盘操作/ })).toBeVisible();
  await expect(page.getByRole('treeitem', { name: /键盘操作/ })).toHaveAttribute('aria-current', 'location');
  await expect.poll(() => page.getByRole('region', { name: '组件设计' }).evaluate(element => element.scrollTop)).toBeGreaterThan(0);
});

test('long navigation titles truncate without losing their accessible name', async ({ page }) => {
  await openStory(page, 'long-title');
  const item = page.getByRole('treeitem', { name: /这是一个非常长的章节标题/ });
  await expect(item).toBeVisible();
  await expect(item.locator('[data-slot="tree-item-row"]')).toHaveAttribute('title', /这是一个非常长的章节标题/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('empty sections and empty documents remain explicit', async ({ page }) => {
  await openStory(page, 'empty-section');
  await expect(page.getByText('此章节暂无内容')).toBeVisible();
  await expect(page.getByRole('treeitem', { name: '暂未编写的章节' })).toHaveAttribute('aria-current', 'location');
  await openStory(page, 'empty-document');
  await expect(page.getByRole('status', { name: '' })).toHaveCount(2);
  await expect(page.getByText('没有可显示的章节')).toHaveCount(2);
});

test('disabled directory items cannot replace the current section', async ({ page }) => {
  await openStory(page, 'disabled-section');
  const disabled = page.getByRole('treeitem', { name: /使用方式/ });
  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await disabled.dispatchEvent('click');
  await expect(page.getByRole('status')).toContainText('当前位置：overview');
  await expect(page.getByRole('treeitem', { name: /概览/ })).toHaveAttribute('aria-current', 'location');
});

test('narrow layout switches between directory and document', async ({ page }) => {
  await openStory(page, 'narrow-layout');
  const group = page.getByRole('group', { name: '窄布局面板' });
  await expect(page.getByRole('region', { name: '组件设计' })).toBeVisible();
  await expect(page.getByRole('region', { name: '目录' })).toBeHidden();
  await group.getByRole('button', { name: '目录' }).click();
  await expect(page.getByRole('region', { name: '目录' })).toBeVisible();
  await expect(page.getByRole('region', { name: '组件设计' })).toBeHidden();
  await group.getByRole('button', { name: '正文' }).click();
  await expect(page.getByRole('region', { name: '组件设计' })).toBeVisible();
});

test('wide layout can hide and restore the directory', async ({ page }) => {
  await openStory(page, 'navigation-hidden');
  await expect(page.getByRole('region', { name: '目录' })).toBeHidden();
  await page.getByRole('group', { name: '宽布局面板' }).getByRole('button', { name: '目录' }).click();
  await expect(page.getByRole('region', { name: '目录' })).toBeVisible();
});

test('Playground Controls update route, layout and content states in one story', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="content-navigation"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-layoutMode"]').selectOption('narrow');
  await page.locator('[id="control-activePanel"]').selectOption('navigation');
  await expect(frame.getByRole('region', { name: '目录' })).toBeVisible();
  await page.getByRole('switch', { name: 'emptySection' }).press('Space');
  await page.locator('[id="control-current"]').selectOption('empty');
  await page.locator('[id="control-activePanel"]').selectOption('workspace');
  await expect(frame.getByText('此章节暂无内容')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: content navigation is accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 760 });
  await openStory(page, 'default', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/content-navigation/${theme}-${density}.png`, fullPage: true });
});
