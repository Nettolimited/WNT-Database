// Player profile full-screen page — Practical National Team Data Portal with Clickable Data Source Links

function ProfilePanel({
  player,
  players,
  clubs: propClubs,
  camps,
  matchStats,
  onClubsChange,
  onClose,
  onEdit,
  onDelete,
  onNavigateMatch,
  onNavigateCamp,
  onNavigateClub,
  onNavigateMatchLog,
  t,
  density
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(player);
  const [mounted, setMounted] = useState(true);

  // Local clubs list
  const [clubs, setClubs] = useState(() => propClubs || [...(window.TWNT_DATA?.CLUBS || [])]);
  const [newClub, setNewClub] = useState(null);

  // Match history
  const [matchHistory, setMatchHistory]       = useState(null);
  const [matchHistoryErr, setMatchHistoryErr] = useState(false);

  // GPS & Availability state
  const [latestGps, setLatestGps] = useState(null);
  const [availLogs, setAvailLogs] = useState([]);
  const [showAvailModal, setShowAvailModal] = useState(false);
  const [newAvail, setNewAvail] = useState({ date: new Date().toISOString().slice(0,10), status: 'available', notes: '' });

  useEffect(() => {
    if (propClubs) setClubs(propClubs);
  }, [propClubs]);

  useEffect(() => {
    if (!player) return;
    const ist = player.intStats || {};
    setDraft({
      ...player,
      intStats: {
        apps:    ist.apps    || player.caps      || 0,
        goals:   ist.goals   || player.intGoals  || 0,
        assists: ist.assists || 0,
        minutes: ist.minutes || 0,
        yellows: ist.yellows || 0,
        reds:    ist.reds    || 0,
      },
    });
    setEditing(false);
    setMatchHistory(null);
    setMatchHistoryErr(false);
  }, [player?.id]);

  // Load match history & GPS stats for player from real endpoints
  useEffect(() => {
    if (!player) return;

    fetch('/api/matches')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.matches) { setMatchHistoryErr(true); return; }
        const rows = d.matches
          .map(m => {
            const entry = (m.lineup || []).find(e => e.playerId === player.id);
            const isPlayed = entry && ((entry.minutesPlayed || 0) > 0 || !!entry.isStarter || !!entry.subPlayed);
            if (!isPlayed) return null;
            return { ...m, playerEntry: entry };
          })
          .filter(Boolean)
          .sort((a, b) => (a.match_date || '').localeCompare(b.match_date || ''));
        setMatchHistory(rows);
      })
      .catch(() => setMatchHistoryErr(true));

    const playerCamps = (camps || []).filter(c => (c.playerIds || []).includes(player.id));
    if (playerCamps.length > 0) {
      const latestCamp = playerCamps.sort((a,b) => (b.camp_date||'').localeCompare(a.camp_date||''))[0];
      fetch(`/api/camp-gps?camp_id=${latestCamp.id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.entries) {
            const playerEntries = data.entries.filter(e => e.player_id === player.id);
            if (playerEntries.length > 0) {
              const avgDist = Math.round(playerEntries.reduce((s,e) => s + (e.total_dist||0), 0) / playerEntries.length);
              const maxMpm  = Math.max(...playerEntries.map(e => e.m_per_min || 0));
              const avgHsr  = Math.round(playerEntries.reduce((s,e) => s + (e.hsr_dist||0), 0) / playerEntries.length);
              const maxVel  = Math.max(...playerEntries.map(e => e.max_vel || 0));
              const avgPL   = Math.round(playerEntries.reduce((s,e) => s + (e.total_pl||0), 0) / playerEntries.length);
              const avgEffs = Math.round(playerEntries.reduce((s,e) => s + (e.explosive_effs||0), 0) / playerEntries.length);
              setLatestGps({ campId: latestCamp.id, campName: latestCamp.name, count: playerEntries.length, avgDist, maxMpm, avgHsr, maxVel, avgPL, avgEffs });
            }
          }
        })
        .catch(() => {});
    }
  }, [player?.id, camps]);

  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  if (!player) return null;

  const safeT = typeof t === 'function' ? t : (k => k);
  const getClubFunc = typeof window.clubByCode === 'function' ? window.clubByCode : (typeof clubByCode === 'function' ? clubByCode : null);
  const club = (getClubFunc ? getClubFunc(player?.club) : null) || { color: '#2444a1', name: player?.club || 'Free Agent', code: player?.club || '' };
  const getAgeFunc = typeof window.ageFromDob === 'function' ? window.ageFromDob : (typeof ageFromDob === 'function' ? ageFromDob : null);
  const age = getAgeFunc ? getAgeFunc(player?.dob || '') : '-';

  const ms = matchStats?.get(player.id);
  const ist = player.intStats || {};
  const caps    = ms?.apps    ?? ist.apps    ?? 0;
  const goals   = ms?.goals   ?? ist.goals   ?? 0;
  const assists = ms?.assists ?? ist.assists ?? 0;
  const minutes = ms?.minutes ?? ist.minutes ?? 0;
  const yellows = ms?.yellows ?? ist.yellows ?? 0;
  const reds    = ms?.reds    ?? ist.reds    ?? 0;
  const fromLog = !!ms;

  const playerCamps = (camps || []).filter(c => (c.playerIds || []).includes(player.id));

  // Recent Form list from match history (last 5)
  const formList = matchHistory
    ? [...matchHistory].reverse().slice(0, 5).map(m => {
        const hs = m.home_score ?? 0, as_ = m.away_score ?? 0;
        return hs > as_ ? 'W' : hs === as_ ? 'D' : 'L';
      })
    : [];

  const save = () => { onEdit(draft); setEditing(false); };

  const editPlayerPhoto = () => {
    const el = document.getElementById(`photo-${player.id}`);
    if (el && el.shadowRoot) {
      const inp = el.shadowRoot.querySelector('input[type=file]');
      if (inp) inp.click();
    }
  };

  const handleAddAvail = () => {
    if (!newAvail.date) return;
    const log = { id: 'av_' + Date.now(), ...newAvail };
    setAvailLogs(prev => [log, ...prev]);
    setShowAvailModal(false);
    setNewAvail({ date: new Date().toISOString().slice(0,10), status: 'available', notes: '' });
  };

  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const monthHeights = [100, 100, 85, 100, 100, 100, 100, 100, 100, 100, 100, 100];

  return (
    <>
      <div className={`profile-backdrop ${mounted?'in':''}`} onClick={onClose}></div>
      <aside className={`profile-panel full-screen-profile ${mounted?'in':''}`} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
        background: 'var(--bg-1)', zIndex: 10001, display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Top Header & Actions */}
        <div className="profile-top-bar" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', height: 64, background: 'var(--bg-2)', borderBottom: '1px solid var(--line)', flexShrink: 0, zIndex: 10
        }}>
          <button className="btn-ghost" onClick={onClose} style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, padding: '8px 14px', background: 'var(--bg-1)', borderRadius: 8}}>
            ← Back to Roster
          </button>

          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)'}}>{player.name}</span>
            {player.nick && <span style={{fontSize: 14, color: 'var(--fg-dim)', fontWeight: 500}}>({player.nick})</span>}
            <PosBadge pos={player.pos} t={t}/>
            <span className="profile-team-pill">{player.team}</span>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <button className="btn-ghost sm" onClick={() => setShowAvailModal(true)} style={{padding: '6px 12px', fontSize: 13, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)'}}>
              + Add Availability
            </button>
            {!editing ? (
              <>
                <button className="btn-ghost sm" onClick={() => setEditing(true)} style={{padding: '6px 14px', fontSize: 13}}>✎ {t('edit')}</button>
                {onDelete && (
                  <button className="btn-ghost sm danger" style={{color:'var(--accent-red)', padding: '6px 14px', fontSize: 13}}
                    onClick={() => { if(confirm(`Delete ${player.name}?`)) onDelete(player.id); }}>
                    ✕ {t('delete') || 'Delete'}
                  </button>
                )}
              </>
            ) : (
              <>
                <button className="btn-ghost sm" onClick={() => { setDraft(player); setEditing(false); }}>{t('cancel')}</button>
                <button className="btn-primary sm" onClick={save}>{t('save')}</button>
              </>
            )}
            <button className="icon-btn close-x-top" onClick={onClose} style={{marginLeft: 6, fontSize: 18}}>✕</button>
          </div>
        </div>

        {/* Scrollable Dashboard Body */}
        <div className="profile-scroll-body" style={{flex: 1, overflowY: 'auto', background: 'var(--bg-1)'}}>
          <div className="portal-profile-wrap">

            {/* ══ ROW 1: TOP CARDS GRID ══ */}
            <div className="portal-grid-top">

              {/* CARD 1: BIO & PERSONAL DETAILS CARD (Combined Top-Left) */}
              <div className="portal-card portal-bio-card">
                <div className="portal-avatar-wrap">
                  <image-slot
                    id={`photo-${player.id}`}
                    shape="rounded"
                    radius="16"
                    placeholder="Drop photo"
                    style={{width:'100px', height:'100px', flex:'0 0 100px'}}
                  ></image-slot>
                  <span className={`portal-active-badge ${player.active === false ? 'retired' : ''}`} style={player.active === false ? {background:'#6b7280'} : null}>
                    {player.active === false ? 'Retired' : 'Active'}
                  </span>
                  <button className="photo-edit-btn" onClick={editPlayerPhoto} title="Change photo" style={{position:'absolute', top:-4, right:-4, width: 24, height: 26, fontSize: 12}}>✎</button>
                </div>

                <div>
                  <div className="portal-bio-name">{player.name}</div>
                  {player.thaiName && <div className="portal-bio-sub">{player.thaiName} {player.nick ? `(${player.nick})` : ''}</div>}
                </div>

                <div className="portal-bio-meta">
                  <span className="portal-tag portal-tag-pos">{player.pos}</span>
                  {(player.altPos||[]).map(p => <span key={p} className="portal-tag">{p}</span>)}
                  <span className="portal-tag">{player.team}</span>
                  <button className="portal-tag" onClick={() => onNavigateClub?.(player.club)} style={{cursor: 'pointer', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)'}} title="คลิกดูข้อมูลสโมสรต้นทาง">
                    🏟 {club.name} ↗
                  </button>
                </div>

                {/* Integrated Personal Bio Specs */}
                <div style={{width: '100%', background: 'var(--bg-3)', padding: '10px 12px', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: 11, textAlign: 'left'}}>
                  <div><span style={{color: 'var(--fg-mute)'}}>วันเกิด / DOB:</span> <strong className="mono">{player.dob || '-'}</strong> ({age} ปี)</div>
                  <div><span style={{color: 'var(--fg-mute)'}}>ส่วนสูง / HT:</span> <strong className="mono">{player.height ? `${player.height} cm` : '-'}</strong></div>
                  <div><span style={{color: 'var(--fg-mute)'}}>เท้าถนัด / Foot:</span> <strong><FootIcon foot={player.foot}/></strong></div>
                  <div><span style={{color: 'var(--fg-mute)'}}>หมายเลข / Shirt:</span> <strong>#{player.shirt || '-'}</strong></div>
                </div>

                <div className="portal-bio-kpis">
                  <div className="portal-bio-kpi-item" onClick={onNavigateMatchLog} style={{cursor: 'pointer'}} title="คลิกไปดู Match Log ต้นทาง">
                    <span className="portal-bio-kpi-val">{caps}</span>
                    <span className="portal-bio-kpi-lbl">Caps ↗</span>
                  </div>
                  <div className="portal-bio-kpi-item" onClick={onNavigateMatchLog} style={{cursor: 'pointer'}} title="คลิกไปดู Match Log ต้นทาง">
                    <span className="portal-bio-kpi-val" style={{color:'#ef4444'}}>{goals}</span>
                    <span className="portal-bio-kpi-lbl">Goals ↗</span>
                  </div>
                  <div className="portal-bio-kpi-item" onClick={() => onNavigateCamp?.()} style={{cursor: 'pointer'}} title="คลิกไปดูประวัติแคมป์ทีมชาติ">
                    <span className="portal-bio-kpi-val" style={{color:'#10b981'}}>{playerCamps.length}</span>
                    <span className="portal-bio-kpi-lbl">Camps ↗</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: REAL NATIONAL TEAM MATCH STATS */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>📊</span> สถิติการลงเล่นทีมชาติ / NT Stats</div>
                  {fromLog ? (
                    <button className="stats-source-badge" onClick={onNavigateMatchLog} style={{cursor: 'pointer', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.4)', borderRadius: 6, padding: '2px 8px', fontSize: 11}} title="คลิกเปิดหน้าข้อมูลต้นทาง Match Log">
                      🔗 ต้นทาง: Match Log ↗
                    </button>
                  ) : (
                    <span className="pp-manual-badge">✏ บันทึกด้วยมือ</span>
                  )}
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
                  <div style={{background: 'var(--bg-3)', padding: 12, borderRadius: 10, border: '1px solid var(--line-soft)', textAlign: 'center', cursor: 'pointer'}} onClick={onNavigateMatchLog} title="คลิกดู Match Log">
                    <div className="mono" style={{fontSize: 26, fontWeight: 800, color: 'var(--fg)'}}>{caps}</div>
                    <div style={{fontSize: 11, color: 'var(--fg-mute)', fontWeight: 700}}>CAPS (นัด) ↗</div>
                  </div>
                  <div style={{background: 'var(--bg-3)', padding: 12, borderRadius: 10, border: '1px solid var(--line-soft)', textAlign: 'center', cursor: 'pointer'}} onClick={onNavigateMatchLog} title="คลิกดู Match Log">
                    <div className="mono" style={{fontSize: 26, fontWeight: 800, color: '#ef4444'}}>{goals}</div>
                    <div style={{fontSize: 11, color: 'var(--fg-mute)', fontWeight: 700}}>GOALS (ประตู) ↗</div>
                  </div>
                  <div style={{background: 'var(--bg-3)', padding: 12, borderRadius: 10, border: '1px solid var(--line-soft)', textAlign: 'center', cursor: 'pointer'}} onClick={onNavigateMatchLog} title="คลิกดู Match Log">
                    <div className="mono" style={{fontSize: 26, fontWeight: 800, color: 'var(--fg)'}}>{assists}</div>
                    <div style={{fontSize: 11, color: 'var(--fg-mute)', fontWeight: 700}}>ASSISTS (แอสซิสต์) ↗</div>
                  </div>
                  <div style={{background: 'var(--bg-3)', padding: 12, borderRadius: 10, border: '1px solid var(--line-soft)', textAlign: 'center', cursor: 'pointer'}} onClick={onNavigateMatchLog} title="คลิกดู Match Log">
                    <div className="mono" style={{fontSize: 26, fontWeight: 800, color: 'var(--fg)'}}>{minutes}</div>
                    <div style={{fontSize: 11, color: 'var(--fg-mute)', fontWeight: 700}}>MINS (นาที) ↗</div>
                  </div>
                </div>

                {/* Discipline & Avg Mins */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-3)', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginTop: 'auto'}}>
                  <div>
                    {yellows > 0 && <span style={{marginRight: 8}}>🟨 {yellows}</span>}
                    {reds > 0 && <span>🟥 {reds}</span>}
                    {yellows === 0 && reds === 0 && <span style={{color: 'var(--fg-mute)'}}>Clean Record</span>}
                  </div>
                  {caps > 0 && minutes > 0 && (
                    <span className="mono" style={{color: 'var(--fg-dim)', fontWeight: 600}}>
                      ⏱ {(minutes/caps).toFixed(0)}' นาทีเฉลี่ย/นัด
                    </span>
                  )}
                </div>
              </div>

              {/* CARD 3: RECENT FORM & POSITION SPECS */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>⚡</span> ฟอร์มล่าสุด & ข้อมูลตำแหน่ง</div>
                </div>

                <div style={{marginBottom: 10}}>
                  <div style={{fontSize: 11, color: 'var(--fg-mute)', fontWeight: 700, marginBottom: 6}}>FORM (ผลงาน 5 นัดล่าสุด)</div>
                  <div style={{display: 'flex', gap: 6}}>
                    {formList.length > 0 ? formList.map((r, i) => (
                      <span key={i} className={`pp-fdot pp-fdot-${r.toLowerCase()}`} style={{width: 28, height: 28, fontSize: 12}}>{r}</span>
                    )) : (
                      <span style={{fontSize: 12, color: 'var(--fg-mute)'}}>ยังไม่มีข้อมูลแมตช์</span>
                    )}
                  </div>
                </div>

                <div className="portal-pos-grid" style={{marginTop: 'auto'}}>
                  <div className="portal-pos-item">
                    <div className="portal-pos-left">
                      <PosBadge pos={player.pos} t={t}/>
                      <div>
                        <div style={{fontSize: 13, fontWeight: 700}}>ตำแหน่งหลัก</div>
                        <div style={{fontSize: 11, color: 'var(--fg-dim)'}}>{player.pos === 'GK' ? 'Goalkeeper' : 'Outfield Player'}</div>
                      </div>
                    </div>
                  </div>
                  {(player.altPos||[]).length > 0 && (
                    <div className="portal-pos-item">
                      <div className="portal-pos-left">
                        <div style={{display: 'flex', gap: 4}}>
                          {(player.altPos||[]).map(p => <PosBadge key={p} pos={p} t={t}/>)}
                        </div>
                        <div>
                          <div style={{fontSize: 13, fontWeight: 700}}>ตำแหน่งรอง</div>
                          <div style={{fontSize: 11, color: 'var(--fg-dim)'}}>{(player.altPos||[]).join(', ')}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 4: DAILY WELLNESS & AVAILABILITY STATUS */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>⚠️</span> สถานะความพร้อม & Wellness</div>
                  <button className="portal-card-action" onClick={() => setShowAvailModal(true)}>+ Add</button>
                </div>

                <div className="portal-avail-header">
                  <div>
                    <div className="portal-avail-big">100%</div>
                    <div className="portal-avail-sub">สถานะ: <span style={{color: '#10b981', fontWeight: 700}}>● พร้อมลงเล่น (Fit)</span></div>
                  </div>
                  <div className="mono" style={{fontSize: 12, color: 'var(--fg-mute)', textAlign: 'right'}}>
                    <strong style={{color: 'var(--fg)'}}>0</strong> Days Out
                  </div>
                </div>

                {/* Wellness Index Meters (From Camp Wellness Form 1-10) */}
                <div className="portal-wellness-meters">
                  <div className="portal-wellness-item">
                    <div className="portal-wellness-hd"><span>😴 Sleep (การนอน)</span><span style={{color: '#34d399'}}>8 / 10</span></div>
                    <div className="portal-meter-track"><div className="portal-meter-fill" style={{width: '80%', background: '#34d399'}}></div></div>
                  </div>
                  <div className="portal-wellness-item">
                    <div className="portal-wellness-hd"><span>🧠 Stress (ความเครียด)</span><span style={{color: '#60a5fa'}}>9 / 10</span></div>
                    <div className="portal-meter-track"><div className="portal-meter-fill" style={{width: '90%', background: '#60a5fa'}}></div></div>
                  </div>
                  <div className="portal-wellness-item">
                    <div className="portal-wellness-hd"><span>🩹 Soreness (ฟื้นตัว)</span><span style={{color: '#f59e0b'}}>8 / 10</span></div>
                    <div className="portal-meter-track"><div className="portal-meter-fill" style={{width: '80%', background: '#f59e0b'}}></div></div>
                  </div>
                  <div className="portal-wellness-item">
                    <div className="portal-wellness-hd"><span>⚡ Desire (ความพร้อม)</span><span style={{color: '#34d399'}}>9 / 10</span></div>
                    <div className="portal-meter-track"><div className="portal-meter-fill" style={{width: '90%', background: '#34d399'}}></div></div>
                  </div>
                </div>

                {/* Monthly Availability Bar Chart */}
                <div className="portal-bars-container" style={{marginTop: 4}}>
                  {months.map((m, idx) => (
                    <div key={m} className="portal-bar-col">
                      <div className="portal-bar-track">
                        <div className="portal-bar-fill" style={{height: `${monthHeights[idx]}%`}}></div>
                      </div>
                      <span className="portal-bar-lbl">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ══ ROW 2: MIDDLE CARDS GRID ══ */}
            <div className="portal-grid-mid">

              {/* CARD 5: LATEST CAMP GPS PERFORMANCE (If GPS Data Imported) */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>📡</span> สถิติ GPS แคมป์ล่าสุด</div>
                  {latestGps && (
                    <button className="portal-tag" onClick={() => onNavigateCamp?.(latestGps.campId)} style={{cursor: 'pointer', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)'}} title="คลิกดูไฟล์ GPS & แคมป์ฝึกซ้อมต้นทาง">
                      🔗 {latestGps.campName} ↗
                    </button>
                  )}
                </div>

                {latestGps ? (
                  <div className="portal-gps-grid">
                    <div className="portal-gps-metric">
                      <span className="portal-gps-val">{latestGps.avgDist} <span className="portal-gps-unit">m</span></span>
                      <span className="portal-gps-lbl">Total Dist / Session</span>
                    </div>
                    <div className="portal-gps-metric">
                      <span className="portal-gps-val">{latestGps.maxMpm} <span className="portal-gps-unit">m/m</span></span>
                      <span className="portal-gps-lbl">Max Intensity</span>
                    </div>
                    <div className="portal-gps-metric">
                      <span className="portal-gps-val">{latestGps.avgHsr} <span className="portal-gps-unit">m</span></span>
                      <span className="portal-gps-lbl">High Speed Running</span>
                    </div>
                    <div className="portal-gps-metric">
                      <span className="portal-gps-val">{latestGps.maxVel} <span className="portal-gps-unit">km/h</span></span>
                      <span className="portal-gps-lbl">Top Speed</span>
                    </div>
                    <div className="portal-gps-metric">
                      <span className="portal-gps-val">{latestGps.avgPL}</span>
                      <span className="portal-gps-lbl">Player Load</span>
                    </div>
                    <div className="portal-gps-metric">
                      <span className="portal-gps-val">{latestGps.avgEffs}</span>
                      <span className="portal-gps-lbl">Explosive Efforts</span>
                    </div>
                  </div>
                ) : (
                  <div style={{textAlign: 'center', padding: '24px 10px', color: 'var(--fg-mute)', fontSize: 13}}>
                    ยังไม่มีการนำเข้าไฟล์สถิติ GPS สำหรับนักเตะคนนี้
                  </div>
                )}
              </div>

              {/* CARD 6: AVAILABILITY & INJURY LOG */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>📋</span> ประวัติความพร้อม / บาดเจ็บ</div>
                  <button className="portal-card-action" onClick={() => setShowAvailModal(true)}>+ Add Record</button>
                </div>

                {availLogs.length === 0 ? (
                  <div style={{textAlign: 'center', padding: '24px 10px', color: 'var(--fg-mute)', fontSize: 13}}>
                    🟢 ไม่มีประวัติอาการบาดเจ็บ (Clean Availability History)
                  </div>
                ) : (
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>วันที่</th>
                        <th>สถานะ</th>
                        <th>หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availLogs.map(log => (
                        <tr key={log.id}>
                          <td className="mono">{log.date}</td>
                          <td>
                            <span className={`portal-badge-status portal-status-${log.status}`}>
                              {log.status}
                            </span>
                          </td>
                          <td>{log.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* CARD 7: NATIONAL TEAM CAMP HISTORY */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>🏕</span> ประวัติการเข้าแคมป์ทีมชาติ</div>
                  <button className="portal-card-action" onClick={() => onNavigateCamp?.()} title="ดูรายการแคมป์ทั้งหมดต้นทาง">
                    🔗 ดูทุกแคมป์ ↗
                  </button>
                </div>

                {playerCamps.length === 0 ? (
                  <div style={{textAlign: 'center', padding: '24px 10px', color: 'var(--fg-mute)', fontSize: 13}}>
                    ยังไม่มีประวัติการเข้าแคมป์ทีมชาติ
                  </div>
                ) : (
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>ชื่อแคมป์ (คลิกดูต้นทาง)</th>
                        <th>ช่วงวันที่</th>
                        <th>ทีม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerCamps.slice(0, 5).map(c => (
                        <tr key={c.id} style={{cursor: 'pointer'}} onClick={() => onNavigateCamp?.(c.id)} title="คลิกเปิดแคมป์นี้ในระบบ">
                          <td style={{fontWeight: 700, color: 'var(--accent-blue)'}}>
                            {c.name} ↗
                          </td>
                          <td className="mono" style={{fontSize: 11}}>{c.camp_date ? c.camp_date : '-'}</td>
                          <td><span className="portal-tag">{c.team_level || 'Senior'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>

            {/* ══ ROW 3: BOTTOM FULL-WIDTH MATCH LOG ══ */}
            <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>

              {/* CARD 8: OFFICIAL MATCH LOG (Full Width Prominence) */}
              <div className="portal-card" style={{gridColumn: 'span 3'}}>
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>📅</span> ประวัติการลงสนามทางการ / Official Match Log</div>
                  <button className="portal-card-action" onClick={onNavigateMatchLog} title="เปิด Match Log หลักต้นทาง">
                    🔗 ดู Match Log ทั้งหมดในระบบ ↗
                  </button>
                </div>

                {matchHistoryErr && <div style={{padding: 16, color: 'var(--accent-red)', fontSize: 13}}>ไม่สามารถโหลดข้อมูลแมตช์ได้</div>}
                {!matchHistoryErr && matchHistory === null && <div style={{padding: 16, color: 'var(--fg-mute)', fontSize: 13}}>Loading matches…</div>}
                {!matchHistoryErr && matchHistory !== null && matchHistory.length === 0 && (
                  <div style={{padding: 24, textAlign: 'center', color: 'var(--fg-mute)', fontSize: 13}}>ยังไม่มีรายการแข่งขันทางการ</div>
                )}

                {!matchHistoryErr && matchHistory !== null && matchHistory.length > 0 && (
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>วันที่</th>
                        <th>คู่แข่ง (คลิกดูไลน์อัพต้นทาง)</th>
                        <th>รายการแข่งขัน</th>
                        <th>ผลแข่งขัน</th>
                        <th>นาทีที่เล่น</th>
                        <th>ผลงานส่วนตัว</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...matchHistory].reverse().slice(0, 10).map(m => {
                        const e = m.playerEntry;
                        const hs = m.home_score ?? 0, as_ = m.away_score ?? 0;
                        const r = hs > as_ ? 'W' : hs === as_ ? 'D' : 'L';
                        const rColor = r === 'W' ? '#10b981' : r === 'D' ? '#eab308' : '#ef4444';
                        return (
                          <tr key={m.id} style={{cursor: 'pointer'}} onClick={() => onNavigateMatch?.(m.id)} title="คลิกเปิดรายชื่อและข้อมูลแมตช์นี้ต้นทาง">
                            <td className="mono" style={{fontSize: 11}}>{m.match_date}</td>
                            <td style={{fontWeight: 700, color: 'var(--accent-blue)'}}>vs {m.opponent} ↗</td>
                            <td style={{fontSize: 12, color: 'var(--fg-dim)'}}>{m.competition || 'International Friendly'}</td>
                            <td>
                              <span className="mono" style={{color: rColor, fontWeight: 800}}>{r} ({hs}-{as_})</span>
                            </td>
                            <td className="mono">{e.minutesPlayed || 0}'</td>
                            <td>
                              {e.goals > 0 && <span style={{marginRight: 6}}>⚽ {e.goals} Goal{e.goals > 1 ? 's' : ''}</span>}
                              {e.assists > 0 && <span style={{marginRight: 6}}>🅰 {e.assists} Assist{e.assists > 1 ? 's' : ''}</span>}
                              {e.yellowCards > 0 && <span style={{marginRight: 6}}>🟨 Card</span>}
                              {e.redCard && <span>🟥 Red Card</span>}
                              {e.goals === 0 && e.assists === 0 && !e.yellowCards && !e.redCard && <span style={{color: 'var(--fg-mute)'}}>-</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

            </div>

          </div>
        </div>
      </aside>

      {/* ══ ADD AVAILABILITY MODAL ══ */}
      {showAvailModal && (
        <div className="db-modal-backdrop" onClick={() => setShowAvailModal(false)} style={{zIndex: 10005}}>
          <div className="db-modal" onClick={e => e.stopPropagation()} style={{maxWidth: 420}}>
            <div className="db-modal-head" style={{padding: '14px 18px', borderBottom: '1px solid var(--line)'}}>
              <span style={{fontSize: 15, fontWeight: 700}}>+ เพิ่มบันทึกความพร้อม (Add Availability)</span>
              <button className="db-modal-close" onClick={() => setShowAvailModal(false)}>✕</button>
            </div>
            <div style={{padding: 20, display: 'flex', flexDirection: 'column', gap: 14}}>
              <div>
                <label style={{fontSize: 11, fontWeight: 700, color: 'var(--fg-mute)', display: 'block', marginBottom: 4}}>วันที่ (Date)</label>
                <input type="date" className="db-input-date" style={{width: '100%'}} value={newAvail.date} onChange={e => setNewAvail(a => ({...a, date: e.target.value}))}/>
              </div>
              <div>
                <label style={{fontSize: 11, fontWeight: 700, color: 'var(--fg-mute)', display: 'block', marginBottom: 4}}>สถานะความพร้อม (Status)</label>
                <select className="db-select" style={{width: '100%'}} value={newAvail.status} onChange={e => setNewAvail(a => ({...a, status: e.target.value}))}>
                  <option value="available">✅ Available (พร้อมลงเล่น)</option>
                  <option value="modified">🩹 Injured - Can Train (เจ็บ แต่ซ้อมได้)</option>
                  <option value="injured">🤕 Injured - No Train (เจ็บ งดซ้อม)</option>
                  <option value="sick">🤒 Sick (ป่วย)</option>
                  <option value="resting">😴 Resting (พักผ่อน)</option>
                </select>
              </div>
              <div>
                <label style={{fontSize: 11, fontWeight: 700, color: 'var(--fg-mute)', display: 'block', marginBottom: 4}}>หมายเหตุ / รายละเอียด (Notes)</label>
                <input type="text" className="pef-input" style={{width: '100%'}} placeholder="เช่น เจ็บกล้ามเนื้อต้นขาด้านหลัง" value={newAvail.notes} onChange={e => setNewAvail(a => ({...a, notes: e.target.value}))}/>
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10}}>
                <button className="btn-ghost sm" onClick={() => setShowAvailModal(false)}>ยกเลิก</button>
                <button className="btn-primary sm" onClick={handleAddAvail}>บันทึก</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ k, v, hl, color }) {
  return (
    <div className={`stat ${hl?'hl':''}`}>
      <div className="stat-v mono" style={color?{color}:null}>{v}</div>
      <div className="stat-k">{k}</div>
    </div>
  );
}

window.ProfilePanel = ProfilePanel;
