import { describe, expect, it } from 'vitest';
import { Simulation, replay } from '../packages/simulation/src/simulation';
import { activeEmployees, payroll, productivity, revenue, runway, workSystem } from '../packages/simulation/src/systems';
import { assertInvariants, invariantViolations } from '../packages/simulation/src/invariants';
import { worldSchema, type WorldState } from '../packages/domain/src/model';
import { garageScenario } from '../packages/simulation/src/scenario';
import type { SystemContext } from '../packages/simulation/src/context';
const config = { seed: 'test-001', name: 'Garage Startup', scenario: 'garage' as const };
const funded = () => new Simulation({ ...config, initialCash: 100_000_000_000 });

describe('Garage Startup and command transactions', () => {
  it('starts with the specified 3-person scenario', () => {
    const w = new Simulation(config).snapshot();
    expect(w.company.cash).toBe(50_000_000); expect(activeEmployees(w)).toHaveLength(3);
    expect(Object.keys(w.customers)).toHaveLength(0); expect(w.products['product-1'].progress).toBe(0);
    expect(w.meta.date).toBe('2026-01-01'); expect(payroll(w)).toBe(9_500_000);
    expect(runway(w)).toBeCloseTo(500000 / 105000);
    expect(worldSchema.safeParse(w).success).toBe(true);
  });
  it('rejects invalid commands without changing state or consuming IDs', () => {
    const sim = funded(), before = sim.stateHash();
    for (const command of [
      { type: 'AdvanceTime', days: -1 }, { type: 'AdvanceTime', days: NaN },
      { type: 'ChangeSalary', employeeId: 'employee-2', salary: -1 },
      { type: 'HireEmployee', name: 'D', role: 'Engineer', salary: 1, teamId: 'missing' },
      { type: 'FireEmployee', employeeId: 'employee-1' },
      { type: 'CreateTeam', name: 'T', managerId: 'missing' }
    ]) { expect(() => sim.execute(command)).toThrow(); expect(sim.stateHash()).toBe(before); }
  });
  it('hires, changes salary, moves between teams and fires through commands', () => {
    const sim = funded();
    sim.execute({ type: 'CreateTeam', name: '銷售', managerId: 'employee-1' });
    sim.execute({ type: 'HireEmployee', name: 'Dana', role: 'Sales', salary: 3_500_000, teamId: 'team-4' });
    sim.execute({ type: 'ChangeSalary', employeeId: 'employee-5', salary: 4_000_000 });
    sim.execute({ type: 'MoveEmployeeToTeam', employeeId: 'employee-5', teamId: 'team-1' });
    const hired = sim.snapshot().employees['employee-5'];
    expect(hired.name).toBe('Dana'); expect(hired.salary).toBe(4_000_000); expect(hired.teamId).toBe('team-1');
    sim.execute({ type: 'AdvanceTime', days: 10 });
    const work = sim.snapshot().employees['employee-5'].workTotal;
    sim.execute({ type: 'FireEmployee', employeeId: 'employee-5' });
    sim.execute({ type: 'AdvanceTime', days: 10 });
    expect(sim.snapshot().employees['employee-5'].workTotal).toBe(work);
    expect(() => sim.execute({ type: 'ChangeSalary', employeeId: 'employee-5', salary: 1 })).toThrow();
  });
  it('returns detached snapshots and immutable historical events', () => {
    const sim = funded(), before = sim.stateHash(), w = sim.snapshot();
    w.company.cash = 0; w.events[0].payload.name = 'tampered';
    expect(sim.stateHash()).toBe(before);
  });
  it('clears manager references after a manager leaves', () => {
    const sim = funded();
    sim.execute({ type: 'CreateTeam', name: 'Lab', managerId: 'employee-2' });
    sim.execute({ type: 'MoveEmployeeToTeam', employeeId: 'employee-3', teamId: 'team-4' });
    sim.execute({ type: 'FireEmployee', employeeId: 'employee-2' });
    const w = sim.snapshot(); expect(w.employees['employee-3'].managerId).toBeNull(); expect(w.teams['team-4'].managerId).toBeNull(); assertInvariants(w);
  });
});

