import { useState, useMemo } from "react";
import { Plus, Trash2, X, Building2, Users, Calendar, ShieldCheck, GraduationCap, AlertCircle, Edit3, ChevronLeft, LogOut, Settings, UserPlus, Key } from "lucide-react";

// ── Constants ─────────────────────────────────────────────────
const DAY_NAMES = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
const DAY_KEYS  = ["sun","mon","tue","wed","thu","fri","sat"];
const ROLES = { superadmin:"سوبر أدمن", admin:"أدمن", professor:"أستاذ" };

// ── Seed data ─────────────────────────────────────────────────
const SEED_USERS = [
  { id:"u1", username:"superadmin", password:"admin123", role:"superadmin", name:"المدير العام" },
  { id:"u2", username:"admin1",     password:"admin1",   role:"admin",      name:"د. خالد الراشد" },
  { id:"u3", username:"prof1",      password:"prof1",    role:"professor",  name:"د. سارة الكناني" },
];
const SEED_ROOMS = [
  { id:"r1", name:"قاعة A101", location:"المبنى أ – الطابق 1", capacity:40 },
  { id:"r2", name:"قاعة B205", location:"المبنى ب – الطابق 2", capacity:60 },
  { id:"r3", name:"المدرج الكبير", location:"المبنى الرئيسي",  capacity:150 },
];

