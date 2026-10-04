import type { OfficeCue } from './projection';
import type { OfficeSceneProjection, SceneSeat, Point3 } from './scene-projection';
import { walk, walkRoute, type Motion } from './scene-motion';
export interface MeetingPlan { cueId: string; leaderId: string; floorId: string; listeners: { employeeId: string; chair: Point3; facingYaw: number }[] }
export interface HandoffPlan { cueId: string; employeeId: string; managerId: string; target: Point3; crossFloor: boolean }
export interface Choreography { meeting?: MeetingPlan; handoff?: HandoffPlan }

/** At most one meeting and one handoff. Only actual active related entities qualify. */
export function planChoreography(scene: OfficeSceneProjection, cues: readonly OfficeCue[]): Choreography {
  const byId=new Map(scene.seats.map(s=>[s.seat.employeeId,s]));
  const busy=new Set(cues.filter(c=>['Departing','Arriving','Moving'].includes(c.type)).map(c=>c.employeeId));
  const result:Choreography={};
  for(const cue of cues) {
    const actor=byId.get(cue.employeeId);
    if(!actor || actor.seat.vacant || busy.has(cue.employeeId)) continue;
    if(cue.type==='Celebrating' && actor.seat.role!=='staff' && !result.meeting) {
      const related=scene.seats.filter(s=>!s.seat.vacant && s.seat.employeeId!==actor.seat.employeeId && s.seat.floorId===actor.seat.floorId && !busy.has(s.seat.employeeId)
        && !cues.some(c=>c.employeeId===s.seat.employeeId && c.id!==cue.id)
        && (s.seat.employeeId===actor.seat.managerId || s.seat.managerId===actor.seat.employeeId || s.seat.teamId===actor.seat.teamId && s.seat.managerId===actor.seat.managerId))
        .sort((a,b)=>(a.seat.employeeId<b.seat.employeeId ? -1 : a.seat.employeeId>b.seat.employeeId ? 1 : 0)).slice(0,4);
      if(!related.length) continue;
      result.meeting={cueId:cue.id,leaderId:actor.seat.employeeId,floorId:actor.seat.floorId,listeners:related.map((s,i)=>({employeeId:s.seat.employeeId,chair:[3.9+(i%3)*1.3,actor.person[1],i<3 ? 1.4 : -.9],facingYaw:i<3 ? Math.PI : 0}))};
      busy.add(actor.seat.employeeId);for(const s of related) busy.add(s.seat.employeeId);
    } else if(cue.type==='Discussing' && !result.handoff) {
      const manager=actor.seat.managerId ? byId.get(actor.seat.managerId) : undefined;
      if(!manager || manager.seat.vacant || manager.seat.employeeId===actor.seat.employeeId || busy.has(manager.seat.employeeId)) continue;
      result.handoff={cueId:cue.id,employeeId:actor.seat.employeeId,managerId:manager.seat.employeeId,target:[manager.person[0]+1.55,manager.person[1],manager.person[2]+.15],crossFloor:actor.seat.floorId!==manager.seat.floorId};
      busy.add(actor.seat.employeeId);busy.add(manager.seat.employeeId);
    }
  }
  return result;
}

export function participation(s:SceneSeat,plan:Choreography):{cueId:string;kind:'meeting'|'handoff'}|undefined {
  const id=s.seat.employeeId;
  if(plan.meeting && (plan.meeting.leaderId===id || plan.meeting.listeners.some(p=>p.employeeId===id))) return {cueId:plan.meeting.cueId,kind:'meeting'};
  if(plan.handoff && [plan.handoff.employeeId,plan.handoff.managerId].includes(id)) return {cueId:plan.handoff.cueId,kind:'handoff'};
}

