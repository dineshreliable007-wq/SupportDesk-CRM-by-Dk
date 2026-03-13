import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ── User Accounts ─────────────────────────────────────────────────────────────
const USERS_INIT = [
  { id:1, email:"admin@supportdesk.com",  password:"admin123",  name:"Dinesh Kumar", role:"Admin",              avatar:"D", color:"#6C63FF", phone:"+91-9876500001", department:"Management" },
  { id:2, email:"alice@supportdesk.com",  password:"alice123",  name:"Alice Kumar",  role:"Senior Engineer",    avatar:"A", color:"#00E396", phone:"+91-9876500002", department:"Engineering" },
  { id:3, email:"raj@supportdesk.com",    password:"raj123",    name:"Raj Mehta",    role:"Support Lead",       avatar:"R", color:"#FEB019", phone:"+91-9876500003", department:"Support" },
  { id:4, email:"priya@supportdesk.com",  password:"priya123",  name:"Priya Singh",  role:"Billing Specialist", avatar:"P", color:"#FF4560", phone:"+91-9876500004", department:"Finance" },
  { id:5, email:"amit@supportdesk.com",   password:"amit123",   name:"Amit Sharma",  role:"Network Engineer",   avatar:"AM",color:"#FF8C00", phone:"+91-9876500005", department:"Engineering" },
];

// ── Escalation Rules ──────────────────────────────────────────────────────────
const DEFAULT_ESC_RULES = [
  { id:1, name:"P1 No Response",    priority:"P1",  triggerAfter:15, unit:"min", action:"Escalate to Senior Engineer", active:true,  escalateTo:"Alice Kumar"  },
  { id:2, name:"P2 Response SLA",   priority:"P2",  triggerAfter:60, unit:"min", action:"Escalate to Team Lead",       active:true,  escalateTo:"Raj Mehta"    },
  { id:3, name:"P3 Idle Ticket",    priority:"P3",  triggerAfter:4,  unit:"hrs", action:"Notify & Escalate",           active:true,  escalateTo:"Priya Singh"  },
  { id:4, name:"P4 Long Pending",   priority:"P4",  triggerAfter:8,  unit:"hrs", action:"Flag for Review",             active:false, escalateTo:"Neha Patel"   },
  { id:5, name:"Any Unresolved 24h",priority:"ALL", triggerAfter:24, unit:"hrs", action:"Escalate to Manager",         active:true,  escalateTo:"Raj Mehta"    },
];

// ── Master Data ───────────────────────────────────────────────────────────────
const MASTER_CATEGORIES_INIT = ["Technical","Billing","Account","Network","Hardware","Software","Other"];
const MASTER_PRIORITIES_META = { P1:{label:"Critical",color:"#FF4560"}, P2:{label:"High",color:"#FF8C00"}, P3:{label:"Medium",color:"#FEB019"}, P4:{label:"Low",color:"#00E396"} };
const MASTER_CLIENTS_INIT = [
  { id:1, name:"Infosys Ltd",    contact:"Vikram Nair",    email:"vikram@infosys.com",    phone:"+91-9876543210", city:"Bengaluru", active:true },
  { id:2, name:"TCS Mumbai",     contact:"Anita Desai",    email:"anita@tcs.com",         phone:"+91-9123456789", city:"Mumbai",    active:true },
  { id:3, name:"Wipro Pune",     contact:"Suresh Patil",   email:"suresh@wipro.com",      phone:"+91-9988776655", city:"Pune",      active:true },
  { id:4, name:"HCL Tech",       contact:"Meera Joshi",    email:"meera@hcl.com",         phone:"+91-9012345678", city:"Noida",     active:true },
  { id:5, name:"Reliance Retail",contact:"Arun Shah",      email:"arun@reliance.com",     phone:"+91-9871234567", city:"Mumbai",    active:false },
  { id:6, name:"Bajaj Finserv",  contact:"Kavya Reddy",    email:"kavya@bajaj.com",       phone:"+91-9765432100", city:"Pune",      active:true },
  { id:7, name:"Zomato India",   contact:"Rahul Verma",    email:"rahul@zomato.com",      phone:"+91-9654321009", city:"Gurugram",  active:true },
  { id:8, name:"Paytm Services", contact:"Pooja Gupta",    email:"pooja@paytm.com",       phone:"+91-9543210098", city:"Noida",     active:true },
];
const MASTER_DEPARTMENTS_INIT = [
  { id:1, name:"Engineering",  head:"Alice Kumar",  members:3 },
  { id:2, name:"Support",      head:"Raj Mehta",    members:5 },
  { id:3, name:"Finance",      head:"Priya Singh",  members:2 },
  { id:4, name:"Management",   head:"Dinesh Kumar", members:2 },
  { id:5, name:"Sales",        head:"Neha Patel",   members:4 },
];
const MASTER_SLA_INIT = [
  { id:1, priority:"P1", label:"Critical", response:15,  resolution:240,  color:"#FF4560" },
  { id:2, priority:"P2", label:"High",     response:60,  resolution:480,  color:"#FF8C00" },
  { id:3, priority:"P3", label:"Medium",   response:240, resolution:1440, color:"#FEB019" },
  { id:4, priority:"P4", label:"Low",      response:480, resolution:4320, color:"#00E396" },
];

// ── Constants ─────────────────────────────────────────────────────────────────
const PRIORITIES = {
  P1: { label:"Critical", response:15,  resolution:240,  color:"#FF4560", bg:"#FF456018" },
  P2: { label:"High",     response:60,  resolution:480,  color:"#FF8C00", bg:"#FF8C0018" },
  P3: { label:"Medium",   response:240, resolution:1440, color:"#FEB019", bg:"#FEB01918" },
  P4: { label:"Low",      response:480, resolution:4320, color:"#00E396", bg:"#00E39618" },
};
const STATUSES   = ["Open","In Progress","Pending","Escalated","Resolved","Closed"];
const CATEGORIES = ["Technical","Billing","Account","Network","Hardware","Software","Other"];
const AGENTS = [
  { name:"Alice Kumar",  role:"Senior Engineer",     solved:47, avg:38, rating:4.8, online:true  },
  { name:"Raj Mehta",    role:"Support Lead",         solved:62, avg:52, rating:4.6, online:true  },
  { name:"Priya Singh",  role:"Billing Specialist",   solved:38, avg:45, rating:4.9, online:false },
  { name:"Amit Sharma",  role:"Network Engineer",     solved:55, avg:41, rating:4.7, online:true  },
  { name:"Neha Patel",   role:"Tech Analyst",         solved:29, avg:67, rating:4.5, online:false },
];
const AGENT_NAMES = AGENTS.map(a=>a.name);
const fmtMin = m => m>=60?`${Math.round(m/60)}h`:`${m}m`;
const getElapsed = created => Math.floor((Date.now()-created)/60000);
const statusColor = {"Open":"#6C63FF","In Progress":"#FEB019","Pending":"#FF8C00","Escalated":"#FF4560","Resolved":"#00E396","Closed":"#555"};
const mkTicket = o => ({ id:"TKT-"+String(Math.floor(Math.random()*900)+100), status:"Open", created:Date.now(), notes:[], escalated:false, escalationLog:[], ...o });

const INIT_TICKETS = [
  mkTicket({ id:"TKT-001", client:"Infosys Ltd",    phone:"+91-9876543210", category:"Technical", priority:"P1", status:"In Progress", subject:"Server down – production environment",         agent:"Alice Kumar", created:Date.now()-25*60000  }),
  mkTicket({ id:"TKT-002", client:"TCS Mumbai",      phone:"+91-9123456789", category:"Network",   priority:"P2", status:"Open",        subject:"VPN connectivity issues for remote team",      agent:"Raj Mehta",   created:Date.now()-95*60000  }),
  mkTicket({ id:"TKT-003", client:"Wipro Pune",      phone:"+91-9988776655", category:"Billing",   priority:"P3", status:"Pending",     subject:"Invoice discrepancy in last quarter",           agent:"Priya Singh", created:Date.now()-310*60000 }),
  mkTicket({ id:"TKT-004", client:"HCL Tech",        phone:"+91-9012345678", category:"Software",  priority:"P2", status:"Resolved",    subject:"License activation failed after renewal",       agent:"Amit Sharma", created:Date.now()-500*60000 }),
  mkTicket({ id:"TKT-005", client:"Reliance Retail", phone:"+91-9871234567", category:"Hardware",  priority:"P1", status:"Open",        subject:"POS terminals down at 3 stores",                agent:"Neha Patel",  created:Date.now()-20*60000  }),
  mkTicket({ id:"TKT-006", client:"Bajaj Finserv",   phone:"+91-9765432100", category:"Account",   priority:"P3", status:"Open",        subject:"Password reset not working for 12 users",      agent:"Raj Mehta",   created:Date.now()-260*60000 }),
  mkTicket({ id:"TKT-007", client:"Zomato India",    phone:"+91-9654321009", category:"Technical", priority:"P2", status:"In Progress", subject:"API gateway returning 503 errors sporadically", agent:"Alice Kumar", created:Date.now()-75*60000  }),
  mkTicket({ id:"TKT-008", client:"Paytm Services",  phone:"+91-9543210098", category:"Network",   priority:"P1", status:"Resolved",    subject:"SSL certificate expired on payment gateway",   agent:"Amit Sharma", created:Date.now()-400*60000 }),
];

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#0d0d1a",border:"1px solid #1e1e3a",borderRadius:16,width:"100%",maxWidth:wide?780:500,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.7)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid #1e1e3a",flexShrink:0}}>
          <span style={{fontWeight:800,fontSize:15,color:"#f0f0ff"}}>{title}</span>
          <button onClick={onClose} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14}}>✕</button>
        </div>
        <div style={{overflowY:"auto",padding:"16px 20px",flex:1}}>{children}</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1.2,fontWeight:700,marginBottom:8}}>{children}</div>;
}

