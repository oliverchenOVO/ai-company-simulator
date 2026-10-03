import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', testMatch: ['**/game.web.spec.ts', '**/visual.web.spec.ts', '**/acceptance.web.spec.ts', '**/compensation.web.spec.ts'], timeout: 90000, expect: { timeout: 20000 }, workers: 1,
  use: { baseURL: 'https://foundry-company-simulator.oliverchenovo.chatgpt.site', browserName: 'chromium', channel: 'chrome', viewport: { width: 1586, height: 992 }, trace: 'retain-on-failure' }, reporter: [['list']]
});
