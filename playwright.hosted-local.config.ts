import { defineConfig } from '@playwright/test';
import production from './playwright.hosted.config';
export default defineConfig({...production,
  use:{...production.use,baseURL:'http://127.0.0.1:4181'},
  webServer:{command:'node node_modules/vite/bin/vite.js preview --outDir out --host 127.0.0.1 --port 4181 --strictPort',url:'http://127.0.0.1:4181',reuseExistingServer:false,timeout:30000}
});
