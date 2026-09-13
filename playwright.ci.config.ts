import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', timeout: 45_000, workers: 2,
  testMatch: [
    'home.spec.ts', 'scroll-focus.spec.ts', 'select-input.spec.ts',
    'popover-list.spec.ts', 'tabs-table-focus.spec.ts',
    'data-table-column-filters.spec.ts', 'data-table-column-management.spec.ts',
    'data-table-controlled.spec.ts', 'data-table-editing.spec.ts', 'data-table-preferences.spec.ts',
    'dynamic-form.spec.ts', 'form.spec.ts', 'key-value-editor-rich.spec.ts',
    'key-value-editor-transaction.spec.ts', 'property-list-rich.spec.ts',
  ],
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5173', headless: true, viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: false, timeout: 60_000 },
    { command: 'python3 -m http.server 6007 --bind 127.0.0.1 --directory apps/storybook/storybook-static', url: 'http://127.0.0.1:6007', reuseExistingServer: false, timeout: 30_000 },
  ],
});
