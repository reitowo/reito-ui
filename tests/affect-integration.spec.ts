import { test, expect } from '@playwright/test';
const storybook = process.env.REITO_STORYBOOK_URL || 'http://127.0.0.1:6007';
for (const theme of ['dark', 'light'])
  for (const density of ['compact', 'comfortable']) {
    test(`Affect button sizes, loading and surfaces: ${theme}/${density}`, async ({ page }) => {
      await page.goto(
        `${storybook}/iframe.html?id=模式-button--default&viewMode=story&globals=theme:${theme};density:${density}`,
      );
      const save = page.getByRole('button', { name: '保存', exact: true });
      await expect(save).toHaveCSS('height', '40px');
      await expect(save).toHaveCSS('border-radius', '12px');
      await expect(page.getByRole('button', { name: '小', exact: true })).toHaveCSS(
        'height',
        '32px',
      );
      await expect(page.getByRole('button', { name: '大', exact: true })).toHaveCSS(
        'height',
        '48px',
      );
      await save.click();
      await expect(save).toBeDisabled();
      await expect(save).toHaveAttribute('aria-busy', 'true');
      await expect(save).toBeEnabled();
      await page.screenshot({ path: `.logs/affect-merge-${theme}-${density}.png` });
    });
  }
test('Affect commands and composer use local keyboard interactions', async ({ page }) => {
  await page.goto(`${storybook}/iframe.html?id=模式-command-menu--default&viewMode=story`);
  const search = page.getByPlaceholder('输入命令或搜索…');
  await search.fill('打开设置');
  await search.press('ArrowDown');
  await search.press('Enter');
  await expect(page.getByRole('status')).toContainText('已运行：打开设置');
  await page.goto(`${storybook}/iframe.html?id=模式-chat-composer--default&viewMode=story`);
  const input = page.getByPlaceholder('从输入开始…');
  await input.fill('本地合并验证');
  await input.press('Enter');
  await expect(page.getByText('auto: 本地合并验证', { exact: true })).toBeVisible();
  await expect(input).toHaveValue('');
});
test('Affect layer is discoverable in gallery, detail, docs and AI markdown', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/gallery');
  await page.getByRole('tab', { name: /^模式 / }).click();
  await expect(page.locator('.gallery-grid [data-component]')).toHaveCount(123);
  await page.getByRole('textbox', { name: '搜索组件' }).fill('affect-button');
  await page.locator('[data-component="affect-button"]').click();
  await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible();
  await expect(
    page.getByTestId('site-component-preview').getByRole('button', { name: '保存', exact: true }),
  ).toHaveCSS('height', '40px');
  await page.getByRole('main').getByRole('button', { name: '文档', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/components\/affect-button/);
  const markdown = await request.get('/docs/components/affect-button.md');
  expect(markdown.ok()).toBe(true);
  expect(await markdown.text()).toContain('@reito/ui/affect');
  const index = await request.get('/llms.txt');
  expect(await index.text()).toContain('/docs/components/affect-button.md');
  expect(errors).toEqual([]);
});
for (const theme of ['dark', 'light'])
  test(`homepage XL actions keep complete token styling: ${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => {
      localStorage.setItem('reito-theme', theme);
      localStorage.setItem('reito-density', 'compact');
    }, theme);
    await page.goto('/');
    const actions = page.locator('.home-hero-actions');
    for (const name of ['阅读文档', '浏览组件', '安装'])
      await expect(actions.getByRole('button', { name, exact: true })).toHaveCSS('height', '48px');
    await expect(actions.getByRole('button', { name: '阅读文档', exact: true })).not.toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
    await page.screenshot({ path: `.logs/home-merge-${theme}.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });

test('task board card opening and star actions are independent keyboard targets', async ({
  page,
}) => {
  await page.goto(`${storybook}/iframe.html?id=模式-task-board--default&viewMode=story`);
  const star = page.getByRole('button', { name: '星标', exact: true }).first();
  await star.click();
  await expect(star).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '关闭', exact: true })).toHaveCount(0);
  expect(await page.locator('button button').count()).toBe(0);
  const card = page.getByRole('button', { name: /^打开任务 / }).first();
  await card.focus();
  await card.press('Enter');
  await expect(page.getByRole('button', { name: '关闭', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await expect(page.getByRole('button', { name: '关闭', exact: true })).toHaveCount(0);
});

test('live traces tick without a render feedback loop', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Maximum update depth'))
      errors.push(message.text());
  });
  await page.goto(`${storybook}/iframe.html?id=模式-trace-waterfall--live&viewMode=story`);
  const root = page.getByRole('treeitem', { name: /运行中的轨迹 agent running/ });
  await expect(root).toBeVisible();
  const before = await root.getAttribute('aria-label');
  await expect.poll(() => root.getAttribute('aria-label'), { timeout: 3500 }).not.toBe(before);
  expect(errors).toEqual([]);
});
