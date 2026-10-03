import type { Employee, WorldState, Command } from '../../domain/src/model';
import { clamp, rounded } from '../../shared/src/determinism';
import { remember, type SystemContext } from './context';

export const levels = ['Junior', 'Mid', 'Senior', 'Lead'] as const;
export function initializeCareer(e: Employee, tick: number): void {
  const level = e.role === 'CEO' || e.role === 'CTO' ? 'Lead' : 'Mid';
  const type = level === 'Lead' ? (e.role === 'CEO' ? 'leadership' : 'mastery') : e.personality.ambition >= 60 ? (e.skills.leadership >= 55 ? 'leadership' : 'advancement') : e.personality.riskTolerance < 45 ? 'stability' : 'mastery';
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

export function promotionReadiness(w: WorldState, e: Employee) {
  const c = e.career;
  if (!c) return null;
  const eligible = c.level !== 'Lead' && e.role !== 'CEO';
  const reasons: string[] = [];
  if (w.meta.tick - e.hiredAt < 90) reasons.push('任職尚未滿三個月');
  if (relevantSkill(e) < (c.level === 'Senior' ? 80 : 70)) reasons.push('專業能力仍需累積');
  if (e.performance < 65) reasons.push('近期產出仍需支持');
  return { eligible, status: !eligible ? '已達目前最高職級' : reasons.length ? '可晉升，但建議先累積經驗' : '具備晉升準備', reasons, leadership: e.skills.leadership >= 60 ? '適合嘗試管理' : '管理能力仍需培養' };
}
export function careerSystem(ctx: SystemContext): void {
  const { w, active, organization } = ctx;
  if (w.meta.simulationVersion !== 3 || !organization) return;
  for (const e of active) {
    const c = e.career!, goal = c.goals[0], support = management(w, e, organization).quality;
    const age = w.meta.tick - c.lastProgressAt;
    let progress = goal.progress;
    if (goal.type === 'mastery') progress = Math.min(100, e.workTotal / 3);
    if (goal.type === 'stability') progress = clamp(w.teams[e.teamId].organization!.stability - e.psychology.stress * .2);
    if (goal.type === 'leadership') progress = c.track === 'manager' && (organization.reports.get(e.id) ?? 0) > 0 ? 100 : Math.min(75, age / 8); // Leadership goal is obtaining real reporting responsibility; effectiveness remains independent.
    if (goal.type === 'advancement' && goal.progress < 100) progress = Math.min(75, (w.meta.tick - e.hiredAt) / 4 + e.performance * .2);
    const previous = goal.progress; goal.progress = rounded(progress);
    const blocked = (goal.type === 'advancement' || goal.type === 'leadership') && goal.progress < 90 && age > 60;
    const oldFrustration = goal.frustration;
    goal.frustration = rounded(clamp(goal.frustration + (blocked ? .9 + goal.importance / 70 + Math.max(0, 55 - support) / 30 : -.8)));
    goal.causes = blocked ? [{ factor: 'career', eventId: e.lastManagementEvent }, ...(support < 50 ? [{ factor: 'management-support', eventId: e.lastManagementEvent }] : [])] : [];
    if (previous < 90 && goal.progress >= 90) organizationalMemory(ctx, e, 'CareerGoalProgressed', 'career-progress', 15);
    if (oldFrustration < 20 && goal.frustration >= 20) {
      c.lastConversationAt = w.meta.tick; organizationalMemory(ctx, e, 'CareerConcernRaised', 'career', -15);
    }
    if (oldFrustration < 55 && goal.frustration >= 55) {
      c.lastConversationAt = w.meta.tick; organizationalMemory(ctx, e, 'CareerGoalBlocked', 'career', -25);
    }
    // Persistent unmet progression affects trust slowly, rather than repeatedly applying the memory sentiment.
    e.psychology.companyTrust = rounded(clamp(e.psychology.companyTrust - goal.frustration * .007));
  }
}
export function collaborationSystem(ctx: SystemContext): void {
  const { w, emit, organization } = ctx;
  if (w.meta.simulationVersion !== 3 || !organization) return;
  for (const r of Object.values(w.relationships).sort((a,b) => a.id.localeCompare(b.id, 'en'))) {
    const a = w.employees[r.sourceId], b = w.employees[r.targetId];
    if (a.status !== 'active' || b.status !== 'active') continue;
    const old = r.trust;
    const collaborating = a.teamId === b.teamId && a.performance >= 45 && b.performance >= 45;
    const support = a.managerId === b.id ? management(w, a, organization).quality : null;
    const pressure = Math.max(0, a.psychology.stress - 60) / 100;
    // Changes require ongoing successful work, pressured collaboration or direct managerial support.
    if (collaborating) {
      r.trust = rounded(clamp(r.trust + .2 - pressure * .8)); r.affinity = rounded(clamp(r.affinity + .12 - pressure * .3));
      r.respect = rounded(clamp(r.respect + (b.performance - r.respect) * .01));
      r.resentment = rounded(clamp(r.resentment + pressure * .4 - .08));
    }
    if (support !== null) r.trust = rounded(clamp(r.trust + (support - 55) * .008));
    const factor = support !== null && support < 50 ? 'management-support' : pressure > 0 ? 'workload' : 'collaboration';
    if ((old >= 35 && r.trust < 35) || (old < 80 && r.trust >= 80)) {
      const event = emit(r.trust < 35 ? 'RelationshipStrained' : 'CollaborationStrengthened', { employeeId: a.id, sourceId: a.id, targetId: b.id, sourceName: a.name, targetName: b.name }, a.lastManagementEvent, [{ factor, weight: 1, eventId: factor === 'workload' ? w.company.strategyEventId : a.lastManagementEvent }], 'management');
      remember(w, a, event, r.trust < 35 ? -10 : 10, 30);
    }
  }
}
type OrganizationCommand = Extract<Command, { type: 'PromoteEmployee' | 'AssignManager' | 'AssignTeamManager' | 'ChangeEmployeeRole' }>;
export function executeOrganization(ctx: SystemContext, command: OrganizationCommand): void {
  const { w, emit } = ctx;
  if (w.meta.simulationVersion !== 3) throw new Error('組織決策需要 simulation v3；舊存檔保留原有規則');
  if (command.type === 'AssignTeamManager') {
    const team = w.teams[command.teamId], previous = team.managerId;
    if (previous === command.managerId) throw new Error('主管安排未改變');
    team.managerId = command.managerId;
    const event = emit('TeamManagerChanged', { teamId: team.id, name: team.name, managerId: command.managerId, previous }, ctx.commandId, [{ factor: 'management-change', weight: 1, eventId: null }]);
    disturbTeam(w, team.id, event.id, 15);
    for (const e of ctx.active) if (e.teamId === team.id && e.id !== command.managerId) changeManager(ctx, e, command.managerId, event.id, false);
    if (command.managerId && w.employees[command.managerId].managerId && w.employees[command.managerId].teamId === team.id) w.employees[command.managerId].managerId = null;
    return;
  }
  const e = w.employees[command.employeeId];
  if (command.type === 'AssignManager') { changeManager(ctx, e, command.managerId); return; }
  if (command.type === 'ChangeEmployeeRole') {
    if (e.role === 'CEO' || e.role === 'CTO') throw new Error('創辦人職務保留');
    if (e.role === command.role) throw new Error('職務未改變');
    const previous = e.role; e.role = command.role;
    // Existing expectation is retained: reassignment is not a compensation bypass.
    const event = emit('EmployeeRoleChanged', { employeeId: e.id, name: e.name, role: e.role, previous }, ctx.commandId, [{ factor: 'role-fit', weight: 1, eventId: e.lastManagementEvent }]);
    e.lastManagementEvent = event.id; disturbTeam(w, e.teamId, event.id, 8); remember(w, e, event, -5, 40); return;
  }
  const c = e.career!, readiness = promotionReadiness(w, e)!;
  if (!readiness.eligible) throw new Error('已達目前最高職級');
  const previous = c.level; c.level = levels[levels.indexOf(c.level) + 1]; c.track = command.track; c.lastProgressAt = w.meta.tick;
  const oldExpectation = e.expectations.salary;
  e.expectations.salary = Math.round(oldExpectation * 1.12);
  const event = emit('EmployeePromoted', { employeeId: e.id, name: e.name, previous, level: c.level, track: c.track, premature: readiness.reasons.length > 0, expectation: e.expectations.salary }, ctx.commandId,
    [{ factor: 'career-progress', weight: 1, eventId: e.lastManagementEvent }, { factor: 'compensation-expectation', weight: 1, eventId: null }]);
  e.lastManagementEvent = event.id;
  if (c.goals[0].type === 'advancement' || (c.goals[0].type === 'leadership' && c.track === 'manager')) { c.goals[0].progress = 100; c.goals[0].frustration = rounded(c.goals[0].frustration * .25); c.goals[0].causes = [{ factor: 'career-progress', eventId: event.id }]; }
  e.psychology.companyTrust = rounded(clamp(e.psychology.companyTrust + 5)); remember(w, e, event, 35, 70);
  if (e.managerId) { const r = ensureRelationship(w, e.id, e.managerId); r.trust = rounded(clamp(r.trust + 4)); }
  if (c.track === 'manager') disturbTeam(w, e.teamId, event.id, 6);
  // Only existing relevant peers are evaluated; a promotion never constructs an all-to-all graph.
  for (const r of Object.values(w.relationships)) if (r.targetId === e.id) {
    const peer = w.employees[r.sourceId], goal = peer.career?.goals[0];
    if (peer.status !== 'active' || peer.teamId !== e.teamId || !goal || goal.type !== 'advancement' || goal.progress >= 100) continue;
    const disappointment = Math.max(0, (peer.personality.ambition - 55) * .2 + goal.frustration * .15 + (readiness.reasons.length ? 5 : 0) - r.trust * .08);
    const reaction = disappointment >= 8 ? 'concerned' : r.trust >= 65 ? 'motivated' : 'neutral';
    if (reaction === 'neutral') continue;
    goal.frustration = rounded(clamp(goal.frustration + (reaction === 'concerned' ? disappointment : -2)));
    r.resentment = rounded(clamp(r.resentment + (reaction === 'concerned' ? disappointment * .5 : -1)));
    r.trust = rounded(clamp(r.trust + (reaction === 'concerned' ? -3 : 1)));
    const peerEvent = emit('PeerPromotionReaction', { employeeId: peer.id, name: peer.name, promotedId: e.id, promotedName: e.name, reaction }, event.id, [{ factor: 'peer-promotion', weight: 1, eventId: event.id }], 'management');
    goal.causes = [{ factor: 'peer-promotion', eventId: peerEvent.id }]; remember(w, peer, peerEvent, reaction === 'concerned' ? -15 : 10, 50);
  }
}
function changeManager(ctx: SystemContext, e: Employee, managerId: string | null, causedBy?: string, disturb = true) {
  if (e.managerId === managerId) return;
  const previous = e.managerId; e.managerId = managerId;
  const event = ctx.emit('ManagerChanged', { employeeId: e.id, name: e.name, managerId, previous }, causedBy ?? ctx.commandId, [{ factor: 'management-change', weight: 1, eventId: causedBy ?? null }]);
  if (managerId) ensureRelationship(ctx.w, e.id, managerId);
  e.lastManagementEvent = event.id; if (disturb) disturbTeam(ctx.w, e.teamId, event.id, 8); remember(ctx.w, e, event, -5, 35);
}
