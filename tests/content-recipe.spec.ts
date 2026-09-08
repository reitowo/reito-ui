import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-contentrecipe-内容工作面配方';

async function openStory(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('#storybook-root')).toBeVisible({ timeout: 15_000 });
}

test('content recipe composes collection, navigation, reading and related actions', async ({ page }) => {
  await openStory(page, 'default');
  await expect(page.locator('[data-slot="app-shell"]')).toBeVisible();
  await expect(page.locator('[data-slot="workspace-preset"]')).toHaveCount(2);
  await expect(page.locator('[data-slot="resource-view"]')).toBeVisible();
  await expect(page.locator('[data-slot="content-navigation"]')).toBeVisible();
  await expect(page.locator('[data-slot="markdown-content"]')).toHaveCount(3);
  await expect(page.getByRole('toolbar', { name: '文档操作' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '相邻文档' })).toBeVisible();
  await expect(page.getByRole('article', { name: '快速开始正文' })).toBeVisible();
});

test('library selection opens one document and resets its section', async ({ page }) => {
  await openStory(page, 'default');
  await page.getByRole('button', { name: '选择 设计 Tokens' }).click();
  await expect(page.getByRole('heading', { name: '设计 Tokens' })).toBeVisible();
  await expect(page.getByRole('treeitem', { name: /唯一来源/ })).toHaveAttribute('aria-current', 'location');
  await expect(page.locator('[data-slot="app-shell"] footer [role="status"]')).toContainText('已在本地打开：设计 Tokens');
});

test('narrow recipe moves from library to document and table of contents', async ({ page }) => {
  await page.setViewportSize({ width: 620, height: 760 });
  await openStory(page, 'narrow');
  await expect(page.locator('[data-slot="resource-view"]')).toBeVisible();
  await page.getByRole('button', { name: '选择 Storybook 验收' }).click();
  await expect(page.getByRole('heading', { name: 'Storybook 验收' })).toBeVisible();
  const readerControls = page.getByRole('group', { name: '窄布局面板' });
  await readerControls.getByRole('button', { name: '目录' }).click();
  await expect(page.getByRole('treeitem', { name: /参数调试/ })).toBeVisible();
  await readerControls.getByRole('button', { name: '正文' }).click();
  await expect(page.getByRole('article', { name: 'Storybook 验收正文' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '.logs/content-recipe/narrow-dark-compact.png', fullPage: true });
});

test('library failure preserves the selected document and retries', async ({ page }) => {
  await openStory(page, 'error-library');
  await expect(page.getByRole('alert')).toContainText('文档索引读取失败');
  await expect(page.getByRole('article', { name: '快速开始正文' })).toBeVisible();
  await page.getByRole('button', { name: '重试加载资源' }).click();
  await expect(page.getByRole('alert')).toBeHidden();
  await expect(page.locator('[data-slot="resource-view"]')).toBeVisible();
});

test('reader failure keeps selection and retries into the same document', async ({ page }) => {
  await openStory(page, 'error-document');
  await expect(page.getByRole('alert')).toContainText('正文读取失败');
  await expect(page.getByRole('heading', { name: '快速开始' })).toBeVisible();
  await page.getByRole('button', { name: '重试加载正文' }).click();
  await expect(page.getByRole('article', { name: '快速开始正文' })).toBeVisible();
});

test('empty and loading states explain both collection and reader boundaries', async ({ page }) => {
  await openStory(page, 'empty-library');
  await expect(page.getByRole('region', { name: '阅读' }).getByRole('status')).toHaveText('文档库中还没有内容。');
  await openStory(page, 'loading-library');
  await expect(page.getByText('正在加载资源…')).toBeVisible();
  await openStory(page, 'empty-document');
  await expect(page.getByRole('region', { name: '正文' }).getByText('此文档还没有正文。')).toBeVisible();
  await openStory(page, 'loading-document');
  await expect(page.getByText('正在加载正文…')).toHaveAttribute('aria-busy', 'true');
});

test('application search opens documents and positions current sections', async ({ page }) => {
  await openStory(page, 'default');
  await page.getByRole('button', { name: '搜索' }).click();
  let dialog = page.getByRole('dialog', { name: '应用搜索' });
  await page.getByRole('combobox', { name: '搜索文档与章节' }).fill('AI 工作面');
  await dialog.getByRole('option', { name: /AI 工作面/ }).click();
  await expect(page.getByRole('heading', { name: 'AI 工作面' })).toBeVisible();
  await page.getByRole('button', { name: '搜索' }).click();
  dialog = page.getByRole('dialog', { name: '应用搜索' });
  await page.getByRole('combobox', { name: '搜索文档与章节' }).fill('宿主职责');
  await dialog.getByRole('option', { name: /宿主职责/ }).click();
  await expect(page.getByRole('treeitem', { name: /宿主职责/ })).toHaveAttribute('aria-current', 'location');
  await expect(page.locator('[data-slot="app-shell"] footer [role="status"]')).toContainText('已定位：宿主职责');
});

test('interactive preset selects, navigates and preserves a toolbar toggle', async ({ page }) => {
  await openStory(page, 'interactive');
  await expect(page.getByRole('heading', { name: '语义角色' })).toBeVisible();
  await expect(page.getByRole('button', { name: '收藏' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-slot="app-shell"] footer [role="status"]')).toContainText('已在本地收藏当前文档');
});

test('Playground Controls change collection, reader and layout state in one story', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="app-shell"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-layoutMode"]').selectOption('narrow');
  await page.locator('[id="control-outerPanel"]').selectOption('navigation');
  await page.locator('[id="control-libraryLayout"]').selectOption('grid');
  await expect(frame.getByRole('list', { name: '文档库网格' })).toBeVisible();
  await page.locator('[id="control-outerPanel"]').selectOption('workspace');
  await page.locator('[id="control-readerMode"]').selectOption('narrow');
  await page.locator('[id="control-readerState"]').selectOption('empty');
  await expect(frame.getByRole('region', { name: '正文' }).getByText('此文档还没有正文。')).toBeVisible();
  await page.locator('[id="control-readerState"]').selectOption('ready');
  await page.locator('[id="control-readerPanel"]').selectOption('navigation');
  await expect(frame.getByRole('tree', { name: '快速开始目录' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: content recipe is accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 760 });
  await openStory(page, 'default', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/content-recipe/${theme}-${density}.png`, fullPage: true });
});
