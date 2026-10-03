import type { Employee, Role, ScenarioInput, WorldState } from '../../domain/src/model';
import { configSchema } from '../../domain/src/model';
import { initializeOrganization } from './organization';
import { random } from '../../shared/src/determinism';

export function makeEmployee(seed: string, id: string, name: string, role: Role, salary: number, teamId: string, tick: number, managerId: string | null): Employee {
  const rng = random(seed, 'identity', id);
  const skills = { engineering: rng.int(15, 45), product: rng.int(15, 45), sales: rng.int(15, 45), marketing: rng.int(15, 45), leadership: rng.int(15, 45), operations: rng.int(15, 45) };
  if (role === 'Engineer' || role === 'CTO') skills.engineering = rng.int(65, 90);
  if (role === 'Designer') skills.product = rng.int(65, 90);
  if (role === 'Sales') skills.sales = rng.int(65, 90);
  if (role === 'Operations') skills.operations = rng.int(65, 90);
  if (role === 'CEO') { skills.leadership = 80; skills.sales = 65; }
  return { id, name, role, status: 'active', hiredAt: tick, leftAt: null, salary, salaryHistory: [{ tick, salary }], teamId, managerId, skills,
    personality: { ambition: rng.int(25, 85), riskTolerance: rng.int(25, 85), sociability: rng.int(25, 85), loyalty: rng.int(40, 90) },
    psychology: { stress: 15, satisfaction: 75, loyalty: 75, burnout: 0, confidence: 70, companyTrust: 75, managerTrust: 75, exitIntent: 0 },
    expectations: { salary: salary || 3_000_000, careerGrowth: rng.int(30, 80) }, goals: ['craft', 'stability'], memories: [], performance: 70, workTotal: 0, exitStage: 'settled', lastConcernAt: tick, lastManagementEvent: null
  };
}
export function garageScenario(input: ScenarioInput, simulationVersion: 1 | 2 | 3 = 3): WorldState {
  if(simulationVersion!==1&&simulationVersion!==2&&simulationVersion!==3)throw new Error('Unsupported simulation behavior version');
  const config = configSchema.parse(input);
  const world: WorldState = {
    meta: { simulationVersion, seed: config.seed, tick: 0, date: '2026-01-01', startDate: '2026-01-01', nextEntity: config.employeeCount + 1, nextEvent: 2, nextCommand: 2, config },
    company: { id: 'company-1', name: config.name, cash: config.initialCash, debt: 0, strategy: 'balanced', workload: 1, reputation: 45, bankrupt: false, monthlyOperatingCost: 1_000_000, strategyEventId: null },
    employees: {}, teams: { 'team-1': { id: 'team-1', name: '創始團隊', managerId: 'employee-1' } },
    products: { 'product-1': { id: 'product-1', name: 'Atlas', progress: 0, quality: 55, technicalDebt: 5, priority: 'features', launchedAt: null, lastMilestone: 0 } },
    customers: {}, relationships: {}, market: { demand: 60 }, finance: { history: [] },
    events: [{ id: 'event-1', tick: 0, date: '2026-01-01', type: 'CompanyCreated', payload: { name: config.name }, causedBy: 'command-1', causes: [], visibility: 'public' }],
    commands: [{ id: 'command-1', tick: 0, command: { type: 'CreateCompany', config } }]
  };
  const names = ['Alice Chen', 'Bob Lin', 'Carol Wu'];
  const roles: Role[] = ['CEO', 'CTO', 'Engineer'];
  const salaries = [2_500_000, 4_000_000, 3_000_000];
  for (let i = 0; i < config.employeeCount; i++) {
    const eid = `employee-${i + 1}`;
    world.employees[eid] = makeEmployee(config.seed, eid, names[i] ?? `Employee ${i + 1}`, roles[i] ?? 'Engineer', salaries[i] ?? 3_000_000, 'team-1', 0, i ? 'employee-1' : null);
  }
  // Directed sparse graph: bounded degree, stable adjacent colleague links, O(N) storage.
  const ids = Object.keys(world.employees).sort();
  for (let i = 0; i < ids.length; i++) {
    const sourceId = ids[i], targetId = ids[(i + 1) % ids.length];
    const rid = `${sourceId}>${targetId}`;
    world.relationships[rid] = { id: rid, sourceId, targetId, trust: 65, respect: 65, affinity: 60, rivalry: 5, resentment: 0 };
  }
  if (simulationVersion === 3) initializeOrganization(world);
  return world;
}
