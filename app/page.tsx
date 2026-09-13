'use client';
import {useEffect,useState} from 'react';
import {Activity,ArrowRight,Bell,BookOpen,Box,Check,ChevronRight,CircleAlert,Clock3,Command,Eye,FileCheck2,Gauge,GitBranch,LayoutGrid,Menu,MessageSquareText,MoreHorizontal,Pause,Play,Search,Settings2,ShieldCheck,Sparkles,Target,Users,Workflow,Zap} from 'lucide-react';

type Dept={name:string;mode:string;people:number;progress:number;accent:string;agents:{id:string,name:string,job:string,initials:string,state:string}[]};
const departments:Dept[]=[
 {name:'Growth',mode:'Supervised',people:4,progress:68,accent:'#d8a34d',agents:[{id:'RS',name:'Revenue Scout',job:'Qualifying signals',initials:'RS',state:'working'},{id:'CC',name:'Commercial Copilot',job:'Preparing follow-ups',initials:'CC',state:'working'}]},
 {name:'Delivery',mode:'Human gate',people:5,progress:73,accent:'#e16d5d',agents:[{id:'DS',name:'Delivery Steward',job:'Waiting on Gate 1',initials:'DS',state:'waiting'},{id:'QA',name:'Quality Auditor',job:'Verifying artefact',initials:'QA',state:'working'}]},
 {name:'Operations',mode:'Autonomous',people:3,progress:91,accent:'#55cbbb',agents:[{id:'KK',name:'Knowledge Keeper',job:'Reconciling sources',initials:'KK',state:'working'},{id:'OS',name:'Ops Steward',job:'Running daily sweep',initials:'OS',state:'working'}]},
 {name:'Governance',mode:'Escalated',people:2,progress:54,accent:'#e16d5d',agents:[{id:'RX',name:'Risk Sentinel',job:'Needs accountable owner',initials:'RX',state:'blocked'},{id:'PL',name:'Policy Librarian',job:'Testing boundaries',initials:'PL',state:'working'}]}
];
const feed=[['Revenue Scout','Qualified 14 company signals','Growth','now'],['Knowledge Keeper','Verified 11 source claims','Operations','2m'],['Quality Auditor','Completed Gate 1 checks','Delivery','5m'],['Risk Sentinel','Escalated security ownership','Governance','8m']];