function Toast({ toasts }) {
  return (
    <div style={{position:"fixed",top:16,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:8,maxWidth:320}}>
      {toasts.map(t=>(
        <div key={t.id} style={{background:"#0d0d1a",border:`1px solid ${t.type==="escalate"?"#FF4560":t.type==="whatsapp"?"#25D366":"#6C63FF"}22`,borderRadius:12,padding:"10px 14px",borderLeft:`3px solid ${t.type==="escalate"?"#FF4560":t.type==="whatsapp"?"#25D366":"#6C63FF"}`,animation:"toastIn 0.3s ease",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#f0f0ff",marginBottom:2}}>{t.title}</div>
          <div style={{fontSize:11,color:"#888"}}>{t.message}</div>
        </div>
      ))}
    </div>
  );
}

function SLABar({ ticket, compact }) {
  const p = PRIORITIES[ticket.priority];
  if(!p) return null;
  const elapsed = getElapsed(ticket.created);
  const pct = Math.min(100, Math.round((elapsed/p.response)*100));
  const breached = elapsed > p.response && ticket.status!=="Resolved" && ticket.status!=="Closed";
  const color = pct>=100?"#FF4560":pct>=75?"#FF8C00":"#00E396";
  if (compact) return (
    <div>
      <div style={{height:3,background:"#1a1a2e",borderRadius:3}}><div style={{height:3,borderRadius:3,width:pct+"%",background:color,transition:"width 0.3s"}}/></div>
      <div style={{fontSize:9,color:breached?"#FF4560":"#555",marginTop:2}}>{breached?"BREACHED":fmtMin(elapsed)+" / "+fmtMin(p.response)}</div>
    </div>
  );
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:11,color:"#555"}}>SLA Progress</span>
        <span style={{fontSize:11,color:breached?"#FF4560":"#aaa",fontWeight:700}}>{breached?"⚠ BREACHED":fmtMin(elapsed)+" elapsed"}</span>
      </div>
      <div style={{height:5,background:"#1a1a2e",borderRadius:5}}><div style={{height:5,borderRadius:5,width:pct+"%",background:color,transition:"width 0.3s"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,color:"#444"}}>
        <span>Response: {fmtMin(p.response)}</span><span>Resolution: {fmtMin(p.resolution)}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE UPDATE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileModal({ user, onClose, onUpdate }) {
  const [form,setForm] = useState({name:user.name, email:user.email, phone:user.phone||"", department:user.department||"", role:user.role});
  const [saved,setSaved] = useState(false);
  const liveAvatar = form.name ? form.name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() : user.avatar;
  function handleSave() {
    const updated = {...user, ...form, avatar: liveAvatar};
    onUpdate(updated);   // immediately updates TopBar + welcome banner
    setSaved(true);
    setTimeout(()=>{ setSaved(false); onClose(); }, 1200);
  }
  return (
    <Modal title="👤 My Profile" onClose={onClose}>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,padding:"14px",background:"#12122a",borderRadius:12,border:"1px solid #2a2a4a"}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${user.color},${user.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:22,color:"#fff",flexShrink:0}}>{liveAvatar}</div>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:"#f0f0ff"}}>{form.name||user.name}</div>
          <div style={{fontSize:12,color:"#6C63FF",fontWeight:600}}>{user.role}</div>
          <div style={{fontSize:11,color:"#555",marginTop:2}}>{form.email||user.email}</div>
        </div>
      </div>
      {[["Full Name","name","text","Your full name"],["Email Address","email","email","your@email.com"],["Phone Number","phone","tel","+91-XXXXXXXXXX"],["Department","department","text","Your department"]].map(([label,key,type,ph])=>(
        <div key={key} style={{marginBottom:12}}>
          <label style={{fontSize:10,color:"#555",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>{label}</label>
          <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph}
            style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"9px 12px",fontSize:13,boxSizing:"border-box",outline:"none"}}/>
        </div>
      ))}
      <div style={{marginBottom:16}}>
        <label style={{fontSize:10,color:"#555",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Role</label>
        <input value={form.role} readOnly style={{width:"100%",background:"#0a0a18",border:"1px solid #1a1a2a",color:"#555",borderRadius:8,padding:"9px 12px",fontSize:13,boxSizing:"border-box",outline:"none",cursor:"not-allowed"}}/>
        <div style={{fontSize:10,color:"#444",marginTop:3}}>Contact your admin to change your role.</div>
      </div>
      <button onClick={handleSave} style={{width:"100%",background:saved?"linear-gradient(135deg,#00E396,#00b374)":"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"11px",fontWeight:700,cursor:"pointer",fontSize:13,transition:"background 0.3s"}}>
        {saved?"✅ Saved! Closing…":"Save Profile"}
      </button>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESET PASSWORD MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function ResetPasswordModal({ user, onClose }) {
  const [form,setForm] = useState({current:"",newPwd:"",confirm:""});
  const [error,setError] = useState("");
  const [success,setSuccess] = useState(false);
  function handleReset() {
    setError("");
    if (!form.current) { setError("Enter your current password."); return; }
    if (form.current !== user.password) { setError("Current password is incorrect."); return; }
    if (form.newPwd.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (form.newPwd !== form.confirm) { setError("Passwords do not match."); return; }
    setSuccess(true);
  }
  return (
    <Modal title="🔑 Reset Password" onClose={onClose}>
      {success ? (
        <div style={{textAlign:"center",padding:"32px 0"}}>
          <div style={{fontSize:40,marginBottom:12}}>✅</div>
          <div style={{fontSize:16,fontWeight:800,color:"#00E396",marginBottom:6}}>Password Updated!</div>
          <div style={{fontSize:12,color:"#555",marginBottom:20}}>Your password has been changed successfully.</div>
          <button onClick={onClose} style={{background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"10px 28px",fontWeight:700,cursor:"pointer",fontSize:13}}>Close</button>
        </div>
      ) : (
        <>
          {error&&<div style={{background:"#FF456015",border:"1px solid #FF456033",borderRadius:8,padding:"9px 12px",fontSize:12,color:"#FF4560",marginBottom:12}}>{error}</div>}
          {[["Current Password","current"],["New Password","newPwd"],["Confirm New Password","confirm"]].map(([label,key])=>(
            <div key={key} style={{marginBottom:12}}>
              <label style={{fontSize:10,color:"#555",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>{label}</label>
              <input type="password" value={form[key]} onChange={e=>{setForm({...form,[key]:e.target.value});setError("");}}
                style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"9px 12px",fontSize:13,boxSizing:"border-box",outline:"none"}}/>
            </div>
          ))}
          <div style={{marginBottom:16,padding:"10px 12px",background:"#6C63FF11",border:"1px solid #6C63FF22",borderRadius:8}}>
            <div style={{fontSize:11,color:"#6C63FF",fontWeight:700,marginBottom:3}}>Password Requirements</div>
            {["Minimum 6 characters","Should include numbers & symbols","Avoid using your name or email"].map(r=>(
              <div key={r} style={{fontSize:11,color:"#555"}}>· {r}</div>
            ))}
          </div>
          <button onClick={handleReset} style={{width:"100%",background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"11px",fontWeight:700,cursor:"pointer",fontSize:13}}>Update Password</button>
        </>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WHATSAPP NOTIFICATION PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function WhatsAppPanel({ tickets, onClose, addToast }) {
  const [config,setConfig] = useState({ apiKey:"", phoneId:"", businessId:"", fromNumber:"+91-XXXXXXXXXX", webhookUrl:"", active:false });
  const [rules,setRules] = useState([
    { id:1, event:"Ticket Created",  template:"ticket_created",   active:true  },
    { id:2, event:"Status Updated",  template:"status_update",    active:true  },
    { id:3, event:"SLA Breach",      template:"sla_breach_alert", active:true  },
    { id:4, event:"Auto Escalation", template:"escalation_alert", active:false },
    { id:5, event:"Resolved",        template:"ticket_resolved",  active:true  },
  ]);
  const [compose,setCompose] = useState({ to:"", name:"", message:"", ticketId:"" });
  const [log,setLog] = useState([
    { id:1, to:"+91-9876543210", name:"Vikram Nair",  msg:"Your ticket TKT-001 is In Progress", time:"10:42 AM", status:"Delivered" },
    { id:2, to:"+91-9123456789", name:"Anita Desai",  msg:"SLA Breach Alert for TKT-002",       time:"09:15 AM", status:"Read"      },
    { id:3, to:"+91-9988776655", name:"Suresh Patil", msg:"Ticket TKT-003 has been Resolved",   time:"08:30 AM", status:"Sent"      },
  ]);
  const [tab,setTab] = useState("config");

  function sendMsg() {
    if (!compose.to||!compose.message) return;
    const entry = { id:log.length+1, to:compose.to, name:compose.name||"Subscriber", msg:compose.message, time:new Date().toLocaleTimeString(), status:"Sent" };
    setLog(p=>[entry,...p]);
    addToast("whatsapp","WhatsApp Sent",`Message sent to ${compose.name||compose.to}`);
    setCompose({to:"",name:"",message:"",ticketId:""});
  }

  const TABS = [["config","⚙️ Config"],["rules","🔔 Rules"],["compose","✍️ Compose"],["log","📋 Log"]];
  const statusC = {Sent:"#FEB019",Delivered:"#6C63FF",Read:"#00E396",Failed:"#FF4560"};

  return (
    <Modal title="💬 WhatsApp Notifications" onClose={onClose} wide>
      {/* Tab Bar */}
      <div style={{display:"flex",gap:4,marginBottom:16,background:"#0a0a18",borderRadius:10,padding:4}}>
        {TABS.map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,background:tab===k?"#1e1e3a":"transparent",border:"none",color:tab===k?"#f0f0ff":"#555",borderRadius:7,padding:"7px 0",cursor:"pointer",fontSize:12,fontWeight:tab===k?700:400,transition:"all 0.15s"}}>{l}</button>
        ))}
      </div>

      {tab==="config"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,padding:"12px 14px",background:"#25D36615",border:"1px solid #25D36633",borderRadius:10}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#25D366"}}>WhatsApp Business API</div>
              <div style={{fontSize:11,color:"#555"}}>Connect via Meta Business API for automated messages</div>
            </div>
            <div onClick={()=>setConfig(c=>({...c,active:!c.active}))} style={{width:42,height:24,borderRadius:12,background:config.active?"#25D366":"#2a2a4a",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
              <div style={{position:"absolute",top:3,left:config.active?20:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
            </div>
          </div>
          {[["Meta API Key","apiKey","Your WhatsApp Business API Key"],["Phone Number ID","phoneId","Phone Number ID from Meta"],["Business Account ID","businessId","Business Account ID"],["From Number","fromNumber","+91-XXXXXXXXXX"],["Webhook URL","webhookUrl","https://yourapp.com/webhook"]].map(([label,key,ph])=>(
            <div key={key} style={{marginBottom:10}}>
              <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>{label}</label>
              <input value={config[key]} onChange={e=>setConfig(c=>({...c,[key]:e.target.value}))} placeholder={ph}
                style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 12px",fontSize:12,boxSizing:"border-box",outline:"none"}}/>
            </div>
          ))}
          <button onClick={()=>addToast("whatsapp","WhatsApp","API configuration saved!")} style={{width:"100%",background:"linear-gradient(135deg,#25D366,#1aaf53)",border:"none",color:"#fff",borderRadius:8,padding:"10px",fontWeight:700,cursor:"pointer",fontSize:13,marginTop:4}}>💾 Save Configuration</button>
        </div>
      )}

      {tab==="rules"&&(
        <div>
          <SectionLabel>Automated Notification Rules</SectionLabel>
          {rules.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#0d0d1f",borderRadius:10,marginBottom:8,border:`1px solid ${r.active?"#25D36633":"#1e1e3a"}`}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:"#e0e0ff"}}>{r.event}</div>
                <div style={{fontSize:11,color:"#555",fontFamily:"monospace"}}>template: {r.template}</div>
              </div>
              <div onClick={()=>setRules(p=>p.map(x=>x.id===r.id?{...x,active:!x.active}:x))} style={{width:36,height:20,borderRadius:10,background:r.active?"#25D366":"#2a2a4a",cursor:"pointer",position:"relative",flexShrink:0}}>
                <div style={{position:"absolute",top:2,left:r.active?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="compose"&&(
        <div>
          <SectionLabel>Send Manual WhatsApp Message</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div>
              <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>To (Phone)</label>
              <input value={compose.to} onChange={e=>setCompose(c=>({...c,to:e.target.value}))} placeholder="+91-9876543210"
                style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:12,boxSizing:"border-box",outline:"none"}}/>
            </div>
            <div>
              <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>Subscriber Name</label>
              <input value={compose.name} onChange={e=>setCompose(c=>({...c,name:e.target.value}))} placeholder="Recipient name"
                style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:12,boxSizing:"border-box",outline:"none"}}/>
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>Linked Ticket (Optional)</label>
            <select value={compose.ticketId} onChange={e=>setCompose(c=>({...c,ticketId:e.target.value}))} style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:12}}>
              <option value="">-- No ticket --</option>
              {tickets.map(t=><option key={t.id} value={t.id}>{t.id} – {t.client}</option>)}
            </select>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>Message</label>
            <textarea value={compose.message} onChange={e=>setCompose(c=>({...c,message:e.target.value}))} placeholder="Type your WhatsApp message here..." rows={4}
              style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"9px 10px",fontSize:12,resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            {["Your ticket {{ticketId}} is now {{status}}","SLA breach alert for {{ticketId}}","Issue resolved. Thank you for your patience."].map(t=>(
              <button key={t} onClick={()=>setCompose(c=>({...c,message:t}))} style={{flex:1,background:"#1a1a2e",border:"1px solid #2a2a4a",color:"#777",borderRadius:7,padding:"6px 8px",cursor:"pointer",fontSize:10,textAlign:"left"}}>{t.slice(0,30)}…</button>
            ))}
          </div>
          <button onClick={sendMsg} style={{marginTop:12,width:"100%",background:"linear-gradient(135deg,#25D366,#1aaf53)",border:"none",color:"#fff",borderRadius:8,padding:"11px",fontWeight:700,cursor:"pointer",fontSize:13}}>📤 Send WhatsApp Message</button>
        </div>
      )}

      {tab==="log"&&(
        <div>
          <SectionLabel>Message Delivery Log</SectionLabel>
          {log.map(l=>(
            <div key={l.id} style={{padding:"10px 12px",background:"#0d0d1f",borderRadius:10,marginBottom:8,borderLeft:`3px solid ${statusC[l.status]||"#555"}`,display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#25D36620",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>💬</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#e0e0ff"}}>{l.name}</span>
                  <span style={{fontSize:10,fontWeight:700,color:statusC[l.status]||"#555"}}>{l.status}</span>
                </div>
                <div style={{fontSize:11,color:"#ccc",marginBottom:2}}>{l.msg}</div>
                <div style={{display:"flex",gap:10,fontSize:10,color:"#444"}}><span>{l.to}</span><span>{l.time}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// THIRD PARTY INTEGRATIONS
// ═══════════════════════════════════════════════════════════════════════════════
function IntegrationsPanel({ onClose, addToast }) {
  const [integrations,setIntegrations] = useState([
    { id:"slack",     name:"Slack",          icon:"💬", category:"Communication", status:"connected",    desc:"Post ticket alerts to Slack channels", apiKey:"xoxb-****-****", channel:"#support-alerts" },
    { id:"jira",      name:"Jira",           icon:"🐛", category:"Project Mgmt",  status:"disconnected", desc:"Sync tickets with Jira issues",          apiKey:"", domain:"" },
    { id:"zendesk",   name:"Zendesk",        icon:"🎫", category:"Helpdesk",      status:"disconnected", desc:"Import/export tickets from Zendesk",     apiKey:"", subdomain:"" },
    { id:"freshdesk", name:"Freshdesk",      icon:"🌿", category:"Helpdesk",      status:"disconnected", desc:"Sync with Freshdesk tickets",             apiKey:"", domain:"" },
    { id:"salesforce",name:"Salesforce CRM", icon:"☁️", category:"CRM",           status:"connected",    desc:"Sync customer records & cases",           apiKey:"sf_****", instance:"" },
    { id:"zapier",    name:"Zapier",         icon:"⚡", category:"Automation",    status:"connected",    desc:"Connect 5000+ apps via Zapier hooks",     apiKey:"zap_****", webhook:"" },
    { id:"pagerduty", name:"PagerDuty",      icon:"🔔", category:"Alerting",      status:"disconnected", desc:"P1 incidents auto-create PD alerts",      apiKey:"", service:"" },
    { id:"teams",     name:"MS Teams",       icon:"🟣", category:"Communication", status:"disconnected", desc:"Send ticket updates to Teams channels",   apiKey:"", webhook:"" },
    { id:"twilio",    name:"Twilio SMS",     icon:"📱", category:"SMS/Voice",     status:"disconnected", desc:"Send SMS notifications to clients",       apiKey:"", sid:"" },
    { id:"google",    name:"Google Sheets",  icon:"📊", category:"Analytics",     status:"connected",    desc:"Export reports to Google Sheets",          apiKey:"google_****", sheetId:"" },
  ]);
  const [selected,setSelected] = useState(null);
  const [cfgForm,setCfgForm]   = useState({});
  const categories = [...new Set(integrations.map(i=>i.category))];

  function toggleConnect(id) {
    setIntegrations(p=>p.map(i=>i.id===id?{...i,status:i.status==="connected"?"disconnected":"connected"}:i));
    const item = integrations.find(i=>i.id===id);
    addToast("info","Integration",`${item.name} ${item.status==="connected"?"disconnected":"connected"} successfully!`);
  }
  function openCfg(item) { setSelected(item); setCfgForm({apiKey:item.apiKey||"",channel:item.channel||"",webhook:item.webhook||"",domain:item.domain||""}); }

  const connectedCount = integrations.filter(i=>i.status==="connected").length;

  return (
    <Modal title="🔌 Third-Party Integrations" onClose={onClose} wide>
      {/* Summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[[connectedCount,"Connected","#00E396"],[integrations.length-connectedCount,"Disconnected","#FF4560"],[integrations.length,"Total","#6C63FF"]].map(([v,k,c])=>(
          <div key={k} style={{background:"#0d0d1f",borderRadius:10,padding:"12px",textAlign:"center",border:`1px solid ${c}22`}}>
            <div style={{fontSize:22,fontWeight:800,color:c}}>{v}</div>
            <div style={{fontSize:11,color:"#555"}}>{k}</div>
          </div>
        ))}
      </div>

      {selected ? (
        <div>
          <button onClick={()=>setSelected(null)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:7,padding:"6px 12px",cursor:"pointer",fontSize:12,marginBottom:14}}>← Back</button>
          <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16,padding:"14px",background:"#0d0d1f",borderRadius:12,border:"1px solid #1e1e3a"}}>
            <div style={{fontSize:32}}>{selected.icon}</div>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:"#f0f0ff"}}>{selected.name}</div>
              <div style={{fontSize:12,color:"#555"}}>{selected.desc}</div>
              <span style={{fontSize:10,background:selected.status==="connected"?"#00E39622":"#FF456022",color:selected.status==="connected"?"#00E396":"#FF4560",padding:"2px 8px",borderRadius:4,fontWeight:700,display:"inline-block",marginTop:4}}>{selected.status.toUpperCase()}</span>
            </div>
          </div>
          {[["API Key / Token","apiKey","Enter API key"],["Webhook URL","webhook","https://..."],["Channel / Room","channel","#channel-name"],["Domain / Subdomain","domain","yourapp.domain"]].map(([label,key,ph])=>(
            <div key={key} style={{marginBottom:10}}>
              <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>{label}</label>
              <input value={cfgForm[key]||""} onChange={e=>setCfgForm(f=>({...f,[key]:e.target.value}))} placeholder={ph}
                style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:12,boxSizing:"border-box",outline:"none"}}/>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={()=>toggleConnect(selected.id)} style={{flex:1,background:selected.status==="connected"?"#FF456015":"linear-gradient(135deg,#00E396,#00b374)",border:selected.status==="connected"?"1px solid #FF4560":"none",color:selected.status==="connected"?"#FF4560":"#fff",borderRadius:8,padding:"10px",fontWeight:700,cursor:"pointer",fontSize:13}}>
              {selected.status==="connected"?"Disconnect":"Connect"}
            </button>
            <button onClick={()=>{addToast("info","Saved",`${selected.name} settings saved`);setSelected(null);}} style={{flex:1,background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"10px",fontWeight:700,cursor:"pointer",fontSize:13}}>Save Settings</button>
          </div>
        </div>
      ) : (
        <>
          {categories.map(cat=>(
            <div key={cat} style={{marginBottom:16}}>
              <SectionLabel>{cat}</SectionLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {integrations.filter(i=>i.category===cat).map(item=>(
                  <div key={item.id} style={{background:"#0d0d1f",borderRadius:12,padding:"12px 14px",border:`1px solid ${item.status==="connected"?"#00E39633":"#1e1e3a"}`,display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{fontSize:24,flexShrink:0}}>{item.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                        <span style={{fontSize:12,fontWeight:700,color:"#e0e0ff"}}>{item.name}</span>
                        <span style={{fontSize:9,background:item.status==="connected"?"#00E39622":"#1e1e3a",color:item.status==="connected"?"#00E396":"#555",padding:"1px 6px",borderRadius:3,fontWeight:700}}>{item.status==="connected"?"●":"○"}</span>
                      </div>
                      <div style={{fontSize:10,color:"#444",marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.desc}</div>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>openCfg(item)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10}}>⚙️ Config</button>
                        <button onClick={()=>toggleConnect(item.id)} style={{background:item.status==="connected"?"#FF456015":"#00E39615",border:"none",color:item.status==="connected"?"#FF4560":"#00E396",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:10,fontWeight:700}}>
                          {item.status==="connected"?"Disconnect":"Connect"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER ENTRY — CLIENTS
// ═══════════════════════════════════════════════════════════════════════════════
function MasterClients({ onClose }) {
  const [clients,setClients] = useState(MASTER_CLIENTS_INIT);
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState({name:"",contact:"",email:"",phone:"",city:"",active:true});
  function startEdit(c) { setEditing(c.id); setForm(c); }
  function startAdd() { setEditing("new"); setForm({name:"",contact:"",email:"",phone:"",city:"",active:true}); }
  function save() {
    if(!form.name) return;
    if(editing==="new") setClients(p=>[...p,{...form,id:p.length+1}]);
    else setClients(p=>p.map(c=>c.id===editing?form:c));
    setEditing(null);
  }
  return (
    <Modal title="🏢 Client Master" onClose={onClose} wide>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:12,color:"#555"}}>{clients.length} clients registered</div>
        <button onClick={startAdd} style={{background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:12,fontWeight:700}}>+ Add Client</button>
      </div>
      {editing!==null&&(
        <div style={{background:"#0a0a1c",borderRadius:12,padding:16,border:"1px solid #6C63FF44",marginBottom:14}}>
          <SectionLabel>{editing==="new"?"New Client":"Edit Client"}</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {[["Company Name","name","text"],["Contact Person","contact","text"],["Email","email","email"],["Phone","phone","tel"],["City","city","text"]].map(([l,k,t])=>(
              <div key={k}>
                <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>{l}</label>
                <input type={t} value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}
                  style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"7px 10px",fontSize:12,boxSizing:"border-box",outline:"none"}}/>
              </div>
            ))}
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <label style={{fontSize:11,color:"#aaa"}}>Active</label>
              <div onClick={()=>setForm(f=>({...f,active:!f.active}))} style={{width:36,height:20,borderRadius:10,background:form.active?"#6C63FF":"#2a2a4a",cursor:"pointer",position:"relative"}}>
                <div style={{position:"absolute",top:2,left:form.active?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} style={{flex:1,background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"9px",fontWeight:700,cursor:"pointer",fontSize:13}}>Save</button>
            <button onClick={()=>setEditing(null)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:8,padding:"9px 16px",cursor:"pointer",fontSize:13}}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{background:"#0d0d1a",border:"1px solid #1e1e3a",borderRadius:12,overflow:"hidden"}}>
        <div style={{padding:"9px 14px",borderBottom:"1px solid #1e1e3a",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 100px 60px 80px",gap:8,fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:1}}>
          <span>Company</span><span>Contact</span><span>Email</span><span>Phone</span><span>City</span><span>Actions</span>
        </div>
        {clients.map((c,i)=>(
          <div key={c.id} style={{padding:"10px 14px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 100px 60px 80px",gap:8,alignItems:"center",borderBottom:i<clients.length-1?"1px solid #0f0f24":"none"}}>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:c.active?"#00E396":"#555",flexShrink:0}}/>
              <span style={{fontSize:12,color:"#e0e0ff",fontWeight:600}}>{c.name}</span>
            </div>
            <span style={{fontSize:11,color:"#999"}}>{c.contact}</span>
            <span style={{fontSize:11,color:"#555"}}>{c.email}</span>
            <span style={{fontSize:11,color:"#777"}}>{c.phone}</span>
            <span style={{fontSize:11,color:"#555"}}>{c.city}</span>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>startEdit(c)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:5,padding:"4px 7px",cursor:"pointer",fontSize:11}}>✏️</button>
              <button onClick={()=>setClients(p=>p.filter(x=>x.id!==c.id))} style={{background:"#FF456015",border:"none",color:"#FF4560",borderRadius:5,padding:"4px 7px",cursor:"pointer",fontSize:11}}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER ENTRY — AGENTS / EMPLOYEES
// ═══════════════════════════════════════════════════════════════════════════════
function MasterAgents({ onClose }) {
  const [agents,setAgents] = useState(USERS_INIT.map(u=>({id:u.id,name:u.name,email:u.email,phone:u.phone,role:u.role,department:u.department,active:true})));
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState({});
  const ROLES = ["Admin","Senior Engineer","Support Lead","Billing Specialist","Network Engineer","Tech Analyst"];
  function startEdit(a) { setEditing(a.id); setForm(a); }
  function startAdd() { setEditing("new"); setForm({name:"",email:"",phone:"",role:"Senior Engineer",department:"Engineering",active:true}); }
  function save() {
    if(!form.name||!form.email) return;
    if(editing==="new") setAgents(p=>[...p,{...form,id:p.length+1}]);
    else setAgents(p=>p.map(a=>a.id===editing?form:a));
    setEditing(null);
  }
  return (
    <Modal title="👥 Agent / Employee Master" onClose={onClose} wide>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:12,color:"#555"}}>{agents.length} agents registered</div>
        <button onClick={startAdd} style={{background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:12,fontWeight:700}}>+ Add Agent</button>
      </div>
      {editing!==null&&(
        <div style={{background:"#0a0a1c",borderRadius:12,padding:16,border:"1px solid #6C63FF44",marginBottom:14}}>
          <SectionLabel>{editing==="new"?"New Agent":"Edit Agent"}</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {[["Full Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["Department","department","text"]].map(([l,k,t])=>(
              <div key={k}>
                <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>{l}</label>
                <input type={t} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"7px 10px",fontSize:12,boxSizing:"border-box",outline:"none"}}/>
              </div>
            ))}
            <div>
              <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>Role</label>
              <select value={form.role||""} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:12}}>
                {ROLES.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <label style={{fontSize:11,color:"#aaa"}}>Active</label>
              <div onClick={()=>setForm(f=>({...f,active:!f.active}))} style={{width:36,height:20,borderRadius:10,background:form.active?"#6C63FF":"#2a2a4a",cursor:"pointer",position:"relative"}}>
                <div style={{position:"absolute",top:2,left:form.active?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} style={{flex:1,background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"9px",fontWeight:700,cursor:"pointer",fontSize:13}}>Save</button>
            <button onClick={()=>setEditing(null)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:8,padding:"9px 16px",cursor:"pointer",fontSize:13}}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{background:"#0d0d1a",border:"1px solid #1e1e3a",borderRadius:12,overflow:"hidden"}}>
        <div style={{padding:"9px 14px",borderBottom:"1px solid #1e1e3a",display:"grid",gridTemplateColumns:"1fr 1fr 120px 110px 60px 80px",gap:8,fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:1}}>
          <span>Name</span><span>Email</span><span>Phone</span><span>Role</span><span>Dept</span><span>Actions</span>
        </div>
        {agents.map((a,i)=>(
          <div key={a.id} style={{padding:"10px 14px",display:"grid",gridTemplateColumns:"1fr 1fr 120px 110px 60px 80px",gap:8,alignItems:"center",borderBottom:i<agents.length-1?"1px solid #0f0f24":"none"}}>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#4a40e0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0}}>{a.name[0]}</div>
              <span style={{fontSize:12,color:"#e0e0ff",fontWeight:600}}>{a.name}</span>
            </div>
            <span style={{fontSize:11,color:"#555"}}>{a.email}</span>
            <span style={{fontSize:11,color:"#777"}}>{a.phone}</span>
            <span style={{fontSize:11,color:"#999"}}>{a.role}</span>
            <span style={{fontSize:11,color:"#555"}}>{a.department}</span>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>startEdit(a)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:5,padding:"4px 7px",cursor:"pointer",fontSize:11}}>✏️</button>
              <button onClick={()=>setAgents(p=>p.filter(x=>x.id!==a.id))} style={{background:"#FF456015",border:"none",color:"#FF4560",borderRadius:5,padding:"4px 7px",cursor:"pointer",fontSize:11}}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER ENTRY — SLA POLICIES
// ═══════════════════════════════════════════════════════════════════════════════
function MasterSLA({ onClose }) {
  const [slas,setSlas] = useState(MASTER_SLA_INIT);
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState({});
  function startEdit(s) { setEditing(s.id); setForm(s); }
  function save() {
    setSlas(p=>p.map(s=>s.id===editing?{...s,...form}:s));
    setEditing(null);
  }
  return (
    <Modal title="⏱ SLA Policy Master" onClose={onClose} wide>
      <div style={{marginBottom:14,padding:"10px 14px",background:"#FEB01911",border:"1px solid #FEB01933",borderRadius:10,fontSize:12,color:"#FEB019"}}>
        ⚠️ Changes to SLA policies affect all active tickets and escalation rules.
      </div>
      {editing!==null&&(
        <div style={{background:"#0a0a1c",borderRadius:12,padding:16,border:"1px solid #6C63FF44",marginBottom:14}}>
          <SectionLabel>Edit SLA – {form.priority} ({form.label})</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
            {[["Label","label","text"],["Response (min)","response","number"],["Resolution (min)","resolution","number"]].map(([l,k,t])=>(
              <div key={k}>
                <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>{l}</label>
                <input type={t} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:t==="number"?Number(e.target.value):e.target.value}))}
                  style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:12,boxSizing:"border-box",outline:"none"}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} style={{flex:1,background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"9px",fontWeight:700,cursor:"pointer",fontSize:13}}>Save</button>
            <button onClick={()=>setEditing(null)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:8,padding:"9px 16px",cursor:"pointer",fontSize:13}}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {slas.map(s=>(
          <div key={s.id} style={{background:"#0d0d1f",borderRadius:12,padding:"14px 16px",border:`1px solid ${s.color}33`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <span style={{fontWeight:800,fontSize:14,color:s.color}}>{s.priority}</span>
                <span style={{fontSize:12,color:"#777",marginLeft:6}}>· {s.label}</span>
              </div>
              <button onClick={()=>startEdit(s)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11}}>✏️ Edit</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["Response",fmtMin(s.response)],["Resolution",fmtMin(s.resolution)]].map(([k,v])=>(
                <div key={k} style={{background:"#12122a",borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontSize:10,color:"#444",textTransform:"uppercase",marginBottom:2}}>{k}</div>
                  <div style={{fontSize:16,fontWeight:800,color:s.color}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER ENTRY — DEPARTMENTS
// ═══════════════════════════════════════════════════════════════════════════════
function MasterDepartments({ onClose }) {
  const [depts,setDepts] = useState(MASTER_DEPARTMENTS_INIT);
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState({name:"",head:"",members:0});
  function startEdit(d) { setEditing(d.id); setForm(d); }
  function startAdd() { setEditing("new"); setForm({name:"",head:"",members:0}); }
  function save() {
    if(!form.name) return;
    if(editing==="new") setDepts(p=>[...p,{...form,id:p.length+1}]);
    else setDepts(p=>p.map(d=>d.id===editing?form:d));
    setEditing(null);
  }
  return (
    <Modal title="🏗 Department Master" onClose={onClose}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:12,color:"#555"}}>{depts.length} departments</div>
        <button onClick={startAdd} style={{background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:12,fontWeight:700}}>+ Add Dept</button>
      </div>
      {editing!==null&&(
        <div style={{background:"#0a0a1c",borderRadius:12,padding:14,border:"1px solid #6C63FF44",marginBottom:12}}>
          <SectionLabel>{editing==="new"?"New Department":"Edit Department"}</SectionLabel>
          {[["Department Name","name","text"],["Department Head","head","text"]].map(([l,k,t])=>(
            <div key={k} style={{marginBottom:10}}>
              <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>{l}</label>
              <input type={t} value={form[k]||""} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:12,boxSizing:"border-box",outline:"none"}}/>
            </div>
          ))}
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} style={{flex:1,background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"9px",fontWeight:700,cursor:"pointer",fontSize:13}}>Save</button>
            <button onClick={()=>setEditing(null)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:8,padding:"9px 16px",cursor:"pointer",fontSize:13}}>Cancel</button>
          </div>
        </div>
      )}
      {depts.map((d,i)=>(
        <div key={d.id} style={{display:"flex",gap:10,alignItems:"center",padding:"11px 14px",background:"#0d0d1f",borderRadius:10,marginBottom:7,border:"1px solid #1e1e3a"}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#6C63FF,#4a40e0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff",flexShrink:0}}>🏗</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#e0e0ff"}}>{d.name}</div>
            <div style={{fontSize:11,color:"#555"}}>Head: {d.head} · {d.members} members</div>
          </div>
          <button onClick={()=>startEdit(d)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:6,padding:"5px 9px",cursor:"pointer",fontSize:11}}>✏️</button>
          <button onClick={()=>setDepts(p=>p.filter(x=>x.id!==d.id))} style={{background:"#FF456015",border:"none",color:"#FF4560",borderRadius:6,padding:"5px 9px",cursor:"pointer",fontSize:11}}>🗑</button>
        </div>
      ))}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER ENTRY — CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════
function MasterCategories({ onClose }) {
  const [cats,setCats] = useState(MASTER_CATEGORIES_INIT.map((c,i)=>({id:i+1,name:c,active:true})));
  const [newCat,setNewCat] = useState("");
  function add() {
    if(!newCat.trim()) return;
    setCats(p=>[...p,{id:p.length+1,name:newCat.trim(),active:true}]);
    setNewCat("");
  }
  return (
    <Modal title="🏷 Category Master" onClose={onClose}>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <input value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="New category name..."
          style={{flex:1,background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 12px",fontSize:13,outline:"none"}}/>
        <button onClick={add} style={{background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontWeight:700,fontSize:13}}>Add</button>
      </div>
      {cats.map(c=>(
        <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#0d0d1f",borderRadius:9,marginBottom:7,border:`1px solid ${c.active?"#6C63FF22":"#1e1e3a"}`}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:c.active?"#00E396":"#555",flexShrink:0}}/>
          <span style={{flex:1,fontSize:13,color:"#e0e0ff",fontWeight:600}}>{c.name}</span>
          <div onClick={()=>setCats(p=>p.map(x=>x.id===c.id?{...x,active:!x.active}:x))} style={{width:34,height:18,borderRadius:9,background:c.active?"#6C63FF":"#2a2a4a",cursor:"pointer",position:"relative"}}>
            <div style={{position:"absolute",top:1,left:c.active?16:1,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
          </div>
          <button onClick={()=>setCats(p=>p.filter(x=>x.id!==c.id))} style={{background:"#FF456015",border:"none",color:"#FF4560",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:11}}>🗑</button>
        </div>
      ))}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS — TICKET SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
function ReportTicketSummary({ tickets, onClose }) {
  const [range,setRange] = useState("thisMonth");
  const byAgent = AGENT_NAMES.map(n=>({name:n.split(" ")[0],total:tickets.filter(t=>t.agent===n).length,resolved:tickets.filter(t=>t.agent===n&&(t.status==="Resolved"||t.status==="Closed")).length,open:tickets.filter(t=>t.agent===n&&(t.status==="Open"||t.status==="In Progress")).length}));
  const byCategory = CATEGORIES.map(c=>({name:c,count:tickets.filter(t=>t.category===c).length})).filter(x=>x.count>0);
  const byPriority = Object.entries(PRIORITIES).map(([k,p])=>({name:k,count:tickets.filter(t=>t.priority===k).length,color:p.color}));
  const slaBreached = tickets.filter(t=>getElapsed(t.created)>PRIORITIES[t.priority]?.response&&t.status!=="Resolved"&&t.status!=="Closed").length;
  const PC = ["#6C63FF","#FEB019","#FF8C00","#FF4560","#00E396","#888"];
  return (
    <Modal title="📋 Ticket Summary Report" onClose={onClose} wide>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
        <span style={{fontSize:12,color:"#555"}}>Period:</span>
        {["today","thisWeek","thisMonth","allTime"].map(r=>(
          <button key={r} onClick={()=>setRange(r)} style={{background:range===r?"#6C63FF22":"#1e1e3a",border:`1px solid ${range===r?"#6C63FF":"#2a2a4a"}`,color:range===r?"#6C63FF":"#777",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:range===r?700:400}}>
            {r==="today"?"Today":r==="thisWeek"?"This Week":r==="thisMonth"?"This Month":"All Time"}
          </button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {[["Total",tickets.length,"#6C63FF"],["Resolved",tickets.filter(t=>t.status==="Resolved"||t.status==="Closed").length,"#00E396"],["Open",tickets.filter(t=>t.status==="Open").length,"#FEB019"],["SLA Breach",slaBreached,"#FF4560"]].map(([k,v,c])=>(
          <div key={k} style={{background:"#0d0d1f",borderRadius:12,padding:"14px",border:`1px solid ${c}22`,textAlign:"center"}}>
            <div style={{fontSize:24,fontWeight:800,color:c}}>{v}</div>
            <div style={{fontSize:11,color:"#555"}}>{k}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div style={{background:"#0d0d1f",borderRadius:12,padding:14,border:"1px solid #1e1e3a"}}>
          <SectionLabel>By Priority</SectionLabel>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={byPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a"/>
              <XAxis dataKey="name" tick={{fill:"#555",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#555",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"#0d0d1f",border:"1px solid #2a2a4a",borderRadius:8,fontSize:11}}/>
              <Bar dataKey="count" radius={[4,4,0,0]}>{byPriority.map((p,i)=><Cell key={i} fill={p.color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:"#0d0d1f",borderRadius:12,padding:14,border:"1px solid #1e1e3a"}}>
          <SectionLabel>By Category</SectionLabel>
          {byCategory.map((c,i)=>(
            <div key={c.name} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
              <div style={{fontSize:10,color:"#777",width:60,flexShrink:0}}>{c.name}</div>
              <div style={{flex:1,background:"#1a1a2e",borderRadius:3,height:5}}>
                <div style={{height:5,borderRadius:3,width:`${Math.round((c.count/tickets.length)*100)}%`,background:PC[i%PC.length]}}/>
              </div>
              <span style={{fontSize:11,color:"#555",width:14,textAlign:"right"}}>{c.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#0d0d1f",borderRadius:12,padding:14,border:"1px solid #1e1e3a"}}>
        <SectionLabel>Agent Performance</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {byAgent.map(a=>(
            <div key={a.name} style={{textAlign:"center",background:"#12122a",borderRadius:10,padding:"10px 8px"}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#4a40e0)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"#fff",margin:"0 auto 6px"}}>{a.name[0]}</div>
              <div style={{fontSize:11,fontWeight:700,color:"#e0e0ff",marginBottom:3}}>{a.name}</div>
              <div style={{fontSize:10,color:"#00E396"}}>{a.resolved} resolved</div>
              <div style={{fontSize:10,color:"#FEB019"}}>{a.open} open</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS — SLA COMPLIANCE REPORT
// ═══════════════════════════════════════════════════════════════════════════════
function ReportSLA({ tickets, onClose }) {
  const compliance = Object.entries(PRIORITIES).map(([k,p])=>{
    const group = tickets.filter(t=>t.priority===k);
    const breached = group.filter(t=>getElapsed(t.created)>p.response&&t.status!=="Resolved"&&t.status!=="Closed").length;
    const rate = group.length>0?Math.round(((group.length-breached)/group.length)*100):100;
    return {priority:k,label:p.label,total:group.length,breached,rate,color:p.color};
  });
  const trend = [{day:"Mon",rate:96},{day:"Tue",rate:89},{day:"Wed",rate:93},{day:"Thu",rate:87},{day:"Fri",rate:94},{day:"Sat",rate:98},{day:"Sun",rate:99}];
  return (
    <Modal title="📊 SLA Compliance Report" onClose={onClose} wide>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {compliance.map(c=>(
          <div key={c.priority} style={{background:"#0d0d1f",borderRadius:12,padding:"14px",border:`1px solid ${c.color}22`,textAlign:"center"}}>
            <div style={{fontSize:11,color:c.color,fontWeight:800,marginBottom:4}}>{c.priority} · {c.label}</div>
            <div style={{fontSize:28,fontWeight:900,color:c.rate>=90?"#00E396":c.rate>=70?"#FEB019":"#FF4560"}}>{c.rate}%</div>
            <div style={{fontSize:10,color:"#555",marginTop:2}}>{c.breached} breached / {c.total} total</div>
            <div style={{height:4,background:"#1a1a2e",borderRadius:2,marginTop:8}}>
              <div style={{height:4,borderRadius:2,width:c.rate+"%",background:c.rate>=90?"#00E396":c.rate>=70?"#FEB019":"#FF4560"}}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:"#0d0d1f",borderRadius:12,padding:14,border:"1px solid #1e1e3a"}}>
        <SectionLabel>Weekly SLA Compliance Trend (%)</SectionLabel>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a"/>
            <XAxis dataKey="day" tick={{fill:"#555",fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis domain={[80,100]} tick={{fill:"#555",fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:"#0d0d1f",border:"1px solid #2a2a4a",borderRadius:8,fontSize:11}}/>
            <Line type="monotone" dataKey="rate" stroke="#00E396" strokeWidth={2} dot={{fill:"#00E396",r:3}} name="SLA Rate %"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS — AGENT PERFORMANCE REPORT
// ═══════════════════════════════════════════════════════════════════════════════
function ReportAgentPerformance({ tickets, onClose }) {
  return (
    <Modal title="👥 Agent Performance Report" onClose={onClose} wide>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[["Best Rating","Alice Kumar","4.8 ⭐","#00E396"],["Most Resolved","Raj Mehta","62 tickets","#6C63FF"],["Fastest Avg","Alice Kumar","38 min","#FEB019"]].map(([k,a,v,c])=>(
          <div key={k} style={{background:"#0d0d1f",borderRadius:12,padding:"12px",border:`1px solid ${c}22`,textAlign:"center"}}>
            <div style={{fontSize:10,color:"#555",textTransform:"uppercase",marginBottom:4}}>{k}</div>
            <div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div>
            <div style={{fontSize:11,color:"#666"}}>{a}</div>
          </div>
        ))}
      </div>
      {AGENTS.map(agent=>{
        const mine    = tickets.filter(t=>t.agent===agent.name);
        const resolved= mine.filter(t=>t.status==="Resolved"||t.status==="Closed").length;
        const active  = mine.filter(t=>t.status==="Open"||t.status==="In Progress").length;
        return (
          <div key={agent.name} style={{background:"#0d0d1f",borderRadius:14,padding:"14px 16px",marginBottom:10,border:"1px solid #1e1e3a"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#4a40e0)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,color:"#fff",position:"relative"}}>
                  {agent.name[0]}
                  <div style={{position:"absolute",bottom:0,right:0,width:11,height:11,borderRadius:"50%",background:agent.online?"#00E396":"#555",border:"2px solid #0d0d1f"}}/>
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:"#e0e0ff"}}>{agent.name}</div>
                  <div style={{fontSize:11,color:"#555"}}>{agent.role} · {agent.online?"🟢 Online":"⚫ Offline"}</div>
                </div>
              </div>
              <div style={{fontSize:18,fontWeight:800,color:"#FEB019"}}>{agent.rating}⭐</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
              {[["Total",mine.length,"#6C63FF"],["Active",active,"#FEB019"],["Resolved",resolved,"#00E396"],["Avg",agent.avg+"m","#FF8C00"]].map(([k,v,c])=>(
                <div key={k} style={{background:"#12122a",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                  <div style={{fontSize:15,fontWeight:800,color:c}}>{v}</div>
                  <div style={{fontSize:10,color:"#555"}}>{k}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS — ESCALATION REPORT
// ═══════════════════════════════════════════════════════════════════════════════
function ReportEscalation({ tickets, onClose }) {
  const escalated = tickets.filter(t=>t.escalated);
  const byPriority = Object.entries(PRIORITIES).map(([k,p])=>({name:k,count:escalated.filter(t=>t.priority===k).length,color:p.color}));
  return (
    <Modal title="🔺 Escalation Report" onClose={onClose} wide>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[["Total Escalated",escalated.length,"#FF4560"],["Auto Escalated",escalated.filter(t=>t.escalated).length,"#FF8C00"],["Resolved After",escalated.filter(t=>t.status==="Resolved").length,"#00E396"]].map(([k,v,c])=>(
          <div key={k} style={{background:"#0d0d1f",borderRadius:12,padding:"14px",border:`1px solid ${c}22`,textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:11,color:"#555"}}>{k}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#0d0d1f",borderRadius:12,padding:14,border:"1px solid #1e1e3a",marginBottom:14}}>
        <SectionLabel>Escalations by Priority</SectionLabel>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={byPriority}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a"/>
            <XAxis dataKey="name" tick={{fill:"#555",fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#555",fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:"#0d0d1f",border:"1px solid #2a2a4a",borderRadius:8,fontSize:11}}/>
            <Bar dataKey="count" radius={[4,4,0,0]}>{byPriority.map((p,i)=><Cell key={i} fill={p.color}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {escalated.length===0?<div style={{textAlign:"center",color:"#555",padding:24}}>No escalated tickets.</div>:(
        <div style={{background:"#0d0d1a",border:"1px solid #1e1e3a",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"9px 14px",borderBottom:"1px solid #1e1e3a",display:"grid",gridTemplateColumns:"88px 1fr 120px 80px 120px",gap:8,fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:1}}>
            <span>ID</span><span>Subject</span><span>Client</span><span>Priority</span><span>Escalated To</span>
          </div>
          {escalated.map((t,i)=>(
            <div key={t.id} style={{padding:"10px 14px",display:"grid",gridTemplateColumns:"88px 1fr 120px 80px 120px",gap:8,alignItems:"center",borderBottom:i<escalated.length-1?"1px solid #0f0f24":"none"}}>
              <span style={{fontFamily:"monospace",color:"#FF4560",fontSize:11,fontWeight:700}}>{t.id}</span>
              <span style={{fontSize:11,color:"#e0e0ff"}}>{t.subject}</span>
              <span style={{fontSize:11,color:"#999"}}>{t.client}</span>
              <span style={{background:PRIORITIES[t.priority].bg,color:PRIORITIES[t.priority].color,padding:"2px 6px",borderRadius:4,fontSize:10,fontWeight:700,width:"fit-content"}}>{t.priority}</span>
              <span style={{fontSize:11,color:"#6C63FF"}}>{t.agent}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESCALATION RULE EDITOR
// ═══════════════════════════════════════════════════════════════════════════════
function EscalationRuleEditor({ rules, onSave, onClose }) {
  const [local,setLocal] = useState(rules);
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState({});
  function startEdit(r) { setEditing(r.id); setForm(r); }
  function startAdd() { setEditing("new"); setForm({name:"",priority:"P1",triggerAfter:30,unit:"min",action:"",escalateTo:AGENT_NAMES[0],active:true}); }
  function saveRule() {
    if(editing==="new") setLocal(p=>[...p,{...form,id:p.length+1}]);
    else setLocal(p=>p.map(r=>r.id===editing?form:r));
    setEditing(null);
  }
  return (
    <Modal title="⚙️ Escalation Rule Editor" onClose={onClose} wide>
      <div style={{marginBottom:14}}>
        {local.map(r=>(
          <div key={r.id} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",background:"#0d0d1f",borderRadius:10,marginBottom:7,border:`1px solid ${r.active?"#6C63FF33":"#1e1e3a"}`}}>
            <div onClick={()=>setLocal(p=>p.map(x=>x.id===r.id?{...x,active:!x.active}:x))} style={{width:36,height:20,borderRadius:10,background:r.active?"#6C63FF":"#2a2a4a",cursor:"pointer",position:"relative",flexShrink:0}}>
              <div style={{position:"absolute",top:2,left:r.active?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}>
                <span style={{fontWeight:700,fontSize:13,color:"#e0e0ff"}}>{r.name||"Unnamed Rule"}</span>
                <span style={{fontSize:10,background:r.priority==="ALL"?"#6C63FF22":PRIORITIES[r.priority]?.bg,color:r.priority==="ALL"?"#6C63FF":PRIORITIES[r.priority]?.color,padding:"1px 7px",borderRadius:4,fontWeight:700}}>{r.priority}</span>
              </div>
              <div style={{fontSize:11,color:"#666"}}>After <span style={{color:"#FEB019",fontWeight:700}}>{r.triggerAfter} {r.unit}</span> → <span style={{color:"#aaa"}}>{r.action}</span> → <span style={{color:"#6C63FF"}}>{r.escalateTo}</span></div>
            </div>
            <button onClick={()=>startEdit(r)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12}}>✏️</button>
            <button onClick={()=>setLocal(p=>p.filter(x=>x.id!==r.id))} style={{background:"#FF456015",border:"none",color:"#FF4560",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12}}>🗑</button>
          </div>
        ))}
        <button onClick={startAdd} style={{width:"100%",background:"#12122a",border:"1px dashed #2a2a5a",color:"#6C63FF",borderRadius:10,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:600}}>+ Add New Rule</button>
      </div>
      {editing!==null&&(
        <div style={{background:"#0a0a1c",borderRadius:12,padding:16,border:"1px solid #6C63FF44",marginBottom:14}}>
          <div style={{fontSize:12,color:"#6C63FF",fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>{editing==="new"?"New Rule":"Edit Rule"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[["Rule Name","name","text"],["Action Description","action","text"]].map(([label,key,type])=>(
              <div key={key}>
                <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>{label}</label>
                <input value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})} type={type}
                  style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:13,boxSizing:"border-box",outline:"none"}}/>
              </div>
            ))}
            <div>
              <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>Priority</label>
              <select value={form.priority||"P1"} onChange={e=>setForm({...form,priority:e.target.value})} style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:13}}>
                {["P1","P2","P3","P4","ALL"].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>Escalate After</label>
              <div style={{display:"flex",gap:6}}>
                <input type="number" min={1} value={form.triggerAfter||30} onChange={e=>setForm({...form,triggerAfter:Number(e.target.value)})}
                  style={{flex:1,background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:13,outline:"none"}}/>
                <select value={form.unit||"min"} onChange={e=>setForm({...form,unit:e.target.value})} style={{background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:13}}>
                  <option value="min">min</option><option value="hrs">hrs</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>Escalate To</label>
              <select value={form.escalateTo||AGENT_NAMES[0]} onChange={e=>setForm({...form,escalateTo:e.target.value})} style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:13}}>
                {AGENT_NAMES.map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={saveRule} style={{flex:1,background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"9px",fontWeight:700,cursor:"pointer",fontSize:13}}>Save Rule</button>
            <button onClick={()=>setEditing(null)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:8,padding:"9px 16px",cursor:"pointer",fontSize:13}}>Cancel</button>
          </div>
        </div>
      )}
      <button onClick={()=>onSave(local)} style={{width:"100%",background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:10,padding:"12px",fontWeight:700,cursor:"pointer",fontSize:14}}>✅ Save & Activate All Rules</button>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
function Analytics({ tickets, onClose }) {
  const byStatus   = STATUSES.map(s=>({name:s,value:tickets.filter(t=>t.status===s).length})).filter(x=>x.value>0);
  const byPriority = Object.keys(PRIORITIES).map(p=>({name:p,count:tickets.filter(t=>t.priority===p).length,color:PRIORITIES[p].color}));
  const byCategory = CATEGORIES.map(c=>({name:c,value:tickets.filter(t=>t.category===c).length})).filter(x=>x.value>0);
  const trend = [{day:"Mon",open:8,resolved:5},{day:"Tue",open:12,resolved:9},{day:"Wed",open:7,resolved:11},{day:"Thu",open:15,resolved:8},{day:"Fri",open:10,resolved:13},{day:"Sat",open:4,resolved:6},{day:"Sun",open:3,resolved:4}];
  const breached = tickets.filter(t=>getElapsed(t.created)>PRIORITIES[t.priority]?.response&&t.status!=="Resolved"&&t.status!=="Closed").length;
  const slaRate  = Math.round(((tickets.length-breached)/tickets.length)*100);
  const PC = ["#6C63FF","#FEB019","#FF8C00","#FF4560","#00E396","#888"];
  return (
    <Modal title="📊 Analytics Dashboard" onClose={onClose} wide>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        {[["Total",tickets.length,"#6C63FF"],["SLA Rate",slaRate+"%","#00E396"],["Breached",breached,"#FF4560"],["Avg Res","3.2h","#FEB019"]].map(([k,v,c])=>(
          <div key={k} style={{background:"#0d0d1f",borderRadius:12,padding:"14px",border:`1px solid ${c}22`,textAlign:"center"}}>
            <div style={{fontSize:24,fontWeight:800,color:c}}>{v}</div>
            <div style={{fontSize:11,color:"#555"}}>{k}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div style={{background:"#0d0d1f",borderRadius:12,padding:14,border:"1px solid #1e1e3a"}}>
          <div style={{fontSize:11,color:"#555",marginBottom:10}}>Weekly Trend</div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a"/>
              <XAxis dataKey="day" tick={{fill:"#555",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#555",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"#0d0d1f",border:"1px solid #2a2a4a",borderRadius:8,fontSize:11}}/>
              <Line type="monotone" dataKey="open" stroke="#6C63FF" strokeWidth={2} dot={false} name="Opened"/>
              <Line type="monotone" dataKey="resolved" stroke="#00E396" strokeWidth={2} dot={false} name="Resolved"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:"#0d0d1f",borderRadius:12,padding:14,border:"1px solid #1e1e3a"}}>
          <div style={{fontSize:11,color:"#555",marginBottom:10}}>By Priority</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={byPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a"/>
              <XAxis dataKey="name" tick={{fill:"#555",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#555",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:"#0d0d1f",border:"1px solid #2a2a4a",borderRadius:8,fontSize:11}}/>
              <Bar dataKey="count" radius={[4,4,0,0]}>{byPriority.map((p,i)=><Cell key={i} fill={p.color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:"#0d0d1f",borderRadius:12,padding:14,border:"1px solid #1e1e3a"}}>
          <div style={{fontSize:11,color:"#555",marginBottom:10}}>By Status</div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={byStatus} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                {byStatus.map((e,i)=><Cell key={i} fill={PC[i%PC.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:"#0d0d1f",border:"1px solid #2a2a4a",borderRadius:8,fontSize:11}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center"}}>
            {byStatus.map((s,i)=><span key={s.name} style={{fontSize:10,color:PC[i%PC.length]}}>● {s.name} ({s.value})</span>)}
          </div>
        </div>
        <div style={{background:"#0d0d1f",borderRadius:12,padding:14,border:"1px solid #1e1e3a"}}>
          <div style={{fontSize:11,color:"#555",marginBottom:10}}>By Category</div>
          {byCategory.map((c,i)=>(
            <div key={c.name} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
              <div style={{fontSize:11,color:"#777",width:56,flexShrink:0}}>{c.name}</div>
              <div style={{flex:1,background:"#1a1a2e",borderRadius:4,height:5}}>
                <div style={{height:5,borderRadius:4,width:`${Math.round((c.value/tickets.length)*100)}%`,background:PC[i%PC.length]}}/>
              </div>
              <span style={{fontSize:11,color:"#555",width:14,textAlign:"right"}}>{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function EmailPanel({ onClose }) {
  const [rules,setRules] = useState([
    {id:1,event:"SLA Breach",    to:"manager@company.com", active:true },
    {id:2,event:"P1 Ticket Open",to:"team@company.com",    active:true },
    {id:3,event:"Escalation",    to:"director@company.com",active:true },
    {id:4,event:"Resolution",    to:"client@company.com",  active:false},
  ]);
  const log=[
    {time:"09:42",to:"manager@company.com", subject:"[SLA Breach] TKT-002",status:"Sent"  },
    {time:"08:15",to:"team@company.com",    subject:"[P1 Open] TKT-005",   status:"Sent"  },
    {time:"07:30",to:"director@company.com",subject:"[Escalated] TKT-005", status:"Sent"  },
    {time:"Yesterday",to:"client@company.com",subject:"[Resolved] TKT-008",status:"Queued"},
  ];
  return (
    <Modal title="📧 Email Notifications" onClose={onClose} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div>
          <SectionLabel>Notification Rules</SectionLabel>
          {rules.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#0d0d1f",borderRadius:10,marginBottom:8,border:`1px solid ${r.active?"#6C63FF33":"#1e1e3a"}`}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:"#e0e0ff"}}>{r.event}</div>
                <div style={{fontSize:11,color:"#555"}}>{r.to}</div>
              </div>
              <div onClick={()=>setRules(p=>p.map(x=>x.id===r.id?{...x,active:!x.active}:x))} style={{width:36,height:20,borderRadius:10,background:r.active?"#6C63FF":"#2a2a4a",cursor:"pointer",position:"relative"}}>
                <div style={{position:"absolute",top:2,left:r.active?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
              </div>
            </div>
          ))}
        </div>
        <div>
          <SectionLabel>Email Log</SectionLabel>
          {log.map((l,i)=>(
            <div key={i} style={{padding:"10px 12px",background:"#0d0d1f",borderRadius:10,marginBottom:8,borderLeft:`3px solid ${l.status==="Sent"?"#00E396":"#FEB019"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontSize:11,color:"#888"}}>{l.time}</span>
                <span style={{fontSize:10,fontWeight:700,color:l.status==="Sent"?"#00E396":"#FEB019"}}>{l.status}</span>
              </div>
              <div style={{fontSize:12,color:"#ccc",marginBottom:2}}>{l.subject}</div>
              <div style={{fontSize:11,color:"#555"}}>→ {l.to}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
function ClientPortal({ tickets, onClose }) {
  const [client,setClient] = useState("Infosys Ltd");
  const myTickets = tickets.filter(t=>t.client===client);
  const clients   = [...new Set(tickets.map(t=>t.client))];
  return (
    <Modal title="👤 Client Portal" onClose={onClose} wide>
      <div style={{marginBottom:14}}>
        <select value={client} onChange={e=>setClient(e.target.value)} style={{width:"100%",background:"#0d0d1f",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 12px",fontSize:13}}>
          {clients.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[["Total",myTickets.length,"#6C63FF"],["Open",myTickets.filter(t=>["Open","In Progress"].includes(t.status)).length,"#FEB019"],["Resolved",myTickets.filter(t=>["Resolved","Closed"].includes(t.status)).length,"#00E396"]].map(([k,v,c])=>(
          <div key={k} style={{background:"#0d0d1f",borderRadius:10,padding:"12px",textAlign:"center",border:`1px solid ${c}22`}}>
            <div style={{fontSize:22,fontWeight:800,color:c}}>{v}</div>
            <div style={{fontSize:11,color:"#555"}}>{k}</div>
          </div>
        ))}
      </div>
      {myTickets.length===0&&<div style={{textAlign:"center",color:"#555",padding:24}}>No tickets found.</div>}
      {myTickets.map(t=>(
        <div key={t.id} style={{padding:"12px 14px",background:"#0d0d1f",borderRadius:12,marginBottom:8,border:"1px solid #1e1e3a"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontFamily:"monospace",color:"#6C63FF",fontWeight:700,fontSize:12}}>{t.id}</span>
            <span style={{fontSize:10,background:`${statusColor[t.status]}22`,color:statusColor[t.status],padding:"2px 8px",borderRadius:4,fontWeight:600}}>{t.status}</span>
          </div>
          <div style={{fontSize:13,color:"#e0e0ff",marginBottom:4}}>{t.subject}</div>
          <div style={{fontSize:11,color:"#555",marginBottom:6}}>{t.agent} · {t.category}</div>
          <SLABar ticket={t} compact/>
        </div>
      ))}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TICKET DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function TicketModal({ ticket, onClose, onUpdate, addToast }) {
  const [note,setNote]     = useState("");
  const [status,setStatus] = useState(ticket.status);
  const [agent,setAgent]   = useState(ticket.agent);
  const [showWA,setShowWA] = useState(false);
  const [waMsg,setWaMsg]   = useState(`Hi, your ticket ${ticket.id} has been updated. Status: ${ticket.status}. Our team is on it!`);
  function save() {
    const updated = {...ticket,status,agent,notes:note.trim()?[...ticket.notes,{text:note,time:new Date().toLocaleTimeString(),agent}]:ticket.notes};
    onUpdate(updated); setNote("");
  }
  function sendWA() {
    addToast("whatsapp","WhatsApp Sent",`Notification sent to ${ticket.client} (${ticket.phone})`);
    setShowWA(false);
  }
  return (
    <Modal title={`${ticket.id} – Detail`} onClose={onClose}>
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
          <span style={{background:PRIORITIES[ticket.priority].bg,color:PRIORITIES[ticket.priority].color,padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:700}}>{ticket.priority}</span>
          <span style={{background:"#1e1e3a",color:"#aaa",padding:"2px 8px",borderRadius:4,fontSize:11}}>{ticket.category}</span>
          {ticket.escalated&&<span style={{background:"#FF456022",color:"#FF4560",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:700}}>🔺 AUTO-ESCALATED</span>}
        </div>
        <div style={{fontSize:15,fontWeight:700,color:"#f0f0ff",marginBottom:3}}>{ticket.subject}</div>
        <div style={{fontSize:12,color:"#555"}}>{ticket.client} · {ticket.phone}</div>
      </div>
      <div style={{background:"#0a0a1c",borderRadius:10,padding:14,marginBottom:12}}><SLABar ticket={ticket}/></div>
      {ticket.escalationLog?.length>0&&(
        <div style={{background:"#FF456010",border:"1px solid #FF456033",borderRadius:10,padding:12,marginBottom:12}}>
          <div style={{fontSize:11,color:"#FF4560",fontWeight:700,marginBottom:6,textTransform:"uppercase"}}>🔺 Escalation History</div>
          {ticket.escalationLog.map((e,i)=>(
            <div key={i} style={{fontSize:11,color:"#FF8C00",marginBottom:3}}>• {e.time} — {e.rule} → {e.to}</div>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:10,marginBottom:12}}>
        {[["Status",status,setStatus,STATUSES],["Agent",agent,setAgent,AGENT_NAMES]].map(([label,val,setter,opts])=>(
          <div key={label} style={{flex:1}}>
            <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>{label}</label>
            <select value={val} onChange={e=>setter(e.target.value)} style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:12}}>
              {opts.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div style={{maxHeight:120,overflowY:"auto",marginBottom:8}}>
        {ticket.notes.length===0&&<div style={{color:"#444",fontSize:12,fontStyle:"italic"}}>No notes yet.</div>}
        {ticket.notes.map((n,i)=>(
          <div key={i} style={{background:"#12122a",borderRadius:8,padding:"8px 10px",marginBottom:5,borderLeft:"3px solid #6C63FF"}}>
            <div style={{fontSize:12,color:"#ccc"}}>{n.text}</div>
            <div style={{fontSize:10,color:"#444",marginTop:2}}>{n.agent} · {n.time}</div>
          </div>
        ))}
      </div>
      <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add note…" rows={2}
        style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"9px 10px",fontSize:12,resize:"none",outline:"none",boxSizing:"border-box"}}/>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button onClick={save} style={{flex:1,background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"10px",fontWeight:700,cursor:"pointer",fontSize:13}}>Save Changes</button>
        <button onClick={()=>setShowWA(s=>!s)} style={{background:"#25D36620",border:"1px solid #25D36644",color:"#25D366",borderRadius:8,padding:"10px 14px",cursor:"pointer",fontSize:13,fontWeight:700}}>💬 WhatsApp</button>
      </div>
      {showWA&&(
        <div style={{marginTop:10,background:"#25D36610",border:"1px solid #25D36633",borderRadius:10,padding:12}}>
          <div style={{fontSize:11,color:"#25D366",fontWeight:700,marginBottom:6}}>📤 Send WhatsApp to {ticket.client}</div>
          <div style={{fontSize:11,color:"#555",marginBottom:6}}>To: {ticket.phone}</div>
          <textarea value={waMsg} onChange={e=>setWaMsg(e.target.value)} rows={3}
            style={{width:"100%",background:"#0a0a18",border:"1px solid #25D36633",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:12,resize:"none",outline:"none",boxSizing:"border-box",marginBottom:8}}/>
          <button onClick={sendWA} style={{width:"100%",background:"linear-gradient(135deg,#25D366,#1aaf53)",border:"none",color:"#fff",borderRadius:7,padding:"8px",fontWeight:700,cursor:"pointer",fontSize:12}}>Send Message</button>
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEW TICKET MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function NewTicketModal({ onClose, onCreate }) {
  const [form, setForm] = useState({client:"", phone:"", subject:"", category:"Technical", priority:"P3", agent:AGENT_NAMES[0]});
  const [clientSearch, setClientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const clientRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (clientRef.current && !clientRef.current.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filteredClients = MASTER_CLIENTS_INIT.filter(c =>
    c.active && c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  function selectClient(c) {
    setForm(f => ({...f, client: c.name, phone: c.phone}));
    setClientSearch(c.name);
    setShowDropdown(false);
  }

  function handleCreate() {
    if (!form.client || !form.subject) return;
    onCreate(mkTicket({...form, escalationLog:[]}));
    onClose();
  }

  const inputStyle = {width:"100%", background:"#12122a", border:"1px solid #2a2a4a", color:"#f0f0ff", borderRadius:8, padding:"8px 10px", fontSize:13, boxSizing:"border-box", outline:"none"};

  return (
    <Modal title="📞 New Support Ticket" onClose={onClose}>

      {/* Company dropdown */}
      <div style={{marginBottom:10}} ref={clientRef}>
        <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Company / Client *</label>
        <div style={{position:"relative"}}>
          <input
            value={clientSearch}
            onChange={e=>{ setClientSearch(e.target.value); setForm(f=>({...f, client:e.target.value, phone:""})); setShowDropdown(true); }}
            onFocus={()=>setShowDropdown(true)}
            placeholder="Search or select company…"
            style={{...inputStyle, paddingRight:32}}
          />
          <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:"#555",fontSize:12,pointerEvents:"none"}}>▾</span>

          {showDropdown && filteredClients.length > 0 && (
            <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"#0d0d1a",border:"1px solid #2a2a4a",borderRadius:10,zIndex:9999,boxShadow:"0 12px 40px rgba(0,0,0,0.8)",maxHeight:200,overflowY:"auto"}}>
              {filteredClients.map(c => (
                <div
                  key={c.id}
                  onMouseDown={e=>{ e.preventDefault(); selectClient(c); }}
                  style={{padding:"9px 12px", cursor:"pointer", borderBottom:"1px solid #1a1a2e"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#1e1e3a"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <div style={{fontSize:13, fontWeight:600, color:"#e0e0ff"}}>{c.name}</div>
                  <div style={{fontSize:11, color:"#555", marginTop:1}}>{c.contact} · {c.phone} · {c.city}</div>
                </div>
              ))}
              {/* Option to type custom company name */}
              {clientSearch && !filteredClients.find(c=>c.name.toLowerCase()===clientSearch.toLowerCase()) && (
                <div
                  onMouseDown={e=>{ e.preventDefault(); setForm(f=>({...f, client:clientSearch})); setShowDropdown(false); }}
                  style={{padding:"9px 12px", cursor:"pointer", borderTop:"1px solid #2a2a4a"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#1e1e3a"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <div style={{fontSize:12, color:"#6C63FF", fontWeight:700}}>+ Use "{clientSearch}" as new company</div>
                </div>
              )}
            </div>
          )}
        </div>
        {form.client && MASTER_CLIENTS_INIT.find(c=>c.name===form.client) && (
          <div style={{marginTop:5, padding:"6px 10px", background:"#6C63FF11", border:"1px solid #6C63FF22", borderRadius:7, fontSize:11, color:"#6C63FF"}}>
            ✓ {MASTER_CLIENTS_INIT.find(c=>c.name===form.client)?.contact} · {MASTER_CLIENTS_INIT.find(c=>c.name===form.client)?.city}
          </div>
        )}
      </div>

      {/* Phone — auto-filled from client selection */}
      <div style={{marginBottom:10}}>
        <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Phone</label>
        <input
          value={form.phone}
          onChange={e=>setForm(f=>({...f, phone:e.target.value}))}
          placeholder="+91-XXXXXXXXXX"
          style={inputStyle}
        />
      </div>

      {/* Subject */}
      <div style={{marginBottom:10}}>
        <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Subject *</label>
        <input
          value={form.subject}
          onChange={e=>setForm(f=>({...f, subject:e.target.value}))}
          placeholder="Brief description of the issue"
          style={inputStyle}
        />
      </div>

      {/* Category + Priority */}
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        {[["Category","category",CATEGORIES],["Priority","priority",Object.keys(PRIORITIES)]].map(([label,key,opts])=>(
          <div key={key} style={{flex:1}}>
            <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>{label}</label>
            <select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:12}}>
              {opts.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Assign To */}
      <div style={{marginBottom:16}}>
        <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>Assign To</label>
        <select value={form.agent} onChange={e=>setForm({...form,agent:e.target.value})} style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:12}}>
          {AGENT_NAMES.map(a=><option key={a}>{a}</option>)}
        </select>
      </div>

      <button
        onClick={handleCreate}
        disabled={!form.client || !form.subject}
        style={{width:"100%",background:!form.client||!form.subject?"#1e1e3a":"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:!form.client||!form.subject?"#444":"#fff",borderRadius:8,padding:"11px",fontWeight:700,cursor:!form.client||!form.subject?"not-allowed":"pointer",fontSize:13,transition:"all 0.2s"}}
      >Create Ticket</button>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPLOYEE TICKET LIST
// ═══════════════════════════════════════════════════════════════════════════════
function EmployeeTicketList({ tickets, onSelectTicket }) {
  const [selectedAgent,setSelectedAgent] = useState(null);
  const agentStats = AGENT_NAMES.map(name=>{
    const myT = tickets.filter(t=>t.agent===name);
    return { name, tickets:myT, total:myT.length, open:myT.filter(t=>t.status==="Open").length, inProg:myT.filter(t=>t.status==="In Progress").length, resolved:myT.filter(t=>t.status==="Resolved"||t.status==="Closed").length, escalated:myT.filter(t=>t.escalated).length };
  });
  const viewing = selectedAgent ? agentStats.find(a=>a.name===selectedAgent) : null;
  return (
    <div style={{background:"#0d0d1a",border:"1px solid #1e1e3a",borderRadius:14,padding:"14px 16px",marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:800,color:"#f0f0ff"}}>👨‍💼 Employee Wise Ticket View</div>
        {selectedAgent&&<button onClick={()=>setSelectedAgent(null)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11}}>← All Agents</button>}
      </div>
      {!selectedAgent ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {agentStats.map(a=>{
            const agent = AGENTS.find(ag=>ag.name===a.name)||{online:false,role:"Agent"};
            return (
              <div key={a.name} onClick={()=>setSelectedAgent(a.name)} style={{background:"#12122a",borderRadius:12,padding:"11px 10px",border:"1px solid #1e1e3a",cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#6C63FF55"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e3a"}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#4a40e0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",position:"relative",flexShrink:0}}>
                    {a.name[0]}
                    <div style={{position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",background:agent.online?"#00E396":"#555",border:"2px solid #12122a"}}/>
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#e0e0ff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name.split(" ")[0]}</div>
                    <div style={{fontSize:9,color:"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{agent.role}</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  {[["Total",a.total,"#6C63FF"],["Open",a.open,"#FEB019"],["Done",a.resolved,"#00E396"],["Esc",a.escalated,"#FF4560"]].map(([k,v,c])=>(
                    <div key={k} style={{background:"#0d0d1a",borderRadius:6,padding:"4px 5px",textAlign:"center"}}>
                      <div style={{fontSize:13,fontWeight:800,color:c}}>{v}</div>
                      <div style={{fontSize:9,color:"#444"}}>{k}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            {[["Total",viewing.total,"#6C63FF"],["Open",viewing.open,"#FEB019"],["In Progress",viewing.inProg,"#FF8C00"],["Resolved",viewing.resolved,"#00E396"],["Escalated",viewing.escalated,"#FF4560"]].map(([k,v,c])=>(
              <div key={k} style={{background:`${c}15`,border:`1px solid ${c}33`,borderRadius:8,padding:"6px 12px",textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:800,color:c}}>{v}</div>
                <div style={{fontSize:10,color:c}}>{k}</div>
              </div>
            ))}
          </div>
          {viewing.tickets.length===0?<div style={{textAlign:"center",color:"#555",padding:16}}>No tickets assigned.</div>:(
            <div style={{maxHeight:220,overflowY:"auto"}}>
              {viewing.tickets.map((t,i)=>(
                <div key={t.id}
                  onClick={()=>onSelectTicket(t)}
                  style={{display:"grid",gridTemplateColumns:"80px 1fr 90px 60px 90px",gap:8,alignItems:"center",padding:"8px 10px",background:"#12122a",borderRadius:8,marginBottom:5,borderLeft:`3px solid ${statusColor[t.status]||"#555"}`,cursor:"pointer",transition:"background 0.12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#1a1a30"}
                  onMouseLeave={e=>e.currentTarget.style.background="#12122a"}>
                  <span style={{fontFamily:"monospace",color:"#6C63FF",fontSize:10,fontWeight:700}}>{t.id}</span>
                  <span style={{fontSize:11,color:"#e0e0ff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.subject}</span>
                  <span style={{fontSize:10,color:"#999"}}>{t.client}</span>
                  <span style={{background:PRIORITIES[t.priority]?.bg,color:PRIORITIES[t.priority]?.color,padding:"1px 5px",borderRadius:3,fontSize:9,fontWeight:700,width:"fit-content"}}>{t.priority}</span>
                  <span style={{background:`${statusColor[t.status]}22`,color:statusColor[t.status],padding:"1px 5px",borderRadius:3,fontSize:9,fontWeight:600,width:"fit-content"}}>{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function Particles() {
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
      {[...Array(20)].map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          width:Math.random()*3+1+"px", height:Math.random()*3+1+"px",
          borderRadius:"50%",
          background:`rgba(108,99,255,${Math.random()*0.4+0.1})`,
          left:Math.random()*100+"%", top:Math.random()*100+"%",
          animation:`float${i%4} ${Math.random()*10+8}s infinite linear`,
          animationDelay:Math.random()*5+"s",
        }}/>
      ))}
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [users] = useState(USERS_INIT);

  useEffect(()=>{ setTimeout(()=>setMounted(true),100); },[]);

  function handleLogin() {
    setError("");
    if (!email||!password) { setError("Please enter email and password."); return; }
    setLoading(true);
    setTimeout(()=>{
      const user = users.find(u=>u.email===email&&u.password===password);
      if (user) { onLogin(user); }
      else { setError("Invalid email or password. Please try again."); setLoading(false); }
    },1200);
  }

  function quickLogin(u) { setEmail(u.email); setPassword(u.password); setError(""); setActiveUser(u.id); }

  const stats = [
    { value: "2,847", label: "Tickets Resolved", icon: "✅", color: "#00E396" },
    { value: "99.2%", label: "SLA Compliance",   icon: "📈", color: "#6C63FF" },
    { value: "< 4min", label: "Avg Response",     icon: "⚡", color: "#FEB019" },
  ];

  return (
    <div style={{height:"100vh",width:"100vw",background:"#05050f",display:"flex",fontFamily:"'DM Sans','Segoe UI',sans-serif",overflow:"hidden"}}>
      <style>{`
        @keyframes float0{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-30px) translateX(15px)}}
        @keyframes float1{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(20px) translateX(-20px)}}
        @keyframes float2{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-15px) translateX(-10px)}}
        @keyframes float3{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(25px) translateX(12px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(50px) scale(0.9)}to{opacity:1;transform:translateX(0) scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(108,99,255,0.3)}50%{box-shadow:0 0 40px rgba(108,99,255,0.6)}}
        @keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0d0d1a}
        ::-webkit-scrollbar-thumb{background:#2a2a4a;border-radius:4px}
        input::placeholder{color:#333}
        .login-input:focus{border-color:#6C63FF !important;box-shadow:0 0 0 3px rgba(108,99,255,0.12)}
        .quick-user:hover{background:#0f0f22 !important;border-color:#3a3a6a !important;transform:translateX(4px)}
        .quick-user{transition:all 0.18s ease !important}
        .signin-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 32px rgba(108,99,255,0.55) !important}
        .signin-btn{transition:all 0.2s ease !important}
      `}</style>

      {/* LEFT PANEL */}
      <div style={{flex:"0 0 46%",position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#0a0818 0%,#0d0b22 50%,#080616 100%)",display:"flex",flexDirection:"column",justifyContent:"center",padding:"56px 52px",opacity:mounted?1:0,transform:mounted?"translateX(0)":"translateX(-24px)",transition:"opacity 0.7s ease,transform 0.7s ease"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(108,99,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,0.06) 1px,transparent 1px)",backgroundSize:"48px 48px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",width:520,height:520,borderRadius:"50%",background:"radial-gradient(circle,rgba(108,99,255,0.18) 0%,transparent 65%)",top:"-120px",left:"-120px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",width:360,height:360,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,227,150,0.1) 0%,transparent 65%)",bottom:"-80px",right:"-40px",pointerEvents:"none"}}/>
        <Particles/>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:52}}>
          <div style={{width:52,height:52,borderRadius:15,background:"linear-gradient(135deg,#6C63FF,#4a40e0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 8px 28px rgba(108,99,255,0.45)",animation:"glowPulse 3s ease infinite"}}>🎯</div>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:"#f0f0ff",letterSpacing:-0.3}}>SupportDesk CRM</div>
            <div style={{fontSize:11,color:"#6C63FF",fontWeight:600,letterSpacing:1.5,textTransform:"uppercase"}}>Enterprise · v4.0</div>
          </div>
        </div>
        <div style={{marginBottom:40}}>
          <div style={{fontSize:38,fontWeight:900,color:"#f0f0ff",lineHeight:1.15,letterSpacing:-1,marginBottom:16}}>
            Support at the<br/>
            <span style={{background:"linear-gradient(90deg,#6C63FF,#00E396)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>speed of thought.</span>
          </div>
          <div style={{fontSize:15,color:"#555",lineHeight:1.65,maxWidth:340}}>Auto-escalation, real-time SLA tracking, WhatsApp notifications, and intelligent ticket routing — all in one powerful workspace.</div>
        </div>
        <div style={{display:"flex",gap:20,marginBottom:48}}>
          {stats.map(s=>(
            <div key={s.label} style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 14px",textAlign:"center"}}>
              <div style={{fontSize:11,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:19,fontWeight:800,color:s.color,letterSpacing:-0.5}}>{s.value}</div>
              <div style={{fontSize:10,color:"#444",marginTop:3,lineHeight:1.3}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[["🔺","Auto-Escalation Engine","Rules fire every 30s automatically"],["💬","WhatsApp Notifications","Real-time updates to subscribers"],["🔌","Third-Party Integrations","Slack, Jira, Salesforce & more"],].map(([icon,title,desc])=>(
            <div key={title} style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(108,99,255,0.12)",border:"1px solid rgba(108,99,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{icon}</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#c0c0e0"}}>{title}</div>
                <div style={{fontSize:11,color:"#444"}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{position:"absolute",bottom:28,left:52,fontSize:11,color:"#2a2a4a"}}>© 2026 SupportDesk CRM · All rights reserved</div>
      </div>

      <div style={{width:1,background:"linear-gradient(to bottom,transparent,#1e1e3a 20%,#1e1e3a 80%,transparent)",flexShrink:0}}/>

      {/* RIGHT PANEL */}
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 52px",overflowY:"auto",opacity:mounted?1:0,transform:mounted?"translateX(0)":"translateX(24px)",transition:"opacity 0.7s ease 0.1s,transform 0.7s ease 0.1s"}}>
        <div style={{maxWidth:400,width:"100%",margin:"0 auto"}}>
          <div style={{marginBottom:36}}>
            <div style={{fontSize:28,fontWeight:900,color:"#f0f0ff",letterSpacing:-0.5,marginBottom:6}}>Welcome back</div>
            <div style={{fontSize:14,color:"#444"}}>Sign in to access your workspace</div>
          </div>
          <div style={{marginBottom:18}}>
            <label style={{fontSize:11,color:"#555",display:"block",marginBottom:7,textTransform:"uppercase",letterSpacing:1.2,fontWeight:600}}>Email Address</label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,opacity:0.5}}>✉️</span>
              <input className="login-input" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="your@email.com" type="email"
                style={{width:"100%",background:"#0d0d1a",border:"1px solid #1e1e3a",color:"#f0f0ff",borderRadius:10,padding:"13px 14px 13px 42px",fontSize:14,boxSizing:"border-box",outline:"none",transition:"all 0.2s"}}/>
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <label style={{fontSize:11,color:"#555",display:"block",marginBottom:7,textTransform:"uppercase",letterSpacing:1.2,fontWeight:600}}>Password</label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,opacity:0.5}}>🔒</span>
              <input className="login-input" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••••" type={showPass?"text":"password"}
                style={{width:"100%",background:"#0d0d1a",border:"1px solid #1e1e3a",color:"#f0f0ff",borderRadius:10,padding:"13px 44px 13px 42px",fontSize:14,boxSizing:"border-box",outline:"none",transition:"all 0.2s"}}/>
              <button onClick={()=>setShowPass(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:15,padding:0}}>
                {showPass?"🙈":"👁"}
              </button>
            </div>
          </div>
          {error&&<div style={{marginBottom:16,padding:"10px 14px",background:"#FF456015",border:"1px solid #FF456033",borderRadius:9,fontSize:13,color:"#FF4560",animation:"shake 0.4s ease"}}>{error}</div>}
          <button className="signin-btn" onClick={handleLogin} disabled={loading}
            style={{width:"100%",background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:12,padding:"14px",fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer",opacity:loading?0.8:1,boxShadow:"0 6px 24px rgba(108,99,255,0.4)",letterSpacing:0.2}}>
            {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.6s linear infinite"}}/>Signing in…</span>:"Sign In →"}
          </button>
          <div style={{marginTop:28}}>
            <div style={{fontSize:11,color:"#333",textTransform:"uppercase",letterSpacing:1.2,fontWeight:600,marginBottom:12,textAlign:"center"}}>Quick Access</div>
            {users.map(u=>(
              <div key={u.id} className="quick-user" onClick={()=>quickLogin(u)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:activeUser===u.id?"#0f0f22":"#08081a",border:`1px solid ${activeUser===u.id?"#3a3a6a":"#111122"}`,borderRadius:10,marginBottom:7,cursor:"pointer"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${u.color},${u.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"#fff",flexShrink:0}}>{u.avatar}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#d0d0f0"}}>{u.name}</div>
                  <div style={{fontSize:11,color:"#444"}}>{u.role}</div>
                </div>
                <div style={{fontSize:11,color:u.color,fontWeight:600,flexShrink:0}}>{u.email.split("@")[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CRM DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function CRMDashboard({ user: initialUser, onLogout }) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [tickets, setTickets]         = useState(INIT_TICKETS.map(t=>({...t,escalationLog:[]})));
  const [escRules, setEscRules]       = useState(DEFAULT_ESC_RULES);
  const [selected, setSelected]       = useState(null);
  const [modal, setModal]             = useState(null);
  const [search, setSearch]           = useState("");
  const [fStatus, setFStatus]         = useState("All");
  const [fPriority, setFPriority]     = useState("All");
  const [toasts, setToasts]           = useState([]);
  const [escLog, setEscLog]           = useState([]);
  const toastId = useRef(0);

  function addToast(type, title, message) {
    const id = ++toastId.current;
    setToasts(prev=>[...prev,{id,type,title,message}]);
    setTimeout(()=>setToasts(prev=>prev.filter(x=>x.id!==id)),5000);
  }

  // Auto-Escalation Engine
  useEffect(()=>{
    const interval = setInterval(()=>{
      setTickets(prev=>{
        let changed = false;
        const updated = prev.map(ticket=>{
          if (ticket.status==="Resolved"||ticket.status==="Closed"||ticket.status==="Escalated") return ticket;
          const elapsedMin = getElapsed(ticket.created);
          for (const rule of escRules) {
            if (!rule.active) continue;
            if (rule.priority!=="ALL"&&rule.priority!==ticket.priority) continue;
            const thresholdMin = rule.unit==="hrs"?rule.triggerAfter*60:rule.triggerAfter;
            const alreadyApplied = ticket.escalationLog?.some(e=>e.ruleId===rule.id);
            if (elapsedMin>=thresholdMin&&!alreadyApplied) {
              changed = true;
              const entry = {ruleId:rule.id,rule:rule.name,to:rule.escalateTo,time:new Date().toLocaleTimeString(),action:rule.action};
              setTimeout(()=>{
                addToast("escalate","Auto-Escalated",`${ticket.id} – ${ticket.client} → ${rule.escalateTo}`);
                setEscLog(prev=>[{...entry,ticketId:ticket.id,client:ticket.client},...prev.slice(0,49)]);
              },0);
              return {...ticket,status:"Escalated",escalated:true,agent:rule.escalateTo,escalationLog:[...(ticket.escalationLog||[]),entry]};
            }
          }
          return ticket;
        });
        return changed?updated:prev;
      });
    },30000);
    return ()=>clearInterval(interval);
  },[escRules]);

  function updateTicket(updated) {
    setTickets(prev=>prev.map(t=>t.id===updated.id?updated:t));
    setSelected(updated);
    if (updated.status==="Resolved") addToast("resolve","Resolved",`${updated.id} resolved by ${updated.agent}`);
  }

  const stats = {
    total:    tickets.length,
    open:     tickets.filter(t=>t.status==="Open").length,
    inProg:   tickets.filter(t=>t.status==="In Progress").length,
    escalated:tickets.filter(t=>t.escalated).length,
    breached: tickets.filter(t=>getElapsed(t.created)>PRIORITIES[t.priority]?.response&&t.status!=="Resolved"&&t.status!=="Closed").length,
    resolved: tickets.filter(t=>t.status==="Resolved"||t.status==="Closed").length,
  };

  const isBreach = search==="__breach__";
  const filtered = tickets.filter(t=>{
    const s=isBreach?"":search.toLowerCase();
    const matchSearch = s===""||t.client.toLowerCase().includes(s)||t.subject.toLowerCase().includes(s)||t.id.toLowerCase().includes(s);
    const matchStatus = fStatus==="All"||t.status===fStatus;
    const matchPriority = fPriority==="All"||t.priority===fPriority;
    const matchBreach = !isBreach||(getElapsed(t.created)>PRIORITIES[t.priority]?.response&&t.status!=="Resolved"&&t.status!=="Closed");
    return matchSearch&&matchStatus&&matchPriority&&matchBreach;
  });

  // ── NAV MENUS ───────────────────────────────────────────────────────────────
  const MASTER_MENU = [
    {label:"🏢 Clients",        key:"masterClients"},
    {label:"👥 Agents",         key:"masterAgents"},
    {label:"⏱ SLA Policies",   key:"masterSLA"},
    {label:"🏗 Departments",    key:"masterDepts"},
    {label:"🏷 Categories",     key:"masterCats"},
  ];
  const REPORTS_MENU = [
    {label:"📋 Ticket Summary",    key:"reportTickets"},
    {label:"📊 SLA Compliance",    key:"reportSLA"},
    {label:"👥 Agent Performance", key:"reportAgents"},
    {label:"🔺 Escalation Report", key:"reportEscalation"},
  ];
  const NAV = [
    {label:"📁 Masters ▾",     key:"__masters__",  dropdown:MASTER_MENU},
    {label:"📊 Reports ▾",     key:"__reports__",  dropdown:REPORTS_MENU},
    {label:"⚙️ Escalation",   key:"escRules"},
    {label:"📧 Email Rules",   key:"email"},
    {label:"💬 WhatsApp",      key:"whatsapp"},
    {label:"🔌 Integrations",  key:"integrations"},
    {label:"👤 Client Portal", key:"portal"},
    {label:"📈 Analytics",     key:"analytics"},
  ];

  return (
    <div style={{height:"100vh",overflow:"hidden",display:"flex",flexDirection:"column",background:"#07071a",fontFamily:"'DM Sans','Segoe UI',sans-serif",color:"#e0e0ff"}}>
      <style>{`
        @keyframes toastIn{from{opacity:0;transform:translateX(50px) scale(0.9)}to{opacity:1;transform:translateX(0) scale(1)}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0d0d1a}
        ::-webkit-scrollbar-thumb{background:#2a2a4a;border-radius:4px}
      `}</style>

      {/* Top Nav with user info */}
      <TopBar user={currentUser} onLogout={onLogout} navButtons={NAV} onNavClick={setModal} onNewTicket={()=>setModal("new")}/>

      <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
        {/* Welcome Banner */}
        <div style={{marginBottom:14,padding:"12px 18px",background:"linear-gradient(135deg,#6C63FF12,#4a40e012)",border:"1px solid #6C63FF33",borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"#f0f0ff"}}>Welcome back, {currentUser.name.split(" ")[0]}! 👋</div>
            <div style={{fontSize:12,color:"#555",marginTop:2}}>Role: <span style={{color:currentUser.color,fontWeight:700}}>{currentUser.role}</span> · {new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            {[["⚠️",`${stats.breached} Breached`,"#FF4560"],["🔺",`${stats.escalated} Escalated`,"#FF8C00"],["✅",`${stats.resolved} Resolved`,"#00E396"]].map(([icon,label,color])=>(
              <div key={label} style={{background:`${color}15`,border:`1px solid ${color}33`,borderRadius:8,padding:"6px 12px",textAlign:"center"}}>
                <div style={{fontSize:14}}>{icon}</div>
                <div style={{fontSize:10,color,fontWeight:700}}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Escalation Status */}
        <div style={{marginBottom:14,padding:"10px 16px",background:"#0d0d1a",border:"1px solid #FF8C0033",borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#00E396",boxShadow:"0 0 8px #00E396"}}/>
            <span style={{fontSize:13,fontWeight:700,color:"#ccc"}}>Auto-Escalation <span style={{color:"#00E396"}}>ACTIVE</span></span>
            <span style={{fontSize:11,color:"#555"}}>· {escRules.filter(r=>r.active).length} rules · checks every 30s</span>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {escRules.filter(r=>r.active).map(r=>(
              <span key={r.id} style={{fontSize:10,background:r.priority==="ALL"?"#6C63FF18":PRIORITIES[r.priority]?.bg,color:r.priority==="ALL"?"#6C63FF":PRIORITIES[r.priority]?.color,padding:"2px 8px",borderRadius:4,fontWeight:700}}>
                {r.priority}: {r.triggerAfter}{r.unit}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:9,marginBottom:18}}>
          {[["Total",stats.total,"#6C63FF","🎫","All"],["Open",stats.open,"#6C63FF","📂","Open"],["In Progress",stats.inProg,"#FEB019","⚙️","In Progress"],["Escalated",stats.escalated,"#FF4560","🔺","Escalated"],["SLA Breach",stats.breached,"#FF8C00","⚠️","__breach__"],["Resolved",stats.resolved,"#00E396","✅","Resolved"]].map(([k,v,c,icon,filterKey])=>{
            const isActive = filterKey==="__breach__"?isBreach:filterKey==="All"?(fStatus==="All"&&fPriority==="All"&&!isBreach&&search===""):fStatus===filterKey;
            return (
              <div key={k} onClick={()=>{ if(filterKey==="__breach__"){setFStatus("All");setFPriority("All");setSearch("__breach__");}else if(filterKey==="All"){setFStatus("All");setFPriority("All");setSearch("");}else{setFStatus(filterKey);setFPriority("All");setSearch(""); } }}
                style={{background:isActive?`${c}18`:"#0d0d1a",border:`1px solid ${isActive?c:c+"25"}`,borderRadius:12,padding:"12px 13px",cursor:"pointer",transition:"all 0.18s",transform:isActive?"translateY(-2px)":"none",boxShadow:isActive?`0 6px 20px ${c}25`:"none"}}>
                <div style={{fontSize:17,marginBottom:3}}>{icon}</div>
                <div style={{fontSize:22,fontWeight:800,color:c}}>{v}</div>
                <div style={{fontSize:10,color:isActive?c:"#555",fontWeight:isActive?700:400}}>{k} {isActive?"▾":""}</div>
              </div>
            );
          })}
        </div>

        {/* Employee Wise Ticket List */}
        <EmployeeTicketList tickets={tickets} onSelectTicket={t=>setSelected(t)}/>

        {/* Filters */}
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <input placeholder="🔍  Search…" value={isBreach?"":search} onChange={e=>setSearch(e.target.value)}
            style={{flex:1,minWidth:180,background:"#0d0d1a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:10,padding:"8px 12px",fontSize:13,outline:"none"}}/>
          <select value={fStatus} onChange={e=>setFStatus(e.target.value)} style={{background:"#0d0d1a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:10,padding:"8px 10px",fontSize:12}}>
            <option>All</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
          <select value={fPriority} onChange={e=>setFPriority(e.target.value)} style={{background:"#0d0d1a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:10,padding:"8px 10px",fontSize:12}}>
            <option>All</option>{Object.keys(PRIORITIES).map(p=><option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Ticket Table */}
        <div style={{background:"#0d0d1a",border:"1px solid #1e1e3a",borderRadius:14,overflow:"hidden",marginBottom:16}}>
          <div style={{padding:"11px 16px",borderBottom:"1px solid #1e1e3a",display:"grid",gridTemplateColumns:"88px 1fr 140px 80px 110px 130px 160px",gap:8,fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:1}}>
            <span>ID</span><span>Subject</span><span>Client</span><span>Priority</span><span>Status</span><span>Agent</span><span>SLA</span>
          </div>
          {filtered.length===0&&<div style={{padding:36,textAlign:"center",color:"#444"}}>No tickets match filters.</div>}
          {filtered.map((t,i)=>{
            const breached=getElapsed(t.created)>PRIORITIES[t.priority]?.response&&t.status!=="Resolved"&&t.status!=="Closed";
            return (
              <div key={t.id} onClick={()=>setSelected(t)}
                style={{padding:"11px 16px",display:"grid",gridTemplateColumns:"88px 1fr 140px 80px 110px 130px 160px",gap:8,alignItems:"center",borderBottom:i<filtered.length-1?"1px solid #0f0f24":"none",cursor:"pointer",background:t.escalated?"rgba(255,69,96,0.05)":breached?"rgba(255,140,0,0.04)":"transparent",borderLeft:t.escalated?"3px solid #FF4560":breached?"3px solid #FF8C00":"3px solid transparent",transition:"background 0.12s"}}
                onMouseEnter={e=>e.currentTarget.style.background="#10102a"}
                onMouseLeave={e=>e.currentTarget.style.background=t.escalated?"rgba(255,69,96,0.05)":breached?"rgba(255,140,0,0.04)":"transparent"}>
                <span style={{fontFamily:"monospace",color:"#6C63FF",fontSize:11,fontWeight:700}}>{t.id}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:"#e0e0ff",marginBottom:1}}>{t.subject}</div>
                  <div style={{fontSize:10,color:"#444",display:"flex",gap:5,alignItems:"center"}}>
                    {t.category}
                    {t.escalated&&<span style={{fontSize:9,background:"#FF456022",color:"#FF4560",padding:"1px 5px",borderRadius:3,fontWeight:700}}>🔺 AUTO-ESC</span>}
                  </div>
                </div>
                <div style={{fontSize:11,color:"#999"}}>{t.client}</div>
                <span style={{background:PRIORITIES[t.priority].bg,color:PRIORITIES[t.priority].color,padding:"2px 6px",borderRadius:4,fontSize:10,fontWeight:700,width:"fit-content"}}>{t.priority}</span>
                <span style={{background:`${statusColor[t.status]}22`,color:statusColor[t.status],padding:"2px 6px",borderRadius:4,fontSize:10,fontWeight:600,width:"fit-content"}}>{t.status}</span>
                <div style={{fontSize:11,color:"#777"}}>{t.agent.split(" ")[0]}</div>
                <SLABar ticket={t} compact/>
              </div>
            );
          })}
        </div>

        {/* Escalation Log */}
        {escLog.length>0&&(
          <div style={{background:"#0d0d1a",border:"1px solid #FF456033",borderRadius:14,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:10,color:"#FF4560",textTransform:"uppercase",letterSpacing:1,marginBottom:10,fontWeight:700}}>🔺 Auto-Escalation Log</div>
            <div style={{maxHeight:160,overflowY:"auto"}}>
              {escLog.map((e,i)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"7px 10px",background:"#FF456010",borderRadius:8,marginBottom:5,borderLeft:"3px solid #FF4560",alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontFamily:"monospace",color:"#FF4560",fontSize:11,fontWeight:700}}>{e.ticketId}</span>
                  <span style={{fontSize:11,color:"#ccc",flex:1}}>{e.client}</span>
                  <span style={{fontSize:11,color:"#FF8C00"}}>{e.rule}</span>
                  <span style={{fontSize:11,color:"#6C63FF"}}>→ {e.to}</span>
                  <span style={{fontSize:10,color:"#555"}}>{e.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLA Matrix */}
        <div style={{background:"#0d0d1a",border:"1px solid #1e1e3a",borderRadius:12,padding:"14px 16px"}}>
          <div style={{fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>SLA Matrix</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.entries(PRIORITIES).map(([k,p])=>(
              <div key={k} style={{background:"#12122a",borderRadius:9,padding:"9px 14px",border:`1px solid ${p.color}22`,flex:1,minWidth:110}}>
                <div style={{color:p.color,fontWeight:800,fontSize:12,marginBottom:2}}>{k} · {p.label}</div>
                <div style={{fontSize:11,color:"#555"}}>Response: <span style={{color:"#ccc"}}>{fmtMin(p.response)}</span></div>
                <div style={{fontSize:11,color:"#555"}}>Resolution: <span style={{color:"#ccc"}}>{fmtMin(p.resolution)}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ALL MODALS ─────────────────────────────────────────────────────── */}
      {selected            && <TicketModal ticket={selected} onClose={()=>setSelected(null)} onUpdate={updateTicket} addToast={addToast}/>}
      {modal==="new"       && <NewTicketModal onClose={()=>setModal(null)} onCreate={t=>{setTickets(prev=>[t,...prev]);addToast("resolve","Created","Ticket "+t.id+" created");}}/>}
      {modal==="escRules"  && <EscalationRuleEditor rules={escRules} onSave={r=>{setEscRules(r);setModal(null);addToast("resolve","Saved","Escalation rules updated");}} onClose={()=>setModal(null)}/>}
      {modal==="analytics" && <Analytics tickets={tickets} onClose={()=>setModal(null)}/>}
      {modal==="email"     && <EmailPanel onClose={()=>setModal(null)}/>}
      {modal==="portal"    && <ClientPortal tickets={tickets} onClose={()=>setModal(null)}/>}
      {modal==="whatsapp"  && <WhatsAppPanel tickets={tickets} onClose={()=>setModal(null)} addToast={addToast}/>}
      {modal==="integrations" && <IntegrationsPanel onClose={()=>setModal(null)} addToast={addToast}/>}
      {modal==="profile"   && <ProfileModal user={currentUser} onClose={()=>setModal(null)} onUpdate={u=>{setCurrentUser(u);addToast("resolve","Profile","Profile updated successfully!");}}/>}
      {modal==="resetPwd"  && <ResetPasswordModal user={currentUser} onClose={()=>setModal(null)}/>}
      {/* Master Modals */}
      {modal==="masterClients" && <MasterClients onClose={()=>setModal(null)}/>}
      {modal==="masterAgents"  && <MasterAgents  onClose={()=>setModal(null)}/>}
      {modal==="masterSLA"     && <MasterSLA      onClose={()=>setModal(null)}/>}
      {modal==="masterDepts"   && <MasterDepartments onClose={()=>setModal(null)}/>}
      {modal==="masterCats"    && <MasterCategories  onClose={()=>setModal(null)}/>}
      {/* Report Modals */}
      {modal==="reportTickets"    && <ReportTicketSummary tickets={tickets} onClose={()=>setModal(null)}/>}
      {modal==="reportSLA"        && <ReportSLA tickets={tickets} onClose={()=>setModal(null)}/>}
      {modal==="reportAgents"     && <ReportAgentPerformance tickets={tickets} onClose={()=>setModal(null)}/>}
      {modal==="reportEscalation" && <ReportEscalation tickets={tickets} onClose={()=>setModal(null)}/>}

      <Toast toasts={toasts}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOP BAR (with dropdown menu support)
// ═══════════════════════════════════════════════════════════════════════════════
function TopBar({ user, onLogout, navButtons, onNavClick, onNewTicket }) {
  const [showUser, setShowUser] = useState(false);
  const [openDrop, setOpenDrop] = useState(null);
  const barRef = useRef(null);

  // Close dropdowns when clicking outside the entire TopBar
  useEffect(() => {
    function handleOutside(e) {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setOpenDrop(null);
        setShowUser(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleNavBtn(b) {
    if (b.dropdown) {
      setOpenDrop(prev => prev === b.key ? null : b.key);
      setShowUser(false);
    } else {
      onNavClick(b.key);
      setOpenDrop(null);
      setShowUser(false);
    }
  }

  function handleItem(key) {
    onNavClick(key);
    setOpenDrop(null);
    setShowUser(false);
  }

  return (
    <div
      ref={barRef}
      style={{height:52,background:"#08081a",borderBottom:"1px solid #1a1a30",display:"flex",alignItems:"center",padding:"0 20px",gap:6,flexShrink:0,position:"relative"}}
    >
      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginRight:12,flexShrink:0}}>
        <div style={{width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#6C63FF,#4a40e0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🎯</div>
        <span style={{fontSize:13,fontWeight:800,color:"#f0f0ff",whiteSpace:"nowrap"}}>SupportDesk <span style={{color:"#6C63FF"}}>CRM</span></span>
      </div>

      {/* Nav Buttons */}
      <div style={{flex:1,display:"flex",gap:4,alignItems:"center",overflowX:"auto"}}>
        {navButtons.map(b => (
          <div key={b.key} style={{position:"relative",flexShrink:0}}>
            <button
              onClick={()=>handleNavBtn(b)}
              style={{background:openDrop===b.key?"#2a2a4a":"transparent",border:"1px solid #1e1e3a",color:openDrop===b.key?"#f0f0ff":"#888",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}
            >{b.label}</button>

            {b.dropdown && openDrop===b.key && (
              <div style={{position:"absolute",top:36,left:0,background:"#0d0d1a",border:"1px solid #2a2a4a",borderRadius:10,minWidth:190,zIndex:9999,boxShadow:"0 16px 48px rgba(0,0,0,0.85)",padding:5}}>
                {b.dropdown.map(item => (
                  <button
                    key={item.key}
                    onMouseDown={e=>{ e.preventDefault(); handleItem(item.key); }}
                    style={{display:"block",width:"100%",background:"transparent",border:"none",color:"#ccc",borderRadius:7,padding:"9px 14px",cursor:"pointer",fontSize:12,textAlign:"left",fontWeight:600}}
                    onMouseEnter={e=>{ e.currentTarget.style.background="#1e1e3a"; e.currentTarget.style.color="#f0f0ff"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#ccc"; }}
                  >{item.label}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Ticket */}
      <button onClick={onNewTicket} style={{background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:700,flexShrink:0}}>+ New Ticket</button>

      {/* Avatar */}
      <div style={{position:"relative",flexShrink:0}}>
        <div
          onClick={()=>{ setShowUser(s=>!s); setOpenDrop(null); }}
          style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${user.color},${user.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:"#fff",cursor:"pointer",border:"2px solid #2a2a4a"}}
        >{user.avatar}</div>

        {showUser && (
          <div style={{position:"absolute",right:0,top:42,background:"#0d0d1a",border:"1px solid #2a2a4a",borderRadius:12,padding:12,minWidth:180,zIndex:9999,boxShadow:"0 16px 48px rgba(0,0,0,0.7)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#f0f0ff",marginBottom:2}}>{user.name}</div>
            <div style={{fontSize:11,color:"#555",marginBottom:12}}>{user.role}</div>
            <div style={{borderTop:"1px solid #1e1e3a",paddingTop:10,display:"flex",flexDirection:"column",gap:6}}>
              <button onMouseDown={e=>{ e.preventDefault(); handleItem("profile"); }}  style={{background:"#1e1e3a",border:"none",color:"#ccc",borderRadius:7,padding:"7px 10px",cursor:"pointer",fontSize:12,textAlign:"left",fontWeight:600}}>👤 My Profile</button>
              <button onMouseDown={e=>{ e.preventDefault(); handleItem("resetPwd"); }} style={{background:"#1e1e3a",border:"none",color:"#ccc",borderRadius:7,padding:"7px 10px",cursor:"pointer",fontSize:12,textAlign:"left",fontWeight:600}}>🔑 Reset Password</button>
              <button onMouseDown={e=>{ e.preventDefault(); onLogout(); }}             style={{background:"#FF456015",border:"none",color:"#FF4560",borderRadius:7,padding:"7px 10px",cursor:"pointer",fontSize:12,fontWeight:700,textAlign:"left"}}>⏻ Sign Out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]             = useState(null);
  const [animateOut, setAnimateOut] = useState(false);

  function handleLogin(u) {
    setAnimateOut(true);
    setTimeout(()=>{ setUser(u); setAnimateOut(false); },400);
  }
  function handleLogout() {
    setAnimateOut(true);
    setTimeout(()=>{ setUser(null); setAnimateOut(false); },400);
  }

  return (
    <div style={{opacity:animateOut?0:1,transition:"opacity 0.4s ease",height:"100vh",width:"100vw",overflow:"hidden"}}>
      {user
        ? <CRMDashboard user={user} onLogout={handleLogout}/>
        : <LoginPage onLogin={handleLogin}/>
      }
    </div>
  );
}
