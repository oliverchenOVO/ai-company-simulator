import type { Employee, WorldState } from '../../domain/src/model';
import { clamp, rounded } from '../../shared/src/determinism';
import { remember, type SystemContext } from './context';

export const levels = ['Junior', 'Mid', 'Senior', 'Lead'] as const;
export function initializeCareer(e: Employee, tick: number): void {
  const level = e.role === 'CEO' || e.role === 'CTO' ? 'Lead' : 'Mid';
  const type = e.personality.ambition >= 60 ? (e.skills.leadership >= 55 ? 'leadership' : 'advancement') : e.personality.riskTolerance < 45 ? 'stability' : 'mastery';
  e.career = { level, track: e.role === 'CEO' ? 'manager' : 'specialist', lastProgressAt: tick, lastConversationAt: tick, overloaded: false,
    goals: [{ type, importance: e.personality.ambition, progress: 0, frustration: 0, createdAt: tick, targetLevel: level === 'Lead' ? null : 'Senior', causes: [] }] };
}
export function initializeOrganization(w: WorldState): void {
  for (const e of Object.values(w.employees)) {
    initializeCareer(e, w.meta.tick);
    if (e.managerId) ensureRelationship(w, e.id, e.managerId);
  }
  for (const t of Object.values(w.teams)) t.organization = { stability: 85, coordination: 65, output: 0, lastChangeEvent: null, condition: 'steady' };
}
export function ensureRelationship(w: WorldState, sourceId: string, targetId: string) {
  const id = `${sourceId}>${targetId}`;
  return w.relationships[id] ??= { id, sourceId, targetId, trust: 60, respect: 60, affinity: 50, rivalry: 5, resentment: 0 };
}
export function relevantSkill(e: Employee): number {
  return e.role === 'Sales' ? e.skills.sales : e.role === 'Designer' ? e.skills.product : e.role === 'Operations' ? e.skills.operations : e.role === 'CEO' ? e.skills.leadership : e.skills.engineering;
}
/** Derived indexes, rebuilt once per tick. No second authoritative relationship graph. */
export function organizationIndex(w: WorldState) {
  const members = new Map<string, Employee[]>(), reports = new Map<string, number>(), ties = new Map<string, { sum: number; count: number }>();
  for (const e of Object.values(w.employees)) if (e.status === 'active') {
    const list = members.get(e.teamId) ?? []; list.push(e); members.set(e.teamId, list);
    if (e.managerId) reports.set(e.managerId, (reports.get(e.managerId) ?? 0) + 1);
  }
  for (const r of Object.values(w.relationships)) {
    const source = w.employees[r.sourceId], target = w.employees[r.targetId];
    if (source.status !== 'active' || target.status !== 'active' || source.teamId !== target.teamId) continue;
    const t = ties.get(source.teamId) ?? { sum: 0, count: 0 }; t.sum += (r.trust + r.affinity - r.resentment) / 2; t.count++; ties.set(source.teamId, t);
  }
  return { members, reports, ties };
}
export type OrganizationIndex = ReturnType<typeof organizationIndex>;
export function management(w: WorldState, e: Employee, index: OrganizationIndex) {
  const manager = e.managerId ? w.employees[e.managerId] : null;
  if (!manager || manager.status !== 'active') return { quality: e.role === 'CEO' ? 65 : 38, capacity: 0, count: 0, overload: 0, attention: 0 };
  const count = index.reports.get(manager.id) ?? 0;
  const capacity = rounded(Math.max(2, (3 + manager.skills.leadership / 15) * (1 - manager.psychology.stress / 250)));
  const attention = Math.min(1, capacity / Math.max(1, count));
  const relationship = w.relationships[`${e.id}>${manager.id}`];
  const trust = relationship ? (relationship.trust + relationship.respect - relationship.resentment) / 2 : 50;
  const domain = e.role === 'Engineer' || e.role === 'CTO' ? manager.skills.engineering : e.role === 'Sales' ? manager.skills.sales : e.role === 'Designer' ? manager.skills.product : manager.skills.operations;
  const quality = rounded(clamp((manager.skills.leadership * .45 + domain * .15 + trust * .25 + (100 - manager.psychology.stress) * .15) * (.45 + attention * .55)));
  return { quality, capacity, count, overload: Math.max(0, count - capacity), attention };
}
export function organizationSystem(ctx: SystemContext): void {
  const { w, active, emit } = ctx;
  if (w.meta.simulationVersion !== 3) return;
  const index = organizationIndex(w); ctx.organization = index;
  for (const manager of active) {
    const count = index.reports.get(manager.id) ?? 0;
    const capacity = Math.max(2, (3 + manager.skills.leadership / 15) * (1 - manager.psychology.stress / 250));
    const overloaded = count > capacity;
    if (overloaded !== manager.career!.overloaded) {
      manager.career!.overloaded = overloaded;
      emit(overloaded ? 'ManagerOverloaded' : 'ManagementLoadRecovered', { employeeId: manager.id, name: manager.name, reports: count }, manager.lastManagementEvent, [{ factor: 'management-capacity', weight: 1, eventId: manager.lastManagementEvent }], 'management');
    }
  }
  for (const team of Object.values(w.teams)) {
    const state = team.organization!, members = index.members.get(team.id) ?? [];
    state.stability = rounded(clamp(state.stability + .35));
    if (!members.length) continue;
    const support = members.reduce((sum, e) => sum + management(w, e, index).quality, 0) / members.length;
    const ties = index.ties.get(team.id), cohesion = ties ? ties.sum / ties.count : 50;
    const coverage = new Set(members.map(e => e.role)).size;
    const target = clamp(30 + support * .3 + cohesion * .2 + state.stability * .2 + Math.min(3, coverage) * 2 - Math.log2(1 + members.length) * 3);
    state.coordination = rounded(clamp(state.coordination + (target - state.coordination) * .03));
    const condition = state.coordination < 50 ? 'strained' : 'steady';
    if (condition !== state.condition) {
      state.condition = condition;
      emit('TeamCoordinationChanged', { teamId: team.id, name: team.name, condition }, state.lastChangeEvent,
        [{ factor: 'team-stability', weight: Math.max(0, 70 - state.stability), eventId: state.lastChangeEvent }, { factor: 'management-support', weight: Math.max(0, 60 - support), eventId: state.lastChangeEvent }, { factor: 'team-size', weight: members.length > 8 ? 1 : 0, eventId: null }], 'management');
    }
  }
}
export function organizationInfluence(w: WorldState, e: Employee, index?: OrganizationIndex) {
  if (w.meta.simulationVersion !== 3 || !index) return { stress: 0, satisfaction: 0, retention: 0, trustTarget: e.psychology.companyTrust, work: 1 };
  const m = management(w, e, index), team = w.teams[e.teamId].organization!, tie = index.ties.get(e.teamId);
  const cohesion = tie ? tie.sum / tie.count : 50, frustration = e.career!.goals[0].frustration;
  const roleMismatch = Math.max(0, 60 - relevantSkill(e));
  return { stress: (55 - m.quality) * .006 + (80 - team.stability) * .003 + roleMismatch * .002,
    satisfaction: (m.quality - 55) * .15 + (team.coordination - 60) * .1 - frustration * .12 - roleMismatch * .08,
    retention: Math.max(0, 50 - m.quality) * .2 + frustration * .3 + Math.max(0, 70 - team.stability) * .08 + roleMismatch * .12 - Math.max(0, cohesion - 50) * .12,
    trustTarget: m.quality, work: .85 + team.coordination * .003 };
}
export function disturbTeam(w: WorldState, teamId: string, eventId: string, severity = 12): void {
  if (w.meta.simulationVersion !== 3) return;
  const state = w.teams[teamId].organization!;
  state.stability = rounded(clamp(state.stability - severity)); state.lastChangeEvent = eventId;
}
export function organizationalMemory(ctx: SystemContext, e: Employee, type: string, factor: string, sentiment: number) {
  const event = ctx.emit(type, { employeeId: e.id, name: e.name }, e.lastManagementEvent, [{ factor, weight: 1, eventId: e.lastManagementEvent }], 'management');
  remember(ctx.w, e, event, sentiment, 55); return event;
}
