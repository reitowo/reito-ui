import { storybookUrl } from './select-option';
import { expect, test, type Locator, type Page } from '@playwright/test';

async function openDemo(page: Page, theme = 'dark', density = 'compact') {
  await page.addInitScript(({ theme, density }) => {
    localStorage.setItem('reito-theme', theme);
    localStorage.setItem('reito-density', density);
  }, { theme, density });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?layer=basic&component=popover');
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(page.locator('html')).toHaveAttribute('data-density', density);
  const trigger = page.locator('.lab-demo').getByRole('button', { name: '查看请求路径', exact: true });
  await expect(trigger).toBeVisible();
  await trigger.scrollIntoViewIfNeeded();
  return trigger;
}

async function expectInlineRows(rows: Locator, density: string) {
  const geometry = await rows.evaluateAll(elements => elements.map(element => {
    const row = element.getBoundingClientRect();
    const label = element.querySelector('[data-slot="popover-list-label"]')!.getBoundingClientRect();
    const metadata = element.querySelector('[data-slot="popover-list-metadata"]')!.getBoundingClientRect();
    return {
      height: row.height,
      centers: Math.abs((label.top + label.height / 2) - (metadata.top + metadata.height / 2)),
      gap: metadata.left - label.right,
      contained: label.left >= row.left && metadata.right <= row.right + 1,
    };
  }));
  for (const row of geometry) {
    expect(row.height).toBeGreaterThanOrEqual(density === 'compact' ? 30 : 38);
    expect(row.height).toBeLessThanOrEqual(density === 'compact' ? 34 : 42);
    expect(row.centers).toBeLessThanOrEqual(2);
    expect(row.gap).toBeGreaterThanOrEqual(0);
    expect(row.contained).toBe(true);
  }
}

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  for (const width of [1280, 390]) {
    test(`${theme}/${density} at ${width}px: request paths stay on one line without expanding their host`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      const trigger = await openDemo(page, theme, density);
      const host = page.locator('.lab-demo');
      const before = { trigger: await trigger.boundingBox(), host: await host.boundingBox() };
      await trigger.click();
      const popup = page.locator('[data-slot="popover-content"]');
      await expect(popup).toBeVisible();
      const list = popup.getByRole('list');
      const rows = list.getByRole('listitem');
      await expect(rows).toHaveCount(3);
      await expect(rows.locator('[data-slot="popover-list-label"]')).toHaveText(['/health', '/health/readiness', '路径未记录']);
      await expect(rows.locator('[data-slot="popover-list-metadata"]')).toHaveText([/HEAD.*16/, /HEAD.*3/, /HEAD.*2/]);
      await expectInlineRows(rows, density);
      // An anchored portal must not turn the table/host into an expanded row.
      await expect(host.locator('[data-slot="popover-content"]')).toHaveCount(0);
      expect(await trigger.boundingBox()).toEqual(before.trigger);
      expect(await host.boundingBox()).toEqual(before.host);
      await expect.poll(async () => {
        const rect = (await popup.boundingBox())!;
        return rect.x >= -1 && rect.x + rect.width <= width + 1;
      }).toBe(true);
      await expect(popup.getByRole('link')).toHaveCount(0);
      await page.keyboard.press('Escape');
      await expect(popup).toBeHidden();
      await expect(trigger).toBeFocused();
    });
  }
}

test('keyboard activation and Escape restore the trigger; outside click dismisses the list', async ({ page }) => {
  const trigger = await openDemo(page);
  await trigger.focus();
  await trigger.press('Enter');
  const popup = page.locator('[data-slot="popover-content"]');
  await expect(popup).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(popup).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();

  await trigger.press('Space');
  await expect(popup).toBeVisible();
  await page.locator('.lab-component-heading h1').click();
  await expect(popup).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

// These scenarios use the existing Storybook server, as the other story interaction suites do.
async function openStory(page: Page, story: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${storybookUrl}/iframe.html?id=基础-popover--${story}&viewMode=story&globals=theme:dark;density:compact`);
  const popup = page.getByRole('dialog', { name: '请求路径', exact: true });
  await expect(popup).toBeVisible({ timeout: 15_000 });
  return popup;
}

test('long lists scroll by keyboard and preserve the full path while keeping metadata on its line', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  const popup = await openStory(page, 'long-list');
  const list = popup.getByRole('list', { name: '请求路径列表', exact: true });
  const rows = list.getByRole('listitem');
  await expect(rows).toHaveCount(30);
  const fullPath = '/api/v1/workspaces/research/requests/0/observations/details';
  await expect(rows.first().getByTitle(fullPath, { exact: true })).toHaveText(fullPath);
  await expectInlineRows(rows, 'compact');
  const rect = (await popup.boundingBox())!;
  expect(rect.x).toBeGreaterThanOrEqual(-1);
  expect(rect.x + rect.width).toBeLessThanOrEqual(391);
  expect(await list.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  await list.focus();
  await page.keyboard.press('End');
  await expect.poll(() => list.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await expect(rows.last()).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(popup).toBeHidden();
  await expect(page.getByRole('button', { name: '查看请求路径', exact: true })).toBeFocused();
});

test('stacked layout remains available only through its explicit story', async ({ page }) => {
  const popup = await openStory(page, 'stacked-list');
  const rows = popup.getByRole('listitem');
  await expect(rows).toHaveCount(3);
  const geometry = await rows.evaluateAll(elements => elements.map(element => {
    const label = element.querySelector('[data-slot="popover-list-label"]')!.getBoundingClientRect();
    const metadata = element.querySelector('[data-slot="popover-list-metadata"]')!.getBoundingClientRect();
    return { metadataBelowLabel: metadata.top >= label.bottom, sameLeft: Math.abs(metadata.left - label.left) < 1 };
  }));
  expect(geometry.every(row => row.metadataBelowLabel && row.sameLeft)).toBe(true);
});

test('empty evidence has a readable status without placeholder rows', async ({ page }) => {
  const popup = await openStory(page, 'empty-list');
  await expect(popup.getByRole('status')).toHaveText('暂无请求路径');
  await expect(popup.getByRole('listitem')).toHaveCount(0);
});
