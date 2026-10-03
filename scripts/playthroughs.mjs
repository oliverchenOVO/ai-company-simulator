import { chromium } from '@playwright/test';
import { mkdirSync,writeFileSync,readFileSync } from 'node:fs';
const folder=`docs/phase1_5/data/ui-playthroughs${process.env.FOUNDRY_PLAYTEST_LABEL??''}`;mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const sessions=[['conservative','benchmark-001'],['aggressive','benchmark-001'],['poor-decisions-recovery','benchmark-002'],['employee-stability','benchmark-003']];
for(const [style,seed] of sessions){
  const context=await browser.newContext(),page=await context.newPage(),notes=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(process.env.FOUNDRY_PLAYTEST_URL??'http://127.0.0.1:4174',{waitUntil:'domcontentloaded',timeout:60000});await page.getByLabel('世界種子（Seed）').fill(seed);await page.getByRole('button',{name:'創立公司',exact:true}).click();
  await page.getByRole('button',{name:'推進一週',exact:true}).waitFor();
  const nav=async label=>{await page.getByRole('navigation').getByRole('button',{name:label,exact:true}).click();};
  const strategy=async value=>{await nav('設定');await page.getByRole('combobox',{name:'營運方向',exact:true}).selectOption(value);await page.getByRole('button',{name:'儲存公司策略',exact:true}).click();await page.getByText(`目前：${{growth:'積極成長',sustainable:'穩健經營',balanced:'均衡發展'}[value]}`).waitFor();notes.push({decision:'strategy',value});};
  const salary=async(name,value)=>{await nav('人員');await page.getByRole('button',{name,exact:true}).click();const d=page.getByRole('dialog');await d.getByLabel('調整月薪（NT$）').fill(String(value));await d.getByRole('button',{name:'儲存薪資',exact:true}).click();await page.getByRole('button',{name:'推進一週',exact:true}).isEnabled();await page.waitForFunction(()=>!document.querySelector('main').getAttribute('aria-busy')||document.querySelector('main').getAttribute('aria-busy')==='false');await page.keyboard.press('Escape');notes.push({decision:'salary',name,value});};
  const fire=async name=>{await nav('人員');await page.getByRole('button',{name,exact:true}).click();const d=page.getByRole('dialog');await d.getByRole('button',{name:'解僱員工',exact:true}).click();await d.getByRole('button',{name:'確認解僱',exact:true}).click();await d.waitFor({state:'hidden'});notes.push({decision:'fire',name});};
  const hire=async name=>{await nav('人員');await page.getByRole('button',{name:'招募員工',exact:true}).click();const d=page.getByRole('dialog');await d.getByLabel('姓名',{exact:true}).fill(name);await d.getByRole('button',{name:'確認招募',exact:true}).click();await d.waitFor({state:'hidden'});notes.push({decision:'hire',name,salary:35000});};
  const quality=async()=>{await nav('產品');await page.getByRole('radio',{name:/品質提升/}).check();await page.getByRole('button',{name:'儲存產品方向',exact:true}).click();await page.locator('.detail-grid dd').getByText('品質提升',{exact:true}).waitFor();notes.push({decision:'product quality'});};
  if(style==='conservative'){await salary('Alice Chen',10000);await strategy('sustainable');}
  if(style==='aggressive'){await strategy('growth');await hire('Growth Engineer');await hire('Second Engineer');}
  if(style==='poor-decisions-recovery'){await hire('Early Engineer');await salary('Bob Lin',0);await strategy('growth');}
  if(style==='employee-stability')await strategy('sustainable');
  let week=0;
  while(week<53){
    await nav('總覽');const advance=page.getByRole('button',{name:'推進一週',exact:true});if(await advance.isDisabled())break;
    await advance.click();week++;await page.getByText(`第 ${week*7} 天`,{exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('main').getAttribute('aria-busy')==='false');
    if(week%4===0||[12,14,16].includes(week))notes.push({tick:week*7,visible:await page.locator('main').innerText()});
    if(style==='conservative'&&week===12){await fire('Bob Lin');await quality();}
    if(style==='aggressive'&&week===8)await quality();
    if(style==='poor-decisions-recovery'&&week===8){await fire('Early Engineer');await salary('Alice Chen',0);await salary('Bob Lin',40000);await strategy('sustainable');await quality();}
    if(style==='employee-stability'&&week===12)await quality();
  }
  await nav('設定');const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'匯出存檔',exact:true}).click();const download=await downloading;await download.saveAs(`${folder}/${style}.save.json`);
  const save=JSON.parse(readFileSync(`${folder}/${style}.save.json`,'utf8'));
  notes.push({result:{tick:save.world.meta.tick,bankrupt:save.world.company.bankrupt,cashNTD:save.world.company.cash/100},errors});
  writeFileSync(`${folder}/${style}.notes.json`,JSON.stringify({operator:'Codex through real browser controls; not human participant research',style,seed,startingCashNTD:500000,startingEmployees:3,notes},null,2)+'\n');
  if(errors.length)throw Error(errors.join('\n'));console.log(style,JSON.stringify(notes.at(-1)));await context.close();
}
await browser.close();
