import { describe, it, expect } from 'vitest';
import { Simulation, replay } from '../packages/simulation/src/simulation';
import { readFileSync } from 'node:fs';
import { projectOffice } from '../apps/desktop/src/features/office/projection';
import { projectOfficeScene } from '../apps/desktop/src/features/office/scene-projection';
import { sampleMotion, sampleMeetingCompanion } from '../apps/desktop/src/features/office/scene-motion';
import { createSave, validateSave } from '../packages/persistence/src/save';
const scene = (sim: Simulation) => projectOfficeScene(projectOffice(sim.observe()));
describe('pure 3D Office adapter and presentation motion', () => {
  it('places founders in three real floors with deterministic finite metre coordinates', () => {
    const sim = new Simulation({name:'3D',seed:'office-3d',scenario:'garage'},true,3);
    const result=scene(sim); expect(result).toEqual(scene(sim)); expect(result.floors).toHaveLength(3);
    expect(result.seats.find(s=>s.seat.employeeId==='employee-1')!.desk[1]).toBe(7.2);
    expect(result.seats.find(s=>s.seat.employeeId==='employee-3')!.desk[1]).toBe(0);
    for(const s of result.seats) for(const point of [s.desk,s.person,s.elevator,s.meeting,s.printer]) expect(point.every(Number.isFinite)).toBe(true);
    expect(new Set(result.seats.map(s=>s.person.join(':'))).size).toBe(3);
  });
  it('does not mutate observation, snapshot, hash or RNG across animation samples', () => {
    const sim=new Simulation({name:'3D',seed:'office-3d',scenario:'garage'},true,3);
    const before=structuredClone(sim.snapshot()), view=sim.observe(), copy=structuredClone(view);
    const office=projectOffice(view), projected=projectOfficeScene(office);
    for(const s of projected.seats) for(const t of [0,2,8,32,41,1000]) sampleMotion(s,t,false,office.cues.find(c=>c.employeeId===s.seat.employeeId));
    expect(view).toEqual(copy); expect(sim.snapshot()).toEqual(before);
  });
  it('reconstructs the same scene from an actual save and replay', () => {
    const sim=new Simulation({name:'3D',seed:'office-3d',scenario:'garage'},true,3); sim.execute({type:'AdvanceTime',days:30});
    const saved=createSave(sim.snapshot()); const loaded=validateSave(JSON.parse(JSON.stringify(saved)));
    const restored=Simulation.restore(loaded.world); expect(scene(restored)).toEqual(scene(sim));
    expect(scene(replay(loaded.world))).toEqual(scene(sim));
  });
  it('reduced motion holds workstation and hides former employees', () => {
    const sim=new Simulation({name:'3D',seed:'office-3d',scenario:'garage'},true,3); const s=scene(sim).seats[0];
    expect(sampleMotion(s,3,true,{id:'hire',employeeId:s.seat.employeeId,type:'Arriving',priority:1,title:'hire',tick:0}).position).toEqual(s.person);
    expect(sampleMotion({...s,seat:{...s.seat,vacant:true}},2,true).visible).toBe(false);
  });
  it('arrival and departure follow correct real-event endpoints and leave vacancies', () => {
    const sim=new Simulation({name:'3D',seed:'office-3d',scenario:'garage'},true,3); const s=scene(sim).seats[0];
    const cue={id:'event',employeeId:s.seat.employeeId,type:'Arriving' as const,priority:1,title:'event',tick:0};
    expect(sampleMotion(s,0,false,cue).position).toEqual(s.elevator); expect(sampleMotion(s,6,false,cue).position).toEqual(s.person);
    const vacant={...s,seat:{...s.seat,vacant:true}};
    expect(sampleMotion(vacant,0,false,{...cue,type:'Departing'}).position).toEqual(s.person);
    expect(sampleMotion(vacant,6,false,{...cue,type:'Departing'}).visible).toBe(false);
  });
  it('promotion routes through the old and new elevator floors', () => {
    const sim=new Simulation({name:'3D',seed:'office-3d',scenario:'garage'},true,3); const s=scene(sim).seats[0];
    const previous={...s,person:[s.person[0],0,s.person[2]] as [number,number,number],elevator:[0,0,-.7] as [number,number,number],seat:{...s.seat,floorId:'staff-1'}};
    expect(sampleMotion(s,0,false,undefined,undefined,previous).position).toEqual(previous.person);
    expect(sampleMotion(s,3.5,false,undefined,undefined,previous).visible).toBe(false);
    expect(sampleMotion(s,4,false,undefined,undefined,previous).position).toEqual(s.elevator);
    expect(sampleMotion(s,9,false,undefined,undefined,previous).position).toEqual(s.person);
  });
  it('discussion has document handoff but ambient work invents no cue', () => {
    const sim=new Simulation({name:'3D',seed:'office-3d',scenario:'garage'},true,3); const s=scene(sim).seats[0];
    const cue={id:'real-public-event',employeeId:s.seat.employeeId,type:'Discussing' as const,priority:3,title:'manager changed',tick:0};
    expect(sampleMotion(s,6,false,cue).pose).toBe('Presenting'); expect(sampleMotion(s,6,false,cue).document).toBe(true);
    expect(sampleMotion(s,14,false,cue).position).toEqual(s.person);
    expect(sampleMotion(s,6,false).document).toBe(false);
  });
  it('cross-floor handoff uses the actual manager floor and returns without an invented outcome',()=>{
    const sim=new Simulation({name:'3D',seed:'office-3d',scenario:'garage'},true,3), projected=scene(sim);
    const worker=projected.seats.find(s=>s.seat.employeeId==='employee-3')!,manager=projected.seats.find(s=>s.seat.employeeId==='employee-2')!;
    const cue={id:'public',employeeId:worker.seat.employeeId,type:'Discussing' as const,priority:3,title:'manager change',tick:0};
    expect(sampleMotion(worker,3.5,false,cue,manager).visible).toBe(false);
    expect(sampleMotion(worker,4,false,cue,manager).position).toEqual(manager.elevator);
    const handoff=sampleMotion(worker,8,false,cue,manager);expect(handoff.pose).toBe('Talking');expect(handoff.document).toBe(true);expect(handoff.position[1]).toBe(manager.person[1]);
    expect(sampleMotion(worker,19,false,cue,manager).position).toEqual(worker.person);
  });
  it('a real manager promotion can stage a bounded meeting then return to work',()=>{
    const sim=new Simulation({name:'3D',seed:'office-3d',scenario:'garage'},true,3), manager=scene(sim).seats.find(s=>s.seat.role==='management')!;
    const cue={id:'promotion',employeeId:manager.seat.employeeId,type:'Celebrating' as const,priority:2,title:'promotion',tick:0};
    expect(sampleMotion(manager,8,false,cue).position).toEqual(manager.person);
    expect(sampleMotion(manager,12,false,cue).position).toEqual(manager.presentation);expect(sampleMotion(manager,12,false,cue).pose).toBe('Presenting');
    expect(manager.presentation[0]).toBeGreaterThan(7.1); // outside even the executive table's edge
    expect(sampleMotion(manager,19,false,cue).position).toEqual(manager.person);
  });
  it('meeting companion walks to a chair and returns instead of teleporting',()=>{
    const sim=new Simulation({name:'3D',seed:'office-3d',scenario:'garage'},true,3),s=scene(sim).seats[0];
    expect(sampleMeetingCompanion(s,8,false)?.position).toEqual(s.person);
    expect(sampleMeetingCompanion(s,9,false)?.pose).toBe('Walking');
    expect(sampleMeetingCompanion(s,12,false)?.position).toEqual(s.meeting);
    expect(sampleMeetingCompanion(s,12,false)?.pose).toBe('Talking');
    expect(sampleMeetingCompanion(s,17.999,false)?.position[1]).toBe(s.person[1]);
    expect(sampleMeetingCompanion(s,18,false)).toBeNull();expect(sampleMeetingCompanion(s,12,true)).toBeNull();
  });
  for(const file of ['phase1-0.1.0.save.json','phase1-0.1.1.save.json','phase2-0.2.0.save.json']) it(`reconstructs 3D from released ${file} with exact hash`,()=>{
    const saved=validateSave(JSON.parse(readFileSync(`tests/fixtures/${file}`,'utf8'))), sim=Simulation.restore(saved.world),hash=sim.stateHash();
    expect(scene(sim)).toEqual(scene(replay(saved.world)));expect(sim.stateHash()).toBe(hash);expect(hash).toBe(saved.manifest.stateHash);
  });
});
