import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

/** Canonical object keys; domain entity collections are keyed by stable IDs. Array order is semantic. */
export function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Non-finite value');
    if (value === undefined) throw new Error('Undefined is not canonical state');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${canonical(record[key])}`).join(',')}}`;
}
export const hash = (value: unknown): string => bytesToHex(sha256(new TextEncoder().encode(canonical(value))));

export interface RandomSource {
  next(): number;
  int(min: number, max: number): number;
  chance(probability: number): boolean;
  pick<T>(items: readonly T[]): T;
}

/** A stream is derived from a length-delimited context, independent of other systems. */
export function random(seed: string, ...context: (string | number)[]): RandomSource {
  const digest = sha256(new TextEncoder().encode(canonical([seed, ...context])));
  let state = new DataView(digest.buffer, digest.byteOffset, digest.byteLength).getUint32(0, true);
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  return { next,
    int(min, max) {
      if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) throw new Error('Invalid RNG bounds');
      return min + Math.floor(next() * (max - min + 1));
    },
    chance(p) { if (!Number.isFinite(p) || p < 0 || p > 1) throw new Error('Invalid probability'); return next() < p; },
    pick<T>(items: readonly T[]) { if (!items.length) throw new Error('Empty random selection'); return items[Math.floor(next() * items.length)]; }
  };
}
export const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
export const rounded = (n: number) => Math.round(n * 1000) / 1000;
export const simDate = (tick: number, startDate = '2026-01-01') => new Date(Date.parse(`${startDate}T00:00:00Z`) + tick * 86400000).toISOString().slice(0, 10);
