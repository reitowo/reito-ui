import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.use({ baseURL: 'http://127.0.0.1:5175' });
const axeSource = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const consoleErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  consoleErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
});
test.afterEach(async ({ page }) => expect(consoleErrors.get(page)).toEqual([]));

async function navigate(page: Page, name: 'Agent' | '文件与差异' | '设置') {
  await page.getByRole('navigation', { name: '工作台导航' }).getByRole('button', { name, exact: true }).click();
}
async function accessible(page: Page) {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all(document.getAnimations().filter(animation => Number.isFinite(animation.effect?.getTiming().iterations ?? Infinity)).map(animation => animation.finished.catch(() => undefined))); });
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => {
    const scan = await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
    return scan.violations.map((violation: any) => ({ id: violation.id, targets: violation.nodes.map((node: any) => node.target) }));
  });
  expect(violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}

test('workbench records a local request, queues it, and keeps new chat independent', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '工作区布局探索' })).toBeVisible();
  await expect(page.getByRole('article', { name: '助手的消息' }).locator('[data-slot="markdown-content"]')).toBeVisible();
  const input = page.getByRole('textbox', { name: '消息草稿' });
  await input.fill('检查桌面布局的共享间距');
  await input.press('Shift+Enter');
  await input.press('End');
  await input.press('Enter');
  await expect(input).toHaveValue('');
  await expect(page.getByRole('article', { name: '你的消息' }).last()).toContainText('检查桌面布局的共享间距');
  await expect(page.getByRole('article', { name: '你的消息' }).last().locator('[data-slot="markdown-content"]')).toBeVisible();
  await page.getByRole('button', { name: '查看任务队列' }).click();
  const queue = page.getByRole('complementary', { name: '任务队列面板' });
  await expect(queue.getByText('检查桌面布局的共享间距')).toBeVisible();
  await queue.getByRole('button', { name: '暂停任务：检查工作区布局' }).click();
  await expect(queue.getByRole('button', { name: '继续任务：检查工作区布局' })).toBeVisible();
  await queue.getByRole('button', { name: '关闭任务队列' }).click();
  await page.getByRole('button', { name: '新建本地会话' }).click();
  await expect(page.getByRole('heading', { name: '新会话' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
  await page.getByRole('button', { name: '检查布局', exact: true }).click();
  await expect(input).toHaveValue('检查工作区布局与共享间距');
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('workbench edits a message and stops explicitly local sample playback', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '编辑消息' }).click();
  const input = page.getByRole('textbox', { name: '消息草稿' });
  await expect(input).toHaveValue('把工作区的设置与审查流程整理得更紧凑。');
  await expect(input).toBeFocused();
  await page.getByRole('button', { name: '有帮助', exact: true }).click();
  await expect(page.getByRole('button', { name: '有帮助', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '播放示例', exact: true }).click();
  await expect(page.getByRole('button', { name: '停止生成' })).toBeVisible();
  await page.getByRole('button', { name: '停止生成' }).click();
  await expect(page.getByRole('status', { name: '工作台状态' })).toHaveText('本地文本播放已停止。');
  await expect(input).toHaveValue('把工作区的设置与审查流程整理得更紧凑。');
});

test('workbench artifact changes flow into the diff and a checkpoint restores local state', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: '打开 WorkspaceSettings.tsx 预览' });
  await trigger.click();
  await page.getByRole('textbox', { name: '预览名称' }).fill('审查工作台');
  await page.getByRole('button', { name: '应用预览名称' }).click();
  await page.getByRole('tab', { name: '代码', exact: true }).click();
  const artifactSource = page.getByLabel('WorkspaceSettings.tsx代码');
  await expect(artifactSource).toBeVisible();
  await expect(artifactSource).toHaveText('export const workspace = { name: "审查工作台", density: "compact" };');
  await expect(artifactSource.locator('code')).toHaveAttribute('data-highlighted', 'true');
  await expect(artifactSource.locator('.token.keyword').first()).toBeVisible();
  await page.getByRole('button', { name: '关闭产物WorkspaceSettings.tsx' }).click();
  await expect(trigger).toBeFocused();
  await navigate(page, '文件与差异');
  await expect(page.getByRole('code').filter({ hasText: 'name: "审查工作台"' })).toBeVisible();
  await page.getByRole('button', { name: '恢复检查点' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toContainText('不会修改磁盘文件');
  await dialog.getByRole('button', { name: '确认恢复' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('status', { name: '工作台状态' })).toHaveText('本地工作区名称已更新：个人工作区');
  await navigate(page, '设置');
  await expect(page.getByRole('textbox', { name: '工作区名称', exact: true })).toHaveValue('个人工作区');
});

test('workbench resource selection, paired diff and local logs are interactive', async ({ page }) => {
  await page.goto('/?view=files');
  await page.getByRole('textbox', { name: '搜索示例文件' }).fill('layout');
  await page.getByRole('button', { name: '选择 workspace-layout.css' }).click();
  await expect(page.getByRole('heading', { name: 'workspace-layout.css' })).toBeVisible();
  await page.getByRole('button', { name: '并排视图' }).click();
  await expect(page.getByRole('table')).toHaveAccessibleName('并排差异：修改前与修改后');
  await page.getByRole('button', { name: '记录已查看' }).click();
  await expect(page.getByRole('region', { name: '本地操作日志', exact: true })).toContainText('已查看 workspace-layout.css');
  await page.getByRole('textbox', { name: '搜索示例文件' }).fill('不存在的文件');
  await expect(page.getByText('没有匹配的资源')).toBeVisible();
  await page.getByRole('button', { name: '清除', exact: true }).click();
  await expect(page.getByRole('region', { name: '本地操作日志', exact: true })).toContainText('还没有日志记录');
});

test('workbench settings validate drafts, step numbers and apply key/value entries', async ({ page }) => {
  await page.goto('/?view=settings');
  const name = page.getByRole('textbox', { name: '工作区名称', exact: true });
  await name.fill(' ');
  await page.getByRole('button', { name: '保存本地设置' }).click();
  await expect(page.getByRole('alert')).toContainText('请输入工作区名称');
  await name.fill('个人组件工作台');
  await page.getByRole('button', { name: '增加示例并行数量' }).click();
  await expect(page.getByRole('textbox', { name: '示例并行数量' })).toHaveValue('3');
  await page.getByRole('button', { name: '保存本地设置' }).click();
  await expect(page.getByRole('status', { name: '工作台状态' })).toContainText('个人组件工作台');
  await page.getByRole('button', { name: '添加键值' }).click();
  await expect(page.getByRole('button', { name: '保存本地参数' })).toBeDisabled();
  await page.getByRole('textbox', { name: '键 3', exact: true }).fill('locale');
  await page.getByRole('textbox', { name: '值 3', exact: true }).fill('compact');
  await expect(page.getByText('键不能重复')).toHaveCount(2);
  await page.getByRole('textbox', { name: '键 3', exact: true }).fill('density');
  await page.getByRole('button', { name: '保存本地参数' }).click();
  await expect(page.getByRole('status', { name: '工作台状态' })).toHaveText('已保存 3 项本地参数。');
  await page.getByRole('switch', { name: '保留本地操作历史' }).click();
  await navigate(page, '文件与差异');
  await page.getByRole('button', { name: '清除', exact: true }).click();
  await page.getByRole('button', { name: '记录已查看' }).click();
  await expect(page.getByRole('status', { name: '工作台状态' })).toContainText('已查看 workspace-settings.ts');
  await expect(page.getByRole('region', { name: '本地操作日志', exact: true })).toContainText('还没有日志记录');
});

test('workbench theme and density persist through reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '切换工作台主题' }).click();
  await page.getByRole('button', { name: '切换工作台密度' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');
  await expect(page.getByRole('button', { name: '查看任务队列' })).toHaveCSS('height', '36px');
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`workbench three views are accessible in ${theme}/${density}`, async ({ page }) => {
    await page.goto('/');
    if (theme === 'light') await page.getByRole('button', { name: '切换工作台主题' }).click();
    if (density === 'comfortable') await page.getByRole('button', { name: '切换工作台密度' }).click();
    for (const view of ['Agent', '文件与差异', '设置'] as const) { await navigate(page, view); await accessible(page); }
  });
}

for (const viewport of [{ width: 390, height: 844 }, { width: 640, height: 800 }, { width: 960, height: 720 }, { width: 1280, height: 900, zoom: true }]) {
  test(`workbench reflows at ${viewport.width}px${viewport.zoom ? ' and 200% text' : ''}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    if (viewport.zoom) await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    for (const view of ['Agent', '文件与差异', '设置'] as const) { await navigate(page, view); await accessible(page); }
    if (viewport.width < 1100) {
      await navigate(page, 'Agent');
      const trigger = page.getByRole('button', { name: '打开 WorkspaceSettings.tsx 预览' });
      await trigger.click();
      await expect(page.getByRole('dialog', { name: '产物预览' })).toBeVisible();
      await accessible(page);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(trigger).toBeFocused();
    }
  });
}