describe('finance', () => {
  it('closes a calendar month with payroll and operating cost exactly once', () => {
    const sim = funded(), cash = sim.snapshot().company.cash;
    sim.execute({ type: 'AdvanceTime', days: 31 });
    const w = sim.snapshot();
    expect(w.finance.history).toHaveLength(1); expect(w.finance.history[0].month).toBe('2026-01');
    expect(w.finance.history[0].payroll).toBe(9_500_000); expect(w.company.cash).toBe(cash - 10_500_000);
    expect(w.events.filter(e => e.type === 'PayrollProcessed')).toHaveLength(1);
  });
  it('prorates salary changes by active calendar days', () => {
    const sim = funded(); sim.execute({ type: 'AdvanceTime', days: 15 });
    sim.execute({ type: 'ChangeSalary', employeeId: 'employee-3', salary: 6_000_000 });
    sim.execute({ type: 'AdvanceTime', days: 16 });
    expect(sim.snapshot().finance.history[0].payroll).toBe(6_500_000 + Math.round((3_000_000 * 15 + 6_000_000 * 16) / 31));
  });
  it('prorates hires and departures, excludes future work', () => {
    const sim = funded(); sim.execute({ type: 'AdvanceTime', days: 15 });
    sim.execute({ type: 'HireEmployee', name: 'D', role: 'Engineer', salary: 3_100_000, teamId: 'team-1' });
    sim.execute({ type: 'FireEmployee', employeeId: 'employee-3' }); sim.execute({ type: 'AdvanceTime', days: 16 });
    expect(sim.snapshot().finance.history[0].payroll).toBe(6_500_000 + Math.round(3_000_000 * 15 / 31) + 1_600_000);
  });
  it('becomes bankrupt and stops operations while preserving a replayable clock', () => {
    const sim = new Simulation(config); sim.execute({ type: 'ChangeProductPriority', priority: 'debt' });
    sim.execute({ type: 'AdvanceTime', days: 365 });
    const w = sim.snapshot(); expect(w.company.bankrupt).toBe(true); expect(w.company.cash).toBeLessThanOrEqual(0);
    const work = w.employees['employee-1'].workTotal; sim.execute({ type: 'AdvanceTime', days: 7 });
    expect(sim.snapshot().employees['employee-1'].workTotal).toBe(work);
    expect(() => sim.execute({ type: 'ChangeCompanyStrategy', strategy: 'growth' })).toThrow();
    expect(replay(sim.snapshot()).stateHash()).toBe(sim.stateHash());
  });
});

