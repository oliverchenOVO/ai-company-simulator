import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createCompany } from './helpers';
import { Simulation } from '../../packages/simulation/src/simulation';
import { createSave } from '../../packages/persistence/src/save';
import { controlledScenario } from '../../scripts/retention/scenarios';
const qa = resolve(process.env.FOUNDRY_OFFICE_QA_DIR ?? 'C:/Users/oliver/.codex/artifacts/foundry-phase2-6b-qa');
const nav = (page: Page, name: string) => page.getByRole('navigation').getByRole('button', { name, exact: true });
async function capture(page: Page, name: string) {
  const dismiss = page.getByRole('button', { name: '收起摘要', exact: true });
  if (await dismiss.isVisible()) await dismiss.click();
  await page.getByRole('heading', { name: '辦公室', exact: true }).scrollIntoViewIfNeeded();
  if (await page.locator('.living-office').getAttribute('data-renderer') === '3d') await expect(page.locator('canvas[data-office-ready="true"]')).toBeVisible();
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
  if (sim.observe().headcount <= 100) await expect(page.locator('canvas[data-office-ready="true"]')).toBeVisible();
  await page.evaluate(() => new Promise<void>(done => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
  return { importMs: importedAt - start, sceneRenderMs: Date.now() - importedAt };
}
test('Living Office founders → selection → hire → promotion → save/refresh → exact replay', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/'); await expect(page).toHaveTitle(/FOUNDRY/); await createCompany(page);
  await nav(page, '辦公室').click();
  await expect(page.locator('.living-office')).toHaveAttribute('data-renderer','3d'); await expect(page.locator('canvas[data-office-ready="true"]')).toBeVisible();
  await expect(page.locator('[data-office-employee]')).toHaveCount(3); await capture(page, 'startup-desktop.png');
  await expect.poll(async()=>JSON.parse((await page.locator('canvas').getAttribute('data-presentations')) ?? '{}')['employee-1']?.facingYaw).toBeCloseTo(Math.PI);
  const before = await exported(page); await nav(page, '辦公室').click(); await expect(page.locator('canvas[data-office-ready="true"]')).toBeVisible();
  const targets=JSON.parse((await page.locator('canvas').getAttribute('data-employee-targets'))!);
  await page.locator('canvas').click({position:targets['employee-1']}); await expect(page.getByLabel('辦公室選取資訊')).toContainText('Alice Chen');
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
  await page.keyboard.press('Escape'); await nav(page, '辦公室').click(); await expect(page.locator('[data-office-employee="employee-3"]')).toHaveAttribute('data-office-role', 'management');
  await expect.poll(async()=>JSON.parse((await page.locator('canvas').getAttribute('data-presentations')) ?? '{}')['employee-3']?.atWorkstation,{timeout:30000}).toBe(true);
  await page.getByRole('button',{name:/Carol Wu，管理層/}).click(); await capture(page, 'post-promotion.png');
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
  await page.getByRole('button', { name: '關切', exact: true }).click();
  await page.getByLabel('在辦公室尋找員工').fill('Retention colleague'); await page.getByLabel('辦公室搜尋結果').getByRole('button', { name: 'Retention colleague', exact: true }).click();
  await expect(page.getByLabel('辦公室選取資訊')).toContainText('希望討論成長安排');
  await capture(page, 'concerns-desktop.png');
  const managerName = sim.observe().employees.find(e => e.id === employeeId)!.managerName;
  await page.getByRole('button', { name: '匯報', exact: true }).click(); await page.getByLabel('辦公室選取資訊').getByRole('button', { name: managerName, exact: true }).click(); await expect(page.getByLabel('辦公室選取資訊')).toContainText('管理負荷偏高'); await capture(page, 'management-heavy.png');
  sim.execute({ type: 'FireEmployee', employeeId }); await importWorld(page, sim);
  await expect(page.locator(`[data-office-employee="${employeeId}"]`)).toHaveAttribute('data-office-vacant', 'true');
  await expect.poll(async()=>JSON.parse((await page.locator('canvas').getAttribute('data-presentations')) ?? '{}')[employeeId]?.visible,{timeout:20000}).toBe(false);
  await page.locator(`[data-office-employee="${employeeId}"]`).click(); await capture(page, 'departure-vacancy.png');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel('目前樓層同事')).toBeVisible(); await page.getByLabel('選擇樓層').getByRole('button', { name: /執行層/ }).click();
  await page.getByLabel('目前樓層同事').getByRole('button', { name: /Alice Chen/ }).click(); await expect(page.getByLabel('辦公室選取資訊')).toContainText('Alice Chen');
  expect(await page.locator('.office-figure').first().evaluate(e => getComputedStyle(e).animationName)).toBe('none');
  expect(await page.locator('body').evaluate(e => e.scrollWidth <= innerWidth)).toBe(true); await capture(page, 'office-mobile.png');
  await context.setOffline(true); await page.getByRole('button', { name: '推進一天', exact: true }).click(); await expect(page.getByText('第 183 天', { exact: true })).toBeVisible(); expect(errors).toEqual([]);
});
test.describe('Living Office independently measured company sizes', () => {
  const rows: Record<string, unknown>[] = [];
  test.beforeAll(() => { mkdirSync(qa, { recursive: true }); rmSync(join(qa, 'browser-performance.json'), { force: true }); });
  test.afterAll(() => {
    // No partial or previous-run data may masquerade as a complete benchmark.
    if (rows.length === 8) writeFileSync(join(qa, 'browser-performance.json'), JSON.stringify({ baseURL: test.info().project.use.baseURL, viewport: test.info().project.use.viewport, rows }, null, 2));
  });
  for (const count of [3, 12, 30, 40, 60, 100, 250, 1000]) test(`Living Office measures ${count} employees and real management interactions`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const started = Date.now(); await page.goto('/'); await createCompany(page); const initialLoadMs = Date.now() - started;
    const sim = new Simulation({ name: `Office ${count}`, seed: 'office-performance', scenario: 'garage', employeeCount: count, initialCash: 1_000_000_000_000 }, true, 3);
    const timing = await importWorld(page, sim);
    if(count<=100) await page.evaluate(()=>new Promise<void>(done=>{const start=performance.now();const sample=()=>performance.now()-start>=1200 ? done() : requestAnimationFrame(sample);requestAnimationFrame(sample);}));
    if (count <= 100 && test.info().project.use.launchOptions?.args?.some(arg => ['--use-angle=swiftshader', '--use-angle=swiftshader-webgl'].includes(arg))) {
      await expect.poll(async () => Number(await page.locator('canvas').getAttribute('data-pixel-ratio'))).toBe(.75);
    }
    const approximateFrameMs=count<=100 ? Number(await page.locator('canvas').getAttribute('data-frame-ms')) || null : null;
    if (count <= 100) await expect(page.locator('[data-office-employee]')).toHaveCount(count);
    else { await expect(page.locator('.office-count')).toContainText(`${count} 位同事`); expect(await page.locator('[data-office-employee]').count()).toBeLessThanOrEqual(8); }
    const selectionStart=Date.now(); await page.getByLabel('在辦公室尋找員工').fill('Alice'); await page.getByLabel('辦公室搜尋結果').getByRole('button', { name: 'Alice Chen', exact: true }).click();
    await expect(page.getByLabel('辦公室選取資訊')).toContainText('Alice Chen'); const selectionMs=Date.now()-selectionStart;
    const week = Date.now(); await page.getByRole('button', { name: '推進一週', exact: true }).click(); await expect(page.getByText('第 7 天', { exact: true })).toBeVisible(); const weekMs = Date.now() - week;
    const n = Date.now(); await nav(page, '人員').click(); await nav(page, '辦公室').click(); await expect(page.locator('.living-office')).toBeVisible(); const navigationMs = Date.now() - n;
    const heap = await page.evaluate(() => (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? null);
    const canvas = page.locator('canvas[data-office-ready="true"]');
    if (count<=100) await expect(canvas).toBeVisible();
    const row = { count, ...timing, weekMs, navigationMs, selectionMs, browserHeapBytes: heap, renderer: await page.locator('.living-office').getAttribute('data-renderer'), accessibleSeats: await page.locator('[data-office-employee]').count(), gpuDrawCalls: count<=100 ? Number(await canvas.getAttribute('data-draw-calls')) : null, triangles: count<=100 ? Number(await canvas.getAttribute('data-triangles')) : null, pixelRatio: count<=100 ? Number(await canvas.getAttribute('data-pixel-ratio')) : null, approximateFrameMs, initialLoadMs };
    await page.getByRole('button',{name:'重置視角',exact:true}).click();
    if (count === 12) await capture(page, 'company-12.png'); if(count===30) await capture(page,'company-30.png'); if (count === 100) await capture(page, 'company-100.png');
    expect(errors).toEqual([]);
    rows.push(row);
    console.log('Office measurement:', JSON.stringify(row));
  });
});
test('Living Office reduced-motion desktop and actual WebGL context-loss fallback keep management usable', async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/'); await createCompany(page);
  await nav(page,'辦公室').click(); const canvas=page.locator('canvas[data-office-ready="true"]'); await expect(canvas).toBeVisible();
  await expect(page.locator('.office-3d-stage')).toHaveAttribute('data-motion','reduced');
  await page.locator('[data-office-employee="employee-1"]').click(); await expect(page.getByLabel('辦公室選取資訊')).toContainText('Alice Chen');
  await page.getByRole('button',{name:'重置視角',exact:true}).click();
  const supported=await canvas.evaluate(e=>{const gl=(e as HTMLCanvasElement).getContext('webgl2');const ext=gl?.getExtension('WEBGL_lose_context');if(ext){ext.loseContext();return true;}return false;}); expect(supported).toBe(true);
  await expect(page.locator('.living-office')).toHaveAttribute('data-renderer','svg'); await expect(page.getByText('圖形無法使用，已切換備援。')).toBeVisible();
  await page.locator('[data-office-employee="employee-1"]').click();await expect(page.getByLabel('辦公室選取資訊')).toContainText('Alice Chen');
  await page.getByRole('button',{name:'推進一天',exact:true}).click();await expect(page.getByText('第 1 天',{exact:true})).toBeVisible();expect(errors).toEqual([]);
});
test('Living Office unavailable WebGL initialization falls back without changing world',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,contextId:string,options?:unknown){
      if(['webgl','webgl2','experimental-webgl'].includes(contextId)) return null;
      return Reflect.apply(original,this,[contextId,options]);
    } as typeof original;
  });
  await page.goto('/');await createCompany(page);const before=await exported(page);await nav(page,'辦公室').click();
  await expect(page.locator('.living-office')).toHaveAttribute('data-renderer','svg');await expect(page.getByText('圖形無法使用，已切換備援。')).toBeVisible();
  await page.locator('[data-office-employee="employee-1"]').click();await expect(page.getByLabel('辦公室選取資訊')).toContainText('Alice Chen');
  const after=await exported(page);expect(after.world).toEqual(before.world);expect(after.manifest.stateHash).toBe(before.manifest.stateHash);
  await page.getByRole('button',{name:'推進一天',exact:true}).click();await expect(page.getByText('第 1 天',{exact:true})).toBeVisible();expect(errors).toEqual([]);
});

