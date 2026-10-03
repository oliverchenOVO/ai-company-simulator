import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { goldenOrganization } from '../scripts/golden-v3';
import { replay } from '../packages/simulation/src/simulation';
const fixture=JSON.parse(readFileSync('tests/fixtures/golden-v3.json','utf8')) as {results:Record<string,Record<string,string>>};
for(const [seed,checkpoints] of Object.entries(fixture.results))it(`${seed}: v3 organization years 1/3/5 exact replay`,()=>{
  const sim=goldenOrganization(seed);let previous=90;
  for(const [tick,expected] of Object.entries(checkpoints)){sim.execute({type:'AdvanceTime',days:Number(tick)-previous});previous=Number(tick);expect(sim.stateHash()).toBe(expected);}
  expect(sim.snapshot().events.some(e=>e.type==='EmployeePromoted')).toBe(true);
  expect(replay(sim.snapshot()).stateHash()).toBe(sim.stateHash());
});
