// Camp Dashboard — Full-screen mini-app for managing a specific camp

const isCanTrain = window.isCanTrain || ((val) => {
  if (!val) return false;
  const s = String(val).toLowerCase().trim();
  if (s.includes('ไม่ได้') || s.includes('ไม่ซ้อม') || s.includes('งดซ้อม') || s === 'no' || s === 'no train') return false;
  return s.includes('yes') || s.includes('ซ้อมได้') || s.includes('%') || s.includes('percent');
});


// --- Dashboard Tab ---
function CampDashboardTab({ camp, campPlayers, wMap }) {
  const totalCalled = campPlayers.length;
  
  const now = new Date();
  const realToday = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  let today = realToday;
  let isOutsideCamp = false;
  
  if (camp?.camp_date_end && camp.camp_date_end !== '' && today > camp.camp_date_end) {
    today = camp.camp_date_end;
    isOutsideCamp = true;
  }
  if (camp?.camp_date && camp.camp_date !== '' && today < camp.camp_date) {
    today = camp.camp_date;
    isOutsideCamp = true;
  }
  
  const [rpeDate, setRpeDate] = useState(today);
  const [dashboardSchedules, setDashboardSchedules] = useState([]);
  const [targetRpe, setTargetRpe] = useState(6);
  const [showTargetRpe, setShowTargetRpe] = useState(false);
  const [wellnessData, setWellnessData] = useState([]);
  const [injuryData, setInjuryData] = useState([]);
  const [dashboardMode, setDashboardMode] = useState(isOutsideCamp ? 'overall' : 'daily');
  const [matches, setMatches] = useState([]);
  const [reportSort, setReportSort] = useState('pos');
  const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem('twnt_logo') || '');
  const updateLogo = () => {
    const url = window.prompt('Enter new Logo Image URL (leave blank to use default flag):', logoUrl);
    if (url !== null) {
      setLogoUrl(url);
      localStorage.setItem('twnt_logo', url);
    }
  };

  const [currentFifaRank, setCurrentFifaRank] = useState(() => localStorage.getItem('twnt_fifa_rank') || '49');
  const updateFifaRank = () => {
    const r = window.prompt('Enter Current FIFA Ranking:', currentFifaRank);
    if (r !== null) {
      setCurrentFifaRank(r);
      localStorage.setItem('twnt_fifa_rank', r);
    }
  };

  const sortedCampPlayers = useMemo(() => {
    if (!window.sortPlayersList) return campPlayers;
    return window.sortPlayersList(campPlayers, reportSort, camp.playerShirts || {});
  }, [campPlayers, reportSort, camp]);

  useEffect(() => {
    fetch('/api/matches').then(r => r.ok ? r.json() : { matches: [] })
      .then(d => setMatches(d.matches || []));
  }, []);
  
  useEffect(() => {
    fetch(`/api/camp-wellness?camp_id=${camp.id}&session_date=${rpeDate}`)
      .then(r => r.ok ? r.json() : { entries: [] })
      .then(d => setWellnessData(d.entries || []));
  }, [camp.id, rpeDate]);

  useEffect(() => {
    // Injury status assessed at night applies to the next day, so we look back 1 day
    const getPrevDate = (dStr) => {
      const d = new Date(dStr);
      d.setDate(d.getDate() - 1);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    };
    const prevDate = getPrevDate(rpeDate);
    fetch(`/api/camp-status?camp_id=${camp.id}&report_date=${prevDate}`)
      .then(r => r.ok ? r.json() : { statuses: [] })
      .then(d => setInjuryData(d.statuses || []));
  }, [camp.id, rpeDate]);

  useEffect(() => {
    fetch(`/api/camp-schedules?camp_id=${camp.id}`)
      .then(r => r.ok ? r.json() : { schedules: [] })
      .then(d => setDashboardSchedules(d.schedules || []));
  }, [camp.id]);

  const activePlayers = useMemo(() => {
    const inactiveIds = injuryData.filter(s => {
      if (s.status === 'absent' || s.status === 'sick') return true;
      if (s.status === 'injured' && !isCanTrain(s.can_train)) return true;
      return false;
    }).map(s => s.player_id);
    return campPlayers.filter(p => !inactiveIds.includes(p.id));
  }, [campPlayers, injuryData]);

  // Real data parsing for Dashboard Widgets
  const mockPlayerStats = useMemo(() => {
    return sortedCampPlayers.map(p => {
      const wds = wellnessData.filter(w => w.player_id === p.id);
      const wdAM = wds.find(w => w.session === 'AM');
      const wdPM = wds.find(w => w.session === 'PM');
      const wd = wdAM || wdPM || wds[0]; // fallback for wellness issues
      const stat = injuryData.find(s => s.player_id === p.id);
      
      let wellnessIssue = null;
      if (wd) {
         if (wd.sleep <= 5 && wd.sleep > 0) wellnessIssue = `Poor Sleep (${wd.sleep}/10)`;
         else if (wd.soreness <= 5 && wd.soreness > 0) wellnessIssue = `High Soreness (${wd.soreness}/10)`;
         else if (wd.stress <= 5 && wd.stress > 0) wellnessIssue = `High Stress (${wd.stress}/10)`;
         else if (wd.mood <= 5 && wd.mood > 0) wellnessIssue = `Low Wellness (${wd.mood}/10)`;
      }
      
      let injuryStatus = 'Full';
      if (stat && stat.status !== 'available') {
        if (stat.status === 'modified' || stat.status === 'resting' || isCanTrain(stat.can_train)) {
          injuryStatus = 'Modified';
        } else {
          injuryStatus = 'Rehab';
        }
      }

      let periodStatus = false;
      let periodNote = '';
      const periodWd = wds.find(w => w.period === 1 || (w.notes && w.notes.toLowerCase().includes('period')));
      if (periodWd) {
        periodStatus = true;
        periodNote = periodWd.notes || '';
      }
      
      return { 
        ...p, 
        rpe_am: (wdAM && wdAM.rpe) || (wd && wd.rpe) || 0,
        rpe_pm: (wdPM && wdPM.rpe) || 0,
        weight_before: (wd && wd.weight_before) || 0,
        weight_after: (wd && wd.weight_after) || 0,
        wellnessIssue, 
        injuryStatus,
        injuryRemarks: stat ? (stat.can_train || stat.injury_note || stat.notes || '') : '',
        periodStatus,
        periodNote,
        wd: wd || null,
        stat: stat || null
      };
    });
  }, [campPlayers, wellnessData, injuryData]);

  const filteredRpeAM = useMemo(() => {
    let rpeList = mockPlayerStats.filter(p => p.rpe_am > 0).sort((a, b) => b.rpe_am - a.rpe_am);
    const match = matches?.find(m => m.match_date === rpeDate);
    if (match) {
      const lineupIds = (match.lineup || []).map(l => l.playerId);
      rpeList = rpeList.filter(p => lineupIds.includes(p.id));
    }
    return rpeList;
  }, [mockPlayerStats, matches, rpeDate]);
  const avgRpeAM = filteredRpeAM.length ? (filteredRpeAM.reduce((s, p) => s + p.rpe_am, 0) / filteredRpeAM.length).toFixed(1) : 0;

  const filteredRpePM = useMemo(() => {
    let rpeList = mockPlayerStats.filter(p => p.rpe_pm > 0).sort((a, b) => b.rpe_pm - a.rpe_pm);
    const match = matches?.find(m => m.match_date === rpeDate);
    if (match) {
      const lineupIds = (match.lineup || []).map(l => l.playerId);
      rpeList = rpeList.filter(p => lineupIds.includes(p.id));
    }
    return rpeList;
  }, [mockPlayerStats, matches, rpeDate]);
  const avgRpePM = filteredRpePM.length ? (filteredRpePM.reduce((s, p) => s + p.rpe_pm, 0) / filteredRpePM.length).toFixed(1) : 0;

  const wellnessWatchlist = useMemo(() => mockPlayerStats.filter(p => p.wellnessIssue), [mockPlayerStats]);
  const injuryWatchlist = useMemo(() => mockPlayerStats.filter(p => p.injuryStatus !== 'Full'), [mockPlayerStats]);
  const periodWatchlist = useMemo(() => mockPlayerStats.filter(p => p.periodStatus), [mockPlayerStats]);

  // Hydration Calculation
  const hydrationData = useMemo(() => {
    let w = 0, m = 0, s = 0;
    const hW = [], hM = [], hS = [];
    activePlayers.forEach(p => {
      const wds = wellnessData.filter(x => x.player_id === p.id);
      // Find a session with weight data
      const wd = wds.find(x => x.weight_before > 0 && x.weight_after > 0);
      if (wd) {
        const loss = ((wd.weight_before - wd.weight_after) / wd.weight_before) * 100;
        if (loss > 2) { s++; hS.push(p); }
        else if (loss >= 1) { m++; hM.push(p); }
        else { w++; hW.push(p); }
      }
    });
    const total = w + m + s;
    return {
      well: total ? Math.round((w/total)*100) : 0,
      mild: total ? Math.round((m/total)*100) : 0,
      severe: total ? Math.round((s/total)*100) : 0,
      hWell: hW, hMild: hM, hSevere: hS
    };
  }, [activePlayers, wellnessData]);

  // Readiness Calculation
  const avgReadiness = useMemo(() => {
    let totalScore = 0;
    let count = 0;
    activePlayers.forEach(p => {
      const wds = wellnessData.filter(x => x.player_id === p.id);
      // Usually AM session holds wellness data
      const wd = wds.find(x => x.session === 'AM') || wds[0];
      if (wd && (wd.sleep > 0 || wd.stress > 0 || wd.soreness > 0 || wd.mood > 0 || wd.appetite > 0)) {
        // out of 50 total
        const score = (wd.sleep + wd.stress + wd.soreness + wd.mood + wd.appetite);
        totalScore += (score / 50) * 100;
        count++;
      }
    });
    return count > 0 ? Math.round(totalScore / count) : 0;
  }, [activePlayers, wellnessData]);

  const rpeData = [
    { session: 'Current AM', avgRpe: avgRpeAM, target: targetRpe },
    { session: 'Current PM', avgRpe: avgRpePM, target: targetRpe }
  ];

  const PitchReport = window.PitchReport;
  const MatchTimelineList = window.MatchTimelineList;
  const dailyAgenda = dashboardSchedules.filter(s => s.schedule_date === rpeDate).sort((a,b)=>(a.time_start||'').localeCompare(b.time_start||''));
  const isMatchDay = dailyAgenda.some(a => a.type === 'Match');
  const matchData = isMatchDay ? matches.find(m => m.match_date === rpeDate) : null;

  const [selectedPlayerDetail, setSelectedPlayerDetail] = useState(null);

  useEffect(() => {
    if (!document.getElementById('cd-hoverable-style')) {
      const style = document.createElement('style');
      style.id = 'cd-hoverable-style';
      style.innerHTML = `
        .cd-hoverable-card:hover { background: rgba(255,255,255,0.06) !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="cd-dashboard" style={{padding: '30px', animation: 'fade-in 0.3s ease'}}>
      <div className="no-print" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <h2 style={{marginTop: 0, marginBottom: 0, fontFamily: 'var(--font-display)', fontSize: 28}}>Dashboard</h2>
        <div style={{display: 'flex', gap: 15, alignItems: 'center'}}>
          <select className="btn-ghost" value={reportSort} onChange={e => setReportSort(e.target.value)} style={{padding: '8px', borderRadius: 20, background: 'var(--bg-2)', border: '1px solid var(--line-soft)', color: 'var(--fg-base)'}}>
            <option value="pos">Sort: Position</option>
            <option value="shirt">Sort: Shirt #</option>
            <option value="name">Sort: Name</option>
            <option value="age">Sort: Age</option>
          </select>
          {dashboardMode === 'daily' && (
            <div style={{display: 'flex', alignItems: 'center', gap: 5}}>
              <button 
                className="btn-ghost"
                onClick={() => {
                  const d = new Date(rpeDate); d.setDate(d.getDate() - 1);
                  const newDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                  if (!camp?.camp_date || newDate >= camp.camp_date) setRpeDate(newDate);
                }}
                style={{padding: '6px 10px', borderRadius: 20, background: 'var(--bg-2)', border: '1px solid var(--line-soft)', cursor: 'pointer', color: 'var(--fg-base)'}}>
                ◀
              </button>
              <input 
                type="date" 
                value={rpeDate}
                onChange={e => setRpeDate(e.target.value)}
                style={{padding: '8px 15px', borderRadius: 20, border: '1px solid var(--line-soft)', background: 'var(--bg-2)', color: 'var(--fg-base)', outline: 'none', fontFamily: 'var(--font-ui)'}}
              />
              <button 
                className="btn-ghost"
                onClick={() => {
                  const d = new Date(rpeDate); d.setDate(d.getDate() + 1);
                  const newDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                  if (!camp?.camp_date_end || newDate <= camp.camp_date_end) setRpeDate(newDate);
                }}
                style={{padding: '6px 10px', borderRadius: 20, background: 'var(--bg-2)', border: '1px solid var(--line-soft)', cursor: 'pointer', color: 'var(--fg-base)'}}>
                ▶
              </button>
            </div>
          )}
          <div className="cd-session-toggle">
            <button className={`cd-sess-btn ${dashboardMode === 'overall' ? 'on' : ''}`} onClick={() => setDashboardMode('overall')}>📊 Overall View</button>
            <button className={`cd-sess-btn ${dashboardMode === 'daily' ? 'on' : ''}`} onClick={() => setDashboardMode('daily')}>📅 Daily View</button>
          </div>
        </div>
      </div>
      {dashboardMode === 'overall' ? (
        <CampDashboardOverall camp={camp} activePlayers={activePlayers} injuryData={injuryData} dashboardSchedules={dashboardSchedules} matches={matches} campPlayers={campPlayers} logoUrl={logoUrl} updateLogo={updateLogo} currentFifaRank={currentFifaRank} updateFifaRank={updateFifaRank} />
      ) : (
        <>
      
      {isMatchDay && matchData ? (
        <div style={{background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)', borderRadius: 16, padding: '24px 30px', marginBottom: 24, border: '1px solid #991b1b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 32px rgba(127, 29, 29, 0.4)', position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', right: -20, top: -20, fontSize: 180, opacity: 0.05, pointerEvents: 'none'}}>🏟️</div>
          <div style={{position: 'relative', zIndex: 1}}>
            <div style={{color: '#fca5a5', fontSize: 13, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8}}>🔥 Match Day</div>
            <h2 style={{margin: 0, fontSize: 28, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 10}}>
              <div onClick={updateLogo} style={{cursor: 'pointer', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0}} title="Click to change logo">
                {logoUrl ? <img src={logoUrl} style={{width: '100%', height: '100%', objectFit: 'contain', padding: 4}}/> : '🇹🇭'}
              </div>
              Thailand <span style={{color: 'rgba(255,255,255,0.5)', margin: '0 8px'}}>vs</span> {matchData.opponent}
            </h2>
            <div style={{color: '#fecaca', marginTop: 10, fontSize: 14, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10}}>
              <span style={{background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: 20}}>Kick-off: {dailyAgenda.find(a=>a.type==='Match')?.time_start || 'TBA'}</span>
              <span>•</span>
              <span>{matchData.competition}</span>
              {(matchData.fifa_rank_change || matchData.fifa_pts_change) ? (
                <>
                  <span>•</span>
                  <span style={{background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: 20}}>
                    FIFA: {matchData.fifa_pts_change > 0 ? '+' : ''}{matchData.fifa_pts_change} pts
                    {matchData.fifa_rank_change !== 0 && ` (${matchData.fifa_rank_change > 0 ? '+' : ''}${matchData.fifa_rank_change} rank)`}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
      <div className="cd-stats-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px'}}>
        <div className="cd-stat-card" style={{background: 'var(--bg-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line-soft)'}}>
          <div style={{color: 'var(--fg-dim)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1}}>Total Squad</div>
          <div style={{fontSize: 36, fontWeight: 700, marginTop: 10}}>{totalCalled}</div>
        </div>
        <div className="cd-stat-card" style={{background: 'var(--bg-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line-soft)'}}>
          <div style={{color: 'var(--fg-dim)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1}}>Avg Readiness</div>
          <div style={{fontSize: 36, fontWeight: 700, marginTop: 10, color: avgReadiness >= 80 ? '#22c55e' : avgReadiness >= 60 ? '#eab308' : '#ef4444'}}>
            {avgReadiness}%
          </div>
        </div>
      </div>
      )}
      
      {isMatchDay && matchData && PitchReport && (
        <div style={{marginBottom: 30}}>
          <div style={{display: 'flex', gap: 20}}>
            <div style={{flex: 1, background: 'var(--bg-1)', borderRadius: 16, border: '1px solid var(--line)'}}>
               <h3 style={{margin: 0, padding: '20px 20px 0 20px'}}>Starting XI & Setup</h3>
               <PitchReport match={matchData} players={campPlayers} onUpdateLineup={lineup => {
                 fetch(`/api/matches/${matchData.id}`, { 
                   method: 'PUT', 
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({
                     opponent: matchData.opponent, competition: matchData.competition,
                     matchDate: matchData.match_date, homeScore: matchData.home_score,
                     awayScore: matchData.away_score, teamLevel: matchData.team_level,
                     lineup, notes: matchData.notes,
                     isPrivate: matchData.is_private || false,
                     fifaRankChange: matchData.fifa_rank_change || 0,
                     fifaPtsChange: matchData.fifa_pts_change || 0,
                   }) 
                 })
                 .then(() => fetch('/api/matches').then(r => r.json()).then(d => setMatches(d.matches || [])));
               }} />
            </div>
            {MatchTimelineList && (
              <div style={{width: 350}}>
                <MatchTimelineList match={matchData} players={campPlayers} pairs={[]} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Watchlists */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px'}}>
        
        {/* Injury Watchlist */}
        <div style={{background: 'var(--bg-2)', padding: '20px 25px', borderRadius: 16, border: '1px solid rgba(239, 68, 68, 0.3)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
            <h3 style={{margin: 0, fontSize: 18, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8}}>
              <span style={{fontSize: 20}}>🚑</span> Injury Concerns
            </h3>
            <div style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700}}>
              {injuryWatchlist.length} Players
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {injuryWatchlist.length === 0 && <div className="muted">No current injuries to report.</div>}
            {injuryWatchlist.map(p => (
              <div key={p.id} onClick={() => setSelectedPlayerDetail({player: p, type: 'injury', injuryStatus: p.injuryStatus})} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, cursor: 'pointer'}} className="cd-hoverable-card">
                {window.PlayerPhoto ? <window.PlayerPhoto playerId={p.id} name={p.name} size={32} /> : <div style={{width: 32, height: 32, background: '#333', borderRadius: '50%'}}></div>}
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontWeight: 600, fontSize: 14}}>{p.nick || p.name.split(' ')[0]}</div>
                  <div style={{fontSize: 12, color: p.injuryStatus === 'Rehab' ? '#ef4444' : '#eab308'}}>{p.injuryStatus === 'Rehab' ? 'Rehab / Out' : 'Modified Training'}</div>
                  {p.injuryRemarks && <div style={{fontSize: 11, color: 'var(--fg-mute)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220}}>Note: {p.injuryRemarks}</div>}
                </div>
                {p.stat && p.stat.injury_note && (
                  <div style={{
                    background: p.injuryStatus === 'Rehab' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                    color: p.injuryStatus === 'Rehab' ? '#ef4444' : '#eab308',
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    maxWidth: 150,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    border: p.injuryStatus === 'Rehab' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(234, 179, 8, 0.2)',
                    fontWeight: 600
                  }} title={p.stat.injury_note}>
                    {p.stat.injury_note.split('\n')[0].replace(/^-\s*/, '')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Wellness Watchlist */}
        <div style={{background: 'var(--bg-2)', padding: '20px 25px', borderRadius: 16, border: '1px solid rgba(234, 179, 8, 0.3)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
            <h3 style={{margin: 0, fontSize: 18, color: '#eab308', display: 'flex', alignItems: 'center', gap: 8}}>
              <span style={{fontSize: 20}}>⚠️</span> Wellness Anomalies
            </h3>
            <div style={{background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700}}>
              {wellnessWatchlist.length} Alerts
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {wellnessWatchlist.length === 0 && <div className="muted">All players reporting optimal wellness.</div>}
            {wellnessWatchlist.map(p => (
              <div key={p.id} onClick={() => setSelectedPlayerDetail({player: p, type: 'wellness', wellnessIssue: p.wellnessIssue})} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, cursor: 'pointer'}} className="cd-hoverable-card">
                {window.PlayerPhoto ? <window.PlayerPhoto playerId={p.id} name={p.name} size={32} /> : <div style={{width: 32, height: 32, background: '#333', borderRadius: '50%'}}></div>}
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 600, fontSize: 14}}>{p.nick || p.name.split(' ')[0]}</div>
                  <div style={{fontSize: 12, color: '#eab308'}}>
                    {p.wellnessIssue}
                    {p.wd && p.wd.notes && <span style={{color: 'var(--fg-dim)', marginLeft: 8}}>— {p.wd.notes.length > 30 ? p.wd.notes.substring(0,30) + '...' : p.wd.notes}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Period Watchlist */}
        <div style={{background: 'var(--bg-2)', padding: '20px 25px', borderRadius: 16, border: '1px solid rgba(236, 72, 153, 0.3)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
            <h3 style={{margin: 0, fontSize: 18, color: '#ec4899', display: 'flex', alignItems: 'center', gap: 8}}>
              <span style={{fontSize: 20}}>🩸</span> Period Tracker
            </h3>
            <div style={{background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700}}>
              {periodWatchlist.length} Players
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {periodWatchlist.length === 0 && <div className="muted">No players currently on period.</div>}
            {periodWatchlist.map(p => (
              <div key={p.id} onClick={() => setSelectedPlayerDetail({player: p, type: 'wellness', wellnessIssue: 'Period Tracker'})} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, cursor: 'pointer'}} className="cd-hoverable-card">
                {window.PlayerPhoto ? <window.PlayerPhoto playerId={p.id} name={p.name} size={32} /> : <div style={{width: 32, height: 32, background: '#333', borderRadius: '50%'}}></div>}
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 600, fontSize: 14}}>{p.nick || p.name.split(' ')[0]}</div>
                  <div style={{fontSize: 12, color: '#ec4899'}}>Menstruation Phase</div>
                  {p.periodNote && <div style={{fontSize: 11, color: 'var(--fg-mute)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220}}>Note: {p.periodNote.replace(/period:?\s*/i, '')}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Individual RPE Leaderboard */}
      <div style={{background: 'var(--bg-2)', padding: '20px 25px', borderRadius: 16, border: '1px solid var(--line-soft)', marginBottom: 40}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 15, marginBottom: 20}}>
          <div>
            <h3 style={{margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8}}>
              <span style={{fontSize: 20}}>🏃‍♀️</span> Individual RPE Load
            </h3>
            <div style={{fontSize: 13, color: 'var(--fg-dim)', marginTop: 4}}>Reported Exertion for Selected Date</div>
          </div>
          
          <div style={{display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: 5, borderRadius: 8}}>
            <input type="date" value={rpeDate} onChange={e => setRpeDate(e.target.value)} className="pef-input" style={{padding: '6px 12px', height: 'auto', minHeight: 32, borderRadius: 6, fontSize: 13}} />
            <div style={{width: 1, height: 20, background: 'rgba(255,255,255,0.2)'}}></div>
            <label style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-dim)', cursor: 'pointer', userSelect: 'none'}}>
              <input type="checkbox" checked={showTargetRpe} onChange={e => setShowTargetRpe(e.target.checked)} style={{cursor: 'pointer'}} />
              Target RPE:
            </label>
            {showTargetRpe && (
              <input type="number" value={targetRpe} onChange={e => setTargetRpe(Number(e.target.value))} min="1" max="10" className="pef-input" style={{width: 60, padding: '6px', height: 'auto', minHeight: 32, borderRadius: 6, fontSize: 13}} />
            )}
          </div>
        </div>

        {/* AM Chart */}
        <div style={{marginTop: 20}}>
          <h4 style={{marginTop: 0, marginBottom: 10, color: 'var(--fg-dim)'}}>{isMatchDay ? 'Match Exertion' : 'AM Session'}</h4>
          <div style={{display: 'flex', alignItems: 'flex-end', height: 200, gap: 2, paddingBottom: 10, borderBottom: '1px solid var(--line-soft)', position: 'relative', overflowX: 'auto', paddingLeft: 4, paddingRight: 4}}>
            {/* Average Line */}
            <div style={{position: 'absolute', bottom: `${(avgRpeAM/10)*85}%`, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.7)', zIndex: 0, pointerEvents: 'none', borderTop: '1px dashed #fff'}}>
              <div style={{position: 'absolute', top: -22, right: 10, fontSize: 12, fontWeight: 700, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: 4, color: '#fff'}}>Avg: {avgRpeAM}</div>
            </div>
            {/* Target Line */}
            {showTargetRpe && (
              <div style={{position: 'absolute', bottom: `${(targetRpe/10)*85}%`, left: 0, right: 0, height: 2, background: 'rgba(234, 179, 8, 0.5)', zIndex: 0, pointerEvents: 'none', borderTop: '2px dashed rgba(234, 179, 8, 1)'}}>
                <div style={{position: 'absolute', top: -22, left: 10, fontSize: 12, fontWeight: 700, background: 'rgba(234, 179, 8, 0.2)', padding: '2px 8px', borderRadius: 4, color: '#eab308'}}>Target: {targetRpe}</div>
              </div>
            )}
            
            {filteredRpeAM.length === 0 && <div className="muted" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>No RPE data for AM session.</div>}
            
            {filteredRpeAM.map(p => {
              const heightPct = (p.rpe_am / 10) * 85;
              const color = p.rpe_am >= 7 ? '#ef4444' : p.rpe_am >= 5 ? '#eab308' : '#3b82f6';
              return (
                <div key={p.id} onClick={() => setSelectedPlayerDetail({player: p, type: 'rpe', rpe: p.rpe_am, wd: p.wd})} style={{flex: 1, minWidth: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', cursor: 'pointer', zIndex: 1, padding: '0 1px'}} className="cd-hoverable-card">
                  <div style={{position: 'relative', flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 5}}>
                     <div title={`RPE: ${p.rpe_am}`} style={{width: '100%', height: `${heightPct}%`, background: color, borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease', opacity: 0.9}}></div>
                     <div style={{position: 'absolute', bottom: `${heightPct}%`, width: '100%', textAlign: 'center', fontSize: 13, fontWeight: 700, paddingBottom: 4, textShadow: '0 1px 2px rgba(0,0,0,0.8)'}}>{p.rpe_am}</div>
                  </div>
                  {window.PlayerPhoto ? <window.PlayerPhoto playerId={p.id} name={p.name} size={24} /> : <div style={{width: 24, height: 24, background: '#333', borderRadius: '50%', marginBottom: 2}}></div>}
                  <div style={{fontSize: 10, color: 'var(--fg-dim)', whiteSpace: 'nowrap', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center'}}>{p.nick || p.name.split(' ')[0]}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* PM Chart */}
        <div style={{marginTop: 30}}>
          <h4 style={{marginTop: 0, marginBottom: 10, color: 'var(--fg-dim)'}}>PM Session</h4>
          <div style={{display: 'flex', alignItems: 'flex-end', height: 200, gap: 2, paddingBottom: 10, borderBottom: '1px solid var(--line-soft)', position: 'relative', overflowX: 'auto', paddingLeft: 4, paddingRight: 4}}>
            {/* Average Line */}
            <div style={{position: 'absolute', bottom: `${(avgRpePM/10)*85}%`, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.7)', zIndex: 0, pointerEvents: 'none', borderTop: '1px dashed #fff'}}>
              <div style={{position: 'absolute', top: -22, right: 10, fontSize: 12, fontWeight: 700, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: 4, color: '#fff'}}>Avg: {avgRpePM}</div>
            </div>
            {/* Target Line */}
            {showTargetRpe && (
              <div style={{position: 'absolute', bottom: `${(targetRpe/10)*85}%`, left: 0, right: 0, height: 2, background: 'rgba(234, 179, 8, 0.5)', zIndex: 0, pointerEvents: 'none', borderTop: '2px dashed rgba(234, 179, 8, 1)'}}>
                <div style={{position: 'absolute', top: -22, left: 10, fontSize: 12, fontWeight: 700, background: 'rgba(234, 179, 8, 0.2)', padding: '2px 8px', borderRadius: 4, color: '#eab308'}}>Target: {targetRpe}</div>
              </div>
            )}
            
            {filteredRpePM.length === 0 && <div className="muted" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>No RPE data for PM session.</div>}
            
            {filteredRpePM.map(p => {
              const heightPct = (p.rpe_pm / 10) * 85;
              const color = p.rpe_pm >= 7 ? '#ef4444' : p.rpe_pm >= 5 ? '#eab308' : '#3b82f6';
              return (
                <div key={p.id} onClick={() => setSelectedPlayerDetail({player: p, type: 'rpe', rpe: p.rpe_pm, wd: p.wd})} style={{flex: 1, minWidth: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', cursor: 'pointer', zIndex: 1, padding: '0 1px'}} className="cd-hoverable-card">
                  <div style={{position: 'relative', flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 5}}>
                     <div title={`RPE: ${p.rpe_pm}`} style={{width: '100%', height: `${heightPct}%`, background: color, borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease', opacity: 0.9}}></div>
                     <div style={{position: 'absolute', bottom: `${heightPct}%`, width: '100%', textAlign: 'center', fontSize: 13, fontWeight: 700, paddingBottom: 4, textShadow: '0 1px 2px rgba(0,0,0,0.8)'}}>{p.rpe_pm}</div>
                  </div>
                  {window.PlayerPhoto ? <window.PlayerPhoto playerId={p.id} name={p.name} size={24} /> : <div style={{width: 24, height: 24, background: '#333', borderRadius: '50%', marginBottom: 2}}></div>}
                  <div style={{fontSize: 10, color: 'var(--fg-dim)', whiteSpace: 'nowrap', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center'}}>{p.nick || p.name.split(' ')[0]}</div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

        </>
      )}

      {/* Modal Injection */}
      {selectedPlayerDetail && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={() => setSelectedPlayerDetail(null)}>
          <div style={{background: 'var(--bg-1)', borderRadius: 16, width: 400, maxWidth: '90%', overflow: 'hidden', border: '1px solid var(--line)'}} onClick={e => e.stopPropagation()}>
            {/* Header with Photo */}
            <div style={{background: 'var(--bg-2)', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--line-soft)', position: 'relative'}}>
              <button className="icon-btn" onClick={() => setSelectedPlayerDetail(null)} style={{position: 'absolute', top: 15, right: 15}}>✕</button>
              {window.PlayerPhoto ? <window.PlayerPhoto playerId={selectedPlayerDetail.player.id} name={selectedPlayerDetail.player.name} size={100} /> : <div style={{width: 100, height: 100, background: '#333', borderRadius: '50%'}}></div>}
              <h3 style={{margin: '15px 0 5px 0', fontSize: 22}}>{selectedPlayerDetail.player.name}</h3>
              <div style={{color: 'var(--accent)', fontWeight: 600}}>{selectedPlayerDetail.player.nick}</div>
            </div>
            
            {/* Content Body */}
            <div style={{padding: '25px 20px', textAlign: 'center'}}>
              {(() => {
                const { type, rpe, wellnessIssue, injuryStatus } = selectedPlayerDetail;
                if (type === 'injury') {
                  return (
                    <div>
                      <div style={{fontSize: 40, marginBottom: 10}}>🚑</div>
                      <div style={{fontSize: 18, fontWeight: 700, marginBottom: 5}}>Injury Report</div>
                      <div style={{color: injuryStatus === 'Rehab' ? '#ef4444' : '#eab308', fontSize: 16, fontWeight: 600}}>{injuryStatus === 'Rehab' ? 'Rehab / Out' : 'Modified Training'}</div>
                      {selectedPlayerDetail.player.stat && (
                        <div style={{marginTop: 15, textAlign: 'left', fontSize: 13, background: 'var(--bg-2)', borderRadius: 8, padding: 15, display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid var(--line-soft)'}}>
                          {selectedPlayerDetail.player.stat.symptom_date && <div><span style={{color: 'var(--fg-dim)', display: 'block', marginBottom: 2}}>วันที่มีอาการ (Date)</span><div style={{fontWeight: 600}}>{selectedPlayerDetail.player.stat.symptom_date}</div></div>}
                          {selectedPlayerDetail.player.stat.injury_note && <div><span style={{color: 'var(--fg-dim)', display: 'block', marginBottom: 2}}>อาการ (Details)</span><div style={{fontWeight: 600}}>{selectedPlayerDetail.player.stat.injury_note}</div></div>}
                          {selectedPlayerDetail.player.stat.can_train && <div><span style={{color: 'var(--fg-dim)', display: 'block', marginBottom: 2}}>ซ้อมได้หรือไม่ (Can Train?)</span><div style={{fontWeight: 600, color: 'var(--accent)'}}>{selectedPlayerDetail.player.stat.can_train}</div></div>}
                          {selectedPlayerDetail.player.stat.treatment_plan && <div><span style={{color: 'var(--fg-dim)', display: 'block', marginBottom: 2}}>แพลนการรักษา (Treatment)</span><div style={{fontWeight: 600}}>{selectedPlayerDetail.player.stat.treatment_plan}</div></div>}
                          {selectedPlayerDetail.player.stat.notes && <div style={{borderTop: '1px solid var(--line)', paddingTop: 10, marginTop: 5}}><span style={{color: 'var(--fg-dim)', display: 'block', marginBottom: 2}}>Notes</span><div style={{whiteSpace: 'pre-wrap'}}>{selectedPlayerDetail.player.stat.notes}</div></div>}
                        </div>
                      )}
                    </div>
                  );
                } else if (type === 'wellness') {
                  const wd = selectedPlayerDetail.player.wd;
                  return (
                    <div>
                      <div style={{fontSize: 40, marginBottom: 10}}>⚠️</div>
                      <div style={{fontSize: 18, fontWeight: 700, marginBottom: 5}}>Wellness Alert</div>
                      <div style={{color: '#eab308', fontSize: 16, fontWeight: 600}}>{wellnessIssue}</div>
                      {wd && wd.notes && (
                        <div style={{marginTop: 15, textAlign: 'left', fontSize: 13, background: 'var(--bg-2)', borderRadius: 8, padding: 15, border: '1px solid var(--line-soft)'}}>
                          <span style={{color: 'var(--fg-dim)', display: 'block', marginBottom: 5}}>หมายเหตุ (Notes)</span>
                          <div style={{fontWeight: 600, whiteSpace: 'pre-wrap'}}>{wd.notes}</div>
                        </div>
                      )}
                    </div>
                  );
                } else if (type === 'rpe') {
                  return (
                    <div>
                      <div style={{fontSize: 40, marginBottom: 10}}>🏃‍♀️</div>
                      <div style={{fontSize: 12, color: 'var(--fg-dim)', marginBottom: 5}}>Session RPE</div>
                      <div style={{fontSize: 32, fontWeight: 800, color: rpe >= 7 ? '#ef4444' : rpe >= 5 ? '#eab308' : '#22c55e'}}>{rpe} / 10</div>
                      {selectedPlayerDetail.wd && selectedPlayerDetail.wd.duration > 0 && (
                        <div style={{marginTop: 20, padding: 15, background: 'var(--bg-2)', borderRadius: 8}}>
                          <div style={{fontSize: 12, color: 'var(--fg-dim)', marginBottom: 5}}>Exertion Load (RPE × Duration)</div>
                          <div style={{fontSize: 16, fontWeight: 600}}>{rpe * selectedPlayerDetail.wd.duration} AU</div>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- Schedule Tab ---
function CampScheduleTab({ camp }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [activeDate, setActiveDate] = useState(null);
  const [detailDate, setDetailDate] = useState(null);

  const loadSchedules = () => {
    setLoading(true);
    fetch(`/api/camp-schedules?camp_id=${camp.id}`)
      .then(r => r.ok ? r.json() : { schedules: [] })
      .then(d => {
        const data = d.schedules || [];
        setSchedules(data);
        if (data.length > 0) {
          const uniqueDates = [...new Set(data.map(x => x.schedule_date))].sort();
          const dt = new Date();
          const todayStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
          if (uniqueDates.includes(todayStr)) {
            setActiveDate(todayStr);
          } else if (!activeDate || !uniqueDates.includes(activeDate)) {
            setActiveDate(uniqueDates[0]);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSchedules(); }, [camp.id]);

  const handleSave = (item) => {
    fetch('/api/camp-schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, camp_id: camp.id })
    }).then(() => {
      setEditingItem(null);
      loadSchedules();
    });
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this schedule item?')) return;
    fetch(`/api/camp-schedules?id=${id}`, { method: 'DELETE' }).then(() => loadSchedules());
  };

  const types = ['Training', 'Match', 'Team Meeting', 'Treatment', 'Meal', 'Travel', 'Arrival', 'Custom'];
  const typeEmojis = { 'Training':'⚽️', 'Match':'🏟️', 'Team Meeting':'🗣', 'Treatment':'🩹', 'Meal':'🍽', 'Travel':'🚌', 'Arrival':'🛬', 'Custom':'📌' };

  return (
    <div className="cd-schedule-wrap" style={{padding: '30px', animation: 'fade-in 0.3s ease'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <h2 style={{margin: 0, fontFamily: 'var(--font-display)', fontSize: 28}}>Camp Schedule</h2>
        <button className="btn-primary" onClick={() => {
          const dt = new Date();
          const todayStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
          setEditingItem({ schedule_date: activeDate || todayStr, time_start: '09:00', time_end: '11:00', title: '', type: 'Training', notes: '', video_url: '' });
        }}>+ Add Event</button>
      </div>

      {editingItem && (
        <div className="cd-form-modal" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 9999}}>
          <div style={{background: 'var(--bg-1)', padding: 30, borderRadius: 12, width: 500, maxWidth: '90%'}}>
            <h3 style={{marginTop: 0}}>Edit Schedule Event</h3>
            <div style={{display:'flex', gap: 10, marginBottom: 15}}>
              <div style={{flex: 1}}>
                <label style={{display:'block', fontSize:12, marginBottom:4}}>Date</label>
                <input type="date" className="camp-input" value={editingItem.schedule_date} onChange={e=>setEditingItem({...editingItem, schedule_date: e.target.value})} />
              </div>
              <div>
                <label style={{display:'block', fontSize:12, marginBottom:4}}>Start Time</label>
                <input type="time" className="camp-input" value={editingItem.time_start} onChange={e=>setEditingItem({...editingItem, time_start: e.target.value})} />
              </div>
              <div>
                <label style={{display:'block', fontSize:12, marginBottom:4}}>End Time</label>
                <input type="time" className="camp-input" value={editingItem.time_end} onChange={e=>setEditingItem({...editingItem, time_end: e.target.value})} />
              </div>
            </div>
            <div style={{marginBottom: 15}}>
              <label style={{display:'block', fontSize:12, marginBottom:4}}>Title</label>
              <input className="camp-input" placeholder="e.g. Tactical Training" value={editingItem.title} onChange={e=>setEditingItem({...editingItem, title: e.target.value})} />
            </div>
            <div style={{marginBottom: 15}}>
              <label style={{display:'block', fontSize:12, marginBottom:4}}>Type</label>
              <select className="camp-input" value={editingItem.type} onChange={e=>setEditingItem({...editingItem, type: e.target.value})}>
                {types.map(t => <option key={t} value={t}>{typeEmojis[t]} {t}</option>)}
              </select>
            </div>
            <div style={{marginBottom: 15}}>
              <label style={{display:'block', fontSize:12, marginBottom:4}}>Notes / Detail</label>
              <textarea className="camp-input" rows={3} placeholder="Additional details..." value={editingItem.notes} onChange={e=>setEditingItem({...editingItem, notes: e.target.value})} />
            </div>
            <div style={{marginBottom: 20}}>
              <label style={{display:'block', fontSize:12, marginBottom:4}}>YouTube Video URL (Optional)</label>
              <input className="camp-input" placeholder="https://youtu.be/..." value={editingItem.video_url} onChange={e=>setEditingItem({...editingItem, video_url: e.target.value})} />
            </div>
            <div style={{display:'flex', gap: 10, justifyContent: 'flex-end'}}>
              <button className="btn-ghost" onClick={() => setEditingItem(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => handleSave(editingItem)}>Save Event</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="callup-msg">Loading schedule...</div> : (
        <div className="cd-timeline">
          {schedules.length === 0 ? <div className="callup-msg">No schedule events found.</div> : (() => {
            const groupedSchedules = schedules.reduce((acc, curr) => {
              if (!acc[curr.schedule_date]) acc[curr.schedule_date] = [];
              acc[curr.schedule_date].push(curr);
              return acc;
            }, {});
            const sortedDates = Object.keys(groupedSchedules).sort();
            
            let calendarDates = [];
            if (sortedDates.length > 0) {
              const startDt = new Date(sortedDates[0]);
              const endDt = new Date(sortedDates[sortedDates.length - 1]);
              for (let d = new Date(startDt); d <= endDt; d.setDate(d.getDate() + 1)) {
                calendarDates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
              }
            }
            
            const dayEvents = activeDate && groupedSchedules[activeDate] 
              ? groupedSchedules[activeDate].sort((a,b) => a.time_start.localeCompare(b.time_start)) 
              : [];
              
            let activeDateStr = '';
            if (activeDate) {
              const [y, m, d] = activeDate.split('-').map(Number);
              activeDateStr = new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }

            return (
              <div>
                {/* FM Calendar Grid */}
                <div className="fm-calendar-grid">
                  {calendarDates.map(date => {
                    const isActive = date === activeDate;
                    const [y, m, d] = date.split('-').map(Number);
                    const dateObj = new Date(y, m - 1, d);
                    const shortDay = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
                    const events = groupedSchedules[date] || [];
                    
                    return (
                      <div 
                        key={date} 
                        className={`fm-calendar-day ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setActiveDate(date);
                          setDetailDate(date);
                        }}
                      >
                        <div className="fm-day-header">
                          <span className="fm-day-name">{shortDay}</span>
                          <span className="fm-day-num">{d}</span>
                        </div>
                        <div className="fm-events-list">
                          {events.map(ev => (
                            <div key={ev.id} className={`fm-event-chip fm-event-chip-${ev.type.replace(/\s+/g, '')}`} title={ev.title}>
                              <span>{typeEmojis[ev.type] || '📌'}</span>
                              <span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{ev.title || ev.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Active Date Timeline */}
                {activeDate && (
                  <div key={activeDate} style={{ animation: 'fade-in 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                      <div style={{ background: 'var(--primary, #3b82f6)', color: '#fff', padding: '6px 16px', borderRadius: 20, fontWeight: 700, fontSize: 15 }}>
                        {activeDateStr}
                      </div>
                      <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
                    </div>
                    
                    {dayEvents.length === 0 ? <div className="callup-msg">No events for this day.</div> : (
                      dayEvents.map(item => (
                        <div key={item.id} className="cd-timeline-item" style={{display: 'flex', gap: 20, marginBottom: 15, background: 'var(--bg-2)', padding: '15px 20px', borderRadius: 12, border: '1px solid var(--line-soft)', position: 'relative'}}>
                          <div style={{width: 80, flexShrink: 0, textAlign: 'right'}}>
                            <div style={{fontWeight: 700, fontSize: 18, color: 'var(--fg)'}}>{item.time_start}</div>
                            <div style={{color: 'var(--fg-dim)', fontSize: 13}}>{item.time_end}</div>
                          </div>
                          <div style={{width: 4, background: 'var(--line)', borderRadius: 2}}></div>
                          <div style={{flex: 1}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                              <div style={{fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8}}>
                                <span>{typeEmojis[item.type] || '📅'}</span> 
                                {item.title || item.type}
                              </div>
                              <div>
                                <button className="icon-btn" onClick={() => setEditingItem(item)}>✎</button>
                                <button className="icon-btn" onClick={() => handleDelete(item.id)} style={{color: 'var(--err)'}}>✕</button>
                              </div>
                            </div>
                            {item.notes && <div style={{marginTop: 8, fontSize: 14, color: 'var(--fg-dim)', whiteSpace: 'pre-wrap'}}>{item.notes}</div>}
                            {item.video_url && (
                              <a href={item.video_url} target="_blank" rel="noreferrer" className="btn-ghost sm" style={{display: 'inline-block', marginTop: 12, background: 'rgba(239,68,68,0.1)', color: '#ef4444'}}>
                                ▶️ Watch Video
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Daily Detail Modal Overlay */}
                {detailDate && (() => {
                  const events = groupedSchedules[detailDate] || [];
                  const sortedEvents = [...events].sort((a,b) => a.time_start.localeCompare(b.time_start));
                  
                  const [y, m, d] = detailDate.split('-').map(Number);
                  const formattedDate = new Date(y, m - 1, d).toLocaleDateString('en-GB', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  });
                  
                  return (
                    <div className="cd-form-modal" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 9999}} onClick={() => setDetailDate(null)}>
                      <div style={{background: 'var(--bg-1)', padding: 30, borderRadius: 12, width: 550, maxWidth: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column'}} onClick={e => e.stopPropagation()}>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottom: '1px solid var(--line-soft)', paddingBottom: 12}}>
                          <div>
                            <h3 style={{marginTop: 0, marginBottom: 4, fontFamily: 'var(--font-display)', fontSize: 22}}>Daily Agenda</h3>
                            <div style={{fontSize: 14, color: 'var(--accent)', fontWeight: 600}}>{formattedDate}</div>
                          </div>
                          <button className="btn-primary sm" onClick={() => {
                            setEditingItem({ schedule_date: detailDate, time_start: '09:00', time_end: '10:00', title: '', type: 'Training', notes: '', video_url: '' });
                          }}>+ Add Event</button>
                        </div>

                        <div className="hide-scroll" style={{flex: 1, overflowY: 'auto', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12}}>
                          {sortedEvents.length === 0 ? (
                            <div style={{color: 'var(--fg-dim)', fontSize: 14, textAlign: 'center', padding: '40px 0'}}>
                              No events scheduled for this day.
                            </div>
                          ) : (
                            sortedEvents.map(item => (
                              <div key={item.id} style={{display: 'flex', gap: 15, background: 'var(--bg-2)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--line-soft)'}}>
                                <div style={{width: 60, flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                                  <span style={{fontWeight: 700, fontSize: 15, color: 'var(--fg)'}}>{item.time_start}</span>
                                  <span style={{color: 'var(--fg-dim)', fontSize: 12}}>{item.time_end}</span>
                                </div>
                                <div style={{width: 3, background: 'var(--line-soft)', borderRadius: 2}}></div>
                                <div style={{flex: 1, minWidth: 0}}>
                                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10}}>
                                    <span style={{fontWeight: 600, fontSize: 15, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 6}}>
                                      <span>{typeEmojis[item.type] || '📅'}</span>
                                      {item.title || item.type}
                                    </span>
                                    <div style={{display: 'flex', gap: 4, flexShrink: 0}}>
                                      <button className="icon-btn" style={{padding: '2px 6px'}} onClick={() => setEditingItem(item)}>✎</button>
                                      <button className="icon-btn" style={{color: 'var(--err)', padding: '2px 6px'}} onClick={() => handleDelete(item.id)}>✕</button>
                                    </div>
                                  </div>
                                  {item.notes && <div style={{fontSize: 13, color: 'var(--fg-dim)', marginTop: 4, whiteSpace: 'pre-wrap'}}>{item.notes}</div>}
                                  {item.video_url && (
                                    <a href={item.video_url} target="_blank" rel="noreferrer" className="btn-ghost sm" style={{display: 'inline-block', marginTop: 8, background: 'rgba(239,68,68,0.08)', color: '#ef4444', padding: '3px 8px', fontSize: 11}}>
                                      ▶️ Video
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div style={{display:'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--line-soft)', paddingTop: 15}}>
                          <button className="btn-ghost" onClick={() => setDetailDate(null)}>Close</button>
                        </div>

                      </div>
                    </div>
                  );
                })()}

              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// --- Staff Tab ---
function CampStaffTab({ camp, globalStaff = [], setCamps }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);

  const updateGlobalCampsState = (updatedStaffList) => {
    if (!setCamps) return;
    const newStaffIds = updatedStaffList.map(s => s.staff_id);
    const newStaffRoles = {};
    for (const s of updatedStaffList) {
      newStaffRoles[s.staff_id] = s.role;
    }
    setCamps(curr => curr.map(c => {
      if (c.id === camp.id) {
        return {
          ...c,
          staffIds: newStaffIds,
          staffRoles: newStaffRoles
        };
      }
      return c;
    }));
  };

  const loadStaff = () => {
    setLoading(true);
    fetch(`/api/camp-staff?camp_id=${camp.id}`)
      .then(r => r.ok ? r.json() : { staff: [] })
      .then(d => {
        const staffList = d.staff || [];
        setStaff(staffList);
        updateGlobalCampsState(staffList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSaveBatch = async (selectedIds) => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      const promises = selectedIds.map(staffId => {
        const found = globalStaff.find(s => s.id === staffId);
        const defaultRole = found ? found.role_category : 'Coach';
        return fetch('/api/camp-staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            camp_id: camp.id,
            staff_id: staffId,
            role: defaultRole,
            notes: ''
          })
        });
      });
      await Promise.all(promises);
      setEditingItem(null);
      setSelectedBatchIds([]);
      loadStaff();
    } catch (e) {
      console.error(e);
      alert('Failed to add some staff members');
      loadStaff();
    }
  };

  useEffect(() => { loadStaff(); }, [camp.id]);

  const handleSave = (item) => {
    if (!item.staff_id) {
      alert('Please select a staff member');
      return;
    }
    fetch('/api/camp-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, camp_id: camp.id })
    }).then(() => {
      setEditingItem(null);
      loadStaff();
    });
  };

  const handleDelete = (id) => {
    if (!confirm('Remove this staff member?')) return;
    fetch(`/api/camp-staff?id=${id}`, { method: 'DELETE' }).then(() => loadStaff());
  };

  const headCoaches = staff.filter(item => (item.role || '').toLowerCase().includes('head coach'));
  
  const currentStaffIds = staff.map(s => s.staff_id);
  const availableStaff = globalStaff.filter(s => !currentStaffIds.includes(s.id));
  
  const technical = staff.filter(item => {
    const roleLower = (item.role || '').toLowerCase();
    const isHeadCoach = roleLower.includes('head coach');
    if (isHeadCoach) return false;
    return (
      roleLower.includes('coach') ||
      roleLower.includes('analyst') ||
      roleLower.includes('manager') ||
      roleLower.includes('coordinator') ||
      roleLower.includes('technical') ||
      roleLower.includes('director') ||
      roleLower.includes('trainer')
    );
  });

  const support = staff.filter(item => {
    return !headCoaches.includes(item) && !technical.includes(item);
  });

  const renderStaffCard = (item, isPremium = false) => {
    return (
      <div 
        key={item.id} 
        className="cd-staff-card" 
        style={{
          background: isPremium ? 'linear-gradient(135deg, var(--bg-2) 0%, rgba(59, 130, 246, 0.08) 100%)' : 'var(--bg-2)',
          padding: isPremium ? '24px' : '16px',
          borderRadius: 12,
          border: isPremium ? '1.5px solid var(--accent)' : '1px solid var(--line-soft)',
          display: 'flex',
          flexDirection: 'row',
          gap: 15,
          alignItems: 'center',
          width: isPremium ? '320px' : '100%',
          boxShadow: isPremium ? '0 8px 30px rgba(59, 130, 246, 0.15)' : '0 4px 15px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {isPremium && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 800,
            padding: '4px 10px',
            borderBottomLeftRadius: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            Leader
          </div>
        )}
        <window.PlayerPhoto playerId={item.staff_id} name={item.name} size={isPremium ? 64 : 52} fallbackUrl={item.photo_url} fallbackScale={item.photo_scale || 1} />
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontSize: isPremium ? 17 : 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--fg)'}}>
            {item.nickname || item.name || item.thai_name || 'Unnamed Staff'}
          </div>
          {((item.nickname || item.name) && item.thai_name) && (
            <div style={{color: 'var(--fg-dim)', fontSize: isPremium ? 13 : 12, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.thai_name}</div>
          )}
          {(!item.nickname && item.name) && (
            <div style={{color: 'var(--fg-dim)', fontSize: isPremium ? 13 : 12, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.name}</div>
          )}
          <div style={{color: isPremium ? 'var(--accent)' : 'var(--accent-dim, #60a5fa)', fontSize: 13, fontWeight: 600, marginTop: 4}}>{item.role}</div>
          {item.notes && (
            <div 
              style={{color: 'var(--fg-dim)', fontSize: 11, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} 
              title={item.notes}
            >
              {item.notes}
            </div>
          )}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 5, alignSelf: 'flex-start', zIndex: 5}}>
          <button className="btn-ghost sm" onClick={() => setEditingItem(item)} style={{padding: '4px 8px', fontSize: 13}}>✎</button>
          <button className="btn-ghost sm" style={{color: 'var(--err)', padding: '4px 8px', fontSize: 13}} onClick={() => handleDelete(item.id)}>✕</button>
        </div>
      </div>
    );
  };

  return (
    <div className="cd-staff-wrap" style={{padding: '30px', animation: 'fade-in 0.3s ease'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <h2 style={{margin: 0, fontFamily: 'var(--font-display)', fontSize: 28}}>Staff & Roles</h2>
        <button className="btn-primary" onClick={() => { setEditingItem({ isBatchAdd: true }); setSelectedBatchIds([]); }}>+ Add Staff</button>
      </div>

      {editingItem && (
        <div className="cd-form-modal" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 9999}}>
          <div style={{background: 'var(--bg-1)', padding: 30, borderRadius: 12, width: 400, maxWidth: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column'}}>
            
            {editingItem.isBatchAdd ? (
              <>
                <h3 style={{marginTop: 0, marginBottom: 10, fontFamily: 'var(--font-display)', fontSize: 22}}>Add Staff Members</h3>
                <div style={{fontSize: 13, color: 'var(--fg-dim)', marginBottom: 15}}>
                  Select staff members to add. They will be added with their default positions.
                </div>
                
                <div className="hide-scroll" style={{flex: 1, overflowY: 'auto', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 5}}>
                  {availableStaff.length === 0 ? (
                    <div style={{color: 'var(--fg-dim)', fontSize: 14, textAlign: 'center', padding: '40px 0'}}>
                      All registered staff are already added to this camp.
                    </div>
                  ) : (
                    availableStaff.map(s => {
                      const isSelected = selectedBatchIds.includes(s.id);
                      const displayName = s.nickname || s.name || s.thai_name || 'Unnamed Staff';
                      const secondaryName = (s.nickname || s.name) ? s.thai_name : '';
                      
                      return (
                        <label 
                          key={s.id} 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 16px',
                            background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-2)',
                            border: isSelected ? '1px solid var(--accent)' : '1px solid var(--line-soft)',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => {
                              setSelectedBatchIds(prev => 
                                prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                              );
                            }}
                            style={{width: 18, height: 18, accentColor: 'var(--accent)'}}
                          />
                          <window.PlayerPhoto 
                            playerId={s.id} 
                            name={s.name} 
                            size={40} 
                            fallbackUrl={s.photo_url} 
                            fallbackScale={s.photo_scale || 1} 
                          />
                          <div style={{display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1}}>
                            <span style={{fontWeight: 600, fontSize: 14, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                              {displayName} {secondaryName ? `(${secondaryName})` : ''}
                            </span>
                            <span style={{fontSize: 12, color: 'var(--accent)', marginTop: 2}}>{s.role_category}</span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                
                <div style={{display:'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--line-soft)', paddingTop: 15}}>
                  <button className="btn-ghost" onClick={() => { setEditingItem(null); setSelectedBatchIds([]); }}>Cancel</button>
                  <button 
                    className="btn-primary" 
                    onClick={() => handleSaveBatch(selectedBatchIds)}
                    disabled={selectedBatchIds.length === 0}
                    style={{opacity: selectedBatchIds.length === 0 ? 0.6 : 1}}
                  >
                    Add Selected ({selectedBatchIds.length})
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{marginTop: 0, marginBottom: 15, fontFamily: 'var(--font-display)', fontSize: 22}}>Edit Staff Member</h3>
                <div style={{marginBottom: 15}}>
                  <label style={{display:'block', fontSize:12, marginBottom:4, color: 'var(--fg-dim)'}}>Name</label>
                  <div style={{fontSize: 16, fontWeight: 700, padding: '10px 12px', background: 'var(--bg-2)', border: '1px solid var(--line-soft)', borderRadius: 8}}>
                    {editingItem.nickname || editingItem.name || editingItem.thai_name}
                  </div>
                </div>
                <div style={{marginBottom: 15}}>
                  <label style={{display:'block', fontSize:12, marginBottom:4, color: 'var(--fg-dim)'}}>Role</label>
                  <input 
                    className="camp-input" 
                    placeholder="e.g. Head Coach, Physio..." 
                    value={editingItem.role || ''} 
                    onChange={e => setEditingItem({...editingItem, role: e.target.value})} 
                  />
                </div>
                <div style={{marginBottom: 20}}>
                  <label style={{display:'block', fontSize:12, marginBottom:4, color: 'var(--fg-dim)'}}>Notes</label>
                  <textarea 
                    className="camp-input" 
                    rows={2} 
                    value={editingItem.notes || ''} 
                    onChange={e => setEditingItem({...editingItem, notes: e.target.value})} 
                  />
                </div>
                <div style={{display:'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--line-soft)', paddingTop: 15}}>
                  <button className="btn-ghost" onClick={() => setEditingItem(null)}>Cancel</button>
                  <button className="btn-primary" onClick={() => handleSave(editingItem)}>Save Changes</button>
                </div>
              </>
            )}
            
          </div>
        </div>
      )}

      {loading ? <div className="callup-msg">Loading staff...</div> : (
        staff.length === 0 ? (
          <div className="callup-msg">No staff members added yet.</div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
            {/* TIER 1: HEAD COACH (Centered at top) */}
            <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12}}>
                ★ Head of Staff
              </div>
              <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20}}>
                {headCoaches.length > 0 ? (
                  headCoaches.map(item => renderStaffCard(item, true))
                ) : (
                  <div style={{
                    border: '2px dashed var(--line-soft)',
                    borderRadius: 12,
                    padding: '16px 30px',
                    color: 'var(--fg-dim)',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    width: 320
                  }}>
                    No Head Coach assigned
                  </div>
                )}
              </div>
            </div>

            {/* Tree Branch Connectors */}
            {staff.length > 0 && (headCoaches.length > 0 || technical.length > 0 || support.length > 0) && (
              <div className="cd-org-connector" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '10px 0'}}>
                {/* Line down from Head Coach */}
                {headCoaches.length > 0 && (
                  <div style={{width: 2, height: 20, background: 'var(--accent)', opacity: 0.5}}></div>
                )}
                {/* Horizontal branch line */}
                {technical.length > 0 && support.length > 0 ? (
                  <div style={{width: '50%', height: 2, background: 'var(--line-soft)', position: 'relative'}}>
                    <div style={{position: 'absolute', left: 0, top: 0, width: 2, height: 15, background: 'var(--line-soft)'}}></div>
                    <div style={{position: 'absolute', right: 0, top: 0, width: 2, height: 15, background: 'var(--line-soft)'}}></div>
                  </div>
                ) : (
                  (technical.length > 0 || support.length > 0) && (
                    <div style={{width: 2, height: 15, background: 'var(--line-soft)'}}></div>
                  )
                )}
              </div>
            )}

            {/* Split layout for Tiers 2 & 3 */}
            <div className="cd-org-branches" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 30,
              width: '100%',
              alignItems: 'start',
              marginTop: 10
            }}>
              {/* TIER 2: TECHNICAL & COACHING STAFF */}
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--line-soft)',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: 200
              }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--fg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}>
                  <span style={{width: 8, height: 8, background: '#3b82f6', borderRadius: '50%'}}></span>
                  Technical & Coaching Team
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 15,
                  width: '100%'
                }}>
                  {technical.length > 0 ? (
                    technical.map(item => renderStaffCard(item))
                  ) : (
                    <div style={{color: 'var(--fg-dim)', fontSize: 13, textAlign: 'center', padding: '40px 0'}}>
                      No technical staff assigned.
                    </div>
                  )}
                </div>
              </div>

              {/* TIER 3: SUPPORT & MEDICAL STAFF */}
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--line-soft)',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: 200
              }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--fg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}>
                  <span style={{width: 8, height: 8, background: '#f59e0b', borderRadius: '50%'}}></span>
                  Support & Medical Team
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 15,
                  width: '100%'
                }}>
                  {support.length > 0 ? (
                    support.map(item => renderStaffCard(item))
                  ) : (
                    <div style={{color: 'var(--fg-dim)', fontSize: 13, textAlign: 'center', padding: '40px 0'}}>
                      No support staff assigned.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
function CampBMITab({ camp, campPlayers }) {
  const [wellnessData, setWellnessData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    const fetchWellness = async () => {
      try {
        const res = await fetch(`https://thailand-wnt-database.pages.dev/api/camp-wellness?camp_id=${camp.id}`);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        if (active) {
          setWellnessData(data.entries || []);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (active) setLoading(false);
      }
    };
    fetchWellness();
    return () => { active = false; };
  }, [camp.id]);

  if (loading) {
    return <div style={{padding: 40, textAlign: 'center', color: 'var(--fg-dim)'}}>Loading BMI Data...</div>;
  }

  // Filter weights
  const weightRecords = wellnessData.filter(w => (w.session === 'AM' || w.session === 'Daily') && w.weight_before > 0);
  const dateSet = new Set(weightRecords.map(w => w.session_date));
  const dates = Array.from(dateSet).sort();

  // Create player rows
  const playerRows = campPlayers.map((p, idx) => {
    const heightM = p.height ? (p.height / 100).toFixed(2) : 0;
    
    // Get weight records for this player
    const pRecords = {};
    const pPeriods = {};
    let latestWeight = 0;
    let latestDate = '';
    
    dates.forEach(d => {
      const rec = weightRecords.find(w => w.player_id === p.id && w.session_date === d);
      if (rec && rec.weight_before) {
        pRecords[d] = rec.weight_before.toFixed(2);
        pPeriods[d] = rec.period || 0;
        if (d >= latestDate) {
          latestDate = d;
          latestWeight = rec.weight_before;
        }
      } else {
        pRecords[d] = '-';
        pPeriods[d] = 0;
      }
    });

    let bmi = 0;
    let result = '';
    let resultColor = '';
    if (latestWeight > 0 && heightM > 0) {
      bmi = (latestWeight / (heightM * heightM)).toFixed(2);
      if (bmi < 18.5) {
        result = 'Underweight';
        resultColor = '#eab308'; // yellow
      } else if (bmi >= 18.5 && bmi < 25) {
        result = 'Normal';
        resultColor = '#22c55e'; // green
      } else if (bmi >= 25 && bmi < 30) {
        result = 'Overweight';
        resultColor = '#f97316'; // orange
      } else {
        result = 'Obese';
        resultColor = '#ef4444'; // red
      }
    }

    return {
      no: idx + 1,
      id: p.id,
      name: p.name,
      nick: p.nick,
      heightM,
      weights: pRecords,
      periods: pPeriods,
      latestWeight,
      bmi: bmi > 0 ? bmi : '-',
      result,
      resultColor
    };
  });

  // Calculate Average
  let avgHeight = 0;
  let avgBmi = 0;
  const avgWeights = {};
  
  if (playerRows.length > 0) {
    let totalHeight = 0;
    let validHeightCount = 0;
    playerRows.forEach(p => {
      if (p.heightM > 0) {
        totalHeight += parseFloat(p.heightM);
        validHeightCount++;
      }
    });
    if (validHeightCount > 0) avgHeight = (totalHeight / validHeightCount).toFixed(2);

    dates.forEach(d => {
      let tW = 0;
      let cW = 0;
      playerRows.forEach(p => {
        if (p.weights[d] !== '-') {
          tW += parseFloat(p.weights[d]);
          cW++;
        }
      });
      avgWeights[d] = cW > 0 ? (tW / cW).toFixed(2) : '-';
    });

    let tBmi = 0;
    let cBmi = 0;
    playerRows.forEach(p => {
      if (p.bmi !== '-') {
        tBmi += parseFloat(p.bmi);
        cBmi++;
      }
    });
    if (cBmi > 0) avgBmi = (tBmi / cBmi).toFixed(2);
  }

  let avgResult = '';
  let avgResultColor = '';
  if (avgBmi > 0) {
    if (avgBmi < 18.5) { avgResult = 'Underweight'; avgResultColor = '#eab308'; }
    else if (avgBmi >= 18.5 && avgBmi < 25) { avgResult = 'Normal'; avgResultColor = '#22c55e'; }
    else if (avgBmi >= 25 && avgBmi < 30) { avgResult = 'Overweight'; avgResultColor = '#f97316'; }
    else { avgResult = 'Obese'; avgResultColor = '#ef4444'; }
  }

  return (
    <div style={{padding: '20px 40px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <div>
          <h2 style={{margin: 0, fontSize: 24, display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{fontSize: 28}}>⚖️</span> BMI & Morning Weights
          </h2>
          <div style={{color: 'var(--fg-dim)', marginTop: 5}}>Track daily morning weights and monitor athlete BMI classifications.</div>
        </div>
      </div>

      <div style={{background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--line-soft)', overflow: 'hidden'}}>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: 13}}>
            <thead>
              <tr style={{background: '#1d4ed8', color: '#fff'}}>
                <th colSpan={4 + dates.length + 2} style={{padding: '12px', fontSize: 16, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
                  BMI WOWEN'S A THAILAND NATIONAL TEAM
                </th>
              </tr>
              <tr style={{background: '#2563eb', color: '#fff'}}>
                <th style={{padding: '12px 10px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>No.</th>
                <th style={{padding: '12px 10px', textAlign: 'left', borderRight: '1px solid rgba(255,255,255,0.2)'}}>Name</th>
                <th style={{padding: '12px 10px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>Nickname</th>
                <th style={{padding: '12px 10px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>High(m.)</th>
                {dates.map((d, i) => {
                  const label = `Weight${i+1}(kg.)\n${d.split('-').reverse().slice(0,2).join('/')}`;
                  return (
                    <th key={d} style={{padding: '12px 10px', borderRight: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'pre-wrap'}}>
                      {label}
                    </th>
                  );
                })}
                <th style={{padding: '12px 10px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>Latest BMI</th>
                <th style={{padding: '12px 10px'}}>Result</th>
              </tr>
            </thead>
            <tbody>
              {playerRows.map((p, idx) => (
                <tr key={p.id} style={{borderBottom: '1px solid var(--line-soft)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}}>
                  <td style={{padding: '10px', borderRight: '1px solid var(--line-soft)'}}>{p.no}</td>
                  <td style={{padding: '10px', textAlign: 'left', fontWeight: 600, borderRight: '1px solid var(--line-soft)'}}>{p.name.toUpperCase()}</td>
                  <td style={{padding: '10px', borderRight: '1px solid var(--line-soft)'}}>{p.nick ? p.nick.toUpperCase() : ''}</td>
                  <td style={{padding: '10px', borderRight: '1px solid var(--line-soft)'}}>{p.heightM}</td>
                  {dates.map(d => (
                    <td key={d} style={{
                      padding: '10px', 
                      borderRight: '1px solid var(--line-soft)', 
                      fontWeight: p.weights[d] !== '-' ? 600 : 400,
                      background: p.periods[d] ? '#ff0000' : 'transparent',
                      color: p.periods[d] ? '#fff' : 'inherit'
                    }}>
                      {p.weights[d]}
                    </td>
                  ))}
                  <td style={{padding: '10px', borderRight: '1px solid var(--line-soft)', fontWeight: 700}}>{p.bmi}</td>
                  <td style={{
                    padding: '10px', 
                    fontWeight: 700, 
                    color: p.resultColor === '#eab308' || p.resultColor === '#f97316' ? '#000' : '#fff',
                    background: p.resultColor || 'transparent'
                  }}>
                    {p.result}
                  </td>
                </tr>
              ))}
              <tr style={{background: '#3b82f6', color: '#fff', fontWeight: 700}}>
                <td colSpan={3} style={{padding: '12px 10px', textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.2)'}}>AVERAGE</td>
                <td style={{padding: '12px 10px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>{avgHeight}</td>
                {dates.map(d => (
                  <td key={d} style={{padding: '12px 10px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>
                    {avgWeights[d]}
                  </td>
                ))}
                <td style={{padding: '12px 10px', borderRight: '1px solid rgba(255,255,255,0.2)'}}>{avgBmi}</td>
                <td style={{
                    padding: '12px 10px',
                    color: avgResultColor === '#eab308' || avgResultColor === '#f97316' ? '#000' : '#fff',
                    background: avgResultColor || 'transparent'
                  }}>
                  {avgResult}
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{padding: '12px 10px', textAlign: 'center', color: '#ff0000', fontWeight: 600, borderRight: '1px solid var(--line-soft)'}}>***Period</td>
                <td style={{background: '#ff0000', borderRight: '1px solid var(--line-soft)'}}></td>
                <td colSpan={dates.length - 1 + 2}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════

function CampWellnessWrapperTab({ camp, campPlayers, campShirts }) {
  const [subTab, setSubTab] = React.useState('daily');
  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <div style={{display: 'flex', padding: '10px 20px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line-soft)', gap: 10}}>
        <button className={`btn-ghost sm ${subTab === 'daily' ? 'active' : ''}`} style={subTab==='daily'?{background:'var(--accent)',color:'#fff'}:{}} onClick={() => setSubTab('daily')}>Daily Readiness</button>
        <button className={`btn-ghost sm ${subTab === 'bmi' ? 'active' : ''}`} style={subTab==='bmi'?{background:'var(--accent)',color:'#fff'}:{}} onClick={() => setSubTab('bmi')}>BMI & Weights</button>
      </div>
      <div style={{flex: 1, overflowY: 'auto'}}>
        {subTab === 'daily' && window.CampSessionTab && <window.CampSessionTab camp={camp} campPlayers={campPlayers} campShirts={campShirts} />}
        {subTab === 'bmi' && <CampBMITab camp={camp} campPlayers={campPlayers} />}
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function CampDashboard({ camp, players, staff = [], onClose, persistCamp, setCamps, onSelectPlayer, t }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const campPlayers = players.filter(p => (camp.playerIds || []).includes(p.id));
  const campShirts = camp.playerShirts || {};
  
  const TABS = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'players',   label: '🧑‍🤝‍🧑 Players' },
    { id: 'wellness',  label: '❤️ Wellness & BMI' },
    { id: 'gps',       label: '🏃 GPS Performance' },
    { id: 'injury',    label: '🤕 Injury' },
    { id: 'schedule',  label: '📅 Schedule' },
    { id: 'staff',     label: '👔 Staff' },
  ];

  return (
    <div className="camp-dashboard-app" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-1)', zIndex: 9000, display: 'flex', flexDirection: 'column'}}>
      {/* Top Navigation Header */}
      <div className="cd-header" style={{display: 'flex', alignItems: 'center', padding: '0 20px', height: 70, borderBottom: '1px solid var(--line-soft)', background: 'var(--bg-2)'}}>
        <button className="btn-ghost" onClick={onClose} style={{marginRight: 20, flexShrink: 0}}>← Back</button>
        <div style={{flex: 1, minWidth: 150, marginRight: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden'}}>
          <div style={{fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={camp.name}>{camp.name}</div>
          <div style={{fontSize: 13, color: 'var(--fg-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={`${camp.team_level} ${camp.competition ? `· ${camp.competition}` : ''}`}>{camp.team_level} {camp.competition ? `· ${camp.competition}` : ''}</div>
        </div>
        <div className="cd-nav-tabs hide-scroll" style={{display: 'flex', gap: 5, height: '100%', alignItems: 'center', overflowX: 'auto', flexShrink: 0, maxWidth: '75%'}}>
          {TABS.map(tab => (
            <button key={tab.id} 
              className={`cd-nav-btn ${activeTab === tab.id ? 'on' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', padding: '0 15px', height: '100%', 
                fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--fg)' : 'var(--fg-dim)',
                borderBottom: activeTab === tab.id ? '3px solid var(--accent)' : '3px solid transparent',
                cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap', flexShrink: 0
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="cd-content" style={{flex: 1, overflowY: 'auto', background: 'var(--bg-1)'}}>
        {activeTab === 'dashboard' && <CampDashboardTab camp={camp} campPlayers={campPlayers} />}
        {activeTab === 'players'   && (
          <CampPlayersTab camp={camp} players={players} persistCamp={persistCamp} setCamps={setCamps} onSelectPlayer={onSelectPlayer} t={t} />
        )}
        {activeTab === 'wellness'  && <CampWellnessWrapperTab camp={camp} campPlayers={campPlayers} campShirts={campShirts} />}
        {activeTab === 'gps'       && window.GPSPerformanceTab ? <window.GPSPerformanceTab camp={camp} campPlayers={campPlayers} campShirts={campShirts} /> : null}
        {activeTab === 'injury'    && window.CampSquadTab ? <window.CampSquadTab camp={camp} campPlayers={campPlayers} campShirts={campShirts} /> : null}
        {activeTab === 'schedule'  && <CampScheduleTab camp={camp} />}
        {activeTab === 'staff'     && <CampStaffTab camp={camp} globalStaff={staff} setCamps={setCamps} />}
      </div>
    </div>
  );
}

window.CampDashboard = CampDashboard;


function CampDashboardOverall({ camp, activePlayers, injuryData, dashboardSchedules, matches, campPlayers, logoUrl, updateLogo, currentFifaRank, updateFifaRank }) {
  const [allWellness, setAllWellness] = useState([]);
  const [allGps, setAllGps] = useState([]);
  const [allStatus, setAllStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredClub, setHoveredClub] = useState(null);

  React.useEffect(() => {
    Promise.all([
      fetch(`/api/camp-wellness?camp_id=${camp.id}`).then(r => r.ok ? r.json() : {entries:[]}),
      fetch(`/api/camp-gps?camp_id=${camp.id}`).then(r => r.ok ? r.json() : {entries:[]}),
      fetch(`/api/camp-status?camp_id=${camp.id}`).then(r => r.ok ? r.json() : {statuses:[]})
    ]).then(([wellRes, gpsRes, statRes]) => {
      setAllWellness(wellRes.entries || []);
      setAllGps(gpsRes.entries || []);
      setAllStatus(statRes.statuses || []);
      setLoading(false);
    });
  }, [camp.id]);

  

  const injuredPlayers = allStatus.filter(s => {
    if (s.status === 'available' || s.status === 'modified') return false;
    if (isCanTrain(s.can_train)) return false;
    return true;
  });
  const injuredCount = injuredPlayers.length;
  const campMatches = (matches || []).filter(m => (!camp.camp_date || m.match_date >= camp.camp_date) && (!camp.camp_date_end || m.match_date <= camp.camp_date_end));
  let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
  campMatches.forEach(m => {
    gf += m.home_score;
    ga += m.away_score;
    if (m.home_score > m.away_score) wins++;
    else if (m.home_score === m.away_score) draws++;
    else losses++;
  });

  const minutesByPlayer = {};
  campMatches.forEach(m => {
    let lineup = [];
    try { lineup = typeof m.lineup === 'string' ? JSON.parse(m.lineup) : (m.lineup || []); } catch(e) {}
    lineup.forEach(p => {
      if (!minutesByPlayer[p.playerId]) {
        minutesByPlayer[p.playerId] = { mins: 0, goals: 0, assists: 0, matchBreakdown: [] };
      }
      const playedMins = parseInt(p.minutesPlayed) || 0;
      minutesByPlayer[p.playerId].mins += playedMins;
      minutesByPlayer[p.playerId].goals += (parseInt(p.goals) || 0);
      minutesByPlayer[p.playerId].assists += (parseInt(p.assists) || 0);
      
      if (playedMins > 0) {
        const opponent = m.opponent || 'Unknown Opponent';
        const dateStr = m.match_date ? m.match_date.substring(5) : ''; // e.g. "06-05"
        minutesByPlayer[p.playerId].matchBreakdown.push({
          opponent,
          dateStr,
          mins: playedMins
        });
      }
    });
  });
  const topMinutes = Object.keys(minutesByPlayer)
    .map(id => {
      const p = campPlayers?.find(x => x.id === id);
      return { 
        id, 
        name: p ? (p.nick || p.name) : 'Unknown', 
        image: p?.image, 
        mins: minutesByPlayer[id].mins, 
        goals: minutesByPlayer[id].goals, 
        assists: minutesByPlayer[id].assists,
        matchBreakdown: minutesByPlayer[id].matchBreakdown || []
      };
    })
    .filter(x => x.mins > 0)
    .sort((a,b) => b.mins - a.mins);

  const topGoals = [...topMinutes].filter(p => p.goals > 0).sort((a,b) => b.goals - a.goals);
  const topAssists = [...topMinutes].filter(p => p.assists > 0).sort((a,b) => b.assists - a.assists);

  const clubCounts = {};
  campPlayers?.forEach(p => {
    const c = p.club || 'Unattached';
    clubCounts[c] = (clubCounts[c] || 0) + 1;
  });
  const topClubs = Object.keys(clubCounts).map(c => ({ club: c, count: clubCounts[c] })).sort((a,b) => b.count - a.count);

  const readinessByDate = {};
  const loadByDate = {};
  allWellness.forEach(w => {
    if (!readinessByDate[w.session_date]) readinessByDate[w.session_date] = { score: 0, count: 0 };
    if ((w.session === 'AM' || w.session === 'Daily') && (w.sleep > 0 || w.stress > 0 || w.soreness > 0 || w.mood > 0 || w.appetite > 0)) {
      const score = ((w.sleep + w.stress + w.soreness + w.mood + w.appetite) / 50) * 100;
      readinessByDate[w.session_date].score += score;
      readinessByDate[w.session_date].count++;
    }
    if (!loadByDate[w.session_date]) loadByDate[w.session_date] = 0;
    if (w.rpe > 0 && w.duration > 0) {
      loadByDate[w.session_date] += (w.rpe * w.duration);
    }
  });

  // Calculate Match Load
  campMatches.forEach(m => {
    const d = m.match_date;
    if (!loadByDate[d]) loadByDate[d] = 0;
    let lineup = [];
    try { lineup = typeof m.lineup === 'string' ? JSON.parse(m.lineup) : (m.lineup || []); } catch(e) {}
    
    lineup.forEach(p => {
      const mins = parseInt(p.minutesPlayed) || 0;
      if (mins > 0) {
        // Find wellness for this player on match day to get their RPE
        const dayWellness = allWellness.filter(x => x.player_id === p.playerId && x.session_date === d);
        if (dayWellness.length > 0) {
          const matchSession = dayWellness.find(x => x.session === 'Match' || x.session === 'PM');
          const rpe = matchSession?.rpe || Math.max(...dayWellness.map(x => x.rpe || 0));
          if (rpe > 0) {
            // Avoid double counting if duration was already logged in 'Match' session
            const alreadyLoggedDuration = matchSession?.duration || 0;
            if (alreadyLoggedDuration === 0) {
              loadByDate[d] += (rpe * mins);
            }
          }
        }
      }
    });
  });

  const dates = [...new Set([...Object.keys(readinessByDate), ...Object.keys(loadByDate)])].sort();
  const avgReadinessOverall = dates.reduce((acc, d) => {
    const rd = readinessByDate[d];
    if (rd && rd.count > 0) return acc + (rd.score / rd.count);
    return acc;
  }, 0) / (dates.filter(d => readinessByDate[d] && readinessByDate[d].count > 0).length || 1);

  // GPS Highlights
  const gpsSumByPlayer = {};
  allGps.forEach(g => {
    if (!gpsSumByPlayer[g.player_id]) gpsSumByPlayer[g.player_id] = { total_dist: 0, max_vel: 0 };
    gpsSumByPlayer[g.player_id].total_dist += (g.total_dist || 0);
    if ((g.max_vel || 0) > gpsSumByPlayer[g.player_id].max_vel) gpsSumByPlayer[g.player_id].max_vel = g.max_vel;
  });
  const gpsArr = Object.keys(gpsSumByPlayer).map(id => {
    const p = campPlayers?.find(x => x.id === id);
    const pos = p?.pos || 'Unknown';
    const posGroup = window.TWNT_DATA?.POSITION_GROUPS?.[pos] || pos;
    return { id, name: p ? (p.nick || p.name) : 'Unknown', image: p?.image, pos, posGroup, ...gpsSumByPlayer[id] };
  });
  const topDist = [...gpsArr].sort((a,b) => b.total_dist - a.total_dist).slice(0, 5);
  const topSpeed = [...gpsArr].sort((a,b) => b.max_vel - a.max_vel).slice(0, 5);

  // FIFA calculations
  const totalRankChange = matches.reduce((sum, m) => sum + (m.fifa_rank_change || 0), 0);
  const totalPtsChange = matches.reduce((sum, m) => sum + (m.fifa_pts_change || 0), 0);

  return (
    <div className="exec-report-container" style={{animation: 'fade-in 0.3s ease'}}>
      {loading ? (
        <div style={{padding: 40, textAlign: 'center', color: 'var(--fg-dim)'}}>Gathering Camp Data...</div>
      ) : (
        <>
          <div className="no-print" style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 20}}>
            <button className="btn-primary" onClick={() => window.print()} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 24, fontSize: 14, fontWeight: 600}}>
              🖨️ Export to PDF / Print
            </button>
          </div>

          <div className="exec-header" style={{background: 'var(--bg-2)', border: '1px solid var(--line-soft)', borderRadius: 16, padding: '30px 40px', marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', breakInside: 'avoid'}}>
            <div>
              <div style={{color: 'var(--primary)', fontSize: 14, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10}}>Thailand National Team</div>
              <h2 style={{margin: '0 0 10px 0', fontSize: 32, fontFamily: 'var(--font-display)', color: 'var(--fg)'}}>Camp Report</h2>
              <div style={{fontSize: 18, color: 'var(--fg-base)', fontWeight: 500}}>{camp.name || 'Training Camp'}</div>
              <div style={{fontSize: 14, color: 'var(--fg-dim)', marginTop: 5}}>{camp.camp_date} to {camp.camp_date_end}</div>
            </div>
            <div style={{display: 'flex', gap: 40, alignItems: 'center', textAlign: 'right'}}>
              {/* FIFA Changes */}
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: 13, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4}}>Total FIFA Change</div>
                <div style={{fontSize: 18, fontWeight: 700, color: totalPtsChange > 0 ? '#10b981' : totalPtsChange < 0 ? '#ef4444' : 'var(--fg-base)'}}>
                  {totalPtsChange > 0 ? '+' : ''}{totalPtsChange.toFixed(2)} pts
                </div>
                <div style={{fontSize: 14, fontWeight: 600, color: totalRankChange > 0 ? '#10b981' : totalRankChange < 0 ? '#ef4444' : 'var(--fg-dim)'}}>
                  {totalRankChange > 0 ? '+' : ''}{totalRankChange} rank
                </div>
              </div>

              {/* Current FIFA Rank */}
              <div style={{textAlign: 'right', cursor: 'pointer'}} onClick={updateFifaRank} title="Click to update Current FIFA Rank">
                <div style={{fontSize: 13, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4}}>Current FIFA Rank</div>
                <div style={{fontSize: 32, fontWeight: 800, color: 'var(--fg)', fontFamily: 'var(--font-display)', lineHeight: 1}}>{currentFifaRank}</div>
              </div>

              {/* Logo & Date */}
              <div style={{textAlign: 'right'}}>
                <div onClick={updateLogo} style={{cursor: 'pointer', width: 80, height: 80, background: 'var(--bg-3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 10, marginLeft: 'auto', overflow: 'hidden'}} title="Click to change logo">
                  {logoUrl ? <img src={logoUrl} style={{width: '100%', height: '100%', objectFit: 'contain', padding: 8}}/> : '🇹🇭'}
                </div>
                <div style={{fontSize: 12, color: 'var(--fg-dim)'}}>Generated: {new Date().toLocaleDateString('en-GB')}</div>
              </div>
            </div>
          </div>

          {/* 📊 Overview Section */}
          <div style={{marginBottom: 40}} className="cd-section-wrap">
            <h3 style={{fontSize: 22, fontWeight: 800, color: 'var(--fg)', marginBottom: 20, paddingBottom: 10, borderBottom: '2px solid var(--line-soft)', display: 'flex', alignItems: 'center', gap: 10, breakAfter: 'avoid', pageBreakAfter: 'avoid'}}>
              <span style={{fontSize: 24}}>📊</span> Overview
            </h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20}}>
              <div className="exec-card" style={{background: 'var(--bg-2)', padding: 20, borderRadius: 12, border: '1px solid var(--line-soft)', breakInside: 'avoid', height: '100%'}}>
                <div className="metric-title" style={{color: 'var(--fg-dim)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10}}>Squad Size</div>
                <div className="metric-value" style={{fontSize: 28, fontWeight: 700, color: 'var(--fg)'}}>{activePlayers.length} <span style={{fontSize: 14, color: 'var(--fg-dim)'}}>Players</span></div>
              </div>
              
              <div className="exec-card" style={{background: 'var(--bg-2)', padding: 20, borderRadius: 12, border: '1px solid var(--line-soft)', breakInside: 'avoid', height: '100%'}}>
                <div className="metric-title" style={{color: 'var(--fg-dim)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10}}>Match Record</div>
                <div className="metric-value" style={{fontSize: 28, fontWeight: 700, color: 'var(--fg)'}}>{wins}W {draws}D {losses}L</div>
              </div>

              <div className="exec-card" style={{background: 'var(--bg-2)', padding: 20, borderRadius: 12, border: '1px solid var(--line-soft)', breakInside: 'avoid', height: '100%'}}>
                <div className="metric-title" style={{color: 'var(--fg-dim)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10}}>Avg Team Readiness</div>
                <div className="metric-value" style={{fontSize: 28, fontWeight: 700, color: avgReadinessOverall >= 80 ? '#22c55e' : avgReadinessOverall >= 60 ? '#eab308' : '#ef4444'}}>{Math.round(avgReadinessOverall)}%</div>
                <div className="metric-subtitle" style={{fontSize: 14, color: 'var(--fg-base)', marginTop: 5}}>Based on Daily Wellness</div>
              </div>

              <div className="exec-card" style={{background: 'var(--bg-2)', padding: 20, borderRadius: 12, border: '1px solid var(--line-soft)', height: '100%'}}>
                <div className="metric-title" style={{color: 'var(--fg-dim)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10}}>Medical Status</div>
                <div className="metric-value" style={{fontSize: 28, fontWeight: 700, color: injuredCount > 0 ? '#ef4444' : '#22c55e'}}>{injuredCount} <span style={{fontSize: 14, color: 'var(--fg-dim)'}}>Injured</span></div>
                <div className="metric-subtitle" style={{fontSize: 14, color: 'var(--fg-base)', marginTop: 5}}>{activePlayers.length - injuredCount} fully available</div>
              </div>
            </div>
          </div>

          {/* ⚽ Match Performance Section */}
          <div style={{marginBottom: 40}} className="cd-section-wrap">
            <h3 style={{fontSize: 22, fontWeight: 800, color: 'var(--fg)', marginBottom: 20, paddingBottom: 10, borderBottom: '2px solid var(--line-soft)', display: 'flex', alignItems: 'center', gap: 10, breakAfter: 'avoid', pageBreakAfter: 'avoid'}}>
              <span style={{fontSize: 24}}>⚽</span> Match Performance
            </h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20, marginBottom: 20, alignItems: 'stretch'}}>
              {/* Match Results */}
              <div className="exec-card" style={{background: 'var(--bg-2)', padding: 24, borderRadius: 12, border: '1px solid var(--line-soft)'}}>
                <h3 style={{margin: '0 0 20px 0', fontSize: 18, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 8}}>🏆 Match Results</h3>
                {campMatches.length === 0 ? (
                  <div style={{color: 'var(--fg-dim)', fontSize: 14, padding: '20px 0', textAlign: 'center'}}>No matches recorded during this camp.</div>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: 15}}>
                    {campMatches.map(m => (
                      <div key={m.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 15, borderBottom: '1px solid var(--line-soft)'}}>
                        <div>
                          <div style={{fontWeight: 600, fontSize: 16, color: 'var(--fg)'}}>vs {m.opponent}</div>
                          <div style={{fontSize: 12, color: 'var(--fg-dim)', marginTop: 4}}>{m.match_date} • {m.competition}</div>
                        </div>
                        <div style={{fontSize: 22, fontWeight: 800, color: m.home_score > m.away_score ? '#22c55e' : m.home_score === m.away_score ? '#eab308' : '#ef4444'}}>
                          {m.home_score} - {m.away_score}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Goals & Assists */}
              <div className="exec-card" style={{background: 'var(--bg-2)', padding: 24, borderRadius: 12, border: '1px solid var(--line-soft)'}}>
                <h3 style={{margin: '0 0 20px 0', fontSize: 18, color: 'var(--fg)'}}>🎯 Goals & Assists</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 30}}>
                  <div>
                    <div style={{fontSize: 12, fontWeight: 700, color: 'var(--fg-dim)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1}}>Top Scorers</div>
                    {topGoals.length === 0 ? <div style={{fontSize: 14, color: 'var(--fg-dim)'}}>No goals recorded yet.</div> : topGoals.map((p, i) => (
                      <div key={p.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                        <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                          <span style={{width: 20, height: 20, background: 'var(--bg-3)', color: 'var(--fg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700}}>{i+1}</span>
                          <window.PlayerPhoto playerId={p.id} name={p.name} size={32} />
                          <span style={{fontSize: 15, fontWeight: 600, color: 'var(--fg)'}}>{p.name}</span>
                        </div>
                        <div style={{fontSize: 16, fontWeight: 800, color: '#22c55e'}}>{p.goals}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize: 12, fontWeight: 700, color: 'var(--fg-dim)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1}}>Top Assists</div>
                    {topAssists.length === 0 ? <div style={{fontSize: 14, color: 'var(--fg-dim)'}}>No assists recorded yet.</div> : topAssists.map((p, i) => (
                      <div key={p.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                        <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                          <span style={{width: 20, height: 20, background: 'var(--bg-3)', color: 'var(--fg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700}}>{i+1}</span>
                          <window.PlayerPhoto playerId={p.id} name={p.name} size={32} />
                          <span style={{fontSize: 15, fontWeight: 600, color: 'var(--fg)'}}>{p.name}</span>
                        </div>
                        <div style={{fontSize: 16, fontWeight: 800, color: '#3b82f6'}}>{p.assists}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📋 Squad Information Section */}
          <div style={{marginBottom: 40}} className="cd-section-wrap">
            <h3 style={{fontSize: 22, fontWeight: 800, color: 'var(--fg)', marginBottom: 20, paddingBottom: 10, borderBottom: '2px solid var(--line-soft)', display: 'flex', alignItems: 'center', gap: 10, breakAfter: 'avoid', pageBreakAfter: 'avoid'}}>
              <span style={{fontSize: 24}}>📋</span> Squad Details
            </h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20, alignItems: 'flex-start'}}>
              {/* Club Representation */}
              <div className="exec-card" style={{background: 'var(--bg-2)', padding: 24, borderRadius: 12, border: '1px solid var(--line-soft)'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <h3 style={{margin: 0, fontSize: 18, color: 'var(--fg)'}}>🏟️ Club Representation</h3>
                  </div>
                  {topClubs.length > 0 && (
                    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
                      {Array.from(new Set(topClubs.map(c => window.TWNT_DATA?.CLUBS?.find(x => x.code === c.club)?.country).filter(Boolean))).map(country => {
                        const COUNTRY_COLORS = {
                          THA: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                          USA: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                          GBR: 'linear-gradient(90deg, #ef4444, #f87171)',
                          JPN: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                          TPE: 'linear-gradient(90deg, #10b981, #34d399)',
                          CHN: 'linear-gradient(90deg, #ec4899, #f472b6)',
                          SWE: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
                          PHL: 'linear-gradient(90deg, #eab308, #facc15)',
                          IDN: 'linear-gradient(90deg, #6366f1, #818cf8)',
                          DNK: 'linear-gradient(90deg, #14b8a6, #2dd4bf)',
                        };
                        const cColor = COUNTRY_COLORS[country] || 'linear-gradient(90deg, #9ca3af, #d1d5db)';
                        return (
                          <div key={country} style={{display: 'flex', alignItems: 'center', gap: 4}}>
                            <div style={{width: 10, height: 10, borderRadius: '50%', background: cColor}}></div>
                            <span style={{fontSize: 11, fontWeight: 700, color: 'var(--fg-dim)'}}>{country}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {topClubs.length === 0 ? (
                  <div style={{color: 'var(--fg-dim)', fontSize: 14, padding: '20px 0', textAlign: 'center'}}>No club data available.</div>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                    {topClubs.map((c, i) => {
                      const pct = Math.max(2, (c.count / topClubs[0].count) * 100);
                      const clubInfo = window.TWNT_DATA?.CLUBS?.find(x => x.code === c.club);
                      const clubName = clubInfo?.name || c.club;
                      const COUNTRY_COLORS = {
                        THA: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                        USA: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                        GBR: 'linear-gradient(90deg, #ef4444, #f87171)',
                        JPN: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                        TPE: 'linear-gradient(90deg, #10b981, #34d399)',
                        CHN: 'linear-gradient(90deg, #ec4899, #f472b6)',
                        SWE: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
                        PHL: 'linear-gradient(90deg, #eab308, #facc15)',
                        IDN: 'linear-gradient(90deg, #6366f1, #818cf8)',
                        DNK: 'linear-gradient(90deg, #14b8a6, #2dd4bf)',
                      };
                      const barColor = clubInfo?.country && COUNTRY_COLORS[clubInfo.country] ? COUNTRY_COLORS[clubInfo.country] : 'linear-gradient(90deg, #9ca3af, #d1d5db)';
                      const playersInClub = campPlayers?.filter(p => (p.club || 'Unattached') === c.club) || [];
                      return (
                        <div 
                          key={c.club} 
                          style={{display: 'flex', alignItems: 'center', gap: 12, position: 'relative'}}
                          onMouseEnter={() => setHoveredClub(c.club)}
                          onMouseLeave={() => setHoveredClub(null)}
                        >
                          {/* Beautiful Custom Popover Tooltip */}
                          {hoveredClub === c.club && playersInClub.length > 0 && (
                            <div style={{
                              position: 'absolute',
                              left: '60px',
                              bottom: '26px',
                              background: 'rgba(15, 23, 42, 0.95)',
                              backdropFilter: 'blur(10px)',
                              border: '1.5px solid var(--line-soft)',
                              color: 'var(--fg)',
                              padding: '12px',
                              borderRadius: '12px',
                              boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
                              zIndex: 1000,
                              width: '280px',
                              pointerEvents: 'none',
                            }}>
                              <div style={{fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#60a5fa', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line-soft)', paddingBottom: 6}}>
                                <span>{clubName}</span>
                                <span style={{color: 'var(--fg-dim)'}}>{c.count} Player(s)</span>
                              </div>
                              <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                                {playersInClub.map(p => (
                                  <div key={p.id} style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 12}}>
                                    <window.PlayerPhoto playerId={p.id} name={p.name} size={24} />
                                    <div style={{display: 'flex', flexDirection: 'column', minWidth: 0}}>
                                      <span style={{fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                        {p.name}
                                      </span>
                                      <span style={{fontSize: 10, color: 'var(--fg-dim)'}}>
                                        {p.thai_name} {p.nick ? `(${p.nick})` : ''}
                                      </span>
                                    </div>
                                    <div style={{marginLeft: 'auto', flexShrink: 0}}>
                                      <window.PosBadge pos={p.pos} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div style={{width: 20, textAlign: 'center', fontWeight: 800, color: 'var(--fg-dim)', fontSize: 14}}>{i+1}</div>
                          <image-slot id={`clublogo-${c.club}`} shape="rounded" radius="4" style={{width:'24px', height:'24px', flex:'0 0 24px'}}></image-slot>
                          <div style={{width: 140, fontWeight: 600, fontSize: 14, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{clubName}</div>
                          <div style={{flex: 1, height: 20, background: 'var(--bg-1)', borderRadius: 10, overflow: 'hidden', position: 'relative'}}>
                            <div style={{height: '100%', width: `${pct}%`, background: barColor, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8}}>
                              {pct > 15 && <span style={{fontWeight: 800, color: '#fff', fontSize: 12}}>{c.count}</span>}
                            </div>
                            {pct <= 15 && <div style={{position: 'absolute', left: `max(${pct}%, 8px)`, top: 0, height: '100%', display: 'flex', alignItems: 'center'}}><span style={{fontWeight: 800, color: 'var(--fg)', fontSize: 12}}>{c.count}</span></div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Medical Summary */}
              <div className="exec-card" style={{background: 'var(--bg-2)', padding: 24, borderRadius: 12, border: '1px solid var(--line-soft)'}}>
                <h3 style={{margin: '0 0 20px 0', fontSize: 18, color: 'var(--fg)'}}>🏥 Medical & Rehab</h3>
                {injuredPlayers.length === 0 ? (
                  <div style={{color: '#22c55e', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8}}>
                    <span style={{fontSize: 20}}>✅</span> No players currently on the injury or rehab list. The squad is fully fit.
                  </div>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                    {injuredPlayers.map(inj => {
                      const p = campPlayers?.find(x => x.id === inj.player_id);
                      const playerName = p ? (p.name || p.nick) : 'Unknown Player';
                      return (
                        <div key={inj.player_id} style={{background: 'var(--bg-1)', padding: 12, borderRadius: 8, borderLeft: `4px solid ${inj.status === 'injured' ? '#ef4444' : '#eab308'}`}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8}}>
                            <window.PlayerPhoto playerId={inj.player_id} name={playerName} size={32} />
                            <div>
                              <div style={{fontWeight: 700, fontSize: 14, color: 'var(--fg)'}}>{playerName}</div>
                              <div style={{fontSize: 12, color: 'var(--fg-base)'}}>Status: <span style={{fontWeight: 600, textTransform: 'capitalize'}}>{inj.status}</span></div>
                            </div>
                          </div>
                          <div style={{fontSize: 12, color: 'var(--fg-dim)', background: 'var(--bg-2)', padding: '6px 10px', borderRadius: 4, fontStyle: 'italic'}}>"{inj.injury_note || inj.notes || inj.treatment_plan || 'No specific notes provided.'}"</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{marginBottom: 40}} className="cd-section-wrap">

            {/* Minutes Played (Horizontal Column Chart) */}
            <div className="exec-card" style={{background: 'var(--bg-2)', padding: 24, borderRadius: 12, border: '1px solid var(--line-soft)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20}}>
                <h3 style={{margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--fg)'}}>⏱️ Minutes Played</h3>
              </div>
              {topMinutes.length === 0 ? (
                <div style={{color: 'var(--fg-dim)', fontSize: 14, padding: '20px 0', textAlign: 'center'}}>No match data available.</div>
              ) : (
                <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, overflowX: 'auto', paddingTop: 100, paddingBottom: 15}}>
                  {topMinutes.map((p, i) => {
                    const maxMins = campMatches && campMatches.length > 0 ? campMatches.length * 90 : Math.max(...topMinutes.map(x => x.mins), 90);
                    const rawPct = (p.mins / maxMins) * 100;
                    const pct = isNaN(rawPct) ? 0 : Math.max(2, Math.min(rawPct, 100));
                    const isTop3 = i < 3;
                    const isFirst = i === 0 || i === 1;
                    const isLast = i === topMinutes.length - 1 || i === topMinutes.length - 2;
                    const tooltipClass = `cd-bar-tooltip ${isFirst ? 'cd-bar-tooltip-left' : isLast ? 'cd-bar-tooltip-right' : ''}`;
                    return (
                      <div key={p.id} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50}} className="cd-bar-container">
                        <div className={tooltipClass}>
                          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 6, color: '#fff' }}>
                            {p.name} <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginLeft: 4 }}>({p.mins} mins)</span>
                          </div>
                          {p.matchBreakdown && p.matchBreakdown.length > 0 ? (
                            p.matchBreakdown.map((m, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '2px 0' }}>
                                <span style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: 12 }}>⚔️</span> vs {m.opponent}
                                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>({m.dateStr})</span>
                                </span>
                                <strong style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{m.mins}'</strong>
                              </div>
                            ))
                          ) : (
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', padding: '2px 0' }}>No match minutes recorded</div>
                          )}
                        </div>

                        <div style={{height: 150, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width: '100%'}}>
                          <div style={{fontSize: 11, fontWeight: 800, color: 'var(--fg)', marginBottom: 4}}>{p.mins}</div>
                          <div style={{height: `${pct}%`, width: 24, background: isTop3 ? 'linear-gradient(180deg, #10b981, #3b82f6)' : '#10b981', borderRadius: '4px 4px 0 0', opacity: isTop3 ? 1 : 0.7}}></div>
                        </div>
                        <div style={{height: 55, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8}}>
                          <window.PlayerPhoto playerId={p.id} name={p.name} size={28} />
                          <div style={{fontSize: 10, fontWeight: 700, color: 'var(--fg)', marginTop: 4, whiteSpace: 'nowrap', maxWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center'}}>{p.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 🏃‍♂️ Wellness & Physical Section */}
          <div style={{marginBottom: 40}} className="cd-section-wrap">
            <h3 style={{fontSize: 22, fontWeight: 800, color: 'var(--fg)', marginBottom: 20, paddingBottom: 10, borderBottom: '2px solid var(--line-soft)', display: 'flex', alignItems: 'center', gap: 10, breakAfter: 'avoid', pageBreakAfter: 'avoid'}}>
              <span style={{fontSize: 24}}>🏃‍♂️</span> Wellness & Physical
            </h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20}}>
              <div className="exec-card" style={{background: 'var(--bg-2)', padding: 24, borderRadius: 12, border: '1px solid var(--line-soft)'}}>
                <h3 style={{margin: '0 0 20px 0', fontSize: 18, color: 'var(--fg)'}}>📈 Team Readiness Trend</h3>
                <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, paddingBottom: 15, borderBottom: '1px solid var(--line-soft)', marginTop: 20}}>
                  {dates.map(d => {
                    const rd = readinessByDate[d];
                    const val = rd && rd.count > 0 ? (rd.score / rd.count) : 0;
                    const color = val >= 80 ? '#22c55e' : val >= 60 ? '#eab308' : '#ef4444';
                    return (
                      <div key={d} style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', position: 'relative'}}>
                        <div style={{fontSize: 11, fontWeight: 700, color: 'var(--fg)', marginBottom: 6, opacity: val > 0 ? 1 : 0}}>{val ? Math.round(val) : ''}</div>
                        <div style={{height: `${val}%`, background: color, width: '100%', minWidth: 10, maxWidth: 20, borderRadius: '4px 4px 0 0', opacity: 0.9}}></div>
                        <div style={{position: 'absolute', bottom: -22, fontSize: 10, color: 'var(--fg-dim)', whiteSpace: 'nowrap', fontWeight: 500}}>{d.substring(5)}</div>
                      </div>
                    );
                  })}
                </div>
                {dates.length === 0 && <div style={{color: 'var(--fg-dim)', fontSize: 14, textAlign: 'center', marginTop: -80}}>No wellness data collected yet.</div>}
              </div>

              <div className="exec-card" style={{background: 'var(--bg-2)', padding: 24, borderRadius: 12, border: '1px solid var(--line-soft)'}}>
                <h3 style={{margin: '0 0 20px 0', fontSize: 18, color: 'var(--fg)'}}>🔋 Daily Load (RPE x Mins)</h3>
                <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, paddingBottom: 15, borderBottom: '1px solid var(--line-soft)', marginTop: 20}}>
                  {dates.map(d => {
                    const val = loadByDate[d] || 0;
                    const height = Math.min((val / 20000) * 100, 100);
                    return (
                      <div key={d} style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', position: 'relative'}}>
                        <div style={{fontSize: 11, fontWeight: 700, color: 'var(--fg)', marginBottom: 6, opacity: val > 0 ? 1 : 0}}>{val ? Math.round(val/1000)+'k' : ''}</div>
                        <div style={{height: `${height}%`, background: '#3b82f6', width: '100%', minWidth: 10, maxWidth: 20, borderRadius: '4px 4px 0 0', opacity: 0.9}}></div>
                        <div style={{position: 'absolute', bottom: -22, fontSize: 10, color: 'var(--fg-dim)', whiteSpace: 'nowrap', fontWeight: 500}}>{d.substring(5)}</div>
                      </div>
                    );
                  })}
                </div>
                {dates.length === 0 && <div style={{color: 'var(--fg-dim)', fontSize: 14, textAlign: 'center', marginTop: -80}}>No training load recorded yet.</div>}
              </div>
            </div>

          </div>

          {/* ⚡ Player Highlights Section */}
          <div style={{marginBottom: 40}} className="cd-section-wrap">
            <div className="exec-card" style={{background: 'var(--bg-2)', padding: 24, borderRadius: 12, border: '1px solid var(--line-soft)'}}>
              <h3 style={{margin: '0 0 20px 0', fontSize: 18, color: 'var(--fg)'}}>⚡ Player Highlights (GPS & Match)</h3>
              {gpsArr.length === 0 ? (
                <div style={{color: 'var(--fg-dim)', fontSize: 14, padding: '20px 0', textAlign: 'center'}}>No GPS data tracked yet.</div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: 40}}>
                  {/* OVERALL */}
                  <div>
                    <h4 style={{margin: '0 0 16px 0', fontSize: 16, color: 'var(--fg)', borderBottom: '1px solid var(--line-soft)', paddingBottom: 8}}>Overall</h4>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 30}}>
                      <div>
                        <div style={{fontSize: 12, fontWeight: 700, color: 'var(--fg-dim)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1}}>Top Distance Covered</div>
                        {topDist.length === 0 ? <div style={{fontSize: 13, color: 'var(--fg-dim)'}}>No data</div> : topDist.map((p, i) => (
                          <div key={p.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                            <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                              <span style={{width: 20, height: 20, background: 'var(--bg-3)', color: 'var(--fg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700}}>{i+1}</span>
                              <window.PlayerPhoto playerId={p.id} name={p.name} size={28} />
                              <span style={{fontSize: 15, fontWeight: 500, color: 'var(--fg)'}}>{p.name}</span>
                            </div>
                            <div style={{fontSize: 15, fontWeight: 700, color: 'var(--fg)'}}>{(p.total_dist / 1000).toFixed(1)} km</div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{fontSize: 12, fontWeight: 700, color: 'var(--fg-dim)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1}}>Highest Max Velocity</div>
                        {topSpeed.length === 0 ? <div style={{fontSize: 13, color: 'var(--fg-dim)'}}>No data</div> : topSpeed.map((p, i) => (
                          <div key={p.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                            <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                              <span style={{width: 20, height: 20, background: 'var(--bg-3)', color: 'var(--fg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700}}>{i+1}</span>
                              <window.PlayerPhoto playerId={p.id} name={p.name} size={28} />
                              <span style={{fontSize: 15, fontWeight: 500, color: 'var(--fg)'}}>{p.name}</span>
                            </div>
                            <div style={{fontSize: 15, fontWeight: 700, color: 'var(--fg)'}}>{(p.max_vel).toFixed(1)} km/h</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* POSITIONS */}
                  {[...new Set(gpsArr.map(p => p.posGroup))].filter(Boolean).filter(pos => pos !== 'Unknown').map(pos => {
                    const posGps = gpsArr.filter(p => p.posGroup === pos);
                    if (posGps.length === 0) return null;
                    const posTopDist = [...posGps].sort((a,b) => b.total_dist - a.total_dist).slice(0, 5);
                    const posTopSpeed = [...posGps].sort((a,b) => b.max_vel - a.max_vel).slice(0, 5);
                    return (
                      <div key={pos} style={{breakInside: 'avoid', pageBreakInside: 'avoid', marginBottom: 20}}>
                        <h4 style={{margin: '0 0 16px 0', fontSize: 16, color: 'var(--fg)', borderBottom: '1px solid var(--line-soft)', paddingBottom: 8}}>{pos}{pos === 'Unknown' ? '' : 's'}</h4>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 30}}>
                          <div>
                            <div style={{fontSize: 12, fontWeight: 700, color: 'var(--fg-dim)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1}}>Top Distance Covered</div>
                            {posTopDist.length === 0 ? <div style={{fontSize: 13, color: 'var(--fg-dim)'}}>No data</div> : posTopDist.map((p, i) => (
                              <div key={p.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                                <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                                  <span style={{width: 20, height: 20, background: 'var(--bg-3)', color: 'var(--fg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700}}>{i+1}</span>
                                  <window.PlayerPhoto playerId={p.id} name={p.name} size={28} />
                                  <span style={{fontSize: 15, fontWeight: 500, color: 'var(--fg)'}}>{p.name}</span>
                                </div>
                                <div style={{fontSize: 15, fontWeight: 700, color: 'var(--fg)'}}>{(p.total_dist / 1000).toFixed(1)} km</div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <div style={{fontSize: 12, fontWeight: 700, color: 'var(--fg-dim)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1}}>Highest Max Velocity</div>
                            {posTopSpeed.length === 0 ? <div style={{fontSize: 13, color: 'var(--fg-dim)'}}>No data</div> : posTopSpeed.map((p, i) => (
                              <div key={p.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                                <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                                  <span style={{width: 20, height: 20, background: 'var(--bg-3)', color: 'var(--fg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700}}>{i+1}</span>
                                  <window.PlayerPhoto playerId={p.id} name={p.name} size={28} />
                                  <span style={{fontSize: 15, fontWeight: 500, color: 'var(--fg)'}}>{p.name}</span>
                                </div>
                                <div style={{fontSize: 15, fontWeight: 700, color: 'var(--fg)'}}>{(p.max_vel).toFixed(1)} km/h</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </>
      )}
    </div>
  );
}
