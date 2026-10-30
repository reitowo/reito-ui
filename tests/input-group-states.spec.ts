import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const density of ['compact', 'comfortable', 'dense']) {
    test(`InputGroup separates disabled actions from fields in ${theme}/${density}`, async ({
      page,
    }) => {
      await page.goto(`/?page=input-group-states&theme=${theme}&density=${density}`);
      for (const kind of ['input', 'textarea']) {
        const editable = page.getByRole('group', { name: `${kind}-editable`, exact: true });
        const field = editable.getByRole('textbox');
        await expect(field).toBeEnabled();
        await field.fill('仍可编辑');
        await expect(field).toHaveValue('仍可编辑');
        await expect(editable).toHaveCSS('opacity', '1');
        await expect(editable.getByRole('button')).toBeDisabled();
        const disabled = page.getByRole('group', { name: `${kind}-disabled`, exact: true });
        await expect(disabled.getByRole('textbox')).toBeDisabled();
        const opacity = await disabled.evaluate((node) =>
          getComputedStyle(node).getPropertyValue('--rui-opacity-disabled').trim(),
        );
        await expect(disabled).toHaveCSS('opacity', String(Number(opacity)));
      }
    });
  }
}
