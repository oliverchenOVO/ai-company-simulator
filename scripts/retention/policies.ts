import type { Command } from '../../packages/domain/src/model';
import type { CompanyView } from '../../packages/simulation/src/projection';
import { decisions, strategies, type Policy } from '../gameplay/policies';
export const retentionPolicies = ['ignore-concerns', 'salary-only', 'promotion-first', 'manager-first', 'balanced-retention'] as const;
export type RetentionPolicy = typeof retentionPolicies[number];
export const auditPolicies = [...strategies, ...retentionPolicies];
export function retentionDecisions(policy: Policy | RetentionPolicy, view: CompanyView): Command[] {
  if ((strategies as readonly string[]).includes(policy)) return decisions(policy as Policy, view);
  const result = decisions('conservative', view);
  if (view.bankrupt || view.simulationVersion !== 3 || policy === 'ignore-concerns') return result;
  const removed = new Set(result.filter(c => c.type === 'FireEmployee').map(c => c.employeeId));
  const active = view.employees.filter(e => e.status === 'active' && e.role !== 'CEO' && !removed.has(e.id));
  const concern = active.find(e => e.organization && (e.organization.careerStatus === '希望討論成長安排' || e.organization.careerStatus === '職涯期待持續未解' || e.organization.retention !== '暫無明顯留任警訊' || e.condition !== '狀態穩定'));
  if (!concern || (view.finance.runway ?? Infinity) < 6) return result;
  const raise = () => {
    if (concern.salary < concern.expectedSalary) result.push({ type: 'ChangeSalary', employeeId: concern.id, salary: concern.expectedSalary });
  };
  const promote = () => {
    const org = concern.organization!;
    if (org.readiness.eligible && (org.careerStatus === '希望討論成長安排' || org.careerStatus === '職涯期待持續未解')) {
      const track = org.direction === '希望帶領與支持團隊' ? 'manager' : 'specialist';
      result.push({ type: 'PromoteEmployee', employeeId: concern.id, track });
    }
  };
  const arrange = () => {
    if (concern.organization?.managerSupport !== '支持不足') return;
    const manager = view.employees.find(e => e.status === 'active' && e.role === 'CEO' && e.id !== concern.managerId && !removed.has(e.id));
    if (manager && manager.organization?.managementLoad !== '管理負荷偏高') result.push({ type: 'AssignManager', employeeId: concern.id, managerId: manager.id });
  };
  if (policy === 'salary-only') raise();
  if (policy === 'promotion-first') promote();
  if (policy === 'manager-first') arrange();
  if (policy === 'balanced-retention') { raise(); arrange(); promote(); }
  return result;
}
