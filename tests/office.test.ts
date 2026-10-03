import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { Simulation, replay } from '../packages/simulation/src/simulation';
import { createSave, validateSave } from '../packages/persistence/src/save';
import { employeeAppearance, projectOffice, presentationQueue } from '../apps/desktop/src/features/office/projection';
import { controlledScenario } from '../scripts/retention/scenarios';
const make = (count = 3) => new Simulation({ name: 'Office', seed: 'office-001', scenario: 'garage', employeeCount: count, initialCash: 100_000_000_000 }, true, 3);
function freeze(value: unknown) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.freeze(value); for (const child of Object.values(value)) freeze(child); } }
describe('Living Office detached presentation', () => {
  it('generates persistent distinct founder appearances without consuming world randomness', () => {
    const sim = make(), hash = sim.stateHash();
    const a = ['employee-1', 'employee-2', 'employee-3'].map(employeeAppearance);
    expect(new Set(a.map(x => JSON.stringify(x))).size).toBe(3);
    expect(a).toEqual(['employee-1', 'employee-2', 'employee-3'].map(employeeAppearance));
    expect(sim.stateHash()).toBe(hash);
  });
  it('projects all founders to executive, management and staff floors', () => {
    const office = projectOffice(make().observe());
    expect(office.seats).toHaveLength(3);
    expect(office.seats.map(s => [s.name, s.role])).toEqual([['Alice Chen', 'executive'], ['Bob Lin', 'management'], ['Carol Wu', 'staff']]);
    expect(office.floors.map(f => f.kind)).toEqual(['executive', 'management', 'staff']);
  });
  it('groups staff by actual team and reporting manager with bounded room capacity', () => {
    const sim = make(12); sim.execute({ type: 'CreateTeam', name: 'Support', managerId: 'employee-2' });
    const team = sim.observe().teams[1].id;
    for (const id of ['employee-4', 'employee-5', 'employee-6']) sim.execute({ type: 'MoveEmployeeToTeam', employeeId: id, teamId: team });
    const a = projectOffice(sim.observe());
    for (const f of a.floors) {
      expect(f.seats.length).toBeLessThanOrEqual(f.kind === 'staff' ? 8 : 4);
      if (f.kind === 'staff') for (const zone of [0, 1]) {
        const seats = f.seats.filter(s => s.zone === zone);
        expect(new Set(seats.map(s => `${s.teamId}:${s.managerId}`)).size).toBeLessThanOrEqual(1);
      }
    }
    expect(a.seats).toHaveLength(12);
  });
  it('relocates a real manager promotion, retains identity and does not invent reports', () => {
    const sim = make(), before = projectOffice(sim.observe()).seats.find(s => s.employeeId === 'employee-3')!;
    sim.execute({ type: 'PromoteEmployee', employeeId: 'employee-3', track: 'manager' });
    const after = projectOffice(sim.observe()).seats.find(s => s.employeeId === 'employee-3')!;
    expect(before.role).toBe('staff'); expect(after.role).toBe('management');
    expect(after.floorId).not.toBe(before.floorId); expect(after.appearance).toEqual(before.appearance); expect(after.reportIds).toEqual([]);
    expect(projectOffice(sim.observe()).cues.find(c => c.employeeId === 'employee-3')?.type).toBe('Celebrating');
  });
  it('projects actual manager assignment and team change, not just job titles', () => {
    const sim = make(6); sim.execute({ type: 'AssignManager', employeeId: 'employee-4', managerId: 'employee-3' });
    const a = projectOffice(sim.observe()), manager = a.seats.find(s => s.employeeId === 'employee-3')!;
    expect(manager.role).toBe('management'); expect(manager.reportIds).toContain('employee-4');
    expect(a.seats.find(s => s.employeeId === 'employee-4')?.managerId).toBe(manager.employeeId);
    sim.execute({ type: 'CreateTeam', name: 'New team', managerId: null });
    const tid = sim.observe().teams[1].id; sim.execute({ type: 'MoveEmployeeToTeam', employeeId: 'employee-4', teamId: tid });
    expect(projectOffice(sim.observe()).seats.find(s => s.employeeId === 'employee-4')?.teamId).toBe(tid);
  });
  it('creates a vacancy after actual departure and reconstructs it from save/replay', () => {
    const sim = make(), before = projectOffice(sim.observe()).seats.find(s => s.employeeId === 'employee-3')!;
    sim.execute({ type: 'FireEmployee', employeeId: 'employee-3' });
    const after = projectOffice(sim.observe()), vacancy = after.seats.find(s => s.employeeId === 'employee-3')!;
    expect(vacancy.vacant).toBe(true); expect(vacancy.id).toBe(before.id); expect(vacancy.floorId).toBe(before.floorId);
    expect(after.headcount).toBe(2); expect(after).toEqual(projectOffice(replay(sim.snapshot()).observe()));
  });
  it('adds accepted hires visibly but never renders rejected candidates as employees', () => {
    const sim = make(); sim.execute({ type: 'HireEmployee', name: 'Rejected', role: 'Engineer', salary: 100, teamId: 'team-1' });
    expect(projectOffice(sim.observe()).seats).toHaveLength(3);
    const c = sim.observe().recruitment.find(c => c.role === 'Engineer')!;
    sim.execute({ type: 'HireEmployee', name: 'New colleague', role: 'Engineer', salary: c.expectation, teamId: 'team-1' });
    expect(projectOffice(sim.observe()).seats.find(s => s.name === 'New colleague')?.vacant).toBe(false);
  });
  it('projects only qualitative existing career/manager concerns and overload', () => {
    const { sim } = controlledScenario('career-3', 'poor-manager'); sim.execute({ type: 'AdvanceTime', days: 182 });
    const a = projectOffice(sim.observe());
    expect(a.seats.some(s => s.overloaded)).toBe(true);
    expect(a.seats.find(s => s.employeeId === 'employee-5')?.concerns).toContain('希望討論成長安排');
    expect(JSON.stringify(a)).not.toMatch(/exitIntent|frustration|resignationChance|managerTrust|psychology/);
  });
  it('leaves deep frozen player view and authoritative world unchanged through repeated projection', () => {
    const sim = make(20), view = sim.observe(), before = JSON.stringify(view), hash = sim.stateHash(); freeze(view);
    const a = projectOffice(view); freeze(a); const b = projectOffice(view);
    expect(b).toEqual(a); expect(JSON.stringify(view)).toBe(before); expect(sim.stateHash()).toBe(hash);
  });
  it('reconstructs identical layout after validation, restore and independent replay', () => {
    const sim = make(30); sim.execute({ type: 'AdvanceTime', days: 90 });
    const saved = validateSave(createSave(sim.snapshot()));
    expect(projectOffice(Simulation.restore(saved.world).observe())).toEqual(projectOffice(sim.observe()));
    expect(projectOffice(replay(saved.world).observe())).toEqual(projectOffice(sim.observe()));
  });
  it('keeps placement fixed when only time advances without organizational changes', () => {
    const sim = make(12), a = projectOffice(sim.observe()); sim.execute({ type: 'AdvanceTime', days: 7 });
    expect(projectOffice(sim.observe()).seats.map(s => [s.id, s.floorId, s.zone, s.slot])).toEqual(a.seats.map(s => [s.id, s.floorId, s.zone, s.slot]));
  });
  it('bounds recent presentation cues and expires old records rather than accumulating animation backlog', () => {
    const sim = make(30); for (const e of sim.observe().employees.filter(e => !['employee-1', 'employee-2'].includes(e.id))) sim.execute({ type: 'AssignManager', employeeId: e.id, managerId: 'employee-2' });
    expect(presentationQueue(sim.observe().events, sim.observe().tick)).toHaveLength(8);
    sim.execute({ type: 'AdvanceTime', days: 30 });
    expect(presentationQueue(sim.observe().events, sim.observe().tick).every(c => c.tick >= 23)).toBe(true);
  });
  it('preserves every employee through fidelity fallback and limits old vacancies', () => {
    const sim = make(1000), a = projectOffice(sim.observe());
    expect(a.fidelity).toBe('focused'); expect(a.seats.filter(s => !s.vacant)).toHaveLength(1000);
    expect(new Set(a.seats.map(s => s.employeeId)).size).toBe(1000);
    expect(projectOffice(make(100).observe()).fidelity).toBe('individual'); expect(projectOffice(make(250).observe()).fidelity).toBe('quiet');
  });
  for (const file of ['phase1-0.1.0.save.json', 'phase1-0.1.1.save.json', 'phase2-0.2.0.save.json']) it(`views released ${file} without altering its exact world hash`, () => {
    const saved = validateSave(JSON.parse(readFileSync(`tests/fixtures/${file}`, 'utf8'))), sim = Simulation.restore(saved.world);
    const layout = projectOffice(sim.observe()); expect(layout.headcount).toBe(sim.observe().headcount);
    expect(sim.stateHash()).toBe(saved.manifest.stateHash); expect(replay(saved.world).stateHash()).toBe(saved.manifest.stateHash);
  });
});
