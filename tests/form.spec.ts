import { chooseSelectOption } from './select-option';
import { test, expect, type Locator, type Page } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const axeSource = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const screenshotDirectory = new URL('../.logs/form/', import.meta.url);
const errors = new WeakMap<Page, string[]>();

test.use(process.env.REITO_LAB_URL ? { baseURL: process.env.REITO_LAB_URL } : {});

test.beforeEach(async ({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on('pageerror', error => messages.push(error.message));
  page.on('console', message => { if (message.type() === 'error') messages.push(message.text()); });
});

test.afterEach(async ({ page }) => expect(errors.get(page)).toEqual([]));

async function openForm(page: Page) {
  await page.goto('/?layer=complex&component=form');
  const form = page.getByRole('form', { name: '工作区设置', exact: true });
  await expect(form).toBeVisible();
  return {
    form,
    name: form.getByRole('textbox', { name: '工作区名称', exact: true }),
    email: form.getByRole('textbox', { name: '通知邮箱', exact: true }),
    confirmation: form.getByRole('textbox', { name: '确认邮箱', exact: true }),
    notifications: form.getByRole('checkbox', { name: '启用通知', exact: true }),
    save: form.getByRole('button', { name: '保存设置', exact: true }),
    reset: form.getByRole('button', { name: '重置', exact: true }),
    outcome: page.getByRole('combobox', { name: '提交结果', exact: true }),
    status: page.getByRole('status').filter({ hasText: '已保存本地设置' }),
    payload: page.getByLabel('提交数据', { exact: true }),
  };
}

async function expectAssociatedError(input: Locator, message: string) {
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect.poll(async () => input.evaluate(element => {
    const ids = [element.getAttribute('aria-describedby'), element.getAttribute('aria-errormessage')]
      .filter(Boolean).join(' ').split(/\s+/).filter(Boolean);
    return ids.map(id => document.getElementById(id)?.textContent ?? '').join(' ');
  })).toContain(message);
}

async function expectDefaults(fields: Awaited<ReturnType<typeof openForm>>) {
  await expect(fields.name).toHaveValue('Graphite 工作区');
  await expect(fields.email).toHaveValue('reito@example.com');
  await expect(fields.confirmation).toHaveValue('reito@example.com');
  await expect(fields.notifications).toBeChecked();
}

async function expectNoValidationErrors(form: Locator) {
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(0);
  await expect(form.getByText('名称至少需要 2 个字符', { exact: true })).toHaveCount(0);
  await expect(form.getByText('请输入有效邮箱', { exact: true })).toHaveCount(0);
  await expect(form.getByText('两次邮箱不一致', { exact: true })).toHaveCount(0);
}

test('form labels, errors and invalid-submit focus follow the fields', async ({ page }) => {
  const fields = await openForm(page);
  await expectDefaults(fields);
  await fields.name.fill('x');
  await fields.email.fill('invalid');
  await fields.confirmation.fill('different@example.com');
  await fields.save.click();
  await expectAssociatedError(fields.name, '名称至少需要 2 个字符');
  await expectAssociatedError(fields.email, '请输入有效邮箱');
  await expectAssociatedError(fields.confirmation, '两次邮箱不一致');
  await expect(fields.name).toBeFocused();
  await expect(fields.status).toHaveCount(0);

  await fields.name.fill('新的工作区');
  await fields.save.click();
  await expect(fields.email).toBeFocused();
  await fields.email.fill('new@example.com');
  await fields.save.click();
  await expect(fields.confirmation).toBeFocused();
  await fields.confirmation.fill('new@example.com');
  await fields.save.click();
  await expect(fields.status).toBeVisible();
  await expectNoValidationErrors(fields.form);
});

test('form submits a boolean false, locks every control and reports one successful receipt', async ({ page }) => {
  const fields = await openForm(page);
  await fields.name.fill('禁用通知的工作区');
  await fields.notifications.uncheck();
  await fields.save.click();
  await expect(fields.form.getByRole('button', { name: /保存中…/ })).toBeDisabled();
  // This reaches the form handler after React has rendered its busy state.
  await fields.form.dispatchEvent('submit');
  for (const input of [fields.name, fields.email, fields.confirmation, fields.notifications, fields.reset, fields.outcome]) {
    await expect(input).toBeDisabled();
  }
  await expect(fields.status).toBeVisible();
  await expect(page.getByText('提交次数=1', { exact: false })).toBeVisible();
  const submitted = JSON.parse(await fields.payload.innerText());
  expect(submitted.notifications).toBe(false);
  expect(Object.values(submitted)).toContain('禁用通知的工作区');
  await expect(fields.name).toHaveValue('禁用通知的工作区');
  await expect(fields.notifications).not.toBeChecked();
  await expect(fields.save).toBeEnabled();
});

test('form reset restores defaults and clears dirty validation errors', async ({ page }) => {
  const fields = await openForm(page);
  await fields.name.fill('x');
  await fields.email.fill('invalid');
  await fields.confirmation.fill('other@example.com');
  await fields.notifications.uncheck();
  await fields.save.click();
  await expectAssociatedError(fields.name, '名称至少需要 2 个字符');
  await fields.reset.click();
  await expectDefaults(fields);
  await expectNoValidationErrors(fields.form);
  await expect(fields.save).toBeEnabled();
  await fields.save.click();
  await expect(fields.status).toBeVisible();
});

test('form validates a keyboard Tab blur without waiting for a pointer gesture', async ({ page }) => {
  const fields = await openForm(page);
  await fields.name.fill('x');
  await fields.name.press('Tab');
  await expectAssociatedError(fields.name, '名称至少需要 2 个字符');
  await expect(fields.email).toBeFocused();
  await expect(fields.status).toHaveCount(0);
  await expect(fields.save).toBeEnabled();
});

test('form flushes a deferred blur when a pointer gesture is cancelled', async ({ page }) => {
  const fields = await openForm(page);
  await fields.name.fill('x');
  const checkbox = await fields.notifications.boundingBox();
  expect(checkbox).not.toBeNull();
  await page.mouse.move(checkbox!.x + checkbox!.width / 2, checkbox!.y + checkbox!.height / 2);
  await page.mouse.down();
  await expect(fields.name).not.toBeFocused();
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(fields.form.getByText('名称至少需要 2 个字符', { exact: true })).toHaveCount(0);
  // Playwright's mouse API has no cancellation method; dispatch the browser cancellation event.
  await fields.notifications.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse', bubbles: true });
  await page.mouse.move(10, 10);
  await page.mouse.up();
  await expectAssociatedError(fields.name, '名称至少需要 2 个字符');
  await expect(fields.status).toHaveCount(0);
  await fields.name.fill('取消手势后仍可保存');
  await fields.save.click();
  await expect(fields.status).toBeVisible();
});

test('form awaits asynchronous name validation and allows a corrected retry', async ({ page }) => {
  const fields = await openForm(page);
  await fields.name.fill('已占用');
  await fields.save.click();
  await expectAssociatedError(fields.name, '名称已被占用');
  await expect(fields.name).toBeFocused();
  await expect(fields.name).toHaveValue('已占用');
  await expect(fields.status).toHaveCount(0);
  await expect(fields.save).toBeEnabled();
  await fields.name.fill('可以使用的新名称');
  await fields.save.click();
  await expect(fields.status).toBeVisible();
  await expect(fields.name).not.toHaveAttribute('aria-invalid', 'true');
});

test('form retains the draft after a rejected submit and can retry successfully', async ({ page }) => {
  const fields = await openForm(page);
  await fields.name.fill('保存失败也保留的工作区');
  await fields.email.fill('draft@example.com');
  await fields.confirmation.fill('draft@example.com');
  await chooseSelectOption(fields.outcome, "本地保存失败");
  await fields.save.click();
  await expect(page.getByRole('alert').filter({ hasText: '本地保存失败' })).toBeVisible();
  await expect(fields.name).toHaveValue('保存失败也保留的工作区');
  await expect(fields.email).toHaveValue('draft@example.com');
  await expect(fields.confirmation).toHaveValue('draft@example.com');
  await expect(fields.save).toBeEnabled();
  await expect(fields.status).toHaveCount(0);
  await chooseSelectOption(fields.outcome, "本地成功");
  await fields.save.click();
  await expect(fields.status).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: '本地保存失败' })).toHaveCount(0);
});

