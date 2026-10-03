import { mkdirSync,writeFileSync } from 'node:fs';
import { Simulation } from '../packages/simulation/src/simulation';
import { compareBranches } from './counterfactual';
import { createSave } from '../packages/persistence/src/save';
const dir='docs/phase1_5/data';mkdirSync(dir,{recursive:true});
const config={seed:'benchmark-001',name:'Garage Startup',scenario:'garage' as const};
const origin=new Simulation(config),team='team-1';
const comparisons={
  hire:compareBranches(origin.snapshot(),[{type:'HireEmployee',name:'Branch Engineer',role:'Engineer',salary:3_500_000,teamId:team}],[]),
  salary:compareBranches(origin.snapshot(),[{type:'ChangeSalary',employeeId:'employee-2',salary:5_000_000}],[]),
  priority:compareBranches(origin.snapshot(),[{type:'ChangeProductPriority',priority:'quality'}],[{type:'ChangeProductPriority',priority:'features'}]),
  strategy:compareBranches(origin.snapshot(),[{type:'ChangeCompanyStrategy',strategy:'growth'}],[{type:'ChangeCompanyStrategy',strategy:'sustainable'}]),
  team:compareBranches(origin.snapshot(),[{type:'CreateTeam',name:'Lab',managerId:null},{type:'MoveEmployeeToTeam',employeeId:'employee-2',teamId:'team-4'}],[])
};
const crisis=new Simulation(config);crisis.execute({type:'AdvanceTime',days:90});
const financialRecovery=compareBranches(crisis.snapshot(),[{type:'FireEmployee',employeeId:'employee-2'},{type:'ChangeSalary',employeeId:'employee-1',salary:1_000_000},{type:'ChangeCompanyStrategy',strategy:'sustainable'},{type:'ChangeProductPriority',priority:'quality'}],[],365);
const retention=new Simulation({...config,seed:'retention-001'});retention.execute({type:'ChangeSalary',employeeId:'employee-2',salary:0});retention.execute({type:'AdvanceTime',days:70});
const employeeRecovery=compareBranches(retention.snapshot(),[{type:'ChangeSalary',employeeId:'employee-2',salary:4_000_000},{type:'ChangeCompanyStrategy',strategy:'sustainable'}],[],120);
writeFileSync(`${dir}/decision-branches.json`,JSON.stringify({comparisons,financialRecovery,employeeRecovery},null,2)+'\n');
writeFileSync(`${dir}/recovery-origin.save.json`,JSON.stringify(createSave(crisis.snapshot()),null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries({...comparisons,financialRecovery,employeeRecovery}).map(([name,r])=>[name,{a:r.a.metrics,b:r.b.metrics,products:[r.a.product,r.b.product]}])),null,2));
