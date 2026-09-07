import { expect, test, type Page } from '@playwright/test';

const prefix = '复杂-propertylist-属性编辑';

async function open(page: Page, story = 'transactional', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  await expect(page.locator('section[aria-label="属性"]')).toBeVisible({ timeout: 15_000 });
}

async function changeField(page: Page, label: string, value: string) {
  await page.getByRole('button', { name: `编辑${label}` }).click();
  const input = page.getByLabel(label);
  await input.fill(value);
  await page.getByRole('button', { name: '保存字段' }).click();
}

test('row saves remain draft changes until the list transaction succeeds', async ({ page }) => {
  await open(page);
  await changeField(page, '工作区名称', '已提交工作区');
  await expect(page.getByRole('status')).toHaveText('1 项更改尚未保存');
  await expect(page.getByTestId('property-receipt')).toHaveText('尚未提交');
  await page.getByRole('button', { name: '保存全部' }).click();
  await expect(page.getByRole('status')).toHaveText('全部更改已保存');
  await expect(page.getByTestId('property-receipt')).toHaveText('已提交 已提交工作区 / 30 天');
  await expect(page.getByRole('button', { name: '保存全部' })).toBeDisabled();
});

test('cross-field errors are attached to and focus the first invalid property', async ({ page }) => {
  await open(page);
  await changeField(page, '保留天数', '3');
  await page.getByRole('button', { name: '保存全部' }).click();
  const row = page.locator('[data-property-key="retention"]');
  await expect(row).toBeFocused();
  await expect(row.getByRole('alert')).toHaveText('自动保存开启时至少保留 7 天');
  await expect(page.getByRole('status')).toHaveText('校验未通过');
  await expect(page.getByText('3', { exact: true })).toBeVisible();
});

test('server field errors preserve drafts and clear when the field changes', async ({ page }) => {
  await open(page);
  await changeField(page, '工作区名称', '占用名称');
  await page.getByRole('button', { name: '保存全部' }).click();
  const row = page.locator('[data-property-key="name"]');
  await expect(row).toBeFocused();
  await expect(row.getByRole('alert')).toHaveText('这个工作区名称已被占用');
  await expect(page.getByText('占用名称', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '编辑工作区名称' }).click();
  await page.getByLabel('工作区名称').fill('可用名称');
  await expect(row.getByRole('alert')).toHaveCount(0);
});

test('cancel restores the last successful baseline in one batch', async ({ page }) => {
  await open(page);
  await changeField(page, '工作区名称', '临时名称');
  await changeField(page, '保留天数', '20');
  await expect(page.getByRole('status')).toHaveText('2 项更改尚未保存');
  await page.getByRole('button', { name: '取消更改' }).click();
  await expect(page.getByText('Graphite 工作区', { exact: true })).toBeVisible();
  await expect(page.getByText('30', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('已恢复到最近一次保存');
});

test('reset applies defaults but keeps them pending until batch submit', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: '恢复默认' }).click();
  await expect(page.getByText('个人工作区', { exact: true })).toBeVisible();
  await expect(page.getByText('14', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('已恢复默认值，尚未保存');
  await expect(page.getByRole('button', { name: '保存全部' })).toBeEnabled();
});

test('global async failure keeps the current draft available for retry', async ({ page }) => {
  await open(page, 'submit-failure');
  await changeField(page, '工作区名称', '离线草稿');
  await page.getByRole('button', { name: '保存全部' }).click();
  await expect(page.getByRole('alert')).toHaveText('本地设置服务暂时不可用，草稿仍然保留。');
  await expect(page.getByRole('status')).toHaveText('保存失败，草稿已保留');
  await expect(page.getByText('离线草稿', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '保存全部' })).toBeEnabled();
  await page.getByRole('button', { name: '编辑工作区名称' }).click();
  await page.getByLabel('工作区名称').fill('修正后的离线草稿');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: transaction actions remain compact at narrow width`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 800 });
  await open(page, 'transactional', `theme:${theme};density:${density}`);
  await expect(page.getByRole('button', { name: '保存全部' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/property-list-transaction/${theme}-${density}.png`, fullPage: true });
});
