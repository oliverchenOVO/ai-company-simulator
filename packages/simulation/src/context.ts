import type { DomainEvent, Employee, WorldState } from '../../domain/src/model';
export interface SystemContext {
  w: WorldState;
  active: Employee[];
  commandId: string;
  emit(type: string, payload: DomainEvent['payload'], causedBy?: string | null, causes?: DomainEvent['causes'], visibility?: DomainEvent['visibility']): DomainEvent;
}
export function remember(w: WorldState, e: Employee, event: DomainEvent, sentiment: number, importance = 60): void {
  e.memories.push({ id: `memory-${event.id}-${e.id}`, tick: w.meta.tick, type: event.type, eventId: event.id, importance, sentiment, decayRate: importance >= 90 ? 0 : 0.02 });
  if (e.memories.length > 24) e.memories.splice(0, e.memories.length - 24);
}
export function detachManager(w: WorldState, id: string): void {
  for (const e of Object.values(w.employees)) if (e.managerId === id) e.managerId = null;
  for (const team of Object.values(w.teams)) if (team.managerId === id) team.managerId = null;
}