describe('autonomous employee and product/customer systems', () => {
  it('sustained growth creates more stress and burnout than sustainable pace', () => {
    const a = funded(), b = funded();
    a.execute({ type: 'ChangeCompanyStrategy', strategy: 'growth' }); b.execute({ type: 'ChangeCompanyStrategy', strategy: 'sustainable' });
    a.execute({ type: 'AdvanceTime', days: 100 }); b.execute({ type: 'AdvanceTime', days: 100 });
    const x = a.snapshot().employees['employee-2'].psychology, y = b.snapshot().employees['employee-2'].psychology;
    expect(x.stress).toBeGreaterThan(y.stress); expect(x.burnout).toBeGreaterThan(y.burnout);
  });
  it('salary restoration improves compensation satisfaction', () => {
    const a = funded(); a.execute({ type: 'ChangeSalary', employeeId: 'employee-2', salary: 500_000 }); a.execute({ type: 'AdvanceTime', days: 50 });
    const before = a.snapshot().employees['employee-2'].psychology.satisfaction;
    a.execute({ type: 'ChangeSalary', employeeId: 'employee-2', salary: 5_000_000 }); a.execute({ type: 'AdvanceTime', days: 30 });
    expect(a.snapshot().employees['employee-2'].psychology.satisfaction).toBeGreaterThan(before);
  });
  it('resignation follows concern/search stages and retains machine readable causes', () => {
    const sim = funded(); sim.execute({ type: 'ChangeSalary', employeeId: 'employee-2', salary: 0 }); sim.execute({ type: 'ChangeCompanyStrategy', strategy: 'growth' }); sim.execute({ type: 'AdvanceTime', days: 700 });
    const w = sim.snapshot(), evt = w.events.find(e => e.type === 'EmployeeResigned' && e.payload.employeeId === 'employee-2');
    expect(w.employees['employee-2'].status).toBe('resigned'); expect(evt).toBeDefined(); expect(evt?.causes.map(c => c.factor)).toContain('compensation');
    expect(w.events.some(e => e.type === 'EmployeeConcernRaised')).toBe(true); expect(w.events.some(e => e.type === 'EmployeeExploringOptions')).toBe(true);
    expect(evt?.causedBy).toBeTruthy(); expect(w.employees['employee-2'].memories.length).toBeLessThanOrEqual(24);
  });
  it('relationships are directed, evolve and never contribute work from leavers', () => {
    const sim = funded(), before = sim.snapshot(); sim.execute({ type: 'AdvanceTime', days: 14 });
    const w = sim.snapshot(); expect(w.relationships['employee-1>employee-2'].trust).not.toBe(before.relationships['employee-1>employee-2'].trust);
    expect(w.relationships['employee-2>employee-1']).toBeUndefined();
    const fixture = garageScenario(config); fixture.employees['employee-2'].status = 'fired'; fixture.employees['employee-2'].leftAt = 0;
    const ctx: SystemContext = { w: fixture, active: Object.values(fixture.employees), commandId: 'test', emit: () => { throw new Error('not used'); } };
    workSystem(ctx); expect(fixture.employees['employee-2'].workTotal).toBe(0);
  });
  it('burnout reduces productivity and priorities change real product state', () => {
    const w = garageScenario(config), e = w.employees['employee-2'], baseline = productivity(e, 1); e.psychology.burnout = 100;
    expect(productivity(e, 1)).toBeLessThan(baseline);
    const sim = funded(); sim.execute({ type: 'ChangeProductPriority', priority: 'quality' }); sim.execute({ type: 'AdvanceTime', days: 20 });
    expect(sim.snapshot().products['product-1'].quality).toBeGreaterThan(55);
  });
  it('launches product, acquires customers, earns prorated revenue and churns', () => {
    const sim = funded(); sim.execute({ type: 'AdvanceTime', days: 1000 });
    const w = sim.snapshot(); expect(w.products['product-1'].launchedAt).not.toBeNull();
    expect(w.events.some(e => e.type === 'CustomerAcquired')).toBe(true); expect(w.events.some(e => e.type === 'CustomerChurned')).toBe(true);
    expect(w.finance.history.some(m => m.revenue > 0)).toBe(true);
    expect(revenue(w)).toBe(Object.values(w.customers).filter(c => c.status === 'active').reduce((s, c) => s + c.mrr, 0));
    assertInvariants(w);
  });
});

describe('determinism, replay, invariants', () => {
  it('replays a mixed command sequence exactly', () => {
    const sim = funded(); sim.execute({ type: 'AdvanceTime', days: 12 }); sim.execute({ type: 'ChangeSalary', employeeId: 'employee-2', salary: 4_500_000 });
    sim.execute({ type: 'HireEmployee', name: 'Dan', role: 'Sales', salary: 3_000_000, teamId: 'team-1' }); sim.execute({ type: 'ChangeProductPriority', priority: 'quality' }); sim.execute({ type: 'AdvanceTime', days: 120 });
    expect(replay(sim.snapshot()).stateHash()).toBe(sim.stateHash());
    const restored = Simulation.restore(sim.snapshot()); restored.execute({ type: 'AdvanceTime', days: 50 }); sim.execute({ type: 'AdvanceTime', days: 50 }); expect(restored.stateHash()).toBe(sim.stateHash());
  });
  it('detects corrupted references, bounded values, non-finite numbers and reversed time', () => {
    const w = garageScenario(config); w.employees['employee-2'].managerId = 'employee-2'; w.employees['employee-3'].teamId = 'missing'; w.company.cash = Infinity; w.employees['employee-1'].psychology.stress = 101;
    expect(invariantViolations(w, 1).length).toBeGreaterThanOrEqual(5); expect(() => assertInvariants(w)).toThrow();
  });
  it('rejects corrupt command/event causal history', () => {
    const sim = funded(), w: WorldState = sim.snapshot(); w.events[0].causedBy = 'missing'; expect(() => Simulation.restore(w)).toThrow('Missing causal');
    const x = sim.snapshot(); x.commands[0].tick = 2; expect(() => replay(x)).toThrow('Invalid command');
  });
});
