import type { Employee, WorldState } from '../../packages/domain/src/model';
import { clamp } from '../../packages/shared/src/determinism';
import { management, organizationIndex, organizationInfluence } from '../../packages/simulation/src/organization';

/** CLI-only post-tick diagnostics. No mutation, RNG, or production policy input. */
export function retentionFactors(w: WorldState, e: Employee, index = organizationIndex(w)) {
  const p = e.psychology, underpaid = clamp(1 - e.salary / Math.max(1, e.expectations.salary), 0, 1);
  const org = organizationInfluence(w, e, index), team = w.teams[e.teamId].organization;
  const tie = index.ties.get(e.teamId);
  const components = { compensation: underpaid * 50, burnout: p.burnout * .45,
    dissatisfaction: Math.max(0, 65 - p.satisfaction) * 1.2, loyalty: Math.max(0, 50 - p.loyalty) * .35,
    organization: org.retention };
  return { id: e.id, name: e.name, tick: w.meta.tick, status: e.status, hiredAt: e.hiredAt, leftAt: e.leftAt,
    compensationMismatch: underpaid, stress: p.stress, burnout: p.burnout, satisfaction: p.satisfaction,
    loyalty: p.loyalty, companyTrust: p.companyTrust, managerTrust: p.managerTrust, exitIntent: p.exitIntent,
    career: e.career ? { ...e.career.goals[0], causes: e.career.goals[0].causes.map(c => ({ ...c })) } : null,
    managerSupport: management(w, e, index).quality, teamStability: team?.stability ?? null,
    coordination: team?.coordination ?? null, relationshipSupport: tie ? tie.sum / tie.count : 50,
    components, postTickTarget: clamp(Object.values(components).reduce((s, x) => s + x, 0)),
    exitStage: e.exitStage, salary: e.salary, work: e.workTotal };
}
type Sample = ReturnType<typeof retentionFactors>;
type Episode = { start: number; end: number; outcome: 'open' | 'resolved' | 'resigned' | 'fired' };
type Person = { id: string; eligible: boolean; firstHiddenRisk: number | null; firstPublicSignal: number | null;
  firstSeriousWarning: number | null; firstHighIntent: number | null; evaluationCount: number; resignedAt: number | null;
  maxIntent: number; maxStress: number; maxBurnout: number; maxFrustration: number; concernSamples: number; retentionConcern: boolean;
  instabilitySamples: number; stressSamples: number; episodes: Episode[]; last: Sample; trace: Sample[] };
const mildEvents = new Set(['CareerConcernRaised', 'EmployeeConcernRaised', 'RelationshipStrained']);
const seriousEvents = new Set(['CareerGoalBlocked', 'EmployeeConcernRaised']);
const organizationEvents = new Set([...mildEvents, ...seriousEvents, 'ManagerOverloaded', 'ManagementLoadRecovered',
  'TeamCoordinationChanged', 'EmployeePromoted', 'ManagerChanged', 'TeamManagerChanged', 'EmployeeMoved',
  'EmployeeResigned', 'PeerPromotionReaction', 'CareerGoalProgressed']);

