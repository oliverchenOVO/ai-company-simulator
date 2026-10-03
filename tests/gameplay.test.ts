import { describe,it,expect } from 'vitest';
import { Simulation } from '../packages/simulation/src/simulation';
import { decisions,strategies } from '../scripts/gameplay/policies';
import { compareBranches } from '../scripts/counterfactual';
const config={seed:'benchmark-001',name:'Garage Startup',scenario:'garage' as const};
describe('observable policy and decision sensitivity',()=>{
  it('reproduces policies using detached player information without modifying it',()=>{
    const sim=new Simulation(config, true, 1),v=sim.observe(),before=sim.stateHash();
    for(const policy of strategies)expect(decisions(policy,v)).toEqual(decisions(policy,structuredClone(v)));
    expect(sim.stateHash()).toBe(before);expect(decisions('passive',v)).toEqual([]);
  });
  it('hiring changes payroll, cash, product launch and events from the same origin',()=>{
    const origin=new Simulation(config, true, 1),before=origin.stateHash();
    const r=compareBranches(origin.snapshot(),[{type:'HireEmployee',name:'Hire',role:'Engineer',salary:3_500_000,teamId:'team-1'}],[]);
    expect(r.a.metrics.payrollNTD-r.b.metrics.payrollNTD).toBe(35000);expect(r.a.product.launchedAt!).toBeLessThan(r.b.product.launchedAt!);
    expect(r.a.metrics.cashNTD).toBeLessThan(r.b.metrics.cashNTD);expect(origin.stateHash()).toBe(before);
  });
  it('intervention at a visible financial crisis changes survival while the control fails',()=>{
    const sim=new Simulation(config, true, 1);sim.execute({type:'AdvanceTime',days:90});expect(sim.observe().finance.runway!).toBeLessThan(3);
    const r=compareBranches(sim.snapshot(),[{type:'FireEmployee',employeeId:'employee-2'},{type:'ChangeSalary',employeeId:'employee-1',salary:1_000_000},{type:'ChangeCompanyStrategy',strategy:'sustainable'},{type:'ChangeProductPriority',priority:'quality'}],[],365);
    expect(r.a.metrics.bankrupt).toBe(false);expect(r.b.metrics.bankrupt).toBe(true);expect(r.a.hash).not.toBe(r.b.hash);
  });
  it('salary and priority choices produce measured financial and launch differences',()=>{
    const origin=new Simulation(config, true, 1);
    const salary=compareBranches(origin.snapshot(),[{type:'ChangeSalary',employeeId:'employee-2',salary:5_000_000}],[]);
    expect(salary.b.metrics.cashNTD-salary.a.metrics.cashNTD).toBe(30000);
    const priority=compareBranches(origin.snapshot(),[{type:'ChangeProductPriority',priority:'quality'}],[{type:'ChangeProductPriority',priority:'features'}]);
    expect(priority.a.product.launchedAt).toBeNull();expect(priority.b.product.launchedAt).toBe(64);
  });
  it('company strategy changes launch timing, while team movement changes relationships',()=>{
    const origin=new Simulation(config, true, 1);
    const strategy=compareBranches(origin.snapshot(),[{type:'ChangeCompanyStrategy',strategy:'growth'}],[{type:'ChangeCompanyStrategy',strategy:'sustainable'}]);
    expect(strategy.a.product.launchedAt!).toBeLessThan(strategy.b.product.launchedAt!);
    const team=compareBranches(origin.snapshot(),[{type:'CreateTeam',name:'Lab',managerId:null},{type:'MoveEmployeeToTeam',employeeId:'employee-2',teamId:'team-4'}],[]);
    expect(team.a.omniscientDiagnostics.relationships).not.toEqual(team.b.omniscientDiagnostics.relationships);
    // Current mechanics have no direct team capacity bonus. Keep this limitation visible.
    expect(team.a.metrics.cashNTD).toBe(team.b.metrics.cashNTD);expect(team.a.product.launchedAt).toBe(team.b.product.launchedAt);
  });
});
