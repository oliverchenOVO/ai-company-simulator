import type { Employee, Role, WorldState } from '../../domain/src/model';
import { makeEmployee } from './scenario';

const anchors: Record<Role, number> = { CEO: 2_500_000, CTO: 4_000_000, Engineer: 3_000_000, Designer: 3_000_000, Sales: 3_000_000, Operations: 2_800_000 };
const roundedRatio = (amount: number, numerator: number, denominator: number) => Number((BigInt(amount) * BigInt(numerator) + BigInt(denominator / 2)) / BigInt(denominator));
export function compensationTerms(employee: Pick<Employee, 'role' | 'skills' | 'personality'>) {
  const { role, skills, personality } = employee;
  const skill = role === 'Designer' ? skills.product : role === 'Sales' ? skills.sales : role === 'CEO' ? skills.leadership : role === 'Operations' ? skills.operations : skills.engineering;
  const skillAdjusted = roundedRatio(anchors[role], 8_000 + Math.round(skill * 40), 10_000);
  const expectation = roundedRatio(skillAdjusted, 9_500 + Math.round(personality.ambition * 10), 10_000);
  const tolerance = 9_500 - Math.round(personality.riskTolerance * 10);
  const minimum = Number((BigInt(expectation) * BigInt(tolerance) + 9_999n) / 10_000n);
  return { expectation, minimum, skill };
}
export function candidateFor(w: WorldState, role: Exclude<Role, 'CEO'>, name = 'Candidate', teamId = 'team-1') {
  const employee = makeEmployee(w.meta.seed, `employee-${w.meta.nextEntity}`, name, role, 0, teamId, w.meta.tick, null);
  return { id: employee.id, role, ...compensationTerms(employee) };
}
export function recruitmentCandidates(w: WorldState) {
  if (w.meta.simulationVersion === 1) return [];
  return (['CTO', 'Engineer', 'Designer', 'Sales', 'Operations'] as const).map(role => candidateFor(w, role));
}
