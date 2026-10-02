import { mkdirSync, writeFileSync } from 'node:fs';
import { Simulation } from '../packages/simulation/src/simulation';
const results: Record<string, Record<string, string>> = {};
for (const seed of ['golden-001', 'golden-002', 'golden-003']) {
  const sim = new Simulation({ seed, name: 'Garage Startup', scenario: 'garage' });
  results[seed] = {};
  let tick = 0;
  for (const checkpoint of [365, 1096, 1826]) {
    sim.execute({ type: 'AdvanceTime', days: checkpoint - tick }); tick = checkpoint;
    results[seed][String(checkpoint)] = sim.stateHash();
  }
}
mkdirSync('tests/fixtures', { recursive: true });
writeFileSync('tests/fixtures/golden.json', JSON.stringify({ simulationVersion: 1, reason: 'Initial Phase 1 simulation baseline; calendar accrual, named RNG, fixed scheduling.', results }, null, 2) + '\n');
console.log('Wrote 3 seeds × 3 checkpoints. Review and commit intentional changes.');
