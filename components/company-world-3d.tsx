'use client';

import {Suspense,useMemo,useRef} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls,OrthographicCamera} from '@react-three/drei';
import type {Group,Mesh} from 'three';

export type WorldDomain={name:string;mode:string;progress:number;accent:string};

const positions:[number,number,number][]=[[-3.3,0,1.9],[3.3,0,1.9],[-3.3,0,-1.9],[3.3,0,-1.9]];

export function CompanyWorld3D({domains,selected,onSelect,running}:{domains:WorldDomain[];selected:string;onSelect:(name:string)=>void;running:boolean}){
 return <div className="world-3d" role="img" aria-label="Interactive 3D operational model of Innerflect. Four company domains surround the company core. Select a domain using the accessible controls below the scene.">
  <Canvas dpr={[1,1.65]} gl={{antialias:true,alpha:true,powerPreference:'high-performance'}} fallback={<div className="webgl-fallback">3D unavailable. Use Practical view.</div>}>
   <OrthographicCamera makeDefault position={[8,8,9]} zoom={73}/>
   <ambientLight intensity={1.25}/><directionalLight position={[5,9,4]} intensity={2.2} color="#d8fff8"/><pointLight position={[0,3,0]} intensity={12} distance={9} color="#55cbbb"/>
   <Suspense fallback={null}><World domains={domains} selected={selected} onSelect={onSelect} running={running}/><ContactShadows position={[0,-.43,0]} opacity={.55} scale={12} blur={2.4} far={6}/></Suspense>
   <OrbitControls makeDefault enablePan={false} enableZoom={false} minPolarAngle={Math.PI*.22} maxPolarAngle={Math.PI*.42} minAzimuthAngle={-.65} maxAzimuthAngle={.65}/>
  </Canvas>
 </div>
}

function World({domains,selected,onSelect,running}:{domains:WorldDomain[];selected:string;onSelect:(name:string)=>void;running:boolean}){
 const root=useRef<Group>(null); useFrame((_,delta)=>{if(root.current&&running)root.current.rotation.y+=delta*.018});
 return <group ref={root} rotation={[0,-.08,0]}>
  <gridHelper args={[14,28,'#15302c','#10201e']} position={[0,-.41,0]}/>
  {domains.map((domain,index)=><DomainIsland key={domain.name} domain={domain} position={positions[index]} selected={domain.name===selected} onSelect={()=>onSelect(domain.name)} running={running} index={index}/>) }
  {positions.map((p,i)=><Line key={i} points={[[0,.02,0],[p[0]*.48,.02,p[2]*.48],[p[0],.02,p[2]]]} color={domains[i].accent} lineWidth={domains[i].name===selected?2:1} transparent opacity={domains[i].name===selected?.9:.35}/>) }
  <CompanyCore running={running}/><Courier running={running}/>
 </group>
}

function CompanyCore({running}:{running:boolean}){const core=useRef<Mesh>(null);useFrame(({clock})=>{if(core.current&&running){const s=1+Math.sin(clock.elapsedTime*1.5)*.035;core.current.scale.setScalar(s)}});return <group position={[0,0,0]}><mesh rotation={[0,Math.PI/4,0]} position={[0,-.05,0]}><boxGeometry args={[1.45,.42,1.45]}/><meshStandardMaterial color="#0d2925" emissive="#1e756b" emissiveIntensity={.55} metalness={.35} roughness={.35}/></mesh><mesh ref={core} position={[0,.58,0]}><octahedronGeometry args={[.55,0]}/><meshStandardMaterial color="#183d38" emissive="#55cbbb" emissiveIntensity={1.2} metalness={.5} roughness={.25}/></mesh><Ring radius={1.05} color="#55cbbb"/><Ring radius={1.32} color="#25544e" speed={-1}/></group>}

function Ring({radius,color,speed=1}:{radius:number;color:string;speed?:number}){const ring=useRef<Mesh>(null);useFrame((_,d)=>{if(ring.current)ring.current.rotation.z+=d*.08*speed});return <mesh ref={ring} rotation={[Math.PI/2,0,0]} position={[0,.03,0]}><torusGeometry args={[radius,.012,6,48]}/><meshBasicMaterial color={color} transparent opacity={.6}/></mesh>}

