import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Group, PerspectiveCamera, Vector3, ACESFilmicToneMapping, BufferGeometry, Mesh, InstancedMesh, Matrix4, MeshStandardMaterial, Line, LineBasicMaterial, MathUtils } from 'three';
import type { OfficeLayout, OfficeSeat, Overlay } from './projection';
import { projectOfficeScene, type SceneFloor, type SceneSeat, type OfficeSceneProjection } from './scene-projection';
import { sampleMotion } from './scene-motion';
import { characterStyle } from './character-style';
import { planChoreography, participation, sampleChoreography, type Choreography } from './scene-choreography';
import { Box, Round, Label, Chair, Desk, Plant, Cabinet, Board, Printer, Meeting, Lounge } from './SceneAssets';
export interface SceneProps { layout: OfficeLayout; previousScene?:OfficeSceneProjection; selected?: OfficeSeat; floorId: string | null; overlay: Overlay; reduced: boolean; zoom: number; choose: (id: string) => void; failed: () => void }

/** Batch immutable furniture by shared geometry/material; articulated people stay independent. */
function StaticBuilding({children,revision}: {children:ReactNode;revision:string}) {
  const root=useRef<Group>(null);
  useLayoutEffect(()=>{
    const group=root.current!; group.updateMatrixWorld(true);
    const sources:Mesh[]=[]; const buckets=new Map<string,Mesh[]>();
    group.traverse(object=>{if(object instanceof Mesh && (object.material instanceof MeshStandardMaterial || !Array.isArray(object.material) && object.material.name==='office-contact-shadow')) {
      let ancestor=object.parent;while(ancestor && ancestor!==group){if(ancestor.userData.officeAnimated) return;ancestor=ancestor.parent;}
      sources.push(object); const key=`${object.geometry.uuid}:${object.material.uuid}:${object.castShadow}`;
      const list=buckets.get(key) ?? []; list.push(object); buckets.set(key,list);
    }});
    const inverse=group.matrixWorld.clone().invert(), matrix=new Matrix4(), batches:InstancedMesh[]=[];
    for(const list of buckets.values()) {
      const source=list[0], batch=new InstancedMesh(source.geometry,source.material,list.length);
      batch.castShadow=source.castShadow; batch.receiveShadow=true;
      list.forEach((mesh,i)=>{batch.setMatrixAt(i,matrix.multiplyMatrices(inverse,mesh.matrixWorld)); mesh.visible=false;});
      batch.instanceMatrix.needsUpdate=true; batch.computeBoundingSphere(); group.add(batch); batches.push(batch);
    }
    return ()=>{for(const mesh of sources) mesh.visible=true; for(const batch of batches){group.remove(batch);batch.dispose();}};
  },[revision]);
  return <group ref={root}>{children}</group>;
}

