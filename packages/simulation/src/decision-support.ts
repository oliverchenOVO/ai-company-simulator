import type { DomainEvent,WorldState } from '../../domain/src/model';
import type { CompanyView } from './projection';
export type EventPriority='critical'|'warning'|'important'|'informational';
export function eventPriority(type:string):EventPriority {
  if(['CompanyBankrupt','EmployeeResigned'].includes(type))return 'critical';
  if(['RunwayWarning','EmployeeConcernRaised','RelationshipStrained','CustomerChurned'].includes(type))return 'warning';
  if(['ProductMilestoneReached','ProductLaunched','EmployeeHired','EmployeeFired','SalaryChanged','StrategyChanged','ProductPriorityChanged'].includes(type))return 'important';
  return 'informational';
}
const explanations:Record<string,string>={
  compensation:'薪資與既有期待有落差。可檢視近期薪資決策，也要確認調薪後的現金跑道。',
  burnout:'長期疲勞累積。降低營運節奏需要時間，並會放慢工作產出。',
  management:'工作滿意度偏低。此分類本身不足以證明主管失職，請對照同事回饋與近期安排。',
  loyalty:'對公司的歸屬感下降。這是離職的一項促成因素，不代表唯一原因。',
  workload:'目前營運節奏增加團隊負荷，可在設定調整策略。',
  'team-work':'團隊每天累積的工作產出形成了產品里程碑。',
  'product-experience':'產品使用體驗是本次流失的分類原因，可檢視品質與技術債。',
  'customer-budget':'此事件被模型分類為客戶預算／外部因素；沒有具體預算資料，也不保證能事先警告。',
  'cash-exhausted':'月結後現金耗盡，當期收入未能覆蓋應付薪資與營運支出。'
};
export function causeEvidence(event:DomainEvent) {
  return event.causes.filter(c=>c.weight>0).map(c=>({factor:c.factor,eventId:c.eventId,evidence:explanations[c.factor]??'事件記錄包含這項原因；尚無額外可公開證據。'}));
}
/** Accounting projection, not a simulated future. Existing rates/contracts held fixed. */
export function financialForecast(w:WorldState) {
  const date=new Date(`${w.meta.date}T00:00:00Z`),monthStart=Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),1),end=Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,1);
  const startTick=Math.round((monthStart-Date.parse(`${w.meta.startDate}T00:00:00Z`))/86400000),endTick=Math.round((end-Date.parse(`${w.meta.startDate}T00:00:00Z`))/86400000),days=endTick-startTick;
  let payroll=0,revenue=0;
  for(const e of Object.values(w.employees)){
    let charge=0;
    for(let i=0;i<e.salaryHistory.length;i++){
      const rate=e.salaryHistory[i],activeDays=Math.max(0,Math.min(endTick,e.leftAt??endTick,e.salaryHistory[i+1]?.tick??endTick)-Math.max(startTick,e.hiredAt,rate.tick));
      charge+=rate.salary*activeDays/days;
    }
    payroll+=Math.round(charge);
  }
  for(const c of Object.values(w.customers))revenue+=Math.round(c.mrr*Math.max(0,Math.min(endTick,c.churnedAt??endTick)-Math.max(startTick,c.acquiredAt))/days);
  return {date:new Date(end).toISOString().slice(0,10),daysUntilClose:endTick-w.meta.tick,payroll,revenue,cashAfterClose:w.company.cash+revenue-payroll-w.company.monthlyOperatingCost};
}
export function advanceSummary(before:CompanyView,after:CompanyView) {
  const fresh=after.events.slice(before.events.length);
  return {from:before.date,to:after.date,days:after.tick-before.tick,cashChange:after.finance.cash-before.finance.cash,mrrChange:after.finance.revenue-before.finance.revenue,
    productChange:Math.round((after.product.progress-before.product.progress)*10)/10,headcountChange:after.headcount-before.headcount,
    acquired:fresh.filter(e=>e.type==='CustomerAcquired').length,churned:fresh.filter(e=>e.type==='CustomerChurned').length,
    events:fresh.filter(e=>e.priority!=='informational').sort((a,b)=>priorityRank[a.priority]-priorityRank[b.priority]||b.tick-a.tick).slice(0,4),
    warnings:after.alerts.filter(a=>a.severity!=='info')};
}
export const priorityRank:Record<EventPriority,number>={critical:0,warning:1,important:2,informational:3};
export type AdvanceSummary=ReturnType<typeof advanceSummary>;
