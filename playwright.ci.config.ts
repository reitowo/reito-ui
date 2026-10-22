import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  // Shared Lab/Storybook servers under two workers occasionally race first paints.
  retries: 2,
  workers: 2,
  expect: { timeout: 10_000 },
  testMatch: [
    'axe-scan.spec.ts', 'kanban-model.spec.ts', 'kanban.spec.ts',
    'overview.spec.ts', 'overview-catalog.spec.ts', 'surface-consistency.spec.ts', 'overview-loading.spec.ts', 'button-card-defaults.spec.ts', 'component-geometry-audit.spec.ts', 'tree-row-focus.spec.ts', 'neutral-focus-contract.spec.ts', 'state-stability.spec.ts', 'catalog-state-probes.spec.ts',
    'home.spec.ts', 'theme-guide.spec.ts', 'scroll-focus.spec.ts', 'select-input.spec.ts',
    'popover-list.spec.ts', 'tabs-table-focus.spec.ts', 'settings-composition.spec.ts',
    'data-table-column-filters.spec.ts', 'data-table-column-management.spec.ts',
    'data-table-controlled.spec.ts', 'data-table-editing.spec.ts', 'data-table-preferences.spec.ts',
    'dynamic-form.spec.ts', 'form.spec.ts', 'key-value-editor-rich.spec.ts',
    'key-value-editor-transaction.spec.ts', 'property-list-rich.spec.ts',
    'component-tokens.spec.ts', 'menu-density.spec.ts', 'theme-density.spec.ts', 'token-inspector.spec.ts', 'token-contract.spec.ts',
    'token-generation.spec.ts', 'validation-glow.spec.ts', 'scroll-area-insets.spec.ts',
    'gallery.spec.ts', 'gallery-mobile.spec.ts', 'dense-density.spec.ts',
  ],
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5173', headless: true, viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: false, timeout: 60_000 },
    { command: 'npm run dev:workbench', url: 'http://127.0.0.1:5175', reuseExistingServer: false, timeout: 60_000 },
    { command: 'python3 -m http.server 6007 --bind 127.0.0.1 --directory apps/storybook/storybook-static', url: 'http://127.0.0.1:6007', reuseExistingServer: false, timeout: 30_000 },
  ],
});
