import type { Page } from '@playwright/test';
import type { Result, RunOptions } from 'axe-core';

export async function axeViolations(
  page: Page,
  options: RunOptions = {},
  { context = 'body', waitTimeoutMs = 5_000 }: { context?: 'body' | 'document'; waitTimeoutMs?: number } = {},
): Promise<Result[]> {
  return page.evaluate(async ({ options, context, waitTimeoutMs }) => {
    const axe = (window as unknown as { axe: typeof import('axe-core') }).axe;
    const deadline = performance.now() + waitTimeoutMs;
    for (;;) {
      try {
        return (await axe.run(context === 'document' ? document : document.body, options)).violations;
      } catch (error) {
        // Storybook's addon can still own the scanner after rendering or controls change.
        if (!String(error).includes('Axe is already running')) throw error;
        const remaining = deadline - performance.now();
        if (remaining <= 0) throw new Error('Timed out waiting for the existing axe scan to finish');
        await new Promise(resolve => setTimeout(resolve, Math.min(50, remaining)));
      }
    }
  }, { options, context, waitTimeoutMs });
}
