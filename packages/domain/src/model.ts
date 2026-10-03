import { z } from 'zod';

// Money is integer NT cents. Bounded attributes are [0,100], quantities rounded to 0.001.
const money = z.number().int().safe();
const positiveMoney = money.nonnegative();
const score = z.number().min(0).max(100);
const id = z.string().min(1).max(100);
export const roleSchema = z.enum(['CEO', 'CTO', 'Engineer', 'Designer', 'Sales', 'Operations']);
export const strategySchema = z.enum(['balanced', 'growth', 'sustainable']);
export const prioritySchema = z.enum(['features', 'quality', 'debt']);
export const skillsSchema = z.object({ engineering: score, product: score, sales: score, marketing: score, leadership: score, operations: score });
export const psychologySchema = z.object({ stress: score, satisfaction: score, loyalty: score, burnout: score, confidence: score, companyTrust: score, managerTrust: score, exitIntent: score });
export const memorySchema = z.object({ id, tick: z.number().int().nonnegative(), type: z.string(), eventId: id, importance: score, sentiment: z.number().min(-100).max(100), decayRate: z.number().min(0).max(1) });
export const careerSchema = z.object({
  level: z.enum(['Junior', 'Mid', 'Senior', 'Lead']), track: z.enum(['specialist', 'manager']),
  lastProgressAt: z.number().int().nonnegative(), lastConversationAt: z.number().int().nonnegative(), overloaded: z.boolean(),
  goals: z.array(z.object({ type: z.enum(['advancement', 'leadership', 'mastery', 'stability']), importance: score, progress: score, frustration: score, createdAt: z.number().int().nonnegative(), targetLevel: z.enum(['Junior', 'Mid', 'Senior', 'Lead']).nullable(), causes: z.array(z.object({ factor: z.string(), eventId: id.nullable() })).max(4) })).min(1).max(2)
});
export const employeeSchema = z.object({
  id, name: z.string().min(1).max(80), role: roleSchema,
  status: z.enum(['active', 'fired', 'resigned']), hiredAt: z.number().int().nonnegative(), leftAt: z.number().int().nonnegative().nullable(),
  salary: positiveMoney.max(100_000_000), teamId: id, managerId: id.nullable(),
  salaryHistory: z.array(z.object({ tick: z.number().int().nonnegative(), salary: positiveMoney.max(100_000_000) })).min(1),
  skills: skillsSchema,
  personality: z.object({ ambition: score, riskTolerance: score, sociability: score, loyalty: score }),
  psychology: psychologySchema,
  expectations: z.object({ salary: positiveMoney, careerGrowth: score }),
  goals: z.array(z.enum(['career', 'stability', 'craft'])).min(1),
  memories: z.array(memorySchema).max(24),
  performance: score, workTotal: z.number().nonnegative(), exitStage: z.enum(['settled', 'concerned', 'searching']),
  lastConcernAt: z.number().int().nonnegative(), lastManagementEvent: id.nullable(), career: careerSchema.optional()
});
export const teamSchema = z.object({ id, name: z.string().min(1).max(80), managerId: id.nullable(), organization: z.object({ stability: score, coordination: score, output: z.number().nonnegative(), lastChangeEvent: id.nullable(), condition: z.enum(['steady', 'strained']) }).optional() });
export const relationshipSchema = z.object({ id, sourceId: id, targetId: id, trust: score, respect: score, affinity: score, rivalry: score, resentment: score });
export const productSchema = z.object({ id, name: z.string(), progress: score, quality: score, technicalDebt: score, priority: prioritySchema, launchedAt: z.number().int().nonnegative().nullable(), lastMilestone: z.number().int().min(0).max(4) });
export const customerSchema = z.object({ id, name: z.string(), segment: z.enum(['small-business', 'enterprise']), mrr: positiveMoney, satisfaction: score, status: z.enum(['active', 'churned']), acquiredAt: z.number().int().nonnegative(), churnedAt: z.number().int().nonnegative().nullable() });
const scalar = z.union([z.string(), z.number().finite(), z.boolean(), z.null()]);
export const eventSchema = z.object({ id, tick: z.number().int().nonnegative(), date: z.string(), type: z.string(), payload: z.record(z.string(), scalar), causedBy: id.nullable(), causes: z.array(z.object({ factor: z.string(), weight: z.number().finite(), eventId: id.nullable() })), visibility: z.enum(['public', 'management', 'private']) });
export const monthlySchema = z.object({ month: z.string(), revenue: positiveMoney, payroll: positiveMoney, operatingCost: positiveMoney, cash: money });
export const configSchema = z.object({ seed: z.string().min(1).max(120), name: z.string().trim().min(1).max(80), scenario: z.literal('garage'), employeeCount: z.number().int().min(3).max(1000).default(3), initialCash: positiveMoney.max(10_000_000_000_000).default(50_000_000) }).strict();
export const commandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('CreateCompany'), config: configSchema }).strict(),
  z.object({ type: z.literal('AdvanceTime'), days: z.number().int().min(1).max(36525) }).strict(),
  z.object({ type: z.literal('HireEmployee'), name: z.string().trim().min(1).max(80), role: roleSchema.exclude(['CEO']), salary: positiveMoney.max(100_000_000), teamId: id }).strict(),
  z.object({ type: z.literal('FireEmployee'), employeeId: id }).strict(),
  z.object({ type: z.literal('ChangeSalary'), employeeId: id, salary: positiveMoney.max(100_000_000) }).strict(),
  z.object({ type: z.literal('CreateTeam'), name: z.string().trim().min(1).max(80), managerId: id.nullable() }).strict(),
  z.object({ type: z.literal('MoveEmployeeToTeam'), employeeId: id, teamId: id }).strict(),
  z.object({ type: z.literal('PromoteEmployee'), employeeId: id, track: z.enum(['specialist', 'manager']) }).strict(),
  z.object({ type: z.literal('AssignManager'), employeeId: id, managerId: id.nullable() }).strict(),
  z.object({ type: z.literal('AssignTeamManager'), teamId: id, managerId: id.nullable() }).strict(),
  z.object({ type: z.literal('ChangeEmployeeRole'), employeeId: id, role: roleSchema.exclude(['CEO', 'CTO']) }).strict(),
  z.object({ type: z.literal('ChangeCompanyStrategy'), strategy: strategySchema }).strict(),
  z.object({ type: z.literal('ChangeProductPriority'), priority: prioritySchema }).strict()
]);
export const commandRecordSchema = z.object({ id, tick: z.number().int().nonnegative(), command: commandSchema });
export const worldSchema = z.object({
  meta: z.object({ simulationVersion: z.union([z.literal(1), z.literal(2), z.literal(3)]), seed: z.string(), tick: z.number().int().nonnegative(), date: z.string(), startDate: z.literal('2026-01-01'), nextEntity: z.number().int().positive(), nextEvent: z.number().int().positive(), nextCommand: z.number().int().positive(), config: configSchema }),
  company: z.object({ id: z.literal('company-1'), name: z.string(), cash: money, debt: positiveMoney, strategy: strategySchema, workload: z.number().min(0.5).max(1.5), reputation: score, bankrupt: z.boolean(), monthlyOperatingCost: positiveMoney, strategyEventId: id.nullable() }),
  employees: z.record(z.string(), employeeSchema), teams: z.record(z.string(), teamSchema), products: z.record(z.string(), productSchema),
  customers: z.record(z.string(), customerSchema), relationships: z.record(z.string(), relationshipSchema),
  market: z.object({ demand: score }), finance: z.object({ history: z.array(monthlySchema) }), events: z.array(eventSchema), commands: z.array(commandRecordSchema)
}).strict();
export type Employee = z.infer<typeof employeeSchema>;
export type WorldState = z.infer<typeof worldSchema>;
export type DomainEvent = z.infer<typeof eventSchema>;
export type Command = z.infer<typeof commandSchema>;
export type CommandRecord = z.infer<typeof commandRecordSchema>;
export type ScenarioConfig = z.infer<typeof configSchema>;
export type ScenarioInput = z.input<typeof configSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Strategy = z.infer<typeof strategySchema>;
export type Priority = z.infer<typeof prioritySchema>;
