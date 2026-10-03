import { expect, type Page } from '@playwright/test';
export async function createCompany(page: Page, name = 'Garage Startup') {
  await expect(page.getByRole('heading', { name: '從三個人，開始你的公司。' })).toBeVisible();
  await page.getByLabel('公司名稱', { exact: true }).fill(name);
  await page.getByRole('button', { name: '創立公司', exact: true }).click();
  await expect(page.getByRole('heading', { name: '公司總覽', exact: true })).toBeVisible();
  await expect(page.getByText('NT$500,000', { exact: true })).toBeVisible();
}
export async function hireAndAdjust(page: Page) {
  await page.getByRole('button', { name: '推進一週', exact: true }).click();
  await expect(page.getByText('第 7 天', { exact: true })).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: '人員', exact: true }).click();
  await page.getByRole('button', { name: '招募員工', exact: true }).click();
  const dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible();
  await dialog.getByLabel('姓名', { exact: true }).fill('Dana Test');
  await dialog.getByRole('button', { name: '確認招募', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: 'Dana Test', exact: true }).click();
  await dialog.getByLabel('調整月薪（NT$）', { exact: true }).fill('42000');
  await dialog.getByRole('button', { name: '儲存薪資', exact: true }).click();
  await expect(dialog.getByText('NT$42,000', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: '晉升一級', exact: true }).click();
  await expect(dialog).toContainText('Senior');
  await dialog.getByLabel('直屬主管', {exact:true}).selectOption('employee-2');
  await dialog.getByRole('button', {name:'儲存主管',exact:true}).click();
  await dialog.getByRole('button', { name: '關閉對話框', exact: true }).click();
  await page.getByRole('button', { name: '推進一天', exact: true }).click();
  await expect(page.getByText('第 8 天', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '存檔', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('手動存檔已保存');
}
export async function verifyPersisted(page: Page) {
  await expect(page.getByRole('heading', { name: '公司總覽', exact: true })).toBeVisible();
  await expect(page.getByText('第 8 天', { exact: true })).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: '人員', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Dana Test', exact: true })).toBeVisible();
  await expect(page.getByText('NT$42,000', { exact: true })).toBeVisible();
  await page.getByRole('button', {name:'Dana Test',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('Senior');
  await expect(page.getByRole('dialog').getByLabel('直屬主管',{exact:true})).toHaveValue('employee-2');
  await page.keyboard.press('Escape');
}
