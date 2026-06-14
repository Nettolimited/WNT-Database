// Dashboard — Thailand WNT overview

// ── Small helpers ────────────────────────────────────────────────────────────
function KpiCard({ value, label, sub, icon, accent }) {
  return (
    <div className="db-kpi" style={{'--ka': accent}}>
      <div className="db-kpi-icon">{icon}</div>
      <div className="db-kpi-val">{value}</div>
      <div className="db-kpi-label">{label}</div>
      {sub && <div className="db-kpi-sub">{sub}</div>}
    </div>
  );
}

function FormDot({ r }) {
  return <span className={`db-fdot db-fdot-${r.toLowerCase()}`}>{r}</span>;
}

function PosBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="db-pos-row">
      <span className="db-pos-label">{label}</span>
      <div className="db-pos-track">
        <div className="db-pos-fill" style={{width:`${pct}%`, background: color}}/>
      </div>
      <span className="db-pos-count mono">{count}</span>
    </div>
  );
}

// ── Match Detail Modal ────────────────────────────────────────────────────────
function MatchDetailModal({ match, players, onClose }) {
  const lineup = (() => {
    let l = match.lineup || [];
    if (typeof l === 'string') try { l = JSON.parse(l); } catch { l = []; }
    return l;
  })();

  const playerMap = new Map((players || []).map(p => [p.id, p]));
  const hs = match.home_score ?? 0, as_ = match.away_score ?? 0;
  const r = hs > as_ ? 'w' : hs === as_ ? 'd' : 'l';
  const resultLabel = { w: 'WIN', d: 'DRAW', l: 'LOSS' }[r];

  const starters = lineup.filter(e => e.isStarter)
    .sort((a, b) => (b.minutesPlayed || 0) - (a.minutesPlayed || 0));
  const subs = lineup.filter(e => !e.isStarter && (e.minutesPlayed > 0 || e.goals || e.assists));
  const didntPlay = lineup.filter(e => !e.isStarter && !e.minutesPlayed && !e.goals && !e.assists);

  const fmtDate = (d) => {
    if (!d) return '–';
    const dt = new Date(d + 'T00:00:00');
    return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const LineupRow = ({ entry }) => {
    const p = playerMap.get(entry.playerId);
    return (
      <div className="db-md-lineup-row">
        <span className="db-md-pos">{p?.pos || '–'}</span>
        <PlayerPhoto playerId={entry.playerId} name={p?.name || ''} size={28}/>
        <span className="db-md-pname">{p?.nick || p?.name?.split(' ').slice(-1)[0] || entry.playerId}</span>
        <span className="db-md-min mono">{entry.minutesPlayed ? entry.minutesPlayed + "'" : ''}</span>
        {entry.goals > 0 && <span className="db-md-evt">⚽ {entry.goals}</span>}
        {entry.assists > 0 && <span className="db-md-evt" style={{opacity:.7}}>🅰 {entry.assists}</span>}
        {entry.yellowCards > 0 && <span className="db-md-evt">🟨</span>}
        {entry.redCard && <span className="db-md-evt">🟥</span>}
      </div>
    );
  };

  return (
    <div className="db-modal-backdrop" onClick={onClose}>
      <div className="db-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`db-modal-head db-modal-head-${r}`}>
          <button className="db-modal-close" onClick={onClose}>✕</button>
          <div className="db-modal-meta">
            <span className="db-modal-date">{fmtDate(match.match_date)}</span>
            {match.competition && <span className="db-modal-comp">{match.competition}</span>}
            {match.team_level && match.team_level !== 'Senior' &&
              <span className="db-modal-comp">{match.team_level}</span>}
          </div>
          <div className="db-modal-scoreline">
            <span className="db-modal-team">Thailand</span>
            <div className="db-modal-score-box">
              <span className="db-modal-score">{hs} – {as_}</span>
              <span className={`db-modal-result db-rb-${r}`}>{resultLabel}</span>
            </div>
            <span className="db-modal-team">{match.opponent}</span>
          </div>
          {match.notes && <div className="db-modal-notes">{match.notes}</div>}
        </div>

        {/* Lineup */}
        <div className="db-modal-body">
          {starters.length > 0 && (
            <div className="db-md-section">
              <div className="db-md-section-title">🟢 Starting XI</div>
              {starters.map(e => <LineupRow key={e.playerId} entry={e}/>)}
            </div>
          )}
          {subs.length > 0 && (
            <div className="db-md-section">
              <div className="db-md-section-title">🔄 Substitutes</div>
              {subs.map(e => <LineupRow key={e.playerId} entry={e}/>)}
            </div>
          )}
          {didntPlay.length > 0 && (
            <div className="db-md-section">
              <div className="db-md-section-title db-md-dim">📋 Squad / DNP</div>
              {didntPlay.map(e => <LineupRow key={e.playerId} entry={e}/>)}
            </div>
          )}
          {lineup.length === 0 && (
            <div className="db-empty" style={{padding:'20px 0', textAlign:'center'}}>ไม่มีข้อมูล Lineup</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ players, matches, matchStats, onGoToPlayers, onMatchday, onCallup, onVideo, onClubs, onSelectPlayer, t }) {

  // Active players only — retired players (active === false) excluded from squad stats
  const activePlayers = players.filter(p => p.active !== false);

  // ── Compute KPIs ──
  const official = matches.filter(m => !m.is_private);
  const wdl = official.reduce((a, m) => {
    const hs = m.home_score ?? 0, as_ = m.away_score ?? 0;
    if (hs > as_) a.w++; else if (hs === as_) a.d++; else a.l++;
    return a;
  }, { w:0, d:0, l:0 });
  const goalsFor     = official.reduce((s,m) => s+(m.home_score||0), 0);
  const goalsAgainst = official.reduce((s,m) => s+(m.away_score||0), 0);
  const winRate      = official.length ? Math.round((wdl.w/official.length)*100) : 0;
  const avgAge       = activePlayers.length
    ? (activePlayers.reduce((s,p) => s+ageFromDob(p.dob), 0)/activePlayers.length).toFixed(1)
    : '–';

  // ── Squad composition ──
  const posMap   = { Goalkeeper:0, Defender:0, Midfielder:0, Forward:0 };
  const teamMap  = {};
  activePlayers.forEach(p => {
    const g = posGroup(p.pos);
    posMap[g]  = (posMap[g]||0) + 1;
    teamMap[p.team] = (teamMap[p.team]||0) + 1;
  });

  // ── Age distribution ──
  const ageBuckets = [
    {label:'U18',   min:0,  max:17},
    {label:'18–22', min:18, max:22},
    {label:'23–27', min:23, max:27},
    {label:'28–32', min:28, max:32},
    {label:'33+',   min:33, max:99},
  ].map(b => ({
    ...b, count: activePlayers.filter(p=>{ const a=ageFromDob(p.dob); return a>=b.min&&a<=b.max; }).length
  }));
  const agePeak = Math.max(...ageBuckets.map(b=>b.count), 1);

  // ── All results sorted newest first ──
  const recent = [...official]
    .sort((a,b)=>(b.match_date||'').localeCompare(a.match_date||''));

  // ── Form (last 5) ──
  const form = recent.slice(0,5).map(m => {
    const hs=m.home_score??0, as_=m.away_score??0;
    return hs>as_?'W':hs===as_?'D':'L';
  });

  // ── Top performers — active players only ──
  const perf = [...matchStats.entries()]
    .map(([id, s]) => ({ pl: activePlayers.find(p=>p.id===id), ...s }))
    .filter(x => x.pl);
  const topScorers = [...perf].sort((a,b)=>b.goals-a.goals).filter(x=>x.goals>0).slice(0,5);
  const mostCapped = [...perf].sort((a,b)=>b.apps-a.apps).filter(x=>x.apps>0).slice(0,5);

  const POS_COLOR  = { Goalkeeper:'#f59e0b', Defender:'#3b82f6', Midfielder:'#22c55e', Forward:'#ef4444' };
  const TEAM_COLOR = { Senior:'#2444a1', U23:'#16a34a', U20:'#d97706', U17:'#9333ea', U15:'#6b7280' };

  return (
    <div className="db-view">

      {/* ══ TOPBAR ══ */}
      <header className="db-topbar">
        <div className="db-brand">
          <image-slot id="team-logo" shape="rounded" radius="8" placeholder="🏴"
            style={{width:'38px',height:'38px',flex:'0 0 38px'}}></image-slot>
          <div>
            <div className="db-brand-name">Thailand Women's NT</div>
            <div className="db-brand-sub">Player Database · Dashboard</div>
          </div>
        </div>
      </header>

      <div className="db-body">

        {/* ══ KPI ROW ══ */}
        <div className="db-kpi-row">
          <KpiCard value={activePlayers.length} label="Squad Size"  sub={`${players.length - activePlayers.length > 0 ? `${players.length - activePlayers.length} retired` : 'Active players'}`} icon="👥" accent="#2444a1"/>
          <KpiCard value={official.length}   label="Matches"     sub={`${wdl.w}W · ${wdl.d}D · ${wdl.l}L`} icon="🏟" accent="#22c55e"/>
          <KpiCard value={goalsFor}          label="Goals"       sub={`${goalsAgainst} conceded`} icon="⚽" accent="#d8232a"/>
          <KpiCard value={`${winRate}%`}     label="Win Rate"    sub="All official"         icon="🏆" accent="#f59e0b"/>
          <KpiCard value={avgAge}            label="Avg Age"     sub="Full squad"           icon="🎂" accent="#818cf8"/>
        </div>

        {/* ══ MAIN GRID ══ */}
        <div className="db-main-grid">

          {/* ── LEFT: Squad ── */}
          <div className="db-col-left">
            <div className="db-card">
              <div className="db-card-hd">
                <span className="db-card-title">Squad</span>
                <button className="btn-ghost sm" onClick={onGoToPlayers}>View all →</button>
              </div>

              <div className="db-section-lbl">By Position</div>
              {Object.entries(posMap).map(([pos, n]) => (
                <PosBar key={pos} label={pos} count={n} total={activePlayers.length} color={POS_COLOR[pos]}/>
              ))}

              <div className="db-section-lbl" style={{marginTop:18}}>By Team Level</div>
              <div className="db-team-grid">
                {window.TWNT_DATA.TEAMS.filter(tm=>teamMap[tm]>0).map(tm=>(
                  <div key={tm} className="db-team-chip">
                    <span className="db-team-dot" style={{background: TEAM_COLOR[tm]||'#6b7280'}}/>
                    <span className="db-team-name">{tm}</span>
                    <span className="db-team-n">{teamMap[tm]}</span>
                  </div>
                ))}
              </div>

              <div className="db-section-lbl" style={{marginTop:18}}>Age Distribution</div>
              <div className="db-age-chart">
                {ageBuckets.map(b=>(
                  <div key={b.label} className="db-age-col">
                    <span className="db-age-n">{b.count||''}</span>
                    <div className="db-age-track">
                      <div className="db-age-bar" style={{height:`${(b.count/agePeak)*100}%`}}/>
                    </div>
                    <span className="db-age-lbl">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Results + Performers ── */}
          <div className="db-col-right">

            {/* Recent Results */}
            <div className="db-card">
              <div className="db-card-hd">
                <span className="db-card-title">Results</span>
                <div className="db-form-strip">
                  {form.map((r,i)=><FormDot key={i} r={r}/>)}
                </div>
                <button className="btn-ghost sm" onClick={onMatchday}>Match Log →</button>
              </div>

              <div className="db-results">
                {recent.length === 0 && <div className="db-empty">No matches recorded yet</div>}
                {recent.map(m=>{
                  const hs=m.home_score??0, as_=m.away_score??0;
                  const r = hs>as_?'w':hs===as_?'d':'l';
                  return (
                    <div key={m.id} className={`db-result-row db-r-${r}`}
                      onClick={() => onMatchday && onMatchday()}
                      title="คลิกไปที่ Match Log">
                      <span className="db-res-date">{m.match_date||'–'}</span>
                      {m.competition&&<span className="db-res-comp">{m.competition}</span>}
                      <span className="db-res-opp">vs {m.opponent}</span>
                      <span className="db-res-score">{hs}–{as_}</span>
                      <span className={`db-res-badge db-rb-${r}`}>{r.toUpperCase()}</span>
                      <span className="db-res-arrow">›</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performers */}
            <div className="db-perf-grid">

              {/* Top Scorers */}
              <div className="db-card">
                <div className="db-card-hd" style={{marginBottom:10}}>
                  <span className="db-card-title">⚽ Top Scorers</span>
                </div>
                {topScorers.length===0&&<div className="db-empty">No match log data yet</div>}
                {topScorers.map((x,i)=>(
                  <div key={x.pl.id} className="db-perf-item db-perf-clickable"
                    onClick={() => onSelectPlayer && onSelectPlayer(x.pl)}>
                    <span className="db-rank">{i+1}</span>
                    <PlayerPhoto playerId={x.pl.id} name={x.pl.name} size={32}/>
                    <div className="db-perf-meta">
                      <span className="db-perf-name">{x.pl.nick||x.pl.name.split(' ').slice(-1)[0]}</span>
                      <span className="db-perf-sub">{x.pl.pos} · {x.apps} caps</span>
                    </div>
                    <span className="db-perf-stat" style={{color:'#ef4444'}}>{x.goals}</span>
                  </div>
                ))}
              </div>

              {/* Most Capped */}
              <div className="db-card">
                <div className="db-card-hd" style={{marginBottom:10}}>
                  <span className="db-card-title">🎖 Most Capped</span>
                </div>
                {mostCapped.length===0&&<div className="db-empty">No match log data yet</div>}
                {mostCapped.map((x,i)=>(
                  <div key={x.pl.id} className="db-perf-item db-perf-clickable"
                    onClick={() => onSelectPlayer && onSelectPlayer(x.pl)}>
                    <span className="db-rank">{i+1}</span>
                    <PlayerPhoto playerId={x.pl.id} name={x.pl.name} size={32}/>
                    <div className="db-perf-meta">
                      <span className="db-perf-name">{x.pl.nick||x.pl.name.split(' ').slice(-1)[0]}</span>
                      <span className="db-perf-sub">{x.pl.pos} · {x.goals} goals</span>
                    </div>
                    <span className="db-perf-stat" style={{color:'#2444a1'}}>{x.apps}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

window.Dashboard = Dashboard;
