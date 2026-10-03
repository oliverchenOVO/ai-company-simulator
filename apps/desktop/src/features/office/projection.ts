import type { CompanyView, EmployeeView, EventView } from '../../../../../packages/simulation/src/projection';

export type OfficeRole = 'executive' | 'management' | 'staff';
export type Activity = 'Working' | 'Reading' | 'Concerned' | 'Celebrating' | 'Arriving' | 'Departing' | 'Discussing' | 'Moving';
export type Overlay = 'normal' | 'management' | 'concerns';
export interface Appearance { clothing: string; skin: string; hair: string; hairStyle: number; accessory: boolean; phase: number }
export interface OfficeSeat {
  id: string; employeeId: string; name: string; teamId: string; managerId: string | null;
  floorId: string; zone: number; slot: number; role: OfficeRole; vacant: boolean;
  appearance: Appearance; concerns: string[]; overloaded: boolean; reportIds: string[];
}
export interface OfficeFloor { id: string; kind: OfficeRole; label: string; seats: OfficeSeat[]; teams: string[] }
export interface OfficeCue { id: string; employeeId: string; type: Activity; priority: number; title: string; tick: number }
export interface OfficeLayout { floors: OfficeFloor[]; seats: OfficeSeat[]; cues: OfficeCue[]; headcount: number; fidelity: 'individual' | 'quiet' | 'focused' }
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
const numericIdentity = (id: string) => { let n = 2166136261; for (const c of id) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return n >>> 0; };
/** This seed is private to presentation. Never consumes the simulation RNG. */
export function employeeAppearance(id: string): Appearance {
  const n = numericIdentity(id);
  return { clothing: ['#087f83', '#354d68', '#a16e58', '#6e7d91', '#768d79'][n % 5],
    skin: ['#c58b66', '#e4b18a', '#a46e50', '#edc6a5'][n >>> 3 & 3], hair: ['#293039', '#635145', '#333029', '#8b7461'][n >>> 5 & 3],
    hairStyle: n >>> 7 & 3, accessory: (n >>> 9 & 3) === 0, phase: n % 11 };
}
export function employeeConcerns(e: EmployeeView): string[] {
  const labels: string[] = [];
  if (e.status !== 'active') return labels;
  if (e.condition !== '狀態穩定') labels.push(e.condition);
  if (e.organization) {
    if (['希望討論成長安排', '職涯期待持續未解'].includes(e.organization.careerStatus)) labels.push(e.organization.careerStatus);
    if (e.organization.managerSupport === '支持不足') labels.push('主管支持不足');
    if (e.organization.retention === '留任需要關注') labels.push(e.organization.retention);
    if (e.organization.managementLoad === '管理負荷偏高') labels.push(e.organization.managementLoad);
  }
  return labels;
}
const cues: Record<string, { type: Activity; priority: number }> = {
  EmployeeResigned: { type: 'Departing', priority: 0 }, EmployeeFired: { type: 'Departing', priority: 0 },
  EmployeeHired: { type: 'Arriving', priority: 1 }, EmployeePromoted: { type: 'Celebrating', priority: 2 },
  ManagerChanged: { type: 'Discussing', priority: 3 }, ManagerOverloaded: { type: 'Concerned', priority: 4 },
  CareerConcernRaised: { type: 'Discussing', priority: 4 }, EmployeeConcernRaised: { type: 'Concerned', priority: 4 },
  EmployeeMoved: { type: 'Moving', priority: 5 }, EmployeeRoleChanged: { type: 'Moving', priority: 5 }
};
export function presentationQueue(events: readonly EventView[], tick: number): OfficeCue[] {
  const seen = new Set<string>(), result: OfficeCue[] = [];
  // Scan backwards: at most 8 recent, distinct-person vignettes; private events never enter CompanyView.
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i], cue = cues[e.type];
    if (e.tick < tick - 7) break;
    if (!cue || !e.employeeId || e.tick > tick || seen.has(e.employeeId)) continue;
    seen.add(e.employeeId); result.push({ ...cue, id: e.id, employeeId: e.employeeId, title: e.title, tick: e.tick });
  }
  return result.sort((a, b) => a.priority - b.priority || b.tick - a.tick || compare(a.id, b.id)).slice(0, 8);
}
/** Detached, regenerable geometry semantics. No WorldState, commands or mutable authority. */
export function projectOffice(view: CompanyView): OfficeLayout {
  const reports = new Map<string, string[]>();
  for (const e of view.employees) if (e.status === 'active' && e.managerId) {
    const list = reports.get(e.managerId) ?? []; list.push(e.id); reports.set(e.managerId, list);
  }
  const roleOf = (e: EmployeeView): OfficeRole => e.role === 'CEO' ? 'executive' : e.role === 'CTO' || e.organization?.track === 'manager' || (reports.get(e.id)?.length ?? 0) > 0 ? 'management' : 'staff';
  // A bounded, genuine recent vacancy survives load/replay without persisting office state.
  const former = view.employees.filter(e => e.status !== 'active' && view.tick - (e.hiredAt + e.tenureDays) <= 30)
    .sort((a, b) => (b.hiredAt + b.tenureDays) - (a.hiredAt + a.tenureDays) || compare(a.id, b.id)).slice(0, 16);
  const people = [...view.employees.filter(e => e.status === 'active'), ...former];
  const floors: OfficeFloor[] = [], seats: OfficeSeat[] = [];
  for (const kind of ['executive', 'management', 'staff'] as const) {
    const members = people.filter(e => roleOf(e) === kind).sort((a, b) => compare(a.teamId, b.teamId) || compare(a.managerId ?? '', b.managerId ?? '') || a.hiredAt - b.hiredAt || compare(a.id, b.id));
    const blocks: EmployeeView[][] = [];
    for (const e of members) {
      const last = blocks.at(-1);
      if (!last || last.length === 4 || (kind === 'staff' && (last[0].teamId !== e.teamId || last[0].managerId !== e.managerId))) blocks.push([e]);
      else last.push(e);
    }
    const zones = kind === 'staff' ? 2 : 1;
    const total = Math.max(1, Math.ceil(blocks.length / zones));
    for (let i = 0; i < total; i++) {
      const id = `${kind}-${i + 1}`, floor: OfficeFloor = { id, kind, label: `${kind === 'executive' ? '執行層' : kind === 'management' ? '管理層' : '工作層'}${total > 1 ? ` ${i + 1}` : ''}`, seats: [], teams: [] };
      for (let z = 0; z < zones; z++) for (const [slot, e] of (blocks[i * zones + z] ?? []).entries()) {
        const seat: OfficeSeat = { id: `desk-${e.id}`, employeeId: e.id, name: e.name, teamId: e.teamId, managerId: e.managerId, floorId: id, zone: z, slot, role: kind, vacant: e.status !== 'active',
          appearance: employeeAppearance(e.id), concerns: employeeConcerns(e), overloaded: e.organization?.managementLoad === '管理負荷偏高', reportIds: [...(reports.get(e.id) ?? [])].sort(compare) };
        floor.seats.push(seat); seats.push(seat);
        if (!floor.teams.includes(e.teamId)) floor.teams.push(e.teamId);
      }
      floors.push(floor);
    }
  }
  return { floors, seats, cues: presentationQueue(view.events, view.tick), headcount: view.headcount, fidelity: view.headcount <= 100 ? 'individual' : view.headcount <= 250 ? 'quiet' : 'focused' };
}
export function seatPoint(seat: Pick<OfficeSeat, 'zone' | 'slot'>) {
  return { x: (seat.zone === 0 ? 170 : 665) + (seat.slot % 2) * 145, y: 137 + Math.floor(seat.slot / 2) * 81 };
}