export class RetentionAudit {
  private people = new Map<string, Person>();
  private eventCursor = 0;
  private lastTick = -1;
  private eventCounts: Record<string, number> = {};
  private eventsPerYear: Record<number, number> = {};
  private observedEvents: WorldState['events'] = [];
  constructor(readonly intervalDays: number, private readonly traceIds: string[] = []) {}
  sample(w: WorldState) {
    if (w.meta.tick <= this.lastTick) return;
    const index = organizationIndex(w), fresh = w.events.slice(this.eventCursor);
    const employeeEvents = new Map<string, WorldState['events']>();
    for (const event of fresh) if (typeof event.payload.employeeId === 'string') {
      const list = employeeEvents.get(event.payload.employeeId) ?? []; list.push(event); employeeEvents.set(event.payload.employeeId, list);
    }
    this.eventCursor = w.events.length;
    for (const event of fresh) if (organizationEvents.has(event.type)) {
      this.eventCounts[event.type] = (this.eventCounts[event.type] ?? 0) + 1;
      const year = Number(event.date.slice(0, 4)); this.eventsPerYear[year] = (this.eventsPerYear[year] ?? 0) + 1;
      this.observedEvents.push(structuredClone(event));
    }
    for (const e of Object.values(w.employees)) {
      const s = retentionFactors(w, e, index);
      let person = this.people.get(e.id);
      if (!person) {
        person = { id: e.id, eligible: e.role !== 'CEO', firstHiddenRisk: null, firstPublicSignal: null,
          firstSeriousWarning: null, firstHighIntent: null, evaluationCount: 0, resignedAt: null,
          maxIntent: 0, maxStress: 0, maxBurnout: 0, maxFrustration: 0, concernSamples: 0, retentionConcern: false,
          instabilitySamples: 0, stressSamples: 0, episodes: [], last: s, trace: [] };
        this.people.set(e.id, person);
      }
      const own = employeeEvents.get(e.id) ?? [];
      const publicMild = own.find(event => event.visibility !== 'private' && mildEvents.has(event.type));
      const publicSerious = own.find(event => event.visibility !== 'private' && seriousEvents.has(event.type));
      if (own.some(event => event.type === 'EmployeeConcernRaised')) person.retentionConcern = true;
      // Public qualitative projection thresholds; numeric values are retained only here.
      const publicConcern = s.status === 'active' && ((s.career?.frustration ?? 0) >= 20 || s.exitIntent > 30 || s.managerSupport < 45 || s.stress > 65 || s.burnout > 50 || s.satisfaction < 50);
      if (s.exitIntent >= 20 && person.firstHiddenRisk === null) person.firstHiddenRisk = w.meta.tick;
      if (person.firstPublicSignal === null && (publicMild || publicConcern)) person.firstPublicSignal = publicMild?.tick ?? w.meta.tick;
      if (person.firstSeriousWarning === null && publicSerious) person.firstSeriousWarning = publicSerious.tick;
      if (s.exitIntent > 55 && person.firstHighIntent === null) person.firstHighIntent = w.meta.tick;
      const departure = own.find(event => event.type === 'EmployeeResigned');
      if (departure) person.resignedAt = departure.tick;
      // Seven-day sampling ends exactly on evaluation ticks. Searching remains eligible below 55 until reset below 20.
      if (w.meta.tick > 0 && w.meta.tick % 7 === 0 && (s.status === 'active' && s.exitStage === 'searching' || departure?.tick === w.meta.tick)) person.evaluationCount++;
      person.maxIntent = Math.max(person.maxIntent, s.exitIntent); person.maxStress = Math.max(person.maxStress, s.stress);
      person.maxBurnout = Math.max(person.maxBurnout, s.burnout); person.maxFrustration = Math.max(person.maxFrustration, s.career?.frustration ?? 0);
      if (publicConcern) person.concernSamples++;
      if (s.status === 'active' && s.stress > 65) person.stressSamples++;
      if (s.status === 'active' && (s.teamStability ?? 100) < 60) person.instabilitySamples++;
      const episode = person.episodes.at(-1);
      if (publicConcern && (!episode || episode.outcome !== 'open')) person.episodes.push({ start: publicMild?.tick ?? w.meta.tick, end: w.meta.tick, outcome: 'open' });
      else if (episode?.outcome === 'open') {
        episode.end = s.leftAt ?? w.meta.tick;
        if (!publicConcern) episode.outcome = s.status === 'active' ? 'resolved' : s.status;
      }
      if (this.traceIds.includes(e.id) && (w.meta.tick % 28 === 0 || own.length > 0 || (s.exitStage !== person.last.exitStage) || s.status !== person.last.status || w.meta.tick === 0)) person.trace.push(s);
      person.last = s;
    }
    this.lastTick = w.meta.tick;
  }
  result() {
    const all = [...this.people.values()], eligible = all.filter(e => e.eligible);
    return { intervalDays: this.intervalDays, durationUncertaintyDays: Math.max(0, this.intervalDays - 1),
      diagnostics: 'post-tick recomputation; career weekly update may follow the actual psychology target; public event dates exact, state threshold and resolution times sampled',
      funnel: { employeesCreated: all.length, eligibleEmployees: eligible.length,
        mildHiddenRisk: eligible.filter(e => e.firstHiddenRisk !== null).length,
        publicConcerns: eligible.filter(e => e.firstPublicSignal !== null).length,
        retentionConcerns: eligible.filter(e => e.retentionConcern).length,
        seriousWarnings: eligible.filter(e => e.firstSeriousWarning !== null).length,
        highExitIntent: eligible.filter(e => e.firstHighIntent !== null).length,
        evaluatedEmployees: eligible.filter(e => e.evaluationCount > 0).length,
        resignationEvaluations: eligible.reduce((sum, e) => sum + e.evaluationCount, 0),
        resigned: eligible.filter(e => e.resignedAt !== null).length },
      eventCounts: this.eventCounts, eventsPerYear: this.eventsPerYear,
      people: all.map(e => ({ ...e, warningLeadDays: e.resignedAt !== null && e.firstPublicSignal !== null ? e.resignedAt - e.firstPublicSignal : null,
        seriousWarningLeadDays: e.resignedAt !== null && e.firstSeriousWarning !== null ? e.resignedAt - e.firstSeriousWarning : null,
        tenureDays: (e.last.leftAt ?? e.last.tick) - e.last.hiredAt })),
      events: this.observedEvents };
  }
}
