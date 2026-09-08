import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, story = 'playground') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=ai-composer--${story}&viewMode=story`);
  const input = page.getByRole('textbox', { name: '消息草稿' });
  await expect(input).toBeVisible();
  return input;
}

test('legacy input does not open suggestions for literal slash and at characters', async ({ page }) => {
  const input = await open(page, 'empty');
  await input.fill('/literal @someone');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await input.press('Enter');
  await expect(input).toHaveValue('');
});

test('empty suggestions cannot accidentally submit a draft', async ({ page }) => {
  const input = await open(page);
  await input.fill('@missing');
  await expect(page.getByRole('listbox')).toContainText('没有匹配项');
  await input.press('Enter');
  await expect(input).toHaveValue('@missing');
  await input.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await input.press('Enter');
  await expect(input).toHaveValue('');
});

test('Shift Enter creates a line break even when a suggestion is selected', async ({ page }) => {
  const input = await open(page);
  await input.fill('/rev');
  await input.press('Shift+Enter');
  await expect(input).toHaveValue('/rev\n');
  await expect(page.getByRole('listbox')).toHaveCount(0);
});

test('keyboard navigation selects another command without submitting', async ({ page }) => {
  const input = await open(page);
  await input.fill('/');
  await input.press('ArrowDown');
  await expect(page.getByRole('option', { name: /explain/ })).toHaveAttribute('aria-selected', 'true');
  await input.press('Enter');
  await expect(input).toHaveValue('请解释当前文件：');
});

test('editing before a mention retains its reference and removal targets the shifted range', async ({ page }) => {
  const input = await open(page);
  await input.fill('@des');
  await input.press('Enter');
  await expect(input).toHaveValue('@design-language.md ');
  await input.press('Home');
  await input.pressSequentially('review ');
  await page.getByRole('button', { name: '移除@design-language.md' }).click();
  await expect(input).toHaveValue('review ');
});

test('editing inside a mention drops the reference while preserving user text', async ({ page }) => {
  const input = await open(page);
  await input.fill('@des');
  await input.press('Enter');
  await input.press('Home');
  await input.press('ArrowRight');
  await input.press('Delete');
  await expect(input).toHaveValue('@esign-language.md ');
  await expect(page.getByRole('button', { name: '移除@design-language.md' })).toHaveCount(0);
});

test('composition Enter does not select a suggestion or submit', async ({ page }) => {
  const input = await open(page);
  await input.fill('@des');
  await input.dispatchEvent('compositionstart');
  await input.dispatchEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 229, isComposing: true });
  await expect(input).toHaveValue('@des');
  await expect(page.getByRole('button', { name: '移除@design-language.md' })).toHaveCount(0);
  await input.dispatchEvent('compositionend');
  await input.press('Enter');
  await expect(input).toHaveValue('@design-language.md ');
});

test('structured failure preserves mentions and context IDs and retries the same draft', async ({ page }) => {
  const input = await open(page, 'structured-failure');
  await input.press('Enter');
  await expect(page.getByRole('alert')).toHaveText('本地提交失败，保留全部草稿');
  await expect(input).toHaveValue('@Reito 检查布局');
  await expect(page.getByRole('button', { name: '移除@Reito' })).toBeVisible();
  await input.press('Enter');
  await expect(input).toHaveValue('');
  const receipt = JSON.parse(await page.getByLabel('提交结果').innerText());
  expect(receipt.contextIds).toEqual(['workspace-42']);
  expect(receipt.mentions).toEqual([{ key: 'person:reito:1', itemId: 'reito', label: 'Reito', kind: 'person', start: 0, end: 6 }]);
});

test('keyboard selection scrolls long suggestions into view', async ({ page }) => {
  const input = await open(page, 'long-suggestions');
  await input.fill('/');
  for (let index = 0; index < 25; index += 1) await input.press('ArrowDown');
  const option = page.getByRole('option', { name: '/command-25 本地命令 26', exact: true });
  await expect(option).toHaveAttribute('aria-selected', 'true');
  const visible = await option.evaluate(element => {
    const container = element.closest('[role="listbox"]')!;
    const row = element.getBoundingClientRect();
    const viewport = container.getBoundingClientRect();
    return row.top >= viewport.top && row.bottom <= viewport.bottom && container.scrollTop > 0;
  });
  expect(visible).toBe(true);
  await expect(input).toBeFocused();
  await input.press('Enter');
  await expect(input).toHaveValue('命令 26');
});

test('a completed old submission preserves a replacement structured draft', async ({ page }) => {
  const input = await open(page, 'replace-pending-draft');
  await input.press('Enter');
  await expect(input).toBeDisabled();
  await page.getByRole('button', { name: '宿主替换草稿' }).click();
  await expect(input).toHaveValue('@Reito 新草稿');
  await page.getByRole('button', { name: '完成旧请求' }).click();
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue('@Reito 新草稿');
  await expect(page.getByRole('button', { name: '移除@Reito' })).toBeVisible();
  await expect(page.getByText('replacement', { exact: true })).toBeVisible();
});

test('Controls edit Composer props on the same Story', async ({ page }) => {
  await page.goto('http://127.0.0.1:6007/?path=/story/ai-composer--playground');
  const frame = page.frameLocator('#storybook-preview-iframe');
  const input = frame.getByRole('textbox', { name: '消息草稿' });
  await expect(input).toBeVisible();
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('[id="control-value"]').fill('@des');
  await expect(input).toHaveValue('@des');
  await input.click();
  await input.press('End');
  await expect(frame.getByRole('listbox')).toBeVisible();
  await page.locator('label[for="control-enableMentions"]').click();
  await expect(frame.getByRole('listbox')).toHaveCount(0);
  await page.locator('label[for="control-disabled"]').click();
  await expect(input).toBeDisabled();
  await page.locator('[id="control-error"]').fill('外部校验错误');
  await expect(frame.getByRole('alert')).toHaveText('外部校验错误');
  expect(new URL(page.url()).searchParams.get('path')).toBe('/story/ai-composer--playground');
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`narrow Composer ${theme}/${density}`, async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=ai-composer--playground&viewMode=story&globals=theme:${theme};density:${density}`);
  const input = page.getByRole('textbox', { name: '消息草稿' });
  await input.fill('@');
  await expect(page.getByRole('listbox')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await input.press('Enter');
  await expect(page.getByRole('button', { name: '移除@design-language.md' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/composer-narrow-${theme}-${density}.png` });
});
