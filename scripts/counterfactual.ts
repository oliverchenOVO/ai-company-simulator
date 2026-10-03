import { readFileSync,writeFileSync } from 'node:fs';
import type { Command,WorldState } from '../packages/domain/src/model';
import { Simulation,replay } from '../packages/simulation/src/simulation';
import { validateSave } from '../packages/persistence/src/save';
import { metrics } from './gameplay/audit';
export function compareBranches(world:WorldState,a:Command[],b:Command[],days=90) {
  const run=(commands:Command[])=>{const sim=Simulation.restore(world);for(const c of commands)sim.execute(c);sim.execute({type:'AdvanceTime',days});const w=sim.snapshot();if(replay(w).stateHash()!==sim.stateHash())throw Error('Branch replay mismatch');return {hash:sim.stateHash(),metrics:metrics(sim.observe(),w),events:sim.observe().events.filter(e=>e.tick>=world.meta.tick),employees:sim.observe().employees,product:sim.observe().product,customers:sim.observe().customers};};
  return {diagnosticOnly:true,seed:world.meta.seed,originTick:world.meta.tick,originHash:Simulation.restore(world).stateHash(),horizon:days,a:run(a),b:run(b)};
}
if(process.argv[1]?.endsWith('counterfactual.ts')&&process.argv[2]){
  const input=JSON.parse(readFileSync(process.argv[2],'utf8')) as {save:unknown;a:Command[];b:Command[];days?:number};
  const result=compareBranches(validateSave(input.save).world,input.a,input.b,input.days);
  if(process.argv[3])writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');else console.log(JSON.stringify(result,null,2));
}
