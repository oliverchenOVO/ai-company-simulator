import type { OfficeCue } from './projection';
import type { Point3, SceneSeat } from './scene-projection';
export type Pose = 'Idle' | 'Typing' | 'Walking' | 'Talking' | 'Presenting' | 'Reading';
export interface Motion { position: Point3; pose: Pose; visible: boolean; document: boolean }
const between = (a: Point3, b: Point3, t: number): Point3 => a.map((n, i) => n + (b[i] - n) * Math.max(0, Math.min(1, t))) as Point3;
const walk = (a: Point3, b: Point3, t: number): Motion => {
  const points:Point3[]=[a,[a[0]+1,a[1],a[2]],[a[0]+1,a[1],2.55],[b[0]+1,b[1],2.55],[b[0]+1,b[1],b[2]],b];
  const lengths=points.slice(1).map((p,i)=>Math.hypot(...p.map((n,j)=>n-points[i][j])));
  let distance=Math.max(0,Math.min(1,t))*lengths.reduce((sum,n)=>sum+n,0), position=b;
  for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]){position=between(points[i],points[i+1],lengths[i] ? distance/lengths[i] : 1);break;}distance-=lengths[i];}
  return {position,pose:'Walking',visible:true,document:false};
};
/** Seconds belong to a renderer clock, not world time. Never changes authoritative outcomes. */
export function sampleMotion(s: SceneSeat, seconds: number, reduced: boolean, cue?: OfficeCue, manager?: SceneSeat, previous?: SceneSeat, ambient = true): Motion {
  const rest: Motion = { position: [...s.person], pose: s.seat.appearance.phase % 5 === 0 ? 'Idle' : s.seat.appearance.phase % 3 === 0 ? 'Reading' : 'Typing', visible: !s.seat.vacant, document: false };
  if (reduced) return rest;
  if (cue?.type === 'Departing' && seconds < 5) return walk(s.person, s.elevator, seconds / 4);
  if (s.seat.vacant) return rest;
  if (previous && previous.seat.floorId !== s.seat.floorId && seconds < 8) {
    if (seconds < 3) return walk(previous.person, previous.elevator, seconds / 3);
    if (seconds < 4) return { ...rest, visible: false };
    return walk(s.elevator, s.person, (seconds - 4) / 4);
  }
  if ((cue?.type === 'Arriving' || cue?.type === 'Celebrating' || cue?.type === 'Moving') && seconds < 5) return walk(s.elevator, s.person, seconds / 5);
  if(cue?.type==='Celebrating' && s.seat.role!=='staff' && seconds>=8 && seconds<18) {
    if(seconds<11) return {...walk(s.person,s.presentation,(seconds-8)/3),document:true};
    if(seconds<15) return {...rest,position:s.presentation,pose:'Presenting',document:true};
    return walk(s.presentation,s.person,(seconds-15)/3);
  }
  if (cue?.type === 'Discussing' && manager && manager.seat.floorId!==s.seat.floorId && seconds<18) {
    if(seconds<3) return {...walk(s.person,s.elevator,seconds/3),document:true};
    if(seconds<4 || seconds>=14 && seconds<15) return {...rest,visible:false};
    const target:Point3=[manager.person[0]+1,manager.person[1],manager.person[2]+.2];
    if(seconds<7) return {...walk(manager.elevator,target,(seconds-4)/3),document:true};
    if(seconds<11) return {...rest,position:target,pose:'Talking',document:true};
    if(seconds<14) return {...walk(target,manager.elevator,(seconds-11)/3),document:true};
    return {...walk(s.elevator,s.person,(seconds-15)/3),document:true};
  }
  if (cue?.type === 'Discussing' && seconds < 12) {
    const target: Point3 = manager && manager.seat.floorId === s.seat.floorId ? [manager.person[0] + 1, s.person[1], manager.person[2]] : s.meeting;
    const movement = seconds < 4 ? walk(s.person, target, seconds / 4) : seconds < 8 ? { ...rest, position: target, pose: (s.seat.role==='staff' ? 'Talking' : 'Presenting') as Pose } : walk(target, s.person, (seconds - 8) / 4);
    return { ...movement, document: true };
  }
  if (ambient && s.seat.appearance.phase === 2) {
    const t = seconds % 45;
    if (t > 30 && t < 34) return walk(s.person, s.printer, (t - 30) / 4);
    if (t >= 34 && t < 38) return { ...rest, position: s.printer, pose: 'Reading', document: true };
    if (t >= 38 && t < 42) return walk(s.printer, s.person, (t - 38) / 4);
  }
  return rest;
}
/** One existing colleague may accompany a real promotion; no meeting is scheduled in the world. */
export function sampleMeetingCompanion(s:SceneSeat,seconds:number,reduced:boolean):Motion|null {
  if(reduced || s.seat.vacant || seconds<8 || seconds>=18) return null;
  if(seconds<11) return walk(s.person,s.meeting,(seconds-8)/3);
  if(seconds<15) return {position:s.meeting,pose:'Talking',visible:true,document:false};
  return walk(s.meeting,s.person,(seconds-15)/3);
}
