import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { Simulation, replay } from '../packages/simulation/src/simulation';
import { createSave, validateSave } from '../packages/persistence/src/save';
import { hash } from '../packages/shared/src/determinism';
import { RetentionAudit, retentionFactors } from '../scripts/retention/diagnostics';
import { controlledScenario, interventionCommands, scenarioCommands } from '../scripts/retention/scenarios';
import { retentionDecisions } from '../scripts/retention/policies';
const advance = (sim: Simulation, audit: RetentionAudit, days: number) => {
  audit.sample(sim.snapshot());
  for (let t = 0; t < days && !sim.observe().bankrupt; t += 7) { sim.execute({ type: 'AdvanceTime', days: Math.min(7, days - t) }); audit.sample(sim.snapshot()); }
};
describe('released v3 retention diagnostics and intervention evidence', () => {
  it('restores a real hosted 0.2.0 export and preserves its released replay hash', () => {
    const raw = JSON.parse(readFileSync('tests/fixtures/phase2-0.2.0.save.json', 'utf8')), save = validateSave(raw);
    expect(save.world.meta.simulationVersion).toBe(3);
    expect(save.manifest.stateHash).toBe('68da846913942934055d1fb0e095607ed1ff25b0f7d37d0893d604ffb999cfc5');
    expect(Simulation.restore(save.world).stateHash()).toBe(save.manifest.stateHash);
    expect(replay(save.world).stateHash()).toBe(save.manifest.stateHash);
    const a = Simulation.restore(save.world), b = replay(save.world);
    a.execute({ type: 'AdvanceTime', days: 90 }); b.execute({ type: 'AdvanceTime', days: 90 }); expect(a.stateHash()).toBe(b.stateHash());
  });
  it('computes diagnostics without mutating world, consuming RNG or leaking hidden state to policies', () => {
    const { sim, employeeId } = controlledScenario('career-3', 'career-stagnation'), w = sim.snapshot(), before = hash(w);
    const factors = retentionFactors(w, w.employees[employeeId]); const audit = new RetentionAudit(7); audit.sample(w); audit.sample(w);
    expect(hash(w)).toBe(before); expect(audit.result().funnel.employeesCreated).toBe(Object.keys(w.employees).length);
    expect(factors.postTickTarget).toBeGreaterThanOrEqual(0); expect(factors.postTickTarget).toBeLessThanOrEqual(100);
    const view = sim.observe(); expect(JSON.stringify(view)).not.toMatch(/exitIntent|frustration|burnout|companyTrust/);
    for (const policy of ['ignore-concerns', 'salary-only', 'promotion-first', 'manager-first', 'balanced-retention'] as const) expect(retentionDecisions(policy, view)).toBeInstanceOf(Array);
    expect(sim.stateHash()).toBe(before);
  });
  it('exposes long-lived career concerns even when v3 never reaches resignation evaluation', () => {
    const { sim, employeeId } = controlledScenario('career-3', 'career-stagnation'), audit = new RetentionAudit(7, [employeeId]);
    advance(sim, audit, 1099); const result = audit.result(), person = result.people.find(e => e.id === employeeId)!;
    expect(person.maxFrustration).toBe(100); expect(person.firstPublicSignal).not.toBeNull();
    expect(person.episodes.some(e => e.outcome === 'open' && e.end - e.start > 900)).toBe(true);
    expect(person.maxIntent).toBeLessThan(30); expect(person.evaluationCount).toBe(0); expect(person.last.status).toBe('active');
    expect(result.eventCounts.CareerConcernRaised).toBeGreaterThan(0);
    expect(replay(sim.snapshot()).stateHash()).toBe(sim.stateHash());
  });
  it('isolates manager support recovery in matched rosters without instant departure', () => {
    const { sim, employeeId } = controlledScenario('career-3', 'poor-manager'); sim.execute({ type: 'AdvanceTime', days: 182 });
    const a = Simulation.restore(sim.snapshot()), b = Simulation.restore(sim.snapshot()), before = b.snapshot().employees[employeeId].psychology.managerTrust;
    for (const command of interventionCommands(a, employeeId, 'manager')) a.execute(command);
    expect(a.snapshot().employees[employeeId].psychology.managerTrust).toBe(before);
    a.execute({ type: 'AdvanceTime', days: 364 }); b.execute({ type: 'AdvanceTime', days: 364 });
    const x = a.snapshot().employees[employeeId], y = b.snapshot().employees[employeeId];
    expect(x.psychology.managerTrust).toBeGreaterThan(y.psychology.managerTrust); expect(x.psychology.exitIntent).toBeLessThan(y.psychology.exitIntent);
    expect(x.workTotal).not.toBe(y.workTotal); expect(x.status).toBe('active'); expect(y.status).toBe('active');
    expect(replay(a.snapshot()).stateHash()).toBe(a.stateHash());
  });
  it('avoids asserting workload causation for a low-stress career/compensation concern', () => {
    const { sim, employeeId } = controlledScenario('career-3', 'underpayment'); sim.execute({ type: 'AdvanceTime', days: 728 });
    const e = sim.snapshot().employees[employeeId];
    expect(e.psychology.stress).toBeLessThan(30);
    const event = sim.observe().events.find(e => e.employeeId === employeeId && e.type === 'EmployeeConcernRaised');
    expect(event).toBeDefined(); expect(event!.body).toContain('這項訊息本身不足以判定原因');
    expect(event!.causes).toHaveLength(0);
  });
  it('tests combined moderate inputs with guarded pay and actual repeated decisions rather than injecting hidden risk', () => {
    const run = controlledScenario('career-3', 'combined-moderate'), audit = new RetentionAudit(7, [run.employeeId]);
    const before = run.sim.snapshot().employees[run.employeeId];
    expect(before.psychology.exitIntent).toBe(0); expect(before.psychology.stress).toBe(15);
    expect(before.salary / before.expectations.salary).toBeGreaterThan(.9); expect(run.sim.observe().strategy).toBe('balanced');
    audit.sample(run.sim.snapshot());
    for (let tick = 0; tick < 728; tick += 7) {
      for (const c of scenarioCommands(run.scenario, run.sim, run.employeeId, run.teamId)) run.sim.execute(c);
      run.sim.execute({ type: 'AdvanceTime', days: 7 }); audit.sample(run.sim.snapshot());
    }
    const person = audit.result().people.find(e => e.id === run.employeeId)!;
    expect(person.maxFrustration).toBe(100); expect(person.maxIntent).toBeGreaterThan(30); expect(person.last.status).toBe('active');
    expect(run.sim.snapshot().events.some(e => e.type === 'SalaryOfferRejected')).toBe(false);
    expect(replay(run.sim.snapshot()).stateHash()).toBe(run.sim.stateHash());
  });
  it('measures the actual weekly funnel, warning lead time and causal departure under sustained pressure', () => {
    const { sim, employeeId } = controlledScenario('career-3', 'sustained-growth'), audit = new RetentionAudit(7, [employeeId]);
    advance(sim, audit, 728); const result = audit.result(), person = result.people.find(e => e.id === employeeId)!;
    expect(result.funnel.highExitIntent).toBeGreaterThan(0); expect(result.funnel.evaluatedEmployees).toBeGreaterThan(0);
    expect(result.funnel.resignationEvaluations).toBeGreaterThanOrEqual(result.funnel.resigned); expect(person.resignedAt).not.toBeNull();
    expect(person.warningLeadDays).toBeGreaterThan(30); expect(person.seriousWarningLeadDays).toBeGreaterThan(0);
    const event = sim.snapshot().events.find(e => e.type === 'EmployeeResigned' && e.payload.employeeId === employeeId)!;
    expect(event.causes.filter(c => c.weight > 0).length).toBeGreaterThan(1);
    expect(sim.observe().events.find(e => e.id === event.id)?.causes.every(c => c.evidence.length > 0)).toBe(true);
    expect(sim.observe().events.some(e => e.type === 'EmployeeExploringOptions')).toBe(false);
    expect(Simulation.restore(validateSave(createSave(sim.snapshot())).world).stateHash()).toBe(sim.stateHash());
    expect(replay(sim.snapshot()).stateHash()).toBe(sim.stateHash());
  });
  it('distinguishes salary, promotion and management-track output and records concern resolution over time', () => {
    const run = controlledScenario('career-3', 'career-stagnation'); run.sim.execute({ type: 'AdvanceTime', days: 365 });
    const a = Simulation.restore(run.sim.snapshot()), b = Simulation.restore(run.sim.snapshot()), c = Simulation.restore(run.sim.snapshot());
    const audit = new RetentionAudit(7, [run.employeeId]); audit.sample(a.snapshot());
    for (const command of interventionCommands(a, run.employeeId, 'promotion')) a.execute(command);
    for (const command of interventionCommands(b, run.employeeId, 'salary')) b.execute(command);
    for (const command of interventionCommands(c, run.employeeId, 'management-promotion')) c.execute(command);
    advance(a, audit, 728); b.execute({ type: 'AdvanceTime', days: 728 }); c.execute({ type: 'AdvanceTime', days: 728 });
    const x = a.snapshot().employees[run.employeeId], y = b.snapshot().employees[run.employeeId], z = c.snapshot().employees[run.employeeId];
    expect(x.career!.goals[0].frustration).toBeLessThan(y.career!.goals[0].frustration);
    expect(x.psychology.exitIntent).toBeLessThan(y.psychology.exitIntent); expect(x.workTotal).toBeGreaterThan(z.workTotal);
    expect(audit.result().people.find(e => e.id === run.employeeId)!.episodes.some(e => e.outcome === 'resolved')).toBe(true);
    expect(replay(a.snapshot()).stateHash()).toBe(a.stateHash());
  });
  it('records completed goals staying inert without introducing implicit renewal into released v3', () => {
    const run = controlledScenario('career-3', 'career-stagnation'); run.sim.execute({ type: 'AdvanceTime', days: 365 });
    for (const command of interventionCommands(run.sim, run.employeeId, 'promotion')) run.sim.execute(command);
    const goal = run.sim.snapshot().employees[run.employeeId].career!.goals[0]; run.sim.execute({ type: 'AdvanceTime', days: 1826 });
    const after = run.sim.snapshot().employees[run.employeeId].career!.goals;
    expect(after).toHaveLength(1); expect(after[0].createdAt).toBe(goal.createdAt); expect(after[0].progress).toBe(100); expect(after[0].frustration).toBe(0);
    expect(run.sim.snapshot().events.filter(e => e.tick > 365 && e.payload.employeeId === run.employeeId && e.type === 'CareerConcernRaised')).toHaveLength(0);
  });
});
