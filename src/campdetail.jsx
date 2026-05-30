// Camp Detail — Squad status + Daily wellness (AM/PM sessions)
// Matches TWNFT Readiness Form: Stress · Sleep · Appetite · Wellness · Soreness · Desire (all 1-10)
// + Post-session: RPE (1-10) · Duration (min) · Daily Load = Duration × RPE

const STATUS_OPTIONS = [
  { key: 'available', label: 'Available', emoji: '✅', color: '#22c55e' },
  { key: 'injured',   label: 'Injured',   emoji: '🤕', color: '#ef4444' },
  { key: 'sick',      label: 'Sick',      emoji: '🤒', color: '#f59e0b' },
  { key: 'resting',   label: 'Resting',   emoji: '😴', color: '#818cf8' },
  { key: 'absent',    label: 'Absent',    emoji: '❌', color: '#6b7280' },
];

// Pre-training readiness metrics (all 1-10, 10 = best)
const PRE_COLS = [
  { key: 'stress',   label: 'Stress',   emoji: '🧠', hint: '1 = very stressed  10 = no stress at all' },
  { key: 'sleep',    label: 'Sleep',    emoji: '😴', hint: '1 = no sleep (<4h)  10 = great sleep (7-8h)' },
  { key: 'appetite', label: 'Appetite', emoji: '🍽', hint: '1 = not hungry  10 = starving' },
  { key: 'mood',     label: 'Wellness', emoji: '💊', hint: '1 = very ill  10 = 100% healthy' },
  { key: 'soreness', label: 'Soreness', emoji: '💪', hint: '1 = very sore  10 = no soreness' },
  { key: 'desire',   label: 'Desire',   emoji: '🔥', hint: '1 = no desire to train  10 = very motivated' },
];

function cdFmtDate(start, end) {
  const fmt = s => { const d = new Date(s+'T00:00:00'); return isNaN(d)?s:d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); };
  if (!start&&!end) return null;
  if (start&&!end) return fmt(start);
  if (!start&&end) return `– ${fmt(end)}`;
  return `${fmt(start)} – ${fmt(end)}`;
}
function todayStr()     { return new Date().toISOString().slice(0,10); }
function addDays(ds,n)  { const d=new Date(ds+'T00:00:00'); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }
function prettyDate(ds) { const d=new Date(ds+'T00:00:00'); return isNaN(d)?ds:d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}); }

// Colour for a 1-10 score (10=green, 1=red)
function scoreColor(v) {
  if (!v) return 'transparent';
  if (v >= 8) return '#16a34a';
  if (v >= 5) return '#ca8a04';
  return '#dc2626';
}

// ── Metric Input (1-10, coloured) ────────────────────────────────────────────
function MetricInput({ value, onChange }) {
  const col = scoreColor(value);
  return (
    <input
      type="number" min="0" max="10" step="1"
      className="cd-metric-input"
      style={value ? { borderColor: col, color: col, background: col+'18' } : {}}
      value={value || ''}
      placeholder="–"
      onChange={e => {
        const v = Math.min(10, Math.max(0, Number(e.target.value)||0));
        onChange(v);
      }}
    />
  );
}

// ── RPE coloured buttons ──────────────────────────────────────────────────────
function rpeColor(n) {
  if (n<=2) return '#22c55e'; if (n<=4) return '#84cc16';
  if (n<=6) return '#f59e0b'; if (n<=8) return '#f97316';
  return '#ef4444';
}
function rpeLabel(n) {
  return ['','Minimal','Very easy','Easy','Light','Medium','Almost hard','Hard','Very hard','Extremely tough','Death session'][n]||'';
}

