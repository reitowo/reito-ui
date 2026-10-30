import { expect, test } from '@playwright/test';

test('compiled package exports one named dashboard family and removes retired layout entries', async ({
  page,
}) => {
  await page.goto('/?page=regions');
  await expect(page.getByTestId('layout-exports')).toHaveText(
    JSON.stringify({ retired: [], dashboard: true, workspace: true }),
  );
});

for (const theme of ['light', 'dark']) {
  for (const density of ['compact', 'comfortable', 'dense']) {
    test(`grouped regions preserve one inset and page rhythm: ${theme}/${density}`, async ({
      page,
    }, info) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`/?page=regions&theme=${theme}&density=${density}`);
      const edge = { compact: 14, comfortable: 18, dense: 10 }[density];
      const vertical = { compact: 12, comfortable: 16, dense: 8 }[density];
      await expect(page.locator('[data-slot=page]')).toHaveCSS('padding-left', `${edge}px`);
      await expect(page.locator('[data-slot=page]')).toHaveCSS('padding-right', `${edge}px`);
      await expect(page.locator('[data-slot=page]')).toHaveCSS('padding-top', `${vertical}px`);
      await expect(page.locator('[data-slot=page]')).toHaveCSS('padding-bottom', `${vertical}px`);
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

for (const theme of ['light', 'dark']) {
  for (const density of ['compact', 'comfortable', 'dense']) {
    test(`dashboard owns navigation, collapse and draft preservation: ${theme}/${density}`, async ({
      page,
    }, info) => {
      await page.goto(`/?page=dashboard&theme=${theme}&density=${density}`);
      const group = page.locator('[data-slot=dashboard-group]');
      const panel = page.locator('[data-slot=dashboard-panel]');
      await expect(group).toHaveAttribute('data-layout', 'wide');
      const rows = await page
        .getByRole('navigation')
        .locator('a')
        .evaluateAll((items) =>
          items.map((e) => ({
            width: e.getBoundingClientRect().width,
            available: e.parentElement!.getBoundingClientRect().width,
          })),
        );
      for (const row of rows) expect(Math.abs(row.width - row.available)).toBeLessThan(1);
      const footer = await page.locator('[data-slot=sidebar-footer]').boundingBox();
      const groupBox = await group.boundingBox();
      expect(footer!.y + footer!.height).toBeCloseTo(groupBox!.y + groupBox!.height, 0);
      await page.getByRole('tab', { name: '权限档位', exact: true }).click();
      const draft = page.getByLabel('档位名称草稿');
      await draft.fill('保留配置草稿');
      const mainBefore = await panel.boundingBox();
      await page.getByRole('button', { name: '收起导航', exact: true }).click();
      await expect
        .poll(async () => (await panel.boundingBox())!.width)
        .toBeGreaterThan(mainBefore!.width);
      await expect(draft).toHaveValue('保留配置草稿');
      await page.getByRole('button', { name: '展开导航', exact: true }).click();
      await expect(draft).toHaveValue('保留配置草稿');
      await expect
        .poll(async () => (await panel.boundingBox())!.width)
        .toBeCloseTo(mainBefore!.width, 0);
      await page.screenshot({ path: info.outputPath('dashboard-desktop.png') });
      await page.setViewportSize({ width: 390, height: 900 });
      await expect(group).toHaveAttribute('data-layout', 'narrow');
      const widthBefore = (await panel.boundingBox())!.width;
      await page.getByRole('button', { name: '打开导航', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: '应用导航', exact: true });
      await expect(dialog).toBeVisible();
      expect((await panel.boundingBox())!.width).toBe(widthBefore);
      await page.screenshot({ path: info.outputPath('dashboard-mobile-open.png') });
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(page.getByRole('button', { name: '打开导航', exact: true })).toBeFocused();
      await expect(draft).toHaveValue('保留配置草稿');
      await page.getByRole('button', { name: '打开导航', exact: true }).click();
      await dialog.getByRole('link', { name: '消息接纳', exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect(page.getByRole('heading', { name: '消息接纳', exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  }
}

test('narrow embedded dashboard uses its own width inside a desktop window', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/?page=dashboard&bounded=1');
  const group = page.locator('[data-slot=dashboard-group]');
  await expect(group).toHaveAttribute('data-layout', 'narrow');
  expect((await group.boundingBox())!.width).toBeLessThan(500);
  await page.getByRole('tab', { name: '权限档位', exact: true }).click();
  await page.getByRole('button', { name: '打开导航', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '应用导航', exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('dashboard-bounded.png') });
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('档位名称草稿')).toBeVisible();
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
