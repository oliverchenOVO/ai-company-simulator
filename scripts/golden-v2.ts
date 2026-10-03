import { writeFileSync } from 'node:fs';
import { Simulation } from '../packages/simulation/src/simulation';
const results: Record<string, Record<string,string>> = {};
for(const seed of ['golden-001','golden-002','golden-003']) {
  const sim=new Simulation({seed,name:'Garage Startup',scenario:'garage'},true,2);let previous=0;results[seed]={};
  sim.execute({type:'HireEmployee',name:'Rejected',role:'Engineer',salary:100,teamId:'team-1'});
  const candidate=sim.observe().recruitment.find(c=>c.role==='Engineer')!;
  sim.execute({type:'HireEmployee',name:'Accepted',role:'Engineer',salary:candidate.expectation,teamId:'team-1'});
  for(const tick of [365,1096,1826]) {sim.execute({type:'AdvanceTime',days:tick-previous});previous=tick;results[seed][tick]=sim.stateHash();}
}
writeFileSync('tests/fixtures/golden-v2.json',JSON.stringify({simulationVersion:2,reason:'Intentional Phase1.5B independent expectation, rejected then accepted hire, original v1 fixture untouched.',results},null,2)+'\n');