function CameraRig({ height, floorY, zoom, reduced }: { height: number; floorY?: number; zoom: number; reduced: boolean }) {
  const { camera, size, invalidate } = useThree();
  const target = useRef(new Vector3(0, height / 2 - .8, 0));
  useLayoutEffect(() => {
    const center = floorY === undefined ? height / 2 - .3 : floorY + 1.3;
    target.current.set(0,center,0);
    const direction=new Vector3(.42,.32,.91).normalize();
    camera.position.copy(direction.clone().multiplyScalar(100).add(target.current));camera.lookAt(target.current);camera.updateMatrixWorld();
    const tangent=Math.tan(32*Math.PI/360),aspect=size.width/size.height;
    if(camera instanceof PerspectiveCamera){camera.aspect=aspect;camera.updateProjectionMatrix();}
    const lower=floorY === undefined ? -.65 : floorY-.5,upper=floorY === undefined ? height-.4 : floorY+3.1;
    // The cutaway has no front ceiling: fit the visible walls, slabs and people,
    // then center their perspective bounds instead of fitting an empty box.
    const points:Vector3[]=[];
    for(const x of [-9.4,9.4]) for(const [y,z] of [[lower,-3.7],[lower,4],[upper,-3.7],[upper-1,4]]) points.push(new Vector3(x,y,z));
    let distance=Math.max(height,20);
    const right=new Vector3(1,0,0).applyQuaternion(camera.quaternion),up=new Vector3(0,1,0).applyQuaternion(camera.quaternion);
    for(let pass=0;pass<8;pass++) {
      camera.position.copy(direction.clone().multiplyScalar(distance).add(target.current));camera.lookAt(target.current);camera.updateMatrixWorld();
      if(camera instanceof PerspectiveCamera){camera.far=distance+height+100;camera.updateProjectionMatrix();}
      const projected=points.map(p=>p.clone().project(camera));
      const left=Math.min(...projected.map(p=>p.x)),rightEdge=Math.max(...projected.map(p=>p.x)),bottom=Math.min(...projected.map(p=>p.y)),top=Math.max(...projected.map(p=>p.y));
      target.current.addScaledVector(right,(left+rightEdge)/2*distance*tangent*aspect).addScaledVector(up,((bottom+top)/2+.03)*distance*tangent);
      distance*=Math.max((rightEdge-left)/1.86,(top-bottom)/1.82);
    }
    distance/=zoom;
    camera.position.copy(direction.multiplyScalar(distance).add(target.current));camera.lookAt(target.current);camera.updateMatrixWorld();
    if(camera instanceof PerspectiveCamera){camera.near=.1;camera.far=distance+height+100;camera.updateProjectionMatrix();}
    invalidate();
  }, [camera, size.width, size.height, height, floorY, zoom, reduced, invalidate]);
  return null;
}
function Floor({ data, selected, overlay, arrivals, reduced }: { data: SceneFloor; selected?: OfficeSeat; overlay: Overlay; arrivals:Map<string,string>; reduced:boolean }) {
  const { floor, y, number } = data, executive = floor.kind === 'executive', management = floor.kind === 'management';
  const furnitureSeats = data.seats.length ? data.seats : [];
  const capacity = executive ? 1 : management ? 4 : 8;
  const emptyDesks = Array.from({length:capacity},(_,i)=>({zone:management || executive ? 0 : Math.floor(i/4),slot:i%4})).filter(p=>!floor.seats.some(s=>s.zone===p.zone && s.slot===p.slot));
  return <group position={[0,y,0]}>
    {executive ? <pointLight position={[-4,2.6,2]} color={executive ? '#ffe8cb' : '#f2faf5'} intensity={9} distance={13} decay={2}/> : null}
    {executive ? <pointLight position={[5,2.5,2]} color="#fff0d9" intensity={7} distance={12} decay={2}/> : null}
    <Box p={[0,-.17,0]} s={[18,.24,7]} color="#829492" soft shadow/>
    <Box p={[-4.95,.025,0]} s={[8.1,.06,6.9]} color={executive ? '#ae8764' : management ? '#708993' : '#e0e3d9'} surface={executive ? 'wood' : 'paint'}/>
    <Box p={[4.95,.025,0]} s={[8.1,.06,6.9]} color={executive ? '#cfb692' : management ? '#8499a3' : '#e0e3d9'}/>
    {executive ? Array.from({length:16},(_,i) => <Box key={i} p={[-8.7+i*.5,.061,0]} s={[.016,.006,6.85]} color="#bca282"/>) : Array.from({length:7},(_,i) => <Box key={i} p={[0,.061,-3+i]} s={[17.8,.005,.012]} color="#c3ccc5"/>)}
    <Box p={[0,1.52,-3.45]} s={[18,3,.18]} color={executive ? '#e4d8c3' : management ? '#c9d5da' : '#e6e9e2'} shadow/>
    <Box p={[-8.92,1.05,0]} s={[.18,2.1,7]} color="#c7d2ce" shadow/>
    <Box p={[8.92,.55,-.9]} s={[.08,1.1,5.1]} color='#b4d4d6' surface='glass'/>
    {executive ? Array.from({length:13},(_,i)=><Box key={`slat-${i}`} p={[-7.75+i*.23,1.8,-3.32]} s={[.09,2.35,.045]} color='#a6815d' surface='wood'/>) : null}
    {[-5,5].map(x=><group key={`light-${x}`}><Box p={[x,2.85,-3.28]} s={[2.4,.055,.16]} color='#7d9193' metal={.65}/><Box p={[x,2.81,-3.23]} s={[2.3,.03,.1]} color={executive ? '#efd4a2' : '#dae8e8'} surface='screen'/></group>)}
    <Box p={[8.92,1.12,-.9]} s={[.09,.035,5.1]} color='#7f969c' metal={.6}/>
    <Box p={[0,3.03,-3.4]} s={[18,.12,.26]} color="#819997"/>
    {/* Elevator core remains open-front, with two metal doors and inset cabin. */}
    <Box p={[0,1.5,-2.2]} s={[1.8,3,2.5]} color="#5e777d" metal={.25} shadow/>
    <Box p={[0,1.18,-.91]} s={[1.45,2.36,.07]} color="#4c7277"/>
    {[-1,1].map(side => <Box key={side} p={[side*.35,1.15,-.85]} s={[.67,2.22,.045]} color="#a8b4b7" metal={.7}/>)}
    <Box p={[0,1.15,-.817]} s={[.018,2.24,.02]} color="#4b7478"/>
    <Box p={[.82,1.23,-.81]} s={[.085,.3,.04]} color="#c7d7ca"/>
    <Round p={[.82,1.28,-.78]} s={[.02,.02,.015]} color="#eadcaa" ball/>
    <Label text={`${number}F`} p={[0,2.68,-.79]} width={.74} color="#e6efeb" background="#649594"/>
    <Label text={`${number}F  ${floor.label}`} p={[-6.4,-.16,3.52]} width={3.1}/>
    {furnitureSeats.map(({seat,desk}) => <group key={seat.id} position={[desk[0],0,desk[2]]}>
      <Desk p={[0,0,0]} premium={management} executive={executive} clutter={seat.overloaded} vacant={seat.vacant} arrivalId={arrivals.get(seat.employeeId)} reduced={reduced}/><Chair p={[0,0,.85]} premium={management || executive}/>
      {(seat.overloaded || overlay==='concerns' && seat.concerns.length>0) ? <Label text="!" p={[.75,1.65,.1]} width={.38} color="#925300" background="#fff0d3"/> : null}
      {overlay==='management' && seat.reportIds.length ? <Label text={`${seat.reportIds.length} 位部屬`} p={[0,.48,.48]} width={1.45}/> : null}
      {seat.vacant ? <Label text="空席" p={[0,.48,.49]} width={.8}/> : null}
    </group>)}
    {emptyDesks.map(p=><group key={`${p.zone}:${p.slot}`} position={[(p.zone===0 ? -6.4 : 3.1)+(p.slot%2)*(executive ? 2.9 : 2.5),0,-1.8+Math.floor(p.slot/2)*2.8]}><Desk p={[0,0,0]} premium={management} executive={executive} vacant/><Chair p={[0,0,.85]} premium={management || executive}/></group>)}
    {executive ? <><Lounge/><Meeting executive/><Chair p={[-6.4,0,.4]} rotation={Math.PI}/></> : management ? <>
      <Meeting executive={false}/><Board p={[-5.8,2.08,-3.28]} analytics/><Cabinet p={[-8,0,-2.95]} shelf/><Printer p={[-7.7,0,-2.1]}/><Plant p={[-8,0,2.6]}/>
    </> : <>
      <Board p={[-4.5,2.06,-3.28]}/><Board p={[4.7,2.06,-3.28]} analytics/>
      <Cabinet p={[-7.8,0,-2.94]}/><Cabinet p={[7.8,0,-2.94]}/><Printer p={[-7.7,0,-2.1]}/>
      <Plant p={[-8.2,0,2.7]} size={.8}/><Plant p={[8.1,0,2.6]} size={.8}/>
      <Box p={[1.8,.43,-2.8]} s={[.55,.86,.57]} color="#c2cfc7"/><Round p={[1.8,1.12,-2.8]} s={[.19,.5,.19]} color="#8fafb0"/>
    </>}
    {selected?.floorId === floor.id ? <Box p={[0,-.351,3.35]} s={[17.8,.018,.12]} color="#388e8e"/> : null}
  </group>;
}
function Human({ data, layout, selected, reduced, choose, allSeats, previousSeat, plan, epochs, focusY }: { data: SceneSeat; layout: OfficeLayout; selected?: OfficeSeat; reduced: boolean; choose: (id: string) => void; allSeats: Map<string, SceneSeat>;previousSeat?:SceneSeat; plan:Choreography; epochs:Map<string,number>; focusY?:number }) {
  const body = useRef<Group>(null), facing=useRef<Group>(null), head = useRef<Group>(null), leftArm = useRef<Group>(null), rightArm = useRef<Group>(null), legs = useRef<Group>(null), folder = useRef<Group>(null);
  const previous = useRef<SceneSeat | undefined>(previousSeat), current = useRef(data), started = useRef<number | null>(null);
  const leftLeg=useRef<Group>(null), rightLeg=useRef<Group>(null), leftKnee=useRef<Group>(null),rightKnee=useRef<Group>(null), lastPosition=useRef(new Vector3(...data.person));
  const cue = layout.cues.find(c => c.employeeId === data.seat.employeeId);
  const cueId = useRef(cue?.id);
  const manager = data.seat.managerId ? allSeats.get(data.seat.managerId) : undefined;
  const a = useMemo(()=>characterStyle(data.seat.employeeId,data.seat.appearance),[data.seat.employeeId,data.seat.appearance]);
  const gait=useRef(0),promotion=useRef<Group>(null);
  useFrame(({clock,camera},delta) => {
    if (started.current === null) started.current = clock.elapsedTime;
    if (current.current.seat.floorId !== data.seat.floorId || cueId.current !== cue?.id) {
      previous.current = current.current; current.current = data; cueId.current = cue?.id; started.current = clock.elapsedTime;
    }
    const t = clock.elapsedTime - started.current;
    // Legacy gestures are restricted to supported real participants by this planner.
    const safeCue=cue?.type==='Discussing' ? undefined : cue?.type==='Celebrating' ? {...cue,type:'Moving' as const} : cue;
    let motion = sampleMotion(data,t,reduced,safeCue,manager,previous.current,false);
    const member=participation(data,plan);
    if(member) {
      if(!epochs.has(member.cueId)) epochs.set(member.cueId,clock.elapsedTime);
      motion=sampleChoreography(data,clock.elapsedTime-epochs.get(member.cueId)!,reduced,plan,allSeats) ?? motion;
    }
    if (!body.current) return;
    const moving = motion.pose==='Walking', seated = motion.seated ?? (motion.pose==='Idle' || motion.pose==='Typing' || motion.pose==='Reading' && !motion.document);
    body.current.position.set(...motion.position); body.current.visible=motion.visible && (focusY===undefined || Math.abs(motion.position[1]-focusY)<.1);
    body.current.userData.pose=motion.pose;
    body.current.userData.seated=seated; body.current.userData.vignette=motion.vignette ?? null;
    body.current.userData.atWorkstation=motion.visible && motion.pose!=='Walking' && motion.position.every((n,i)=>Math.abs(n-data.person[i])<.01);
    const dx=motion.position[0]-lastPosition.current.x,dz=motion.position[2]-lastPosition.current.z;
    if(moving) gait.current+=Math.hypot(dx,dz)*8;
    if(facing.current) {
      const yaw=motion.facingYaw ?? (moving && Math.hypot(dx,dz)>.001 ? Math.atan2(dx,dz) : seated ? Math.PI : motion.pose==='Presenting' ? -Math.PI/2 : facing.current.rotation.y);
      const nearest=facing.current.rotation.y+Math.atan2(Math.sin(yaw-facing.current.rotation.y),Math.cos(yaw-facing.current.rotation.y));
      facing.current.rotation.y=reduced ? yaw : MathUtils.damp(facing.current.rotation.y,nearest,12,delta);
    }
    lastPosition.current.set(...motion.position);
    body.current.userData.facingYaw=facing.current?.rotation.y ?? 0;
    const oscillation = reduced ? 0 : Math.sin((moving ? gait.current : t*3) + a.phase);
    if(head.current){head.current.rotation.x=motion.pose==='Reading' ? -.12 : oscillation*.025;const toward=Math.atan2(camera.position.x-motion.position[0],camera.position.z-motion.position[2])-(facing.current?.rotation.y ?? 0);const glance=selected?.employeeId===data.seat.employeeId ? MathUtils.clamp(Math.atan2(Math.sin(toward),Math.cos(toward)),-.9,.9) : oscillation*.08;head.current.rotation.y=MathUtils.damp(head.current.rotation.y,glance,6,delta);}
    if (leftArm.current) leftArm.current.rotation.x=moving ? oscillation*.45 : motion.pose==='Typing' ? -1.35+oscillation*.04 : motion.pose==='Talking' ? -.65+oscillation*.15 : -.15;
    if (rightArm.current) { rightArm.current.rotation.x=moving ? -oscillation*.45 : motion.pose==='Presenting' ? -1.25 : motion.document ? -.9 : motion.pose==='Typing' ? -1.35-oscillation*.04 : -.12; rightArm.current.rotation.z=motion.pose==='Talking' || motion.pose==='Presenting' ? -.15 : 0; }
    if(leftLeg.current) leftLeg.current.rotation.x=seated ? -1.5 : moving ? oscillation*.5 : 0;
    if(rightLeg.current) rightLeg.current.rotation.x=seated ? -1.5 : moving ? -oscillation*.5 : 0;
    if(leftKnee.current) leftKnee.current.rotation.x=seated ? 1.5 : 0;
    if(rightKnee.current) rightKnee.current.rotation.x=seated ? 1.5 : 0;
    body.current.position.y += seated ? -.32 : moving ? Math.abs(oscillation)*.035 : 0;
    if (folder.current) folder.current.visible=motion.document;
    if(promotion.current) promotion.current.visible=!reduced && cue?.type==='Celebrating' && t<8;
  });
  return <group name={data.seat.employeeId} ref={body} position={data.person} onClick={e => { e.stopPropagation(); choose(data.seat.employeeId); }}>
    <group ref={facing}>
    {/* Human proportions use an articulated torso, head, limbs, shoes and ID-derived hair. */}
    <Round p={[0,1.04,0]} s={[.23,.49,.15]} color={a.clothing} surface='fabric' shadow/>
    <Box p={[0,1.1,.132]} s={[.12,.38,.02]} color={a.jacket ? a.collar : a.clothing}/>
    <Round p={[0,1.33,0]} s={[.075,.12,.075]} color={a.skin}/>
    <group ref={head} position={[0,1.48,0]}>
      <Round p={[0,0,0]} s={[.17,.215,.16]} color={a.skin} ball shadow/>
      <Round p={[0,.13,-.025]} s={[.177,.11,.164]} color={a.hair} ball/>
      {a.hairStyle>=2 ? <Round p={[0,-.05,-.13]} s={[.177,.23,.09]} color={a.hair} ball shadow/> : null}
      {a.hairStyle===1 ? <Round p={[.11,.07,-.15]} s={[.085,.09,.09]} color={a.hair} ball small/> : null}
      <Round p={[0,-.02,.16]} s={[.028,.03,.035]} color={a.skin} ball small/>
      {[-1,1].map(side => <Round key={side} p={[side*.056,.018,.148]} s={[.013,.014,.008]} color="#344345" ball small/>)}
      {a.accessory ? <>{[-1,1].map(side=><group key={side}><Box p={[side*.066,.016,.16]} s={[.1,.065,.02]} color="#4a5858" soft/><Box p={[side*.066,.016,.174]} s={[.076,.043,.012]} color="#bbd0cd"/></group>)}<Box p={[0,.016,.165]} s={[.036,.016,.02]} color="#4a5858"/></> : null}
    </group>
    {[-1,1].map(side => <group key={side} ref={side<0 ? leftArm : rightArm} position={[side*.26,1.23,0]}>
      <Round p={[0,-.2,0]} s={[.068,.38,.068]} color={a.clothing} surface='fabric' shadow/>
      <Round p={[0,-.43,.015]} s={[.063,.18,.06]} color={a.skin}/>
    </group>)}
    <group ref={legs}>
      {a.hairStyle===3 ? <Round p={[0,.69,0]} s={[.24,.25,.17]} color="#53676b" shadow/> : null}
      {[-1,1].map(side => <group key={side} ref={side<0 ? leftLeg : rightLeg} position={[side*.115,.8,0]}><Round p={[0,-.18,0]} s={[.078,.36,.075]} color={a.trousers} shadow/><group ref={side<0 ? leftKnee : rightKnee} position={[0,-.36,0]}><Round p={[0,-.19,0]} s={[.072,.38,.072]} color={a.hairStyle===3 ? a.skin : a.trousers} shadow/><Box p={[0,-.38,.07]} s={[.17,.14,.29]} color={a.shoes} soft/></group></group>)}
    </group>
    <group ref={folder} visible={false}><Box p={[.32,.88,.24]} s={[.29,.38,.045]} color="#c9b78e" rotation={.2}/><Box p={[.32,.89,.267]} s={[.21,.3,.012]} color="#eee9d9"/></group>
    </group>
    <group ref={promotion} visible={false}><mesh rotation-x={-Math.PI/2} position={[0,.04,0]}><ringGeometry args={[.37,.43,24]}/><meshBasicMaterial color='#b59862' side={2}/></mesh></group>
    {selected?.employeeId===data.seat.employeeId ? <><mesh rotation-x={-Math.PI/2} position={[0,.35,0]}><ringGeometry args={[.42,.48,32]}/><meshBasicMaterial color="#159b98" side={2}/></mesh><Label text={data.seat.name} p={[0,1.96,.05]} width={2.1}/></> : null}
  </group>;
}
function ReportingPath({a,b}: {a:SceneSeat;b:SceneSeat}) {
  const geometry=useMemo(()=>new BufferGeometry().setFromPoints([
    new Vector3(a.person[0],a.person[1]+1.7,a.person[2]),new Vector3(a.person[0],a.person[1]+1.7,3.9),new Vector3(1.15,a.person[1]+1.7,3.9),
    new Vector3(1.15,b.person[1]+1.7,3.9),new Vector3(b.person[0],b.person[1]+1.7,3.9),new Vector3(b.person[0],b.person[1]+1.7,b.person[2])
  ]),[a,b]);
  const line=useMemo(()=>new Line(geometry,new LineBasicMaterial({color:'#269c9d',transparent:true,opacity:.4})),[geometry]);
  useEffect(()=>()=>{geometry.dispose();line.material.dispose();},[geometry,line]);
  return <primitive object={line} dispose={null}/>;
}
function Diagnostics({ ready, failed }: { ready: () => void; failed: () => void }) {
  const { gl, scene } = useThree();
  const recorded = useRef(false);
  const frames=useRef(0), time=useRef(0);
  const published=useRef(0);
  useEffect(() => { const canvas=gl.domElement; const onLoss=(e: Event) => { e.preventDefault(); failed(); }; canvas.addEventListener('webglcontextlost',onLoss); return () => canvas.removeEventListener('webglcontextlost',onLoss); },[gl,failed]);
  useFrame(({camera},delta) => {
    gl.render(scene,camera); frames.current++; time.current+=delta;
    if(frames.current===1 || time.current-published.current>=.25) {
      published.current=time.current;
      gl.domElement.dataset.frameCount=String(frames.current);
      gl.domElement.dataset.pixelRatio=String(gl.getPixelRatio());
      if(camera instanceof PerspectiveCamera) gl.domElement.dataset.cameraAspect=String(camera.aspect);
      const poses:Record<string,{pose:string;atWorkstation:boolean;visible:boolean;facingYaw:number;seated:boolean;vignette:string|null}>={};
      scene.traverse(object=>{if(object.name.startsWith('employee-')) poses[object.name]={pose:object.userData.pose,atWorkstation:object.userData.atWorkstation,visible:object.visible,facingYaw:object.userData.facingYaw,seated:object.userData.seated,vignette:object.userData.vignette};});
      gl.domElement.dataset.presentations=JSON.stringify(poses);
      const screens:Record<string,boolean>={};scene.traverse(object=>{if(object.name.startsWith('screen-')) screens[object.name.slice(7)]=object.userData.awake;});gl.domElement.dataset.screens=JSON.stringify(screens);
      if(time.current>=.25) gl.domElement.dataset.frameMs=String(Math.round(time.current/frames.current*10000)/10);
    }
    if (!recorded.current && gl.info.render.calls>0) {
      recorded.current=true; gl.domElement.dataset.officeReady='true'; gl.domElement.dataset.drawCalls=String(gl.info.render.calls); gl.domElement.dataset.triangles=String(gl.info.render.triangles); gl.domElement.dataset.objects=String(scene.children.length); gl.domElement.dataset.pixelRatio=String(gl.getPixelRatio());
      const targets:Record<string,{x:number;y:number}>={};
      scene.traverse(object=>{if(object.name.startsWith('employee-')){const point=object.getWorldPosition(new Vector3());point.y+=1.48;point.project(camera);targets[object.name]={x:(point.x+1)*gl.domElement.clientWidth/2,y:(1-point.y)*gl.domElement.clientHeight/2};}});
      gl.domElement.dataset.employeeTargets=JSON.stringify(targets); ready();
    }
  },1);
  return null;
}
function FrameDriver({reduced,software}:{reduced:boolean;software:boolean}) {
  const invalidate=useThree(s=>s.invalidate);
  const timer=useRef<number|undefined>(undefined);
  useEffect(()=>{
    if(!reduced) invalidate();
    return()=>window.clearTimeout(timer.current);
  },[invalidate,reduced,software]);
  // Run after Diagnostics' real draw. An interval can keep a slow software
  // rasterizer continuously busy; one outstanding post-frame timer leaves
  // an explicit input/cleanup gap and never accumulates missed frames.
  useFrame(()=>{
    window.clearTimeout(timer.current);
    if(!reduced) timer.current=window.setTimeout(()=>invalidate(),software ? 250 : 1000/30);
  },2);
  return null;
}
export default function LivingOfficeScene({layout,previousScene,selected,floorId,overlay,reduced,zoom,choose,failed}: SceneProps) {
  const [software,setSoftware]=useState(false);
  const projection=useMemo(() => projectOfficeScene(layout),[layout]);
  const allSeats=useMemo(() => new Map(projection.seats.map(s=>[s.seat.employeeId,s])),[projection]);
  const arrivals=useMemo(()=>new Map(layout.cues.filter(c=>c.type==='Arriving').map(c=>[c.employeeId,c.id])),[layout.cues]);
  const plan=useMemo(()=>planChoreography(projection,layout.cues),[projection,layout.cues]);
  const epochs=useRef(new Map<string,number>());
  useEffect(()=>{const ids=new Set(layout.cues.map(c=>c.id));for(const id of epochs.current.keys()) if(!ids.has(id)) epochs.current.delete(id);},[layout.cues]);
  const floorY=projection.floors.find(f=>f.floor.id===floorId)?.y;
  const loading=useRef<HTMLDivElement>(null);
  return <div className="office-3d-stage" data-motion={reduced ? 'reduced' : 'normal'}>
    <div ref={loading} className="office-3d-loading" role="status">正在開啟你的辦公室…</div>
    <Canvas shadows dpr={software ? .75 : [1,1.5]} camera={{fov:32,position:[20,14,30]}} frameloop="demand" gl={{antialias:true,powerPreference:'high-performance'}} fallback={<p>此裝置無法顯示 3D 畫布。</p>} onCreated={({gl,invalidate,setDpr}) => {
      gl.toneMapping=ACESFilmicToneMapping; gl.toneMappingExposure=.98;
      const context=gl.getContext(), debug=context.getExtension('WEBGL_debug_renderer_info');
      const renderer=debug ? String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : '';
      // Software rasterizers keep every 3D individual, with a smaller pixel budget.
      if(/swiftshader|llvmpipe|software rasterizer/i.test(renderer)) {setDpr(.75);setSoftware(true);}
      requestAnimationFrame(()=>invalidate());
    }}>
      <FrameDriver reduced={reduced} software={software}/>
      <color attach="background" args={['#edf2f1']}/><ambientLight intensity={.3}/><hemisphereLight args={['#fff7e8','#8fa4a5',.65]}/>
      <directionalLight position={[-10,projection.height+12,14]} color='#fff0da' intensity={2} castShadow shadow-radius={3} shadow-mapSize={software ? [1024,1024] : [2048,2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={projection.height+5} shadow-camera-bottom={-8} shadow-camera-far={100} shadow-bias={-.0004} shadow-normalBias={.025}/>
      <directionalLight position={[12,projection.height,5]} color='#dcecf5' intensity={.7}/>
      <CameraRig height={projection.height} floorY={floorY} zoom={zoom} reduced={reduced}/>
      <StaticBuilding revision={`${layout.seats.map(s=>`${s.id}:${s.floorId}:${s.zone}:${s.slot}:${s.vacant}:${s.overloaded}:${s.concerns.join(',')}`).join('|')}:${selected?.employeeId}:${overlay}:${floorId}`}>
        <Box p={[0,(floorY ?? 0)-.5,0]} s={[19,.26,8]} color="#cbd5d1" shadow/>
        {projection.floors.filter(f=>floorY===undefined || f.y===floorY).map(f=><Floor key={f.floor.id} data={f} selected={selected} overlay={overlay} arrivals={arrivals} reduced={reduced}/>)}
      </StaticBuilding>
      {projection.seats.map(s=><Human key={s.seat.employeeId} data={s} previousSeat={previousScene?.seats.find(p=>p.seat.employeeId===s.seat.employeeId)} layout={layout} selected={selected} reduced={reduced} choose={choose} allSeats={allSeats} plan={plan} epochs={epochs.current} focusY={floorY}/>)}
      {overlay==='management' && selected ? projection.seats.filter(s=>(s.seat.managerId===selected.employeeId || s.seat.employeeId===selected.employeeId) && (floorY===undefined || s.person[1]===floorY && s.seat.managerId && allSeats.get(s.seat.managerId)?.person[1]===floorY)).map(s=>s.seat.managerId && allSeats.has(s.seat.managerId) ? <ReportingPath key={s.seat.id} a={s} b={allSeats.get(s.seat.managerId)!}/> : null) : null}
      <mesh rotation-x={-Math.PI/2} position={[0,(floorY ?? 0)-.65,0]} receiveShadow><planeGeometry args={[300,300]}/><shadowMaterial color="#60766f" opacity={.16} transparent depthWrite={false}/></mesh>
      <Diagnostics ready={()=>{if(loading.current) loading.current.hidden=true;}} failed={failed}/>
    </Canvas>
  </div>;
}
