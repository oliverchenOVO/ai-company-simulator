import type { Command } from '../../packages/domain/src/model';
import { Simulation } from '../../packages/simulation/src/simulation';
export const scenarioNames = ['career-stagnation', 'poor-manager', 'underpayment', 'team-instability', 'combined-moderate', 'combined-pressure', 'sustained-growth'] as const;
export type RetentionScenario = typeof scenarioNames[number];
export function controlledScenario(seed: string, scenario: RetentionScenario) {
  const sim = new Simulation({ seed, name: `Retention ${scenario}`, scenario: 'garage', initialCash: 10_000_000_000 }, true, 3);
  sim.execute({ type: 'ChangeCompanyStrategy', strategy: scenario === 'sustained-growth' ? 'growth' : ['team-instability', 'combined-moderate', 'combined-pressure'].includes(scenario) ? 'balanced' : 'sustainable' });
  sim.execute({ type: 'CreateTeam', name: 'Delivery', managerId: 'employee-2' });
  const teamId = Object.keys(sim.snapshot().teams)[1];
  const candidate = sim.observe().recruitment.find(c => c.role === 'Engineer')!;
  sim.execute({ type: 'HireEmployee', name: 'Retention colleague', role: 'Engineer', salary: ['underpayment', 'combined-moderate', 'combined-pressure'].includes(scenario) ? Math.ceil((candidate.minimum + candidate.expectation) / 2) : candidate.expectation, teamId });
  const employeeId = Object.values(sim.snapshot().employees).find(e => e.name === 'Retention colleague')!.id;
  if (scenario === 'career-stagnation' || scenario === 'underpayment' || scenario === 'sustained-growth') sim.execute({ type: 'AssignManager', employeeId, managerId: 'employee-1' });
  if (['poor-manager', 'combined-moderate', 'combined-pressure'].includes(scenario)) {
    // Hire the same focal identity first; additional reports create real load without editing hidden state.
    for (let i = 0; i < 9; i++) sim.execute({ type: 'HireEmployee', name: `Report ${i}`, role: 'Engineer', salary: 4_000_000, teamId: 'team-1' });
    for (const e of sim.observe().employees) if (e.role !== 'CEO' && e.id !== 'employee-2' && e.managerId !== 'employee-2') sim.execute({ type: 'AssignManager', employeeId: e.id, managerId: 'employee-2' });
  }
  return { sim, employeeId, teamId, scenario, seed };
}
export function scenarioCommands(scenario: RetentionScenario, sim: Simulation, employeeId: string, teamId: string): Command[] {
  const v = sim.observe(), e = v.employees.find(e => e.id === employeeId);
  if (!e || e.status !== 'active' || v.bankrupt || v.tick === 0) return [];
  if (scenario === 'combined-moderate') return v.tick % 28 === 0 ? [{ type: 'AssignManager', employeeId, managerId: e.managerId === 'employee-2' ? 'employee-3' : 'employee-2' }] : [];
  if (v.tick % 14 !== 0 || !['team-instability', 'combined-pressure'].includes(scenario)) return [];
  const destination = e.teamId === 'team-1' ? teamId : 'team-1';
  return [{ type: 'MoveEmployeeToTeam', employeeId, teamId: destination }];
}
export const interventions = ['ignore', 'salary', 'promotion', 'manager', 'transfer', 'management-promotion'] as const;
export type Intervention = typeof interventions[number];
export function interventionCommands(sim: Simulation, employeeId: string, intervention: Intervention): Command[] {
  const e = sim.observe().employees.find(e => e.id === employeeId)!;
  if (e.status !== 'active' || sim.observe().bankrupt) return [];
  if (intervention === 'salary') return [{ type: 'ChangeSalary', employeeId, salary: Math.round(e.expectedSalary * 1.1) }];
  if (intervention === 'promotion' || intervention === 'management-promotion') return e.organization!.readiness.eligible ? [{ type: 'PromoteEmployee', employeeId, track: intervention === 'promotion' ? 'specialist' : 'manager' }] : [];
  if (intervention === 'manager') return e.managerId !== 'employee-1' ? [{ type: 'AssignManager', employeeId, managerId: 'employee-1' }] : [];
  if (intervention === 'transfer') return e.teamId !== 'team-1' ? [{ type: 'MoveEmployeeToTeam', employeeId, teamId: 'team-1' }] : [];
  return [];
}
