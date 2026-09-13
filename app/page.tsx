'use client';
import {useState} from 'react';
import {Activity,ArrowUpRight,Bell,Bot,BookOpen,Check,ChevronDown,CircleAlert,Eye,FileCheck2,Gauge,GitBranch,LayoutGrid,Menu,Pause,Play,Search,Settings2,ShieldCheck,Sparkles,Users,X} from 'lucide-react';

const agents=[
 {name:'Revenue Scout',role:'Growth',status:'Working',task:'Qualifying 14 new signals',human:'Indias',x:18,y:26,color:'#68b9ab'},
 {name:'Delivery Steward',role:'Delivery',status:'Waiting',task:'Essência · Gate 1 approval',human:'Indias',x:75,y:19,color:'#d9ab62'},
 {name:'Knowledge Keeper',role:'Operations',status:'Working',task:'Reconciling 6 source changes',human:'Jonas',x:82,y:68,color:'#68b9ab'},
 {name:'Risk Sentinel',role:'Governance',status:'Escalated',task:'Security findings need owner',human:'Indias',x:24,y:76,color:'#dd796b'}
];
const nav=[['Mirror',Eye],['Work',LayoutGrid],['Agents',Bot],['People',Users],['Knowledge',BookOpen],['Decisions',GitBranch]] as const;

