import type { Locator } from '@playwright/test';

export const storybookUrl = process.env.REITO_STORYBOOK_URL ?? 'http://127.0.0.1:6007';

/** Choose the visible option through the same portalled menu a user operates. */
export async function chooseSelectOption(control: Locator, label: string) {
  await control.click();
  await control.locator('xpath=ancestor::body').getByRole('option', { name: label, exact: true }).click();
}
