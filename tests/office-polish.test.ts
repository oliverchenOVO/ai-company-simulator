import { describe, it, expect } from 'vitest';
import { Simulation, replay } from '../packages/simulation/src/simulation';
import { projectOffice, employeeAppearance } from '../apps/desktop/src/features/office/projection';
import { projectOfficeScene } from '../apps/desktop/src/features/office/scene-projection';
import { characterStyle } from '../apps/desktop/src/features/office/character-style';
import { planChoreography, sampleChoreography } from '../apps/desktop/src/features/office/scene-choreography';
import { createSave, validateSave } from '../packages/persistence/src/save';
const make=()=>new Simulation({name:'Polish',seed:'office-polish',scenario:'garage',employeeCount:12,initialCash:1e12},true,3);
const project=(sim:Simulation)=>{const office=projectOffice(sim.observe());const scene=projectOfficeScene(office);return {office,scene,plan:planChoreography(scene,office.cues),byId:new Map(scene.seats.map(s=>[s.seat.employeeId,s]))};};
describe('bounded detached office choreography',()=>{
  it('keeps founder style distinct and stable without changing authoritative appearance',()=>{
    const base=Object.freeze(employeeAppearance('employee-1')),copy={...base};
    const styles=[1,2,3].map(i=>characterStyle(`employee-${i}`,employeeAppearance(`employee-${i}`)));
    expect(new Set(styles.map(s=>s.clothing)).size).toBe(3);expect(characterStyle('employee-1',base)).toEqual(styles[0]);expect(base).toEqual(copy);
    expect(characterStyle('employee-42',base)).toEqual(characterStyle('employee-42',base));
  });
  it('uses a real promoted manager and actual related listeners, with bounded unique chairs',()=>{
    const sim=make();sim.execute({type:'PromoteEmployee',employeeId:'employee-3',track:'manager'});
    const {plan,byId}=project(sim);expect(plan.meeting?.leaderId).toBe('employee-3');
    const meeting=plan.meeting!;expect(meeting.listeners.length).toBeGreaterThan(0);expect(meeting.listeners.length).toBeLessThanOrEqual(4);
    expect(new Set(meeting.listeners.map(p=>p.chair.join(','))).size).toBe(meeting.listeners.length);
    for(const listener of meeting.listeners){const s=byId.get(listener.employeeId)!;expect(s.seat.vacant).toBe(false);expect(s.seat.floorId).toBe(meeting.floorId);expect(sampleChoreography(s,12,false,plan,byId)?.seated).toBe(true);}
    expect(sampleChoreography(byId.get('employee-3')!,12,false,plan,byId)?.pose).toBe('Presenting');
    expect(sampleChoreography(byId.get('employee-3')!,22,false,plan,byId)).toBeNull();
  });
  it('skips unrelated, vacant, missing and busy participants instead of inventing them',()=>{
    const sim=make();sim.execute({type:'PromoteEmployee',employeeId:'employee-3',track:'manager'});const {office,scene}=project(sim);
    const isolated={...scene,seats:scene.seats.filter(s=>s.seat.employeeId==='employee-3')};expect(planChoreography(isolated,office.cues)).toEqual({});
    const vacant={...scene,seats:scene.seats.map(s=>({...s,seat:{...s.seat,vacant:true}}))};expect(planChoreography(vacant,office.cues)).toEqual({});
    const busy=office.cues.map(c=>({...c,type:'Departing' as const}));expect(planChoreography(scene,busy)).toEqual({});
  });
  it('hands a document only to the actual manager and returns within the bounded interval',()=>{
    const sim=make();sim.execute({type:'AssignManager',employeeId:'employee-3',managerId:'employee-2'});const {plan,byId}=project(sim);
    expect(plan.handoff?.managerId).toBe('employee-2');const visitor=byId.get('employee-3')!,manager=byId.get('employee-2')!;
    expect(sampleChoreography(visitor,9,false,plan,byId)?.position).toEqual(plan.handoff?.target);
    expect(sampleChoreography(manager,9,false,plan,byId)).toMatchObject({pose:'Reading',seated:true,vignette:'handoff-review'});
    expect(sampleChoreography(visitor,18,false,plan,byId)).toBeNull();expect(sampleChoreography(visitor,9,true,plan,byId)).toBeNull();
  });
  it('reconstructs identical plans after save/load/replay and never mutates world or RNG',()=>{
    const sim=make();sim.execute({type:'PromoteEmployee',employeeId:'employee-3',track:'manager'});const before=structuredClone(sim.snapshot()),{scene,office,plan,byId}=project(sim);
    for(const s of scene.seats)for(let t=0;t<40;t+=.25)sampleChoreography(s,t,false,plan,byId);
    expect(sim.snapshot()).toEqual(before);expect(planChoreography(scene,office.cues)).toEqual(plan);
    const loaded=validateSave(JSON.parse(JSON.stringify(createSave(before))));expect(project(Simulation.restore(loaded.world)).plan).toEqual(plan);expect(project(replay(loaded.world)).plan).toEqual(plan);
  });
});
