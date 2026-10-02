import { test, expect, _electron as electron } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
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
    app = await electron.launch({ executablePath, args: [], env }); await verifyPersisted(await app.firstWindow());
  } finally {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
