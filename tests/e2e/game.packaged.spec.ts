import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createCompany, hireAndAdjust, verifyPersisted } from './helpers';
test('packaged Windows executable accepts decisions and restores its SQLite database', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'foundry-packaged-'));
  if (!resolve(dir).startsWith(resolve(join(tmpdir(), 'foundry-packaged-')))) throw new Error('Unsafe cleanup path');
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) if (value !== undefined) env[key] = value;
  env.FOUNDRY_USER_DATA = dir; delete env.ELECTRON_RUN_AS_NODE;
  const executablePath = resolve('release/win-unpacked/Foundry Company Simulator.exe');
  let app = await electron.launch({ executablePath, args: [], env });
  try {
    const page = await app.firstWindow(); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await createCompany(page); await hireAndAdjust(page);
    expect(await app.evaluate(({ app }) => app.isPackaged)).toBe(true);
    expect(errors).toEqual([]); await app.close();
    app = await electron.launch({ executablePath, args: [], env }); const resumed = await app.firstWindow(); await verifyPersisted(resumed);
    await resumed.getByRole('button', {name:'推進一天',exact:true}).click(); await expect(resumed.getByText('第 9 天',{exact:true})).toBeVisible();
    await resumed.getByRole('navigation').getByRole('button',{name:'設定',exact:true}).click(); await resumed.getByRole('button',{name:'驗證 Replay',exact:true}).click(); await expect(resumed.getByText('一致性驗證通過',{exact:true})).toBeVisible();
  } finally {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
test('packaged Windows loads released v3 then intervenes, restarts, continues and replays', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'foundry-packaged-'));
  if (!resolve(dir).startsWith(resolve(join(tmpdir(), 'foundry-packaged-')))) throw new Error('Unsafe cleanup path');
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) if (value !== undefined) env[key] = value;
  env.FOUNDRY_USER_DATA = dir; delete env.ELECTRON_RUN_AS_NODE;
  const executablePath = resolve('release/win-unpacked/Foundry Company Simulator.exe');
  let app = await electron.launch({ executablePath, args: [], env });
  try {
    expect(await app.evaluate(({ app }) => app.isPackaged)).toBe(true);
    const page = await app.firstWindow(), errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await createCompany(page); const nav = page.getByRole('navigation'); await nav.getByRole('button', { name: '設定', exact: true }).click();
    await page.getByLabel('匯入存檔檔案').setInputFiles({ name: 'released-v3.json', mimeType: 'application/json', buffer: readFileSync('tests/fixtures/phase2-0.2.0.save.json') });
    await expect(page.locator('.company-header')).toContainText('Released v3 compatibility');
    await nav.getByRole('button', { name: '人員', exact: true }).click(); await page.getByRole('button', { name: 'Carol Wu', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('Senior · 專業路徑');
    await page.getByRole('dialog').getByLabel('直屬主管', { exact: true }).selectOption('employee-2');
    await page.getByRole('dialog').getByRole('button', { name: '儲存主管', exact: true }).click(); await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '推進一天', exact: true }).click(); await page.getByRole('button', { name: '存檔', exact: true }).click(); await expect(page.getByRole('status')).toContainText('手動存檔已保存');
    expect(errors).toEqual([]); await app.close(); app = await electron.launch({ executablePath, args: [], env });
    const resumed = await app.firstWindow(); resumed.on('pageerror', e => errors.push(e.message));
    await expect(resumed.getByText('第 8 天', { exact: true })).toBeVisible();
    await resumed.getByRole('navigation').getByRole('button', { name: '人員', exact: true }).click(); await resumed.getByRole('button', { name: 'Carol Wu', exact: true }).click();
    await expect(resumed.getByRole('dialog').getByLabel('直屬主管', { exact: true })).toHaveValue('employee-2'); await resumed.keyboard.press('Escape');
    await resumed.getByRole('button', { name: '推進一天', exact: true }).click(); await expect(resumed.getByText('第 9 天', { exact: true })).toBeVisible();
    await resumed.getByRole('navigation').getByRole('button', { name: '設定', exact: true }).click(); await resumed.getByRole('button', { name: '驗證 Replay', exact: true }).click();
    await expect(resumed.getByText('一致性驗證通過', { exact: true })).toBeVisible(); expect(errors).toEqual([]);
  } finally { await app.close(); rmSync(dir, { recursive: true, force: true }); }
});
