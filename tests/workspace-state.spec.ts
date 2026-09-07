import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import {
  restoreWorkspaceLayoutState,
  serializeWorkspaceLayoutState,
} from '../packages/ui/src/complex/workspace.js';

const prefix = '复杂-workspace-工作区布局';

async function openStory(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('#storybook-root')).toBeVisible({ timeout: 15_000 });
}

test('restores the current layout schema', () => {
  expect(restoreWorkspaceLayoutState(JSON.stringify({ version: 1, sidebarOpen: false, primaryPercent: 42 }), { minPanelPercent: 20 })).toEqual({
    source: 'current',
    state: { version: 1, sidebarOpen: false, primaryPercent: 42 },
  });
});

test('migrates recognized legacy layout fields', () => {
  expect(restoreWorkspaceLayoutState(JSON.stringify({ sidebar: false, layout: { primary: 42, secondary: 58 } }), { minPanelPercent: 20 })).toEqual({
    source: 'legacy',
    state: { version: 1, sidebarOpen: false, primaryPercent: 42 },
  });
});

test('rejects malformed, unknown-version and unavailable current sizes', () => {
  const options = { defaultSidebarOpen: true, defaultPrimaryPercent: 38, minPanelPercent: 20 };
  const fallback = { source: 'fallback', state: { version: 1, sidebarOpen: true, primaryPercent: 38 } };
  expect(restoreWorkspaceLayoutState('{', options)).toEqual(fallback);
  expect(restoreWorkspaceLayoutState(JSON.stringify({ version: 2, sidebarOpen: false, primaryPercent: 42 }), options)).toEqual(fallback);
  expect(restoreWorkspaceLayoutState(JSON.stringify({ version: 1, sidebarOpen: false, primaryPercent: 140 }), options)).toEqual(fallback);
});

test('serializes only the normalized current schema', () => {
  expect(JSON.parse(serializeWorkspaceLayoutState({ version: 1, sidebarOpen: false, primaryPercent: 140 }, { defaultPrimaryPercent: 38, minPanelPercent: 20 }))).toEqual({
    version: 1,
    sidebarOpen: false,
    primaryPercent: 38,
  });
});

test('persists sidebar and keyboard-resized panel state, then restores it after reload', async ({ page }) => {
  await openStory(page, 'persisted-layout');
  await page.evaluate(() => localStorage.removeItem('reito.story.workspace'));
  await page.reload();
  const status = page.getByRole('status');
  await expect(status).toContainText('来源：fallback');
  await page.getByRole('button', { name: '35 / 65' }).click();
  await page.getByRole('button', { name: '切换持久化侧栏' }).click();
  await expect(status).toContainText('侧栏：折叠 · 主面板：35%');

  const separator = page.getByRole('separator', { name: '调整项目导航与文件内容的大小' });
  await separator.focus();
  await page.keyboard.press('ArrowRight');
  await expect(status).toContainText('主面板：40%');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('reito.story.workspace'))).toContain('"primaryPercent":40');

  await page.reload();
  await expect(status).toContainText('来源：current · 侧栏：折叠 · 主面板：40%');
  await expect(page.locator('[data-slot="sidebar"][data-state="collapsed"]')).toBeVisible();
});

test('reset restores configured defaults and persists them', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('reito.story.workspace', JSON.stringify({ version: 1, sidebarOpen: false, primaryPercent: 42 })));
  await openStory(page, 'persisted-layout');
  await expect(page.getByRole('status')).toContainText('主面板：42%');
  await page.getByRole('button', { name: '重置布局' }).click();
  await expect(page.getByRole('status')).toContainText('来源：fallback · 侧栏：展开 · 主面板：34%');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('reito.story.workspace'))).toBe(JSON.stringify({ version: 1, sidebarOpen: true, primaryPercent: 34 }));
});

test('legacy, invalid and unavailable storage stories expose their recovery source', async ({ page }) => {
  await openStory(page, 'legacy-layout');
  await expect(page.getByRole('status')).toContainText('来源：legacy · 侧栏：折叠 · 主面板：42%');
  await openStory(page, 'invalid-layout-fallback');
  await expect(page.getByRole('status')).toContainText('来源：fallback · 侧栏：展开 · 主面板：38%');
  await openStory(page, 'storage-unavailable');
  await expect(page.getByRole('status')).toContainText('来源：unavailable · 侧栏：展开 · 主面板：40%');
});

test('Sidebar persistence can be disabled or enabled from Playground props', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('http://127.0.0.1:6007/iframe.html?id=基础-sidebar--playground&viewMode=story&args=persistOpen:false');
  await page.getByRole('button', { name: '切换侧栏' }).click();
  expect((await context.cookies()).some(cookie => cookie.name === 'sidebar_state')).toBe(false);
  await page.goto('http://127.0.0.1:6007/iframe.html?id=基础-sidebar--playground&viewMode=story&args=persistOpen:true');
  await page.getByRole('button', { name: '切换侧栏' }).click();
  expect((await context.cookies()).find(cookie => cookie.name === 'sidebar_state')?.value).toBe('false');
});

test('Playground Controls keep the controlled percentage in the same story', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('region', { name: '文件目录' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-primaryPercent"]').fill('44');
  await page.locator('[id="control-primaryPercent"]').press('Enter');
  const primary = frame.getByRole('region', { name: '文件目录' });
  const secondary = frame.getByRole('region', { name: '文件预览' });
  await expect.poll(async () => (await primary.boundingBox())!.width / ((await primary.boundingBox())!.width + (await secondary.boundingBox())!.width)).toBeGreaterThan(0.42);
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: persisted workspace stays accessible and contained`, async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('reito.story.workspace'));
  await openStory(page, 'persisted-layout', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/workspace-state/${theme}-${density}.png`, fullPage: true });
});
