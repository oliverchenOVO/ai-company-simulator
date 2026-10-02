import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { Simulation } from '../packages/simulation/src/simulation';
const fixture = JSON.parse(readFileSync(new URL('./fixtures/golden.json', import.meta.url), 'utf8')) as { results: Record<string, Record<string, string>> };
describe('golden seed regression', () => {
  for (const [seed, checkpoints] of Object.entries(fixture.results)) it(`${seed} matches year 1, 3 and 5 hashes`, () => {
    const sim = new Simulation({ seed, name: 'Garage Startup', scenario: 'garage' }); let previous = 0;
    for (const [tick, expected] of Object.entries(checkpoints).sort(([a], [b]) => Number(a) - Number(b))) {
      sim.execute({ type: 'AdvanceTime', days: Number(tick) - previous }); previous = Number(tick);
      expect(sim.stateHash(), `seed=${seed} tick=${tick}`).toBe(expected);
    }
  });
});
