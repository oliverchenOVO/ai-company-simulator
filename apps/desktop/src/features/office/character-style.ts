import type { Appearance } from './projection';
export interface CharacterStyle extends Appearance { trousers: string; shoes: string; collar: string; jacket: boolean }
/** Asset choices only. IDs never become new world traits or consume world RNG. */
export function characterStyle(id: string, base: Appearance): CharacterStyle {
  let n = 2166136261;
  for (const c of id) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  const style: CharacterStyle = { ...base, trousers: n & 1 ? '#354956' : '#5c625d', shoes: n & 2 ? '#433b34' : '#253942', collar: '#eee9df', jacket: (n >>> 3 & 3) !== 0 };
  // Founding slots in every scenario use the same recognizable visual family.
  if (id === 'employee-1') return { ...style, clothing: '#27445c', hair: '#252a2d', hairStyle: 2, accessory: false, jacket: true };
  if (id === 'employee-2') return { ...style, clothing: '#4d7b9c', hair: '#5c4635', hairStyle: 0, accessory: true, jacket: true };
  if (id === 'employee-3') return { ...style, clothing: '#438578', hair: '#332b29', hairStyle: 1, accessory: false, jacket: true };
  return style;
}
