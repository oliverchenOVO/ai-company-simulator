import { mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { Simulation, replay } from '../packages/simulation/src/simulation';
import { createSave, validateSave } from '../packages/persistence/src/save';
import { invariantViolations } from '../packages/simulation/src/invariants';
import type { Command } from '../packages/domain/src/model';
const directory = 'docs/phase2/data'; mkdirSync(directory,{recursive:true});
const start = performance.now(); let failures = 0;
function evaluate(sim: Simulation) {
  const w=sim.snapshot(), hash=sim.stateHash();
  if (replay(w).stateHash()!==hash || Simulation.restore(validateSave(createSave(w)).world).stateHash()!==hash || invariantViolations(w).length) failures++;
  return {hash,cash:w.company.cash,product:w.products['product-1'],customers:Object.values(w.customers).filter(c=>c.status==='active').length,
    employees:Object.values(w.employees).map(e=>({id:e.id,status:e.status,work:e.workTotal,psychology:e.psychology,career:e.career})),
    teams:w.teams,relationships:w.relationships,events:w.events};
}
const rows=[];
for (const seed of ['career-3','career-4','benchmark-001','benchmark-010','benchmark-050']) {
  const base=new Simulation({seed,name:'Organization branch',scenario:'garage',initialCash:10_000_000_000});
  base.execute({type:'ChangeCompanyStrategy',strategy:'sustainable'});
  base.execute({type:'CreateTeam',name:'Delivery',managerId:'employee-3'});
  const teamId=Object.keys(base.snapshot().teams)[1];
  const candidate=base.observe().recruitment.find(c=>c.role==='Engineer')!;
  base.execute({type:'HireEmployee',name:'Career colleague',role:'Engineer',salary:candidate.expectation,teamId});
  base.execute({type:'AdvanceTime',days:180});
  const employee=Object.values(base.snapshot().employees).find(e=>e.name==='Career colleague')!;
  const cases:{name:string;a:Command[];b:Command[]}[]=[
    {name:'promotion-vs-none',a:[{type:'PromoteEmployee',employeeId:employee.id,track:'manager'}],b:[]},
    {name:'strong-vs-overloaded',a:[{type:'AssignManager',employeeId:employee.id,managerId:'employee-1'}],b:[{type:'AssignManager',employeeId:employee.id,managerId:'employee-1'},...Array.from({length:10},(_,i):Command=>({type:'HireEmployee',name:`Load ${i}`,role:'Engineer',salary:4_000_000,teamId:'team-1'}))]},
    {name:'transfer-vs-none',a:[{type:'MoveEmployeeToTeam',employeeId:employee.id,teamId:'team-1'}],b:[]},
    {name:'manager-change-vs-none',a:[{type:'AssignManager',employeeId:employee.id,managerId:'employee-1'}],b:[]},
    {name:'career-vs-salary-only',a:[{type:'PromoteEmployee',employeeId:employee.id,track:'specialist'}],b:[{type:'ChangeSalary',employeeId:employee.id,salary:Math.round(employee.salary*1.2)}]}
  ];
  for(const branch of cases) {
    const a=Simulation.restore(base.snapshot()),b=Simulation.restore(base.snapshot());
    for(const command of branch.a)a.execute(command);for(const command of branch.b)b.execute(command);
    a.execute({type:'AdvanceTime',days:180});b.execute({type:'AdvanceTime',days:180});
    rows.push({seed,name:branch.name,baseHash:base.stateHash(),employeeId:employee.id,a:evaluate(a),b:evaluate(b)});
  }
}
// A capacity-only branch holds the same roster, pay, teams and initial state constant.
for (const seed of ['benchmark-001','benchmark-010','benchmark-050']) {
  const base=new Simulation({seed,name:'Matched capacity',scenario:'garage',employeeCount:20,initialCash:10_000_000_000});
  base.execute({type:'ChangeCompanyStrategy',strategy:'sustainable'});
  const a=Simulation.restore(base.snapshot()),b=Simulation.restore(base.snapshot());
  for(let i=5;i<=20;i++) a.execute({type:'AssignManager',employeeId:`employee-${i}`,managerId:i%2?'employee-2':'employee-3'});
  a.execute({type:'AdvanceTime',days:180});b.execute({type:'AdvanceTime',days:180});
  rows.push({seed,name:'matched-roster-capacity',baseHash:base.stateHash(),employeeId:'employee-4',a:evaluate(a),b:evaluate(b)});
}
const report={generatedAt:new Date().toISOString(),runtimeMs:Math.round(performance.now()-start),failures,diagnostics:'CLI audit only; policies never consume hidden values',rows};
writeFileSync(`${directory}/organization-branches.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,rows:rows.length}));if(failures)process.exitCode=1;
