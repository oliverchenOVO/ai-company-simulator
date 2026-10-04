import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { BoxGeometry, CylinderGeometry, SphereGeometry, MeshStandardMaterial, CanvasTexture, SRGBColorSpace, RepeatWrapping, Group, Mesh, PlaneGeometry, MeshBasicMaterial } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Point3 } from './scene-projection';
// Immutable shared resources. Components own transforms, never mutate these materials.
const cube = new BoxGeometry(1, 1, 1), cylinder = new CylinderGeometry(1, 1, 1, 12), sphere = new SphereGeometry(1, 10, 8);
const softCube = new RoundedBoxGeometry(1,1,1,1,.07), smallSphere = new SphereGeometry(1,6,4);
const materials = new Map<string, MeshStandardMaterial>();
type Surface = 'paint' | 'wood' | 'fabric' | 'screen' | 'glass';
const textures=new Map<Surface,CanvasTexture>();
function texture(surface:Surface) {
  if(!textures.has(surface)) {
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
    const ctx=canvas.getContext('2d')!;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,128,128);
    ctx.strokeStyle=surface==='wood' ? '#dfd8d1' : '#ebebeb';ctx.lineWidth=1;
    for(let i=0;i<128;i+=surface==='wood' ? 5 : 4) {
      ctx.beginPath();ctx.moveTo(i,0);ctx.bezierCurveTo(i+Math.sin(i)*2,42,i-2,84,i,128);ctx.stroke();
      if(surface==='fabric'){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}
    }
    const result=new CanvasTexture(canvas);result.colorSpace=SRGBColorSpace;result.wrapS=result.wrapT=RepeatWrapping;
    textures.set(surface,result);
  }
  return textures.get(surface)!;
}
function material(color:string,metal=0,surface:Surface='paint') {
  const key=`${color}:${metal}:${surface}`;
  if(!materials.has(key)) materials.set(key,new MeshStandardMaterial({color,metalness:metal,transparent:surface==='glass',opacity:surface==='glass' ? .2 : 1,depthWrite:surface!=='glass',roughness:surface==='glass' ? .12 : metal ? .3 : surface==='wood' ? .5 : surface==='fabric' ? .96 : surface==='screen' ? .3 : .82,map:surface==='wood' || surface==='fabric' ? texture(surface) : null,emissive:surface==='screen' ? color : '#000000',emissiveIntensity:surface==='screen' ? .15 : 0}));
  return materials.get(key)!;
}
export function Box({p,s,color,shadow=false,metal=0,rotation=0,soft=false,surface='paint'}:{p:Point3;s:Point3;color:string;shadow?:boolean;metal?:number;rotation?:number;soft?:boolean;surface?:Surface}) {
  return <mesh geometry={soft ? softCube : cube} material={material(color,metal,surface)} position={p} scale={s} rotation-y={rotation} castShadow={shadow} receiveShadow dispose={null}/>;
}
export function Round({p,s,color,ball=false,shadow=false,small=false,surface='paint'}:{p:Point3;s:Point3;color:string;ball?:boolean;shadow?:boolean;small?:boolean;surface?:Surface}) {
  return <mesh geometry={ball ? small ? smallSphere : sphere : cylinder} material={material(color,0,surface)} position={p} scale={s} castShadow={shadow} receiveShadow dispose={null}/>;
}
const contactGeometry=new PlaneGeometry(1,1);
let contactMaterial:MeshBasicMaterial|undefined;
export function Contact({p,size}:{p:Point3;size:[number,number]}) {
  if(!contactMaterial) {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d')!;
    const gradient=ctx.createRadialGradient(32,32,4,32,32,32);gradient.addColorStop(0,'rgba(28,43,44,.6)');gradient.addColorStop(.45,'rgba(28,43,44,.3)');gradient.addColorStop(1,'rgba(28,43,44,0)');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);const map=new CanvasTexture(canvas);
    contactMaterial=new MeshBasicMaterial({name:'office-contact-shadow',map,transparent:true,opacity:.35,depthWrite:false,toneMapped:false});
  }
  return <mesh geometry={contactGeometry} material={contactMaterial} position={p} rotation-x={-Math.PI/2} scale={[size[0],size[1],1]} dispose={null}/>;
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
    <Contact p={[0,.065,0]} size={[1.15,1.1]}/>
    <Box p={[0,.48,0]} s={[.59,.13,.56]} color={premium ? '#385a60' : '#53626b'} surface='fabric' shadow soft/>
    <Box p={[0,.75,.23]} s={[.59,premium ? .49 : .42,.12]} color={premium ? '#385a60' : '#53626b'} surface='fabric' shadow soft/>
    <Round p={[0,.24,0]} s={[.055,.43,.055]} color="#8a9799"/>
    {[0,1,2,3,4].map(i => <group key={i} rotation-y={i * Math.PI * 2 / 5}><Box p={[.14,.07,0]} s={[.35,.05,.04]} color="#667579"/><Round p={[.29,.05,0]} s={[.05,.07,.05]} color="#34434a"/></group>)}
    {premium ? [-1,1].map(side => <Box key={side} p={[side * .35,.69,0]} s={[.08,.08,.47]} color="#788787"/>) : null}
  </group>;
}
function ArrivalScreen({id,reduced}:{id:string;reduced:boolean}) {
  const group=useRef<Group>(null),started=useRef<number|null>(null);
  useFrame(({clock})=>{
    if(started.current===null) started.current=clock.elapsedTime;
    if(!group.current) return;
    const awake=reduced || clock.elapsedTime-started.current>=5;
    (group.current.children[0] as Mesh).material=material(awake ? '#84a8b8' : '#263942',0,awake ? 'screen' : 'paint');
    group.current.children[1].visible=awake;group.current.userData.awake=awake;
  });
  return <group ref={group} name={`screen-${id}`} userData={{officeAnimated:true}}>
    <Box p={[0,1.16,-.161]} s={[.69,.37,.01]} color='#263942'/>
    <group visible={reduced}><Box p={[-.12,1.2,-.153]} s={[.37,.18,.01]} color='#e7efea'/><Box p={[.23,1.07,-.153]} s={[.16,.055,.01]} color='#508f93'/></group>
  </group>;
}
export function Desk({ p, premium = false, executive = false, clutter = false, vacant = false, arrivalId, reduced = false }: { p: Point3; premium?: boolean; executive?: boolean; clutter?: boolean; vacant?: boolean; arrivalId?:string; reduced?:boolean }) {
  const width = executive ? 2.4 : premium ? 1.9 : 1.6;
  return <group position={p}>
    <Contact p={[0,.064,0]} size={[width+.4,1.45]}/>
    <Box p={[0,.78,0]} s={[width,.11,.85]} color={executive ? '#ac815d' : premium ? '#b99f7b' : '#e5e7df'} surface={executive || premium ? 'wood' : 'paint'} shadow soft/>
    {[-1,1].map(side => <Box key={side} p={[side * (width / 2 - .12),.38,0]} s={[.07,.76,.66]} color="#879898"/>)}
    <Box p={[-width / 2 + .32,.4,0]} s={[.46,.7,.66]} color={executive ? '#56666b' : '#cbd3cf'} shadow/>
    {[.25,.45,.65].map(y => <Box key={y} p={[-width / 2 + .32,y,.34]} s={[.2,.018,.025]} color="#7c898c"/>)}
    <Box p={[0,1.16,-.2]} s={[.77,.45,.065]} color="#30434a" shadow/>
    {arrivalId && !vacant ? <ArrivalScreen key={arrivalId} id={arrivalId} reduced={reduced}/> : <><Box p={[0,1.16,-.161]} s={[.69,.37,.01]} color={vacant ? '#263942' : '#84a8b8'} surface={vacant ? 'paint' : 'screen'}/>
    {!vacant ? <><Box p={[-.12,1.2,-.153]} s={[.37,.18,.01]} color="#e7efea"/>
    <Box p={[.23,1.07,-.153]} s={[.16,.055,.01]} color="#508f93"/></> : null}</>}
    <Box p={[0,.94,-.2]} s={[.055,.26,.055]} color="#647b7d"/>
    <Box p={[0,.85,-.2]} s={[.36,.025,.19]} color="#7e9394"/>
    <Box p={[0,.851,.2]} s={[.51,.028,.2]} color="#acb9b8"/>
    {!vacant ? <Round p={[width / 2 - .25,.9,.13]} s={[.065,.14,.065]} color="#eee9dc"/> : null}
    <Box p={[-width / 2 + .28,.851,.06]} s={[.32,.02,.35]} color="#f6f3e8" rotation={.12}/>
    {clutter ? [0,1,2,3,4].map(i => <Box key={i} p={[.55,.88+i*.04,.12]} s={[.38,.038,.42]} color={i % 2 ? '#dbc8a7' : '#f1eee3'} rotation={i * .07}/>) : null}
  </group>;
}
export function Plant({ p, size = 1 }: { p: Point3; size?: number }) {
  return <group position={p} scale={size}>
    <Contact p={[0,.065,0]} size={[.8,.8]}/>
    <Round p={[0,.24,0]} s={[.23,.48,.23]} color="#d5d8cd" shadow/>
    <Round p={[0,.8,0]} s={[.025,1.05,.025]} color="#6b7952"/>
    {[0,1,2,3,4,5,6].map(i => <group key={i} rotation-z={(i % 2 ? 1 : -1)*.43} rotation-y={i*2.1} position={[0,.65 + i*.11,0]}><Round p={[.13,.14,0]} s={[.16,.3,.08]} color={i%2 ? '#4d7759' : '#769661'} ball small/></group>)}
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
    <Contact p={[5.2,.063,.25]} size={[executive ? 4.4 : 3.3,2]}/>
    <Box p={[5.2,.78,.25]} s={[executive ? 3.8 : 2.7,.14,1.3]} color={executive ? '#986d4b' : '#c0b094'} surface='wood' shadow soft/>
    <Box p={[5.2,.39,.25]} s={[1.2,.78,.7]} color="#667d7d"/>
    {[3.9,5.2,6.5].flatMap(x => [-.9,1.4].map(z => <Chair key={`${x}:${z}`} p={[x,0,z]} rotation={z<0 ? Math.PI : 0} premium={executive}/>))}
    <Box p={[5.2,.86,.22]} s={[.4,.025,.32]} color="#f6f0de" rotation={.14}/>
    <Plant p={[8,0,2.6]}/><Cabinet p={[7.35,0,-2.9]}/><Board p={[4.9,1.92,-3.28]} analytics={!executive}/>
    <Box p={[7.25,2.1,-3.27]} s={[1.5,.87,.09]} color="#344c57"/><Box p={[7.25,2.1,-3.21]} s={[1.34,.7,.02]} color="#8bb4b4"/>
  </group>;
}
export function Lounge() {
  return <group>
    <Contact p={[-3.15,.063,-2.25]} size={[2.8,1.8]}/>
    <Box p={[-3.15,.065,-1.65]} s={[2.8,.025,2.3]} color='#b6ab95' surface='fabric'/>
    {[-3.7,-2.7].map(x=><Box key={x} p={[x,.71,-2.32]} s={[.45,.25,.4]} color='#d6c4a3' surface='fabric' soft/>)}
    <Box p={[-3.15,.45,-2.25]} s={[1.85,.3,.74]} color='#466964' surface='fabric' shadow soft/>
    <Box p={[-3.15,.89,-2.55]} s={[1.85,.68,.18]} color='#466964' surface='fabric' shadow soft/>
    {[-4.02,-2.28].map(x => <Box key={x} p={[x,.65,-2.25]} s={[.18,.58,.79]} color="#657c76"/>)}
    <Round p={[-3.15,.4,-1.1]} s={[.52,.075,.52]} color="#bca17d" shadow/>
    <Round p={[-3.15,.2,-1.1]} s={[.055,.4,.055]} color="#647775"/>
    <Cabinet p={[-6.15,0,-2.95]} shelf/><Plant p={[-8,0,2.6]}/>
    <Box p={[-3.2,2.1,-3.27]} s={[1.5,1.05,.09]} color="#928571"/><Box p={[-3.2,2.1,-3.2]} s={[1.35,.9,.02]} color="#dad9c7"/>
    <Round p={[-3.4,2.2,-3.16]} s={[.23,.23,.02]} color="#7da39b" ball/>
    <Box p={[-2.95,1.9,-3.16]} s={[.36,.42,.02]} color="#bca17c"/>
  </group>;
}
