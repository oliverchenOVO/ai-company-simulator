import { management, organizationIndex, promotionReadiness } from './organization';
import { recruitmentCandidates, minimumCompensation } from './compensation';
import type { WorldState } from '../../domain/src/model';
import { templateNarrative } from '../../narrative/src/templates';
import { burn, payroll, revenue, runway } from './systems';
import { causeEvidence,eventPriority,financialForecast } from './decision-support';
export function projectCompany(w: WorldState) {
  const index = organizationIndex(w);
  const adjacency = new Map<string, { name: string; targetId: string; status: string }[]>();
  for (const r of Object.values(w.relationships)) {
    const list = adjacency.get(r.sourceId) ?? [];
    if (list.length < 6 && w.employees[r.targetId].status === 'active') list.push({ name: w.employees[r.targetId].name, targetId: r.targetId, status: r.trust < 35 ? '合作需要修復' : r.trust >= 75 ? '合作信任良好' : '合作尚可' });
    adjacency.set(r.sourceId, list);
  }
  const careerLabels = { advancement: '希望承擔更高職級的責任', leadership: '希望帶領與支持團隊', mastery: '專注累積專業成果', stability: '重視穩定的工作環境' };
  const organizationView = (e: WorldState['employees'][string]) => {
    if (!e.career) return null;
    const m = management(w, e, index), count = index.reports.get(e.id) ?? 0;
    const capacity = Math.max(2, (3 + e.skills.leadership / 15) * (1 - e.psychology.stress / 250));
    const goal = e.career.goals[0];
    return { level: e.career.level, track: e.career.track, direction: careerLabels[goal.type],
      careerStatus: goal.frustration >= 55 ? '職涯期待持續未解' : goal.frustration >= 20 ? '希望討論成長安排' : goal.progress >= 90 ? '目前目標有進展' : '持續累積中',
      retention: e.psychology.exitIntent > 55 ? '留任需要關注' : goal.frustration >= 20 ? '職涯需要關注' : m.quality < 45 ? '主管支持需要關注' : '暫無明顯留任警訊',
      readiness: promotionReadiness(w, e)!, managerSupport: m.quality < 45 ? '支持不足' : m.quality >= 65 ? '支持良好' : '仍在磨合',
      reportCount: count, managementLoad: count > capacity ? '管理負荷偏高' : count ? '管理負荷可支持' : '無直接部屬',
      relationships: adjacency.get(e.id) ?? [] };
  };
  const employees = Object.values(w.employees).sort((a, b) => a.hiredAt - b.hiredAt || (a.id < b.id ? -1 : 1)).map(e => ({
    organization: organizationView(e), managerId: e.managerId, id: e.id, name: e.name, role: e.role, status: e.status, salary: e.salary, expectedSalary: e.expectations.salary, minimumAcceptedSalary: w.meta.simulationVersion>=2 && e.role!=='CEO' ? minimumCompensation(e.expectations.salary,e.personality.riskTolerance) : null, teamId: e.teamId, teamName: w.teams[e.teamId].name,
    managerName: e.managerId ? w.employees[e.managerId].name : '—', hiredAt: e.hiredAt, tenureDays: (e.leftAt ?? w.meta.tick) - e.hiredAt,
    performance: e.performance, condition: e.status !== 'active' ? '已離職' : e.psychology.burnout > 50 ? '需要休息' : e.psychology.stress > 65 ? '承受壓力' : e.psychology.satisfaction < 50 ? '有所顧慮' : '狀態穩定'
  }));
  const visibleEvents = w.events.filter(e => e.visibility !== 'private').map(e => ({
    id: e.id, tick: e.tick, type: e.type, employeeId: typeof e.payload.employeeId === 'string' ? e.payload.employeeId : null,
    causedBy: e.causedBy, causes: causeEvidence(e), priority:eventPriority(e.type),
    ...templateNarrative.describe(e)!
  }));
  const active = employees.filter(e => e.status === 'active');
  const customerRisk=Object.values(w.customers).some(c=>c.status==='active'&&c.satisfaction<65);
  const monthlyBurn = burn(w), months = runway(w);
  const alerts: { title: string; body: string; severity: 'warning' | 'info' | 'danger' }[] = [];
  if (w.company.bankrupt) alerts.push({ title: '公司已停止營運', body: '你可以載入較早的存檔，或重新創立公司。', severity: 'danger' });
  else {
    const forecast=financialForecast(w);
    if(forecast.cashAfterClose<=0)alerts.push({title:'下次月結可能耗盡現金',body:`${forecast.date} 將結算已累積的薪資與合約。請立即查看財務；現在縮編仍須支付已工作天數的薪資。`,severity:'danger'});
    else if ((months ?? Infinity) < 1) alerts.push({title:'現金跑道少於一個月',body:'先查看月結預估與可調整的支出。這是嚴重警訊，不代表所有干預都已無效。',severity:'danger'});
    else if ((months ?? Infinity) < 3) alerts.push({ title: '留意現金跑道', body: '目前預估跑道少於三個月。檢視薪資、招聘與產品進度；招聘會立即增加每月支出。', severity: 'warning' });
    else if((months??Infinity)<6)alerts.push({title:'現金跑道需要規劃',body:'跑道少於六個月。先評估產品上市速度與支出，合約收入成長尚未保證。',severity:'warning'});
    if (!revenue(w)) alerts.push({ title: '營收尚未開始', body: '設定產品優先順序，同時留意現金跑道。', severity: 'warning' });
    if (active.some(e => e.condition !== '狀態穩定')) alerts.push({ title: '團隊需要你的關注', body: '有同事近期承受壓力，請查看人員與收件匣。', severity: 'warning' });
    if(active.some(e=>e.organization?.managementLoad==='管理負荷偏高')) alerts.push({title:'主管支持需要重新安排',body:'有主管的直接部屬超過目前可支持的範圍。請查看團隊與匯報結構。',severity:'warning'});
    if(active.some(e=>e.organization?.careerStatus==='希望討論成長安排'||e.organization?.careerStatus==='職涯期待持續未解')) alerts.push({title:'職涯安排需要回應',body:'有同事提出成長期待，請查看人員詳情與相關事件。',severity:'warning'});
    if(customerRisk)alerts.push({title:'客戶體驗需要跟進',body:'部分客戶的使用體驗轉弱。檢視產品品質、技術債與客戶事件；外部預算變化仍可能沒有預警。',severity:'warning'});
    if (!alerts.length) alerts.push({ title: '營運持續推進', body: '團隊與客戶暫無明顯警訊，持續觀察下一步。', severity: 'info' });
  }
  return {
    simulationVersion: w.meta.simulationVersion, recruitment: recruitmentCandidates(w), name: w.company.name, date: w.meta.date, tick: w.meta.tick, revision: w.commands.length, bankrupt: w.company.bankrupt, strategy: w.company.strategy,
    finance: { cash: w.company.cash, revenue: revenue(w), payroll: payroll(w), operatingCost: w.company.monthlyOperatingCost, burn: monthlyBurn, runway: months, forecast:financialForecast(w), history: w.finance.history.map(m => ({ ...m })) },
    employees, teams: Object.values(w.teams).map(t => {
      const members = index.members.get(t.id) ?? [], manager = t.managerId ? w.employees[t.managerId] : null;
      return { id: t.id, name: t.name, managerId: t.managerId, managerName: manager?.name ?? '待安排', memberCount: members.length,
        condition: members.some(e => e.psychology.stress > 65 || e.psychology.satisfaction < 50) ? '需要關注' : '運作穩定',
        organization: t.organization ? { coordination: t.organization.coordination < 50 ? '協作需要支持' : t.organization.coordination >= 70 ? '协作順暢' : '協作磨合中',
          stability: t.organization.stability < 60 ? '正在適應異動' : '人員逐步穩定',
          composition: [...new Set(members.map(e=>e.role))], managementLoad: manager ? organizationView(manager)!.managementLoad : '缺少團隊主管',
          careerConcerns: members.filter(e => e.career!.goals[0].frustration >= 20).length,
          recentChangeId: t.organization.lastChangeEvent } : null };
    }),
    product: { ...w.products['product-1'] },
    customers: Object.values(w.customers).map(c => ({ id: c.id, name: c.name, segment: c.segment, mrr: c.mrr, status: c.status, acquiredAt: c.acquiredAt, condition: c.status === 'churned' ? '已流失' : c.satisfaction < 60 ? '需要跟進' : c.satisfaction < 65 ? '體驗轉弱' : '使用穩定' })),
    events: visibleEvents, messages: visibleEvents.filter(e => ['人事', '產品', '客戶', '財務'].includes(e.channel)), alerts,
    headcount: active.length, customerCount: Object.values(w.customers).filter(c => c.status === 'active').length
  };
}
export type CompanyView = ReturnType<typeof projectCompany>;
export type EmployeeView = CompanyView['employees'][number];
export type EventView = CompanyView['events'][number];
