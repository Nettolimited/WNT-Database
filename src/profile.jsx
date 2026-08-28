// Player profile full-screen page — FA Thailand Portal / Talent ID System Style

function ProfilePanel({ player, players, clubs: propClubs, camps, matchStats, onClubsChange, onClose, onEdit, onDelete, t, density }) {
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(player);
  const [mounted, setMounted] = useState(true);

  // Local clubs list — starts from prop (D1-loaded) or fallback to global
  const [clubs, setClubs] = useState(() => propClubs || [...(window.TWNT_DATA?.CLUBS || [])]);
  const [newClub, setNewClub] = useState(null);

  // NT match history
  const [matchHistory, setMatchHistory]       = useState(null); // null = not loaded
  const [matchHistoryErr, setMatchHistoryErr] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState(null);

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

  // Load match history & GPS stats for player
  useEffect(() => {
    if (!player) return;

    // Fetch match history
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

    // Fetch latest camp GPS stats for this player if camps exist
    const playerCamps = (camps || []).filter(c => (c.playerIds || []).includes(player.id));
    if (playerCamps.length > 0) {
      const latestCamp = playerCamps.sort((a,b) => (b.camp_date||'').localeCompare(a.camp_date||''))[0];
      fetch(`/api/camp-gps?camp_id=${latestCamp.id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.entries) {
            const playerEntries = data.entries.filter(e => e.player_id === player.id);
            if (playerEntries.length > 0) {
              // Get average / max metrics across sessions
              const avgDist = Math.round(playerEntries.reduce((s,e) => s + (e.total_dist||0), 0) / playerEntries.length);
              const maxMpm  = Math.max(...playerEntries.map(e => e.m_per_min || 0));
              const avgHsr  = Math.round(playerEntries.reduce((s,e) => s + (e.hsr_dist||0), 0) / playerEntries.length);
              const maxVel  = Math.max(...playerEntries.map(e => e.max_vel || 0));
              const avgPL   = Math.round(playerEntries.reduce((s,e) => s + (e.total_pl||0), 0) / playerEntries.length);
              const avgEffs = Math.round(playerEntries.reduce((s,e) => s + (e.explosive_effs||0), 0) / playerEntries.length);
              setLatestGps({ campName: latestCamp.name, count: playerEntries.length, avgDist, maxMpm, avgHsr, maxVel, avgPL, avgEffs });
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

  const playerCamps = (camps || []).filter(c => (c.playerIds || []).includes(player.id));

  const save = () => { onEdit(draft); setEditing(false); };

  const editClubLogo = () => {
    const el = document.getElementById(`clublogo-${player.club}`);
    if (el && el.shadowRoot) {
      const inp = el.shadowRoot.querySelector('input[type=file]');
      if (inp) inp.click();
    }
  };

  const editPlayerPhoto = () => {
    const el = document.getElementById(`photo-${player.id}`);
    if (el && el.shadowRoot) {
      const inp = el.shadowRoot.querySelector('input[type=file]');
      if (inp) inp.click();
    }
  };

  const saveNewClub = () => {
    const code    = (newClub?.code    || '').trim().toUpperCase();
    const name    = (newClub?.name    || '').trim();
    const country = (newClub?.country || '').trim().toUpperCase().slice(0, 3);
    if (!code || !name) return;
    if (clubs.find(c => c.code === code)) { alert(`Code "${code}" already exists`); return; }

    if (window._imageSlotGet && window._imageSlotSet) {
      const logoData = window._imageSlotGet('new-club-logo');
      if (logoData) {
        window._imageSlotSet('clublogo-' + code, logoData);
        window._imageSlotSet('new-club-logo', null);
      }
    }

    const clubObj = { code, name, color: '#2444a1', country };
    const newClubs = [...clubs, clubObj];
    window.TWNT_DATA.CLUBS = newClubs;
    setClubs(newClubs);
    onClubsChange?.(newClubs);
    setF('club', code);
    setNewClub(null);
    fetch('/api/clubs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name, color: '#2444a1', country }),
    }).catch(console.error);
  };

  const setF = (path, v) => {
    setDraft(d => {
      const c = JSON.parse(JSON.stringify(d));
      const ks = path.split('.');
      let cur = c;
      for (let i = 0; i < ks.length - 1; i++) cur = cur[ks[i]];
      cur[ks[ks.length-1]] = v;
      if (path === 'intGoals')       c.intStats = { ...c.intStats, goals: v };
      if (path === 'caps')           c.intStats = { ...c.intStats, apps:  v };
      if (path === 'intStats.goals') c.intGoals = v;
      if (path === 'intStats.apps')  c.caps     = v;
      return c;
    });
  };

  const handleAddAvail = () => {
    if (!newAvail.date) return;
    const log = { id: 'av_' + Date.now(), ...newAvail };
    setAvailLogs(prev => [log, ...prev]);
    setShowAvailModal(false);
    setNewAvail({ date: new Date().toISOString().slice(0,10), status: 'available', notes: '' });
  };

  // Generate monthly availability mockup bars (last 12 months)
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const monthHeights = [100, 100, 75, 100, 100, 100, 100, 85, 100, 100, 100, 100];

  return (
    <>
      <div className={`profile-backdrop ${mounted?'in':''}`} onClick={onClose}></div>
      <aside className={`profile-panel full-screen-profile ${mounted?'in':''}`} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
        background: 'var(--bg-1)', zIndex: 10001, display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Top Navigation & Action Header */}
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

        {/* Scrollable Portal Dashboard Body */}
        <div className="profile-scroll-body" style={{flex: 1, overflowY: 'auto', background: 'var(--bg-1)'}}>
          <div className="portal-profile-wrap">

            {/* ══ ROW 1: TOP CARDS GRID ══ */}
            <div className="portal-grid-top">

              {/* CARD 1: BIO CARD */}
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
                  <span className="portal-tag">{club.name}</span>
                </div>

                <div className="portal-bio-kpis">
                  <div className="portal-bio-kpi-item">
                    <span className="portal-bio-kpi-val">{caps}</span>
                    <span className="portal-bio-kpi-lbl">Matches</span>
                  </div>
                  <div className="portal-bio-kpi-item">
                    <span className="portal-bio-kpi-val" style={{color:'#ef4444'}}>{goals}</span>
                    <span className="portal-bio-kpi-lbl">Goals</span>
                  </div>
                  <div className="portal-bio-kpi-item">
                    <span className="portal-bio-kpi-val" style={{color:'#10b981'}}>{playerCamps.length}</span>
                    <span className="portal-bio-kpi-lbl">Camps</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: POSITION & ATTRIBUTES */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>⚡</span> ประวัติตำแหน่ง & ทักษะ</div>
                </div>
                <div className="portal-pos-grid">
                  <div className="portal-pos-item">
                    <div className="portal-pos-left">
                      <PosBadge pos={player.pos} t={t}/>
                      <div>
                        <div style={{fontSize: 13, fontWeight: 700}}>ตำแหน่งหลัก (Primary)</div>
                        <div style={{fontSize: 11, color: 'var(--fg-dim)'}}>{player.pos === 'GK' ? 'Goalkeeper' : 'Outfield Player'}</div>
                      </div>
                    </div>
                    <span className="mono" style={{fontWeight: 800, color: 'var(--accent-blue)'}}>{caps} Caps</span>
                  </div>

                  {(player.altPos||[]).length > 0 && (
                    <div className="portal-pos-item">
                      <div className="portal-pos-left">
                        <div style={{display: 'flex', gap: 4}}>
                          {(player.altPos||[]).map(p => <PosBadge key={p} pos={p} t={t}/>)}
                        </div>
                        <div>
                          <div style={{fontSize: 13, fontWeight: 700}}>ตำแหน่งรอง (Secondary)</div>
                          <div style={{fontSize: 11, color: 'var(--fg-dim)'}}>{(player.altPos||[]).join(', ')}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{marginTop: 'auto', paddingTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center', background: 'var(--bg-3)', padding: 10, borderRadius: 8}}>
                  <div>
                    <div style={{fontSize: 10, color: 'var(--fg-mute)', fontWeight: 700}}>ส่วนสูง</div>
                    <div className="mono" style={{fontSize: 14, fontWeight: 700}}>{player.height || '-'} cm</div>
                  </div>
                  <div>
                    <div style={{fontSize: 10, color: 'var(--fg-mute)', fontWeight: 700}}>เท้าถนัด</div>
                    <div style={{fontSize: 14, fontWeight: 700}}><FootIcon foot={player.foot}/></div>
                  </div>
                  <div>
                    <div style={{fontSize: 10, color: 'var(--fg-mute)', fontWeight: 700}}>อายุ</div>
                    <div className="mono" style={{fontSize: 14, fontWeight: 700}}>{age} ปี</div>
                  </div>
                </div>
              </div>

              {/* CARD 3: PERFORMANCE INSIGHTS & RATING TREND */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>📈</span> ข้อมูลเชิงลึก & Rating Trend</div>
                  <span className="mono" style={{fontSize: 11, color: '#10b981', fontWeight: 700}}>Form: Good</span>
                </div>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
                  <span className="mono" style={{fontSize: 36, fontWeight: 900, color: 'var(--fg)', lineHeight: 1}}>
                    {goals > 0 ? (goals / Math.max(1, caps)).toFixed(2) : '0.00'}
                  </span>
                  <span style={{fontSize: 12, color: 'var(--fg-dim)'}}>Goals / Match</span>
                </div>

                {/* Rating Trend Sparkline SVG */}
                <div style={{height: 70, width: '100%', margin: '8px 0'}}>
                  <svg width="100%" height="100%" viewBox="0 0 300 70" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradTrend" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 50 Q 50 20, 100 35 T 200 15 T 300 25 L 300 70 L 0 70 Z" fill="url(#gradTrend)" />
                    <path d="M 0 50 Q 50 20, 100 35 T 200 15 T 300 25" fill="none" stroke="#60a5fa" strokeWidth="3" />
                    <circle cx="300" cy="25" r="4" fill="#60a5fa" />
                  </svg>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-mute)', borderTop: '1px solid var(--line-soft)', paddingTop: 8}}>
                  <span>⏱ Mins Avg: {caps > 0 ? (minutes/caps).toFixed(0) : 0}'</span>
                  <span>🅰 Assists: {assists}</span>
                  <span>🟨 {yellows} / 🟥 {reds}</span>
                </div>
              </div>

              {/* CARD 4: AVAILABILITY & MONTHLY BAR CHART */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>⚠️</span> ความพร้อมใช้งาน / Availability</div>
                  <button className="portal-card-action" onClick={() => setShowAvailModal(true)}>+ Add</button>
                </div>

                <div className="portal-avail-header">
                  <div>
                    <div className="portal-avail-big">100%</div>
                    <div className="portal-avail-sub">Available Status: <span style={{color: '#10b981', fontWeight: 700}}>● OK (Fit)</span></div>
                  </div>
                  <div className="mono" style={{fontSize: 12, color: 'var(--fg-mute)', textAlign: 'right'}}>
                    <strong style={{color: 'var(--fg)'}}>0</strong> Days Out
                  </div>
                </div>

                {/* Monthly Availability Vertical Bar Chart */}
                <div className="portal-bars-container">
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

              {/* CARD 5: LATEST CAMP GPS PERFORMANCE */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>📡</span> สถิติ GPS แคมป์ล่าสุด</div>
                  {latestGps && <span className="portal-tag">{latestGps.campName}</span>}
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
                    ยังไม่มีข้อมูลสถิติ GPS จากแคมป์ฝึกซ้อม
                  </div>
                )}
              </div>

              {/* CARD 6: AVAILABILITY LOG & HISTORY */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>📋</span> ประวัติความพร้อม / Log</div>
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

              {/* CARD 7: NATIONAL TEAM CAMP & EVENT HISTORY */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>🏕</span> ประวัติการเข้าแคมป์ทีมชาติ</div>
                  <span className="mono" style={{fontSize: 12, color: 'var(--fg-dim)'}}>{playerCamps.length} Camps</span>
                </div>

                {playerCamps.length === 0 ? (
                  <div style={{textAlign: 'center', padding: '24px 10px', color: 'var(--fg-mute)', fontSize: 13}}>
                    ยังไม่มีประวัติการเข้าแคมป์ทีมชาติ
                  </div>
                ) : (
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>ชื่อแคมป์</th>
                        <th>ช่วงวันที่</th>
                        <th>ทีม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerCamps.slice(0, 5).map(c => (
                        <tr key={c.id}>
                          <td style={{fontWeight: 700}}>{c.name}</td>
                          <td className="mono" style={{fontSize: 11}}>{c.camp_date ? c.camp_date : '-'}</td>
                          <td><span className="portal-tag">{c.team_level || 'Senior'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>

            {/* ══ ROW 3: BOTTOM CARDS GRID ══ */}
            <div className="portal-grid-bot">

              {/* CARD 8: OFFICIAL MATCH LOG */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>📅</span> ประวัติการลงสนามทางการ / Match Log</div>
                  <span className="mono" style={{fontSize: 12, color: 'var(--fg-dim)'}}>{matchHistory?.length || 0} Matches</span>
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
                        <th>คู่แข่ง</th>
                        <th>ผลแข่งขัน</th>
                        <th>นาทีที่เล่น</th>
                        <th>ผลงาน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...matchHistory].reverse().slice(0, 6).map(m => {
                        const e = m.playerEntry;
                        const hs = m.home_score ?? 0, as_ = m.away_score ?? 0;
                        const r = hs > as_ ? 'W' : hs === as_ ? 'D' : 'L';
                        const rColor = r === 'W' ? '#10b981' : r === 'D' ? '#eab308' : '#ef4444';
                        return (
                          <tr key={m.id}>
                            <td className="mono" style={{fontSize: 11}}>{m.match_date}</td>
                            <td style={{fontWeight: 700}}>vs {m.opponent}</td>
                            <td>
                              <span className="mono" style={{color: rColor, fontWeight: 800}}>{r} ({hs}-{as_})</span>
                            </td>
                            <td className="mono">{e.minutesPlayed || 0}'</td>
                            <td>
                              {e.goals > 0 && <span style={{marginRight: 4}}>⚽{e.goals}</span>}
                              {e.assists > 0 && <span style={{marginRight: 4}}>🅰{e.assists}</span>}
                              {e.yellowCards > 0 && <span>🟨</span>}
                              {e.redCard && <span>🟥</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* CARD 9: PERSONAL & REGISTRATION DETAILS */}
              <div className="portal-card">
                <div className="portal-card-hd">
                  <div className="portal-card-title"><span>👤</span> ข้อมูลส่วนตัว & สังกัดสโมสร</div>
                  <button className="portal-card-action" onClick={() => setEditing(true)}>✎ Edit</button>
                </div>

                <div className="portal-detail-list">
                  <div className="portal-detail-item">
                    <span className="portal-detail-k">ชื่อเต็มภาษาไทย</span>
                    <span className="portal-detail-v">{player.thaiName || player.name}</span>
                  </div>
                  <div className="portal-detail-item">
                    <span className="portal-detail-k">Full Name (English)</span>
                    <span className="portal-detail-v">{player.name}</span>
                  </div>
                  <div className="portal-detail-item">
                    <span className="portal-detail-k">ชื่อเล่น / Nickname</span>
                    <span className="portal-detail-v">{player.nick || '-'}</span>
                  </div>
                  <div className="portal-detail-item">
                    <span className="portal-detail-k">วันเกิด / Date of Birth</span>
                    <span className="portal-detail-v mono">{player.dob || '-'}</span>
                  </div>
                  <div className="portal-detail-item">
                    <span className="portal-detail-k">สโมสรต้นสังกัด (Club)</span>
                    <span className="portal-detail-v"><ClubChip code={player.club}/></span>
                  </div>
                  <div className="portal-detail-item">
                    <span className="portal-detail-k">ประเภททีมชาติ (Squad)</span>
                    <span className="portal-detail-v">{player.team || 'Senior'}</span>
                  </div>
                  <div className="portal-detail-item">
                    <span className="portal-detail-k">ส่วนสูง (Height)</span>
                    <span className="portal-detail-v mono">{player.height ? `${player.height} cm` : '-'}</span>
                  </div>
                  <div className="portal-detail-item">
                    <span className="portal-detail-k">เท้าถนัด (Preferred Foot)</span>
                    <span className="portal-detail-v"><FootIcon foot={player.foot}/></span>
                  </div>
                </div>
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
