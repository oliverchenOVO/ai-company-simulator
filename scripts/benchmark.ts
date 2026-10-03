import { performance } from 'node:perf_hooks';
import { mkdirSync, writeFileSync } from 'node:fs';
import { Simulation, replay } from '../packages/simulation/src/simulation';
import { activeEmployees, revenue } from '../packages/simulation/src/systems';
import { invariantViolations } from '../packages/simulation/src/invariants';
import { worldSchema } from '../packages/domain/src/model';
const stress = process.argv.includes('--stress');
const seeds = stress ? 1 : 100;
const days = stress ? 3652 : 1826; // Includes leap days from 2026-01-01.
const rows: Record<string, unknown>[] = [];
const totals = { crashes: 0, nan: 0, infinity: 0, corruptedStates: 0, invariantViolations: 0, replayMismatches: 0 };
const start = performance.now();
function scan(value: unknown): void {
  if (typeof value === 'number') { if (Number.isNaN(value)) totals.nan++; else if (!Number.isFinite(value)) totals.infinity++; }
  else if (value && typeof value === 'object') for (const child of Object.values(value)) scan(child);
}
for (let i = 0; i < seeds; i++) {
  const seed = stress ? 'stress-1000' : `benchmark-${String(i + 1).padStart(3, '0')}`;
  const runStart = performance.now();
  try {
    const sim = new Simulation({ seed, name: 'Garage Startup', scenario: 'garage', employeeCount: stress ? 1000 : 3, initialCash: stress ? 1_000_000_000_000 : 50_000_000 });
    sim.execute({ type: 'AdvanceTime', days });
    const w = sim.snapshot();
    scan(w); totals.invariantViolations += invariantViolations(w).length;
    if (!worldSchema.safeParse(w).success) totals.corruptedStates++;
    if (Simulation.restore(w).stateHash() !== sim.stateHash()) totals.corruptedStates++;
    if ((!stress || process.argv.includes('--replay-stress')) && replay(w).stateHash() !== sim.stateHash()) totals.replayMismatches++;
    rows.push({ seed, days, runtimeMs: Math.round(performance.now() - runStart), employees: activeEmployees(w).length, employeeEntities: Object.keys(w.employees).length, customers: Object.values(w.customers).filter(c => c.status === 'active').length, revenueNTD: revenue(w) / 100, cashNTD: w.company.cash / 100, events: w.events.length, bankrupt: w.company.bankrupt, hash: sim.stateHash() });
  } catch (error) { totals.crashes++; rows.push({ seed, error: String(error) }); }
}
const report = { kind: stress ? '1000 employees / 10 years (capitalized stress scenario)' : '100 seeds / 5 calendar years', generatedAt: new Date().toISOString(), node: process.version, platform: process.platform, runtimeMs: Math.round(performance.now() - start), totals, rows };
const directory=process.argv.find(a=>a.startsWith('--out='))?.slice(6)??'docs/benchmarks';
mkdirSync(directory, { recursive: true });
writeFileSync(`${directory}/${stress ? 'stress' : 'seeds'}.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, rows: undefined }, null, 2));
if (Object.values(totals).some(n => n !== 0)) process.exitCode = 1;