// ── Helpers ───────────────────────────────────────────────────
const t2m = t => { const [h,m]=t.split(":").map(Number); return h*60+m; };
const m2t = m => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;
const overlap  = (s1,e1,s2,e2) => t2m(s1)<t2m(e2) && t2m(s2)<t2m(e1);
const dayOfStr = d => DAY_KEYS[new Date(d+"T00:00:00").getDay()];
const today    = () => { const d=new Date(); return new Date(d - d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
const uid      = p => p+"_"+Math.random().toString(36).slice(2,9);
const fmtDate  = d => { const x=new Date(d+"T00:00:00"); return DAY_NAMES[x.getDay()]+"، "+x.toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"}); };

// ── Persist helpers ───────────────────────────────────────────
const SK = { users:"univ-users", rooms:"univ-rooms", fixed:"univ-fixed", exams:"univ-exams", cfg:"univ-cfg" };
const save  = async (k,v) => { try{ await window.storage?.set(k,JSON.stringify(v),true); }catch(_){} };
const load  = async (k,fb) => { try{ const r=await window.storage?.get(k,true); if(r?.value) return JSON.parse(r.value); }catch(_){} return fb; };

// ── Inline styles ─────────────────────────────────────────────
const C = {
  navy:"#1E2A4A", navyLight:"#2d3f6e", green:"#7C9885", greenD:"#6a8773",
  orange:"#D97757", orangeD:"#c66647", bg:"#F4F6FA", card:"#fff",
  border:"#E8EBF0", muted:"#9098A3", text:"#1E2A4A", sub:"#5A6472",
  danger:"#e05252", dangerBg:"#fdf0f0",
};
const shadow = "0 1px 4px rgba(0,0,0,.08)";
const rad = 12;

// ═══════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════
export default function Root() {
  const [user, setUser] = useState(null);
  if (!user) return <LoginScreen onLogin={setUser} />;
  return <App user={user} onLogout={()=>setUser(null)} />;
}

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [users]    = useState(SEED_USERS);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    setErr("");
    const u = users.find(x => x.username===username.trim() && x.password===password);
    if (!u) { setErr("اسم المستخدم أو كلمة المرور غير صحيحة"); return; }
    onLogin(u);
  }

  return (
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",padding:16,fontFamily:"system-ui,sans-serif"}} dir="rtl">
      <div style={{background:C.card,borderRadius:20,padding:"32px 28px",width:"100%",maxWidth:360,boxShadow:"0 24px 64px rgba(0,0,0,.35)"}}>
        <div style={{width:52,height:52,background:C.navy,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18}}>
          <Building2 size={24} color="#fff"/>
        </div>
        <div style={{fontSize:22,fontWeight:800,color:C.navy,marginBottom:4}}>لوحة القاعات</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:24}}>نظام إدارة قاعات الجامعة</div>

        {err && <ErrBox msg={err}/>}

        <Lbl>اسم المستخدم</Lbl>
        <input value={username} onChange={e=>setUsername(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&submit()}
          placeholder="username" autoFocus
          style={{...inp, marginBottom:12}}/>

        <Lbl>كلمة المرور</Lbl>
        <input value={password} onChange={e=>setPassword(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&submit()}
          type="password" placeholder="••••••"
          style={{...inp, marginBottom:20}}/>

        <button onClick={submit} style={{...btnStyle(C.navy,"#fff"),width:"100%",justifyContent:"center",padding:"12px",fontSize:14}}>
          دخول
        </button>

        <div style={{marginTop:20,padding:"12px",background:C.bg,borderRadius:10,fontSize:11,color:C.muted,lineHeight:1.8}}>
          <div style={{fontWeight:700,marginBottom:4,color:C.sub}}>حسابات تجريبية:</div>
          <div>سوبر أدمن: <code>superadmin</code> / <code>admin123</code></div>
          <div>أدمن: <code>admin1</code> / <code>admin1</code></div>
          <div>أستاذ: <code>prof1</code> / <code>prof1</code></div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
function App({ user, onLogout }) {
  const [users,  setUsers]  = useState(SEED_USERS);
  const [rooms,  setRooms]  = useState(SEED_ROOMS);
  const [fixed,  setFixed]  = useState([]);
  const [exams,  setExams]  = useState([]);
  const [cfg,    setCfg]    = useState({open:"08:00",close:"16:00"});

  const [selRoom, setSelRoom] = useState(SEED_ROOMS[0].id);
  const [selDate, setSelDate] = useState(today());
  const [toast,   setToast]   = useState(null);
  const [view,    setView]    = useState("schedule"); // schedule | users | settings

  // modals
  const [roomModal,  setRoomModal]  = useState(null);
  const [fixedModal, setFixedModal] = useState(null);
  const [examModal,  setExamModal]  = useState(false);
  const [userModal,  setUserModal]  = useState(null);
  const [cfgModal,   setCfgModal]   = useState(false);

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const isSA    = user.role === "superadmin";
  const isAdmin = user.role === "admin" || isSA;
  const isProf  = user.role === "professor";

  // ── derived ──
  const room   = rooms.find(r=>r.id===selRoom);
  const dk     = dayOfStr(selDate);
  const fToday = useMemo(()=>fixed.filter(f=>f.roomId===selRoom && f.day===dk),[fixed,selRoom,dk]);
  const eToday = useMemo(()=>exams.filter(e=>e.roomId===selRoom && e.date===selDate),[exams,selRoom,selDate]);

  // ── conflict ──
  function hasConflict(roomId, date, start, end, skipFid, skipEid) {
    const dk2 = dayOfStr(date);
    for (const f of fixed) {
      if (f.id===skipFid || f.roomId!==roomId || f.day!==dk2) continue;
      if (overlap(start,end,f.start,f.end)) return `تعارض مع محاضرة "${f.title}"`;
    }
    for (const e of exams) {
      if (e.id===skipEid || e.roomId!==roomId || e.date!==date) continue;
      if (overlap(start,end,e.start,e.end)) return `تعارض مع امتحان "${e.title}"`;
    }
    return null;
  }

  // ── CRUD: rooms ──
  function saveRoom(d) {
    const next = d.id ? rooms.map(r=>r.id===d.id?d:r) : [...rooms,{...d,id:uid("r")}];
    setRooms(next); save(SK.rooms,next);
    if (!d.id) setSelRoom(next[next.length-1].id);
    setRoomModal(null); showToast(d.id?"تم تحديث القاعة":"تمت إضافة القاعة");
  }
  function delRoom(id) {
    const nr=rooms.filter(r=>r.id!==id), nf=fixed.filter(f=>f.roomId!==id), ne=exams.filter(e=>e.roomId!==id);
    setRooms(nr); setFixed(nf); setExams(ne);
    save(SK.rooms,nr); save(SK.fixed,nf); save(SK.exams,ne);
    setSelRoom(nr[0]?.id||null); showToast("تم حذف القاعة","warn");
  }

  // ── CRUD: fixed ──
  function saveFixed(d) {
    const err = hasConflict(selRoom, selDate, d.start, d.end, d.id, null);
    // also check same day across future dates already booked as exams
    if (err) { showToast(err,"err"); return false; }
    const item = {...d, id:d.id||uid("f"), roomId:selRoom};
    const next = d.id ? fixed.map(f=>f.id===d.id?item:f) : [...fixed,item];
    setFixed(next); save(SK.fixed,next);
    setFixedModal(null); showToast(d.id?"تم التحديث":"تمت الإضافة");
    return true;
  }
  function delFixed(id) {
    const next=fixed.filter(f=>f.id!==id); setFixed(next); save(SK.fixed,next);
    showToast("تم حذف المحاضرة","warn");
  }

  // ── CRUD: exams ──
  function saveExam(d) {
    const err = hasConflict(selRoom, d.date, d.start, d.end, null, null);
    if (err) { showToast(err,"err"); return false; }
    if (d.count && d.count > room.capacity) { showToast(`عدد الطلاب (${d.count}) يتجاوز سعة القاعة (${room.capacity})`,"err"); return false; }
    const item = {...d, id:uid("e"), roomId:selRoom};
    const next = [...exams, item]; setExams(next); save(SK.exams,next);
    setExamModal(false); showToast("تم تأكيد الحجز");
    return true;
  }
  function delExam(id) {
    const next=exams.filter(e=>e.id!==id); setExams(next); save(SK.exams,next);
    showToast("تم إلغاء الحجز","warn");
  }

  // ── CRUD: users ──
  function saveUser(d) {
    if (!d.id && users.find(u=>u.username===d.username)) { showToast("اسم المستخدم موجود مسبقاً","err"); return false; }
    const next = d.id ? users.map(u=>u.id===d.id?{...u,...d}:u) : [...users,{...d,id:uid("u")}];
    setUsers(next); save(SK.users,next);
    setUserModal(null); showToast(d.id?"تم التحديث":"تمت إضافة المستخدم");
    return true;
  }
  function delUser(id) {
    if (id===user.id) { showToast("لا يمكن حذف حسابك الحالي","err"); return; }
    const next=users.filter(u=>u.id!==id); setUsers(next); save(SK.users,next);
    showToast("تم حذف المستخدم","warn");
  }

  // ════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",maxWidth:900,margin:"0 auto"}} dir="rtl">

      {/* ── Header ── */}
      <div style={{background:C.navy,color:"#fff",padding:"0 16px",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,background:"rgba(255,255,255,.12)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Building2 size={18}/>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:14,lineHeight:1}}>لوحة القاعات</div>
              <div style={{fontSize:10,opacity:.6,marginTop:2}}>{user.name}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <RoleBadge role={user.role}/>
            {isSA && (
              <HdrBtn active={view==="users"} onClick={()=>setView(v=>v==="users"?"schedule":"users")}>
                <Users size={14}/>
              </HdrBtn>
            )}
            {isAdmin && (
              <HdrBtn active={view==="settings"} onClick={()=>setView(v=>v==="settings"?"schedule":"settings")}>
                <Settings size={14}/>
              </HdrBtn>
            )}
            <HdrBtn onClick={onLogout}><LogOut size={14}/></HdrBtn>
          </div>
        </div>
      </div>

      {/* ── Views ── */}
      <div style={{padding:"16px 12px"}}>

        {/* USERS VIEW */}
        {view==="users" && isSA && (
          <div>
            <SectionHeader title="إدارة المستخدمين" action={<Btn primary small onClick={()=>setUserModal({})}><Plus size={13}/> مستخدم جديد</Btn>}/>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {users.map(u=>(
                <div key={u.id} style={{...cardStyle,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:roleColor(u.role)+"22",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {u.role==="superadmin"?<ShieldCheck size={16} color={roleColor(u.role)}/>:
                       u.role==="admin"?<Key size={16} color={roleColor(u.role)}/>:
                       <GraduationCap size={16} color={roleColor(u.role)}/>}
                    </div>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:C.text}}>{u.name}</div>
                      <div style={{fontSize:11,color:C.muted}}>@{u.username} · {ROLES[u.role]}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {u.id!==user.id && <>
                      <Btn small onClick={()=>setUserModal(u)}><Edit3 size={12}/></Btn>
                      <Btn small danger onClick={()=>delUser(u.id)}><Trash2 size={12}/></Btn>
                    </>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {view==="settings" && isAdmin && (
          <div>
            <SectionHeader title="إعدادات النظام"/>
            <div style={cardStyle}>
              <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:16}}>ساعات الدوام الرسمي</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                <div><Lbl>من الساعة</Lbl><input type="time" value={cfg.open} onChange={e=>setCfg(c=>({...c,open:e.target.value}))} style={inp}/></div>
                <div><Lbl>إلى الساعة</Lbl><input type="time" value={cfg.close} onChange={e=>setCfg(c=>({...c,close:e.target.value}))} style={inp}/></div>
              </div>
              <Btn primary onClick={()=>{save(SK.cfg,cfg);showToast("تم الحفظ");}}>حفظ الإعدادات</Btn>
            </div>
          </div>
        )}

        {/* SCHEDULE VIEW */}
        {view==="schedule" && (
          <>
            {/* Room list */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontWeight:700,fontSize:15,color:C.text}}>القاعات</div>
              {isAdmin && <Btn primary small onClick={()=>setRoomModal({})}><Plus size={13}/> قاعة</Btn>}
            </div>

            {/* Horizontal scroll room tabs on mobile */}
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:16,
              scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
              {rooms.map(r=>(
                <button key={r.id} onClick={()=>setSelRoom(r.id)} style={{
                  flexShrink:0,padding:"8px 14px",borderRadius:999,border:"none",cursor:"pointer",
                  background:selRoom===r.id?C.navy:C.card,
                  color:selRoom===r.id?"#fff":C.sub,
                  fontWeight:selRoom===r.id?700:500,fontSize:13,
                  boxShadow:selRoom===r.id?"none":shadow,
                  whiteSpace:"nowrap",
                }}>
                  {r.name}
                  <span style={{fontSize:10,opacity:.7,marginRight:5}}>({r.capacity})</span>
                </button>
              ))}
            </div>

            {!room ? (
              <div style={{...cardStyle,textAlign:"center",padding:"40px 20px",color:C.muted}}>اختر قاعة</div>
            ) : (
              <>
                {/* Room card */}
                <div style={{...cardStyle,marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:18,color:C.text}}>{room.name}</div>
                      <div style={{fontSize:12,color:C.muted,marginTop:2}}>{room.location}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{background:C.bg,borderRadius:999,padding:"4px 10px",fontSize:12,color:C.sub,display:"flex",alignItems:"center",gap:4}}>
                        <Users size={12}/>{room.capacity}
                      </span>
                      {isAdmin && <>
                        <Btn small onClick={()=>setRoomModal(room)}><Edit3 size={12}/></Btn>
                        <Btn small danger onClick={()=>delRoom(room.id)}><Trash2 size={12}/></Btn>
                      </>}
                    </div>
                  </div>

                  {/* Date picker */}
                  <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <Calendar size={14} color={C.muted}/>
                    <input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)}
                      style={{...inp,width:"auto",padding:"6px 10px",fontSize:12}}/>
                    <span style={{fontSize:12,color:C.sub}}>{fmtDate(selDate)}</span>
                  </div>

                  {/* Action buttons */}
                  <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
                    {isAdmin && (
                      <Btn green onClick={()=>setFixedModal({})} style={{flex:1,justifyContent:"center"}}>
                        <Plus size={14}/> محاضرة ثابتة
                      </Btn>
                    )}
                    <Btn orange onClick={()=>setExamModal(true)} style={{flex:1,justifyContent:"center"}}>
                      <Plus size={14}/> حجز امتحان
                    </Btn>
                  </div>
                </div>

                {/* Legend */}
                <div style={{display:"flex",gap:12,marginBottom:12,fontSize:11,color:C.sub}}>
                  <span style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{width:10,height:10,borderRadius:2,background:C.green,display:"inline-block"}}/> محاضرة ثابتة
                  </span>
                  <span style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{width:10,height:10,borderRadius:2,background:C.orange,display:"inline-block"}}/> امتحان / حجز
                  </span>
                </div>

                {/* Timeline */}
                <Timeline
                  open={cfg.open} close={cfg.close}
                  fixedItems={fToday} examItems={eToday}
                  isAdmin={isAdmin}
                  onEditFixed={f=>setFixedModal(f)}
                  onDelFixed={delFixed}
                  onDelExam={delExam}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {roomModal!==null  && <RoomModal  room={roomModal?.id?roomModal:null} onSave={saveRoom} onClose={()=>setRoomModal(null)}/>}
      {fixedModal!==null && room && <FixedModal item={fixedModal?.id?fixedModal:null} selDate={selDate} open={cfg.open} close={cfg.close} roomName={room.name} onSave={saveFixed} onClose={()=>setFixedModal(null)}/>}
      {examModal  && room && <ExamModal room={room} defDate={selDate} open={cfg.open} close={cfg.close} userName={user.name} onSave={saveExam} onClose={()=>setExamModal(false)}/>}
      {userModal!==null  && <UserModal  user={userModal?.id?userModal:null} onSave={saveUser} onClose={()=>setUserModal(null)}/>}

      {/* ── Toast ── */}
      {toast && (
        <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",
          background:toast.type==="err"?C.danger:toast.type==="warn"?"#5A6472":C.navy,
          color:"#fff",padding:"10px 18px",borderRadius:99,fontSize:13,fontWeight:600,
          boxShadow:"0 4px 20px rgba(0,0,0,.25)",zIndex:200,display:"flex",alignItems:"center",gap:6,
          whiteSpace:"nowrap",maxWidth:"calc(100vw - 40px)",textAlign:"center"}}>
          {toast.type==="err"&&<AlertCircle size={14}/>}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TIMELINE
// ═══════════════════════════════════════════════════════════════
function Timeline({open,close,fixedItems,examItems,isAdmin,onEditFixed,onDelFixed,onDelExam}) {
  const S=t2m(open), E=t2m(close), PX=1.8;
  const H=(E-S)*PX;
  const hours=[];
  for(let m=S;m<=E;m+=60) hours.push(m);

  const items=[
    ...fixedItems.map(f=>({...f,kind:"fixed"})),
    ...examItems.map(e=>({...e,kind:"exam"})),
  ].sort((a,b)=>t2m(a.start)-t2m(b.start));

  return (
    <div style={{...cardStyle,padding:0,overflow:"hidden"}}>
      <div style={{display:"flex"}}>
        {/* time col */}
        <div style={{width:44,flexShrink:0,position:"relative",height:H,borderLeft:`1px solid ${C.border}`,background:"#fafafa"}}>
          {hours.map(m=>(
            <div key={m} style={{position:"absolute",top:(m-S)*PX-8,right:0,left:0,
              padding:"0 4px",fontSize:9,color:C.muted,textAlign:"center",lineHeight:1}}>
              {m2t(m)}
            </div>
          ))}
        </div>
        {/* grid */}
        <div style={{flex:1,position:"relative",height:H}}>
          {hours.map(m=>(
            <div key={m} style={{position:"absolute",top:(m-S)*PX,right:0,left:0,
              borderTop:`1px solid ${C.border}`}}/>
          ))}
          {items.length===0 && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:12,color:C.muted,textAlign:"center",padding:"0 16px"}}>
              القاعة متاحة — لا توجد محاضرات أو حجوزات
            </div>
          )}
          {items.map(item=>{
            const s=Math.max(t2m(item.start),S), e=Math.min(t2m(item.end),E);
            if(e<=s) return null;
            const top=(s-S)*PX, h=Math.max((e-s)*PX,32);
            const isF=item.kind==="fixed";
            const bg=isF?C.green:C.orange;
            return(
              <div key={item.id} style={{position:"absolute",top,right:6,left:6,height:h,
                background:bg,borderRadius:8,padding:"5px 8px",color:"#fff",overflow:"hidden",
                display:"flex",flexDirection:"column",justifyContent:"center"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:4}}>
                  <div style={{overflow:"hidden",flex:1}}>
                    <div style={{fontWeight:700,fontSize:11,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                      {item.title}
                    </div>
                    {h>28&&<div style={{fontSize:10,opacity:.85,marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                      {isF?item.instructor:`منظّم: ${item.organizer}`}
                    </div>}
                    {h>46&&<div style={{fontSize:9,opacity:.7,marginTop:1}}>{item.start}–{item.end}</div>}
                  </div>
                  <div style={{display:"flex",gap:2,flexShrink:0}}>
                    {isF&&isAdmin&&<IBtn onClick={()=>onEditFixed(item)}><Edit3 size={10}/></IBtn>}
                    {(isF?isAdmin:true)&&<IBtn onClick={()=>isF?onDelFixed(item.id):onDelExam(item.id)}><Trash2 size={10}/></IBtn>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════
function ModalWrap({title,onClose,accent=C.navy,children}) {
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",
      alignItems:"flex-end",justifyContent:"center",zIndex:100,padding:0}} dir="rtl"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.card,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:540,
        maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 40px rgba(0,0,0,.2)",
        borderTop:`4px solid ${accent}`,fontFamily:"system-ui,sans-serif"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"14px 18px 10px",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,background:C.card,zIndex:1}}>
          <div style={{fontWeight:800,fontSize:15,color:C.text}}>{title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,display:"flex",padding:4}}>
            <X size={18}/>
          </button>
        </div>
        <div style={{padding:"16px 18px 28px"}}>{children}</div>
      </div>
    </div>
  );
}

// Room modal
function RoomModal({room,onSave,onClose}) {
  const [name,setName]=useState(room?.name||"");
  const [loc, setLoc] =useState(room?.location||"");
  const [cap, setCap] =useState(room?.capacity||30);
  const [err, setErr] =useState("");
  function submit(){
    if(!name.trim()){setErr("أدخل اسم القاعة");return;}
    onSave({...(room||{}),name:name.trim(),location:loc.trim(),capacity:Number(cap)||30});
  }
  return(
    <ModalWrap title={room?"تعديل القاعة":"إضافة قاعة جديدة"} onClose={onClose}>
      <ErrBox msg={err}/>
      <Lbl>اسم القاعة *</Lbl><input value={name} onChange={e=>setName(e.target.value)} style={{...inp,marginBottom:12}} placeholder="مثال: قاعة A101"/>
      <Lbl>الموقع</Lbl><input value={loc} onChange={e=>setLoc(e.target.value)} style={{...inp,marginBottom:12}} placeholder="مثال: المبنى أ – الطابق 1"/>
      <Lbl>السعة (عدد الطلاب)</Lbl><input type="number" min="1" value={cap} onChange={e=>setCap(e.target.value)} style={{...inp,marginBottom:20}}/>
      <Btn primary onClick={submit} style={{width:"100%",justifyContent:"center",padding:"12px"}}>
        {room?"حفظ التعديلات":"إضافة القاعة"}
      </Btn>
    </ModalWrap>
  );
}

// Fixed schedule modal — one slot per entry (day + time)
function FixedModal({item,selDate,open,close,roomName,onSave,onClose}) {
  const [title, setTitle] = useState(item?.title||"");
  const [instr, setInstr] = useState(item?.instructor||"");
  const [day,   setDay]   = useState(item?.day||dayOfStr(selDate));
  const [start, setStart] = useState(item?.start||open);
  const [end,   setEnd]   = useState(item?.end||m2t(t2m(open)+90));
  const [err,   setErr]   = useState("");

  function submit(){
    setErr("");
    if(!title.trim()||!instr.trim()){setErr("أدخل اسم المادة واسم المحاضر");return;}
    if(t2m(start)>=t2m(end)){setErr("وقت النهاية يجب أن يكون بعد البداية");return;}
    if(t2m(start)<t2m(open)||t2m(end)>t2m(close)){setErr(`الوقت خارج ساعات الدوام (${open}–${close})`);return;}
    const ok=onSave({...(item||{}),title:title.trim(),instructor:instr.trim(),day,start,end});
    if(ok===false) setErr("يوجد تعارض في الوقت، راجع الجدول");
  }
  return(
    <ModalWrap title={item?"تعديل محاضرة":"إضافة محاضرة ثابتة"} onClose={onClose} accent={C.green}>
      <div style={{fontSize:12,color:C.muted,marginBottom:14}}>القاعة: <b style={{color:C.text}}>{roomName}</b></div>
      <ErrBox msg={err}/>
      <Lbl>اسم المادة / المحاضرة *</Lbl>
      <input value={title} onChange={e=>setTitle(e.target.value)} style={{...inp,marginBottom:12}} placeholder="مثال: قواعد البيانات"/>
      <Lbl>اسم المحاضر *</Lbl>
      <input value={instr} onChange={e=>setInstr(e.target.value)} style={{...inp,marginBottom:12}} placeholder="مثال: د. سارة الكناني"/>
      <Lbl>اليوم</Lbl>
      <select value={day} onChange={e=>setDay(e.target.value)} style={{...inp,marginBottom:12}}>
        {DAY_KEYS.map((d,i)=><option key={d} value={d}>{DAY_NAMES[i]}</option>)}
      </select>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        <div><Lbl>من</Lbl><input type="time" value={start} onChange={e=>setStart(e.target.value)} style={inp}/></div>
        <div><Lbl>إلى</Lbl><input type="time" value={end} onChange={e=>setEnd(e.target.value)} style={inp}/></div>
      </div>
      <Btn green onClick={submit} style={{width:"100%",justifyContent:"center",padding:"12px"}}>
        {item?"حفظ التعديلات":"إضافة إلى الجدول الثابت"}
      </Btn>
      <div style={{fontSize:11,color:C.muted,marginTop:10,textAlign:"center"}}>
        لإضافة وقت مختلف لنفس المادة في يوم آخر، أضف إدخالاً جديداً
      </div>
    </ModalWrap>
  );
}

// Exam modal
function ExamModal({room,defDate,open,close,userName,onSave,onClose}) {
  const [title, setTitle] = useState("");
  const [org,   setOrg]   = useState(userName||"");
  const [date,  setDate]  = useState(defDate);
  const [start, setStart] = useState(open);
  const [end,   setEnd]   = useState(m2t(t2m(open)+120));
  const [count, setCount] = useState("");
  const [err,   setErr]   = useState("");

  function submit(){
    setErr("");
    if(!title.trim()||!org.trim()||!date){setErr("يرجى تعبئة الحقول المطلوبة");return;}
    if(t2m(start)>=t2m(end)){setErr("وقت النهاية يجب أن يكون بعد البداية");return;}
    if(t2m(start)<t2m(open)||t2m(end)>t2m(close)){setErr(`الوقت خارج ساعات الدوام (${open}–${close})`);return;}
    const ok=onSave({title:title.trim(),organizer:org.trim(),date,start,end,count:count?Number(count):null});
    if(ok===false) setErr("يوجد تعارض في الوقت أو تجاوز السعة");
  }
  return(
    <ModalWrap title="حجز القاعة لامتحان" onClose={onClose} accent={C.orange}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.muted,marginBottom:14}}>
        <span>القاعة: <b style={{color:C.text}}>{room.name}</b></span>
        <span>السعة: <b style={{color:C.text}}>{room.capacity}</b></span>
      </div>
      <ErrBox msg={err}/>
      <Lbl>اسم الامتحان / المادة *</Lbl>
      <input value={title} onChange={e=>setTitle(e.target.value)} style={{...inp,marginBottom:12}} placeholder="مثال: امتحان نهاية الفصل – رياضيات"/>
      <Lbl>اسم المنظّم (الحاجز) *</Lbl>
      <input value={org} onChange={e=>setOrg(e.target.value)} style={{...inp,marginBottom:12}}/>
      <Lbl>تاريخ الامتحان *</Lbl>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...inp,marginBottom:12}}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div><Lbl>من</Lbl><input type="time" value={start} onChange={e=>setStart(e.target.value)} style={inp}/></div>
        <div><Lbl>إلى</Lbl><input type="time" value={end} onChange={e=>setEnd(e.target.value)} style={inp}/></div>
      </div>
      <Lbl>عدد الطلاب (اختياري)</Lbl>
      <input type="number" min="1" value={count} onChange={e=>setCount(e.target.value)} style={{...inp,marginBottom:20}} placeholder={`حتى ${room.capacity}`}/>
      <Btn orange onClick={submit} style={{width:"100%",justifyContent:"center",padding:"12px"}}>تأكيد الحجز</Btn>
    </ModalWrap>
  );
}

// User modal
function UserModal({user,onSave,onClose}) {
  const [name,     setName]     = useState(user?.name||"");
  const [username, setUsername] = useState(user?.username||"");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState(user?.role||"professor");
  const [err,      setErr]      = useState("");

  function submit(){
    setErr("");
    if(!name.trim()||!username.trim()){setErr("أدخل الاسم واسم المستخدم");return;}
    if(!user&&!password.trim()){setErr("أدخل كلمة المرور");return;}
    const d={...(user||{}),name:name.trim(),username:username.trim(),role};
    if(password.trim()) d.password=password.trim();
    const ok=onSave(d);
    if(ok===false) setErr("اسم المستخدم مستخدم مسبقاً");
  }
  return(
    <ModalWrap title={user?"تعديل المستخدم":"إضافة مستخدم جديد"} onClose={onClose}>
      <ErrBox msg={err}/>
      <Lbl>الاسم الكامل *</Lbl>
      <input value={name} onChange={e=>setName(e.target.value)} style={{...inp,marginBottom:12}} placeholder="مثال: د. أحمد العبيدي"/>
      <Lbl>اسم المستخدم *</Lbl>
      <input value={username} onChange={e=>setUsername(e.target.value)} style={{...inp,marginBottom:12}} placeholder="مثال: ahmed123" disabled={!!user}/>
      <Lbl>{user?"كلمة مرور جديدة (اتركه فارغاً للإبقاء)":"كلمة المرور *"}</Lbl>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{...inp,marginBottom:12}}/>
      <Lbl>الدور</Lbl>
      <select value={role} onChange={e=>setRole(e.target.value)} style={{...inp,marginBottom:20}}>
        <option value="superadmin">سوبر أدمن</option>
        <option value="admin">أدمن</option>
        <option value="professor">أستاذ</option>
      </select>
      <Btn primary onClick={submit} style={{width:"100%",justifyContent:"center",padding:"12px"}}>
        {user?"حفظ التعديلات":"إضافة المستخدم"}
      </Btn>
    </ModalWrap>
  );
}

// ═══════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════════
function SectionHeader({title,action}) {
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div style={{fontWeight:800,fontSize:15,color:C.text}}>{title}</div>
      {action}
    </div>
  );
}
function RoleBadge({role}) {
  const color=roleColor(role);
  return(
    <div style={{background:"rgba(255,255,255,.12)",borderRadius:99,padding:"4px 10px",fontSize:11,display:"flex",alignItems:"center",gap:5}}>
      {role==="superadmin"?<ShieldCheck size={12}/>:role==="admin"?<Key size={12}/>:<GraduationCap size={12}/>}
      {ROLES[role]}
    </div>
  );
}
function HdrBtn({children,onClick,active}) {
  return(
    <button onClick={onClick} style={{background:active?"rgba(255,255,255,.25)":"rgba(255,255,255,.1)",
      border:"none",borderRadius:8,padding:"7px 8px",cursor:"pointer",color:"#fff",display:"flex",alignItems:"center"}}>
      {children}
    </button>
  );
}
function Btn({children,onClick,primary,green,orange,danger,small,style={}}) {
  let bg=C.bg, color=C.sub;
  if(primary){bg=C.navy;color="#fff";}
  if(green)  {bg=C.green;color="#fff";}
  if(orange) {bg=C.orange;color="#fff";}
  if(danger) {bg:C.dangerBg;color=C.danger;bg="#fdeaea";}
  return(
    <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:5,
      background:bg,color,border:"none",borderRadius:8,cursor:"pointer",
      padding:small?"5px 8px":"8px 14px",fontSize:small?11:13,fontWeight:600,...style}}>
      {children}
    </button>
  );
}
function IBtn({children,onClick}) {
  return(
    <button onClick={onClick} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:4,
      padding:3,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",flexShrink:0}}>
      {children}
    </button>
  );
}
function ErrBox({msg}) {
  if(!msg) return null;
  return(
    <div style={{background:"#fdeaea",borderRadius:8,padding:"8px 12px",fontSize:12,color:C.danger,
      display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
      <AlertCircle size={13}/>{msg}
    </div>
  );
}
function Lbl({children}) {
  return <div style={{fontSize:12,fontWeight:600,color:C.sub,marginBottom:5}}>{children}</div>;
}
const roleColor = r => r==="superadmin"?C.navy:r==="admin"?C.green:C.orange;
const cardStyle = {background:C.card,borderRadius:rad,padding:14,boxShadow:shadow,marginBottom:0};
const btnStyle  = (bg,color) => ({display:"inline-flex",alignItems:"center",gap:6,background:bg,color,
  border:"none",borderRadius:9,cursor:"pointer",padding:"8px 16px",fontSize:13,fontWeight:700});
const inp = {width:"100%",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 12px",
  fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"system-ui,sans-serif",
  background:"#fff",color:C.text};
