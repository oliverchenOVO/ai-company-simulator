import type { Employee, WorldState } from '../../domain/src/model';
import { clamp, random, rounded, simDate } from '../../shared/src/determinism';
import { disturbTeam, organizationInfluence, organizationSystem, careerSystem, collaborationSystem, relevantSkill } from './organization';
import { detachManager, remember, type SystemContext } from './context';

export const activeEmployees = (w: WorldState) => Object.values(w.employees).filter(e => e.status === 'active').sort((a, b) => a.id.localeCompare(b.id, 'en'));
export const payroll = (w: WorldState) => activeEmployees(w).reduce((sum, e) => sum + e.salary, 0);
export const revenue = (w: WorldState) => Object.values(w.customers).filter(c => c.status === 'active').reduce((sum, c) => sum + c.mrr, 0);
export const burn = (w: WorldState) => payroll(w) + w.company.monthlyOperatingCost - revenue(w);
export const runway = (w: WorldState) => burn(w) <= 0 ? null : Math.max(0, w.company.cash / burn(w));

export function productivity(e: Employee, workload: number): number {
  const skill = e.role === 'Designer' ? e.skills.product : e.role === 'Sales' ? e.skills.sales : e.role === 'CEO' ? e.skills.leadership : e.role === 'Operations' ? e.skills.operations : e.skills.engineering;
  return rounded((skill / 100) * (0.55 + e.psychology.satisfaction / 200) * (1 - e.psychology.burnout / 150) * Math.min(workload, 1.15));
}
export function psychologySystem({ w, active, emit, organization }: SystemContext): void {
  for (const e of active) {
    const org = organizationInfluence(w, e, organization);
    const p = e.psychology, workload = w.company.workload;
    const underpaid = clamp(1 - e.salary / Math.max(1, e.expectations.salary), 0, 1);
    let memoryEffect = 0;
    for (const m of e.memories) memoryEffect += m.sentiment * (m.importance / 100) * Math.exp(-m.decayRate * (w.meta.tick - m.tick));
    p.stress = rounded(clamp(p.stress + (workload - 0.9) * 1.8 + underpaid * 0.7 - 0.35 + org.stress));
    p.burnout = rounded(clamp(p.burnout + (p.stress > 65 ? (p.stress - 65) / 100 : -0.15)));
    const target = clamp(78 - p.stress * 0.23 - p.burnout * 0.25 - underpaid * 45 + memoryEffect * 0.04 + org.satisfaction);
    p.satisfaction = rounded(clamp(p.satisfaction + (target - p.satisfaction) * 0.025));
    p.loyalty = rounded(clamp(p.loyalty + (p.satisfaction - 60) * 0.005));
    p.companyTrust = rounded(clamp(p.companyTrust + (p.satisfaction - p.companyTrust) * 0.005));
    p.managerTrust = rounded(clamp(p.managerTrust + ((w.meta.simulationVersion === 3 ? org.trustTarget : p.companyTrust) - p.managerTrust) * 0.003));
    p.confidence = rounded(clamp(p.confidence + (e.performance - p.confidence) * 0.01));
    const intentTarget = clamp(underpaid * 50 + p.burnout * 0.45 + Math.max(0, 65 - p.satisfaction) * 1.2 + Math.max(0, 50 - p.loyalty) * 0.35 + org.retention);
    p.exitIntent = rounded(clamp(p.exitIntent + (intentTarget - p.exitIntent) * 0.05));
    if (w.meta.simulationVersion === 3 && p.exitIntent < 20) e.exitStage = 'settled';
    const newConcern = w.meta.simulationVersion !== 3 || e.exitStage === 'settled' || e.memories.some(m => m.eventId === e.lastManagementEvent && m.tick > e.lastConcernAt);
    if (e.role !== 'CEO' && p.exitIntent > 30 && newConcern && w.meta.tick - e.lastConcernAt >= 30) {
      const event = emit('EmployeeConcernRaised', { employeeId: e.id, name: e.name, concern: underpaid > 0.3 ? 'compensation' : 'workload' }, e.lastManagementEvent ?? w.company.strategyEventId, [], 'management');
      e.lastConcernAt = w.meta.tick; e.exitStage = 'concerned'; remember(w, e, event, -20, 40);
    }
    if (e.role !== 'CEO' && p.exitIntent > 55 && e.exitStage === 'concerned') {
      const event = emit('EmployeeExploringOptions', { employeeId: e.id, name: e.name }, e.memories.at(-1)?.eventId ?? null, [], 'private');
      e.exitStage = 'searching'; remember(w, e, event, -15);
    }
    if (e.role !== 'CEO' && e.exitStage === 'searching' && w.meta.tick % 7 === 0 && random(w.meta.seed, 'employees', e.id, w.meta.tick, 'resignation').chance(p.exitIntent / 100 * 0.08)) {
      const weights = { compensation: underpaid * 50, burnout: p.burnout * 0.45, management: Math.max(0, 65 - p.satisfaction) * 1.2, loyalty: Math.max(0, 50 - p.loyalty) * 0.35 };
      const causes: Record<string, number> = w.meta.simulationVersion === 3 ? { ...weights, career: e.career!.goals[0].frustration * .3, 'management-support': Math.max(0, 50 - org.trustTarget) * .2, 'team-stability': Math.max(0, 70 - w.teams[e.teamId].organization!.stability) * .08, 'role-fit': Math.max(0, 60 - relevantSkill(e)) * .12 } : weights;
      const sum = Object.values(causes).reduce((s, n) => s + n, 0) || 1;
      const event = emit('EmployeeResigned', { employeeId: e.id, name: e.name }, e.memories.at(-1)?.eventId ?? null,
        Object.entries(causes).map(([factor, value]) => ({ factor, weight: rounded(value / sum), eventId: e.lastManagementEvent ?? w.company.strategyEventId })));
      e.status = 'resigned'; e.leftAt = w.meta.tick; detachManager(w, e.id); disturbTeam(w, e.teamId, event.id); remember(w, e, event, -80, 95);
      // A departure is an actual observable event and affects surviving colleagues.
      for (const r of Object.values(w.relationships)) if (r.targetId === e.id && w.employees[r.sourceId].status === 'active') {
        const colleague = w.employees[r.sourceId]; colleague.psychology.loyalty = rounded(clamp(colleague.psychology.loyalty - r.affinity / 20)); remember(w, colleague, event, -30, 70);
      }
    }
  }
}
export function workSystem({ w, active, organization }: SystemContext): void {
  const p = w.products['product-1'];
  for (const e of active) {
    if (e.status !== 'active') continue; // Employee may have resigned earlier this tick.
    const org = organizationInfluence(w, e, organization);
    const reports = organization?.reports.get(e.id) ?? 0;
    const managementTime = w.meta.simulationVersion === 3 ? Math.min(.65, reports * .065 + (e.career!.track === 'manager' ? .15 : 0)) : 0;
    const output = rounded(productivity(e, w.company.workload) * org.work * (1 - managementTime));
    if (w.meta.simulationVersion === 3) w.teams[e.teamId].organization!.output = rounded(w.teams[e.teamId].organization!.output + output);
    e.workTotal = rounded(e.workTotal + output); e.performance = rounded(clamp(output * 100));
    if (e.role !== 'Sales' && e.role !== 'Operations') {
      p.progress = rounded(clamp(p.progress + output * (p.priority === 'features' ? 0.7 : 0.32)));
      p.quality = rounded(clamp(p.quality + output * (p.priority === 'quality' ? 0.1 : 0.006) - Math.max(0, w.company.workload - 1.1) * 0.03));
      p.technicalDebt = rounded(clamp(p.technicalDebt + output * (p.priority === 'debt' ? -0.25 : p.priority === 'features' ? 0.018 : -0.005)));
    }
  }
}
export function relationshipSystem({ w, emit }: SystemContext): void {
  if (w.meta.simulationVersion === 3) return; // v3 uses event-anchored collaboration in its own weekly system.
  for (const r of Object.values(w.relationships).sort((a, b) => a.id.localeCompare(b.id, 'en'))) {
    const source = w.employees[r.sourceId], target = w.employees[r.targetId];
    if (source.status !== 'active' || target.status !== 'active') continue;
    const oldTrust = r.trust;
    const tension = Math.max(0, source.psychology.stress - 50) / 100;
    const sameTeam = source.teamId === target.teamId;
    r.trust = rounded(clamp(r.trust + (sameTeam ? 0.25 : -0.05) - tension * 0.8));
    r.respect = rounded(clamp(r.respect + (target.performance - r.respect) * 0.02));
    r.affinity = rounded(clamp(r.affinity + (sameTeam ? 0.15 : -0.1) - tension * 0.3));
    r.resentment = rounded(clamp(r.resentment + tension * 0.5 - 0.1));
    r.rivalry = rounded(clamp(r.rivalry + (source.personality.ambition - target.personality.ambition) * 0.001));
    if (oldTrust >= 35 && r.trust < 35) emit('RelationshipStrained', { sourceId: source.id, targetId: target.id, sourceName: source.name, targetName: target.name }, w.company.strategyEventId, [{ factor: 'workload', weight: 1, eventId: w.company.strategyEventId }], 'management');
  }
}
export function productSystem({ w, emit }: SystemContext): void {
  const p = w.products['product-1'];
  const milestone = Math.floor(p.progress / 25);
  if (milestone > p.lastMilestone) {
    emit('ProductMilestoneReached', { productId: p.id, name: p.name, progress: milestone * 25 }, null, [{ factor: 'team-work', weight: 1, eventId: w.company.strategyEventId }]);
    p.lastMilestone = milestone;
  }
  if (p.progress >= 100 && p.launchedAt === null) {
    p.launchedAt = w.meta.tick;
    emit('ProductLaunched', { productId: p.id, name: p.name }, w.events.at(-1)?.id ?? null);
  }
}
export function customerSystem({ w, active, emit }: SystemContext): void {
  const p = w.products['product-1'];
  if (p.launchedAt === null) return;
  for (const c of Object.values(w.customers).sort((a, b) => a.id.localeCompare(b.id, 'en'))) {
    if (c.status !== 'active') continue;
    const target = clamp(p.quality - p.technicalDebt * 0.2 + 20);
    c.satisfaction = rounded(clamp(c.satisfaction + (target - c.satisfaction) * 0.03));
    if (w.meta.tick % 7 === 0 && random(w.meta.seed, 'customers', c.id, w.meta.tick, 'churn').chance(0.006 + Math.max(0, 60 - c.satisfaction) / 500)) {
      c.status = 'churned'; c.churnedAt = w.meta.tick;
      emit('CustomerChurned', { customerId: c.id, name: c.name, mrr: c.mrr }, null, [{ factor: c.satisfaction < 60 ? 'product-experience' : 'customer-budget', weight: 1, eventId: null }]);
    }
  }
  if (w.meta.tick % 7 !== 0 || !active.some(e => e.status === 'active')) return;
  const salesPower = active.filter(e => e.status === 'active').reduce((sum, e) => sum + e.skills.sales * (e.role === 'Sales' || e.role === 'CEO' ? 1 : 0.1), 0);
  const probability = clamp(0.12 + salesPower / 300 + w.market.demand / 500 + (w.company.strategy === 'growth' ? 0.15 : 0), 0, 0.9);
  const rng = random(w.meta.seed, 'customers', w.meta.tick, 'acquisition');
  if (rng.chance(probability)) {
    const id = `customer-${w.meta.nextEntity++}`;
    const enterprise = rng.chance(0.1);
    const mrr = (enterprise ? rng.int(12000, 22000) : rng.int(2500, 6500)) * 100;
    w.customers[id] = { id, name: `客戶 ${id.split('-')[1]}`, segment: enterprise ? 'enterprise' : 'small-business', mrr, satisfaction: clamp(p.quality + 20), status: 'active', acquiredAt: w.meta.tick, churnedAt: null };
    emit('CustomerAcquired', { customerId: id, name: w.customers[id].name, mrr }, w.events.find(e => e.type === 'ProductLaunched')?.id ?? null);
  }
}
export function marketSystem({ w }: SystemContext): void {
  const rng = random(w.meta.seed, 'market', w.meta.tick, 'demand');
  w.market.demand = rounded(clamp(w.market.demand + rng.int(-3, 3) + (60 - w.market.demand) * 0.05));
}
export function financeSystem({ w, emit, commandId }: SystemContext): void {
  // Advance tick is the start of the new day; close the previous month on day 1.
  if (!w.meta.date.endsWith('-01')) return;
  const previousMonth = simDate(w.meta.tick - 1, w.meta.startDate).slice(0, 7);
  const monthStart = Date.parse(`${previousMonth}-01T00:00:00Z`);
  const daysInMonth = (Date.parse(`${w.meta.date}T00:00:00Z`) - monthStart) / 86400000;
  const startTick = w.meta.tick - daysInMonth;
  // Accrual from exact active calendar days, including leavers and new hires; no daily rounding drift.
  const employeeCharge = Object.values(w.employees).reduce((sum, e) => {
    let charge = 0;
    for (let i = 0; i < e.salaryHistory.length; i++) {
      const rate = e.salaryHistory[i];
      const days = Math.max(0, Math.min(w.meta.tick, e.leftAt ?? w.meta.tick, e.salaryHistory[i + 1]?.tick ?? w.meta.tick) - Math.max(startTick, e.hiredAt, rate.tick));
      charge += rate.salary * days / daysInMonth;
    }
    return sum + Math.round(charge);
  }, 0);
  const customerRevenue = Object.values(w.customers).reduce((sum, c) => {
    const days = Math.max(0, Math.min(w.meta.tick, c.churnedAt ?? w.meta.tick) - Math.max(startTick, c.acquiredAt));
    return sum + Math.round(c.mrr * days / daysInMonth);
  }, 0);
  const cost = w.company.monthlyOperatingCost;
  w.company.cash += customerRevenue - employeeCharge - cost;
  const evt = emit('PayrollProcessed', { month: previousMonth, payroll: employeeCharge }, commandId);
  emit('FinancialClose', { month: previousMonth, revenue: customerRevenue, payroll: employeeCharge, operatingCost: cost, cash: w.company.cash }, evt.id);
  w.finance.history.push({ month: previousMonth, revenue: customerRevenue, payroll: employeeCharge, operatingCost: cost, cash: w.company.cash });
  if (w.company.cash <= 0) {
    w.company.bankrupt = true;
    emit('CompanyBankrupt', { cash: w.company.cash }, w.events.at(-1)?.id ?? null, [{ factor: 'cash-exhausted', weight: 1, eventId: evt.id }]);
  } else if ((runway(w) ?? Infinity) < 3) emit('RunwayWarning', { months: rounded(runway(w) ?? 0) }, evt.id, [], 'management');
}

export const SYSTEMS = [
  { name: 'organization', frequency: 'daily', run: organizationSystem, careerSystem, collaborationSystem, relevantSkill },
  { name: 'psychology', frequency: 'daily', run: psychologySystem },
  { name: 'career', frequency: 'weekly', run: careerSystem },
  { name: 'work', frequency: 'daily', run: workSystem },
  { name: 'collaboration', frequency: 'weekly', run: collaborationSystem },
  { name: 'relationships', frequency: 'weekly', run: relationshipSystem },
  { name: 'product', frequency: 'daily', run: productSystem },
  { name: 'customers', frequency: 'daily', run: customerSystem },
  { name: 'market', frequency: 'weekly', run: marketSystem },
  { name: 'finance', frequency: 'daily', run: financeSystem }
] as const;
