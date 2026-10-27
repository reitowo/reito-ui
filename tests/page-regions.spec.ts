import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const density of ['compact', 'comfortable', 'dense']) {
    test(`grouped regions preserve one inset and page rhythm: ${theme}/${density}`, async ({
      page,
    }, info) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/?page=regions&theme=${theme}&density=${density}`);
      const region = page.getByRole('region', { name: '申请记录', exact: true });
      await expect(region).toBeVisible();
      expect(await page.locator('[data-slot=page-content]').count()).toBe(1);
      expect(await region.locator('[data-slot=panel-body]').count()).toBe(1);
      await expect(region.locator('[data-slot=panel-body]')).toHaveCSS('padding', '0px');
      const geometry = await page.locator('[data-slot=page]').evaluate((element) => {
        const header = element.querySelector('[data-slot=page-header]')!.getBoundingClientRect();
        const content = element.querySelector('[data-slot=page-content]')!.getBoundingClientRect();
        return { gap: content.top - header.bottom, margin: getComputedStyle(element).marginTop };
      });
      expect(geometry).toEqual({
        gap: { compact: 16, comfortable: 20, dense: 12 }[density],
        margin: '0px',
      });
      await expect(region.getByText('暂无申请', { exact: true })).toBeVisible();
      await expect(region.getByText('本地展示示例，不执行真实业务操作。')).toBeVisible();
      await page.getByRole('tab', { name: '权限档位', exact: true }).click();
      await page.getByLabel('档位名称草稿').fill('保存本地草稿');
      await page.getByRole('tab', { name: '申请记录', exact: true }).click();
      await page.getByRole('tab', { name: '权限档位', exact: true }).click();
      await expect(page.getByLabel('档位名称草稿')).toHaveValue('保存本地草稿');
      const content = page
        .getByRole('region', { name: '权限档位', exact: true })
        .locator('[data-slot=panel-body]');
      await expect(content).toHaveCSS(
        'padding',
        `${{ compact: 12, comfortable: 16, dense: 8 }[density]}px`,
      );
      await page.setViewportSize({ width: 390, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: info.outputPath('regions-narrow.png'), fullPage: true });
      expect(errors).toEqual([]);
    });
  }
}

test('regional shell and both page states work without application CSS', async ({ page }, info) => {
  await page.goto('/?page=shell&theme=light');
  await expect(page.getByRole('main')).toBeVisible();
  const placement = await page.locator('[data-slot=shell]').evaluate((element) => {
    const sidebar = element.querySelector('[data-slot=shell-sidebar]')!.getBoundingClientRect();
    const main = element.querySelector('[data-slot=shell-main]')!.getBoundingClientRect();
    return {
      sidebarRight: sidebar.right,
      mainLeft: main.left,
      sidebarTop: sidebar.top,
      mainTop: main.top,
    };
  });
  expect(placement.sidebarRight).toBeLessThanOrEqual(placement.mainLeft);
  expect(placement.sidebarTop).toBe(placement.mainTop);
  await expect(page.getByRole('region', { name: '主内容', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '模型权限申请', exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('regions-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: '消息接纳', exact: true }).click();
  await expect(page.getByRole('heading', { name: '消息接纳', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.getByRole('button', { name: '权限申请', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: '接纳记录', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const [state, text] of [
    ['loading', '正在读取记录…'],
    ['error', '读取失败'],
    ['records', '张晓明'],
  ]) {
    await page.goto(`/?page=regions&kind=admissions&state=${state}`);
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  }
});

test('grouped Page follows public theme overrides and Panel titles remain unique', async ({
  page,
}) => {
  await page.goto('/?page=regions&pageGap=1');
  const facts = await page.locator('[data-slot=page]').evaluate((element) => {
    const header = element.querySelector('[data-slot=page-header]')!.getBoundingClientRect();
    const content = element.querySelector('[data-slot=page-content]')!.getBoundingClientRect();
    const panels = [...element.querySelectorAll('[data-slot=panel]')];
    return {
      gap: content.top - header.bottom,
      ids: panels.map((panel) => panel.getAttribute('aria-labelledby')),
      resolved: panels.every(
        (panel) => !!document.getElementById(panel.getAttribute('aria-labelledby')!),
      ),
    };
  });
  expect(facts.gap).toBe(24);
  expect(new Set(facts.ids).size).toBe(facts.ids.length);
  expect(facts.resolved).toBe(true);
});
