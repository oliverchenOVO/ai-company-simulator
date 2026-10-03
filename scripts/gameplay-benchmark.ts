import { mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { Simulation,replay } from '../packages/simulation/src/simulation';
import { createSave,validateSave } from '../packages/persistence/src/save';
import { strategies,decisions } from './gameplay/policies';
import { metrics } from './gameplay/audit';
const count=Number(process.argv.find(a=>a.startsWith('--seeds='))?.split('=')[1]??100);
const horizon=Number(process.argv.find(a=>a.startsWith('--days='))?.split('=')[1]??730);
const directory=process.argv.find(a=>a.startsWith('--out='))?.slice(6)??'docs/phase1_5b/data'; mkdirSync(directory,{recursive:true});
const start=performance.now(), rows:unknown[]=[]; let mismatches=0;
for(const policy of strategies) {
  const policyStart=performance.now();
  for(let i=1;i<=count;i++) {
    const seed=`benchmark-${String(i).padStart(3,'0')}`, sim=new Simulation({seed,name:'Garage Startup',scenario:'garage'});
    const checkpoints:unknown[]=[], signals:unknown[]=[]; let previousSevere=false,recoveries=0;
    for(let tick=0;tick<horizon;) {
      const v=sim.observe();
      for(const command of decisions(policy,v)) sim.execute(command);
      const observed=sim.observe(), severe=!observed.bankrupt&&(observed.finance.runway??Infinity)<3;
      if(previousSevere&&!severe&&!observed.bankrupt) recoveries++; previousSevere=severe;
      signals.push({tick:observed.tick,runway:observed.finance.runway,health:observed.employees.filter(e=>e.status==='active').map(e=>({id:e.id,condition:e.condition})),atRiskCustomers:observed.customers.filter(c=>c.condition==='需要跟進').map(c=>c.id)});
      const nextCheckpoint=[90,181,365,730,horizon].find(d=>d>tick)??horizon;
      const days=Math.min(14,horizon-tick,nextCheckpoint-tick); sim.execute({type:'AdvanceTime',days}); tick+=days;
      if([90,181,365,730,horizon].includes(tick)) checkpoints.push({tick,...metrics(sim.observe(),sim.snapshot())});
      if(sim.observe().bankrupt) {
        if(tick<horizon) sim.execute({type:'AdvanceTime',days:horizon-tick});
        for(const checkpoint of [90,181,365,730,horizon].filter((d,i,all)=>d>tick&&d<=horizon&&all.indexOf(d)===i)) checkpoints.push({tick:checkpoint,terminalCarryForward:true,...metrics(sim.observe(),sim.snapshot())});
        break;
      }
    }
    const world=sim.snapshot(),view=sim.observe();
    const hash=sim.stateHash();if(replay(world).stateHash()!==hash||Simulation.restore(validateSave(createSave(world)).world).stateHash()!==hash)mismatches++;
    rows.push({policy,seed,horizon,hash,recoveries,checkpoints,signals,...metrics(view,world)});
    if(i<=3) writeFileSync(`${directory}/${policy}-${seed}-${horizon}.save.json`,JSON.stringify(createSave(world),null,2)+'\n');
  }
  console.log(`${policy}: ${count} seeds completed in ${Math.round(performance.now()-policyStart)}ms`);
}
const output={horizon,seeds:count,runtimeMs:Math.round(performance.now()-start),replayOrRestoreMismatches:mismatches,policyInformation:'production CompanyView only; diagnostic fields are post-run only',rows};
writeFileSync(`${directory}/strategies-${horizon}.json`,JSON.stringify(output,null,2)+'\n'); console.log(JSON.stringify({...output,rows:undefined}));if(mismatches)process.exitCode=1;
