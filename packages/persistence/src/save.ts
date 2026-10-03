import { z } from 'zod';
import { worldSchema, type WorldState } from '../../domain/src/model';
import { hash } from '../../shared/src/determinism';
import { Simulation, validateHistory } from '../../simulation/src/simulation';
export const APP_VERSION = '0.2.0';
export const SAVE_SCHEMA_VERSION = 2;
const manifestSchema = z.object({ schemaVersion: z.union([z.literal(1), z.literal(2)]), appVersion: z.string(), seed: z.string(), tick: z.number().int().nonnegative(), date: z.string(), stateHash: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const saveSchema = z.object({ manifest: manifestSchema, world: worldSchema }).strict();
export type SaveEnvelope = z.infer<typeof saveSchema>;
export function createSave(world: WorldState): SaveEnvelope {
  Simulation.restore(world);
  return { manifest: { schemaVersion: SAVE_SCHEMA_VERSION, appVersion: APP_VERSION, seed: world.meta.seed, tick: world.meta.tick, date: world.meta.date, stateHash: hash(world) }, world: structuredClone(world) };
}
/** Explicit legacy envelope migration; world model version is independent. */
export function migrateSave(raw: unknown): unknown {
  const version = z.object({ manifest: z.object({ schemaVersion: z.number() }) }).parse(raw).manifest.schemaVersion;
  if (version === 1 || version === 2) return raw;
  if (version === 0) {
    const legacy = z.object({ manifest: z.object({ schemaVersion: z.literal(0), seed: z.string(), tick: z.number(), date: z.string(), stateHash: z.string() }), world: worldSchema }).parse(raw);
    return { ...legacy, manifest: { ...legacy.manifest, schemaVersion: 1, appVersion: '0.0.0' } };
  }
  throw new Error(`Unsupported save schema ${version}; supported version is ${SAVE_SCHEMA_VERSION}`);
}
export function validateSave(raw: unknown): SaveEnvelope {
  const save = saveSchema.parse(migrateSave(raw));
  const { world: w, manifest: m } = save;
  if (w.meta.simulationVersion === 3 && m.schemaVersion < 2) throw new Error('Simulation v3 requires save schema 2');
  if (m.seed !== w.meta.seed || m.tick !== w.meta.tick || m.date !== w.meta.date) throw new Error('Save metadata mismatch');
  if (hash(w) !== m.stateHash) throw new Error('Save integrity check failed (SHA-256 mismatch)');
  Simulation.restore(w); validateHistory(w);
  return save;
}
export interface SaveRepository {
  save(slot: string, envelope: SaveEnvelope): Promise<void>;
  load(slot: string): Promise<SaveEnvelope | null>;
}
