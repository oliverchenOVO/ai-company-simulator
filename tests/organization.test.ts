import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { Simulation, replay } from '../packages/simulation/src/simulation';
import { management, organizationIndex } from '../packages/simulation/src/organization';
import { createSave, validateSave } from '../packages/persistence/src/save';
import { invariantViolations } from '../packages/simulation/src/invariants';
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
describe('v3 career, reporting and causal relationships', () => {
  it('generates persistent goals from attributes and hides frustration in player views', () => {
    const a = make(), b = make();
    expect(a.snapshot()).toEqual(b.snapshot());
    for (const e of Object.values(a.snapshot().employees)) {
      expect(e.career!.goals).toHaveLength(1);
      if (e.role !== 'CEO' && e.role !== 'CTO' && e.personality.ambition >= 60) expect(e.career!.goals[0].type).toBe('advancement');
    }
    a.execute({ type: 'AdvanceTime', days: 7 });
    expect(a.snapshot().employees['employee-1'].career!.goals[0].progress).toBe(100);
    expect(a.snapshot().events.some(e=>e.type==='CareerGoalProgressed'&&e.payload.employeeId==='employee-1')).toBe(true);
    a.execute({ type: 'AdvanceTime', days: 213 });
    expect(JSON.stringify(a.observe())).not.toMatch(/frustration|exitIntent|managerTrust|resentment/);
    expect(replay(a.snapshot()).stateHash()).toBe(a.stateHash());
  });
  it('promotion changes expectation, memories, manager relationship and technical allocation', () => {
    const a = make(), b = make();
    const before = a.snapshot().employees['employee-3'];
    a.execute({ type: 'PromoteEmployee', employeeId: before.id, track: 'manager' });
    const promoted = a.snapshot().employees[before.id];
    expect(promoted.career!.level).toBe('Senior'); expect(promoted.career!.track).toBe('manager');
    expect(promoted.salary).toBe(before.salary); expect(promoted.expectations.salary).toBe(Math.round(before.expectations.salary * 1.12));
    expect(promoted.memories.at(-1)?.type).toBe('EmployeePromoted');
    expect(a.snapshot().relationships['employee-3>employee-1'].trust).toBeGreaterThan(b.snapshot().relationships['employee-3>employee-1'].trust);
    a.execute({ type: 'AdvanceTime', days: 90 }); b.execute({ type: 'AdvanceTime', days: 90 });
    expect(a.snapshot().employees[before.id].workTotal).toBeLessThan(b.snapshot().employees[before.id].workTotal);
    expect(replay(a.snapshot()).stateHash()).toBe(a.stateHash());
  });
  it('strong versus weak manager produces distinct stress, output, trust and events', () => {
    const a = make(), b = make();
    b.execute({ type: 'AssignManager', employeeId: 'employee-3', managerId: 'employee-2' });
    a.execute({ type: 'AdvanceTime', days: 180 }); b.execute({ type: 'AdvanceTime', days: 180 });
    const x = a.snapshot().employees['employee-3'], y = b.snapshot().employees['employee-3'];
    expect(y.psychology.managerTrust).toBeLessThan(x.psychology.managerTrust);
    expect(y.workTotal).not.toBe(x.workTotal);
    expect(b.snapshot().events.some(e=>e.type==='ManagerChanged' && e.causes[0].factor==='management-change')).toBe(true);
    expect(replay(b.snapshot()).stateHash()).toBe(b.stateHash());
  });
  it('rejects self/cyclic/inactive reporting atomically and keeps old commands isolated', () => {
    const sim = make(), initial = sim.stateHash();
    expect(() => sim.execute({ type: 'AssignManager', employeeId: 'employee-3', managerId: 'employee-3' })).toThrow();
    expect(() => sim.execute({ type: 'AssignManager', employeeId: 'employee-1', managerId: 'employee-3' })).toThrow(/cycle/);
    expect(sim.stateHash()).toBe(initial);
    sim.execute({ type: 'FireEmployee', employeeId: 'employee-2' }); const after = sim.stateHash();
    expect(() => sim.execute({ type: 'AssignManager', employeeId: 'employee-3', managerId: 'employee-2' })).toThrow(); expect(sim.stateHash()).toBe(after);
    for (const version of [1,2] as const) {
      const old = new Simulation(config,true,version), hash = old.stateHash();
      expect(()=>old.execute({type:'PromoteEmployee',employeeId:'employee-3',track:'specialist'})).toThrow(/v3/);
      expect(old.stateHash()).toBe(hash);
    }
  });
  it('team manager assignment changes reporting, bounded stability and survives exact save replay', () => {
    const sim = make(12); sim.execute({ type: 'AssignTeamManager', teamId: 'team-1', managerId: 'employee-2' });
    const w = sim.snapshot(); expect(w.teams['team-1'].managerId).toBe('employee-2'); expect(w.employees['employee-2'].managerId).toBeNull();
    expect(w.employees['employee-3'].managerId).toBe('employee-2');
    expect(w.teams['team-1'].organization!.stability).toBeGreaterThanOrEqual(0);
    sim.execute({ type: 'AdvanceTime', days: 90 });
    expect(replay(validateSave(createSave(sim.snapshot())).world).stateHash()).toBe(sim.stateHash());
    expect(Object.values(sim.snapshot().employees).every(e=>e.memories.length<=24)).toBe(true);
  });
  it('role adjustment changes actual skill fit and output without erasing salary expectation', () => {
    const a = make(), b = make(); const salary = a.snapshot().employees['employee-3'].expectations.salary;
    a.execute({ type: 'ChangeEmployeeRole', employeeId: 'employee-3', role: 'Sales' });
    a.execute({ type: 'AdvanceTime', days: 120 }); b.execute({ type: 'AdvanceTime', days: 120 });
    expect(a.snapshot().employees['employee-3'].expectations.salary).toBe(salary);
    expect(a.snapshot().employees['employee-3'].workTotal).toBeLessThan(b.snapshot().employees['employee-3'].workTotal);
    expect(replay(a.snapshot()).stateHash()).toBe(a.stateHash());
  });
  it('career intervention differs from a salary-only intervention in accumulated frustration', () => {
    const base = new Simulation({ ...config, seed: 'career-3' },true,3);
    base.execute({type:'CreateTeam',name:'Career team',managerId:'employee-3'});
    const teamId=Object.keys(base.snapshot().teams)[1], candidate=base.observe().recruitment.find(c=>c.role==='Engineer')!;
    base.execute({type:'HireEmployee',name:'Ambitious',role:'Engineer',salary:candidate.expectation,teamId});
    const e=Object.values(base.snapshot().employees).find(e=>e.name==='Ambitious')!; expect(e.career!.goals[0].type).toBe('advancement');
    base.execute({type:'AdvanceTime',days:180}); const a=Simulation.restore(base.snapshot()), b=Simulation.restore(base.snapshot());
    expect(a.snapshot().events.some(evt=>evt.type==='CareerConcernRaised'&&evt.payload.employeeId===e.id)).toBe(true);
    a.execute({type:'PromoteEmployee',employeeId:e.id,track:'specialist'}); b.execute({type:'ChangeSalary',employeeId:e.id,salary:Math.round(e.salary*1.2)});
    a.execute({type:'AdvanceTime',days:120}); b.execute({type:'AdvanceTime',days:120});
    expect(a.snapshot().employees[e.id].career!.goals[0].frustration).toBeLessThan(b.snapshot().employees[e.id].career!.goals[0].frustration);
    expect(a.snapshot().employees[e.id].psychology.exitIntent).not.toBe(b.snapshot().employees[e.id].psychology.exitIntent);
    expect(replay(a.snapshot()).stateHash()).toBe(a.stateHash()); expect(replay(b.snapshot()).stateHash()).toBe(b.stateHash());
  });
  it('peer promotion reacts only through existing ties and accumulated goals', () => {
    const sim = new Simulation({ ...config, seed: 'career-3' },true,3);
    sim.execute({type:'CreateTeam',name:'Delivery',managerId:'employee-3'});
    const teamId=Object.keys(sim.snapshot().teams)[1];
    sim.execute({type:'MoveEmployeeToTeam',employeeId:'employee-3',teamId});
    const candidate=sim.observe().recruitment.find(c=>c.role==='Engineer')!;
    sim.execute({type:'HireEmployee',name:'Peer',role:'Engineer',salary:candidate.expectation,teamId});
    sim.execute({type:'AdvanceTime',days:365});
    const peer=Object.values(sim.snapshot().employees).find(e=>e.name==='Peer')!;
    const before=peer.career!.goals[0].frustration, edges=Object.keys(sim.snapshot().relationships).length;
    sim.execute({type:'PromoteEmployee',employeeId:'employee-3',track:'manager'});
    const event=sim.snapshot().events.slice().reverse().find(e=>e.type==='PeerPromotionReaction');
    expect(event?.payload.employeeId).toBe(peer.id); expect(event?.payload.reaction).toBe('concerned');
    expect(sim.snapshot().employees[peer.id].career!.goals[0].frustration).toBeGreaterThanOrEqual(before);
    expect(Object.keys(sim.snapshot().relationships)).toHaveLength(edges);
    expect(sim.snapshot().employees[peer.id].memories.at(-1)?.eventId).toBe(event?.id);
    expect(sim.observe().events.find(e=>e.id===event?.id)?.causes[0].eventId).toBe(event?.causedBy);
    expect(replay(sim.snapshot()).stateHash()).toBe(sim.stateHash());
  });
  it('rejects missing v3 state, invalid goal ranges and broken causal references', () => {
    const sim=make(); const missing=sim.snapshot(); delete missing.employees['employee-3'].career;
    expect(()=>Simulation.restore(missing)).toThrow(/career/);
    const range=sim.snapshot(); range.employees['employee-3'].career!.goals[0].frustration=101;
    expect(()=>Simulation.restore(range)).toThrow();
    const cause=sim.snapshot(); cause.employees['employee-3'].career!.goals[0].causes=[{factor:'career',eventId:'event-999'}];
    expect(()=>Simulation.restore(cause)).toThrow(/career cause/);
    const nonfinite=sim.snapshot(); nonfinite.employees['employee-3'].career!.goals[0].progress=Number.NaN;
    expect(invariantViolations(nonfinite).some(e=>e.startsWith('Non-finite'))).toBe(true);
  });
  it('keeps an unresolved retention episode observable without repeated monthly messages', () => {
    const sim=make(25); sim.execute({type:'ChangeCompanyStrategy',strategy:'growth'}); sim.execute({type:'AdvanceTime',days:730});
    const concerns=sim.snapshot().events.filter(e=>e.type==='EmployeeConcernRaised');
    expect(concerns.length).toBeGreaterThan(0);
    const counts=new Map<string,number>();for(const e of concerns)counts.set(String(e.payload.employeeId),(counts.get(String(e.payload.employeeId))??0)+1);
    expect([...counts.values()].every(n=>n===1)).toBe(true);
    expect(replay(sim.snapshot()).stateHash()).toBe(sim.stateHash());
  });
});
