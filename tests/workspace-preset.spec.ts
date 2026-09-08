import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import {
  restoreWorkspacePresetState,
  serializeWorkspacePresetState,
} from '../packages/ui/src/complex/workspace.js';

const prefix = '复杂-workspace-工作区布局';

async function openStory(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('#storybook-root')).toBeVisible({ timeout: 15_000 });
}

test('restores current and legacy preset state', () => {
  expect(restoreWorkspacePresetState(JSON.stringify({ version: 1, navigationOpen: false, inspectorOpen: true, activePanel: 'inspector' }))).toEqual({
    source: 'current',
    state: { version: 1, navigationOpen: false, inspectorOpen: true, activePanel: 'inspector' },
  });
  expect(restoreWorkspacePresetState(JSON.stringify({ navigation: true, inspector: false, panel: 'navigation' }))).toEqual({
    source: 'legacy',
    state: { version: 1, navigationOpen: true, inspectorOpen: false, activePanel: 'navigation' },
  });
});

test('rejects malformed, unknown and incomplete current records', () => {
  const options = { defaultNavigationOpen: false, defaultInspectorOpen: false, defaultActivePanel: 'workspace' as const };
  const fallback = { source: 'fallback', state: { version: 1, navigationOpen: false, inspectorOpen: false, activePanel: 'workspace' } };
  expect(restoreWorkspacePresetState('{', options)).toEqual(fallback);
  expect(restoreWorkspacePresetState(JSON.stringify({ version: 2, navigationOpen: true, inspectorOpen: true, activePanel: 'workspace' }), options)).toEqual(fallback);
  expect(restoreWorkspacePresetState(JSON.stringify({ version: 1, navigationOpen: true, activePanel: 'workspace' }), options)).toEqual(fallback);
  expect(restoreWorkspacePresetState(JSON.stringify({ version: 1, navigationOpen: true, inspectorOpen: true, activePanel: 'unknown' }), options)).toEqual(fallback);
});

test('serializes only the versioned preset schema', () => {
  expect(JSON.parse(serializeWorkspacePresetState({ navigationOpen: false, inspectorOpen: true, activePanel: 'navigation' }))).toEqual({
    version: 1,
    navigationOpen: false,
    inspectorOpen: true,
    activePanel: 'navigation',
  });
});

test('wide preset toggles support panels while keeping the workspace visible', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('reito.story.workspace-preset'));
  await openStory(page, 'preset-desktop');
  const workspace = page.getByRole('region', { name: 'Workspace.tsx' });
  const navigation = page.getByRole('region', { name: '项目' });
  const inspector = page.getByRole('region', { name: '检查器' });
  await expect(workspace).toBeVisible();
  await expect(navigation).toBeVisible();
  await expect(inspector).toBeVisible();
  await page.getByRole('group', { name: '宽布局面板' }).getByRole('button', { name: '导航' }).click();
  await expect(navigation).toBeHidden();
  await expect(workspace).toBeVisible();
  await page.getByRole('group', { name: '宽布局面板' }).getByRole('button', { name: '检查器' }).click();
  await expect(inspector).toBeHidden();
  await expect(workspace).toBeVisible();
});

test('wide panel visibility persists across reload', async ({ page }) => {
  await openStory(page, 'preset-desktop');
  await page.evaluate(() => localStorage.removeItem('reito.story.workspace-preset'));
  await page.reload();
  const group = page.getByRole('group', { name: '宽布局面板' });
  await group.getByRole('button', { name: '导航' }).click();
  await group.getByRole('button', { name: '检查器' }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('reito.story.workspace-preset'))).toContain('"navigationOpen":false');
  await page.reload();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByText(/来源：current/)).toBeVisible();
  await expect(page.getByRole('region', { name: '项目' })).toBeHidden();
  await expect(page.getByRole('region', { name: '检查器' })).toBeHidden();
  await expect(page.getByRole('region', { name: 'Workspace.tsx' })).toBeVisible();
});