export default function Home(){
 const [active,setActive]=useState(agents[1]); const [running,setRunning]=useState(true); const [mobile,setMobile]=useState(false); const [toast,setToast]=useState('');
 const notify=(m:string)=>{setToast(m);window.setTimeout(()=>setToast(''),2200)};
 return <main className="shell">
  <aside className={`side ${mobile?'open':''}`}>
   <div className="brand"><span className="mark"><i/></span><b>Innerflect</b><button className="icon close" onClick={()=>setMobile(false)} aria-label="Close"><X size={17}/></button></div>
   <nav>{nav.map(([label,Icon])=><button key={label} className={label==='Mirror'?'nav active':'nav'}><Icon size={17}/><span>{label}</span>{label==='Agents'&&<em>12</em>}</button>)}</nav>
   <div className="fill"/>
   <section className="mode"><span><Sparkles size={14}/>Autonomy mode</span><b>{running?'Company is flowing':'Company is paused'}</b><p>{running?'8 agents can act within policy.':'Agents are observing only.'}</p><button onClick={()=>{setRunning(!running);notify(running?'Autonomy paused':'Autonomy resumed')}}>{running?<Pause size={13}/>:<Play size={13}/>} {running?'Pause autonomy':'Resume autonomy'}</button></section>
   <button className="profile"><span className="avatar">IF</span><span><b>Indias Fernandes</b><small>Owner · full authority</small></span><ChevronDown size={14}/></button>
  </aside>
  <section className="work">
   <header><button className="icon menu" onClick={()=>setMobile(true)} aria-label="Menu"><Menu size={18}/></button><div className="title"><Label>Company mirror</Label><h1>Good morning, Indias.</h1></div><button className="search"><Search size={15}/><span>Search the company</span><kbd>⌘ K</kbd></button><button className="icon bell"><Bell size={17}/><i/></button><button className="ask" onClick={()=>notify('Mirror is listening')}><Sparkles size={14}/>Ask Mirror</button></header>
   <div className="content">
    <section className="pulse"><div className="pulse-copy"><span className="live"><i/>Live company pulse</span><h2>The company is moving.<br/><span>Two moments need you.</span></h2></div><Metric n="12" label="active agents" note="8 acting · 4 observing"/><Metric n="84%" label="autonomous" note="↑ 6% this week" good/><Metric n="2" label="human decisions" note="need attention" warn/></section>
    <section className="main-grid">
     <article className="panel map-panel"><PanelTitle label="Autonomy field" title="Who is watching what"><div className="legend"><span><i className="green"/>Working</span><span><i className="amber"/>Waiting</span><span><i className="red"/>Escalated</span></div></PanelTitle>
      <div className="map"><svg viewBox="0 0 100 100" preserveAspectRatio="none">{agents.map(a=><line key={a.name} x1="50" y1="50" x2={a.x} y2={a.y}/>)}<circle cx="50" cy="50" r="31"/></svg><div className="core"><span className="mark large"><i/></span><b>Innerflect</b><small>{running?'Operating':'Paused'}</small><em/></div>
       {agents.map(a=><button key={a.name} onClick={()=>setActive(a)} className={`agent ${active.name===a.name?'selected':''}`} style={{left:`${a.x}%`,top:`${a.y}%`,'--status':a.color} as React.CSSProperties}><span className="agent-icon"><Bot size={15}/><i/></span><span><b>{a.name}</b><small>{a.role}</small></span></button>)}
       <span className="human h1"><i>IF</i><small>supervises</small></span><span className="human h2"><i>JS</i><small>supervises</small></span>
      </div>
      <div className="agent-detail"><span className="agent-icon" style={{'--status':active.color} as React.CSSProperties}><Bot size={15}/><i/></span><div><Label>{active.status} now</Label><b>{active.task}</b></div><div className="guardian"><span className="avatar tiny">{active.human==='Indias'?'IF':'JS'}</span><span><small>Human guardian</small><b>{active.human}</b></span></div><button onClick={()=>notify(`${active.name} opened`)}>Open agent <ArrowUpRight size={13}/></button></div>
     </article>
     <aside className="panel attention"><PanelTitle label="Your attention" title="Judgement, not busywork"><span className="count">2</span></PanelTitle>
      <Decision tone="amber" icon={<FileCheck2 size={17}/>} meta="Approval · Essência" title="Gate 1 is ready for your sign-off" body="Delivery Steward verified the artefact. Approval unlocks a €1,334 invoice."><div className="confidence"><span>Agent confidence</span><b>96%</b></div><button onClick={()=>notify('Gate 1 review opened')}>Review decision <ArrowUpRight size={13}/></button></Decision>
      <Decision tone="red" icon={<CircleAlert size={17}/>} meta="Assign owner · Security" title="Four critical findings have no accountable owner" body="Risk Sentinel cannot proceed without a person holding the decision."><div className="suggest"><span className="avatar tiny">IF</span><span><small>Suggested owner</small><b>You · by role</b></span><button onClick={()=>notify('Owner assigned')}>Assign</button></div></Decision>
      <button className="all">See all open decisions <span>7</span></button>
     </aside>
    </section>
    <section className="lower">
     <article className="panel"><PanelTitle label="System flow · last 24 hours" title="What moved without you"><button className="icon"><Settings2 size={15}/></button></PanelTitle><div className="flow"><Flow icon={<Search size={14}/>} text={<><b>Revenue Scout</b> qualified 14 company signals</>} time="08:42" state="within policy"/><Flow icon={<Activity size={14}/>} text={<><b>Commercial Copilot</b> prepared 6 follow-ups</>} time="08:17" state="human review"/><Flow icon={<ShieldCheck size={14}/>} text={<><b>Knowledge Keeper</b> verified 11 source claims</>} time="07:56" state="complete"/></div></article>
     <article className="panel govern"><PanelTitle label="Governance posture" title="Autonomy with boundaries"><Gauge size={19}/></PanelTitle><div className="meter"><div><i/></div><b>84%</b></div><div className="stats"><span><small>Policy coverage</small><b>91%</b></span><span><small>Traceability</small><b>100%</b></span><span><small>Human ownership</small><b>86%</b></span></div></article>
    </section>
   </div>
  </section>
  {toast&&<div className="toast"><Check size={14}/>{toast}</div>}{mobile&&<button className="backdrop" onClick={()=>setMobile(false)} aria-label="Close navigation"/>}
 </main>
}
function Label({children}:{children:React.ReactNode}){return <span className="label">{children}</span>}
function Metric({n,label,note,good,warn}:{n:string,label:string,note:string,good?:boolean,warn?:boolean}){return <div className="metric"><b>{n}</b><span>{label}</span><small className={good?'good':warn?'warning':''}>{note}</small></div>}
function PanelTitle({label,title,children}:{label:string,title:string,children?:React.ReactNode}){return <div className="panel-title"><div><Label>{label}</Label><h3>{title}</h3></div>{children}</div>}
function Decision({tone,icon,meta,title,body,children}:{tone:string,icon:React.ReactNode,meta:string,title:string,body:string,children:React.ReactNode}){return <div className={`decision ${tone}`}><span className="decision-icon">{icon}</span><Label>{meta}</Label><strong>{title}</strong><p>{body}</p>{children}</div>}
function Flow({icon,text,time,state}:{icon:React.ReactNode,text:React.ReactNode,time:string,state:string}){return <div><span className="flow-icon">{icon}</span><p>{text}</p><time>{time}</time><span className={state==='human review'?'neutral':'success'}>{state!=='human review'&&<Check size={11}/>} {state}</span></div>}
