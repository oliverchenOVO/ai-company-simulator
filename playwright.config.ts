import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', timeout: 60000, expect: { timeout: 15000 }, workers: 1, fullyParallel: false,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4183', viewport: { width: 1440, height: 900 }, trace: 'retain-on-failure' },
  projects: [
    { name: 'web', testMatch: '**/*.web.spec.ts', use: { browserName: 'chromium', channel: 'chrome' } },
    { name: 'desktop', testMatch: '**/*.desktop.spec.ts' }
  ],
  webServer: { command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4183 --strictPort', url: 'http://127.0.0.1:4183', reuseExistingServer: false, timeout: 30000 }
});
