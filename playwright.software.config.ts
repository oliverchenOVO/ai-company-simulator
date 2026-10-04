import { defineConfig } from '@playwright/test';
import baseline from './playwright.config';

const mode = process.env.FOUNDRY_SOFTWARE_MODE ?? 'webgl';
if (!['webgl', 'driver'].includes(mode)) throw new Error('FOUNDRY_SOFTWARE_MODE must be webgl or driver');

export default defineConfig({
  ...baseline,
  projects: [{ name: 'web', testMatch: '**/office.web.spec.ts', use: { browserName: 'chromium', channel: 'chrome' } }],
  use: {
    ...baseline.use,
    headless: true,
    launchOptions: { args: ['--use-gl=angle', `--use-angle=${mode === 'driver' ? 'swiftshader' : 'swiftshader-webgl'}`, '--enable-unsafe-swiftshader'] }
  }
});
