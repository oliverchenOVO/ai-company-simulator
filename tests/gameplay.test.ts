import { describe,it,expect } from 'vitest';
import { Simulation } from '../packages/simulation/src/simulation';
import { decisions,strategies } from '../scripts/gameplay/policies';
import { compareBranches } from '../scripts/counterfactual';
const config={seed:'benchmark-001',name:'Garage Startup',scenario:'garage' as const};
describe('observable policy and decision sensitivity',()=>{
  it('reproduces policies using detached player information without modifying it',()=>{
    const sim=new Simulation(config),v=sim.observe(),before=sim.stateHash();
    for(const policy of strategies)expect(decisions(policy,v)).toEqual(decisions(policy,structuredClone(v)));
    expect(sim.stateHash()).toBe(before);expect(decisions('passive',v)).toEqual([]);
  });
  it('hiring changes payroll, cash, product launch and events from the same origin',()=>{
    const origin=new Simulation(config),before=origin.stateHash();
    const r=compareBranches(origin.snapshot(),[{type:'HireEmployee',name:'Hire',role:'Engineer',salary:3_500_000,teamId:'team-1'}],[]);
    expect(r.a.metrics.payrollNTD-r.b.metrics.payrollNTD).toBe(35000);expect(r.a.product.launchedAt!).toBeLessThan(r.b.product.launchedAt!);
    expect(r.a.metrics.cashNTD).toBeLessThan(r.b.metrics.cashNTD);expect(origin.stateHash()).toBe(before);
  });
  it('intervention at a visible financial crisis changes survival while the control fails',()=>{
    const sim=new Simulation(config);sim.execute({type:'AdvanceTime',days:90});expect(sim.observe().finance.runway!).toBeLessThan(3);
    const r=compareBranches(sim.snapshot(),[{type:'FireEmployee',employeeId:'employee-2'},{type:'ChangeSalary',employeeId:'employee-1',salary:1_000_000},{type:'ChangeCompanyStrategy',strategy:'sustainable'},{type:'ChangeProductPriority',priority:'quality'}],[],365);
    expect(r.a.metrics.bankrupt).toBe(false);expect(r.b.metrics.bankrupt).toBe(true);expect(r.a.hash).not.toBe(r.b.hash);
  });
});
