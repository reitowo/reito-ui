import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  testDir: fileURLToPath(new URL('../../tests', import.meta.url)),
  testMatch: 'workbench-app.spec.ts',
  outputDir: fileURLToPath(new URL('./test-results', import.meta.url)),
  timeout: 45_000,
  workers: 2,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:5175', channel: process.env.REITO_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined), headless: true, viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run dev --workspace @reito/workbench', cwd: fileURLToPath(new URL('../..', import.meta.url)), url: 'http://127.0.0.1:5175', reuseExistingServer: !process.env.CI, timeout: 30_000 },
});
