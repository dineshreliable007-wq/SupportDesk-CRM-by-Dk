import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ── User Accounts ─────────────────────────────────────────────────────────────
const USERS = [
  { id:1, email:"admin@supportdesk.com",  password:"admin123",  name:"Dinesh Kumar", role:"Admin",              avatar:"D", color:"#6C63FF" },
  { id:2, email:"alice@supportdesk.com",  password:"alice123",  name:"Alice Kumar",  role:"Senior Engineer",    avatar:"A", color:"#00E396" },
  { id:3, email:"raj@supportdesk.com",    password:"raj123",    name:"Raj Mehta",    role:"Support Lead",       avatar:"R", color:"#FEB019" },
  { id:4, email:"priya@supportdesk.com",  password:"priya123",  name:"Priya Singh",  role:"Billing Specialist", avatar:"P", color:"#FF4560" },
  { id:5, email:"amit@supportdesk.com",   password:"amit123",   name:"Amit Sharma",  role:"Network Engineer",   avatar:"AM",color:"#FF8C00" },
];

// ── Escalation Rules ──────────────────────────────────────────────────────────
const DEFAULT_ESC_RULES = [
  { id:1, name:"P1 No Response",    priority:"P1",  triggerAfter:15, unit:"min", action:"Escalate to Senior Engineer", active:true,  escalateTo:"Alice Kumar"  },
  { id:2, name:"P2 Response SLA",   priority:"P2",  triggerAfter:60, unit:"min", action:"Escalate to Team Lead",       active:true,  escalateTo:"Raj Mehta"    },
  { id:3, name:"P3 Idle Ticket",    priority:"P3",  triggerAfter:4,  unit:"hrs", action:"Notify & Escalate",           active:true,  escalateTo:"Priya Singh"  },
  { id:4, name:"P4 Long Pending",   priority:"P4",  triggerAfter:8,  unit:"hrs", action:"Flag for Review",             active:false, escalateTo:"Neha Patel"   },
  { id:5, name:"Any Unresolved 24h",priority:"ALL", triggerAfter:24, unit:"hrs", action:"Escalate to Manager",         active:true,  escalateTo:"Raj Mehta"    },
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
  const [remember, setRemember] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(()=>{ setTimeout(()=>setMounted(true),100); },[]);

  function handleLogin() {
    setError("");
    if (!email||!password) { setError("Please enter email and password."); return; }
    setLoading(true);
    setTimeout(()=>{
      const user = USERS.find(u=>u.email===email&&u.password===password);
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

      {/* LEFT PANEL — Branding */}
      <div style={{
        flex:"0 0 46%", position:"relative", overflow:"hidden",
        background:"linear-gradient(135deg,#0a0818 0%,#0d0b22 50%,#080616 100%)",
        display:"flex",flexDirection:"column",justifyContent:"center",padding:"56px 52px",
        opacity:mounted?1:0,transform:mounted?"translateX(0)":"translateX(-24px)",
        transition:"opacity 0.7s ease,transform 0.7s ease",
      }}>
        {/* Grid background */}
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(108,99,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,0.06) 1px,transparent 1px)",backgroundSize:"48px 48px",pointerEvents:"none"}}/>
        {/* Glow orbs */}
        <div style={{position:"absolute",width:520,height:520,borderRadius:"50%",background:"radial-gradient(circle,rgba(108,99,255,0.18) 0%,transparent 65%)",top:"-120px",left:"-120px",pointerEvents:"none"}}/>
        <div style={{position:"absolute",width:360,height:360,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,227,150,0.1) 0%,transparent 65%)",bottom:"-80px",right:"-40px",pointerEvents:"none"}}/>
        <Particles/>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:52}}>
          <div style={{width:52,height:52,borderRadius:15,background:"linear-gradient(135deg,#6C63FF,#4a40e0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 8px 28px rgba(108,99,255,0.45)",animation:"glowPulse 3s ease infinite"}}>🎯</div>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:"#f0f0ff",letterSpacing:-0.3}}>SupportDesk CRM</div>
            <div style={{fontSize:11,color:"#6C63FF",fontWeight:600,letterSpacing:1.5,textTransform:"uppercase"}}>Enterprise · v3.0</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{marginBottom:40}}>
          <div style={{fontSize:38,fontWeight:900,color:"#f0f0ff",lineHeight:1.15,letterSpacing:-1,marginBottom:16}}>
            Support at the<br/>
            <span style={{background:"linear-gradient(90deg,#6C63FF,#00E396)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>speed of thought.</span>
          </div>
          <div style={{fontSize:15,color:"#555",lineHeight:1.65,maxWidth:340}}>
            Auto-escalation, real-time SLA tracking, and intelligent ticket routing — all in one powerful workspace.
          </div>
        </div>

        {/* Stats row */}
        <div style={{display:"flex",gap:20,marginBottom:48}}>
          {stats.map(s=>(
            <div key={s.label} style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 14px",textAlign:"center"}}>
              <div style={{fontSize:11,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:19,fontWeight:800,color:s.color,letterSpacing:-0.5}}>{s.value}</div>
              <div style={{fontSize:10,color:"#444",marginTop:3,lineHeight:1.3}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature list */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            ["🔺","Auto-Escalation Engine","Rules fire every 30s automatically"],
            ["📊","Live Analytics","Real-time charts and SLA insights"],
            ["👥","Team Management","Track agent performance at a glance"],
          ].map(([icon,title,desc])=>(
            <div key={title} style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:"rgba(108,99,255,0.12)",border:"1px solid rgba(108,99,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{icon}</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#c0c0e0"}}>{title}</div>
                <div style={{fontSize:11,color:"#444"}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div style={{position:"absolute",bottom:28,left:52,fontSize:11,color:"#2a2a4a"}}>© 2026 SupportDesk CRM · All rights reserved</div>
      </div>

      {/* Divider */}
      <div style={{width:1,background:"linear-gradient(to bottom,transparent,#1e1e3a 20%,#1e1e3a 80%,transparent)",flexShrink:0}}/>

      {/* RIGHT PANEL — Login form */}
      <div style={{
        flex:1,display:"flex",flexDirection:"column",justifyContent:"center",
        padding:"40px 52px",overflowY:"auto",
        opacity:mounted?1:0,transform:mounted?"translateX(0)":"translateX(24px)",
        transition:"opacity 0.7s ease 0.1s,transform 0.7s ease 0.1s",
      }}>
        <div style={{maxWidth:400,width:"100%",margin:"0 auto"}}>
          {/* Header */}
          <div style={{marginBottom:36}}>
            <div style={{fontSize:28,fontWeight:900,color:"#f0f0ff",letterSpacing:-0.5,marginBottom:6}}>Welcome back</div>
            <div style={{fontSize:14,color:"#444"}}>Sign in to access your workspace</div>
          </div>

          {/* Email */}
          <div style={{marginBottom:18}}>
            <label style={{fontSize:11,color:"#555",display:"block",marginBottom:7,textTransform:"uppercase",letterSpacing:1.2,fontWeight:600}}>Email Address</label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,opacity:0.5}}>✉️</span>
              <input className="login-input" type="email" value={email} onChange={e=>{setEmail(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="you@company.com"
                style={{width:"100%",background:"#0c0c1e",border:`1px solid ${error?"#FF4560":"#1e1e3a"}`,color:"#f0f0ff",borderRadius:12,padding:"13px 14px 13px 42px",fontSize:14,outline:"none",boxSizing:"border-box",transition:"all 0.2s"}}/>
            </div>
          </div>

          {/* Password */}
          <div style={{marginBottom:22}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <label style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1.2,fontWeight:600}}>Password</label>
              <span style={{fontSize:12,color:"#6C63FF",cursor:"pointer",fontWeight:600}}>Forgot password?</span>
            </div>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,opacity:0.5}}>🔒</span>
              <input className="login-input" type={showPass?"text":"password"} value={password} onChange={e=>{setPassword(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="Enter your password"
                style={{width:"100%",background:"#0c0c1e",border:`1px solid ${error?"#FF4560":"#1e1e3a"}`,color:"#f0f0ff",borderRadius:12,padding:"13px 42px 13px 42px",fontSize:14,outline:"none",boxSizing:"border-box",transition:"all 0.2s"}}/>
              <span onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:15,opacity:0.6,userSelect:"none"}}>{showPass?"🙈":"👁️"}</span>
            </div>
          </div>

          {/* Remember me */}
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:22}}>
            <div onClick={()=>setRemember(!remember)} style={{width:20,height:20,borderRadius:6,background:remember?"#6C63FF":"transparent",border:`2px solid ${remember?"#6C63FF":"#2a2a4a"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",flexShrink:0}}>
              {remember&&<span style={{fontSize:12,color:"#fff",fontWeight:900,lineHeight:1}}>✓</span>}
            </div>
            <span style={{fontSize:13,color:"#555",cursor:"pointer",userSelect:"none"}} onClick={()=>setRemember(!remember)}>Remember me for 30 days</span>
          </div>

          {/* Error */}
          {error&&<div style={{background:"#FF456015",border:"1px solid #FF456044",borderRadius:10,padding:"11px 14px",marginBottom:18,fontSize:12,color:"#FF4560",animation:"shake 0.4s ease",display:"flex",alignItems:"center",gap:6}}>⚠️ {error}</div>}

          {/* Sign In Button */}
          <button className="signin-btn" onClick={handleLogin} disabled={loading} style={{width:"100%",padding:"14px",background:loading?"#1a1a2e":"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:12,fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer",boxShadow:loading?"none":"0 4px 24px rgba(108,99,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:28,letterSpacing:0.3}}>
            {loading?(<><div style={{width:17,height:17,borderRadius:"50%",border:"2px solid #333",borderTopColor:"#6C63FF",animation:"spin 0.8s linear infinite"}}/>Signing in…</>):<>Sign In <span style={{opacity:0.7}}>→</span></>}
          </button>

          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
            <div style={{flex:1,height:1,background:"#1a1a2e"}}/>
            <span style={{fontSize:11,color:"#333",textTransform:"uppercase",letterSpacing:1}}>Quick Access</span>
            <div style={{flex:1,height:1,background:"#1a1a2e"}}/>
          </div>

          {/* Quick Login */}
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {USERS.map(u=>(
              <div key={u.id} className="quick-user" onClick={()=>quickLogin(u)}
                style={{display:"flex",alignItems:"center",gap:11,padding:"10px 13px",background:activeUser===u.id?"#0f0f22":"#0a0a1a",borderRadius:12,cursor:"pointer",border:`1px solid ${activeUser===u.id?"#3a3a6a":"#151528"}`}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:`${u.color}18`,border:`2px solid ${u.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:u.color,flexShrink:0}}>{u.avatar}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#d0d0ee",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{u.name}</div>
                  <div style={{fontSize:10,color:"#444"}}>{u.role}</div>
                </div>
                <div style={{fontSize:10,color:"#2a2a4a",fontFamily:"monospace",flexShrink:0}}>{u.email.split("@")[0]}</div>
                {activeUser===u.id&&<div style={{width:6,height:6,borderRadius:"50%",background:"#6C63FF",flexShrink:0}}/>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOP BAR
// ═══════════════════════════════════════════════════════════════════════════════
function TopBar({ user, onLogout, navButtons, onNavClick, onNewTicket }) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div style={{background:"rgba(10,10,26,0.97)",borderBottom:"1px solid #1e1e3a",padding:"11px 18px",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",position:"sticky",top:0,zIndex:200,backdropFilter:"blur(14px)"}}>
      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:9,marginRight:6}}>
        <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#6C63FF,#4a40e0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🎯</div>
        <div>
          <div style={{fontWeight:800,fontSize:13,color:"#f0f0ff"}}>SupportDesk CRM</div>
          <div style={{fontSize:10,color:"#444"}}>Live Auto-Escalation Engine</div>
        </div>
      </div>

      {/* Nav Buttons */}
      <div style={{display:"flex",gap:5,flex:1,flexWrap:"wrap"}}>
        {navButtons.map(b=>(
          <button key={b.key} onClick={()=>onNavClick(b.key)} style={{background:b.key==="escRules"?"#FF8C0018":"#12122a",border:`1px solid ${b.key==="escRules"?"#FF8C0044":"#2a2a4a"}`,color:b.key==="escRules"?"#FF8C00":"#aaa",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>
            {b.label}
          </button>
        ))}
      </div>

      {/* New Ticket */}
      <button onClick={onNewTicket} style={{background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:9,padding:"8px 16px",fontWeight:700,cursor:"pointer",fontSize:12}}>📞 New Ticket</button>

      {/* User Menu */}
      <div style={{position:"relative"}}>
        <div onClick={()=>setShowMenu(!showMenu)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"6px 10px",borderRadius:10,border:"1px solid #1e1e3a",background:"#0d0d1a"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor="#2a2a4a"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e3a"}>
          <div style={{width:28,height:28,borderRadius:"50%",background:`${user.color}22`,border:`2px solid ${user.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:user.color}}>{user.avatar}</div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:"#e0e0ff"}}>{user.name}</div>
            <div style={{fontSize:10,color:"#555"}}>{user.role}</div>
          </div>
          <span style={{fontSize:10,color:"#444"}}>▼</span>
        </div>
        {showMenu&&(
          <div style={{position:"absolute",right:0,top:"calc(100% + 8px)",background:"#0d0d1a",border:"1px solid #2a2a4a",borderRadius:12,padding:8,minWidth:180,boxShadow:"0 16px 40px rgba(0,0,0,0.5)",zIndex:300}}>
            <div style={{padding:"8px 12px",borderBottom:"1px solid #1e1e3a",marginBottom:6}}>
              <div style={{fontSize:12,fontWeight:700,color:"#e0e0ff"}}>{user.name}</div>
              <div style={{fontSize:11,color:"#555"}}>{user.email}</div>
            </div>
            {[["👤 My Profile"],["⚙️ Settings"],["🔒 Change Password"]].map(([label])=>(
              <div key={label} style={{padding:"8px 12px",borderRadius:8,cursor:"pointer",fontSize:13,color:"#aaa"}}
                onMouseEnter={e=>e.currentTarget.style.background="#12122a"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{label}</div>
            ))}
            <div style={{borderTop:"1px solid #1e1e3a",marginTop:6,paddingTop:6}}>
              <div onClick={()=>{setShowMenu(false);onLogout();}} style={{padding:"8px 12px",borderRadius:8,cursor:"pointer",fontSize:13,color:"#FF4560"}}
                onMouseEnter={e=>e.currentTarget.style.background="#FF456015"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>🚪 Sign Out</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function Toast({ toasts }) {
  return (
    <div style={{position:"fixed",bottom:24,right:24,zIndex:3000,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none"}}>
      {toasts.map(t=>(
        <div key={t.id} style={{background:t.type==="escalate"?"#FF456015":t.type==="breach"?"#FF8C0015":"#00E39615",border:`1px solid ${t.type==="escalate"?"#FF4560":t.type==="breach"?"#FF8C00":"#00E396"}`,borderRadius:12,padding:"12px 16px",maxWidth:320,animation:"toastIn 0.35s cubic-bezier(.175,.885,.32,1.275)"}}>
          <div style={{fontWeight:700,fontSize:13,color:t.type==="escalate"?"#FF4560":t.type==="breach"?"#FF8C00":"#00E396",marginBottom:3}}>
            {t.type==="escalate"?"🔺 Auto-Escalated":t.type==="breach"?"⚠️ SLA Breached":"✅ "+t.title}
          </div>
          <div style={{fontSize:12,color:"#bbb"}}>{t.message}</div>
        </div>
      ))}
    </div>
  );
}

function SLABar({ ticket, compact }) {
  const elapsed = getElapsed(ticket.created);
  const { response, resolution } = PRIORITIES[ticket.priority];
  const done = ticket.status==="Resolved"||ticket.status==="Closed";
  const breached = !done&&elapsed>response;
  const pct = Math.min(100,Math.round((elapsed/resolution)*100));
  if (compact) return (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <div style={{flex:1,background:"#1a1a2e",borderRadius:4,height:4}}>
        <div style={{height:4,borderRadius:4,width:`${pct}%`,background:pct<60?"#00E396":pct<85?"#FEB019":"#FF4560"}}/>
      </div>
      <span style={{fontSize:10,color:done?"#555":breached?"#FF4560":"#00E396",fontWeight:700,whiteSpace:"nowrap"}}>{done?"✓ Done":breached?"BREACH":"OK"}</span>
    </div>
  );
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:11,color:done?"#555":breached?"#FF4560":"#00E396",fontWeight:700}}>{done?"✓ RESOLVED":breached?"⚠ SLA BREACHED":"✓ WITHIN SLA"}</span>
        <span style={{fontSize:11,color:"#555"}}>{elapsed}m elapsed</span>
      </div>
      <div style={{background:"#1a1a2e",borderRadius:6,height:6}}>
        <div style={{height:6,borderRadius:6,width:`${pct}%`,background:pct<60?"#00E396":pct<85?"#FEB019":"#FF4560",transition:"width 0.4s"}}/>
      </div>
      <div style={{display:"flex",gap:10,marginTop:8}}>
        {[["Response",fmtMin(response)],["Resolution",fmtMin(resolution)]].map(([k,v])=>(
          <div key={k} style={{background:"#0a0a1c",borderRadius:8,padding:"6px 12px",flex:1,textAlign:"center"}}>
            <div style={{fontSize:10,color:"#444"}}>{k} SLA</div>
            <div style={{fontSize:14,fontWeight:800,color:"#a0a0ff"}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#0d0d1a",border:"1px solid #2a2a4a",borderRadius:18,width:"100%",maxWidth:wide?780:520,maxHeight:"93vh",overflowY:"auto",boxShadow:"0 30px 80px rgba(0,0,0,0.7)"}}>
        <div style={{padding:"16px 22px 13px",borderBottom:"1px solid #1e1e3a",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#0d0d1a",zIndex:10}}>
          <div style={{fontWeight:800,fontSize:15,color:"#f0f0ff"}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
        </div>
        <div style={{padding:"16px 22px 22px"}}>{children}</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:10,paddingBottom:6,borderBottom:"1px solid #1e1e3a"}}>{children}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESCALATION RULE EDITOR
// ═══════════════════════════════════════════════════════════════════════════════
function EscalationRuleEditor({ rules, onSave, onClose }) {
  const [local, setLocal] = useState(rules.map(r=>({...r})));
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  function startEdit(r) { setEditing(r.id); setForm({...r}); }
  function startAdd() {
    const newId = Math.max(...local.map(r=>r.id))+1;
    setForm({id:newId,name:"",priority:"P1",triggerAfter:30,unit:"min",action:"",escalateTo:AGENT_NAMES[0],active:true});
    setEditing("new");
  }
  function saveRule() {
    if (!form.name||!form.action) return;
    if (editing==="new") setLocal(prev=>[...prev,{...form}]);
    else setLocal(prev=>prev.map(r=>r.id===editing?{...form}:r));
    setEditing(null);
  }

  return (
    <Modal title="⚙️ Escalation Rule Engine" onClose={onClose} wide>
      <div style={{marginBottom:14,padding:"10px 14px",background:"#0a0a1c",borderRadius:10,border:"1px solid #6C63FF33",fontSize:12,color:"#aaa",lineHeight:1.6}}>
        🤖 <strong style={{color:"#6C63FF"}}>Auto-Escalation is LIVE</strong> — tickets matching active rules escalate every 30 seconds.
      </div>
      <div style={{marginBottom:14}}>
        {local.map(r=>(
          <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#0d0d1f",borderRadius:10,marginBottom:8,border:`1px solid ${r.active?"#2a2a5a":"#1a1a2e"}`,opacity:r.active?1:0.55}}>
            <div onClick={()=>setLocal(p=>p.map(x=>x.id===r.id?{...x,active:!x.active}:x))} style={{width:36,height:20,borderRadius:10,background:r.active?"#6C63FF":"#2a2a4a",cursor:"pointer",position:"relative",flexShrink:0,transition:"background 0.2s"}}>
              <div style={{position:"absolute",top:2,left:r.active?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontWeight:700,fontSize:13,color:"#e0e0ff"}}>{r.name||"Unnamed Rule"}</span>
                <span style={{fontSize:10,background:r.priority==="ALL"?"#6C63FF22":PRIORITIES[r.priority]?.bg,color:r.priority==="ALL"?"#6C63FF":PRIORITIES[r.priority]?.color,padding:"1px 7px",borderRadius:4,fontWeight:700}}>{r.priority}</span>
              </div>
              <div style={{fontSize:11,color:"#666"}}>After <span style={{color:"#FEB019",fontWeight:700}}>{r.triggerAfter} {r.unit}</span> → <span style={{color:"#aaa"}}>{r.action}</span> → <span style={{color:"#6C63FF"}}>{r.escalateTo}</span></div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button onClick={()=>startEdit(r)} style={{background:"#1e1e3a",border:"none",color:"#aaa",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12}}>✏️</button>
              <button onClick={()=>setLocal(p=>p.filter(x=>x.id!==r.id))} style={{background:"#FF456015",border:"none",color:"#FF4560",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12}}>🗑</button>
            </div>
          </div>
        ))}
        <button onClick={startAdd} style={{width:"100%",background:"#12122a",border:"1px dashed #2a2a5a",color:"#6C63FF",borderRadius:10,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:600}}>+ Add New Rule</button>
      </div>
      {editing!==null&&(
        <div style={{background:"#0a0a1c",borderRadius:12,padding:16,border:"1px solid #6C63FF44",marginBottom:14}}>
          <div style={{fontSize:12,color:"#6C63FF",fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>{editing==="new"?"New Rule":"Edit Rule"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[["Rule Name","name","text","e.g. P1 No Response"],["Action Description","action","text","e.g. Escalate to Senior Engineer"]].map(([label,key,type,ph])=>(
              <div key={key}>
                <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>{label}</label>
                <input value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph} type={type}
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
// AGENT PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════════
function AgentPerformance({ tickets, onClose }) {
  return (
    <Modal title="👥 Agent Performance" onClose={onClose} wide>
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
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#4a40e0)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,position:"relative",color:"#fff"}}>
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
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
              {[["Total",mine.length,"#6C63FF"],["Active",active,"#FEB019"],["Resolved",resolved,"#00E396"],["Avg",agent.avg+"m","#FF8C00"]].map(([k,v,c])=>(
                <div key={k} style={{background:"#12122a",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                  <div style={{fontSize:15,fontWeight:800,color:c}}>{v}</div>
                  <div style={{fontSize:10,color:"#555"}}>{k}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#1a1a2e",borderRadius:6,height:5}}>
              <div style={{height:5,borderRadius:6,width:`${(agent.rating/5)*100}%`,background:"linear-gradient(90deg,#6C63FF,#00E396)"}}/>
            </div>
          </div>
        );
      })}
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
                <span style={{fontSize:10,color:"#555"}}>{l.time}</span>
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
function TicketModal({ ticket, onClose, onUpdate }) {
  const [note,setNote]     = useState("");
  const [status,setStatus] = useState(ticket.status);
  const [agent,setAgent]   = useState(ticket.agent);
  function save() {
    const updated = {...ticket,status,agent,notes:note.trim()?[...ticket.notes,{text:note,time:new Date().toLocaleTimeString(),agent}]:ticket.notes};
    onUpdate(updated); setNote("");
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
      <button onClick={save} style={{marginTop:8,width:"100%",background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"10px",fontWeight:700,cursor:"pointer",fontSize:13}}>Save Changes</button>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEW TICKET MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function NewTicketModal({ onClose, onCreate }) {
  const [form,setForm] = useState({client:"",phone:"",subject:"",category:"Technical",priority:"P3",agent:AGENT_NAMES[0]});
  function handleCreate() {
    if (!form.client||!form.subject) return;
    onCreate(mkTicket({...form,escalationLog:[]})); onClose();
  }
  return (
    <Modal title="📞 New Support Ticket" onClose={onClose}>
      {[["Client Name *","client","Company name"],["Phone","phone","+91-XXXXXXXXXX"],["Subject *","subject","Brief description"]].map(([label,key,ph])=>(
        <div key={key} style={{marginBottom:10}}>
          <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>{label}</label>
          <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph}
            style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:13,boxSizing:"border-box",outline:"none"}}/>
        </div>
      ))}
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
      <div style={{marginBottom:16}}>
        <label style={{fontSize:10,color:"#555",display:"block",marginBottom:3,textTransform:"uppercase"}}>Assign To</label>
        <select value={form.agent} onChange={e=>setForm({...form,agent:e.target.value})} style={{width:"100%",background:"#12122a",border:"1px solid #2a2a4a",color:"#f0f0ff",borderRadius:8,padding:"8px 10px",fontSize:12}}>
          {AGENT_NAMES.map(a=><option key={a}>{a}</option>)}
        </select>
      </div>
      <button onClick={handleCreate} style={{width:"100%",background:"linear-gradient(135deg,#6C63FF,#4a40e0)",border:"none",color:"#fff",borderRadius:8,padding:"11px",fontWeight:700,cursor:"pointer",fontSize:13}}>Create Ticket</button>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CRM DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function CRMDashboard({ user, onLogout }) {
  const [tickets, setTickets]     = useState(INIT_TICKETS.map(t=>({...t,escalationLog:[]})));
  const [escRules, setEscRules]   = useState(DEFAULT_ESC_RULES);
  const [selected, setSelected]   = useState(null);
  const [modal, setModal]         = useState(null);
  const [search, setSearch]       = useState("");
  const [fStatus, setFStatus]     = useState("All");
  const [fPriority, setFPriority] = useState("All");
  const [toasts, setToasts]       = useState([]);
  const [escLog, setEscLog]       = useState([]);
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

  const filtered = tickets.filter(t=>{
    const s=search.toLowerCase();
    return (t.client.toLowerCase().includes(s)||t.subject.toLowerCase().includes(s)||t.id.toLowerCase().includes(s))
      &&(fStatus==="All"||t.status===fStatus)
      &&(fPriority==="All"||t.priority===fPriority);
  });

  const NAV = [
    {label:"⚙️ Escalation Rules",key:"escRules"},
    {label:"📊 Analytics",       key:"analytics"},
    {label:"📧 Email Rules",     key:"email"},
    {label:"👤 Client Portal",   key:"portal"},
    {label:"👥 Agents",          key:"agents"},
  ];

  return (
    <div style={{height:"100vh",overflow:"hidden",display:"flex",flexDirection:"column",background:"#07071a",fontFamily:"'DM Sans','Segoe UI',sans-serif",color:"#e0e0ff"}}>
      {/* Top Nav with user info */}
      <TopBar user={user} onLogout={onLogout} navButtons={NAV} onNavClick={setModal} onNewTicket={()=>setModal("new")}/>

      <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
        {/* Welcome Banner */}
        <div style={{marginBottom:14,padding:"12px 18px",background:"linear-gradient(135deg,#6C63FF12,#4a40e012)",border:"1px solid #6C63FF33",borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"#f0f0ff"}}>Welcome back, {user.name.split(" ")[0]}! 👋</div>
            <div style={{fontSize:12,color:"#555",marginTop:2}}>Role: <span style={{color:user.color,fontWeight:700}}>{user.role}</span> · {new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
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
          {[["Total",stats.total,"#6C63FF","🎫"],["Open",stats.open,"#6C63FF","📂"],["In Progress",stats.inProg,"#FEB019","⚙️"],["Escalated",stats.escalated,"#FF4560","🔺"],["SLA Breach",stats.breached,"#FF8C00","⚠️"],["Resolved",stats.resolved,"#00E396","✅"]].map(([k,v,c,icon])=>(
            <div key={k} style={{background:"#0d0d1a",border:`1px solid ${c}25`,borderRadius:12,padding:"12px 13px"}}>
              <div style={{fontSize:17,marginBottom:3}}>{icon}</div>
              <div style={{fontSize:22,fontWeight:800,color:c}}>{v}</div>
              <div style={{fontSize:10,color:"#555"}}>{k}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <input placeholder="🔍  Search…" value={search} onChange={e=>setSearch(e.target.value)}
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
                style={{padding:"11px 16px",display:"grid",gridTemplateColumns:"88px 1fr 140px 80px 110px 130px 160px",gap:8,alignItems:"center",
                  borderBottom:i<filtered.length-1?"1px solid #0f0f24":"none",cursor:"pointer",
                  background:t.escalated?"rgba(255,69,96,0.05)":breached?"rgba(255,140,0,0.04)":"transparent",
                  borderLeft:t.escalated?"3px solid #FF4560":breached?"3px solid #FF8C00":"3px solid transparent",transition:"background 0.12s"}}
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

      {/* Modals */}
      {selected            &&<TicketModal ticket={selected} onClose={()=>setSelected(null)} onUpdate={updateTicket}/>}
      {modal==="new"       &&<NewTicketModal onClose={()=>setModal(null)} onCreate={t=>{setTickets(prev=>[t,...prev]);addToast("resolve","Created","Ticket "+t.id+" created");}}/>}
      {modal==="escRules"  &&<EscalationRuleEditor rules={escRules} onSave={r=>{setEscRules(r);setModal(null);addToast("resolve","Saved","Escalation rules updated");}} onClose={()=>setModal(null)}/>}
      {modal==="analytics" &&<Analytics tickets={tickets} onClose={()=>setModal(null)}/>}
      {modal==="email"     &&<EmailPanel onClose={()=>setModal(null)}/>}
      {modal==="portal"    &&<ClientPortal tickets={tickets} onClose={()=>setModal(null)}/>}
      {modal==="agents"    &&<AgentPerformance tickets={tickets} onClose={()=>setModal(null)}/>}
      <Toast toasts={toasts}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP — Controls Login / Dashboard
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]         = useState(null);
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
