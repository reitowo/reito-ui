import { expect, test } from '@playwright/test';

test('closing restores focus and reopening preserves the draft', async ({ page }) => {
  await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-chatoverlay--playground&viewMode=story');
  const trigger = page.getByRole('button', { name: '打开助手' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: '工作区助手' });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole('textbox', { name: '消息草稿' });
  await input.fill('关闭后保留');
  await input.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(input).toHaveValue('关闭后保留');
  await input.press('Enter');
  await expect(dialog.getByText('关闭后保留', { exact: true })).toBeVisible();
  await expect(input).toHaveValue('');
});

test('stopping the host run leaves the dialog open', async ({ page }) => {
  await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-chatoverlay--running&viewMode=story');
  await page.getByRole('button', { name: '停止生成' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: '发送消息' })).toBeVisible();
});

test('controlled Controls open and close the overlay without losing the draft', async ({ page }) => {
  await page.goto('http://127.0.0.1:6007/?path=/story/ai-chatoverlay--playground');
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('button', { name: '打开助手' })).toBeVisible();
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('label[for="control-open"]').click();
  await expect(frame.getByRole('dialog')).toBeVisible();
  await frame.getByRole('textbox', { name: '消息草稿' }).fill('受控草稿');
  await page.locator('[id="control-title"]').fill('审查助手');
  await expect(frame.getByRole('dialog', { name: '审查助手' })).toBeVisible();
  await page.locator('label[for="control-open"]').click();
  await expect(frame.getByRole('dialog')).toHaveCount(0);
  await page.locator('label[for="control-open"]').click();
  await expect(frame.getByRole('textbox', { name: '消息草稿' })).toHaveValue('受控草稿');
});

test('failed submission remains retryable after closing and reopening', async ({ page }) => {
  await page.goto('http://127.0.0.1:6007/iframe.html?id=ai-chatoverlay--failure-recovery&viewMode=story');
  const input = page.getByRole('textbox', { name: '消息草稿' });
  await input.fill('失败保留');
  await input.press('Enter');
  await expect(page.getByRole('alert')).toHaveText('本地提交失败，请重试');
  await page.getByRole('button', { name: '关闭助手' }).click();
  await page.getByRole('button', { name: '打开助手' }).click();
  await expect(input).toHaveValue('失败保留');
  await input.press('Enter');
  await expect(input).toHaveValue('');
  await expect(page.getByRole('article')).toContainText('失败保留');
});

for (const theme of ['dark','light']) for (const density of ['compact','comfortable']) test(`small window ${theme}/${density} keeps send and close accessible`, async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 480 });
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=ai-chatoverlay--open&viewMode=story&globals=theme:${theme};density:${density}`);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: '关闭助手' })).toBeInViewport();
  await expect(page.getByRole('button', { name: '发送消息' })).toBeInViewport();
  expect(await dialog.evaluate(element => { const box = element.getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight; })).toBe(true);
  await page.screenshot({ path: `.logs/chat-overlay-${theme}-${density}.png` });
});