export default function Home(){
 const [selected,setSelected]=useState(departments[1]); const [running,setRunning]=useState(true); const [tick,setTick]=useState(1284); const [toast,setToast]=useState(''); const [focus,setFocus]=useState<'company'|'agent'>('company');
 useEffect(()=>{if(!running)return;const timer=window.setInterval(()=>setTick(v=>v+1),3200);return()=>clearInterval(timer)},[running]);
 const notify=(m:string)=>{setToast(m);window.setTimeout(()=>setToast(''),2300)};
 return <main className={`mirror ${running?'is-running':'is-paused'}`}>
  <aside className="rail">
   <div className="brand"><span className="mirror-glyph"><i/><i/><i/></span><b>Innerflect</b><small>Mirror</small></div>
   <nav><Nav active icon={<Eye/>} label="Company"/><Nav icon={<Zap/>} label="Autonomy"/><Nav icon={<FileCheck2/>} label="Approvals" badge="2"/><Nav icon={<Target/>} label="Outcomes"/><Nav icon={<BookOpen/>} label="Memory"/></nav>
   <div className="rail-foot"><div className="operator"><span>IF</span><div><b>Indias</b><small>Company owner</small></div></div><button><Settings2 size={16}/></button></div>
  </aside>

  <section className="main">
   <header className="top"><div><button className="mobile-menu"><Menu size={18}/></button><span className="status-live"><i/>Company operating normally</span></div><button className="command"><Search size={15}/><span>Ask anything about the company</span><kbd>⌘ K</kbd></button><div className="top-actions"><button><Bell size={16}/><i/></button><span>Sunday · 09:41</span></div></header>

   <section className="hero-row">
    <div><span className="context">Operational digital twin</span><h1>Your company,<br/>alive and legible.</h1><p>Watch work happen. Step in only where judgement matters.</p></div>
    <div className="autonomy-score"><div className="score-top"><span>Company autonomy</span><small>Level 7</small></div><div className="score"><strong>68</strong><span>/100</span><em>+12 this month</em></div><div className="score-track"><i/></div><small>Next level: 11 verified workflows</small></div>
   </section>

   <section className="command-deck">
    <div className="deck-head"><div><span className="eyebrow">Live company floor</span><h2>See who is working on what</h2></div><div className="deck-controls"><div className="segmented"><button className={focus==='company'?'active':''} onClick={()=>setFocus('company')}>Company</button><button className={focus==='agent'?'active':''} onClick={()=>setFocus('agent')}>Agents</button></div><button className="pause" onClick={()=>{setRunning(!running);notify(running?'Company view paused':'Company view resumed')}}>{running?<Pause size={13}/>:<Play size={13}/>} {running?'Pause':'Resume'}</button></div></div>

    <div className="floor">
     <svg className="routes" viewBox="0 0 1000 460" preserveAspectRatio="none" aria-hidden="true"><path d="M500 230 C410 230 410 100 280 100"/><path d="M500 230 C590 230 590 100 720 100"/><path d="M500 230 C410 230 410 360 280 360"/><path d="M500 230 C590 230 590 360 720 360"/><circle cx="500" cy="230" r="112"/><g className="signal-dots"><circle cx="424" cy="174" r="4"/><circle cx="576" cy="174" r="4"/><circle cx="424" cy="286" r="4"/><circle cx="576" cy="286" r="4"/></g></svg>
     <div className="company-core"><span className="core-rings"><i/><i/><i/></span><span className="mirror-glyph big"><i/><i/><i/></span><small>Living model</small><b>Innerflect</b><em>{running?'observing 286 events':'observation paused'}</em></div>
     {departments.map((d,i)=><Department key={d.name} dept={d} index={i} selected={selected.name===d.name} onClick={()=>setSelected(d)}/>) }
     <div className="agent-traveler a1"><span>RS</span><small>Signal qualified</small></div><div className="agent-traveler a2"><span>KK</span><small>Memory updated</small></div><div className="agent-traveler a3"><span>QA</span><small>Check complete</small></div>
    </div>

    <div className="work-strip"><span className="strip-label"><Activity size={13}/>Work happening now</span><div className="ticker">{feed.map(([agent,event,dept,time])=><button key={agent} onClick={()=>{const d=departments.find(x=>x.name===dept);if(d)setSelected(d)}}><span className="mini-avatar">{agent.split(' ').map(x=>x[0]).join('')}</span><span><b>{event}</b><small>{agent} · {time}</small></span><i/></button>)}</div></div>
   </section>

   <section className="bottom-grid">
    <article className="detail-panel"><div className="section-head"><div><span className="eyebrow">Selected domain</span><h3>{selected.name}</h3></div><span className={`mode-pill ${selected.mode==='Autonomous'?'auto':selected.mode==='Escalated'?'danger':''}`}>{selected.mode}</span></div><div className="team-row">{selected.agents.map((a,i)=><button key={a.id} onClick={()=>notify(`${a.name} opened`)}><span className={`person ${a.state}`}><i/><b>{a.initials}</b><em>{a.state==='working'?'⚡':a.state==='waiting'?'◷':'!'}</em></span><span><b>{a.name}</b><small>{a.job}</small></span>{i<selected.agents.length-1&&<ArrowRight className="handoff" size={15}/>}</button>)}</div><div className="domain-progress"><span><b>{selected.progress}%</b> autonomous capacity</span><div><i style={{width:`${selected.progress}%`}}/></div><small>{selected.people} humans watching · {selected.agents.length} agents active</small></div></article>
    <article className="needs-you"><div className="section-head"><div><span className="eyebrow">Needs you</span><h3>Two moments of judgement</h3></div><span className="urgent-dot">2</span></div><button onClick={()=>notify('Gate 1 review opened')}><span className="need-icon amber"><FileCheck2 size={17}/></span><span><b>Approve Essência Gate 1</b><small>Unlocks a €1,334 invoice · 96% confidence</small></span><ChevronRight size={16}/></button><button onClick={()=>notify('Ownership review opened')}><span className="need-icon red"><CircleAlert size={17}/></span><span><b>Assign security ownership</b><small>4 critical findings · blocked 56 days</small></span><ChevronRight size={16}/></button></article>
    <article className="impact"><div className="section-head"><div><span className="eyebrow">Verified impact</span><h3>Autonomy that earns trust</h3></div><Gauge size={18}/></div><div className="impact-grid"><div><Clock3/><b>32h</b><span>returned weekly</span></div><div><Zap/><b>{tick.toLocaleString()}</b><span>safe actions</span></div><div><ShieldCheck/><b>99.7%</b><span>verified outcomes</span></div></div><div className="level-track"><span>Observe</span><span>Recommend</span><span>Supervise</span><span className="active">Autonomous</span><i/></div></article>
   </section>
  </section>
  {toast&&<div className="toast"><Check size={14}/>{toast}</div>}
 </main>
}
function Nav({icon,label,active,badge}:{icon:React.ReactNode,label:string,active?:boolean,badge?:string}){return <button className={active?'active':''}>{icon}<span>{label}</span>{badge&&<em>{badge}</em>}</button>}
function Department({dept,index,selected,onClick}:{dept:Dept,index:number,selected:boolean,onClick:()=>void}){return <button className={`department d${index+1} ${selected?'selected':''}`} style={{'--dept':dept.accent} as React.CSSProperties} onClick={onClick}><div className="dept-top"><span><Box size={14}/>{dept.name}</span><em>{dept.mode}</em></div><div className="desks">{dept.agents.map(a=><span className={`desk ${a.state}`} key={a.id}><i className="person-dot"><b>{a.initials}</b><em/></i><span><b>{a.name}</b><small>{a.job}</small></span><i className="work-pulse"/></span>)}</div><div className="dept-foot"><span>{dept.people} humans</span><span>{dept.progress}% autonomy</span></div></button>}
