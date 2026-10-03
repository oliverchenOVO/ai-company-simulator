import { mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { Simulation, replay } from '../packages/simulation/src/simulation';
import { createSave, validateSave } from '../packages/persistence/src/save';
import { invariantViolations } from '../packages/simulation/src/invariants';
import { RetentionAudit } from './retention/diagnostics';
import { controlledScenario, scenarioCommands, scenarioNames, interventionCommands, interventions } from './retention/scenarios';
import { auditPolicies, retentionDecisions } from './retention/policies';
const out = process.argv.find(a => a.startsWith('--out='))?.slice(6) ?? 'docs/phase2_5/data';
mkdirSync(out, { recursive: true });
const count = Number(process.argv.find(a => a.startsWith('--seeds='))?.split('=')[1] ?? 100);
const days = Number(process.argv.find(a => a.startsWith('--days='))?.split('=')[1] ?? 1826);
const start = performance.now(); let failures = 0;
function finish(sim: Simulation, audit: RetentionAudit) {
  const w = sim.snapshot(), hash = sim.stateHash(), save = createSave(w), text = JSON.stringify(save);
  const loadStart = performance.now(), loaded = Simulation.restore(validateSave(JSON.parse(text)).world);
  const loadMs = performance.now() - loadStart;
  if (loaded.stateHash() !== hash || replay(w).stateHash() !== hash || invariantViolations(w).length) failures++;
  const v = sim.observe();
  return { hash, bankrupt: v.bankrupt, tick: v.tick, employeeCount: v.headcount, cashNTD: v.finance.cash / 100,
    mrrNTD: v.finance.revenue / 100, product: v.product, teams: w.teams, relationshipCount: Object.keys(w.relationships).length,
    memories: Object.values(w.employees).reduce((n, e) => n + e.memories.length, 0), events: w.events.length,
    commands: w.commands.length, financeHistory: w.finance.history.length, saveBytes: Buffer.byteLength(text), loadMs,
    heapMiB: Math.round(process.memoryUsage().heapUsed / 1048576), audit: audit.result() };
}
if (process.argv.includes('--controlled')) {
  const rows = [], branches = [];
  for (const seed of ['career-3', 'career-4', 'benchmark-001', 'benchmark-010', 'benchmark-050']) for (const scenario of scenarioNames) {
    const run = controlledScenario(seed, scenario), audit = new RetentionAudit(7, [run.employeeId]); audit.sample(run.sim.snapshot());
    let origin: ReturnType<Simulation['snapshot']> | undefined;
    for (let tick = 0; tick < days; tick += 7) {
      for (const c of scenarioCommands(scenario, run.sim, run.employeeId, run.teamId)) run.sim.execute(c);
      run.sim.execute({ type: 'AdvanceTime', days: Math.min(7, days - tick) }); audit.sample(run.sim.snapshot());
      if (!origin && run.sim.snapshot().meta.tick >= 180 && run.sim.observe().employees.find(e => e.id === run.employeeId)?.status === 'active') origin = run.sim.snapshot();
      if (run.sim.observe().bankrupt) break;
    }
    const result = finish(run.sim, audit); rows.push({ seed, scenario, employeeId: run.employeeId, ...result });
    if (seed === 'career-3') writeFileSync(`${out}/${scenario}.save.json`, JSON.stringify(createSave(run.sim.snapshot())) + '\n');
    if (origin && ['career-stagnation', 'poor-manager', 'combined-moderate'].includes(scenario)) for (const intervention of interventions) {
      const sim = Simulation.restore(origin), audit = new RetentionAudit(7, [run.employeeId]); audit.sample(sim.snapshot());
      const commands = interventionCommands(sim, run.employeeId, intervention); for (const c of commands) sim.execute(c);
      // Matched external conditions: repeated instability continues equally in every branch.
      for (let t = 0; t < 728 && !sim.observe().bankrupt; t += 7) {
        for (const c of scenarioCommands(scenario, sim, run.employeeId, run.teamId)) sim.execute(c);
        sim.execute({ type: 'AdvanceTime', days: 7 }); audit.sample(sim.snapshot());
      }
      branches.push({ seed, scenario, employeeId: run.employeeId, intervention, originTick: origin.meta.tick,
        originHash: Simulation.restore(origin).stateHash(), interventionCommands: commands, originEmployee: origin.employees[run.employeeId], ...finish(sim, audit) });
    }
    console.log(`${seed} / ${scenario}: ${result.audit.funnel.resigned} resignations, max intent ${result.audit.people.find(e => e.id === run.employeeId)?.maxIntent}`);
  }
  writeFileSync(`${out}/controlled.json`, JSON.stringify({ simulationVersion: 3, runtimeMs: Math.round(performance.now() - start), failures, days, rows, branches }, null, 2) + '\n');
} else {
  const selected = process.argv.find(a => a.startsWith('--policies='))?.slice(11).split(',') ?? (days > 1826 ? ['conservative', 'management-first', 'career-development', 'lean'] : [...auditPolicies]);
  const rows = [];
  for (const policy of auditPolicies.filter(p => selected.includes(p))) {
    const policyStart = performance.now();
    for (let i = 1; i <= count; i++) {
      const seed = `benchmark-${String(i).padStart(3, '0')}`, sim = new Simulation({ seed, name: 'Garage Startup', scenario: 'garage' }, true, 3);
      const audit = new RetentionAudit(7, i === 1 ? ['employee-3'] : []); let world = sim.snapshot(); audit.sample(world);
      for (let tick = 0; tick < days && !world.company.bankrupt; tick += 7) {
        if (tick % 14 === 0) for (const command of retentionDecisions(policy, sim.observe())) sim.execute(command);
        sim.execute({ type: 'AdvanceTime', days: Math.min(7, days - tick) }); world = sim.snapshot(); audit.sample(world);
      }
      const result = finish(sim, audit); rows.push({ policy, seed, horizon: days, ...result });
      if (i === 1) writeFileSync(`${out}/${policy}-${days}.save.json`, JSON.stringify(createSave(sim.snapshot())) + '\n');
    }
    console.log(`${policy}: ${count} seeds / ${days} days in ${Math.round(performance.now() - policyStart)}ms`);
  }
  writeFileSync(`${out}/strategies-${days}.json`, JSON.stringify({ simulationVersion: 3, runtimeMs: Math.round(performance.now() - start), failures, seeds: count, days, policyInformation: 'CompanyView only; diagnostics never passed to decisions', rows }, null, 2) + '\n');
}
console.log(JSON.stringify({ failures, runtimeMs: Math.round(performance.now() - start) }));
if (failures) process.exitCode = 1;
