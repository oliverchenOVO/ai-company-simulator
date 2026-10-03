import { performance } from 'node:perf_hooks';
import { mkdirSync, writeFileSync } from 'node:fs';
import { Simulation } from '../packages/simulation/src/simulation';
import { projectOffice } from '../apps/desktop/src/features/office/projection';
import { projectOfficeScene } from '../apps/desktop/src/features/office/scene-projection';
import { sampleMotion } from '../apps/desktop/src/features/office/scene-motion';
const rows=[];
for(const count of [3,12,30,60,100,250,1000]) {
  const sim=new Simulation({name:`Office 3D ${count}`,seed:'office-3d-benchmark',scenario:'garage',employeeCount:count,initialCash:1_000_000_000_000},true,3);
  const hash=sim.stateHash(),office=projectOffice(sim.observe()), samples:number[]=[];
  const expected=JSON.stringify(projectOfficeScene(office));
  for(let i=0;i<100;i++) {
    const start=performance.now(), scene=projectOfficeScene(office);
    for(const seat of scene.seats) sampleMotion(seat,i,false,office.cues.find(c=>c.employeeId===seat.seat.employeeId),undefined,undefined,count<=40);
    samples.push(performance.now()-start);
    if(JSON.stringify(scene)!==expected) throw new Error('Non-deterministic base scene');
  }
  if(sim.stateHash()!==hash) throw new Error('Presentation mutated world');
  samples.sort((a,b)=>a-b);
  rows.push({employees:count,floors:office.floors.length,renderer:count<=100?'3d':'svg-focused',medianMs:+samples[50].toFixed(3),p95Ms:+samples[95].toFixed(3),worldHashUnchanged:true,baseSceneDeterministic:true});
}
const directory='docs/living_office_3d/data';mkdirSync(directory,{recursive:true});
const report={generatedAt:new Date().toISOString(),node:process.version,platform:process.platform,kind:'pure 3D adapter plus one frame of pose sampling; 100 repetitions; GPU measured in Chrome separately',rows};
writeFileSync(`${directory}/scene-projection.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
