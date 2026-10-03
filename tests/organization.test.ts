import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { Simulation, replay } from '../packages/simulation/src/simulation';
import { management, organizationIndex } from '../packages/simulation/src/organization';
import { createSave, validateSave } from '../packages/persistence/src/save';
const config = { seed: 'organization-001', name: 'Organization', scenario: 'garage' as const, initialCash: 10_000_000_000 };
const make = (count = 3) => new Simulation({ ...config, employeeCount: count }, true, 3);
describe('v3 management and team model', () => {
  it('captures a genuine v2 hosted UI export without changing world hash or semantics', () => {
    const raw = JSON.parse(readFileSync('tests/fixtures/phase1-0.1.1.save.json', 'utf8'));
    const save = validateSave(raw);
    expect(save.world).toEqual(raw.world);
    expect(save.world.meta.simulationVersion).toBe(2);
    expect(replay(save.world).stateHash()).toBe(raw.manifest.stateHash);
    const a = Simulation.restore(save.world), b = replay(save.world);
    a.execute({ type: 'AdvanceTime', days: 90 }); b.execute({ type: 'AdvanceTime', days: 90 });
    expect(a.stateHash()).toBe(b.stateHash());
  });
  it('derives capacity and gradual support differences under overload', () => {
    const small = make(), big = make(25);
    const a = small.snapshot(), b = big.snapshot();
    expect(management(a, a.employees['employee-2'], organizationIndex(a)).attention).toBe(1);
    expect(management(b, b.employees['employee-2'], organizationIndex(b)).quality).toBeLessThan(management(a, a.employees['employee-2'], organizationIndex(a)).quality);
    small.execute({ type: 'AdvanceTime', days: 60 }); big.execute({ type: 'AdvanceTime', days: 60 });
    expect(big.snapshot().employees['employee-2'].psychology.stress).toBeGreaterThan(small.snapshot().employees['employee-2'].psychology.stress);
    expect(big.snapshot().events.filter(e => e.type === 'ManagerOverloaded')).toHaveLength(1);
    expect(big.snapshot().employees['employee-2'].status).toBe('active');
    expect(replay(big.snapshot()).stateHash()).toBe(big.stateHash());
  });
  it('transfer causes temporary instability and measurable work differences, then recovers', () => {
    const a = make(), b = make();
    a.execute({ type: 'CreateTeam', name: 'Unmanaged', managerId: null });
    const teamId = Object.keys(a.snapshot().teams)[1];
    a.execute({ type: 'MoveEmployeeToTeam', employeeId: 'employee-3', teamId });
    expect(a.snapshot().teams[teamId].organization!.stability).toBe(73);
    a.execute({ type: 'AdvanceTime', days: 90 }); b.execute({ type: 'AdvanceTime', days: 90 });
    expect(a.snapshot().teams[teamId].organization!.stability).toBeGreaterThan(73);
    expect(a.snapshot().employees['employee-3'].workTotal).not.toBe(b.snapshot().employees['employee-3'].workTotal);
    expect(replay(a.snapshot()).stateHash()).toBe(a.stateHash());
    expect(Simulation.restore(validateSave(createSave(a.snapshot())).world).stateHash()).toBe(a.stateHash());
  });
  it('keeps hiring and salary cut exploit closed under v3 and initializes new hires', () => {
    const sim = make(); sim.execute({ type: 'HireEmployee', name: 'Low', role: 'Engineer', salary: 100, teamId: 'team-1' });
    expect(sim.snapshot().events.at(-1)?.type).toBe('HireOfferRejected');
    const candidate = sim.observe().recruitment.find(c => c.role === 'Engineer')!;
    sim.execute({ type: 'HireEmployee', name: 'Accepted', role: 'Engineer', salary: candidate.expectation, teamId: 'team-1' });
    const e = Object.values(sim.snapshot().employees).find(e => e.name === 'Accepted')!;
    expect(e.career).toBeDefined(); sim.execute({ type: 'ChangeSalary', employeeId: e.id, salary: 100 });
    expect(sim.snapshot().employees[e.id].salary).toBe(candidate.expectation);
    sim.execute({ type: 'AdvanceTime', days: 45 }); expect(replay(sim.snapshot()).stateHash()).toBe(sim.stateHash());
  });
});
