import { mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { Simulation, replay } from '../packages/simulation/src/simulation';
import { createSave, validateSave } from '../packages/persistence/src/save';
import { invariantViolations } from '../packages/simulation/src/invariants';
import { worldSchema, type Command } from '../packages/domain/src/model';
import { decisions } from './gameplay/policies';
import { metrics } from './gameplay/audit';
import { compareBranches } from './counterfactual';
const dir='docs/phase1_5b/data';mkdirSync(dir,{recursive:true});const start=performance.now();
const checks={crash:0,nan:0,infinity:0,corruption:0,invariants:0,replayV1:0,replayV2:0};
function scan(value:unknown):void {if(typeof value==='number'){if(Number.isNaN(value))checks.nan++;else if(!Number.isFinite(value))checks.infinity++;}else if(value&&typeof value==='object')for(const child of Object.values(value))scan(child);}
function verify(sim:Simulation) {const w=sim.snapshot();scan(w);checks.invariants+=invariantViolations(w).length;if(!worldSchema.safeParse(w).success)checks.corruption++;if(Simulation.restore(validateSave(createSave(w)).world).stateHash()!==sim.stateHash())checks.corruption++;if(replay(w).stateHash()!==sim.stateHash())checks[w.meta.simulationVersion===1?'replayV1':'replayV2']++;}
const rows:unknown[]=[],offers:unknown[]=[];
for(let i=1;i<=100;i++) {
  const seed=`benchmark-${String(i).padStart(3,'0')}`;
  for(const role of ['CTO','Engineer','Designer','Sales','Operations'] as const) {
    const origin=new Simulation({seed,name:'Garage Startup',scenario:'garage'},true,2),candidate=origin.observe().recruitment.find(c=>c.role===role)!;
    for(const salary of [0,100,10000,candidate.minimum-1,candidate.minimum,candidate.expectation,Math.round(candidate.expectation*1.2),100_000_000]) {
      const sim=Simulation.restore(origin.snapshot());sim.execute({type:'HireEmployee',name:'Offer matrix',role,salary,teamId:'team-1'});verify(sim);
      offers.push({seed,role,expectation:candidate.expectation,minimum:candidate.minimum,salary,accepted:sim.snapshot().events.at(-1)?.type==='EmployeeHired',hash:sim.stateHash()});
    }
  }
  for(const band of ['low','mid','high','absurd','post-hire-cut','growth-no-hire'] as const) {
    const sim=new Simulation({seed,name:'Garage Startup',scenario:'garage'},true,2);let attempts=0;
    for(let day=0;day<730;day+=14) {
      if(sim.observe().bankrupt){sim.execute({type:'AdvanceTime',days:730-day});break;}
      for(const command of decisions('aggressive',sim.observe())) {
        if(command.type==='HireEmployee') {
          if(band==='growth-no-hire')continue;
          attempts++;const c=sim.observe().recruitment.find(c=>c.role==='Engineer')!;
          const salary=band==='absurd'?100:band==='low'?c.minimum:band==='high'?Math.round(c.expectation*1.2):c.expectation;
          sim.execute({...command,salary});
          if(band==='post-hire-cut'&&sim.snapshot().employees[c.id])sim.execute({type:'ChangeSalary',employeeId:c.id,salary:100});
        }else sim.execute(command);
      }
      sim.execute({type:'AdvanceTime',days:Math.min(14,730-day)});
    }
    verify(sim);rows.push({seed,band,attempts,accepted:sim.observe().events.filter(e=>e.type==='EmployeeHired').length,rejected:sim.observe().events.filter(e=>e.type==='HireOfferRejected').length,...metrics(sim.observe(),sim.snapshot())});
  }
  if(i<=10) {
    const sim=new Simulation({seed,name:'Garage Startup',scenario:'garage'},true,1);
    for(let day=0;day<730;day+=14) {if(sim.observe().bankrupt){sim.execute({type:'AdvanceTime',days:730-day});break;}for(const c of decisions('aggressive',sim.observe()))sim.execute(c.type==='HireEmployee'?{...c,salary:100}:c);sim.execute({type:'AdvanceTime',days:Math.min(14,730-day)});}
    verify(sim);rows.push({seed,band:'legacy-absurd',...metrics(sim.observe(),sim.snapshot())});
  }
}
const branches:unknown[]=[];
for(const seed of ['benchmark-001','benchmark-002','benchmark-003','benchmark-010','benchmark-050']) {
  const base=new Simulation({seed,name:'Garage Startup',scenario:'garage'},true,2);
  const commands:Command[]=[];
  const probe=Simulation.restore(base.snapshot());
  for(let i=0;i<3;i++){const c=probe.observe().recruitment.find(c=>c.role==='Engineer')!;const command:Command={type:'HireEmployee',name:`Engineer ${i}`,role:'Engineer',salary:c.expectation,teamId:'team-1'};commands.push(command);probe.execute(command);}
  for(const n of [1,3])branches.push({context:'startup',n,...compareBranches(base.snapshot(),commands.slice(0,n),[],90)});
  // Same starting capital and recorded commands, financially prudent early management.
  base.execute({type:'ChangeSalary',employeeId:'employee-1',salary:1_000_000});base.execute({type:'ChangeCompanyStrategy',strategy:'sustainable'});
  base.execute({type:'FireEmployee',employeeId:'employee-2'});base.execute({type:'AdvanceTime',days:365});
  if(!base.observe().bankrupt){base.execute({type:'ChangeProductPriority',priority:'quality'});const c=base.observe().recruitment.find(c=>c.role==='Sales')!;branches.push({context:'established-sales',n:1,...compareBranches(base.snapshot(),[{type:'HireEmployee',name:'Sales',role:'Sales',salary:c.expectation,teamId:'team-1'}],[],365)});}
}
writeFileSync(`${dir}/compensation-audit.json`,JSON.stringify({runtimeMs:Math.round(performance.now()-start),checks,information:'Policies use production CompanyView; counterfactual internals diagnostic only',offers,rows,branches},null,2)+'\n');
console.log(JSON.stringify({runtimeMs:Math.round(performance.now()-start),checks,summary:['low','mid','high','absurd','post-hire-cut','growth-no-hire','legacy-absurd'].map(band=>{const r=rows as {band:string;bankrupt:boolean}[];const subset=r.filter(x=>x.band===band);return {band,survived:subset.filter(x=>!x.bankrupt).length,sessions:subset.length};})}));
if(Object.values(checks).some(n=>n))process.exitCode=1;