test('form associates a submit-time field error with the email and retries without losing values', async ({ page }) => {
  const fields = await openForm(page);
  await chooseSelectOption(fields.outcome, "字段错误");
  await fields.save.click();
  await expectAssociatedError(fields.email, '邮箱暂不可用');
  await expect(fields.email).toBeFocused();
  await expectDefaults(fields);
  await chooseSelectOption(fields.outcome, "本地成功");
  await fields.save.click();
  await expect(fields.status).toBeVisible();
  await expect(fields.email).not.toHaveAttribute('aria-invalid', 'true');
});

test('form ignores repeated submit events delivered in the same tick', async ({ page }) => {
  const fields = await openForm(page);
  await fields.form.evaluate(element => {
    for (let attempt = 0; attempt < 3; attempt++) {
      element.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    }
  });
  await expect(fields.status).toBeVisible();
  await expect(fields.save).toBeEnabled();
  await expect(page.getByText('提交次数=1', { exact: false })).toBeVisible();
  await expect(page.getByText(/提交次数=[23]/)).toHaveCount(0);
});

test('form prevents IME confirmation Enter but accepts a subsequent ordinary Enter', async ({ page }) => {
  const fields = await openForm(page);
  await fields.name.focus();
  const prevention = await fields.name.evaluate(element => {
    const dispatchEnter = (options: KeyboardEventInit) => {
      const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true, ...options });
      element.dispatchEvent(event);
      return event.defaultPrevented;
    };
    const nativeFlag = dispatchEnter({ isComposing: true });
    element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '工' }));
    const compositionLifecycle = dispatchEnter({ isComposing: false });
    element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '工作区' }));
    const legacyKeyCode = dispatchEnter({ keyCode: 229 });
    return { nativeFlag, compositionLifecycle, legacyKeyCode };
  });
  expect(prevention).toEqual({ nativeFlag: true, compositionLifecycle: true, legacyKeyCode: true });
  await expect(fields.status).toHaveCount(0);
  await expect(fields.save).toBeEnabled();
  await fields.name.press('Enter');
  await expect(fields.status).toBeVisible();
  await expect(page.getByText('提交次数=1', { exact: false })).toBeVisible();
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`form ${theme}/${density}: accessible labels, error state and responsive layout`, async ({ page }) => {
    await page.addInitScript(({ theme, density }) => {
      localStorage.setItem('reito-theme', theme);
      localStorage.setItem('reito-density', density);
    }, { theme, density });
    await page.setViewportSize({ width: 1280, height: 800 });
    const fields = await openForm(page);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveAttribute('data-density', density);
    await expect(fields.name).toHaveCSS('height', density === 'compact' ? '32px' : '40px');
    await fields.name.fill('x');
    await fields.save.click();
    await expectAssociatedError(fields.name, '名称至少需要 2 个字符');
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => {
      const result = await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
      return result.violations.map((violation: any) => ({ id: violation.id, targets: violation.nodes.map((node: any) => node.target) }));
    });
    expect(violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.setViewportSize({ width: 1280, height: 1000 });
    mkdirSync(screenshotDirectory, { recursive: true });
    await page.screenshot({ path: fileURLToPath(new URL(`${theme}-${density}-validation.png`, screenshotDirectory)), fullPage: true, animations: 'disabled' });

    await page.setViewportSize({ width: 960, height: 720 });
    await expect(fields.save).toBeVisible();
    await expect(fields.reset).toBeVisible();
    expect(await fields.form.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
