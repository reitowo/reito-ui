import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['composition.spec.ts', 'page-tabs-spacing.spec.ts', 'page-regions.spec.ts'],
  outputDir: '.dev/composition-results',
  use: {
    baseURL: 'http://127.0.0.1:5189',
    browserName: 'chromium',
    channel:
      process.env.REITO_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command:
      'npm run consumer:build && npx vite preview --config tests/consumer/vite.config.ts --host 127.0.0.1 --port 5189',
    url: 'http://127.0.0.1:5189',
    reuseExistingServer: false,
  },
});
