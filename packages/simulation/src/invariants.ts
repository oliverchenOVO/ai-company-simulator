import type { WorldState } from '../../domain/src/model';
import { simDate } from '../../shared/src/determinism';

export function invariantViolations(w: WorldState, previousTick?: number): string[] {
  const errors: string[] = [];
  const check = (ok: boolean, text: string) => { if (!ok) errors.push(text); };
  const numbers = (v: unknown, path: string) => {
    if (typeof v === 'number') check(Number.isFinite(v), `Non-finite ${path}`);
    else if (v && typeof v === 'object') for (const [k, child] of Object.entries(v)) numbers(child, `${path}.${k}`);
  };
  // Logs are checked at load/command boundaries; hot-path checks focus on live state.
  for (const [key, value] of Object.entries(w)) if (key !== 'events' && key !== 'commands') numbers(value, key);
  check(Number.isSafeInteger(w.company.cash), 'Cash must be safe integer cents');
  check(w.company.debt >= 0 && Number.isSafeInteger(w.company.debt), 'Invalid debt');
  check(w.meta.tick >= (previousTick ?? 0), 'Clock moved backwards');
  check(w.meta.date === simDate(w.meta.tick, w.meta.startDate), 'Date/tick mismatch');
  const allIds = new Set<string>();
  for (const record of [w.employees, w.teams, w.products, w.customers, w.relationships]) for (const [key, entity] of Object.entries(record)) {
    check(key === entity.id, `Entity key mismatch ${key}`);
    check(!allIds.has(entity.id), `Duplicate ID ${entity.id}`); allIds.add(entity.id);
  }
  const finished = new Set<string>();
  for (const start of Object.keys(w.employees)) {
    const path = new Set<string>(); let cursor: string | null = start;
    while (cursor && !finished.has(cursor)) {
      if (path.has(cursor)) { check(false, `Manager cycle ${cursor}`); break; }
      path.add(cursor); cursor = w.employees[cursor]?.managerId ?? null;
    }
    for (const id of path) finished.add(id);
  }
  for (const e of Object.values(w.employees)) {
    check(w.meta.simulationVersion === 3 ? !!e.career : !e.career, `Versioned career ${e.id}`);
    if (e.career) {
      check(e.career.lastProgressAt <= w.meta.tick && e.career.lastConversationAt <= w.meta.tick, `Future career ${e.id}`);
      for (const g of e.career.goals) {
        check(g.createdAt <= w.meta.tick, `Future goal ${e.id}`);
        for (const v of [g.importance, g.progress, g.frustration]) check(v >= 0 && v <= 100, `Career range ${e.id}`);
      }
    }
    check(Number.isSafeInteger(e.expectations.salary) && (w.meta.simulationVersion === 1 ? e.expectations.salary >= 0 : e.expectations.salary > 0), `Invalid compensation expectation ${e.id}`);
    check(e.salary >= 0 && Number.isSafeInteger(e.salary), `Invalid salary ${e.id}`);
    check(!!w.teams[e.teamId], `Missing team ${e.id}`);
    check(e.managerId !== e.id, `Self manager ${e.id}`);
    check(e.managerId === null || !!w.employees[e.managerId], `Missing manager ${e.id}`);
    check(e.status !== 'active' || e.managerId === null || w.employees[e.managerId].status === 'active', `Inactive manager ${e.id}`);
    for (const [k, v] of Object.entries(e.psychology)) check(v >= 0 && v <= 100, `Psychology range ${e.id}.${k}`);
    for (const v of Object.values(e.skills)) check(v >= 0 && v <= 100, `Skill range ${e.id}`);
    check(e.status === 'active' ? e.leftAt === null : e.leftAt !== null, `Employment dates ${e.id}`);
    check(e.hiredAt <= w.meta.tick && (e.leftAt === null || e.leftAt <= w.meta.tick), `Future employment ${e.id}`);
  }
  for (const team of Object.values(w.teams)) {
    check(w.meta.simulationVersion === 3 ? !!team.organization : !team.organization, `Versioned team ${team.id}`);
    if (team.organization) for (const v of [team.organization.stability, team.organization.coordination]) check(v >= 0 && v <= 100, `Team range ${team.id}`);
    check(team.managerId === null || w.employees[team.managerId]?.status === 'active', `Invalid team manager ${team.id}`);
  }
  for (const r of Object.values(w.relationships)) {
    check(!!w.employees[r.sourceId] && !!w.employees[r.targetId], `Missing relationship endpoint ${r.id}`);
    check(r.sourceId !== r.targetId, `Self relationship ${r.id}`);
    for (const v of [r.trust, r.respect, r.affinity, r.rivalry, r.resentment]) check(v >= 0 && v <= 100, `Relationship range ${r.id}`);
  }
  for (const c of Object.values(w.customers)) check(c.mrr >= 0 && Number.isSafeInteger(c.mrr), `Invalid customer revenue ${c.id}`);
  for (const p of Object.values(w.products)) for (const v of [p.progress, p.quality, p.technicalDebt]) check(v >= 0 && v <= 100, `Product range ${p.id}`);
  return errors;
}
export function assertInvariants(w: WorldState, previousTick?: number): void {
  const errors = invariantViolations(w, previousTick);
  if (errors.length) throw new Error(`Invariant violation seed=${w.meta.seed} tick=${w.meta.tick}: ${errors.join('; ')}`);
}
