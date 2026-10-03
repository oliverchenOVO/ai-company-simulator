import { performance } from 'node:perf_hooks';
import { mkdirSync, writeFileSync } from 'node:fs';
import { Simulation } from '../packages/simulation/src/simulation';
import { projectOffice } from '../apps/desktop/src/features/office/projection';
const rows = [];
for (const count of [3, 12, 40, 100, 250, 1000]) {
  const sim = new Simulation({ name: 'Office benchmark', seed: 'office-performance', scenario: 'garage', employeeCount: count, initialCash: 1_000_000_000_000 }, true, 3);
  const view = sim.observe(), hash = sim.stateHash(), samples = [];
  let office = projectOffice(view);
  for (let i = 0; i < 100; i++) { const start = performance.now(); office = projectOffice(view); samples.push(performance.now() - start); }
  samples.sort((a, b) => a - b);
  if (office.seats.filter(s => !s.vacant).length !== count || sim.stateHash() !== hash) throw new Error('Office projection changed authority or lost employees');
  rows.push({ employees: count, floors: office.floors.length, characters: count, fidelity: office.fidelity, medianMs: +samples[50].toFixed(3), p95Ms: +samples[95].toFixed(3), heapMiB: +(process.memoryUsage().heapUsed / 1048576).toFixed(1), simulationHashUnchanged: true });
}
mkdirSync('docs/living_office/data', { recursive: true });
const report = { generatedAt: new Date().toISOString(), node: process.version, platform: process.platform, kind: 'detached layout projection; 100 repetitions, rendering measured separately', rows };
writeFileSync('docs/living_office/data/projection.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