function DomainIsland({domain,position,selected,onSelect,running,index}:{domain:WorldDomain;position:[number,number,number];selected:boolean;onSelect:()=>void;running:boolean;index:number}){
 const group=useRef<Group>(null);useFrame(({clock})=>{if(group.current){const target=selected?.18:0;group.current.position.y+=(target-group.current.position.y)*.08;if(running)group.current.rotation.y=Math.sin(clock.elapsedTime*.35+index)*.018}});
 return <group ref={group} position={position} onClick={e=>{e.stopPropagation();onSelect()}} onPointerOver={e=>{e.stopPropagation();document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='default'}}>
  <mesh position={[0,-.18,0]}><boxGeometry args={[2.55,.28,1.55]}/><meshStandardMaterial color={selected?'#173f39':'#111b1a'} emissive={domain.accent} emissiveIntensity={selected?.34:.08} metalness={.3} roughness={.56}/></mesh>
  <mesh position={[0,-.02,0]}><boxGeometry args={[2.25,.08,1.28]}/><meshStandardMaterial color="#172522" emissive={domain.accent} emissiveIntensity={selected?.28:.06}/></mesh>
  <Workstation position={[-.62,0,.16]} color={domain.accent}/><Workstation position={[.62,0,-.2]} color={domain.accent}/>
  <Worker position={[-.62,.18,.49]} color={domain.accent} running={running} delay={index*.55}/><Worker position={[.62,.18,.13]} color={domain.accent} running={running} delay={index*.55+1.1}/>
  {selected&&<Line points={[[-1.12,.03,-.58],[1.12,.03,-.58]]} color={domain.accent} lineWidth={2}/>} 
 </group>
}

function Workstation({position,color}:{position:[number,number,number];color:string}){return <group position={position}><mesh position={[0,.16,0]}><boxGeometry args={[.72,.12,.44]}/><meshStandardMaterial color="#1d2927" metalness={.25}/></mesh><mesh position={[0,.48,-.1]} rotation={[-.12,0,0]}><boxGeometry args={[.45,.3,.045]}/><meshStandardMaterial color="#12211f" emissive={color} emissiveIntensity={.65}/></mesh><mesh position={[-.24,.05,0]}><boxGeometry args={[.06,.34,.06]}/><meshStandardMaterial color="#263531"/></mesh><mesh position={[.24,.05,0]}><boxGeometry args={[.06,.34,.06]}/><meshStandardMaterial color="#263531"/></mesh></group>}

function Worker({position,color,running,delay}:{position:[number,number,number];color:string;running:boolean;delay:number}){const person=useRef<Group>(null);useFrame(({clock})=>{if(person.current&&running){person.current.position.y=Math.sin(clock.elapsedTime*2.2+delay)*.025;person.current.rotation.y=Math.sin(clock.elapsedTime*.8+delay)*.12}});return <group ref={person} position={position}><mesh position={[0,.55,0]}><sphereGeometry args={[.13,12,10]}/><meshStandardMaterial color="#c8d4d0"/></mesh><mesh position={[0,.31,0]}><capsuleGeometry args={[.13,.25,5,10]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.18}/></mesh><mesh position={[-.13,.28,-.11]} rotation={[.8,0,-.3]}><capsuleGeometry args={[.035,.22,4,8]}/><meshStandardMaterial color="#8fa09b"/></mesh><mesh position={[.13,.28,-.11]} rotation={[.8,0,.3]}><capsuleGeometry args={[.035,.22,4,8]}/><meshStandardMaterial color="#8fa09b"/></mesh></group>}

function Courier({running}:{running:boolean}){const courier=useRef<Group>(null);const path=useMemo(()=>[[0,0],[-3.3,1.9],[0,0],[3.3,1.9],[0,0],[3.3,-1.9],[0,0],[-3.3,-1.9]] as [number,number][],[]);useFrame(({clock})=>{if(!courier.current||!running)return;const t=(clock.elapsedTime*.24)%path.length;const i=Math.floor(t),n=(i+1)%path.length,f=t-i;courier.current.position.x=path[i][0]+(path[n][0]-path[i][0])*f;courier.current.position.z=path[i][1]+(path[n][1]-path[i][1])*f;courier.current.rotation.y=clock.elapsedTime*2});return <group ref={courier} position={[0,.22,0]}><mesh><sphereGeometry args={[.105,10,8]}/><meshStandardMaterial color="#dffcf7" emissive="#55cbbb" emissiveIntensity={.8}/></mesh><pointLight intensity={1.5} distance={1.2} color="#55cbbb"/></group>}
