import { expect, test, type Locator } from '@playwright/test';

async function gapBetween(first: Locator, second: Locator) {
  const above = await first.boundingBox();
  const below = await second.boundingBox();
  expect(above).not.toBeNull();
  expect(below).not.toBeNull();
  return below!.y - above!.y - above!.height;
}

for (const theme of ['light', 'dark']) {
  for (const density of ['compact', 'comfortable', 'dense'] as const) {
    test(`page and tabs share public theme spacing: ${theme}/${density}`, async ({
      page,
    }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const sectionGap = { compact: 16, comfortable: 20, dense: 12 }[density];
      const contentGap = { compact: 12, comfortable: 16, dense: 8 }[density];
      const relatedGap = { compact: 4, comfortable: 6, dense: 2 }[density];
      const height = { compact: 32, comfortable: 36, dense: 24 }[density];

      await page.goto(`/?page=knowledge&theme=${theme}&density=${density}`);
      const header = page.locator('[data-slot=page-header]');
      const body = page.locator('[data-slot=page-content]');
      expect(await gapBetween(header, body)).toBe(sectionGap);
      expect(
        await gapBetween(header.getByRole('heading'), header.locator('[data-slot=text]')),
      ).toBe(relatedGap);
      expect(
        await gapBetween(
          body.locator('[data-slot=panel]').first(),
          body.locator('[data-slot=layout-grid]'),
        ),
      ).toBe(contentGap);
      await page.screenshot({ path: testInfo.outputPath('content-page.png'), fullPage: true });

      for (const variant of ['line', 'default']) {
        await page.goto(`/?page=tabs&variant=${variant}&theme=${theme}&density=${density}`);
        const tabs = page.getByRole('tablist', { name: '模型权限管理' });
        const requests = page.getByRole('tab', { name: '申请记录', exact: true });
        const tiers = page.getByRole('tab', { name: '权限档位', exact: true });
        const panel = page.getByRole('tabpanel', { name: '申请记录', exact: true });
        expect(await gapBetween(header, body)).toBe(sectionGap);
        expect(await gapBetween(tabs, panel)).toBe(contentGap);
        await expect(requests).toHaveCSS('height', `${height}px`);
        await expect(requests).toHaveCSS('font-size', density === 'dense' ? '12px' : '13px');
        const selectedStyle = await requests.evaluate((element) => {
          const after = getComputedStyle(element, '::after');
          return { opacity: after.opacity, bottom: after.bottom, height: after.height };
        });
        if (variant === 'line') {
          await expect(tabs).toHaveCSS('border-bottom-width', '1px');
          await expect(tiers).toHaveCSS('border-left-width', '0px');
          await expect(tiers).toHaveCSS('border-right-width', '0px');
          expect(selectedStyle).toEqual({ opacity: '1', bottom: '-1px', height: '2px' });
        } else {
          await expect(tabs).toHaveCSS('border-radius', '6px');
          expect(selectedStyle.opacity).toBe('0');
        }
        await page.getByLabel('用途草稿').fill('切换页签后保留的草稿');
        await requests.focus();
        await page.keyboard.press('ArrowRight');
        await expect(tiers).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(tiers).toHaveAttribute('aria-selected', 'true');
        await expect(page.getByRole('tabpanel', { name: '权限档位', exact: true })).toBeVisible();
        await requests.click();
        await expect(page.getByLabel('用途草稿')).toHaveValue('切换页签后保留的草稿');
        await page.screenshot({ path: testInfo.outputPath(`tabs-${variant}.png`), fullPage: true });
        await page.setViewportSize({ width: 390, height: 900 });
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
          .toBe(true);
        expect(await tabs.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(
          true,
        );
        await page.keyboard.press('End');
        await expect(page.getByRole('tab', { name: '停用功能', exact: true })).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(requests).toHaveAttribute('aria-selected', 'true');
        await requests.click();
        await page.screenshot({
          path: testInfo.outputPath(`tabs-${variant}-narrow.png`),
          fullPage: true,
        });
        await page.setViewportSize({ width: 1280, height: 900 });
      }
      expect(errors).toEqual([]);
    });
  }
}

test('page gap follows a public theme override and vertical tabs retain their edge', async ({
  page,
}) => {
  await page.goto('/?page=tabs&pageGap&theme=light');
  expect(
    await gapBetween(
      page.locator('[data-slot=page-header]'),
      page.locator('[data-slot=page-content]'),
    ),
  ).toBe(24);
  await page.goto('/?page=tabs&orientation=vertical&theme=dark');
  const list = page.getByRole('tablist', { name: '模型权限管理' });
  await expect(list).toHaveAttribute('aria-orientation', 'vertical');
  await expect(list).toHaveCSS('border-right-width', '1px');
  const requests = page.getByRole('tab', { name: '申请记录', exact: true });
  expect(await requests.evaluate((element) => getComputedStyle(element, '::after').right)).toBe(
    '-1px',
  );
  await requests.focus();
  await page.keyboard.press('ArrowDown');
  const tiers = page.getByRole('tab', { name: '权限档位', exact: true });
  await expect(tiers).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(tiers).toHaveAttribute('aria-selected', 'true');
});
