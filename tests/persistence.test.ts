import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSave, validateSave } from '../packages/persistence/src/save';
import { SqliteRepository } from '../packages/persistence/src/sqlite';
import { Simulation, replay } from '../packages/simulation/src/simulation';
const dirs: string[] = [];
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });
function run() { const sim = new Simulation({ name: 'Saved Company', seed: 'save-001', scenario: 'garage' },true,2); sim.execute({ type: 'AdvanceTime', days: 20 }); return sim; }
describe('versioned saves', () => {
  it('restores exact hash and continues identically', () => {
    const sim = run(), save = createSave(sim.snapshot()), restored = Simulation.restore(validateSave(JSON.parse(JSON.stringify(save))).world);
    expect(restored.stateHash()).toBe(sim.stateHash());
    sim.execute({ type: 'AdvanceTime', days: 40 }); restored.execute({ type: 'AdvanceTime', days: 40 }); expect(restored.stateHash()).toBe(sim.stateHash());
    expect(replay(restored.snapshot()).stateHash()).toBe(sim.stateHash());
  });
  it('rejects corrupted snapshots, metadata and unsupported future versions', () => {
    const save = createSave(run().snapshot());
    expect(() => validateSave({ ...save, manifest: { ...save.manifest, seed: 'different' } })).toThrow('metadata');
    const modified = structuredClone(save); modified.world.company.cash++;
    expect(() => validateSave(modified)).toThrow('SHA-256');
    expect(() => validateSave({ ...save, manifest: { ...save.manifest, schemaVersion: 100 } })).toThrow('Unsupported');
    expect(() => validateSave({ manifest: {} })).toThrow();
  });
  it('migrates the explicitly supported v0 envelope without changing world truth', () => {
    const save = createSave(run().snapshot());
    const legacy = { world: save.world, manifest: { schemaVersion: 0, seed: save.manifest.seed, tick: save.manifest.tick, date: save.manifest.date, stateHash: save.manifest.stateHash } };
    const migrated = validateSave(legacy); expect(migrated.manifest.schemaVersion).toBe(1); expect(migrated.manifest.stateHash).toBe(save.manifest.stateHash);
  });
  it('writes real SQLite, persists across repository instances and isolates slots', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'foundry-')); dirs.push(dir); const file = join(dir, 'game.sqlite');
    const first = run(), second = new Simulation({ name: 'Independent', seed: 'save-002', scenario: 'garage' });
    const repo = await SqliteRepository.open(file);
    await repo.save('alice', createSave(first.snapshot())); await repo.save('bob', createSave(second.snapshot())); repo.close();
    expect(readFileSync(file).subarray(0, 15).toString()).toBe('SQLite format 3');
    const reopened = await SqliteRepository.open(file);
    expect((await reopened.load('alice'))?.manifest.stateHash).toBe(first.stateHash()); expect((await reopened.load('bob'))?.manifest.stateHash).toBe(second.stateHash());
    expect(await reopened.load('absent')).toBeNull();
    first.execute({ type: 'AdvanceTime', days: 10 }); await reopened.save('alice', createSave(first.snapshot()));
    expect((await reopened.load('bob'))?.manifest.stateHash).toBe(second.stateHash());
    const corrupt = createSave(first.snapshot()); corrupt.world.company.cash++;
    await expect(reopened.save('alice', corrupt)).rejects.toThrow(); expect((await reopened.load('alice'))?.manifest.stateHash).toBe(first.stateHash()); reopened.close();
  });
});
