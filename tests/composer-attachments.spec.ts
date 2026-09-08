import { expect, test } from '@playwright/test';

async function open(page: import('@playwright/test').Page, story = 'local-attachments') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=ai-composer--${story}&viewMode=story`);
  await expect(page.getByRole('textbox', { name: '消息草稿' })).toBeVisible();
  return page.locator('input[type=file]');
}

test('attachment-only submit carries the file and clears the queue', async ({ page }) => {
  const picker = await open(page);
  await picker.setInputFiles({ name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await page.getByRole('button', { name: '发送消息' }).click();
  await expect(page.getByLabel('附件提交结果')).toContainText('note.txt');
  await expect(page.locator('[data-file-id]')).toHaveCount(0);
});

test('paste and drop use the same validated queue without replacing text', async ({ page }) => {
  await open(page);
  const input = page.getByRole('textbox', { name: '消息草稿' });
  await input.fill('保留草稿');
  await input.evaluate(element => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(['a'], 'paste.txt', { type: 'text/plain' }));
    element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }));
  });
  await input.evaluate(element => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(['b'], 'drop.md', { type: 'text/markdown' }));
    element.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
  });
  await expect(page.locator('[data-file-id]')).toHaveCount(2);
  await expect(input).toHaveValue('保留草稿');
});

test('invalid size and type report errors and do not enter the draft', async ({ page }) => {
  const picker = await open(page);
  await picker.setInputFiles([{ name: 'bad.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('x') }, { name: 'large.txt', mimeType: 'text/plain', buffer: Buffer.alloc(1025) }]);
  await expect(page.getByRole('alert')).toContainText('文件类型不支持');
  await expect(page.getByRole('alert')).toContainText('超过');
  await expect(page.locator('[data-file-id]')).toHaveCount(0);
});

test('upload failures block send until retry succeeds', async ({ page }) => {
  const picker = await open(page, 'attachment-upload');
  await picker.setInputFiles({ name: 'upload.txt', mimeType: 'text/plain', buffer: Buffer.from('x') });
  await expect(page.getByRole('button', { name: '发送消息' })).toBeDisabled();
  await page.getByRole('button', { name: '开始', exact: true }).click();
  await expect(page.getByText('本地上传失败，请重试', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: '发送消息' })).toBeDisabled();
  await page.getByRole('button', { name: '重试', exact: true }).click();
  await expect(page.getByRole('button', { name: '发送消息' })).toBeEnabled();
  await page.getByRole('button', { name: '发送消息' }).click();
  await expect(page.getByLabel('附件提交结果')).toHaveText('upload.txt');
});

test('attachment Controls enforce limits and preserve failed drafts on the same page', async ({ page }) => {
  await page.goto('http://127.0.0.1:6007/?path=/story/ai-composer--attachment-playground');
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.getByRole('textbox', { name: '消息草稿' })).toBeVisible();
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('[id="control-maxFiles"]').fill('1');
  await expect(frame.getByText(/最多 1 个/)).toBeVisible();
  await frame.locator('input[type=file]').setInputFiles([{ name: 'one.txt', mimeType: 'text/plain', buffer: Buffer.from('a') }, { name: 'two.txt', mimeType: 'text/plain', buffer: Buffer.from('b') }]);
  await expect(frame.locator('[data-file-id]')).toHaveCount(1);
  await expect(frame.getByRole('alert')).toContainText('最多添加 1 个');
  await page.locator('label[for="control-failSubmit"]').click();
  await frame.getByRole('button', { name: '发送消息' }).click();
  await expect(frame.getByText('本地发送失败，附件已保留', { exact: true })).toBeVisible();
  await expect(frame.locator('[data-file-id]')).toHaveCount(1);
  await page.locator('label[for="control-disabled"]').click();
  await expect(frame.getByRole('button', { name: '移除 one.txt' })).toBeDisabled();
  await expect(frame.locator('button').filter({ hasText: '添加附件' })).toBeDisabled();
  await page.locator('label[for="control-disabled"]').click();
  await page.locator('label[for="control-failSubmit"]').click();
  await frame.getByRole('button', { name: '发送消息' }).click();
  await expect(frame.getByLabel('附件提交结果')).toContainText('one.txt');
  await expect(frame.locator('[data-file-id]')).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('path')).toBe('/story/ai-composer--attachment-playground');
});

test('canceling an attachment aborts upload and removal unlocks text submission', async ({ page }) => {
  const picker = await open(page, 'attachment-upload');
  await picker.setInputFiles({ name: 'cancel.txt', mimeType: 'text/plain', buffer: Buffer.from('x') });
  await page.getByRole('textbox', { name: '消息草稿' }).fill('继续发文字');
  await page.getByRole('button', { name: '开始', exact: true }).click();
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await expect(page.locator('[data-file-id]')).toHaveAttribute('data-status', 'canceled');
  await expect(page.getByRole('button', { name: '发送消息' })).toBeDisabled();
  await page.getByRole('button', { name: '移除 cancel.txt' }).click();
  await expect(page.getByRole('button', { name: '发送消息' })).toBeEnabled();
});

test('plain text paste is not canceled by the attachment handler', async ({ page }) => {
  await open(page);
  const canceled = await page.getByRole('textbox', { name: '消息草稿' }).evaluate(element => {
    const data = new DataTransfer(); data.setData('text/plain', '普通文字');
    const event = new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(canceled).toBe(false);
});

test('controlled removal aborts an uploading attachment without restoring the old draft', async ({ page }) => {
  const picker = await open(page, 'replace-uploading-attachment');
  await picker.setInputFiles({ name: 'old.txt', mimeType: 'text/plain', buffer: Buffer.from('x') });
  await page.getByRole('button', { name: '开始', exact: true }).click();
  await expect(page.locator('[data-file-id]')).toHaveAttribute('data-status', 'uploading');
  await page.getByRole('button', { name: '替换附件草稿' }).click();
  await expect(page.getByLabel('旧上传状态')).toHaveText('已中止');
  await expect(page.locator('[data-file-id]')).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: '消息草稿' })).toHaveValue('新草稿');
});
