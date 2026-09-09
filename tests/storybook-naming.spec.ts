import { expect, test } from '@playwright/test';
const base = process.env.STORYBOOK_URL || 'http://127.0.0.1:6007';

test('index uses bilingual family titles and explicit Chinese presets', async ({ request }) => {
  const response = await request.get(`${base}/index.json`);
  expect(response.ok()).toBe(true);
  const index = await response.json();
  for (const entry of Object.values(index.entries) as { id: string; title: string; name: string; type: string }[]) {
    expect(entry.title).toMatch(/^(基础|复杂|AI)\/[A-Za-z][A-Za-z0-9]* [\u3400-\u9fff][^/]*$/);
    if (entry.type === 'story') {
      expect(entry.name).toMatch(/[\u3400-\u9fff]/);
      if (entry.id.endsWith('--playground')) expect(entry.name).toBe('参数调试');
    }
  }
  for (const id of ['基础-accordion--playground', '复杂-diffviewer-差异查看--playground', 'ai-markdowncontent-richmessage--playground', '基础-accordion--docs']) {
    expect(index.entries[id], id).toBeTruthy();
  }
});

test('existing Accordion URL keeps live Controls and translated documentation label', async ({ page }) => {
  await page.goto(`${base}/?path=/story/基础-accordion--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('button', { name: '如何统一主题？' })).toBeEnabled();
  await expect(page.getByText('Accordion 折叠面板', { exact: true })).toBeVisible();
  await expect(page.getByText('使用文档', { exact: true }).first()).toBeVisible();
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('label[for="control-disabled"]').click();
  await expect(frame.getByRole('button', { name: '如何统一主题？' })).toBeDisabled();
  await page.screenshot({ path: '.logs/story-naming-sidebar.png' });
  await page.getByText('使用文档', { exact: true }).first().click();
  await expect.poll(() => new URL(page.url()).searchParams.get('path')).toBe('/docs/基础-accordion--docs');
});
