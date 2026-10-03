import { readFileSync,writeFileSync } from 'node:fs';
import type { Command,WorldState } from '../packages/domain/src/model';
import { Simulation,replay } from '../packages/simulation/src/simulation';
import { validateSave } from '../packages/persistence/src/save';
import { metrics } from './gameplay/audit';
export function compareBranches(world:WorldState,a:Command[],b:Command[],days=90) {
  const run=(commands:Command[])=>{const sim=Simulation.restore(world);for(const c of commands)sim.execute(c);sim.execute({type:'AdvanceTime',days});const w=sim.snapshot();if(replay(w).stateHash()!==sim.stateHash())throw Error('Branch replay mismatch');return {hash:sim.stateHash(),metrics:metrics(sim.observe(),w),events:sim.observe().events.filter(e=>e.tick>=world.meta.tick),employees:sim.observe().employees,product:sim.observe().product,customers:sim.observe().customers,omniscientDiagnostics:{employees:Object.values(w.employees).map(e=>({id:e.id,psychology:e.psychology})),relationships:w.relationships}};};
  const resultA=run(a),resultB=run(b),eventKey=(e:typeof resultA.events[number])=>JSON.stringify({tick:e.tick,type:e.type,title:e.title,body:e.body});
  const eventsA=new Set(resultA.events.map(eventKey)),eventsB=new Set(resultB.events.map(eventKey));
  const differences={cashNTD:resultA.metrics.cashNTD-resultB.metrics.cashNTD,mrrNTD:resultA.metrics.mrrNTD-resultB.metrics.mrrNTD,payrollNTD:resultA.metrics.payrollNTD-resultB.metrics.payrollNTD,
    headcount:resultA.metrics.employees-resultB.metrics.employees,customers:resultA.metrics.customers-resultB.metrics.customers,productProgress:resultA.product.progress-resultB.product.progress,
    productQuality:resultA.product.quality-resultB.product.quality,technicalDebt:resultA.product.technicalDebt-resultB.product.technicalDebt,
    eventsOnlyA:resultA.events.filter(e=>!eventsB.has(eventKey(e))),eventsOnlyB:resultB.events.filter(e=>!eventsA.has(eventKey(e))),
    employeeIdsChanged:[...new Set([...resultA.employees,...resultB.employees].map(e=>e.id))].filter(id=>JSON.stringify(resultA.employees.find(e=>e.id===id))!==JSON.stringify(resultB.employees.find(e=>e.id===id)))};
  return {diagnosticOnly:true,seed:world.meta.seed,originTick:world.meta.tick,originHash:Simulation.restore(world).stateHash(),horizon:days,differences,a:resultA,b:resultB};
}
if(process.argv[1]?.endsWith('counterfactual.ts')&&process.argv[2]){
  const input=JSON.parse(readFileSync(process.argv[2],'utf8')) as {save:unknown;a:Command[];b:Command[];days?:number};
  const result=compareBranches(validateSave(input.save).world,input.a,input.b,input.days);
  if(process.argv[3])writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');else console.log(JSON.stringify(result,null,2));
}
