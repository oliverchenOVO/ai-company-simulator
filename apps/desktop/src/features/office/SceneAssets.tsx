import { useEffect, useMemo } from 'react';
import { BoxGeometry, CylinderGeometry, SphereGeometry, MeshStandardMaterial, CanvasTexture, SRGBColorSpace } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Point3 } from './scene-projection';
// Immutable shared resources. Components own transforms, never mutate these materials.
const cube = new BoxGeometry(1, 1, 1), cylinder = new CylinderGeometry(1, 1, 1, 12), sphere = new SphereGeometry(1, 10, 8);
const softCube = new RoundedBoxGeometry(1,1,1,2,.07);
const materials = new Map<string, MeshStandardMaterial>();
function material(color: string, metal = 0) {
  const key = `${color}:${metal}`;
  if (!materials.has(key)) materials.set(key, new MeshStandardMaterial({ color, roughness: metal ? .38 : .78, metalness: metal }));
  return materials.get(key)!;
}
export function Box({ p, s, color, shadow = false, metal = 0, rotation = 0, soft = false }: { p: Point3; s: Point3; color: string; shadow?: boolean; metal?: number; rotation?: number; soft?: boolean }) {
  return <mesh geometry={soft ? softCube : cube} material={material(color, metal)} position={p} scale={s} rotation-y={rotation} castShadow={shadow} receiveShadow dispose={null}/>;
}
export function Round({ p, s, color, ball = false, shadow = false }: { p: Point3; s: Point3; color: string; ball?: boolean; shadow?: boolean }) {
  return <mesh geometry={ball ? sphere : cylinder} material={material(color)} position={p} scale={s} castShadow={shadow} receiveShadow dispose={null}/>;
}
export function Label({ text, p, width = 2.1, color = '#375a62', background = '#f2f5ef' }: { text: string; p: Point3; width?: number; color?: string; background?: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = background; ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = color; ctx.font = '600 42px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 66, 485);
    const result = new CanvasTexture(canvas); result.colorSpace = SRGBColorSpace; return result;
  }, [text, color, background]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={p}><planeGeometry args={[width, width / 4]}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>;
}
export function Chair({ p, premium = false, rotation = 0 }: { p: Point3; premium?: boolean; rotation?: number }) {
  return <group position={p} rotation-y={rotation}>
    <Box p={[0,.48,0]} s={[.59,.13,.56]} color={premium ? '#385a60' : '#53626b'} shadow soft/>
    <Box p={[0,.84,.23]} s={[.59,premium ? .68 : .48,.12]} color={premium ? '#385a60' : '#53626b'} shadow soft/>
    <Round p={[0,.24,0]} s={[.055,.43,.055]} color="#8a9799"/>
    {[0,1,2,3,4].map(i => <group key={i} rotation-y={i * Math.PI * 2 / 5}><Box p={[.14,.07,0]} s={[.35,.05,.04]} color="#667579"/><Round p={[.29,.05,0]} s={[.05,.07,.05]} color="#34434a"/></group>)}
    {premium ? [-1,1].map(side => <Box key={side} p={[side * .35,.69,0]} s={[.08,.08,.47]} color="#788787"/>) : null}
  </group>;
}
export function Desk({ p, premium = false, executive = false, clutter = false }: { p: Point3; premium?: boolean; executive?: boolean; clutter?: boolean }) {
  const width = executive ? 2.4 : premium ? 1.9 : 1.6;
  return <group position={p}>
    <Box p={[0,.78,0]} s={[width,.11,.85]} color={executive ? '#ac815d' : premium ? '#d2b593' : '#e5e7df'} shadow soft/>
    {[-1,1].map(side => <Box key={side} p={[side * (width / 2 - .12),.38,0]} s={[.07,.76,.66]} color="#879898"/>)}
    <Box p={[-width / 2 + .32,.4,0]} s={[.46,.7,.66]} color={executive ? '#56666b' : '#cbd3cf'} shadow/>
    {[.25,.45,.65].map(y => <Box key={y} p={[-width / 2 + .32,y,.34]} s={[.2,.018,.025]} color="#7c898c"/>)}
    <Box p={[0,1.16,-.2]} s={[.77,.45,.065]} color="#30434a" shadow/>
    <Box p={[0,1.16,-.161]} s={[.69,.37,.01]} color="#b5d6d7"/>
    <Box p={[-.12,1.2,-.153]} s={[.37,.18,.01]} color="#e7efea"/>
    <Box p={[.23,1.07,-.153]} s={[.16,.055,.01]} color="#508f93"/>
    <Box p={[0,.94,-.2]} s={[.055,.26,.055]} color="#647b7d"/>
    <Box p={[0,.85,-.2]} s={[.36,.025,.19]} color="#7e9394"/>
    <Box p={[0,.851,.2]} s={[.51,.028,.2]} color="#acb9b8"/>
    <Round p={[width / 2 - .25,.9,.13]} s={[.065,.14,.065]} color="#eee9dc"/>
    <Box p={[-width / 2 + .28,.851,.06]} s={[.32,.02,.35]} color="#f6f3e8" rotation={.12}/>
    {clutter ? [0,1,2,3,4].map(i => <Box key={i} p={[.55,.88+i*.04,.12]} s={[.38,.038,.42]} color={i % 2 ? '#dbc8a7' : '#f1eee3'} rotation={i * .07}/>) : null}
  </group>;
}
export function Plant({ p, size = 1 }: { p: Point3; size?: number }) {
  return <group position={p} scale={size}>
    <Round p={[0,.24,0]} s={[.23,.48,.23]} color="#d5d8cd" shadow/>
    <Round p={[0,.8,0]} s={[.025,1.05,.025]} color="#6b7952"/>
    {[0,1,2,3,4,5,6].map(i => <group key={i} rotation-z={(i % 2 ? 1 : -1)*.43} rotation-y={i*2.1} position={[0,.65 + i*.11,0]}><Round p={[.13,.14,0]} s={[.16,.3,.08]} color={i%2 ? '#6d895e' : '#8f9f73'} ball/></group>)}
  </group>;
}
export function Cabinet({ p, shelf = false }: { p: Point3; shelf?: boolean }) {
  return <group position={p}>
    <Box p={[0,.85,0]} s={[1.45,1.7,.4]} color={shelf ? '#b29673' : '#c6ceca'} shadow/>
    {[.3,.85,1.4].map(y => <group key={y}>
      <Box p={[0,y,.23]} s={[1.27,.4,.06]} color={shelf ? '#7f725e' : '#e2e5dc'}/>
      {shelf ? [0,1,2,3,4,5].map(i => <Box key={i} p={[-.52+i*.17,y,.29]} s={[.1,.24+(i%3)*.04,.22]} color={['#4c7777','#decead','#768798'][i%3]}/>) : <Box p={[0,y,.29]} s={[.18,.04,.04]} color="#889895"/>}
    </group>)}
  </group>;
}
export function Board({ p, analytics = false }: { p: Point3; analytics?: boolean }) {
  return <group position={p}>
    <Box p={[0,0,0]} s={[2.4,1.23,.09]} color="#7f9393"/>
    <Box p={[0,0,.06]} s={[2.26,1.1,.03]} color="#f3f2e6"/>
    {analytics ? [0,1,2,3,4].map(i => <Box key={i} p={[-.75+i*.35,-.3+(i%3)*.1,.085]} s={[.21,.3+(i%3)*.2,.01]} color={i%2 ? '#87aaa8' : '#c9b98a'}/>) : [0,1,2].map(i => <Box key={i} p={[-.55+i*.54,.15-(i%2)*.34,.086]} s={[.35,.25,.01]} color={i%2 ? '#dfd3a4' : '#accdcc'}/>)}
  </group>;
}
export function Printer({ p }: { p: Point3 }) {
  return <group position={p}><Box p={[0,.4,0]} s={[.7,.8,.6]} color="#cdd4ce"/><Box p={[0,.89,0]} s={[.65,.2,.55]} color="#55646a"/><Box p={[0,1.01,0]} s={[.43,.025,.39]} color="#ecefe9"/><Box p={[0,.92,.29]} s={[.34,.06,.02]} color="#a9c4bf"/></group>;
}
export function Meeting({ executive }: { executive: boolean }) {
  return <group>
    <Box p={[5.2,.78,.25]} s={[executive ? 3.8 : 2.7,.14,1.3]} color={executive ? '#bb9670' : '#d5cbb9'} shadow soft/>
    <Box p={[5.2,.39,.25]} s={[1.2,.78,.7]} color="#667d7d"/>
    {[3.9,5.2,6.5].flatMap(x => [-.9,1.4].map(z => <Chair key={`${x}:${z}`} p={[x,0,z]} rotation={z<0 ? Math.PI : 0} premium={executive}/>))}
    <Box p={[5.2,.86,.22]} s={[.4,.025,.32]} color="#f6f0de" rotation={.14}/>
    <Plant p={[8,0,2.6]}/><Cabinet p={[7.35,0,-2.9]}/><Board p={[4.9,1.92,-3.28]} analytics={!executive}/>
    <Box p={[7.25,2.1,-3.27]} s={[1.5,.87,.09]} color="#344c57"/><Box p={[7.25,2.1,-3.21]} s={[1.34,.7,.02]} color="#8bb4b4"/>
  </group>;
}
export function Lounge() {
  return <group>
    <Box p={[-3.15,.45,-2.25]} s={[1.85,.3,.74]} color="#6d7f79" shadow soft/>
    <Box p={[-3.15,.89,-2.55]} s={[1.85,.68,.18]} color="#6d7f79" shadow soft/>
    {[-4.02,-2.28].map(x => <Box key={x} p={[x,.65,-2.25]} s={[.18,.58,.79]} color="#657c76"/>)}
    <Round p={[-3.15,.4,-1.1]} s={[.52,.075,.52]} color="#bca17d" shadow/>
    <Round p={[-3.15,.2,-1.1]} s={[.055,.4,.055]} color="#647775"/>
    <Cabinet p={[-6.15,0,-2.95]} shelf/><Plant p={[-8,0,2.6]}/>
    <Box p={[-3.2,2.1,-3.27]} s={[1.5,1.05,.09]} color="#928571"/><Box p={[-3.2,2.1,-3.2]} s={[1.35,.9,.02]} color="#dad9c7"/>
    <Round p={[-3.4,2.2,-3.16]} s={[.23,.23,.02]} color="#7da39b" ball/>
    <Box p={[-2.95,1.9,-3.16]} s={[.36,.42,.02]} color="#bca17c"/>
  </group>;
}
