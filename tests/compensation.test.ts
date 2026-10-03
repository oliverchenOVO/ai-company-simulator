import { describe, expect, it } from 'vitest';
import { Simulation, replay } from '../packages/simulation/src/simulation';
import { compensationTerms, candidateFor } from '../packages/simulation/src/compensation';
import { createSave, validateSave } from '../packages/persistence/src/save';
import { assertInvariants } from '../packages/simulation/src/invariants';
import { ApplicationSession } from '../packages/application/src/session';
import oldSave from './fixtures/phase1-0.1.0.save.json';
const config = { seed: 'compensation-001', name: 'Garage Startup', scenario: 'garage' as const, initialCash: 10_000_000_000 };
const offer = (salary: number) => ({ type: 'HireEmployee' as const, name: 'Dana', role: 'Engineer' as const, salary, teamId: 'team-1' });
describe('versioned independent compensation', () => {
  it('generates detached, offer-independent deterministic candidates with variation', () => {
    const expectations = new Set<number>();
    for (let i=1;i<=100;i++) {
      const sim=new Simulation({...config,seed:`benchmark-${String(i).padStart(3,'0')}`}), before=sim.stateHash();
      const a=candidateFor(sim.snapshot(),'Engineer'), b=candidateFor(sim.snapshot(),'Engineer','Other');
      expect(a).toEqual(b); expect(sim.observe().recruitment.find(c=>c.role==='Engineer')).toEqual(a); expect(sim.stateHash()).toBe(before);
      expect(a.expectation).toBeGreaterThan(3_000_000); expectations.add(a.expectation);
      for(const salary of [0,100,10000,a.minimum-1]) {
        const branch=Simulation.restore(sim.snapshot());branch.execute(offer(salary));
        expect(branch.observe().employees.filter(e=>e.status==='active')).toHaveLength(3);
        expect(branch.snapshot().events.at(-1)?.type).toBe('HireOfferRejected');
        expect(branch.observe().finance.payroll).toBe(9_500_000);assertInvariants(branch.snapshot());
        expect(replay(branch.snapshot()).stateHash()).toBe(branch.stateHash());
      }
    }
    expect(expectations.size).toBeGreaterThan(50);
  });
  it('accepts the exact candidate threshold, expected and maximal offers without copying salary',()=>{
    const origin=new Simulation(config), candidate=candidateFor(origin.snapshot(),'Engineer');
    for(const salary of [candidate.minimum,candidate.expectation,100_000_000]) {
      const sim=Simulation.restore(origin.snapshot());sim.execute(offer(salary));const e=sim.snapshot().employees[candidate.id];
      expect(e.salary).toBe(salary);expect(e.expectations.salary).toBe(candidate.expectation);expect(replay(sim.snapshot()).stateHash()).toBe(sim.stateHash());
      expect(Simulation.restore(validateSave(createSave(sim.snapshot())).world).stateHash()).toBe(sim.stateHash());
    }
    const sim=new Simulation(config),before=sim.stateHash();
    for(const salary of [-1,100_000_001,Number.MAX_SAFE_INTEGER,NaN,Infinity,1.1]) {expect(()=>sim.execute(offer(salary))).toThrow();expect(sim.stateHash()).toBe(before);}
  });
  it('rounds skill/preference and ceilings acceptance in integer cents',()=>{
    const e=new Simulation(config).snapshot().employees['employee-3'];e.skills.engineering=65;e.personality.ambition=25;e.personality.riskTolerance=25;
    expect(compensationTerms(e)).toEqual({expectation:3_100_500,minimum:2_867_963,skill:65});
    e.personality.ambition=25.1;expect(Number.isSafeInteger(compensationTerms(e).expectation)).toBe(true);
  });
  it('underpayment remains meaningful, raises/cuts do not reset expectations, overpayment saturates',()=>{
    const origin=new Simulation(config),c=candidateFor(origin.snapshot(),'Engineer');origin.execute(offer(c.expectation));
    const branches=[c.minimum,c.expectation,100_000_000].map(salary=>{const sim=Simulation.restore(origin.snapshot());sim.execute({type:'ChangeSalary',employeeId:c.id,salary});sim.execute({type:'ChangeCompanyStrategy',strategy:'sustainable'});sim.execute({type:'AdvanceTime',days:60});return sim;});
    const [low,at,high]=branches.map(sim=>sim.snapshot().employees[c.id]);
    expect(low.psychology.satisfaction).toBeLessThan(at.psychology.satisfaction);expect(low.psychology.exitIntent).toBeGreaterThan(at.psychology.exitIntent);
    expect(high.psychology.satisfaction).toBe(at.psychology.satisfaction);
    for(const sim of branches){expect(sim.snapshot().employees[c.id].expectations.salary).toBe(c.expectation);expect(replay(sim.snapshot()).stateHash()).toBe(sim.stateHash());}
    expect(low.memories.some(m=>m.sentiment<0)).toBe(true);
  });
  it('preserves genuine old saves, old cheap hire semantics and original hash',()=>{
    const saved=validateSave(oldSave);expect(saved.world.meta.simulationVersion).toBe(1);
    expect(replay(saved.world).stateHash()).toBe(oldSave.manifest.stateHash);expect(Simulation.restore(saved.world).stateHash()).toBe(oldSave.manifest.stateHash);
    const v1=new Simulation(config,true,1);v1.execute(offer(100));expect(v1.snapshot().employees['employee-4'].expectations.salary).toBe(100);
    expect(replay(v1.snapshot()).stateHash()).toBe(v1.stateHash());
    const unknown=structuredClone(saved.world) as unknown as {meta:{simulationVersion:number}};unknown.meta.simulationVersion=3;expect(()=>Simulation.restore(unknown)).toThrow();
  });
  it('prevents accepted offer followed by absurd salary cut without resetting the contract',()=>{
    for(let i=1;i<=100;i++) {
      const sim=new Simulation({...config,seed:`cut-${i}`}),c=candidateFor(sim.snapshot(),'Engineer');sim.execute(offer(c.expectation));
      sim.execute({type:'ChangeSalary',employeeId:c.id,salary:100});const e=sim.snapshot().employees[c.id];
      expect(e.salary).toBe(c.expectation);expect(e.salaryHistory).toHaveLength(1);expect(sim.snapshot().events.at(-1)?.type).toBe('SalaryOfferRejected');
      sim.execute({type:'ChangeSalary',employeeId:c.id,salary:c.minimum});expect(sim.snapshot().employees[c.id].salary).toBe(c.minimum);
      expect(sim.snapshot().employees[c.id].expectations.salary).toBe(c.expectation);expect(replay(sim.snapshot()).stateHash()).toBe(sim.stateHash());
    }
    const sim=new Simulation(config);sim.execute({type:'ChangeSalary',employeeId:'employee-1',salary:0});expect(sim.snapshot().employees['employee-1'].salary).toBe(0);
  });
  it('returns persisted recruitment rejection as a normal application outcome',async()=>{
    const saves=new Map();const session=new ApplicationSession({save:async(slot,data)=>{saves.set(slot,data);},load:async slot=>saves.get(slot)??null});
    await session.handle({action:'create',config:{...config,initialCash:50_000_000}});
    const response=await session.handle({action:'execute',command:offer(100)});
    expect(response.recruitment?.accepted).toBe(false);expect(response.notice).toContain('低於');expect(response.view?.employees).toHaveLength(3);
    expect(saves.get('autosave').world.commands.at(-1).command).toEqual(offer(100));
    expect((await session.handle({action:'replay'})).replay?.matches).toBe(true);
    const accepted=await session.handle({action:'execute',command:offer(4_000_000)});
    const hired=accepted.view!.employees.find(e=>e.name==='Dana')!;
    const cut=await session.handle({action:'execute',command:{type:'ChangeSalary',employeeId:hired.id,salary:100}});
    expect(cut.notice).toContain('原月薪');expect(cut.view!.employees.find(e=>e.id===hired.id)?.salary).toBe(4_000_000);
    expect((await session.handle({action:'execute',command:{type:'AdvanceTime',days:1}})).notice).toBeUndefined();
  });
});
