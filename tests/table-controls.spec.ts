import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const density of ['compact', 'comfortable', 'dense']) {
    test(`table actions and portal boundaries: ${theme}/${density}`, async ({ page }, info) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/?page=table-controls&theme=${theme}&density=${density}`);
      const sortable = page.getByRole('table', { name: '排序表头' });
      const sort = sortable.getByRole('button', { name: '用户', exact: true });
      await expect(sort.locator('svg[aria-hidden="true"]')).toHaveCount(1);
      await expect(sort).toHaveText('用户');
      const offsets = await sortable.evaluate((table) => {
        const textLeft = (cell: Element) => {
          const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
          const text = walker.nextNode()!;
          const range = document.createRange();
          range.selectNodeContents(text);
          return range.getBoundingClientRect().left;
        };
        const headers = [...table.querySelectorAll('thead th')];
        const cells = [...table.querySelector('tbody tr')!.children];
        return headers.map((header, index) => textLeft(header) - textLeft(cells[index]));
      });
      for (const offset of offsets) expect(Math.abs(offset)).toBeLessThanOrEqual(1);
      await sort.focus();
      await page.keyboard.press('Enter');
      await expect(sort).toHaveAttribute('data-direction', 'ascending');
      await expect(sortable.locator('thead th').first()).toHaveAttribute('aria-sort', 'ascending');
      await page.keyboard.press('Space');
      await expect(sort).toHaveAttribute('data-direction', 'descending');
      await expect(sortable.getByRole('button', { name: '金额', exact: true })).toBeDisabled();
      const normal = { compact: 32, comfortable: 36, dense: 24 }[density];
      const small = { compact: 24, comfortable: 28, dense: 18 }[density];
      const large = { compact: 36, comfortable: 40, dense: 28 }[density];
      for (const name of ['row-button', 'row-disabled', 'row-themed-explicit']) {
        await expect(page.getByTestId(name)).toHaveCSS('height', `${small}px`);
      }
      await expect(page.getByTestId('row-disabled')).toBeDisabled();
      for (const name of ['toolbar-button', 'row-explicit']) {
        await expect(page.getByTestId(name)).toHaveCSS('height', `${normal}px`);
      }
      await expect(page.getByTestId('row-themed')).toHaveCSS('height', `${large}px`);
      await expect(page.getByTestId('row-button')).toHaveCSS('padding-left', '8px');
      await expect(page.getByTestId('row-button')).toHaveCSS(
        'font-size',
        density === 'dense' ? '12px' : '13px',
      );
      const row = await page.getByTestId('action-row').boundingBox();
      expect(row!.height).toBeLessThanOrEqual(
        Math.max(small, 20) + { compact: 13, comfortable: 17, dense: 5 }[density],
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );

      // 同一个 TableCell 中创建的弹层恢复常规按钮，保持密度、主题和焦点返回。
      await page.getByTestId('row-button').focus();
      await page.getByTestId('row-button').press('Enter');
      await expect(page.getByRole('dialog', { name: '账号设置' })).toBeVisible();
      await expect(page.getByTestId('dialog-button')).toHaveCSS('height', `${normal}px`);
      await expect(page.getByLabel('名称')).toHaveCSS('height', `${normal}px`);
      await page.screenshot({ path: info.outputPath('table-dialog.png') });
      await page.getByTestId('dialog-button').click();
      await expect(page.getByTestId('row-button')).toBeFocused();
      expect(errors).toEqual([]);
      await page.screenshot({ path: info.outputPath('table-actions.png') });
    });
  }
}