test('browser storage events synchronize preset state', async ({ page }) => {
  await openStory(page, 'preset-desktop');
  await page.evaluate(() => {
    const value = JSON.stringify({ version: 1, navigationOpen: false, inspectorOpen: true, activePanel: 'inspector' });
    localStorage.setItem('reito.story.workspace-preset', value);
    window.dispatchEvent(new StorageEvent('storage', { key: 'reito.story.workspace-preset', newValue: value, storageArea: localStorage }));
  });
  await expect(page.getByText(/来源：current · 当前：inspector · 导航：关 · 检查器：开/)).toBeVisible();
  await expect(page.getByRole('region', { name: '项目' })).toBeHidden();
  await expect(page.getByRole('region', { name: '检查器' })).toBeVisible();
});

test('narrow preset exposes one selected panel at a time', async ({ page }) => {
  await openStory(page, 'preset-narrow');
  const group = page.getByRole('group', { name: '窄布局面板' });
  await expect(page.getByRole('region', { name: 'Workspace.tsx' })).toBeVisible();
  await expect(page.getByRole('region', { name: '项目' })).toBeHidden();
  await group.getByRole('button', { name: '导航' }).click();
  await expect(page.getByRole('region', { name: '项目' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Workspace.tsx' })).toBeHidden();
  await group.getByRole('button', { name: '检查器' }).click();
  await expect(page.getByRole('region', { name: '检查器' })).toBeVisible();
  await expect(group.getByRole('button', { name: '检查器' })).toHaveAttribute('aria-pressed', 'true');
});

test('auto preset responds to its container instead of the viewport', async ({ page }) => {
  await openStory(page, 'preset-auto');
  await expect(page.getByRole('group', { name: '宽布局面板' })).toBeVisible();
  await expect(page.getByRole('group', { name: '窄布局面板' })).toBeHidden();
  await page.locator('[data-slot="workspace-preset"]').evaluate(element => { (element as HTMLElement).style.width = '24rem'; });
  await expect(page.getByRole('group', { name: '窄布局面板' })).toBeVisible();
  await expect(page.getByRole('group', { name: '宽布局面板' })).toBeHidden();
  await expect(page.getByRole('region', { name: 'Workspace.tsx' })).toBeVisible();
  await expect(page.getByRole('region', { name: '项目' })).toBeHidden();
});

test('workspace and inspector keep independent scroll positions', async ({ page }) => {
  await openStory(page, 'preset-independent-scroll');
  const workspace = page.getByRole('region', { name: 'Workspace.tsx' });
  const inspector = page.getByRole('region', { name: '检查器' });
  await expect.poll(() => workspace.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  await expect.poll(() => inspector.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  await workspace.evaluate(element => { element.scrollTop = 120; });
  expect(await workspace.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  expect(await inspector.evaluate(element => element.scrollTop)).toBe(0);
});

test('optional panels do not leave unreachable controls', async ({ page }) => {
  await openStory(page, 'preset-optional-panels');
  await expect(page.getByRole('region', { name: 'Workspace.tsx' })).toBeVisible();
  await expect(page.getByRole('group', { name: /布局面板/ })).toHaveCount(0);
});

test('preset stories expose current, legacy and unavailable recovery sources', async ({ page }) => {
  await openStory(page, 'preset-persisted');
  await expect(page.getByText(/来源：current · 当前：inspector/)).toBeVisible();
  await expect(page.getByRole('region', { name: '检查器' })).toBeVisible();
  await openStory(page, 'preset-legacy');
  await expect(page.getByText(/来源：legacy · 当前：navigation/)).toBeVisible();
  await expect(page.getByRole('region', { name: '项目' })).toBeVisible();
  await openStory(page, 'preset-storage-unavailable');
  await expect(page.getByText(/来源：unavailable/)).toBeVisible();
});

test('Playground Controls switch preset modes and panels without changing stories', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="workspace-preset"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-presetMode"]').selectOption('narrow');
  await page.locator('[id="control-activePanel"]').selectOption('navigation');
  await expect(frame.getByRole('region', { name: '文件目录' })).toBeVisible();
  await expect(frame.getByRole('region', { name: '文件预览' })).toBeHidden();
  await page.getByRole('switch', { name: 'preset' }).press('Space');
  await expect(frame.locator('[data-slot="resizable-panel-group"]')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: narrow workspace preset is accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 760 });
  await openStory(page, 'preset-narrow', `theme:${theme};density:${density}`);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/workspace-preset/${theme}-${density}.png`, fullPage: true });
});
