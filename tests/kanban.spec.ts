import { test, expect } from '@playwright/test';
const storybook = process.env.REITO_STORYBOOK_URL || 'http://127.0.0.1:6007';
async function open(page: import('@playwright/test').Page, story = 'playground') {
  await page.goto(`${storybook}/iframe.html?id=复杂-kanban-看板--${story}&viewMode=story`);
  await expect(page.getByRole('region', { name: '本地任务看板', exact: true })).toBeVisible({
    timeout: 20000,
  });
}
test('keyboard moves between columns and retains focus', async ({ page }) => {
  await open(page);
  await page.screenshot({ path: '.logs/kanban/desktop-compact.png', fullPage: true });
  const card = page.getByRole('button', { name: '移动 检查布局', exact: true });
  await card.focus();
  await card.press('Alt+ArrowRight');
  await expect(
    page
      .getByRole('region', { name: '进行中', exact: true })
      .getByRole('button', { name: '移动 检查布局', exact: true }),
  ).toBeVisible();
  await expect(card).toBeFocused();
  await card.press('Alt+ArrowUp');
  await expect(
    page.getByRole('region', { name: '进行中', exact: true }).getByRole('listitem').first(),
  ).toContainText('检查布局');
});
test('drag inserts before a target card', async ({ page }) => {
  await open(page);
  await page
    .getByRole('button', { name: '移动 检查布局', exact: true })
    .dragTo(page.getByRole('button', { name: '移动 检查焦点', exact: true }));
  await expect(
    page.getByRole('region', { name: '进行中', exact: true }).getByRole('listitem').first(),
  ).toContainText('检查布局');
});
test('filter does not discard hidden cards while moving', async ({ page }) => {
  await open(page);
  await page.getByRole('textbox', { name: '筛选卡片' }).fill('检查布局');
  await page.getByRole('button', { name: '移动 检查布局', exact: true }).press('Alt+ArrowRight');
  await page.getByRole('textbox', { name: '筛选卡片' }).fill('');
  await expect(
    page
      .getByRole('region', { name: '待办', exact: true })
      .getByText('统一 tokens', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: '进行中', exact: true }).getByRole('listitem'),
  ).toHaveCount(2);
});
test('failed save preserves placement and offers retry', async ({ page }) => {
  await open(page, 'save-failure');
  await page.getByRole('button', { name: '移动 检查布局', exact: true }).press('Alt+ArrowRight');
  await expect(page.getByRole('alert')).toHaveText('本地保存失败');
  await expect(
    page.getByRole('region', { name: '待办', exact: true }).getByText('检查布局', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: '重试移动' })).toBeEnabled();
});
test('click controls move a card without dragging', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: '移动 检查布局', exact: true }).click();
  await page.getByRole('button', { name: '下一列', exact: true }).click();
  await expect(
    page
      .getByRole('region', { name: '进行中', exact: true })
      .getByText('检查布局', { exact: true }),
  ).toBeVisible();
});
test('Controls recover failed save and toggle readonly in the same Story', async ({ page }) => {
  await page.goto(`${storybook}/?path=/story/复杂-kanban-看板--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('button', { name: '移动 检查布局', exact: true })).toBeVisible({
    timeout: 20000,
  });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('label[for="control-failSave"]').getByText('True', { exact: true }).click();
  await expect(page.getByRole('switch', { name: 'failSave', exact: true })).toBeChecked();
  await frame.getByRole('button', { name: '移动 检查布局', exact: true }).press('Alt+ArrowRight');
  await expect(frame.getByRole('alert')).toHaveText('本地保存失败');
  await page.locator('label[for="control-failSave"]').getByText('False', { exact: true }).click();
  await expect(page.getByRole('switch', { name: 'failSave', exact: true })).not.toBeChecked();
  await frame.getByRole('button', { name: '重试移动' }).click();
  await expect(frame.getByRole('alert')).toHaveCount(0);
  await expect(
    frame
      .getByRole('region', { name: '进行中', exact: true })
      .getByText('检查布局', { exact: true }),
  ).toBeVisible();
  await page.locator('label[for="control-readOnly"]').getByText('True', { exact: true }).click();
  await expect(frame.getByRole('button', { name: '移动 检查布局', exact: true })).toBeDisabled();
  expect(new URL(page.url()).searchParams.get('path')).toBe('/story/复杂-kanban-看板--playground');
});
for (const theme of ['dark', 'light'])
  for (const density of ['compact', 'comfortable'])
    test(`${theme}/${density}: narrow board keeps scrolling inside the surface`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 850 });
      await page.goto(
        `${storybook}/iframe.html?id=复杂-kanban-看板--playground&viewMode=story&globals=theme:${theme};density:${density}`,
      );
      const card = page.getByRole('button', { name: '移动 检查布局', exact: true });
      await card.focus();
      await card.press('Alt+ArrowRight');
      await expect(card).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: `.logs/kanban/${theme}-${density}.png`, fullPage: true });
    });
