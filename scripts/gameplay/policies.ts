import type { Command } from '../../packages/domain/src/model';
import type { CompanyView } from '../../packages/simulation/src/projection';
export const strategies = ['passive', 'conservative', 'aggressive', 'employee-first', 'product-first', 'lean', 'management-first', 'career-development'] as const;
export type Policy = typeof strategies[number];
/** Player policies receive ONLY the production read model, never WorldState. */
export function decisions(policy: Policy, v: CompanyView): Command[] {
  if (v.bankrupt || policy === 'passive') return [];
  if (policy === 'management-first' || policy === 'career-development') {
    const result = decisions('conservative', v);
    if (v.simulationVersion !== 3) return result;
    const removed = new Set(result.filter(c=>c.type==='FireEmployee').map(c=>c.employeeId));
    const active = v.employees.filter(e=>e.status==='active'&&!removed.has(e.id));
    if (policy === 'career-development') {
      const candidate = active.find(e=>e.organization?.readiness.eligible && e.organization.readiness.reasons.length===0 && e.organization.careerStatus==='希望討論成長安排');
      if (candidate) result.push({type:'PromoteEmployee',employeeId:candidate.id,track:'specialist'});
    } else {
      const overloaded = active.find(e=>e.organization && (e.organization.managementLoad==='管理負荷偏高'||e.organization.reportCount>=3));
      const deputy = active.filter(e=>e.id!==overloaded?.id&&e.organization?.reportCount===0).sort((a,b)=>b.performance-a.performance||a.id.localeCompare(b.id))[0];
      const report = active.find(e=>e.managerId===overloaded?.id&&e.id!==deputy?.id);
      if (overloaded && deputy && report) {
        if (deputy.organization?.readiness.eligible) result.push({type:'PromoteEmployee',employeeId:deputy.id,track:'manager'});
        result.push({type:'AssignManager',employeeId:report.id,managerId:deputy.id});
      }
    }
    return result;
  }
  const result: Command[] = [], active = v.employees.filter(e => e.status === 'active');
  const setStrategy = (strategy: CompanyView['strategy']) => { if (v.strategy !== strategy) result.push({ type: 'ChangeCompanyStrategy', strategy }); };
  const setPriority = (priority: CompanyView['product']['priority']) => { if (v.product.priority !== priority) result.push({ type: 'ChangeProductPriority', priority }); };
  const hire = () => result.push({ type: 'HireEmployee', name: `Policy hire ${v.tick}`, role: 'Engineer', salary: 3_500_000, teamId: v.teams[0].id });
  if (policy === 'lean') {
    setStrategy('sustainable'); setPriority(v.product.launchedAt === null ? 'features' : 'quality');
    if (v.tick === 0) {
      const cto = active.find(e => e.role === 'CTO');
      if (cto) result.push({ type: 'FireEmployee', employeeId: cto.id });
    }
  } else if (policy === 'conservative') {
    setStrategy('sustainable'); setPriority(v.product.launchedAt === null ? 'features' : 'quality');
    const founder = active.find(e => e.role === 'CEO');
    if (v.tick === 0 && founder) result.push({ type: 'ChangeSalary', employeeId: founder.id, salary: 1_000_000 });
    if ((v.finance.runway ?? Infinity) < 3 && v.product.launchedAt !== null && active.length > 1) {
      const expensive = active.filter(e => e.role !== 'CEO').sort((a,b) => b.salary-a.salary || a.id.localeCompare(b.id))[0];
      result.push({ type: 'FireEmployee', employeeId: expensive.id });
    } else if (v.finance.cash > 100_000_000 && (v.finance.runway ?? Infinity) > 12 && active.length < 4) hire();
  } else if (policy === 'aggressive') {
    setStrategy('growth'); setPriority(v.product.launchedAt === null ? 'features' : 'quality');
    if (active.length < 6 && v.finance.cash > 15_000_000 && (v.finance.runway ?? Infinity) > 1.5) hire();
  } else if (policy === 'employee-first') {
    setStrategy('sustainable'); setPriority(v.product.launchedAt === null ? 'features' : 'quality');
    for (const e of active) if (e.role !== 'CEO' && e.condition !== '狀態穩定' && (v.finance.runway ?? Infinity) > 3) {
      const raises = v.events.filter(evt => evt.type === 'SalaryChanged' && evt.employeeId === e.id).length;
      if (raises < 2) result.push({ type: 'ChangeSalary', employeeId: e.id, salary: Math.round(e.salary*1.1) });
    }
  } else {
    setStrategy('balanced'); setPriority(v.product.launchedAt === null ? 'features' : 'quality');
    if (v.tick === 0 && (v.finance.runway ?? Infinity) > 4) hire();
  }
  return result;
}
