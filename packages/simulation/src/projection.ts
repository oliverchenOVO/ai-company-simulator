import type { WorldState } from '../../domain/src/model';
import { templateNarrative } from '../../narrative/src/templates';
import { burn, payroll, revenue, runway } from './systems';
export function projectCompany(w: WorldState) {
  const employees = Object.values(w.employees).sort((a, b) => a.hiredAt - b.hiredAt || (a.id < b.id ? -1 : 1)).map(e => ({
    id: e.id, name: e.name, role: e.role, status: e.status, salary: e.salary, teamId: e.teamId, teamName: w.teams[e.teamId].name,
    managerName: e.managerId ? w.employees[e.managerId].name : '—', hiredAt: e.hiredAt, tenureDays: (e.leftAt ?? w.meta.tick) - e.hiredAt,
    performance: e.performance, condition: e.status !== 'active' ? '已離職' : e.psychology.burnout > 50 ? '需要休息' : e.psychology.stress > 65 ? '承受壓力' : e.psychology.satisfaction < 50 ? '有所顧慮' : '狀態穩定'
  }));
  const visibleEvents = w.events.filter(e => e.visibility !== 'private').map(e => ({
    id: e.id, tick: e.tick, type: e.type, employeeId: typeof e.payload.employeeId === 'string' ? e.payload.employeeId : null,
    causedBy: e.causedBy, causes: e.causes.map(c => ({ factor: c.factor, eventId: c.eventId })),
    ...templateNarrative.describe(e)!
  }));
  const active = employees.filter(e => e.status === 'active');
  const monthlyBurn = burn(w), months = runway(w);
  const alerts: { title: string; body: string; severity: 'warning' | 'info' | 'danger' }[] = [];
  if (w.company.bankrupt) alerts.push({ title: '公司已停止營運', body: '你可以載入較早的存檔，或重新創立公司。', severity: 'danger' });
  else {
    if ((months ?? Infinity) < 3) alerts.push({ title: '留意現金跑道', body: '目前預估跑道少於三個月，請檢視支出。', severity: 'warning' });
    if (!revenue(w)) alerts.push({ title: '營收尚未開始', body: '設定產品優先順序，同時留意現金跑道。', severity: 'warning' });
    if (active.some(e => e.condition !== '狀態穩定')) alerts.push({ title: '團隊需要你的關注', body: '有同事近期承受壓力，請查看人員與收件匣。', severity: 'warning' });
    if (!alerts.length) alerts.push({ title: '營運持續推進', body: '團隊與客戶暫無明顯警訊，持續觀察下一步。', severity: 'info' });
  }
  return {
    name: w.company.name, date: w.meta.date, tick: w.meta.tick, bankrupt: w.company.bankrupt, strategy: w.company.strategy,
    finance: { cash: w.company.cash, revenue: revenue(w), payroll: payroll(w), operatingCost: w.company.monthlyOperatingCost, burn: monthlyBurn, runway: months, history: w.finance.history.map(m => ({ ...m })) },
    employees, teams: Object.values(w.teams).map(t => ({ id: t.id, name: t.name, managerId: t.managerId, managerName: t.managerId ? w.employees[t.managerId].name : '待安排', memberCount: active.filter(e => e.teamId === t.id).length, condition: active.some(e => e.teamId === t.id && e.condition !== '狀態穩定') ? '需要關注' : '運作穩定' })),
    product: { ...w.products['product-1'] },
    customers: Object.values(w.customers).map(c => ({ id: c.id, name: c.name, segment: c.segment, mrr: c.mrr, status: c.status, acquiredAt: c.acquiredAt, condition: c.status === 'churned' ? '已流失' : c.satisfaction < 55 ? '需要跟進' : '使用穩定' })),
    events: visibleEvents, messages: visibleEvents.filter(e => ['人事', '產品', '客戶', '財務'].includes(e.channel)), alerts,
    headcount: active.length, customerCount: Object.values(w.customers).filter(c => c.status === 'active').length
  };
}
export type CompanyView = ReturnType<typeof projectCompany>;
export type EmployeeView = CompanyView['employees'][number];
export type EventView = CompanyView['events'][number];
