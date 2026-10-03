import { describe,it,expect } from 'vitest';
import { Simulation,replay } from '../packages/simulation/src/simulation';
import { advanceSummary } from '../packages/simulation/src/decision-support';
import { validateSave } from '../packages/persistence/src/save';
import phase1Save from './fixtures/phase1-0.1.0.save.json';
import { projectCompany } from '../packages/simulation/src/projection';
const config={seed:'benchmark-001',name:'Garage Startup',scenario:'garage' as const};
describe('Phase 1.5 observable decision support',()=>{
  it('warns about earned payroll even when a last-minute salary cut makes runway look safe',()=>{
    const sim=new Simulation(config, true, 1);sim.execute({type:'HireEmployee',name:'Overextension',role:'Engineer',salary:45_000_000,teamId:'team-1'});sim.execute({type:'AdvanceTime',days:30});
    for(const e of sim.observe().employees)sim.execute({type:'ChangeSalary',employeeId:e.id,salary:0});
    const v=sim.observe();expect(v.finance.runway).toBe(50);expect(v.finance.forecast.cashAfterClose).toBeLessThan(0);expect(v.alerts[0].severity).toBe('danger');
    sim.execute({type:'AdvanceTime',days:1});expect(sim.observe().finance.cash).toBe(v.finance.forecast.cashAfterClose);expect(sim.observe().bankrupt).toBe(true);
  });
  it('gives an initial planning signal and distinguishes severe financial danger',()=>{
    const sim=new Simulation(config, true, 1);expect(sim.observe().alerts.some(a=>a.title==='現金跑道需要規劃')).toBe(true);
    sim.execute({type:'AdvanceTime',days:90});expect(sim.observe().alerts.some(a=>a.title==='留意現金跑道')).toBe(true);
  });
  it('reports real time differences without mutating world truth or inventing events',()=>{
    const sim=new Simulation(config, true, 1),before=sim.observe();sim.execute({type:'AdvanceTime',days:70});const hash=sim.stateHash(),after=sim.observe(),summary=advanceSummary(before,after);
    expect(summary.cashChange).toBe(after.finance.cash-before.finance.cash);expect(summary.acquired).toBe(after.events.filter(e=>e.type==='CustomerAcquired').length);
    expect(summary.events.every(e=>after.events.some(actual=>actual.id===e.id))).toBe(true);expect(sim.stateHash()).toBe(hash);
  });
  it('exposes only supported nonzero resignation causes and retained observable history',()=>{
    const sim=new Simulation({...config,seed:'retention-001'}, true, 1);sim.execute({type:'ChangeSalary',employeeId:'employee-2',salary:0});sim.execute({type:'AdvanceTime',days:190});
    const event=sim.observe().events.find(e=>e.type==='EmployeeResigned');expect(event).toBeDefined();expect(event!.priority).toBe('critical');expect(event!.causes.some(c=>c.factor==='compensation')).toBe(true);
    const source=sim.snapshot().events.find(e=>e.id===event!.id)!;
    // Prolonged underpayment can itself accumulate fatigue; validate the actual
    // recorded contributors rather than assuming fatigue must remain zero.
    expect(event!.causes.map(c=>c.factor).sort()).toEqual(source.causes.filter(c=>c.weight>0).map(c=>c.factor).sort());
    expect(event!.causes.every(c=>c.evidence.length>0&&!('weight' in c))).toBe(true);
    expect(sim.observe().events.some(e=>e.type==='EmployeeConcernRaised'&&e.employeeId===event!.employeeId&&e.tick<event!.tick)).toBe(true);
  });
  it('loads a genuine 0.1.0 browser export captured before UI changes, with unchanged replay',()=>{
    const save=validateSave(phase1Save);expect(save.manifest.appVersion).toBe('0.1.0');expect(Simulation.restore(save.world).stateHash()).toBe(save.manifest.stateHash);expect(replay(save.world).stateHash()).toBe(save.manifest.stateHash);
  });
  it('warns qualitatively about weakening customer experience without disclosing satisfaction',()=>{
    const world=new Simulation(config, true, 1).snapshot();
    world.customers['customer-test']={id:'customer-test',name:'Fixture customer',segment:'small-business',mrr:300000,satisfaction:63,status:'active',acquiredAt:0,churnedAt:null};
    const view=projectCompany(world);expect(view.customers[0].condition).toBe('體驗轉弱');expect(view.alerts.some(a=>a.title==='客戶體驗需要跟進')).toBe(true);expect(view.customers[0]).not.toHaveProperty('satisfaction');
  });
});
