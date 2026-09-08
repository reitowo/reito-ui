import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-dashboardrecipe-工作面配方';

async function openStory(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('#storybook-root')).toBeVisible({ timeout: 15_000 });
}

test('dashboard recipe composes the existing application layers', async ({ page }) => {
  await openStory(page, 'default');
  await expect(page.locator('[data-slot="sidebar"]')).toBeVisible();
  await expect(page.locator('[data-slot="app-shell"]')).toBeVisible();
  await expect(page.locator('[data-slot="workspace-preset"]')).toBeVisible();
  await expect(page.locator('[data-slot="data-table"]')).toBeVisible();
  await expect(page.getByRole('form', { name: '新建本地任务' })).toBeVisible();
  await expect(page.getByLabel('任务', { exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '搜索', exact: true })).toBeVisible();
  await expect(page.getByText('本地交互示例')).toBeVisible();
});

test('interactive recipe creates, completes and finds a local task', async ({ page }) => {
  await openStory(page, 'interactive');
  const status = page.locator('[data-slot="app-shell"] footer [role="status"]');
  await expect(status).toContainText('已定位：验证 Dashboard 配方');
  await expect(page.getByRole('cell', { name: '验证 Dashboard 配方', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '完成 验证 Dashboard 配方' })).toBeDisabled();
  await expect(page.getByRole('dialog', { name: '应用搜索' })).toBeHidden();
});

test('error state keeps cached rows and retries locally', async ({ page }) => {
  await openStory(page, 'error-tasks');
  await expect(page.getByRole('alert')).toContainText('本地任务读取失败');
  await expect(page.getByRole('cell', { name: '统一工作区标题层级', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.getByRole('alert')).toBeHidden();
});

test('empty and loading states explain the current table state', async ({ page }) => {
  await openStory(page, 'empty-tasks');
  await expect(page.getByText('当前没有任务，可以从检查器添加一项。')).toBeVisible();
  await openStory(page, 'loading-tasks');
  await expect(page.getByText('正在加载记录…', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: '表格滚动区域' })).toHaveAttribute('tabindex', '0');
});

test('narrow workspace switches between the table and task form', async ({ page }) => {
  await openStory(page, 'narrow');
  const controls = page.getByRole('group', { name: '窄布局面板' });
  await expect(page.locator('[data-slot="data-table"]')).toBeVisible();
  await expect(page.getByRole('form', { name: '新建本地任务' })).toBeHidden();
  await controls.getByRole('button', { name: '检查器' }).click();
  await expect(page.getByRole('form', { name: '新建本地任务' })).toBeVisible();
  await expect(page.locator('[data-slot="data-table"]')).toBeHidden();
  await page.screenshot({ path: '.logs/dashboard-recipe/narrow-dark-compact.png', fullPage: true });
});

test('mobile sidebar opens, navigates and closes without covering the new page', async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 760 });
  await openStory(page, 'narrow');
  await page.getByRole('button', { name: '切换导航侧栏' }).click();
  const mobileSidebar = page.locator('[data-slot="sidebar"][data-mobile="true"]');
  await expect(mobileSidebar).toBeVisible();
  await mobileSidebar.getByRole('button', { name: '设置' }).click();
  await expect(mobileSidebar).toBeHidden();
  await expect(page.getByRole('heading', { name: '工作区偏好' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('sidebar and inspector preferences survive a reload', async ({ page }) => {
  await openStory(page, 'persisted-preferences');
  await page.evaluate(() => {
    localStorage.removeItem('reito.story.dashboard.layout');
    localStorage.removeItem('reito.story.dashboard.preset');
  });
  await page.reload();
  const desktopSidebar = page.locator('[data-slot="sidebar"][data-state]');
  await expect(desktopSidebar).toHaveAttribute('data-state', 'expanded');
  await page.getByRole('button', { name: '切换导航侧栏' }).click();
  await page.getByRole('group', { name: '宽布局面板' }).getByRole('button', { name: '检查器' }).click();
  await expect(desktopSidebar).toHaveAttribute('data-state', 'collapsed');
  await expect(page.getByRole('region', { name: '新建任务' })).toBeHidden();
  await page.reload();
  await expect(desktopSidebar).toHaveAttribute('data-state', 'collapsed');
  await expect(page.getByRole('region', { name: '新建任务' })).toBeHidden();
  await expect(page.locator('[data-slot="app-shell"] footer [role="status"]')).toContainText('偏好来源：current/current');
});

test('Playground Controls change layout, page and data state in one story', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="app-shell"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-layoutMode"]').selectOption('narrow');
  await page.locator('[id="control-section"]').selectOption('settings');
  await page.locator('[id="control-activePanel"]').selectOption('workspace');
  await expect(frame.getByRole('heading', { name: '工作区偏好' })).toBeVisible();
  await page.locator('[id="control-section"]').selectOption('tasks');
  await page.locator('[id="control-dataState"]').selectOption('empty');
  await expect(frame.getByText('当前没有任务，可以从检查器添加一项。')).toBeVisible();
  await page.locator('[id="control-activePanel"]').selectOption('inspector');
  await expect(frame.getByRole('form', { name: '新建本地任务' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: dashboard recipe is accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 760 });
  await openStory(page, 'default', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/dashboard-recipe/${theme}-${density}.png`, fullPage: true });
});
