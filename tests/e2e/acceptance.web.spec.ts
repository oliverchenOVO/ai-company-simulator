import { test,expect } from '@playwright/test';
import { createCompany } from './helpers';
import { Simulation } from '../../packages/simulation/src/simulation';
import { createSave } from '../../packages/persistence/src/save';
test('financial decision preview and actual week summary remain readable on mobile',async({page})=>{
  await page.goto('/');await createCompany(page);
  await expect(page.getByRole('heading',{name:'現金跑道需要規劃'})).toBeVisible();
  await page.getByRole('navigation').getByRole('button',{name:'財務',exact:true}).click();await expect(page.getByRole('heading',{name:'下次月結預估'})).toBeVisible();await expect(page.getByText(/結算後現金預估/)).toContainText('NT$395,000');
  await page.getByRole('navigation').getByRole('button',{name:'人員',exact:true}).click();await page.getByRole('button',{name:'招募員工',exact:true}).click();
  const dialog=page.getByRole('dialog');await expect(dialog.locator('.cost-preview')).toContainText('NT$130,000');await dialog.getByLabel('月薪（NT$）').fill('70000');await expect(dialog.locator('.cost-preview')).toContainText('NT$165,000');await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'推進一週',exact:true}).click();
  const summary=page.getByRole('region',{name:'時間推進摘要'});await expect(summary).toBeVisible();await expect(summary).toContainText('現金 NT$0');
  expect(await page.locator('body').evaluate(b=>b.scrollWidth<=window.innerWidth)).toBe(true);
  await summary.getByRole('button',{name:'收起摘要'}).click();await expect(summary).not.toBeVisible();await page.getByRole('button',{name:'推進一天',exact:true}).click();await expect(summary).not.toBeVisible();
});
test('resignation explains recorded causes with visible concerns and urgency filtering',async({page})=>{
  const sim=new Simulation({seed:'retention-001',name:'Retention Case',scenario:'garage'});sim.execute({type:'ChangeSalary',employeeId:'employee-2',salary:0});sim.execute({type:'AdvanceTime',days:190});
  await page.goto('/');await createCompany(page);await page.getByRole('navigation').getByRole('button',{name:'設定',exact:true}).click();
  await page.getByLabel('匯入存檔檔案').setInputFiles({name:'retention.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(createSave(sim.snapshot())))});
  await expect(page.locator('.company-header')).toContainText('Retention Case');await page.getByRole('navigation').getByRole('button',{name:'時間軸',exact:true}).click();await page.getByRole('combobox',{name:'重要程度'}).selectOption('critical');
  await page.locator('.timeline-list').getByRole('button',{name:/Bob Lin 提出離職/}).click();await expect(page.locator('.cause-list')).toContainText('薪資與既有期待有落差');await expect(page.getByRole('heading',{name:'這位同事先前的可觀察紀錄'})).toBeVisible();await expect(page.getByText('EmployeeExploringOptions')).not.toBeVisible();
});
