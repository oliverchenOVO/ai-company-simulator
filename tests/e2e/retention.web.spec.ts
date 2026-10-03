import { test, expect, type Page } from '@playwright/test';
import { resolve } from 'node:path';
import { createCompany } from './helpers';
import { createSave } from '../../packages/persistence/src/save';
import { controlledScenario } from '../../scripts/retention/scenarios';
async function importCase(page: Page, scenario: 'poor-manager' | 'sustained-growth', days: number) {
  const run = controlledScenario('career-3', scenario); run.sim.execute({ type: 'AdvanceTime', days });
  await page.goto('/'); await expect(page).toHaveTitle(/FOUNDRY/); await createCompany(page);
  await page.getByRole('navigation').getByRole('button', { name: '設定', exact: true }).click();
  await page.getByLabel('匯入存檔檔案').setInputFiles({ name: 'controlled-retention.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(createSave(run.sim.snapshot()))) });
  await expect(page.locator('.company-header')).toContainText(`Retention ${scenario}`);
}
test('v3 career and manager warnings → causal history → interventions → refresh → replay', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await importCase(page, 'poor-manager', 182); const nav = page.getByRole('navigation');
  await nav.getByRole('button', { name: '總覽', exact: true }).click();
  await expect(page.getByRole('heading', { name: '主管支持需要重新安排' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '職涯安排需要回應' })).toBeVisible();
  await nav.getByRole('button', { name: '時間軸', exact: true }).click();
  await page.getByRole('combobox', { name: '重要程度' }).selectOption('warning');
  await page.locator('.timeline-list').getByRole('button', { name: /Retention colleague 希望討論職涯/ }).click();
  await expect(page.locator('.cause-list')).toContainText('職涯期待');
  await expect(page.locator('.cause-list')).not.toContainText('management-support');
  await nav.getByRole('button', { name: '人員', exact: true }).click(); await page.getByRole('button', { name: 'Retention colleague', exact: true }).click();
  const dialog = page.getByRole('dialog'); await expect(dialog).toContainText('希望討論成長安排');
  await dialog.getByLabel('晉升路徑', { exact: true }).selectOption('manager');
  await expect(dialog.getByLabel('晉升影響說明')).toContainText('不會自動增加管理能力或安排部屬');
  await dialog.getByLabel('晉升路徑', { exact: true }).selectOption('specialist');
  await expect(dialog.getByLabel('晉升影響說明')).toContainText('專業晉升未必符合其目標');
  await dialog.getByRole('button', { name: '晉升一級', exact: true }).click(); await expect(dialog).toContainText('Senior · 專業路徑');
  await dialog.getByLabel('直屬主管', { exact: true }).selectOption('employee-1'); await dialog.getByRole('button', { name: '儲存主管', exact: true }).click();
  await page.keyboard.press('Escape'); await page.getByRole('button', { name: '推進一週', exact: true }).click(); await page.getByRole('button', { name: '存檔', exact: true }).click();
  await page.reload(); await nav.getByRole('button', { name: '人員', exact: true }).click(); await page.getByRole('button', { name: 'Retention colleague', exact: true }).click();
  await expect(dialog).toContainText('Senior · 專業路徑'); await expect(dialog.getByLabel('直屬主管', { exact: true })).toHaveValue('employee-1');
  await dialog.evaluate(e => { e.scrollTop = e.scrollHeight; });
  await page.screenshot({ path: resolve(process.env.FOUNDRY_QA_DIR ?? 'C:/Users/oliver/.codex/artifacts/foundry-phase2-5-qa', 'retention-intervention.png') });
  await page.keyboard.press('Escape'); await nav.getByRole('button', { name: '設定', exact: true }).click(); await page.getByRole('button', { name: '驗證 Replay', exact: true }).click();
  await expect(page.getByText('一致性驗證通過', { exact: true })).toBeVisible(); expect(errors).toEqual([]);
});
test('controlled v3 departure shows recorded positive causes and actual public warning history', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await importCase(page, 'sustained-growth', 420); await page.getByRole('navigation').getByRole('button', { name: '時間軸', exact: true }).click();
  await page.getByRole('combobox', { name: '重要程度' }).selectOption('critical');
  await page.locator('.timeline-list').getByRole('button', { name: /Retention colleague 提出離職/ }).click();
  await expect(page.locator('.cause-list')).toContainText('長期疲勞'); await expect(page.getByRole('heading', { name: '這位同事先前的可觀察紀錄' })).toBeVisible();
  await expect(page.getByText('EmployeeExploringOptions')).not.toBeVisible();
  await expect(page.locator('.cause-list')).not.toContainText('resignationChance'); expect(errors).toEqual([]);
});
