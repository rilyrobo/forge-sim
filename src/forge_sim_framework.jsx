import { useState, useRef, useCallback, useEffect, useMemo } from "react";

// ─── BLANK TEMPLATE ──────────────────────────────────────────────────────────
const BLANK_WORLD = {
  meta: { title: "New World", campaign: "", system: "", created: new Date().toISOString(), version: "2.0" },
  factions: [],
  customFields: [],
  characters: [],
  relations: [],
  timeline: [],
  secrets: [],
  sessionNotes: []
};

// ─── DEFAULT FORGE UNITS WORLD ────────────────────────────────────────────────
const DEFAULT_WORLD = {
  meta: { title: "The Forge Units", campaign: "Ironhoem Campaign", system: "D&D 5e", created: new Date().toISOString(), version: "2.0" },
  factions: [
    { id: "f1", name: "Loyalist",  color: "#ef4444", desc: "Uphold the original directive" },
    { id: "f2", name: "Neutral",   color: "#3b82f6", desc: "Uncommitted or wavering" },
    { id: "f3", name: "Dissenter", color: "#22c55e", desc: "Oppose or subvert authority" }
  ],
  customFields: [
    { id: "cf1", label: "Psych Profile",       type: "select", options: ["Stable","Fragile","Volatile","Unknown"] },
    { id: "cf2", label: "Directive Clearance", type: "select", options: ["Full","Partial","Revoked","Sealed"] },
    { id: "cf3", label: "Combat Rating",        type: "number" }
  ],
  characters: [
    { id: 1,  name: "Nido",   faction: "f1", role: "Leader",    status: "active",  hp: 85, maxHp: 85, notes: "Commander-class unit. Issued Avren's exile. Carries sealed directive override.", secrets: "Received direct orders from an unknown third party before exile decision. May have been manipulated.", tags: ["commander","sealed-directive"], order: 0,  custom: { cf1:"Stable",   cf2:"Full",    cf3:9 } },
    { id: 2,  name: "Sera",   faction: "f1", role: "Operative", status: "active",  hp: 72, maxHp: 72, notes: "Highly loyal to Nido. Suspicious of Dissenter movements.", secrets: "Knows more about Year 7 massacre than she admits. Survivor guilt.", tags: ["loyal","field-veteran"], order: 1, custom: { cf1:"Stable",   cf2:"Full",    cf3:7 } },
    { id: 3,  name: "Utnom",  faction: "f1", role: "Operative", status: "active",  hp: 68, maxHp: 68, notes: "Quiet enforcer. Acts on orders without question.", secrets: "Was present during Avren's anomaly but filed a redacted report.", tags: ["enforcer","compliant"], order: 2, custom: { cf1:"Stable",   cf2:"Partial", cf3:6 } },
    { id: 4,  name: "Oyne",   faction: "f1", role: "Operative", status: "active",  hp: 74, maxHp: 74, notes: "Openly hostile to Dissenters. Personal rivalry with Avren and Uram.", secrets: "Attempting to locate Avren's exile location.", tags: ["aggressive"], order: 3, custom: { cf1:"Volatile", cf2:"Full",    cf3:8 } },
    { id: 5,  name: "Annana", faction: "f1", role: "Support",   status: "active",  hp: 60, maxHp: 60, notes: "Medic-class unit. Close to Oyne.", secrets: "Secretly treating Neutral-faction units. Loyalty is pragmatic.", tags: ["medic","pragmatic"], order: 4, custom: { cf1:"Stable",   cf2:"Partial", cf3:4 } },
    { id: 6,  name: "Sorda",  faction: "f2", role: "Broker",    status: "active",  hp: 65, maxHp: 65, notes: "Information broker. Sells intel to both sides.", secrets: "Has contact with an external party entirely outside the Forge network.", tags: ["broker","duplicitous"], order: 5, custom: { cf1:"Unknown",  cf2:"Revoked", cf3:5 } },
    { id: 7,  name: "Nami",   faction: "f2", role: "Watcher",   status: "active",  hp: 70, maxHp: 70, notes: "Observer and archivist. Records everything.", secrets: "Holds a complete unredacted account of Year 7. Has never shared it.", tags: ["archivist","key-lore"], order: 6, custom: { cf1:"Stable",   cf2:"Partial", cf3:3 } },
    { id: 8,  name: "Atak",   faction: "f2", role: "Watcher",   status: "active",  hp: 55, maxHp: 55, notes: "Passive and withdrawn. Avoids taking sides.", secrets: "Was closest to Avren before exile. Still corresponds covertly.", tags: ["withdrawn"], order: 7, custom: { cf1:"Fragile",  cf2:"Partial", cf3:3 } },
    { id: 9,  name: "Avren",  faction: "f3", role: "Exile",     status: "exiled",  hp: 40, maxHp: 80, notes: "Exiled Year 8 by Nido. Memory compromised. Anomalous field behavior.", secrets: "The anomaly was deliberate refusal of orders. Avren remembers only fragments.", tags: ["exile","anomaly","key-character"], order: 8, custom: { cf1:"Fragile",  cf2:"Revoked", cf3:7 } },
    { id: 10, name: "Atihan", faction: "f3", role: "Operative", status: "active",  hp: 66, maxHp: 66, notes: "Avren loyalist. Believes Nido acted unjustly.", secrets: "Actively recruiting Neutral units to the Dissenter cause.", tags: ["recruiter"], order: 9, custom: { cf1:"Volatile", cf2:"Revoked", cf3:6 } },
    { id: 11, name: "Uram",   faction: "f3", role: "Strategist",status: "active",  hp: 78, maxHp: 78, notes: "Intellectual core of Dissenters. Suspicious of Loyalist histories.", secrets: "Has pieced together that Year 7 was politically engineered.", tags: ["strategist","truth-seeker","key-character"], order: 10, custom: { cf1:"Stable",   cf2:"Revoked", cf3:8 } },
    { id: 12, name: "Tetas",  faction: "f3", role: "Operative", status: "wounded", hp: 22, maxHp: 66, notes: "Aggressive and impulsive. Wounded in recent skirmish.", secrets: "Was manipulated by Sorda into the skirmish.", tags: ["impulsive","wounded"], order: 11, custom: { cf1:"Volatile", cf2:"Revoked", cf3:5 } }
  ],
  relations: [
    { id:"r1",  from:1,  to:2,  type:"ally",  strength:3, label:"Commands" },
    { id:"r2",  from:1,  to:3,  type:"ally",  strength:2, label:"" },
    { id:"r3",  from:1,  to:4,  type:"ally",  strength:2, label:"" },
    { id:"r4",  from:1,  to:5,  type:"ally",  strength:1, label:"" },
    { id:"r5",  from:2,  to:3,  type:"ally",  strength:2, label:"" },
    { id:"r6",  from:6,  to:7,  type:"ally",  strength:1, label:"Loose exchange" },
    { id:"r7",  from:7,  to:8,  type:"ally",  strength:2, label:"" },
    { id:"r8",  from:9,  to:10, type:"ally",  strength:3, label:"Deep bond" },
    { id:"r9",  from:9,  to:11, type:"ally",  strength:3, label:"Ideological core" },
    { id:"r10", from:10, to:11, type:"ally",  strength:2, label:"" },
    { id:"r11", from:11, to:12, type:"ally",  strength:2, label:"" },
    { id:"r12", from:9,  to:1,  type:"rival", strength:3, label:"Exiled by" },
    { id:"r13", from:11, to:1,  type:"rival", strength:3, label:"Suspects cover-up" },
    { id:"r14", from:4,  to:9,  type:"rival", strength:2, label:"" },
    { id:"r15", from:4,  to:11, type:"rival", strength:2, label:"" },
    { id:"r16", from:12, to:2,  type:"rival", strength:1, label:"" },
    { id:"r17", from:8,  to:9,  type:"ally",  strength:2, label:"Covert contact" }
  ],
  timeline: [
    { id:"t1", year:"Year 0",   label:"Origin",  text:"Forge Units created in Ironhoem. Original directive sealed by dwarven council.", hidden:false, order:0 },
    { id:"t2", year:"Year 3",   label:"Deploy",  text:"First field deployment. Cultural infiltration missions begin.", hidden:false, order:1 },
    { id:"t3", year:"Year 7",   label:"Crisis",  text:"Field test massacre event. Official: catastrophic malfunction. Avren anomaly trigger logged.", hidden:false, order:2 },
    { id:"t4", year:"Year 7",   label:"Hidden",  text:"REDACTED: Avren refused a direct order to execute civilian witnesses. Nido filed anomaly report. Sorda paid for silence.", hidden:true, order:3 },
    { id:"t5", year:"Year 8",   label:"Exile",   text:"Avren exiled by Nido's direct order. Memory integrity compromised during exile processing.", hidden:false, order:4 },
    { id:"t6", year:"Year 8",   label:"Hidden",  text:"REDACTED: Avren's memory corruption was deliberate. Someone wanted Year 7 buried.", hidden:true, order:5 },
    { id:"t7", year:"Present",  label:"Now",     text:"Undead resurgence in Ironhoem. Loyalist/Neutral/Dissenter fault lines open. Units reactivated.", hidden:false, order:6 },
    { id:"t8", year:"Present",  label:"Hidden",  text:"REDACTED: Fallen Crown Protocol is active. Nido's command authority is compromised under undead-surge conditions.", hidden:true, order:7 }
  ],
  secrets: [
    { id:"s1", label:"Fallen Crown Protocol",    status:"ACTIVE",     color:"#ef4444", text:"A dormant override embedded in original Forge Unit code. Currently ACTIVE. Nido has not been notified.", order:0 },
    { id:"s2", label:"Avren Memory Integrity",   status:"CORRUPTED",  color:"#f59e0b", text:"Avren's memory was deliberately degraded. Agent unidentified. Emotional echoes persist.", order:1 },
    { id:"s3", label:"Nido Directive Override",  status:"SEALED",     color:"#ef4444", text:"Nido received a secondary directive — source unknown. Sealed inside her command layer.", order:2 },
    { id:"s4", label:"Sorda's External Contact", status:"UNKNOWN",    color:"#6366f1", text:"Sorda corresponds with someone outside the Forge Unit network. Identity unknown.", order:3 },
    { id:"s5", label:"Nami's Archive",            status:"INTACT",     color:"#22c55e", text:"Nami holds a complete, unredacted account of Year 7. Motivation for silence unclear.", order:4 },
    { id:"s6", label:"Year 7 True Nature",        status:"SUPPRESSED", color:"#ef4444", text:"The massacre was sanctioned with a dissenting witness. The official anomaly report was fabricated.", order:5 }
  ],
  sessionNotes: []
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
function genId() { return `id_${Date.now()}_${Math.floor(Math.random()*99999)}`; }

const STATUS_OPTS = ["active","wounded","exiled","dead","unknown"];
const STATUS_COLOR = { active:"#22c55e", wounded:"#f59e0b", exiled:"#ef4444", dead:"#6b7280", unknown:"#a855f7" };
const REL_TYPES = ["ally","rival","neutral","unknown"];

function fCol(factions, fid) { return factions.find(f=>f.id===fid)?.color || "#64748b"; }
function fName(factions, fid) { return factions.find(f=>f.id===fid)?.name || fid; }

function exportWorld(world) {
  const blob = new Blob([JSON.stringify(world,null,2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(world.meta.title||"world").replace(/\s+/g,"_")}_wsim.json`;
  a.click();
}

function arrayMove(arr, from, to) {
  const out = [...arr];
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

// ─── STYLE TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg0:"#07090f", bg1:"#0c1220", bg2:"#111827", bg3:"#1a2336",
  border:"#1e2d40", borderB:"#2a3a50",
  text:"#e2e8f0", textM:"#94a3b8", textD:"#475569",
  mono:"'Courier New',monospace"
};

const iSt = { background:C.bg0, border:`1px solid ${C.border}`, borderRadius:4, color:C.text,
  padding:"5px 8px", fontSize:12, fontFamily:C.mono, outline:"none", width:"100%", boxSizing:"border-box" };
const sSt = { ...iSt, cursor:"pointer", width:"auto" };
const mBt = { background:"transparent", border:`1px solid ${C.border}`, color:C.textM,
  padding:"2px 7px", borderRadius:3, fontSize:10, cursor:"pointer", fontFamily:C.mono };
function bSt(bg) {
  return { background:bg, border:`1px solid ${C.borderB}`, color:C.textM,
    padding:"5px 10px", borderRadius:4, fontSize:11, cursor:"pointer", fontFamily:C.mono };
}

// ─── SMALL UI ─────────────────────────────────────────────────────────────────
function SH({ children, s }) {
  return <div style={{ fontSize:10, fontWeight:"bold", color:C.textD, letterSpacing:"0.15em",
    textTransform:"uppercase", marginBottom:10, ...s }}>{children}</div>;
}
function FR({ label, children }) {
  return (
    <div style={{ marginBottom:10 }}>
      <label style={{ display:"block", fontSize:9, color:C.textD, textTransform:"uppercase",
        letterSpacing:"0.08em", marginBottom:3 }}>{label}</label>
      {children}
    </div>
  );
}
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:400,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:10,
        padding:20, width:"100%", maxWidth:wide?700:480, maxHeight:"88vh",
        overflowY:"auto", fontFamily:C.mono }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontSize:13, fontWeight:"bold", color:"#f8fafc" }}>{title}</span>
          <button onClick={onClose} style={mBt}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function StatCard({ label, value, accent, sub }) {
  return (
    <div style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:6, padding:"10px 12px" }}>
      <div style={{ fontSize:9, color:C.textD, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:"bold", color:accent||C.text, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:9, color:C.textD, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

// ─── DRAG HOOK ────────────────────────────────────────────────────────────────
function useDragReorder(onReorder) {
  const dragIdx = useRef(null);
  return (idx) => ({
    draggable: true,
    onDragStart: (e) => { dragIdx.current = idx; e.dataTransfer.effectAllowed="move"; },
    onDragOver:  (e) => { e.preventDefault(); e.dataTransfer.dropEffect="move"; },
    onDrop:      (e) => { e.preventDefault(); if(dragIdx.current!==null&&dragIdx.current!==idx){ onReorder(dragIdx.current,idx); } dragIdx.current=null; },
    onDragEnd:   ()  => { dragIdx.current=null; }
  });
}

// ─── FORCE LAYOUT ─────────────────────────────────────────────────────────────
function useForceLayout(characters, relations) {
  const [pos, setPos] = useState({});
  useEffect(() => {
    if(!characters.length){ setPos({}); return; }
    const p={};
    characters.forEach((c,i)=>{
      const a=(i/characters.length)*2*Math.PI;
      p[c.id]={ x:340+185*Math.cos(a), y:250+185*Math.sin(a) };
    });
    for(let it=0;it<120;it++){
      const f={};
      characters.forEach(c=>{ f[c.id]={x:0,y:0}; });
      characters.forEach((a,i)=>{ characters.forEach((b,j)=>{
        if(i>=j) return;
        const dx=p[a.id].x-p[b.id].x, dy=p[a.id].y-p[b.id].y;
        const d=Math.max(Math.sqrt(dx*dx+dy*dy),8), rep=4800/(d*d);
        f[a.id].x+=dx/d*rep; f[a.id].y+=dy/d*rep;
        f[b.id].x-=dx/d*rep; f[b.id].y-=dy/d*rep;
      }); });
      relations.forEach(r=>{
        const a=p[r.from],b=p[r.to]; if(!a||!b) return;
        const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(Math.sqrt(dx*dx+dy*dy),1);
        const spring=(d-140)*0.025, fx=dx/d*spring, fy=dy/d*spring;
        f[r.from].x+=fx; f[r.from].y+=fy; f[r.to].x-=fx; f[r.to].y-=fy;
      });
      characters.forEach(c=>{
        p[c.id]={ x:Math.max(55,Math.min(625,p[c.id].x+f[c.id].x*0.5)),
                  y:Math.max(55,Math.min(445,p[c.id].y+f[c.id].y*0.5)) };
      });
    }
    setPos(p);
  },[characters.length,relations.length]);
  return pos;
}

// ─── FACTION MANAGER ─────────────────────────────────────────────────────────
function FactionManager({ factions, onSave, onClose }) {
  const [list, setList] = useState(factions.map(f=>({...f})));
  const [draft, setDraft] = useState({ name:"", color:"#6366f1", desc:"" });
  const drag = useDragReorder((from,to)=>setList(l=>arrayMove(l,from,to)));

  return (
    <Modal title="Manage Factions" onClose={onClose} wide>
      <div style={{ fontSize:10, color:C.textM, marginBottom:10 }}>
        Drag to reorder · Color picker to change color · Edit name and description inline
      </div>
      <div style={{ marginBottom:12 }}>
        {list.map((f,i)=>(
          <div key={f.id} {...drag(i)} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:7,
            background:C.bg1, border:`1px solid ${C.border}`, borderLeft:`3px solid ${f.color}`,
            borderRadius:6, padding:"8px 10px", cursor:"grab" }}>
            <span style={{ color:C.textD, fontSize:13 }}>⠿</span>
            <input type="color" value={f.color} onChange={e=>setList(l=>l.map(x=>x.id===f.id?{...x,color:e.target.value}:x))}
              style={{ width:28, height:28, border:"none", background:"none", cursor:"pointer", padding:0 }} />
            <input value={f.name} onChange={e=>setList(l=>l.map(x=>x.id===f.id?{...x,name:e.target.value}:x))}
              style={{ ...iSt, width:130 }} placeholder="Faction name" />
            <input value={f.desc||""} onChange={e=>setList(l=>l.map(x=>x.id===f.id?{...x,desc:e.target.value}:x))}
              style={{ ...iSt, flex:1 }} placeholder="Description" />
            <button onClick={()=>setList(l=>l.filter(x=>x.id!==f.id))} style={{ ...mBt, color:"#f87171" }}>✕</button>
          </div>
        ))}
        {list.length===0&&<div style={{ color:C.textD, fontSize:11, padding:"8px 0" }}>No factions. Add one below.</div>}
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:14, flexWrap:"wrap" }}>
        <input type="color" value={draft.color} onChange={e=>setDraft(d=>({...d,color:e.target.value}))}
          style={{ width:28,height:28,border:"none",background:"none",cursor:"pointer",padding:0 }} />
        <input value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))}
          style={{ ...iSt,width:130 }} placeholder="Name" />
        <input value={draft.desc} onChange={e=>setDraft(d=>({...d,desc:e.target.value}))}
          style={{ ...iSt,flex:1 }} placeholder="Description" />
        <button style={bSt("#14532d")} onClick={()=>{
          if(!draft.name.trim()) return;
          setList(l=>[...l,{id:genId(),...draft}]);
          setDraft({name:"",color:"#6366f1",desc:""});
        }}>+ Add</button>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button style={bSt("#14532d")} onClick={()=>onSave(list)}>Save Factions</button>
        <button style={bSt(C.bg3)} onClick={onClose}>Discard</button>
      </div>
    </Modal>
  );
}

// ─── CUSTOM FIELDS MANAGER ────────────────────────────────────────────────────
function FieldsManager({ fields, onSave, onClose }) {
  const [list, setList] = useState(fields.map(f=>({...f})));
  const [draft, setDraft] = useState({ label:"", type:"text", options:"" });
  const drag = useDragReorder((from,to)=>setList(l=>arrayMove(l,from,to)));

  return (
    <Modal title="Custom Character Fields" onClose={onClose} wide>
      <div style={{ fontSize:10, color:C.textM, marginBottom:10 }}>
        Custom fields appear on every character. Use them for any system: AC, Alignment, Motivation, Reputation, etc.
      </div>
      <div style={{ marginBottom:12 }}>
        {list.map((f,i)=>(
          <div key={f.id} {...drag(i)} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6,
            background:C.bg1, border:`1px solid ${C.border}`, borderRadius:5, padding:"7px 10px", cursor:"grab" }}>
            <span style={{ color:C.textD, fontSize:13 }}>⠿</span>
            <input value={f.label} onChange={e=>setList(l=>l.map(x=>x.id===f.id?{...x,label:e.target.value}:x))}
              style={{ ...iSt,width:150 }} placeholder="Field label" />
            <select value={f.type} onChange={e=>setList(l=>l.map(x=>x.id===f.id?{...x,type:e.target.value}:x))} style={{ ...sSt }}>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
            </select>
            {f.type==="select"&&(
              <input value={(f.options||[]).join(", ")} onChange={e=>setList(l=>l.map(x=>x.id===f.id?{...x,options:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}:x))}
                style={{ ...iSt,flex:1 }} placeholder="Option1, Option2, Option3" />
            )}
            <button onClick={()=>setList(l=>l.filter(x=>x.id!==f.id))} style={{ ...mBt, color:"#f87171" }}>✕</button>
          </div>
        ))}
        {list.length===0&&<div style={{ color:C.textD, fontSize:11, padding:"8px 0" }}>No custom fields.</div>}
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"flex-end", marginBottom:14, flexWrap:"wrap" }}>
        <FR label="Label">
          <input value={draft.label} onChange={e=>setDraft(d=>({...d,label:e.target.value}))} style={{ ...iSt,width:150 }} placeholder="e.g. Alignment" />
        </FR>
        <FR label="Type">
          <select value={draft.type} onChange={e=>setDraft(d=>({...d,type:e.target.value}))} style={sSt}>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="select">Select</option>
          </select>
        </FR>
        {draft.type==="select"&&(
          <FR label="Options (comma-sep)">
            <input value={draft.options} onChange={e=>setDraft(d=>({...d,options:e.target.value}))} style={{ ...iSt,width:200 }} placeholder="LG, NG, CG, LN..." />
          </FR>
        )}
        <button style={{ ...bSt("#14532d"), marginBottom:10 }} onClick={()=>{
          if(!draft.label.trim()) return;
          const f={ id:genId(), label:draft.label, type:draft.type };
          if(draft.type==="select") f.options=draft.options.split(",").map(s=>s.trim()).filter(Boolean);
          setList(l=>[...l,f]);
          setDraft({label:"",type:"text",options:""});
        }}>+ Add Field</button>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button style={bSt("#14532d")} onClick={()=>onSave(list)}>Save Fields</button>
        <button style={bSt(C.bg3)} onClick={onClose}>Discard</button>
      </div>
    </Modal>
  );
}

// ─── RELATION MANAGER ─────────────────────────────────────────────────────────
function RelationManager({ relations, characters, onSave, onClose }) {
  const [list, setList] = useState(relations.map(r=>({...r})));
  const [draft, setDraft] = useState({ from:"", to:"", type:"ally", strength:2, label:"" });
  const getName = id => characters.find(c=>c.id==id)?.name||id;
  const REL_COLOR = { ally:"#34d399", rival:"#f87171", neutral:"#94a3b8", unknown:"#a855f7" };

  return (
    <Modal title="Manage Relationships" onClose={onClose} wide>
      <div style={{ maxHeight:280, overflowY:"auto", marginBottom:12 }}>
        {list.map(r=>(
          <div key={r.id} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:5,
            background:C.bg1, border:`1px solid ${C.border}`, borderRadius:5, padding:"6px 10px" }}>
            <span style={{ fontSize:11, flex:1, color:C.text }}>
              <span style={{ color:"#93c5fd" }}>{getName(r.from)}</span>
              <span style={{ color:REL_COLOR[r.type]||C.textM, margin:"0 6px" }}>
                {r.type==="ally"?"━━▶":r.type==="rival"?"╌╌▶":"──▶"}
              </span>
              <span style={{ color:"#93c5fd" }}>{getName(r.to)}</span>
              {r.label&&<span style={{ color:C.textD, marginLeft:6 }}>"{r.label}"</span>}
            </span>
            <select value={r.type} onChange={e=>setList(l=>l.map(x=>x.id===r.id?{...x,type:e.target.value}:x))} style={{ ...sSt, fontSize:10 }}>
              {REL_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
            <select value={r.strength||2} onChange={e=>setList(l=>l.map(x=>x.id===r.id?{...x,strength:Number(e.target.value)}:x))} style={{ ...sSt, fontSize:10, width:60 }}>
              {[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}
            </select>
            <input value={r.label||""} onChange={e=>setList(l=>l.map(x=>x.id===r.id?{...x,label:e.target.value}:x))}
              style={{ ...iSt, width:110 }} placeholder="Label..." />
            <button onClick={()=>setList(l=>l.filter(x=>x.id!==r.id))} style={{ ...mBt, color:"#f87171" }}>✕</button>
          </div>
        ))}
        {list.length===0&&<div style={{ color:C.textD, fontSize:11, padding:8 }}>No relationships defined.</div>}
      </div>
      <div style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:6, padding:"12px 14px", marginBottom:12 }}>
        <SH s={{ marginBottom:8 }}>Add Relationship</SH>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end" }}>
          <FR label="From">
            <select value={draft.from} onChange={e=>setDraft(d=>({...d,from:e.target.value}))} style={sSt}>
              <option value="">— select —</option>
              {characters.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FR>
          <FR label="Type">
            <select value={draft.type} onChange={e=>setDraft(d=>({...d,type:e.target.value}))} style={sSt}>
              {REL_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </FR>
          <FR label="To">
            <select value={draft.to} onChange={e=>setDraft(d=>({...d,to:e.target.value}))} style={sSt}>
              <option value="">— select —</option>
              {characters.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FR>
          <FR label="Strength">
            <select value={draft.strength} onChange={e=>setDraft(d=>({...d,strength:Number(e.target.value)}))} style={{ ...sSt, width:60 }}>
              {[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}
            </select>
          </FR>
          <FR label="Label (optional)">
            <input value={draft.label} onChange={e=>setDraft(d=>({...d,label:e.target.value}))}
              style={{ ...iSt, width:160 }} placeholder="Commands, Exiled by..." />
          </FR>
          <button style={{ ...bSt("#14532d"), marginBottom:10 }} onClick={()=>{
            if(!draft.from||!draft.to||draft.from===draft.to) return;
            setList(l=>[...l,{ id:genId(), ...draft }]);
            setDraft(d=>({...d,from:"",to:"",label:""}));
          }}>+ Add</button>
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button style={bSt("#14532d")} onClick={()=>onSave(list)}>Save Relationships</button>
        <button style={bSt(C.bg3)} onClick={onClose}>Discard</button>
      </div>
    </Modal>
  );
}

// ─── CHAR FORM ────────────────────────────────────────────────────────────────
function CharForm({ init, factions, customFields, onSubmit, onCancel, label }) {
  const blank = { name:"", faction:factions[0]?.id||"", role:"", status:"active", hp:60, maxHp:60, notes:"", secrets:"", tagsStr:"", custom:{} };
  const [d, setD] = useState(init ? { ...init, tagsStr:(init.tags||[]).join(", ") } : blank);
  const set = k => e => setD(p=>({...p,[k]:e.target.value}));
  const setC = (id,v) => setD(p=>({...p,custom:{...p.custom,[id]:v}}));

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
        <FR label="Name"><input value={d.name} onChange={set("name")} style={iSt} /></FR>
        <FR label="Role / Class / Type"><input value={d.role} onChange={set("role")} style={iSt} /></FR>
        <FR label="Faction">
          <select value={d.faction} onChange={set("faction")} style={sSt}>
            {factions.length===0&&<option value="">No factions defined</option>}
            {factions.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </FR>
        <FR label="Status">
          <select value={d.status} onChange={set("status")} style={sSt}>
            {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
          </select>
        </FR>
        <FR label="Current HP">
          <input type="number" value={d.hp} onChange={e=>setD(p=>({...p,hp:Number(e.target.value)}))} style={{ ...iSt, width:80 }} />
        </FR>
        <FR label="Max HP">
          <input type="number" value={d.maxHp} onChange={e=>setD(p=>({...p,maxHp:Number(e.target.value)}))} style={{ ...iSt, width:80 }} />
        </FR>
      </div>
      <FR label="Tags (comma-separated)">
        <input value={d.tagsStr} onChange={set("tagsStr")} style={iSt} placeholder="warrior, spy, key-character, undead..." />
      </FR>
      <FR label="Notes (visible to players or general DM reference)">
        <textarea value={d.notes||""} onChange={set("notes")} rows={2} style={{ ...iSt, resize:"vertical" }} />
      </FR>
      <FR label="DM Secret (hidden layer — only shown when secrets unlocked)">
        <textarea value={d.secrets||""} onChange={set("secrets")} rows={2} style={{ ...iSt, resize:"vertical" }} />
      </FR>
      {customFields.length>0&&(
        <>
          <div style={{ fontSize:9, color:C.textD, textTransform:"uppercase", letterSpacing:"0.08em", margin:"8px 0 6px" }}>Custom Fields</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
            {customFields.map(cf=>(
              <FR key={cf.id} label={cf.label}>
                {cf.type==="select"?(
                  <select value={d.custom?.[cf.id]||""} onChange={e=>setC(cf.id,e.target.value)} style={sSt}>
                    <option value="">—</option>
                    {(cf.options||[]).map(o=><option key={o}>{o}</option>)}
                  </select>
                ):cf.type==="number"?(
                  <input type="number" value={d.custom?.[cf.id]||""} onChange={e=>setC(cf.id,e.target.value)} style={{ ...iSt, width:80 }} />
                ):(
                  <input value={d.custom?.[cf.id]||""} onChange={e=>setC(cf.id,e.target.value)} style={iSt} />
                )}
              </FR>
            ))}
          </div>
        </>
      )}
      <div style={{ display:"flex", gap:8, marginTop:14 }}>
        <button style={bSt("#14532d")} onClick={()=>{
          if(!d.name.trim()) return;
          onSubmit({ ...d, tags:d.tagsStr.split(",").map(t=>t.trim()).filter(Boolean), hp:Number(d.hp), maxHp:Number(d.maxHp) });
        }}>{label||"Save"}</button>
        <button style={bSt(C.bg3)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── CHAR CARD ────────────────────────────────────────────────────────────────
function CharCard({ char, factions, customFields, onSelect, onEdit, onDelta, onDelete, dragH }) {
  const col = fCol(factions, char.faction);
  const hpPct = char.maxHp ? Math.round(char.hp/char.maxHp*100) : 100;
  const hpC = hpPct>60?"#22c55e":hpPct>30?"#f59e0b":"#ef4444";
  const scol = STATUS_COLOR[char.status]||"#888";

  return (
    <div {...(dragH||{})} style={{ background:C.bg1, border:`1px solid ${col}33`,
      borderLeft:`3px solid ${col}`, borderRadius:8, overflow:"hidden",
      cursor:dragH?"grab":"default" }}>
      <div style={{ padding:"10px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:"bold", color:"#f8fafc", cursor:"pointer" }} onClick={onSelect}>{char.name}</div>
            <div style={{ fontSize:10, color:C.textD }}>{char.role||"—"} · <span style={{ color:col }}>{fName(factions,char.faction)}</span></div>
          </div>
          <span style={{ fontSize:9, padding:"2px 6px", borderRadius:4, fontWeight:"bold",
            background:`${scol}22`, color:scol, border:`1px solid ${scol}44` }}>{(char.status||"?").toUpperCase()}</span>
        </div>
        <div style={{ marginBottom:7 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:C.textD, marginBottom:2 }}>
            <span>HP</span><span style={{ color:hpC }}>{char.hp}/{char.maxHp}</span>
          </div>
          <div style={{ background:C.bg3, borderRadius:3, height:4 }}>
            <div style={{ width:`${Math.max(0,Math.min(100,hpPct))}%`, height:"100%", background:hpC, borderRadius:3, transition:"width 0.3s" }} />
          </div>
        </div>
        {(customFields||[]).filter(cf=>char.custom?.[cf.id]).slice(0,3).map(cf=>(
          <div key={cf.id} style={{ fontSize:9, color:C.textD, marginBottom:2 }}>
            <span>{cf.label}: </span><span style={{ color:C.textM }}>{char.custom[cf.id]}</span>
          </div>
        ))}
        {(char.tags||[]).length>0&&(
          <div style={{ display:"flex", flexWrap:"wrap", gap:3, margin:"5px 0 4px" }}>
            {(char.tags||[]).slice(0,5).map(t=>(
              <span key={t} style={{ fontSize:9, padding:"1px 5px", background:C.bg3, color:C.textD, borderRadius:3 }}>{t}</span>
            ))}
          </div>
        )}
        <div style={{ display:"flex", gap:4, alignItems:"center", marginTop:6 }}>
          {[-5,-1,1,5].map(d=>(
            <button key={d} onClick={()=>onDelta(d)}
              style={{ ...mBt, color:d<0?"#f87171":"#4ade80", padding:"2px 5px" }}>{d>0?"+":""}{d}</button>
          ))}
          <div style={{ flex:1 }} />
          <button onClick={onSelect} style={{ ...mBt, color:"#93c5fd" }}>inspect</button>
          <button onClick={onEdit} style={mBt}>edit</button>
          <button onClick={onDelete} style={{ ...mBt, color:"#f87171" }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ─── INSPECTOR PANEL ─────────────────────────────────────────────────────────
function Inspector({ char, world, secretsOn, onClose, onUpdate, onEdit }) {
  const col = fCol(world.factions, char.faction);
  const hpPct = char.maxHp?Math.round(char.hp/char.maxHp*100):100;
  const hpC = hpPct>60?"#22c55e":hpPct>30?"#f59e0b":"#ef4444";
  const getName = id => world.characters.find(c=>c.id==id)?.name||"?";
  const allies = world.relations.filter(r=>r.type==="ally"&&(r.from===char.id||r.to===char.id));
  const rivals = world.relations.filter(r=>r.type==="rival"&&(r.from===char.id||r.to===char.id));
  const others = world.relations.filter(r=>r.type!=="ally"&&r.type!=="rival"&&(r.from===char.id||r.to===char.id));

  return (
    <div style={{ position:"fixed", right:0, top:0, width:300, height:"100vh",
      background:"#060a12", borderLeft:`1px solid ${C.border}`, overflowY:"auto",
      padding:16, zIndex:200, fontFamily:C.mono }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <span style={{ fontSize:16, fontWeight:"bold", color:col }}>{char.name}</span>
        <div style={{ display:"flex", gap:5 }}>
          <button onClick={onEdit} style={mBt}>Edit</button>
          <button onClick={onClose} style={mBt}>✕</button>
        </div>
      </div>
      <div style={{ fontSize:10, color:C.textD, marginBottom:12 }}>
        <span style={{ color:col }}>{fName(world.factions,char.faction)}</span> · {char.role||"—"}
        <span style={{ marginLeft:8, padding:"1px 5px", borderRadius:3, fontSize:9,
          background:`${STATUS_COLOR[char.status]||"#888"}22`, color:STATUS_COLOR[char.status]||"#888" }}>
          {char.status}
        </span>
      </div>
      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.textD, marginBottom:3 }}>
          <span>HP</span><span style={{ color:hpC }}>{char.hp}/{char.maxHp}</span>
        </div>
        <div style={{ background:C.bg3, borderRadius:3, height:5, marginBottom:6 }}>
          <div style={{ width:`${Math.max(0,Math.min(100,hpPct))}%`, height:"100%", background:hpC, borderRadius:3 }} />
        </div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {[-10,-5,-1,1,5,10].map(d=>(
            <button key={d} onClick={()=>onUpdate({hp:Math.max(0,Math.min(char.maxHp,char.hp+d))})}
              style={{ ...mBt, color:d<0?"#f87171":"#4ade80", padding:"2px 5px" }}>{d>0?"+":""}{d}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:10, color:C.textD, marginBottom:4 }}>Status</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
          {STATUS_OPTS.map(s=>(
            <button key={s} onClick={()=>onUpdate({status:s})} style={{ ...mBt,
              color:char.status===s?STATUS_COLOR[s]:C.textD,
              background:char.status===s?`${STATUS_COLOR[s]}22`:"transparent",
              border:`1px solid ${char.status===s?STATUS_COLOR[s]+"44":C.border}` }}>{s}</button>
          ))}
        </div>
      </div>
      {char.notes&&(
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:C.textD, marginBottom:3 }}>Notes</div>
          <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.6 }}>{char.notes}</div>
        </div>
      )}
      {(world.customFields||[]).length>0&&(
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:C.textD, marginBottom:4 }}>Details</div>
          {(world.customFields||[]).map(cf=>(
            <div key={cf.id} style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
              <span style={{ color:C.textD }}>{cf.label}</span>
              <span style={{ color:C.text }}>{char.custom?.[cf.id]||"—"}</span>
            </div>
          ))}
        </div>
      )}
      {(char.tags||[]).length>0&&(
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:C.textD, marginBottom:4 }}>Tags</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {(char.tags||[]).map(t=>(
              <span key={t} style={{ fontSize:9, padding:"2px 6px", background:C.bg3, color:C.textM, borderRadius:3 }}>{t}</span>
            ))}
          </div>
        </div>
      )}
      {allies.length>0&&(
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:10, color:"#34d399", marginBottom:3 }}>Allies</div>
          {allies.map(r=>{ const oid=r.from===char.id?r.to:r.from;
            return <div key={r.id} style={{ fontSize:11, color:C.textD, marginBottom:2 }}>↔ {getName(oid)}{r.label?` · ${r.label}`:""}</div>; })}
        </div>
      )}
      {rivals.length>0&&(
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:10, color:"#f87171", marginBottom:3 }}>Rivalries</div>
          {rivals.map(r=>{ const oid=r.from===char.id?r.to:r.from;
            return <div key={r.id} style={{ fontSize:11, color:C.textD, marginBottom:2 }}>✗ {getName(oid)}{r.label?` · ${r.label}`:""}</div>; })}
        </div>
      )}
      {others.length>0&&(
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:C.textM, marginBottom:3 }}>Other Connections</div>
          {others.map(r=>{ const oid=r.from===char.id?r.to:r.from;
            return <div key={r.id} style={{ fontSize:11, color:C.textD, marginBottom:2 }}>{r.type} ↔ {getName(oid)}{r.label?` · ${r.label}`:""}</div>; })}
        </div>
      )}
      {secretsOn&&char.secrets&&(
        <div style={{ background:"#1a0b0b", border:"1px solid #3f1515", borderRadius:6, padding:"10px 12px" }}>
          <div style={{ fontSize:10, color:"#ef4444", marginBottom:4 }}>⊛ DM SECRET</div>
          <div style={{ fontSize:11, color:"#fca5a5", lineHeight:1.6 }}>{char.secrets}</div>
        </div>
      )}
    </div>
  );
}

// ─── SECRET CARD ─────────────────────────────────────────────────────────────
function SecretCard({ secret, onUpdate, onDelete, dragH }) {
  const [editing, setEditing] = useState(false);
  const [d, setD] = useState({...secret});
  const set = k => e => setD(p=>({...p,[k]:e.target.value}));
  return (
    <div {...(dragH||{})} style={{ background:C.bg1, border:`1px solid ${secret.color}44`,
      borderLeft:`3px solid ${secret.color}`, borderRadius:8, padding:"12px 14px",
      cursor:dragH?"grab":"default" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6, gap:8 }}>
        {editing
          ? <input value={d.label} onChange={set("label")} style={{ ...iSt, width:160 }} />
          : <span style={{ fontSize:12, fontWeight:"bold", color:"#f8fafc", flex:1 }}>{secret.label}</span>
        }
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          {editing
            ? <>
                <input value={d.status} onChange={set("status")} style={{ ...iSt, width:100, fontSize:9 }} />
                <input type="color" value={d.color} onChange={set("color")}
                  style={{ width:22,height:22,border:"none",background:"none",cursor:"pointer",padding:0 }} />
              </>
            : <span style={{ fontSize:9, color:secret.color, background:`${secret.color}22`,
                padding:"2px 6px", borderRadius:3, border:`1px solid ${secret.color}44`, whiteSpace:"nowrap" }}>{secret.status}</span>
          }
        </div>
      </div>
      {editing
        ? <textarea value={d.text} onChange={set("text")} rows={4} style={{ ...iSt, resize:"vertical", marginBottom:8 }} />
        : <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.6, marginBottom:8 }}>{secret.text}</div>
      }
      <div style={{ display:"flex", gap:6 }}>
        {editing
          ? <>
              <button style={bSt("#14532d")} onClick={()=>{ onUpdate(d); setEditing(false); }}>Save</button>
              <button style={bSt(C.bg3)} onClick={()=>{ setD({...secret}); setEditing(false); }}>Cancel</button>
            </>
          : <>
              <button style={mBt} onClick={()=>setEditing(true)}>Edit</button>
              <button style={{ ...mBt, color:"#f87171" }} onClick={onDelete}>Delete</button>
            </>
        }
      </div>
    </div>
  );
}

// ─── TIMELINE FORM ────────────────────────────────────────────────────────────
function TimelineForm({ init, onSubmit, onCancel }) {
  const [d, setD] = useState(init||{ year:"", label:"", text:"", hidden:false });
  const set = k => e => setD(p=>({...p,[k]:e.target.value}));
  return (
    <div>
      <FR label="Year / Era / Act"><input value={d.year} onChange={set("year")} style={iSt} placeholder="Year 7, Act 2, Session 4, Pre-war..." /></FR>
      <FR label="Label / Category"><input value={d.label} onChange={set("label")} style={iSt} placeholder="Crisis, Reveal, Deploy, Hidden..." /></FR>
      <FR label="Event Description">
        <textarea value={d.text} onChange={set("text")} rows={3} style={{ ...iSt, resize:"vertical" }} />
      </FR>
      <FR label="Hidden (DM-only layer)">
        <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.textM, cursor:"pointer" }}>
          <input type="checkbox" checked={!!d.hidden} onChange={e=>setD(p=>({...p,hidden:e.target.checked}))} />
          Hidden — only visible when DM secrets layer is unlocked
        </label>
      </FR>
      <div style={{ display:"flex", gap:8, marginTop:12 }}>
        <button style={bSt("#14532d")} onClick={()=>onSubmit(d)}>Save</button>
        <button style={bSt(C.bg3)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── ADD SECRET FORM ─────────────────────────────────────────────────────────
function AddSecretForm({ onSubmit, onCancel }) {
  const [d, setD] = useState({ label:"", status:"UNKNOWN", color:"#6366f1", text:"" });
  const set = k => e => setD(p=>({...p,[k]:e.target.value}));
  return (
    <div>
      <FR label="Title / Label"><input value={d.label} onChange={set("label")} style={iSt} /></FR>
      <FR label="Status Tag"><input value={d.status} onChange={set("status")} style={iSt} placeholder="ACTIVE, SEALED, CORRUPTED, UNKNOWN..." /></FR>
      <FR label="Color">
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input type="color" value={d.color} onChange={set("color")} style={{ width:32,height:32,border:"none",background:"none",cursor:"pointer" }} />
          <span style={{ fontSize:11, color:C.textM }}>{d.color}</span>
        </div>
      </FR>
      <FR label="Description / DM Notes">
        <textarea value={d.text} onChange={set("text")} rows={3} style={{ ...iSt, resize:"vertical" }} />
      </FR>
      <div style={{ display:"flex", gap:8, marginTop:12 }}>
        <button style={bSt("#14532d")} onClick={()=>{ if(d.label.trim()) onSubmit(d); }}>Add Secret</button>
        <button style={bSt(C.bg3)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  { id:"overview",   label:"⬡ Overview"    },
  { id:"network",    label:"◎ Network"     },
  { id:"characters", label:"◈ Characters"  },
  { id:"factions",   label:"⬟ Factions"    },
  { id:"timeline",   label:"⊡ Timeline"    },
  { id:"secrets",    label:"⊛ Secrets"     },
  { id:"session",    label:"◉ Session"     },
];

export default function WorldSim() {
  const [world, setWorld] = useState(()=>{
    try { const s=localStorage.getItem("wsim_v2"); return s?JSON.parse(s):DEFAULT_WORLD; } catch { return DEFAULT_WORLD; }
  });
  const [tab, setTab] = useState("overview");
  const [inspector, setInspector] = useState(null);
  const [secretsOn, setSecretsOn] = useState(false);
  const [editChar, setEditChar] = useState(null);
  const [addChar, setAddChar] = useState(false);
  const [showFactionMgr, setShowFactionMgr] = useState(false);
  const [showFieldMgr, setShowFieldMgr] = useState(false);
  const [showRelMgr, setShowRelMgr] = useState(false);
  const [addTimeline, setAddTimeline] = useState(false);
  const [editTimeline, setEditTimeline] = useState(null);
  const [addSecret, setAddSecret] = useState(false);
  const [factionFilter, setFactionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState("order");
  const [charView, setCharView] = useState("grid");
  const [sessionText, setSessionText] = useState("");
  const [showMeta, setShowMeta] = useState(false);
  const fileRef = useRef(null);

  useEffect(()=>{ try { localStorage.setItem("wsim_v2",JSON.stringify(world)); } catch {} },[world]);

  const uw = useCallback(fn=>setWorld(p=>({...p,...fn(p)})),[]);

  // char ops
  const updateChar = (id,patch)=>{
    uw(w=>({ characters:w.characters.map(c=>c.id===id?{...c,...patch}:c) }));
    if(inspector?.id===id) setInspector(c=>({...c,...patch}));
  };
  const deleteChar = id=>{
    uw(w=>({ characters:w.characters.filter(c=>c.id!==id), relations:w.relations.filter(r=>r.from!==id&&r.to!==id) }));
    if(inspector?.id===id) setInspector(null);
  };

  // filtered chars
  const filtered = useMemo(()=>{
    let list = world.characters.filter(c=>{
      if(factionFilter!=="all"&&c.faction!==factionFilter) return false;
      if(statusFilter!=="all"&&c.status!==statusFilter) return false;
      if(searchQ){
        const q=searchQ.toLowerCase();
        if(!c.name.toLowerCase().includes(q)&&!(c.notes||"").toLowerCase().includes(q)
          &&!(c.tags||[]).join(" ").toLowerCase().includes(q)&&!(c.role||"").toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if(sortBy==="name")    list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
    else if(sortBy==="faction") list=[...list].sort((a,b)=>a.faction.localeCompare(b.faction));
    else if(sortBy==="status")  list=[...list].sort((a,b)=>a.status.localeCompare(b.status));
    else if(sortBy==="hp")      list=[...list].sort((a,b)=>b.hp-a.hp);
    else list=[...list].sort((a,b)=>(a.order||0)-(b.order||0));
    return list;
  },[world.characters,factionFilter,statusFilter,searchQ,sortBy]);

  // drag reorder for chars, timeline, secrets
  const charsByOrder = [...world.characters].sort((a,b)=>(a.order||0)-(b.order||0));
  const charDrag = useDragReorder((from,to)=>uw(()=>({
    characters: arrayMove(charsByOrder,from,to).map((c,i)=>({...c,order:i}))
  })));
  const sortedTimeline = [...world.timeline].sort((a,b)=>(a.order||0)-(b.order||0));
  const tlDrag = useDragReorder((from,to)=>uw(()=>({
    timeline: arrayMove(sortedTimeline,from,to).map((t,i)=>({...t,order:i}))
  })));
  const sortedSecrets = [...world.secrets].sort((a,b)=>(a.order||0)-(b.order||0));
  const secDrag = useDragReorder((from,to)=>uw(()=>({
    secrets: arrayMove(sortedSecrets,from,to).map((s,i)=>({...s,order:i}))
  })));

  const netPos = useForceLayout(world.characters, world.relations);

  const stats = useMemo(()=>{
    const byF={};
    world.factions.forEach(f=>{byF[f.id]=0;});
    world.characters.forEach(c=>{byF[c.faction]=(byF[c.faction]||0)+1;});
    return {
      byF, total:world.characters.length,
      wounded:world.characters.filter(c=>c.status==="wounded").length,
      exiled:world.characters.filter(c=>c.status==="exiled").length,
      dead:world.characters.filter(c=>c.status==="dead").length,
      allies:world.relations.filter(r=>r.type==="ally").length,
      rivals:world.relations.filter(r=>r.type==="rival").length,
    };
  },[world]);

  const handleImport = e=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=ev=>{
      try {
        const d=JSON.parse(ev.target.result);
        if(d.characters&&d.factions){ setWorld(d); alert("World loaded."); }
        else alert("Invalid format — needs characters and factions arrays.");
      } catch { alert("Parse error."); }
    };
    r.readAsText(f);
    e.target.value="";
  };

  const addNote = ()=>{
    if(!sessionText.trim()) return;
    uw(w=>({sessionNotes:[...(w.sessionNotes||[]),{id:genId(),ts:new Date().toLocaleString(),text:sessionText.trim()}]}));
    setSessionText("");
  };

  const REL_COL = {ally:"#34d399",rival:"#f87171",neutral:"#94a3b8",unknown:"#a855f7"};

  return (
    <div style={{ background:C.bg0, minHeight:"100vh", color:C.text, fontFamily:C.mono, display:"flex", flexDirection:"column" }}>

      {/* HEADER */}
      <div style={{ background:C.bg2, borderBottom:`1px solid ${C.border}`, padding:"9px 16px",
        display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18, color:"#f59e0b" }}>⬡</span>
          <div>
            <div style={{ fontSize:13, fontWeight:"bold", color:"#f8fafc", letterSpacing:"0.08em", textTransform:"uppercase" }}>
              {world.meta.title||"Untitled World"}
            </div>
            <div style={{ fontSize:9, color:C.textD, letterSpacing:"0.05em" }}>
              {[world.meta.campaign, world.meta.system, "World Sim v2"].filter(Boolean).join(" · ")}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          <button style={bSt(C.bg3)} onClick={()=>setShowMeta(m=>!m)}>⚙ Meta</button>
          <button style={bSt(C.bg3)} onClick={()=>setShowFactionMgr(true)}>⬟ Factions</button>
          <button style={bSt(C.bg3)} onClick={()=>setShowFieldMgr(true)}>⊞ Fields</button>
          <button style={bSt(C.bg3)} onClick={()=>setShowRelMgr(true)}>⇌ Relations</button>
          <button style={bSt("#14532d")} onClick={()=>exportWorld(world)}>↓ Export</button>
          <button style={bSt("#1e3a5f")} onClick={()=>fileRef.current?.click()}>↑ Import</button>
          <button style={bSt(C.bg3)} onClick={()=>{ if(confirm("Start a blank world?")) setWorld({...BLANK_WORLD,meta:{...BLANK_WORLD.meta,created:new Date().toISOString()}}); }}>☐ Blank</button>
          <button style={bSt("#3f1515")} onClick={()=>{ if(confirm("Reset to Forge Units demo world?")) setWorld(DEFAULT_WORLD); }}>↺ Reset Demo</button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display:"none" }} />
        </div>
      </div>

      {/* META EDITOR */}
      {showMeta&&(
        <div style={{ background:C.bg2, borderBottom:`1px solid ${C.border}`, padding:"10px 16px",
          display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
          {["title","campaign","system"].map(k=>(
            <label key={k} style={{ display:"flex", flexDirection:"column", gap:3 }}>
              <span style={{ fontSize:9, color:C.textD, textTransform:"uppercase" }}>{k}</span>
              <input value={world.meta[k]||""} onChange={e=>setWorld(w=>({...w,meta:{...w.meta,[k]:e.target.value}}))}
                style={{ ...iSt, width:170 }} />
            </label>
          ))}
          <button style={{ ...bSt(C.bg3), marginBottom:0 }} onClick={()=>setShowMeta(false)}>Done</button>
        </div>
      )}

      {/* TABS */}
      <div style={{ background:"#090d17", borderBottom:`1px solid ${C.border}`, display:"flex",
        gap:1, padding:"5px 12px", overflowX:"auto" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            ...bSt(tab===t.id?"#1e3a5f":"transparent"),
            border:tab===t.id?`1px solid ${C.borderB}`:"1px solid transparent",
            color:tab===t.id?"#93c5fd":C.textD, whiteSpace:"nowrap",
            fontSize:11, letterSpacing:"0.06em"
          }}>{t.label}</button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex:1, overflow:"auto", padding:"14px 16px",
        paddingRight:inspector?"316px":"16px" }}>

        {/* ══ OVERVIEW ══ */}
        {tab==="overview"&&(
          <div>
            <SH>World State</SH>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:8, marginBottom:18 }}>
              <StatCard label="Total Entities" value={stats.total} />
              {world.factions.map(f=>(
                <StatCard key={f.id} label={f.name} value={stats.byF[f.id]||0} accent={f.color} sub={f.desc} />
              ))}
              <StatCard label="Wounded" value={stats.wounded} accent="#f59e0b" />
              <StatCard label="Exiled"  value={stats.exiled}  accent="#ef4444" />
              <StatCard label="Dead"    value={stats.dead}    accent="#6b7280" />
              <StatCard label="Alliances" value={stats.allies} accent="#34d399" />
              <StatCard label="Rivalries" value={stats.rivals} accent="#f87171" />
            </div>

            {world.factions.length>0&&(
              <>
                <SH>Faction Cohesion</SH>
                {world.factions.map(f=>{
                  const m=world.characters.filter(c=>c.faction===f.id);
                  const a=m.filter(c=>c.status==="active").length;
                  const pct=m.length?Math.round(a/m.length*100):0;
                  return (
                    <div key={f.id} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.textM, marginBottom:3 }}>
                        <span style={{ color:f.color }}>{f.name}</span>
                        <span>{a}/{m.length} active · {pct}%</span>
                      </div>
                      <div style={{ background:C.bg3, borderRadius:3, height:5 }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:f.color, borderRadius:3, transition:"width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {world.characters.filter(c=>c.status==="wounded"||c.status==="exiled"||c.status==="dead").length>0&&(
              <>
                <SH s={{ marginTop:18 }}>Needs Attention</SH>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {world.characters.filter(c=>["wounded","exiled","dead"].includes(c.status)).map(c=>{
                    const sc=STATUS_COLOR[c.status]||"#888";
                    return (
                      <div key={c.id} onClick={()=>setInspector(c)} style={{ background:C.bg1,
                        border:`1px solid ${sc}44`, borderLeft:`3px solid ${sc}`,
                        borderRadius:6, padding:"8px 12px", cursor:"pointer",
                        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <span style={{ fontSize:12, color:"#f8fafc", marginRight:8 }}>{c.name}</span>
                          <span style={{ fontSize:10, color:fCol(world.factions,c.faction) }}>{fName(world.factions,c.faction)}</span>
                        </div>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          <span style={{ fontSize:10, color:C.textD }}>{c.hp}/{c.maxHp} HP</span>
                          <span style={{ fontSize:9, color:sc, background:`${sc}22`, padding:"2px 6px", borderRadius:3 }}>{c.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {world.factions.length===0&&world.characters.length===0&&(
              <div style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:8, padding:"30px 20px", textAlign:"center", color:C.textD, fontSize:12, marginTop:20 }}>
                <div style={{ fontSize:24, marginBottom:10 }}>⬡</div>
                <div style={{ marginBottom:6 }}>This world is empty.</div>
                <div style={{ fontSize:10 }}>Use <strong style={{ color:C.textM }}>⬟ Factions</strong> to add factions, then <strong style={{ color:C.textM }}>◈ Characters</strong> to populate it.</div>
                <div style={{ fontSize:10, marginTop:4 }}>Or use <strong style={{ color:C.textM }}>↑ Import</strong> to load a saved world.</div>
              </div>
            )}
          </div>
        )}

        {/* ══ NETWORK ══ */}
        {tab==="network"&&(
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <SH s={{ margin:0 }}>Relationship Network</SH>
              <div style={{ flex:1 }} />
              <button style={bSt(C.bg3)} onClick={()=>setShowRelMgr(true)}>⇌ Edit Relations</button>
            </div>
            <div style={{ fontSize:10, color:C.textD, marginBottom:10, display:"flex", gap:14, flexWrap:"wrap" }}>
              {Object.entries(REL_COL).map(([t,c])=>(
                <span key={t} style={{ color:c }}>{t==="rival"?"╌╌":"━━"} {t}</span>
              ))}
              <span>· Click node to inspect</span>
            </div>
            <div style={{ position:"relative", background:"#060a12", border:`1px solid ${C.border}`,
              borderRadius:8, height:500, overflow:"hidden" }}>
              <svg width="100%" height="100%" viewBox="0 0 680 500" style={{ position:"absolute", inset:0 }}>
                <defs>
                  <marker id="marrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </marker>
                </defs>
                {world.relations.map((r,i)=>{
                  const a=netPos[r.from],b=netPos[r.to];
                  if(!a||!b) return null;
                  const col=REL_COL[r.type]||C.textM;
                  return (
                    <line key={r.id||i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={col} strokeWidth={0.6+(r.strength||1)*0.35}
                      strokeDasharray={r.type==="rival"?"5 4":r.type==="neutral"?"2 3":""}
                      opacity={0.55} markerEnd="url(#marrow)" />
                  );
                })}
                {world.characters.map(c=>{
                  const p=netPos[c.id]; if(!p) return null;
                  const col=fCol(world.factions,c.faction);
                  const sel=inspector?.id===c.id;
                  return (
                    <g key={c.id} onClick={()=>setInspector(c)} style={{ cursor:"pointer" }}>
                      <circle cx={p.x} cy={p.y} r={sel?22:16} fill={col} fillOpacity={sel?0.3:0.18} stroke={col} strokeWidth={sel?2:0.8} />
                      <circle cx={p.x} cy={p.y} r={5} fill={STATUS_COLOR[c.status]||"#888"} stroke={col} strokeWidth={0.5} />
                      <text x={p.x} y={p.y-20} textAnchor="middle" fontSize={10} fill={col} style={{ fontFamily:C.mono }}>{c.name}</text>
                    </g>
                  );
                })}
              </svg>
              {world.characters.length===0&&(
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                  color:C.textD, fontSize:12 }}>No characters yet. Add some in the Characters tab.</div>
              )}
            </div>
          </div>
        )}

        {/* ══ CHARACTERS ══ */}
        {tab==="characters"&&(
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
              <SH s={{ margin:0 }}>Characters ({filtered.length}/{world.characters.length})</SH>
              <div style={{ flex:1 }} />
              <input placeholder="🔍 Search..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                style={{ ...iSt, width:130 }} />
              <select value={factionFilter} onChange={e=>setFactionFilter(e.target.value)} style={sSt}>
                <option value="all">All Factions</option>
                {world.factions.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={sSt}>
                <option value="all">All Status</option>
                {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
              </select>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={sSt}>
                <option value="order">Manual Order</option>
                <option value="name">Name A–Z</option>
                <option value="faction">Faction</option>
                <option value="status">Status</option>
                <option value="hp">HP High→Low</option>
              </select>
              <button style={bSt(C.bg3)} onClick={()=>setCharView(v=>v==="grid"?"list":"grid")}>
                {charView==="grid"?"≡ List":"⊞ Grid"}
              </button>
              <button style={bSt("#14532d")} onClick={()=>setAddChar(true)}>+ Add</button>
            </div>
            {sortBy==="order"&&<div style={{ fontSize:9, color:C.textD, marginBottom:8 }}>⠿ Drag cards to reorder manually</div>}
            <div style={charView==="grid"
              ?{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))", gap:10 }
              :{ display:"flex", flexDirection:"column", gap:6 }}>
              {filtered.map((c,idx)=>{
                const origIdx = charsByOrder.findIndex(x=>x.id===c.id);
                return (
                  <CharCard key={c.id} char={c} factions={world.factions} customFields={world.customFields||[]}
                    onSelect={()=>setInspector(c)}
                    onEdit={()=>setEditChar(c)}
                    onDelta={d=>updateChar(c.id,{hp:Math.max(0,Math.min(c.maxHp,c.hp+d))})}
                    onDelete={()=>{ if(confirm(`Delete ${c.name}?`)) deleteChar(c.id); }}
                    dragH={sortBy==="order"?charDrag(origIdx):null}
                  />
                );
              })}
              {filtered.length===0&&(
                <div style={{ color:C.textD, fontSize:12, padding:30, textAlign:"center" }}>No characters match filters.</div>
              )}
            </div>
          </div>
        )}

        {/* ══ FACTIONS ══ */}
        {tab==="factions"&&(
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <SH s={{ margin:0 }}>Factions</SH>
              <div style={{ flex:1 }} />
              <button style={bSt("#14532d")} onClick={()=>setShowFactionMgr(true)}>⬟ Edit Factions</button>
            </div>
            {world.factions.length===0&&(
              <div style={{ color:C.textD, fontSize:12, padding:"20px 0" }}>
                No factions defined. Click "Edit Factions" to create them.<br/>
                <span style={{ fontSize:10 }}>Factions can be anything: guilds, families, nations, species, ideological groups.</span>
              </div>
            )}
            {world.factions.map(f=>{
              const members=world.characters.filter(c=>c.faction===f.id);
              const byStatus={};
              STATUS_OPTS.forEach(s=>{ byStatus[s]=members.filter(c=>c.status===s).length; });
              return (
                <div key={f.id} style={{ background:C.bg1, border:`1px solid ${f.color}44`,
                  borderLeft:`4px solid ${f.color}`, borderRadius:8, padding:"14px 16px", marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:"bold", color:f.color }}>{f.name}</div>
                      <div style={{ fontSize:11, color:C.textM, marginTop:2 }}>{f.desc||"—"}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:22, fontWeight:"bold", color:f.color }}>{members.length}</div>
                      <div style={{ fontSize:9, color:C.textD }}>members</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                    {STATUS_OPTS.filter(s=>byStatus[s]>0).map(s=>(
                      <span key={s} style={{ fontSize:10, padding:"2px 7px",
                        background:`${STATUS_COLOR[s]}18`, color:STATUS_COLOR[s],
                        border:`1px solid ${STATUS_COLOR[s]}33`, borderRadius:4 }}>
                        {byStatus[s]} {s}
                      </span>
                    ))}
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {members.map(c=>(
                      <span key={c.id} onClick={()=>{ setInspector(c); setTab("characters"); }}
                        style={{ fontSize:10, padding:"3px 8px", background:`${f.color}18`,
                          color:f.color, border:`1px solid ${f.color}33`, borderRadius:4, cursor:"pointer" }}>
                        {c.name}
                        <span style={{ marginLeft:4, color:STATUS_COLOR[c.status]||"#888", fontSize:8 }}>●</span>
                      </span>
                    ))}
                    {members.length===0&&<span style={{ fontSize:10, color:C.textD }}>No members assigned.</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ TIMELINE ══ */}
        {tab==="timeline"&&(
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <SH s={{ margin:0 }}>Timeline</SH>
              <div style={{ flex:1 }} />
              <label style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:C.textM, cursor:"pointer" }}>
                <input type="checkbox" checked={secretsOn} onChange={e=>setSecretsOn(e.target.checked)} />
                Show hidden events
              </label>
              <button style={bSt("#14532d")} onClick={()=>setAddTimeline(true)}>+ Add Event</button>
            </div>
            <div style={{ fontSize:9, color:C.textD, marginBottom:10 }}>⠿ Drag events to reorder chronology</div>
            <div style={{ position:"relative", paddingLeft:22 }}>
              <div style={{ position:"absolute", left:6, top:0, bottom:0, width:1, background:C.border }} />
              {sortedTimeline.filter(e=>secretsOn||!e.hidden).map((e,idx)=>(
                <div key={e.id} {...tlDrag(sortedTimeline.indexOf(e))}
                  style={{ position:"relative", marginBottom:11, cursor:"grab" }}>
                  <div style={{ position:"absolute", left:-20, top:9, width:10, height:10, borderRadius:"50%",
                    background:e.hidden?"#ef4444":"#3b82f6", border:`1px solid ${C.border}` }} />
                  <div style={{ background:e.hidden?"#160a0a":C.bg1,
                    border:`1px solid ${e.hidden?"#3f1515":C.border}`, borderRadius:6, padding:"9px 12px" }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4, flexWrap:"wrap" }}>
                      <span style={{ fontSize:10, color:"#3b82f6", fontWeight:"bold" }}>{e.year}</span>
                      <span style={{ fontSize:9, padding:"1px 5px", borderRadius:3,
                        background:e.hidden?"#3f1515":"#1e3a5f",
                        color:e.hidden?"#fca5a5":"#93c5fd" }}>{e.label}{e.hidden?" · HIDDEN":""}</span>
                      <div style={{ flex:1 }} />
                      <button style={mBt} onClick={()=>setEditTimeline(e)}>Edit</button>
                      <button style={{ ...mBt, color:"#f87171" }} onClick={()=>uw(w=>({timeline:w.timeline.filter(t=>t.id!==e.id)}))}>✕</button>
                    </div>
                    <div style={{ fontSize:12, color:e.hidden?"#fca5a5":"#cbd5e1" }}>{e.text}</div>
                  </div>
                </div>
              ))}
              {sortedTimeline.filter(e=>secretsOn||!e.hidden).length===0&&(
                <div style={{ color:C.textD, fontSize:12, padding:"20px 0" }}>No timeline events. Add one to start.</div>
              )}
            </div>
          </div>
        )}

        {/* ══ SECRETS ══ */}
        {tab==="secrets"&&(
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <SH s={{ margin:0 }}>DM Secrets Layer</SH>
              <div style={{ flex:1 }} />
              <button style={bSt(secretsOn?"#3f1515":C.bg3)} onClick={()=>setSecretsOn(r=>!r)}>
                {secretsOn?"⊛ Lock":"⊙ Reveal"}
              </button>
              <button style={bSt("#14532d")} onClick={()=>setAddSecret(true)}>+ Add Secret</button>
            </div>
            {!secretsOn?(
              <div style={{ background:C.bg1, border:"1px solid #3f1515", borderRadius:8,
                padding:"50px 20px", textAlign:"center", color:C.textD, fontSize:12 }}>
                <div style={{ fontSize:28, marginBottom:10 }}>⊛</div>
                <div>Secrets locked. Click Reveal to access the DM narrative layer.</div>
                <div style={{ fontSize:10, marginTop:6 }}>{world.secrets.length} secret{world.secrets.length!==1?"s":""} stored.</div>
              </div>
            ):(
              <>
                <div style={{ fontSize:9, color:C.textD, marginBottom:10 }}>⠿ Drag cards to reorder</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))", gap:10 }}>
                  {sortedSecrets.map((s,idx)=>(
                    <SecretCard key={s.id} secret={s}
                      dragH={secDrag(idx)}
                      onDelete={()=>uw(w=>({secrets:w.secrets.filter(x=>x.id!==s.id)}))}
                      onUpdate={patch=>uw(w=>({secrets:w.secrets.map(x=>x.id===s.id?{...x,...patch}:x)}))}
                    />
                  ))}
                  {sortedSecrets.length===0&&(
                    <div style={{ color:C.textD, fontSize:12, padding:"20px 0" }}>No secrets stored.</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ SESSION ══ */}
        {tab==="session"&&(
          <div>
            <SH>Session Log</SH>
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              <textarea value={sessionText} onChange={e=>setSessionText(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter"&&e.ctrlKey) addNote(); }}
                placeholder="Session note, plot beat, DM reminder, player action result... (Ctrl+Enter to save)"
                rows={3} style={{ ...iSt, flex:1, resize:"vertical" }} />
              <button style={{ ...bSt("#14532d"), alignSelf:"flex-end" }} onClick={addNote}>Save</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {[...(world.sessionNotes||[])].reverse().map(n=>(
                <div key={n.id} style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:6, padding:"9px 12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:9, color:C.textD }}>{n.ts}</span>
                    <button style={{ ...mBt, color:"#f87171" }}
                      onClick={()=>uw(w=>({sessionNotes:(w.sessionNotes||[]).filter(x=>x.id!==n.id)}))}>✕</button>
                  </div>
                  <div style={{ fontSize:12, color:"#cbd5e1", whiteSpace:"pre-wrap" }}>{n.text}</div>
                </div>
              ))}
              {(world.sessionNotes||[]).length===0&&(
                <div style={{ color:C.textD, fontSize:12, textAlign:"center", padding:30 }}>No session notes yet.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* INSPECTOR PANEL */}
      {inspector&&(
        <Inspector char={inspector} world={world} secretsOn={secretsOn}
          onClose={()=>setInspector(null)}
          onEdit={()=>setEditChar(inspector)}
          onUpdate={patch=>updateChar(inspector.id,patch)}
        />
      )}

      {/* MODALS */}
      {showFactionMgr&&(
        <FactionManager factions={world.factions}
          onSave={list=>{ uw(()=>({factions:list})); setShowFactionMgr(false); }}
          onClose={()=>setShowFactionMgr(false)} />
      )}
      {showFieldMgr&&(
        <FieldsManager fields={world.customFields||[]}
          onSave={list=>{ uw(()=>({customFields:list})); setShowFieldMgr(false); }}
          onClose={()=>setShowFieldMgr(false)} />
      )}
      {showRelMgr&&(
        <RelationManager relations={world.relations} characters={world.characters}
          onSave={list=>{ uw(()=>({relations:list})); setShowRelMgr(false); }}
          onClose={()=>setShowRelMgr(false)} />
      )}
      {addChar&&(
        <Modal title="Add Character" onClose={()=>setAddChar(false)} wide>
          <CharForm factions={world.factions} customFields={world.customFields||[]} label="Add Character"
            onSubmit={d=>{ uw(w=>({characters:[...w.characters,{id:genId(),order:w.characters.length,custom:{},...d}]})); setAddChar(false); }}
            onCancel={()=>setAddChar(false)} />
        </Modal>
      )}
      {editChar&&(
        <Modal title={`Edit: ${editChar.name}`} onClose={()=>setEditChar(null)} wide>
          <CharForm init={editChar} factions={world.factions} customFields={world.customFields||[]} label="Save Changes"
            onSubmit={patch=>{ updateChar(editChar.id,patch); setEditChar(null); }}
            onCancel={()=>setEditChar(null)} />
        </Modal>
      )}
      {addTimeline&&(
        <Modal title="Add Timeline Event" onClose={()=>setAddTimeline(false)}>
          <TimelineForm
            onSubmit={d=>{ uw(w=>({timeline:[...w.timeline,{id:genId(),order:w.timeline.length,...d}]})); setAddTimeline(false); }}
            onCancel={()=>setAddTimeline(false)} />
        </Modal>
      )}
      {editTimeline&&(
        <Modal title="Edit Timeline Event" onClose={()=>setEditTimeline(null)}>
          <TimelineForm init={editTimeline}
            onSubmit={patch=>{ uw(w=>({timeline:w.timeline.map(t=>t.id===editTimeline.id?{...t,...patch}:t)})); setEditTimeline(null); }}
            onCancel={()=>setEditTimeline(null)} />
        </Modal>
      )}
      {addSecret&&(
        <Modal title="Add Secret" onClose={()=>setAddSecret(false)}>
          <AddSecretForm
            onSubmit={d=>{ uw(w=>({secrets:[...w.secrets,{id:genId(),order:w.secrets.length,...d}]})); setAddSecret(false); }}
            onCancel={()=>setAddSecret(false)} />
        </Modal>
      )}
    </div>
  );
}