test('Living Office follows an actual manager reassignment and preserves the exported world',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/');await createCompany(page);await nav(page,'辦公室').click();await expect(page.locator('canvas[data-office-ready="true"]')).toBeVisible();
  await nav(page,'人員').click();await page.getByRole('button',{name:'Carol Wu',exact:true}).click();
  await page.getByRole('dialog').getByLabel('直屬主管',{exact:true}).selectOption('employee-1');await page.getByRole('dialog').getByRole('button',{name:'儲存主管',exact:true}).click();await page.keyboard.press('Escape');
  const before=await exported(page);await nav(page,'辦公室').click();await expect(page.locator('canvas[data-office-ready="true"]')).toBeVisible();
  await page.getByLabel('在辦公室尋找員工').fill('Carol');await page.getByLabel('辦公室搜尋結果').getByRole('button',{name:'Carol Wu',exact:true}).click();
  await page.getByRole('button',{name:'匯報',exact:true}).click();await expect(page.getByLabel('辦公室選取資訊').getByRole('button',{name:'Alice Chen',exact:true})).toBeVisible();
  const after=await exported(page);expect(after.world).toEqual(before.world);expect(after.manifest.stateHash).toBe(before.manifest.stateHash);
  await page.getByRole('button',{name:'驗證 Replay',exact:true}).click();await expect(page.getByText('一致性驗證通過',{exact:true})).toBeVisible();expect(errors).toEqual([]);
});
