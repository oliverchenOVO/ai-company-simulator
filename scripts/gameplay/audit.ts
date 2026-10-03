import type { WorldState } from '../../packages/domain/src/model';
import type { CompanyView } from '../../packages/simulation/src/projection';
export const importantTypes = new Set(['EmployeeResigned','ProductLaunched','ProductMilestoneReached','CompanyBankrupt','CustomerChurned','EmployeeFired','EmployeePromoted','ManagerChanged','TeamCoordinationChanged','CareerConcernRaised','CareerGoalBlocked','PeerPromotionReaction']);
export const warningTypes = new Set(['RunwayWarning','EmployeeConcernRaised','RelationshipStrained']);
export function metrics(v: CompanyView, w: WorldState) {
  const active = v.employees.filter(e=>e.status==='active');
  const counts: Record<string,number> = {};
  for (const e of v.events) counts[e.type]=(counts[e.type]??0)+1;
  const important = v.events.filter(e=>importantTypes.has(e.type));
  const gaps = important.slice(1).map((e,i)=>e.tick-important[i].tick);
  const bankrupt = v.events.find(e=>e.type==='CompanyBankrupt');
  const meaningful = v.events.find(e=>e.type==='RunwayWarning');
  const lead = v.events.filter(e=>e.type==='EmployeeResigned').map(e=>({ employeeId:e.employeeId, outcome:e.tick, signal:v.events.find(s=>s.type==='EmployeeConcernRaised'&&s.employeeId===e.employeeId)?.tick??null }));
  const factors: string[]=[];
  if(bankrupt) {
    if(v.finance.revenue<v.finance.payroll+v.finance.operatingCost) factors.push('insufficient recurring revenue');
    if(v.finance.payroll>v.finance.revenue) factors.push('salary burden');
    if((counts.EmployeeHired??0)>0) factors.push('hiring exposure (association, not isolated causation)');
    if((counts.CustomerChurned??0)>0) factors.push('customer revenue loss');
    if((counts.EmployeeResigned??0)>0) factors.push('employee loss');
    if(v.product.launchedAt===null) factors.push('product not launched');
  }
  return {cashNTD:v.finance.cash/100,runway:v.finance.runway,employees:v.headcount,customers:v.customerCount,mrrNTD:v.finance.revenue/100,payrollNTD:v.finance.payroll/100,
    revenueNTD:v.finance.history.reduce((s,m)=>s+m.revenue,0)/100,bankrupt:v.bankrupt,bankruptcyTick:bankrupt?.tick??null,firstMonthlyWarning:meaningful?.tick??null,
    resignationLeadDays:lead.map(e=>e.signal===null?null:e.outcome-e.signal),customerChurn:(counts.CustomerChurned??0),resignations:(counts.EmployeeResigned??0),milestones:(counts.ProductMilestoneReached??0),launchTick:v.product.launchedAt,
    observableHealth:Object.fromEntries(['狀態穩定','有所顧慮','承受壓力','需要休息'].map(label=>[label,active.length?active.filter(e=>e.condition===label).length/active.length:null])),
    majorWarnings:v.events.filter(e=>warningTypes.has(e.type)).length,majorEvents:important.length,eventCounts:counts,eventCount:v.events.length,quietGapDays:gaps.length?Math.max(...gaps):null,failureFactors:factors,
    // Omniscient diagnostic ONLY: never passed into policies or production UI.
    diagnostic:{burnoutCount:Object.values(w.employees).filter(e=>e.psychology.burnout>50).length,privateSearchCount:w.events.filter(e=>e.type==='EmployeeExploringOptions').length}
  };
}
