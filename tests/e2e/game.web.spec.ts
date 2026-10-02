import { test, expect } from '@playwright/test';
import { createCompany, hireAndAdjust, verifyPersisted } from './helpers';
import { readFileSync } from 'node:fs';
import { validateSave } from '../../packages/persistence/src/save';
import { replay } from '../../packages/simulation/src/simulation';
test('create → advance → hire → salary → save → refresh → replay', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/'); await createCompany(page); await hireAndAdjust(page);
  await page.reload(); await verifyPersisted(page);
  await page.getByRole('navigation').getByRole('button', { name: '設定', exact: true }).click();
  await page.getByRole('button', { name: '驗證 Replay', exact: true }).click();
  await expect(page.getByText('一致性驗證通過', { exact: true })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '匯出存檔', exact: true }).click();
  const exported = await download, file = await exported.path();
  expect(file).toBeTruthy(); const save = validateSave(JSON.parse(readFileSync(file!, 'utf8')));
  expect(replay(save.world).stateHash()).toBe(save.manifest.stateHash);
  await page.getByRole('button', { name: '推進一週', exact: true }).click(); await expect(page.getByText('第 15 天', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '載入手動存檔', exact: true }).click(); await expect(page.getByText('第 8 天', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
test('independent browser sessions never share progress', async ({ browser }) => {
  const a = await browser.newContext(), b = await browser.newContext();
  const pa = await a.newPage(), pb = await b.newPage();
  await pa.goto('/'); await pb.goto('/'); await createCompany(pa, 'Alice Company'); await createCompany(pb, 'Bob Company');
  await pa.getByRole('button', { name: '推進一週', exact: true }).click(); await expect(pa.getByText('第 7 天', { exact: true })).toBeVisible();
  await pb.reload(); await expect(pb.getByText('第 0 天', { exact: true })).toBeVisible(); await expect(pb.locator('.company-header')).toContainText('Bob Company');
  await pa.reload(); await expect(pa.getByText('第 7 天', { exact: true })).toBeVisible(); await expect(pa.locator('.company-header')).toContainText('Alice Company');
  await a.close(); await b.close();
});
test('all core screens, decisions, timeline and responsive keyboard navigation', async ({ page }) => {
  await page.goto('/'); await createCompany(page);
  const nav = page.getByRole('navigation');
  await nav.getByRole('button', { name: '團隊', exact: true }).click();
  await page.getByLabel('團隊名稱', { exact: true }).fill('Design Lab'); await page.getByRole('button', { name: '建立團隊', exact: true }).click();
  await expect(page.getByText('Design Lab', { exact: true })).toBeVisible();
  await nav.getByRole('button', { name: '人員', exact: true }).click(); await page.getByRole('button', { name: 'Carol Wu', exact: true }).click();
  const dialog = page.getByRole('dialog'); await dialog.getByRole('combobox', { name: '調動團隊', exact: true }).selectOption({ label: 'Design Lab' }); await dialog.getByRole('button', { name: '確認調動', exact: true }).click(); await expect(dialog.getByText('工程師 · Design Lab', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible();
  await nav.getByRole('button', { name: '產品', exact: true }).click(); await page.getByRole('radio', { name: /品質提升/ }).check(); await page.getByRole('button', { name: '儲存產品方向', exact: true }).click(); await expect(page.locator('.detail-grid dd').getByText('品質提升', { exact: true })).toBeVisible();
  await nav.getByRole('button', { name: '設定', exact: true }).click(); await page.getByRole('combobox', { name: '營運方向', exact: true }).selectOption('sustainable'); await page.getByRole('button', { name: '儲存公司策略', exact: true }).click(); await expect(page.getByText('目前：穩健經營')).toBeVisible();
  for (const label of ['客戶', '財務', '收件匣', '時間軸', '總覽']) {
    await nav.getByRole('button', { name: label, exact: true }).click(); await expect(page.locator('h1')).toBeVisible();
    expect(await page.locator('body').evaluate(body => body.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: '推進一天', exact: true })).toBeVisible();
  expect(await page.locator('body').evaluate(body => body.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: '推進一天', exact: true }).click(); await expect(page.getByText('第 1 天', { exact: true })).toBeVisible();
});
test('loaded client operates fully offline', async ({ page, context }) => {
  await page.goto('/'); await createCompany(page);
  await context.setOffline(true); await page.getByRole('button', { name: '推進一週', exact: true }).click(); await expect(page.getByText('第 7 天', { exact: true })).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: '設定', exact: true }).click(); await page.getByRole('button', { name: '驗證 Replay', exact: true }).click(); await expect(page.getByText('一致性驗證通過')).toBeVisible();
});
