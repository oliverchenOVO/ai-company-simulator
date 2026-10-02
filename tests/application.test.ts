import { describe, expect, it } from 'vitest';
import { ApplicationSession } from '../packages/application/src/session';
import { validateSave, type SaveEnvelope, type SaveRepository } from '../packages/persistence/src/save';
import { canonical } from '../packages/shared/src/determinism';
import { Simulation } from '../packages/simulation/src/simulation';
class MemoryRepository implements SaveRepository {
  slots = new Map<string, SaveEnvelope>();
  fail = false;
  async save(slot: string, envelope: SaveEnvelope) { if (this.fail) throw new Error('disk full'); this.slots.set(slot, structuredClone(validateSave(envelope))); }
  async load(slot: string) { return structuredClone(this.slots.get(slot) ?? null); }
}
const config = { seed: 'app-seed', name: 'Garage Startup', scenario: 'garage' as const };
describe('application ownership, observation and durable commands', () => {
  it('autosaves commands and resumes independently of the renderer', async () => {
    const repo = new MemoryRepository(), session = new ApplicationSession(repo);
    expect((await session.handle({ action: 'status' })).view).toBeNull();
    await session.handle({ action: 'create', config }); await session.handle({ action: 'execute', command: { type: 'AdvanceTime', days: 7 } });
    const resumed = await new ApplicationSession(repo).handle({ action: 'status' }); expect(resumed.view?.tick).toBe(7);
    const replay = await session.handle({ action: 'replay' }); expect(replay.replay?.matches).toBe(true);
  });
  it('keeps manual checkpoint separate from autosave and handles storage failure atomically', async () => {
    const repo = new MemoryRepository(), session = new ApplicationSession(repo);
    await session.handle({ action: 'create', config }); await session.handle({ action: 'save' });
    await session.handle({ action: 'execute', command: { type: 'AdvanceTime', days: 10 } });
    repo.fail = true; await expect(session.handle({ action: 'execute', command: { type: 'AdvanceTime', days: 5 } })).rejects.toThrow('disk full');
    expect((await session.handle({ action: 'status' })).view?.tick).toBe(10);
    repo.fail = false; expect((await session.handle({ action: 'load', slot: 'manual' })).view?.tick).toBe(0);
  });
  it('excludes hidden truth/private events from all player projections and disables debug by default', async () => {
    const sim = new Simulation({ ...config, initialCash: 100_000_000_000 });
    sim.execute({ type: 'ChangeCompanyStrategy', strategy: 'growth' }); sim.execute({ type: 'ChangeSalary', employeeId: 'employee-2', salary: 0 }); sim.execute({ type: 'AdvanceTime', days: 200 });
    const projection = canonical(sim.observe());
    for (const hidden of ['exitIntent', 'loyalty', 'burnout', 'resentment', 'psychology']) expect(projection).not.toContain(`"${hidden}":`);
    expect(projection).not.toContain('EmployeeExploringOptions');
    const session = new ApplicationSession(new MemoryRepository()); await expect(session.handle({ action: 'debug' })).rejects.toThrow('disabled');
  });
  it('narration is deterministic, reflects source events and never changes state', () => {
    const sim = new Simulation(config), before = sim.stateHash();
    expect(sim.observe()).toEqual(sim.observe()); expect(sim.stateHash()).toBe(before);
    expect(sim.observe().events[0].title).toBe('公司成立'); expect(sim.observe().events[0].body).toContain('Garage Startup');
  });
  it('rejects unrecognized IPC arguments and non-contractual gameplay scenarios', async () => {
    const session = new ApplicationSession(new MemoryRepository());
    await expect(session.handle({ action: 'status', path: 'outside-workspace' })).rejects.toThrow();
    await expect(session.handle({ action: 'create', config: { ...config, employeeCount: 1000 } })).rejects.toThrow('三位');
  });
});
