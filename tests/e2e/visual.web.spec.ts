import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createCompany } from './helpers';
test('capture desktop, employee detail, monthly finance and mobile visual evidence', async ({ page }) => {
  const dir = process.env.FOUNDRY_QA_DIR ?? join(tmpdir(), 'foundry-phase1-qa'); mkdirSync(dir, { recursive: true });
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1586, height: 992 }); // Native concept dimensions.
  await page.goto('/'); expect(await page.title()).toBe('FOUNDRY — AI Company Simulator'); await createCompany(page); await page.reload();
  await expect(page.getByRole('heading', { name: '公司總覽', exact: true })).toBeVisible();
  await page.screenshot({ path: join(dir, 'dashboard-desktop.png') });
  await page.getByRole('navigation').getByRole('button', { name: '人員', exact: true }).click(); await page.getByRole('button', { name: 'Bob Lin', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible(); await page.screenshot({ path: join(dir, 'employee-detail.png') }); await page.keyboard.press('Escape');
  for (let i = 0; i < 5; i++) { await page.getByRole('button', { name: '推進一週', exact: true }).click(); await expect(page.getByText(`第 ${(i + 1) * 7} 天`, { exact: true })).toBeVisible(); }
  await page.getByRole('navigation').getByRole('button', { name: '財務', exact: true }).click();
  await expect(page.locator('.recharts-surface').first()).toBeVisible(); await page.screenshot({ path: join(dir, 'finance-desktop.png') });
  await page.getByRole('navigation').getByRole('button', { name: '總覽', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: join(dir, 'dashboard-mobile.png') });
  await page.getByRole('button', { name: 'Carol Wu', exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(dir, 'team-mobile.png') });
  expect(await page.locator('body').evaluate(body => body.scrollWidth <= window.innerWidth)).toBe(true); expect(errors).toEqual([]);
  console.log(`Visual evidence: ${dir}`);
});