// ── CSV helpers ───────────────────────────────────────────────────────────────
function exportCsv(camp, campPlayers, campShirts, wMap, date, session) {
  const header = [
    'Date','Session','First Name','Nickname','Position','#Shirt',
    'Stress','Sleep','Appetite','Wellness','Soreness','Desire','Total',
    'Duration (min)','RPE','Daily Load','Notes'
  ];
  const rows = campPlayers.map(p => {
    const w = wMap.get(`${date}_${session}_${p.id}`) || {};
    const stress   = w.stress   || 0;
    const sleep    = w.sleep    || 0;
    const appetite = w.appetite || 0;
    const wellness = w.mood     || 0;
    const soreness = w.soreness || 0;
    const desire   = w.desire   || 0;
    const total    = stress+sleep+appetite+wellness+soreness+desire;
    const rpe      = w.rpe      || 0;
    const duration = w.duration || 0;
    const load     = rpe && duration ? rpe*duration : 0;
    return [
      date, session,
      p.name, p.nick||'', p.pos,
      campShirts[p.id] ?? '',
      stress||'', sleep||'', appetite||'', wellness||'', soreness||'', desire||'',
      total||'',
      duration||'', rpe||'', load||'',
      w.notes||'',
    ];
  });
  const csv = [header,...rows]
    .map(r => r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿'+csv], {type:'text/csv;charset=utf-8'});
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `readiness_${date}_${session}.csv`;
  a.click();
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  return lines.map(line => {
    const fields=[]; let cur='',inQ=false;
    for (let i=0;i<line.length;i++) {
      const ch=line[i];
      if (ch==='"') { if(inQ&&line[i+1]==='"'){cur+='"';i++;}else inQ=!inQ; }
      else if (ch===','&&!inQ) { fields.push(cur.trim()); cur=''; }
      else cur+=ch;
    }
    fields.push(cur.trim());
    return fields;
  });
}

async function importCsv(file, campId, campPlayers, onImported) {
  const text  = await file.text();
  const rows  = parseCsv(text);
  if (rows.length < 2) return { ok:false, msg:'File is empty' };

  const header = rows[0].map(h=>h.toLowerCase().replace(/[^a-z_]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,''));
  const idx    = k => header.indexOf(k);

  // Build a lookup by nickname or name to find player_id
  const byNick = new Map(campPlayers.map(p=>[p.nick?.toLowerCase(), p.id]).filter(([k])=>k));
  const byName = new Map(campPlayers.map(p=>[p.name?.toLowerCase(), p.id]));

  const entries=[];
  for (let i=1;i<rows.length;i++) {
    const r=rows[i];
    if (r.length<3) continue;

    // Try to resolve player_id from nickname or first name
    const nick = (r[idx('nickname')]||r[idx('nick')]||'').toLowerCase();
    const name = (r[idx('first_name')]||r[idx('name')]||'').toLowerCase();
    const pid  = byNick.get(nick) || byName.get(name);
    if (!pid) continue;

    const sessionDate = r[idx('date')]||'';
    const session     = (r[idx('session')]||'AM').toUpperCase();
    if (!sessionDate) continue;

    const stress   = Number(r[idx('stress')])   ||0;
    const sleep    = Number(r[idx('sleep')])    ||0;
    const appetite = Number(r[idx('appetite')]) ||0;
    const wellness = Number(r[idx('wellness')]) ||0;
    const soreness = Number(r[idx('soreness')]) ||0;
    const desire   = Number(r[idx('desire')])   ||0;
    const rpe      = Number(r[idx('rpe')])      ||0;
    const duration = Number(r[idx('duration_min')]||r[idx('duration')]||0)||0;
    const notes    = r[idx('notes')]||'';

    entries.push({ camp_id:campId, player_id:pid, session_date:sessionDate, session,
      stress, sleep, appetite, mood:wellness, soreness, desire, rpe, duration, notes });
  }

  if (!entries.length) return { ok:false, msg:'No matching players found — check nicknames match your roster' };

  await Promise.all(entries.map(e =>
    fetch('/api/camp-wellness',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(e)})
  ));
  onImported(entries);
  return { ok:true, count:entries.length };
}

