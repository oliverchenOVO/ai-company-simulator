import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createCompany, hireAndAdjust, verifyPersisted } from './helpers';
test('Electron launches offline and restores SQLite after process restart', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'foundry-desktop-'));
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) if (value !== undefined) env[key] = value;
  env.FOUNDRY_USER_DATA = dir; delete env.ELECTRON_RUN_AS_NODE;
  let app = await electron.launch({ args: [resolve('dist-electron/main.cjs')], env });
  try {
    const page = await app.firstWindow(); await createCompany(page); await hireAndAdjust(page);
    expect(await page.evaluate(() => window.foundry !== undefined)).toBe(true);
    await app.close(); app = await electron.launch({ args: [resolve('dist-electron/main.cjs')], env });
    const resumed = await app.firstWindow(); await verifyPersisted(resumed);
    await resumed.getByRole('button', {name:'推進一天',exact:true}).click(); await expect(resumed.getByText('第 9 天',{exact:true})).toBeVisible();
    await resumed.getByRole('navigation').getByRole('button',{name:'設定',exact:true}).click(); await resumed.getByRole('button',{name:'驗證 Replay',exact:true}).click(); await expect(resumed.getByText('一致性驗證通過',{exact:true})).toBeVisible();
  } finally { await app.close(); rmSync(dir, { recursive: true, force: true }); }
});
