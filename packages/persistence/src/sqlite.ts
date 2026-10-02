import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createRequire } from 'node:module';
import { validateSave, type SaveEnvelope, type SaveRepository } from './save';

export class SqliteRepository implements SaveRepository {
  private constructor(private db: Database, private readonly file: string, private readonly SQL: SqlJsStatic) {}
  static async open(file: string, wasmPath?: string): Promise<SqliteRepository> {
    const resolvedWasm = wasmPath ?? createRequire(import.meta.url).resolve('sql.js/dist/sql-wasm.wasm');
    const SQL = await initSqlJs({ locateFile: () => resolvedWasm });
    const db = existsSync(file) ? new SQL.Database(readFileSync(file)) : new SQL.Database();
    db.run('PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS saves (slot TEXT PRIMARY KEY, manifest TEXT NOT NULL, snapshot TEXT NOT NULL); CREATE TABLE IF NOT EXISTS commands (slot TEXT NOT NULL REFERENCES saves(slot) ON DELETE CASCADE, sequence INTEGER NOT NULL, record TEXT NOT NULL, PRIMARY KEY(slot,sequence)); CREATE TABLE IF NOT EXISTS events (slot TEXT NOT NULL REFERENCES saves(slot) ON DELETE CASCADE, sequence INTEGER NOT NULL, record TEXT NOT NULL, PRIMARY KEY(slot,sequence));');
    return new SqliteRepository(db, file, SQL);
  }
  async save(slot: string, envelope: SaveEnvelope): Promise<void> {
    const validated = validateSave(envelope);
    const { commands, events, ...snapshot } = validated.world;
    const backup = this.db.export();
    try {
      this.db.run('PRAGMA foreign_keys=ON');
      this.db.run('BEGIN TRANSACTION');
      this.db.run('DELETE FROM commands WHERE slot=?', [slot]);
      this.db.run('DELETE FROM events WHERE slot=?', [slot]);
      this.db.run('DELETE FROM saves WHERE slot=?', [slot]);
      this.db.run('INSERT INTO saves VALUES (?,?,?)', [slot, JSON.stringify(validated.manifest), JSON.stringify(snapshot)]);
      for (const [i, record] of commands.entries()) this.db.run('INSERT INTO commands VALUES (?,?,?)', [slot, i, JSON.stringify(record)]);
      for (const [i, event] of events.entries()) this.db.run('INSERT INTO events VALUES (?,?,?)', [slot, i, JSON.stringify(event)]);
      this.db.run('COMMIT');
      mkdirSync(dirname(this.file), { recursive: true });
      // Same-directory replacement means a failed write does not destroy the previous save.
      writeFileSync(`${this.file}.tmp`, this.db.export());
      renameSync(`${this.file}.tmp`, this.file);
    } catch (error) {
      try { this.db.run('ROLLBACK'); } catch { /* COMMIT may have succeeded; restore the pre-save image below. */ }
      this.db.close(); this.db = new this.SQL.Database(backup); this.db.run('PRAGMA foreign_keys=ON');
      throw error;
    }
  }
  async load(slot: string): Promise<SaveEnvelope | null> {
    const statement = this.db.prepare('SELECT manifest,snapshot FROM saves WHERE slot=?');
    try {
      statement.bind([slot]); if (!statement.step()) return null;
      const row = statement.getAsObject();
      const records = (table: 'commands' | 'events') => this.db.exec(`SELECT record FROM ${table} WHERE slot=$slot ORDER BY sequence`, { $slot: slot })[0]?.values.map(v => JSON.parse(String(v[0]))) ?? [];
      return validateSave({ manifest: JSON.parse(String(row.manifest)), world: { ...JSON.parse(String(row.snapshot)), commands: records('commands'), events: records('events') } });
    } finally { statement.free(); }
  }
  close(): void { this.db.close(); }
}
