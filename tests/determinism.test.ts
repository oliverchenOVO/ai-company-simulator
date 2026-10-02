import { describe, expect, it } from 'vitest';
import { canonical, hash, random, simDate } from '../packages/shared/src/determinism';
describe('deterministic primitives', () => {
  it('repeats a named stream and isolates unrelated draws', () => {
    const a = random('seed', 'employees', 'e1', 4, 'work');
    const b = random('seed', 'employees', 'e1', 4, 'work');
    random('seed', 'market').next();
    expect(Array.from({ length: 100 }, () => a.next())).toEqual(Array.from({ length: 100 }, () => b.next()));
    expect(random('seed', 'e1').next()).not.toBe(random('seed', 'e2').next());
  });
  it('canonicalizes keys, preserves semantic array order, rejects corrupt numbers', () => {
    expect(hash({ b: 2, a: 1 })).toBe(hash({ a: 1, b: 2 }));
    expect(hash([1, 2])).not.toBe(hash([2, 1]));
    expect(() => canonical({ value: NaN })).toThrow();
    expect(() => canonical(Infinity)).toThrow();
    expect(hash('abc')).toHaveLength(64);
  });
  it('uses UTC calendar days including leap years', () => {
    expect(simDate(59, '2028-01-01')).toBe('2028-02-29');
    expect(simDate(60, '2028-01-01')).toBe('2028-03-01');
  });
  it('validates random operations', () => {
    expect(() => random('a').pick([])).toThrow();
    expect(() => random('a').chance(2)).toThrow();
    expect(() => random('a').int(4, 3)).toThrow();
    expect(random('a').chance(0)).toBe(false);
    expect(random('a').chance(1)).toBe(true);
  });
});