// ══════════════════════════════════════════════════════════════════════════════
// SESSION TAB
// ══════════════════════════════════════════════════════════════════════════════
function SessionTab({ camp, campPlayers, campShirts }) {
  const [date,       setDate]       = useState(todayStr);
  const [session,    setSession]    = useState('AM');
  const [wMap,       setWMap]       = useState(new Map());
  const [loading,    setLoading]    = useState(false);
  const [histPlayer, setHistPlayer] = useState(null);
  const [histData,   setHistData]   = useState([]);
  const [importMsg,  setImportMsg]  = useState('');
  const importRef = useRef();

  const mapKey = (pid,d,s) => `${d}_${s}_${pid}`;
  const get = pid => wMap.get(mapKey(pid,date,session)) || {};

  const loadSession = (d,s) => {
    setLoading(true);
    fetch(`/api/camp-wellness?camp_id=${camp.id}&session_date=${d}&session=${s}`)
      .then(r=>r.ok?r.json():{entries:[]})
      .then(data=>{
        setWMap(m=>{
          const next=new Map(m);
          for (const e of (data.entries||[])) next.set(mapKey(e.player_id,e.session_date,e.session),e);
          return next;
        });
      }).catch(()=>{}).finally(()=>setLoading(false));
  };

  useEffect(()=>{ loadSession(date,session); },[camp.id,date,session]);

  const patch = useCallback((pid, updates) => {
    const cur = get(pid);
    const next = {...cur,...updates, camp_id:camp.id, player_id:pid, session_date:date, session};
    setWMap(m=>new Map(m).set(mapKey(pid,date,session),next));
    fetch('/api/camp-wellness',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)})
      .catch(console.error);
  },[camp.id,date,session,wMap]);

  const openHistory = p => {
    setHistPlayer(p);
    fetch(`/api/camp-wellness?camp_id=${camp.id}&player_id=${p.id}`)
      .then(r=>r.ok?r.json():{entries:[]})
      .then(d=>setHistData(d.entries||[]))
      .catch(()=>{});
  };

  const handleImport = async e => {
    const file=e.target.files?.[0]; if(!file) return;
    e.target.value='';
    setImportMsg('Importing…');
    const result = await importCsv(file, camp.id, campPlayers, entries=>{
      setWMap(m=>{ const next=new Map(m); for(const en of entries) next.set(mapKey(en.player_id,en.session_date,en.session),en); return next; });
      loadSession(date,session);
    });
    setImportMsg(result.ok ? `✓ Imported ${result.count} rows` : `✗ ${result.msg}`);
    setTimeout(()=>setImportMsg(''),4000);
  };

  const filled = campPlayers.filter(p=>{ const w=get(p.id); return w.stress||w.sleep||w.appetite||w.mood||w.soreness||w.desire||w.rpe; }).length;

  return (
    <div className="cd-session-wrap">
      {/* ── Controls ── */}
      <div className="cd-session-bar">
        <button className="btn-ghost sm" onClick={()=>setDate(d=>addDays(d,-1))}>◀</button>
        <div className="cd-date-block">
          <input type="date" className="cd-date-input" value={date} onChange={e=>setDate(e.target.value)}/>
          <span className="cd-date-pretty">{prettyDate(date)}</span>
          {date!==todayStr()&&<button className="cd-today-btn" onClick={()=>setDate(todayStr())}>Today</button>}
        </div>
        <button className="btn-ghost sm" onClick={()=>setDate(d=>addDays(d,1))}>▶</button>

        <div className="cd-session-toggle">
          {['AM','PM'].map(s=>(
            <button key={s} className={`cd-sess-btn ${session===s?'on':''}`} onClick={()=>setSession(s)}>
              {s==='AM'?'🌅 Morning':'🌆 Evening'}
            </button>
          ))}
        </div>

        <span className="cd-fill-count">{filled}/{campPlayers.length} filled{loading&&' · loading…'}</span>

        <div className="cd-io-btns">
          <button className="btn-ghost sm" onClick={()=>exportCsv(camp,campPlayers,campShirts,wMap,date,session)}
            title="Download CSV — เปิดใน Excel กรอกแล้ว Import กลับ">
            ⬇ Export CSV
          </button>
          <button className="btn-ghost sm" onClick={()=>importRef.current.click()}
            title="Import filled CSV">
            ⬆ Import CSV
          </button>
          <input ref={importRef} type="file" accept=".csv" style={{display:'none'}} onChange={handleImport}/>
          {importMsg&&<span className="cd-import-msg">{importMsg}</span>}
        </div>
      </div>

      {/* ── Scale legend ── */}
      <div className="cd-legend-bar">
        <span className="cd-legend-title">Scale 1–10:</span>
        {PRE_COLS.map(c=>(
          <span key={c.key} className="cd-legend-item" title={c.hint}>
            {c.emoji} <span className="cd-legend-label">{c.label}</span>
          </span>
        ))}
        <span className="cd-legend-sep">|</span>
        <span className="cd-legend-item" style={{color:'#22c55e'}}>■ 8-10 Good</span>
        <span className="cd-legend-item" style={{color:'#ca8a04'}}>■ 5-7 Ok</span>
        <span className="cd-legend-item" style={{color:'#dc2626'}}>■ 1-4 Concern</span>
      </div>

      {/* ── Table ── */}
      <div className="cd-table-wrap">
        <table className="cd-table">
          <thead>
            <tr>
              <th className="cd-th-player">Player</th>
              {PRE_COLS.map(c=>(
                <th key={c.key} className="cd-th-num" title={c.hint}>{c.emoji}<br/>{c.label}</th>
              ))}
              <th className="cd-th-total" title="Sum of 6 pre-training metrics (max 60)">Total<br/>/60</th>
              <th className="cd-th-num" title="Duration in minutes">Min</th>
              <th className="cd-th-num" title="Rate of Perceived Exertion 1-10">RPE</th>
              <th className="cd-th-num" title="Daily Load = Duration × RPE">Load</th>
              <th className="cd-th-notes">Notes / หมายเหตุ</th>
              <th className="cd-th-hist"></th>
            </tr>
          </thead>
          <tbody>
            {campPlayers.map(p=>{
              const w=get(p.id);
              const stress=w.stress||0, sleep=w.sleep||0, appetite=w.appetite||0;
              const wellness=w.mood||0, soreness=w.soreness||0, desire=w.desire||0;
              const total = stress+sleep+appetite+wellness+soreness+desire;
              const rpe   = w.rpe||0, duration=w.duration||0;
              const load  = rpe&&duration ? rpe*duration : 0;
              const hasData = total||rpe||duration;
              const totalColor = total>=48?'#16a34a':total>=30?'#ca8a04':total>0?'#dc2626':'';
              return (
                <tr key={p.id} className={`cd-tr ${hasData?'cd-tr-filled':''}`}>
                  {/* Player */}
                  <td className="cd-td-player">
                    <PlayerPhoto playerId={p.id} name={p.name} size={34}/>
                    <div className="cd-td-names">
                      <span className="cd-td-name">{p.name}</span>
                      <span className="cd-td-thai">{p.nick||p.thaiName||''}</span>
                    </div>
                    {campShirts[p.id]!=null&&<span className="cd-td-shirt">#{campShirts[p.id]}</span>}
                    <PosBadge pos={p.pos}/>
                  </td>

                  {/* Pre-training metrics */}
                  {PRE_COLS.map(c=>(
                    <td key={c.key} className="cd-td-num">
                      <MetricInput value={w[c.key]||0} onChange={v=>patch(p.id,{[c.key]:v})}/>
                    </td>
                  ))}

                  {/* Total */}
                  <td className="cd-td-num">
                    <span className="cd-total-badge" style={total?{color:totalColor,borderColor:totalColor+'44',background:totalColor+'12'}:{}}>
                      {total||'–'}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="cd-td-num">
                    <input type="number" min="0" max="300" className="cd-metric-input"
                      value={duration||''} placeholder="–"
                      onChange={e=>patch(p.id,{duration:Number(e.target.value)||0})}/>
                  </td>

                  {/* RPE */}
                  <td className="cd-td-num">
                    <MetricInput value={rpe} onChange={v=>patch(p.id,{rpe:v})}/>
                  </td>

                  {/* Daily Load */}
                  <td className="cd-td-num">
                    <span className="cd-load-val" style={load?{color:rpeColor(rpe)}:{}}>
                      {load||'–'}
                    </span>
                  </td>

                  {/* Notes */}
                  <td className="cd-td-notes">
                    <input className="cd-notes-input" placeholder="หมายเหตุ…"
                      value={w.notes||''}
                      onChange={e=>patch(p.id,{notes:e.target.value})}/>
                  </td>

                  <td className="cd-td-hist">
                    <button className="cd-hist-btn" title="History" onClick={()=>openHistory(p)}>📈</button>
                  </td>
                </tr>
              );
            })}

            {/* Average row */}
            {campPlayers.length > 1 && (() => {
              const filled = campPlayers.filter(p=>{ const w=get(p.id); return w.stress||w.sleep||w.mood||w.soreness||w.appetite||w.desire; });
              if (!filled.length) return null;
              const avg = k => (filled.reduce((s,p)=>(s+(get(p.id)[k]||0)),0)/filled.length).toFixed(1);
              const avgTotal = PRE_COLS.reduce((s,c)=>s+Number(avg(c.key)),0).toFixed(1);
              return (
                <tr className="cd-tr-avg">
                  <td className="cd-td-player" style={{fontStyle:'italic',color:'var(--fg-dim)'}}>
                    <span style={{paddingLeft:8}}>Average (n={filled.length})</span>
                  </td>
                  {PRE_COLS.map(c=>(
                    <td key={c.key} className="cd-td-num">
                      <span className="cd-avg-val" style={{color:scoreColor(Number(avg(c.key)))}}>{avg(c.key)}</span>
                    </td>
                  ))}
                  <td className="cd-td-num"><span className="cd-avg-val">{avgTotal}</span></td>
                  <td colSpan={4}></td>
                  <td></td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>

      {/* ── History drawer ── */}
      {histPlayer&&(
        <div className="cd-hist-drawer">
          <div className="cd-hist-hd">
            <PlayerPhoto playerId={histPlayer.id} name={histPlayer.name} size={30}/>
            <span className="cd-hist-name">{histPlayer.name} ({histPlayer.nick||''}) — Readiness History</span>
            <button className="btn-ghost sm" onClick={()=>setHistPlayer(null)}>✕ Close</button>
          </div>
          <div className="cd-hist-body">
            {histData.length===0 ? <div className="callup-msg">No history yet</div> : (
              <table className="cd-hist-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Sess</th>
                    <th>🧠</th><th>😴</th><th>🍽</th><th>💊</th><th>💪</th><th>🔥</th>
                    <th>Total</th><th>Min</th><th>RPE</th><th>Load</th><th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {histData.map((h,i)=>{
                    const t=(h.stress||0)+(h.sleep||0)+(h.appetite||0)+(h.mood||0)+(h.soreness||0)+(h.desire||0);
                    const load=h.rpe&&h.duration?h.rpe*h.duration:0;
                    return (
                      <tr key={i}>
                        <td className="mono">{h.session_date}</td>
                        <td><span className={`cd-sess-badge ${h.session==='AM'?'am':'pm'}`}>{h.session}</span></td>
                        {[h.stress,h.sleep,h.appetite,h.mood,h.soreness,h.desire].map((v,j)=>(
                          <td key={j} className="mono" style={{color:scoreColor(v),textAlign:'center'}}>{v||'–'}</td>
                        ))}
                        <td className="mono" style={{fontWeight:600,color:scoreColor(t/6)}}>{t||'–'}</td>
                        <td className="mono">{h.duration||'–'}</td>
                        <td className="mono" style={{color:h.rpe?rpeColor(h.rpe):''}}>{h.rpe||'–'}</td>
                        <td className="mono">{load||'–'}</td>
                        <td style={{fontSize:11,color:'var(--fg-dim)'}}>{h.notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SQUAD TAB
// ══════════════════════════════════════════════════════════════════════════════
function SquadTab({ camp, campPlayers, campShirts }) {
  const [statusMap,    setStatusMap]    = useState(new Map());
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading,      setLoading]      = useState(true);

  useEffect(()=>{
    fetch(`/api/camp-status?camp_id=${camp.id}`)
      .then(r=>r.ok?r.json():{statuses:[]})
      .then(d=>{ const m=new Map(); for(const s of (d.statuses||[])) m.set(s.player_id,s); setStatusMap(m); })
      .catch(()=>{}).finally(()=>setLoading(false));
  },[camp.id]);

  const getStatus=id=>statusMap.get(id)||{status:'available',injury_note:'',notes:''};
  const saveStatus=(pid,upd)=>{
    const merged={...getStatus(pid),...upd,camp_id:camp.id,player_id:pid};
    setStatusMap(m=>new Map(m).set(pid,merged));
    fetch('/api/camp-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(merged)}).catch(console.error);
  };

  const counts=STATUS_OPTIONS.reduce((a,s)=>({...a,[s.key]:0}),{});
  campPlayers.forEach(p=>{ const k=getStatus(p.id).status||'available'; counts[k]=(counts[k]||0)+1; });
  const visible=filterStatus==='all'?campPlayers:campPlayers.filter(p=>getStatus(p.id).status===filterStatus);
  const sp=s=>({injured:0,sick:1,absent:2,resting:3,available:4}[s]??4);
  const sorted=[...visible].sort((a,b)=>{
    const pa=sp(getStatus(a.id).status),pb=sp(getStatus(b.id).status);
    if(pa!==pb) return pa-pb;
    return (campShirts[a.id]??99)-(campShirts[b.id]??99);
  });

  return (
    <div className="cd-squad-wrap">
      <div className="cd-filter-bar">
        <button className={`chip ${filterStatus==='all'?'on':''}`} onClick={()=>setFilterStatus('all')}>All ({campPlayers.length})</button>
        {STATUS_OPTIONS.map(s=>counts[s.key]>0&&(
          <button key={s.key} className={`chip ${filterStatus===s.key?'on':''}`}
            onClick={()=>setFilterStatus(filterStatus===s.key?'all':s.key)}>
            {s.emoji} {s.label} ({counts[s.key]})
          </button>
        ))}
      </div>
      {loading?<div className="callup-msg" style={{padding:40}}>Loading…</div>:(
        <div className="cd-grid">
          {sorted.map(p=>(
            <PlayerStatusCard key={p.id} player={p} status={getStatus(p.id)}
              shirtNum={campShirts[p.id]} onSave={upd=>saveStatus(p.id,upd)}/>
          ))}
          {sorted.length===0&&<div className="callup-msg" style={{gridColumn:'1/-1',padding:30}}>No players match filter</div>}
        </div>
      )}
    </div>
  );
}

function PlayerStatusCard({ player, status, shirtNum, onSave }) {
  const [open,setOpen]=useState(false);
  const [local,setLocal]=useState({status:'available',injury_note:'',notes:'',...status});
  useEffect(()=>setLocal(p=>({...p,...status})),[status]);
  const st=STATUS_OPTIONS.find(s=>s.key===local.status)||STATUS_OPTIONS[0];
  const patch=u=>{ const n={...local,...u}; setLocal(n); onSave(n); };
  return (
    <div className={`cd-card ${open?'cd-card-open':''} cd-status-${local.status}`}>
      <div className="cd-card-top" onClick={()=>setOpen(v=>!v)}>
        <div className="cd-photo-wrap">
          <PlayerPhoto playerId={player.id} name={player.name} size={50}/>
          {shirtNum!=null&&<span className="cd-shirt">{shirtNum}</span>}
        </div>
        <div className="cd-info">
          <div className="cd-name">{player.name}</div>
          {player.thaiName&&<div className="cd-thai">{player.thaiName}</div>}
          <div className="cd-badges"><PosBadge pos={player.pos}/><ClubChip code={player.club} small/></div>
        </div>
        <div className="cd-status-pill" style={{background:st.color+'22',color:st.color,borderColor:st.color+'66'}}>
          {st.emoji} {st.label}
        </div>
        <span className="cd-chevron">{open?'▲':'▼'}</span>
      </div>
      <div className="cd-mini">
        {local.injury_note?<span className="cd-inj-note">🩹 {local.injury_note}</span>
          :local.notes?<span style={{fontSize:12,color:'var(--fg-dim)'}}>{local.notes}</span>
          :<span className="cd-no-data">Click to update status</span>}
      </div>
      {open&&(
        <div className="cd-edit">
          <div className="cd-section">
            <div className="cd-section-label">Status</div>
            <div className="cd-status-row">
              {STATUS_OPTIONS.map(s=>(
                <button key={s.key} className={`cd-status-btn ${local.status===s.key?'on':''}`}
                  style={local.status===s.key?{background:s.color+'28',borderColor:s.color,color:s.color}:{}}
                  onClick={()=>patch({status:s.key})}>{s.emoji} {s.label}</button>
              ))}
            </div>
            {(local.status==='injured'||local.status==='sick')&&(
              <input className="camp-input" style={{marginTop:8}}
                placeholder={local.status==='injured'?'Injury detail…':'Illness detail…'}
                value={local.injury_note||''} onChange={e=>patch({injury_note:e.target.value})}/>
            )}
          </div>
          <div className="cd-section">
            <div className="cd-section-label">Notes</div>
            <textarea className="camp-input" rows={2} style={{resize:'vertical',width:'100%',boxSizing:'border-box'}}
              placeholder="Notes…" value={local.notes||''} onChange={e=>patch({notes:e.target.value})}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PANEL
// ══════════════════════════════════════════════════════════════════════════════
function CampDetailPanel({ camp, players, onClose }) {
  const [activeTab,setActiveTab]=useState('session');
  const campPlayers=players.filter(p=>(camp.playerIds||[]).includes(p.id));
  const campShirts=camp.playerShirts||{};
  const dateStr=cdFmtDate(camp.camp_date,camp.camp_date_end);

  useEffect(()=>{
    const k=e=>{ if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown',k);
    return ()=>window.removeEventListener('keydown',k);
  },[onClose]);

  return (
    <div className="cd-overlay">
      <div className="cd-panel">
        <div className="cd-hd">
          <button className="btn-ghost sm" onClick={onClose}>← Back</button>
          <div className="cd-hd-main">
            <span className="cd-hd-title">{camp.name}</span>
            <span className="cd-hd-sub">
              {camp.team_level}{camp.competition&&` · ${camp.competition}`}
              {dateStr&&` · ${dateStr}`} · <span className="mono">{campPlayers.length}</span> players
            </span>
          </div>
          <div className="cd-tabs">
            <button className={`cd-tab ${activeTab==='session'?'on':''}`} onClick={()=>setActiveTab('session')}>📊 Readiness</button>
            <button className={`cd-tab ${activeTab==='squad'?'on':''}`}   onClick={()=>setActiveTab('squad')}>🧑‍🤝‍🧑 Squad Status</button>
          </div>
          <button className="icon-btn close-x" onClick={onClose}>✕</button>
        </div>

        {campPlayers.length===0?(
          <div className="callup-msg" style={{padding:'60px',textAlign:'center'}}>
            No players called up yet.<br/><span className="dim">Add players in Call-up panel.</span>
          </div>
        ):activeTab==='session'?(
          <SessionTab camp={camp} campPlayers={campPlayers} campShirts={campShirts}/>
        ):(
          <SquadTab camp={camp} campPlayers={campPlayers} campShirts={campShirts}/>
        )}
      </div>
    </div>
  );
}

window.CampDetailPanel = CampDetailPanel;
window.CampSessionTab = SessionTab;
window.CampSquadTab = SquadTab;
