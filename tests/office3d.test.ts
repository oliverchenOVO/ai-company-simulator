import { describe, it, expect } from 'vitest';
import { Simulation } from '../packages/simulation/src/simulation';
import { projectOffice } from '../apps/desktop/src/features/office/projection';
import { projectOfficeScene } from '../apps/desktop/src/features/office/scene-projection';
import { sampleMotion } from '../apps/desktop/src/features/office/scene-motion';
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
});
