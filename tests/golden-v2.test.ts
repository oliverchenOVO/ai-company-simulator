import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { Simulation, replay } from '../packages/simulation/src/simulation';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/golden-v2.json',import.meta.url),'utf8')) as {results:Record<string,Record<string,string>>};
describe('explicit compensation v2 golden regression',()=>{
  for(const [seed,checkpoints] of Object.entries(fixture.results))it(`${seed}: rejected and accepted hiring, years1/3/5`,()=>{
    const sim=new Simulation({seed,name:'Garage Startup',scenario:'garage'});let previous=0;
    sim.execute({type:'HireEmployee',name:'Rejected',role:'Engineer',salary:100,teamId:'team-1'});
    const candidate=sim.observe().recruitment.find(c=>c.role==='Engineer')!;
    sim.execute({type:'HireEmployee',name:'Accepted',role:'Engineer',salary:candidate.expectation,teamId:'team-1'});
    for(const [tick,expected] of Object.entries(checkpoints).sort(([a],[b])=>Number(a)-Number(b))) {sim.execute({type:'AdvanceTime',days:Number(tick)-previous});previous=Number(tick);expect(sim.stateHash()).toBe(expected);}
    expect(replay(sim.snapshot()).stateHash()).toBe(sim.stateHash());
  });
});
