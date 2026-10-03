import { commandSchema, configSchema, worldSchema, type Command, type DomainEvent, type ScenarioInput, type WorldState } from '../../domain/src/model';
import { hash, simDate } from '../../shared/src/determinism';
import { detachManager, remember, type SystemContext } from './context';
import { assertInvariants } from './invariants';
import { garageScenario, makeEmployee } from './scenario';
import { candidateFor, minimumCompensation } from './compensation';
import { activeEmployees, SYSTEMS } from './systems';
import { projectCompany, type CompanyView } from './projection';

export class Simulation {
  private w: WorldState;
  constructor(config: ScenarioInput, private readonly validateEachTick = true, simulationVersion: 1 | 2 = 2) {
    this.w = garageScenario(configSchema.parse(config), simulationVersion);
    assertInvariants(this.w);
  }
  static restore(input: unknown, validateEachTick = true): Simulation {
    const w = worldSchema.parse(input);
    assertInvariants(w);
    validateHistory(w);
    const sim = new Simulation(w.meta.config, validateEachTick, w.meta.simulationVersion);
    sim.w = w;
    return sim;
  }
  /** All API results are detached; callers never hold authoritative references. */
  snapshot(): WorldState { return structuredClone(this.w); }
  stateHash(): string { return hash(this.w); }
  observe(): CompanyView { return projectCompany(this.w); }
  execute(input: Command | unknown): void {
    const command = commandSchema.parse(input);
    if (command.type === 'CreateCompany') throw new Error('CreateCompany is only valid as the initial scenario command');
    if (this.w.company.bankrupt && command.type !== 'AdvanceTime') throw new Error('公司已停止營運，請建立新公司或載入存檔');
    this.validateCommand(command);
    const before = structuredClone(this.w);
    const commandId = `command-${this.w.meta.nextCommand++}`;
    this.w.commands.push({ id: commandId, tick: this.w.meta.tick, command });
    const emit: SystemContext['emit'] = (type, payload, causedBy = commandId, causes = [], visibility = 'public') => {
      const event: DomainEvent = { id: `event-${this.w.meta.nextEvent++}`, tick: this.w.meta.tick, date: this.w.meta.date, type, payload: { ...payload }, causedBy, causes: structuredClone(causes), visibility };
      this.w.events.push(event); return event;
    };
    try {
      switch (command.type) {
        case 'AdvanceTime': this.advance(command.days, commandId, emit); break;
        case 'HireEmployee': {
          const candidate = this.w.meta.simulationVersion === 2 ? candidateFor(this.w, command.role, command.name, command.teamId) : null;
          const id = `employee-${this.w.meta.nextEntity++}`;
          if (candidate && command.salary < candidate.minimum) {
            emit('HireOfferRejected', { candidateId: id, name: command.name, role: command.role, salary: command.salary, expectation: candidate.expectation, minimum: candidate.minimum });
            break;
          }
          const managerId = this.w.teams[command.teamId].managerId;
          const employee = makeEmployee(this.w.meta.seed, id, command.name, command.role, command.salary, command.teamId, this.w.meta.tick, managerId);
          if (candidate) employee.expectations.salary = candidate.expectation;
          this.w.employees[id] = employee;
          const colleague = activeEmployees(this.w).find(e => e.id !== id && e.teamId === command.teamId);
          if (colleague) for (const [sourceId, targetId] of [[id, colleague.id], [colleague.id, id]]) {
            const rid = `${sourceId}>${targetId}`;
            this.w.relationships[rid] = { id: rid, sourceId, targetId, trust: 55, respect: 55, affinity: 45, rivalry: 5, resentment: 0 };
          }
          const event = emit('EmployeeHired', { employeeId: id, name: employee.name, role: employee.role, salary: employee.salary });
          remember(this.w, employee, event, 30); break;
        }
        case 'FireEmployee': {
          const employee = this.w.employees[command.employeeId];
          employee.status = 'fired'; employee.leftAt = this.w.meta.tick; detachManager(this.w, employee.id);
          const event = emit('EmployeeFired', { employeeId: employee.id, name: employee.name });
          remember(this.w, employee, event, -90, 95); break;
        }
        case 'ChangeSalary': {
          const e = this.w.employees[command.employeeId], previous = e.salary;
          if(this.w.meta.simulationVersion===2 && e.role!=='CEO' && command.salary<previous) {
            const minimum=minimumCompensation(e.expectations.salary,e.personality.riskTolerance);
            if(command.salary<minimum) {
              emit('SalaryOfferRejected',{employeeId:e.id,name:e.name,salary:command.salary,previous,expectation:e.expectations.salary,minimum});
              break;
            }
          }
          e.salary = command.salary;
          if (e.salaryHistory.at(-1)?.tick === this.w.meta.tick) e.salaryHistory[e.salaryHistory.length - 1].salary = command.salary;
          else e.salaryHistory.push({ tick: this.w.meta.tick, salary: command.salary });
          const event = emit('SalaryChanged', { employeeId: e.id, name: e.name, previous, salary: e.salary });
          e.lastManagementEvent = event.id;
          remember(this.w, e, event, command.salary >= previous ? 25 : -60, command.salary >= previous ? 40 : 85); break;
        }
        case 'CreateTeam': {
          const id = `team-${this.w.meta.nextEntity++}`;
          this.w.teams[id] = { id, name: command.name, managerId: command.managerId };
          emit('TeamCreated', { teamId: id, name: command.name, managerId: command.managerId }); break;
        }
        case 'MoveEmployeeToTeam': {
          const e = this.w.employees[command.employeeId]; e.teamId = command.teamId;
          const manager = this.w.teams[command.teamId].managerId;
          e.managerId = manager === e.id ? null : manager;
          const event = emit('EmployeeMoved', { employeeId: e.id, name: e.name, teamId: e.teamId });
          e.lastManagementEvent = event.id; remember(this.w, e, event, -5, 30); break;
        }
        case 'ChangeCompanyStrategy': {
          this.w.company.strategy = command.strategy;
          this.w.company.workload = { balanced: 1, growth: 1.4, sustainable: 0.8 }[command.strategy];
          const event = emit('StrategyChanged', { strategy: command.strategy, workload: this.w.company.workload });
          this.w.company.strategyEventId = event.id; break;
        }
        case 'ChangeProductPriority': {
          this.w.products['product-1'].priority = command.priority;
          emit('ProductPriorityChanged', { productId: 'product-1', priority: command.priority }); break;
        }
      }
      assertInvariants(this.w, before.meta.tick);
    } catch (error) {
      this.w = before;
      throw new Error(`Command ${command.type} failed seed=${before.meta.seed} tick=${before.meta.tick}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
  }
  private validateCommand(command: Exclude<Command, { type: 'CreateCompany' }>): void {
    if ('employeeId' in command) {
      const e = this.w.employees[command.employeeId];
      if (!e || e.status !== 'active') throw new Error('找不到在職員工');
      if (command.type === 'FireEmployee' && e.role === 'CEO') throw new Error('創辦人 CEO 不能解僱自己');
    }
    if ('teamId' in command && !this.w.teams[command.teamId]) throw new Error('找不到團隊');
    if (command.type === 'HireEmployee' && activeEmployees(this.w).length >= 1000) throw new Error('Phase 1 上限為 1,000 位在職員工');
    if (command.type === 'CreateTeam' && command.managerId !== null && this.w.employees[command.managerId]?.status !== 'active') throw new Error('主管必須是在職員工');
    if (command.type === 'MoveEmployeeToTeam') {
      const manager = this.w.teams[command.teamId].managerId;
      let cursor = manager;
      const visited = new Set<string>();
      while (cursor && cursor !== command.employeeId) {
        if (visited.has(cursor)) throw new Error('主管關係不能成環');
        visited.add(cursor); cursor = this.w.employees[cursor].managerId;
      }
      if (cursor === command.employeeId && manager !== command.employeeId) throw new Error('主管關係不能成環');
    }
  }
  private advance(days: number, commandId: string, emit: SystemContext['emit']): void {
    for (let i = 0; i < days; i++) {
      const previous = this.w.meta.tick;
      this.w.meta.tick++; this.w.meta.date = simDate(this.w.meta.tick, this.w.meta.startDate);
      if (this.w.company.bankrupt) continue;
      const ctx: SystemContext = { w: this.w, active: activeEmployees(this.w), commandId, emit };
      for (const system of SYSTEMS) {
        if (system.frequency === 'weekly' && this.w.meta.tick % 7) continue;
        try { system.run(ctx); }
        catch (error) { throw new Error(`System=${system.name} seed=${this.w.meta.seed} tick=${this.w.meta.tick}: ${String(error)}`, { cause: error }); }
      }
      if (this.validateEachTick) assertInvariants(this.w, previous);
    }
  }
}

export function validateHistory(w: WorldState): void {
  const known = new Set<string>();
  if (w.meta.seed !== w.meta.config.seed || w.company.name !== w.meta.config.name) throw new Error('Scenario metadata mismatch');
  if (w.commands[0]?.command.type !== 'CreateCompany' || hash(w.commands[0].command.config) !== hash(w.meta.config)) throw new Error('Invalid initial command');
  let tick = 0;
  for (let i = 0; i < w.commands.length; i++) {
    const record = w.commands[i];
    if (record.id !== `command-${i + 1}` || record.tick !== tick || (i > 0 && record.command.type === 'CreateCompany')) throw new Error('Invalid command sequence');
    known.add(record.id);
    if (record.command.type === 'AdvanceTime') tick += record.command.days;
  }
  if (tick !== w.meta.tick || w.meta.nextCommand !== w.commands.length + 1) throw new Error('Command/tick mismatch');
  let lastEventTick = 0;
  for (let i = 0; i < w.events.length; i++) {
    const e = w.events[i];
    if (e.id !== `event-${i + 1}` || e.tick < lastEventTick || e.tick > w.meta.tick || e.date !== simDate(e.tick)) throw new Error('Invalid event sequence');
    if (e.causedBy && !known.has(e.causedBy)) throw new Error('Missing causal reference');
    for (const cause of e.causes) if (cause.eventId && !known.has(cause.eventId)) throw new Error('Missing contributing cause');
    known.add(e.id); lastEventTick = e.tick;
  }
  if (w.meta.nextEvent !== w.events.length + 1) throw new Error('Event counter mismatch');
  for (const e of Object.values(w.employees)) for (const m of e.memories) if (!known.has(m.eventId)) throw new Error('Missing employee memory event');
}

export function replay(world: WorldState): Simulation {
  validateHistory(world);
  const sim = new Simulation(world.meta.config, true, world.meta.simulationVersion);
  for (const record of world.commands.slice(1)) sim.execute(record.command);
  return sim;
}
