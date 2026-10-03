import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createCompany } from './helpers';
import { Simulation } from '../../packages/simulation/src/simulation';
import { createSave } from '../../packages/persistence/src/save';
import { controlledScenario } from '../../scripts/retention/scenarios';
const qa = resolve(process.env.FOUNDRY_OFFICE_QA_DIR ?? 'C:/Users/oliver/.codex/artifacts/foundry-phase2-6-qa');
const nav = (page: Page, name: string) => page.getByRole('navigation').getByRole('button', { name, exact: true });
async function capture(page: Page, name: string) {
  const dismiss = page.getByRole('button', { name: '收起摘要', exact: true });
  if (await dismiss.isVisible()) await dismiss.click();
  await page.getByRole('heading', { name: '辦公室', exact: true }).scrollIntoViewIfNeeded();
  mkdirSync(qa, { recursive: true }); await page.screenshot({ path: join(qa, name), fullPage: false });
}
async function exported(page: Page) {
  await nav(page, '設定').click(); const promise = page.waitForEvent('download'); await page.getByRole('button', { name: '匯出存檔', exact: true }).click();
  const download = await promise; return JSON.parse(readFileSync((await download.path())!, 'utf8'));
}
async function importWorld(page: Page, sim: Simulation) {
  const start = Date.now();
  await nav(page, '設定').click(); await page.getByLabel('匯入存檔檔案').setInputFiles({ name: 'office.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(createSave(sim.snapshot()))) });
  await expect(page.locator('.company-header')).toContainText(sim.observe().name); const importedAt = Date.now();
  await nav(page, '辦公室').click(); await expect(page.getByRole('heading', { name: '辦公室', exact: true })).toBeVisible();
  await page.evaluate(() => new Promise<void>(done => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
  return { importMs: importedAt - start, sceneRenderMs: Date.now() - importedAt };
}
test('Living Office founders → selection → hire → promotion → save/refresh → exact replay', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/'); await expect(page).toHaveTitle(/FOUNDRY/); await createCompany(page);
  const before = await exported(page); await nav(page, '辦公室').click();
  await expect(page.locator('[data-office-employee]')).toHaveCount(3); await capture(page, 'startup-desktop.png');
  const alice = page.locator('[data-office-employee="employee-1"]'); await alice.focus(); await page.keyboard.press('Enter');
  await expect(page.getByLabel('辦公室選取資訊')).toContainText('Alice Chen'); await page.getByRole('button', { name: '匯報', exact: true }).click();
  await page.getByRole('button', { name: '查看人員詳情' }).click(); await expect(page.getByRole('dialog')).toContainText('Alice Chen'); await page.keyboard.press('Escape');
  await nav(page, '辦公室').click(); await page.getByRole('button', { name: '關切', exact: true }).click();
  const after = await exported(page); expect(after.world).toEqual(before.world); expect(after.manifest.stateHash).toBe(before.manifest.stateHash);
  await nav(page, '辦公室').click(); await page.getByRole('button', { name: '推進一週', exact: true }).click(); await expect(page.getByText('第 7 天', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '辦公室', exact: true })).toBeVisible();
  await nav(page, '人員').click(); await page.getByRole('button', { name: '招募員工', exact: true }).click();
  await page.getByRole('dialog').getByLabel('姓名', { exact: true }).fill('Dana Office'); await page.getByRole('dialog').getByRole('button', { name: '確認招募', exact: true }).click(); await expect(page.getByRole('dialog')).not.toBeVisible();
  await nav(page, '辦公室').click(); await expect(page.locator('[data-office-employee]')).toHaveCount(4); await expect(page.getByRole('button', { name: /Dana Office，工作層/ })).toBeVisible();
  await page.getByRole('button', { name: /Carol Wu，工作層/ }).click(); await page.getByRole('button', { name: '查看人員詳情' }).click();
  await page.getByRole('dialog').getByLabel('晉升路徑', { exact: true }).selectOption('manager'); await page.getByRole('dialog').getByRole('button', { name: '晉升一級', exact: true }).click(); await expect(page.getByRole('dialog')).toContainText('Senior · 管理路徑');
  await page.keyboard.press('Escape'); await nav(page, '辦公室').click(); await expect(page.locator('[data-office-employee="employee-3"]')).toHaveAttribute('data-office-role', 'management'); await capture(page, 'post-promotion.png');
  const appearance = await page.locator('[data-office-employee="employee-3"]').getAttribute('data-office-appearance');
  await page.getByRole('button', { name: '存檔', exact: true }).click(); await page.reload(); await nav(page, '辦公室').click();
  await expect(page.locator('[data-office-employee="employee-3"]')).toHaveAttribute('data-office-role', 'management'); await expect(page.locator('[data-office-employee="employee-3"]')).toHaveAttribute('data-office-appearance', appearance!);
  const saved = await exported(page); await page.getByRole('button', { name: '驗證 Replay', exact: true }).click(); await expect(page.getByText('一致性驗證通過', { exact: true })).toBeVisible(); await expect(page.locator('.replay-result code')).toHaveText(saved.manifest.stateHash);
  expect(errors).toEqual([]);
});
test('Living Office real concern / management / vacancy and reduced-motion mobile fallback', async ({ page, context }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/'); await createCompany(page);
  const { sim, employeeId } = controlledScenario('career-3', 'poor-manager'); sim.execute({ type: 'AdvanceTime', days: 182 }); await importWorld(page, sim);
  await page.getByRole('button', { name: '關切', exact: true }).click(); await capture(page, 'concerns-desktop.png');
  await page.getByLabel('在辦公室尋找員工').fill('Retention colleague'); await page.getByLabel('辦公室搜尋結果').getByRole('button', { name: 'Retention colleague', exact: true }).click();
  await expect(page.getByLabel('辦公室選取資訊')).toContainText('希望討論成長安排');
  const managerName = sim.observe().employees.find(e => e.id === employeeId)!.managerName;
  await page.getByRole('button', { name: '匯報', exact: true }).click(); await page.getByLabel('辦公室選取資訊').getByRole('button', { name: managerName, exact: true }).click(); await expect(page.getByLabel('辦公室選取資訊')).toContainText('管理負荷偏高'); await capture(page, 'management-heavy.png');
  sim.execute({ type: 'FireEmployee', employeeId }); await importWorld(page, sim);
  await expect(page.locator(`[data-office-employee="${employeeId}"]`)).toHaveAttribute('data-office-vacant', 'true'); await capture(page, 'departure-vacancy.png');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel('目前樓層同事')).toBeVisible(); await page.getByLabel('選擇樓層').getByRole('button', { name: /執行層/ }).click();
  await page.getByLabel('目前樓層同事').getByRole('button', { name: /Alice Chen/ }).click(); await expect(page.getByLabel('辦公室選取資訊')).toContainText('Alice Chen');
  expect(await page.locator('.office-figure').first().evaluate(e => getComputedStyle(e).animationName)).toBe('none');
  expect(await page.locator('body').evaluate(e => e.scrollWidth <= innerWidth)).toBe(true); await capture(page, 'office-mobile.png');
  await context.setOffline(true); await page.getByRole('button', { name: '推進一天', exact: true }).click(); await expect(page.getByText('第 183 天', { exact: true })).toBeVisible(); expect(errors).toEqual([]);
});
test('Living Office measures normal range and explicit larger-company fallback', async ({ page }) => {
  test.setTimeout(180000); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const started = Date.now(); await page.goto('/'); await createCompany(page); const initialLoadMs = Date.now() - started;
  const rows = [];
  for (const count of [3, 12, 40, 100, 250, 1000]) {
    const sim = new Simulation({ name: `Office ${count}`, seed: 'office-performance', scenario: 'garage', employeeCount: count, initialCash: 1_000_000_000_000 }, true, 3);
    const timing = await importWorld(page, sim);
    if (count <= 100) await expect(page.locator('[data-office-employee]')).toHaveCount(count);
    else { await expect(page.locator('.office-count')).toContainText(`${count} 位同事`); expect(await page.locator('[data-office-employee]').count()).toBeLessThanOrEqual(8); }
    await page.getByLabel('在辦公室尋找員工').fill('Alice'); await page.getByLabel('辦公室搜尋結果').getByRole('button', { name: 'Alice Chen', exact: true }).click();
    const week = Date.now(); await page.getByRole('button', { name: '推進一週', exact: true }).click(); await expect(page.getByText('第 7 天', { exact: true })).toBeVisible(); const weekMs = Date.now() - week;
    const n = Date.now(); await nav(page, '人員').click(); await nav(page, '辦公室').click(); await expect(page.locator('.living-office')).toBeVisible(); const navigationMs = Date.now() - n;
    const heap = await page.evaluate(() => (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? null);
    rows.push({ count, ...timing, weekMs, navigationMs, browserHeapBytes: heap, renderedCharacters: await page.locator('.office-figure').count(), vectorSeats: await page.locator('[data-office-employee]').count(), gpuDrawCalls: 'not applicable: SVG', initialLoadMs });
    if (count === 12) await capture(page, 'company-12.png'); if (count === 100) await capture(page, 'company-100.png');
  }
  mkdirSync(qa, { recursive: true }); writeFileSync(join(qa, 'browser-performance.json'), JSON.stringify({ baseURL: test.info().project.use.baseURL, viewport: test.info().project.use.viewport, rows }, null, 2));
  console.log('Office measurements:', JSON.stringify(rows)); expect(errors).toEqual([]);
});
