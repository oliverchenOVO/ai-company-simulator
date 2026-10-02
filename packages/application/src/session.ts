import { z } from 'zod';
import { commandSchema, configSchema } from '../../domain/src/model';
import { createSave, validateSave, type SaveEnvelope, type SaveRepository } from '../../persistence/src/save';
import { Simulation, replay } from '../../simulation/src/simulation';
import type { CompanyView } from '../../simulation/src/projection';
import { invariantViolations } from '../../simulation/src/invariants';
export const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('status') }).strict(),
  z.object({ action: z.literal('create'), config: configSchema }).strict(),
  z.object({ action: z.literal('execute'), command: commandSchema }).strict(),
  z.object({ action: z.literal('save') }).strict(),
  z.object({ action: z.literal('load'), slot: z.enum(['autosave', 'manual']) }).strict(),
  z.object({ action: z.literal('replay') }).strict(),
  z.object({ action: z.literal('export') }).strict(),
  z.object({ action: z.literal('import'), data: z.unknown() }).strict(),
  z.object({ action: z.literal('debug') }).strict()
]);
export type SessionRequest = z.input<typeof requestSchema>;
export interface SessionResponse {
  view: CompanyView | null;
  notice?: string;
  exported?: SaveEnvelope;
  replay?: { hash: string; matches: boolean };
  debug?: { seed: string; tick: number; hash: string; invariants: string[]; employees: unknown[] };
}
export interface RpcResult { id: number; result?: SessionResponse; error?: string; }

/** Single-owner application state; save durability is part of accepting a player command. */
export class ApplicationSession {
  private sim: Simulation | null = null;
  constructor(private readonly repository: SaveRepository, private readonly debugEnabled = false) {}
  async handle(raw: unknown): Promise<SessionResponse> {
    const request = requestSchema.parse(raw);
    let extra: Omit<SessionResponse, 'view'> = {};
    switch (request.action) {
      case 'status': {
        if (!this.sim) { const saved = await this.repository.load('autosave'); if (saved) this.sim = Simulation.restore(saved.world); }
        break;
      }
      case 'create': {
        // Gameplay always begins with the contractual Garage Startup scenario.
        if (request.config.employeeCount !== 3 || request.config.initialCash !== 50_000_000) throw new Error('一般遊戲必須從三位員工與 NT$500,000 開始');
        const candidate = new Simulation(request.config); await this.repository.save('autosave', createSave(candidate.snapshot())); this.sim = candidate;
        extra = { notice: '新公司已成立，進度會自動儲存。' }; break;
      }
      case 'execute': {
        const candidate = Simulation.restore(this.requireSim().snapshot());
        candidate.execute(request.command); await this.repository.save('autosave', createSave(candidate.snapshot())); this.sim = candidate; break;
      }
      case 'save': await this.repository.save('manual', createSave(this.requireSim().snapshot())); extra = { notice: '手動存檔已保存，可在設定頁載入。' }; break;
      case 'load': {
        const saved = await this.repository.load(request.slot); if (!saved) throw new Error('尚未建立這個存檔');
        const candidate = Simulation.restore(saved.world); await this.repository.save('autosave', saved); this.sim = candidate;
        extra = { notice: '已恢復存檔。' }; break;
      }
      case 'replay': {
        const original = this.requireSim(), played = replay(original.snapshot()), matches = played.stateHash() === original.stateHash();
        if (!matches) throw new Error('Replay 驗證失敗：世界狀態不一致');
        extra = { replay: { hash: played.stateHash(), matches }, notice: 'Replay 驗證通過，狀態 hash 完全一致。' }; break;
      }
      case 'export': extra = { exported: createSave(this.requireSim().snapshot()), notice: '已匯出可攜式存檔。' }; break;
      case 'import': {
        const saved = validateSave(request.data), candidate = Simulation.restore(saved.world);
        if (replay(saved.world).stateHash() !== candidate.stateHash()) throw new Error('匯入存檔的 replay 驗證失敗');
        await this.repository.save('autosave', saved); this.sim = candidate; extra = { notice: '存檔已驗證並匯入。' }; break;
      }
      case 'debug': {
        if (!this.debugEnabled) throw new Error('Simulation debug tooling is disabled');
        const sim = this.requireSim(), w = sim.snapshot();
        extra = { debug: { seed: w.meta.seed, tick: w.meta.tick, hash: sim.stateHash(), invariants: invariantViolations(w), employees: Object.values(w.employees).map(e => ({ id: e.id, psychology: e.psychology })) } }; break;
      }
    }
    return { view: this.sim?.observe() ?? null, ...extra };
  }
  private requireSim(): Simulation { if (!this.sim) throw new Error('請先建立或載入公司'); return this.sim; }
}
