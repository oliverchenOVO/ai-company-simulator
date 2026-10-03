import type { OfficeFloor, OfficeLayout, OfficeSeat } from './projection';
export type Point3 = [number, number, number];
export interface SceneSeat { seat: OfficeSeat; desk: Point3; person: Point3; elevator: Point3; printer: Point3; meeting: Point3; presentation: Point3 }
export interface SceneFloor { floor: OfficeFloor; y: number; number: number; seats: SceneSeat[] }
export interface OfficeSceneProjection { floors: SceneFloor[]; seats: SceneSeat[]; height: number }
export const FLOOR_PITCH = 3.6;
/** Metre-based adapter only. Role decisions stay in projectOffice. */
export function projectOfficeScene(layout: OfficeLayout): OfficeSceneProjection {
  const floors = layout.floors.map((floor, index) => {
    const y = (layout.floors.length - index - 1) * FLOOR_PITCH;
    const seats = floor.seats.map(seat => {
      const executive = floor.kind === 'executive';
      const x = (seat.zone === 0 ? -6.4 : 3.1) + (seat.slot % 2) * (executive ? 2.9 : 2.5);
      const z = -1.8 + Math.floor(seat.slot / 2) * 2.8;
      return { seat, desk: [x, y, z] as Point3, person: [x, y, z + .85] as Point3,
        elevator: [0, y, -.7] as Point3, printer: [-7.7, y, -2.1] as Point3,
        meeting: [3.9 + (seat.slot % 2) * 2.6, y, seat.slot < 2 ? -.9 : 1.4] as Point3,
        presentation: [7.55, y, .8] as Point3 };
    });
    return { floor, y, number: layout.floors.length - index, seats };
  });
  return { floors, seats: floors.flatMap(f => f.seats), height: layout.floors.length * FLOOR_PITCH };
}
