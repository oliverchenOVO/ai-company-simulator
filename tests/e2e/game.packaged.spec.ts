import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtempSync, rmSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createCompany, hireAndAdjust, verifyPersisted } from './helpers';
test('packaged Windows executable accepts decisions and restores its SQLite database', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'foundry-packaged-'));
  if (!resolve(dir).startsWith(resolve(join(tmpdir(), 'foundry-packaged-')))) throw new Error('Unsafe cleanup path');
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) if (value !== undefined) env[key] = value;
  env.FOUNDRY_USER_DATA = dir; delete env.ELECTRON_RUN_AS_NODE;
  const executablePath = resolve(process.env.FOUNDRY_PACKAGED_EXECUTABLE ?? 'release/win-unpacked/Foundry Company Simulator.exe');
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
  const executablePath = resolve(process.env.FOUNDRY_PACKAGED_EXECUTABLE ?? 'release/win-unpacked/Foundry Company Simulator.exe');
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

test('packaged Windows Living Office persists company then restarts and continues offline', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'foundry-packaged-'));
  if (!resolve(dir).startsWith(resolve(join(tmpdir(), 'foundry-packaged-')))) throw new Error('Unsafe cleanup path');
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) if (value !== undefined) env[key] = value;
  env.FOUNDRY_USER_DATA = dir; delete env.ELECTRON_RUN_AS_NODE;
  const executablePath = resolve(process.env.FOUNDRY_PACKAGED_EXECUTABLE ?? 'release/win-unpacked/Foundry Company Simulator.exe');
  let app = await electron.launch({ executablePath, args: [], env });
  const errors: string[] = [];
  try {
    expect(await app.evaluate(({ app }) => app.isPackaged)).toBe(true);
    const page = await app.firstWindow(); page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await createCompany(page); await page.getByRole('navigation').getByRole('button', { name: '辦公室', exact: true }).click();
    await expect(page.locator('[data-office-employee]')).toHaveCount(3);
    await expect(page.locator('canvas[data-office-ready="true"]')).toBeVisible();
    const qa=resolve(process.env.FOUNDRY_OFFICE_QA_DIR ?? 'C:/Users/oliver/.codex/artifacts/foundry-phase2-6b-qa');
    mkdirSync(qa,{recursive:true});
    writeFileSync(join(qa,'packaged-gpu.json'),JSON.stringify(await app.evaluate(({app})=>({version:app.getVersion(),isPackaged:app.isPackaged,graphics:app.getGPUFeatureStatus()})),null,2));
    await page.screenshot({path:join(qa,'packaged-office.png')});
    const appearance = await page.locator('[data-office-employee="employee-1"]').getAttribute('data-office-appearance');
    await page.locator('[data-office-employee="employee-1"]').click(); await expect(page.getByLabel('辦公室選取資訊')).toContainText('Alice Chen');
    await page.getByRole('button', { name: '推進一週', exact: true }).click(); await expect(page.getByText('第 7 天', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '存檔', exact: true }).click(); await expect(page.getByRole('status')).toContainText('手動存檔已保存');
    await app.close(); app = await electron.launch({ executablePath, args: [], env });
    const resumed = await app.firstWindow(); resumed.on('pageerror', e => errors.push(e.message)); resumed.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await resumed.getByRole('navigation').getByRole('button', { name: '辦公室', exact: true }).click();
    await expect(resumed.locator('[data-office-employee="employee-1"]')).toHaveAttribute('data-office-appearance', appearance!);
    await expect(resumed.locator('canvas[data-office-ready="true"]')).toBeVisible();
    await expect(resumed.getByText('第 7 天', { exact: true })).toBeVisible(); await resumed.getByRole('button', { name: '推進一天', exact: true }).click(); await expect(resumed.getByText('第 8 天', { exact: true })).toBeVisible();
    await resumed.getByRole('navigation').getByRole('button', { name: '設定', exact: true }).click(); await resumed.getByRole('button', { name: '驗證 Replay', exact: true }).click(); await expect(resumed.getByText('一致性驗證通過', { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  } finally { await app.close(); rmSync(dir, { recursive: true, force: true }); }
});