function meetingRoute(s:SceneSeat,target:Point3):Point3[] {
  const lane=s.seat.role==='executive' ? 1.55 : 1.24,y=s.person[1];
  const route:Point3[]=[s.person,[s.person[0]+lane,y,s.person[2]],[s.person[0]+lane,y,2.65]];
  if(target[2]<0) route.push([7.3,y,2.65],[7.3,y,-1.8],[target[0],y,-1.8]);
  else route.push([target[0],y,2.65]);
  route.push(target);return route;
}
function handoffRoute(from:Point3,source:SceneSeat,manager:SceneSeat,target:Point3):Point3[] {
  const sourceLane=source.seat.role==='executive' ? 1.55 : 1.24,managerLane=manager.seat.role==='executive' ? 1.55 : 1.24,y=from[1];
  return [from,[from[0]+sourceLane,y,from[2]],[from[0]+sourceLane,y,2.65],[manager.person[0]+managerLane,y,2.65],[manager.person[0]+managerLane,y,target[2]],target];
}
/** A shared cue clock synchronizes related people. No outcome or command is produced. */
export function sampleChoreography(s:SceneSeat,seconds:number,reduced:boolean,plan:Choreography,byId:Map<string,SceneSeat>):Motion|null {
  if(reduced || s.seat.vacant) return null;
  const member=participation(s,plan);if(!member) return null;
  if(member.kind==='meeting') {
    const meeting=plan.meeting!, leader=meeting.leaderId===s.seat.employeeId;
    const listener=meeting.listeners.find(p=>p.employeeId===s.seat.employeeId);
    if(seconds<8 || seconds>=22) return null;
    const target=leader ? s.presentation : listener!.chair;
    if(seconds<11) return {...walkRoute(meetingRoute(s,target),(seconds-8)/3),document:leader,vignette:'meeting'};
    if(seconds<19) return {position:target,pose:leader ? 'Presenting' : 'Talking',visible:true,document:leader,seated:!leader,facingYaw:leader ? -Math.PI/2 : listener!.facingYaw,vignette:'meeting'};
    return {...walkRoute(meetingRoute(s,target).reverse(),(seconds-19)/3),vignette:'meeting'};
  }
  const handoff=plan.handoff!, manager=byId.get(handoff.managerId)!, employee=byId.get(handoff.employeeId)!;
  const exchangeStart=handoff.crossFloor ? 7 : 4, exchangeEnd=exchangeStart+4;
  if(s.seat.employeeId===handoff.managerId) return seconds>=exchangeStart && seconds<exchangeEnd
    ? {position:s.person,pose:'Reading',visible:true,document:true,seated:true,facingYaw:Math.PI,vignette:'handoff-review'} : null;
  const action:Motion={position:handoff.target,pose:'Talking',visible:true,document:true,facingYaw:Math.atan2(manager.person[0]-handoff.target[0],manager.person[2]-handoff.target[2]),vignette:'handoff'};
  if(seconds<0 || seconds>= (handoff.crossFloor ? 18 : 12)) return null;
  if(!handoff.crossFloor) return seconds<4 ? {...walkRoute(handoffRoute(s.person,s,manager,handoff.target),seconds/4),document:true,vignette:'handoff'} : seconds<8 ? action : {...walkRoute(handoffRoute(s.person,s,manager,handoff.target).reverse(),(seconds-8)/4),document:true,vignette:'handoff'};
  if(seconds<3) return {...walk(s.person,s.elevator,seconds/3),document:true,vignette:'handoff'};
  if(seconds<4 || seconds>=14 && seconds<15) return {...action,visible:false};
  if(seconds<7) return {...walkRoute(handoffRoute(manager.elevator,s,manager,handoff.target),(seconds-4)/3),document:true,vignette:'handoff'};
  if(seconds<11) return action;
  if(seconds<14) return {...walkRoute(handoffRoute(manager.elevator,s,manager,handoff.target).reverse(),(seconds-11)/3),document:true,vignette:'handoff'};
  return {...walk(employee.elevator,employee.person,(seconds-15)/3),document:true,vignette:'handoff'};
}
