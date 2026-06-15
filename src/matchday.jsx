// Matchday Summary — view & edit match lineups, minutes, goals

// World football nations for opponent picker
const FOOTBALL_NATIONS = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria',
  'Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bermuda',
  'Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China PR','Chinese Taipei',
  'Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti',
  'Dominican Republic','DR Congo','Ecuador','Egypt','El Salvador','England','Equatorial Guinea','Eritrea','Estonia',
  'Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Guatemala',
  'Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hong Kong','Hungary','Iceland','India','Indonesia','Iran',
  'Iraq','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kosovo','Kuwait','Kyrgyzstan','Laos',
  'Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi',
  'Malaysia','Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Mongolia','Montenegro','Morocco',
  'Mozambique','Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea',
  'North Macedonia','Northern Ireland','Norway','Oman','Pakistan','Palestine','Panama','Papua New Guinea','Paraguay',
  'Peru','Philippines','Poland','Portugal','Qatar','Republic of Ireland','Romania','Russia','Rwanda','Samoa',
  'San Marino','Saudi Arabia','Scotland','Senegal','Serbia','Sierra Leone','Singapore','Slovakia','Slovenia',
  'Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland',
  'Syria','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Trinidad and Tobago','Tunisia','Turkey',
  'Turkmenistan','Uganda','Ukraine','United Arab Emirates','Uruguay','USA','Uzbekistan','Vanuatu','Venezuela',
  'Vietnam','Wales','Yemen','Zambia','Zimbabwe',
];

function CountrySearch({ value, onChange, placeholder }) {
  const [q, setQ] = useState(value || '');
  const [open, setOpen] = useState(false);
  const filtered = q.length > 0
    ? FOOTBALL_NATIONS.filter(n => n.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : [];

  const select = (name) => { setQ(name); onChange(name); setOpen(false); };

  return (
    <div style={{position:'relative'}}>
      <input className="camp-input" placeholder={placeholder || 'พิมพ์ชื่อประเทศ…'}
        value={q}
        onChange={e => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"/>
      {open && filtered.length > 0 && (
        <div style={{
          position:'absolute', top:'100%', left:0, right:0, zIndex:200,
          background:'var(--bg-2)', border:'1px solid var(--line-soft)',
          borderRadius:8, marginTop:4, overflow:'hidden',
          boxShadow:'0 8px 24px rgba(0,0,0,.4)',
        }}>
          {filtered.map(name => (
            <div key={name}
              onMouseDown={() => select(name)}
              style={{padding:'8px 14px', cursor:'pointer', fontSize:14,
                borderBottom:'1px solid var(--line)'}}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background=''}
            >{name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchForm({ initial, onSave, onCancel }) {
  const [opponent,    setOpponent]    = useState(initial?.opponent    || '');
  const [matchDate,   setMatchDate]   = useState(initial?.match_date  || '');
  const [competition, setCompetition] = useState(initial?.competition || '');
  const [homeScore,   setHomeScore]   = useState(initial?.home_score  ?? '');
  const [awayScore,   setAwayScore]   = useState(initial?.away_score  ?? '');
  const [teamLevel,   setTeamLevel]   = useState(initial?.team_level  || 'Senior');
  const [notes,       setNotes]       = useState(initial?.notes       || '');
  const [isPrivate,   setIsPrivate]   = useState(initial?.is_private  || false);
  const [fifaRankChange, setFifaRankChange] = useState(initial?.fifa_rank_change || 0);
  const [fifaPtsChange,  setFifaPtsChange]  = useState(initial?.fifa_pts_change  || 0);

  const submit = () => {
    if (!opponent.trim()) return;
    onSave({ opponent, matchDate, competition, homeScore: +homeScore || 0, awayScore: +awayScore || 0, teamLevel, notes, isPrivate, fifaRankChange: +fifaRankChange || 0, fifaPtsChange: +fifaPtsChange || 0 });
  };

  return (
    <div className="camp-form">
      <CountrySearch value={opponent} onChange={setOpponent} placeholder="คู่แข่ง (เช่น Vietnam)…"/>
      <div className="camp-daterange-box">
        <div className="camp-dr-half">
          <span className="camp-dr-label">DATE</span>
          <input type="date" className="camp-dr-input" value={matchDate}
            onChange={e => setMatchDate(e.target.value)}/>
        </div>
        <div className="camp-dr-divider">vs</div>
        <div className="camp-dr-half" style={{flexDirection:'row', alignItems:'center', gap:4}}>
          <input type="number" className="camp-dr-input" placeholder="0" min="0" max="99" style={{width:36}}
            value={homeScore} onChange={e => setHomeScore(e.target.value)}/>
          <span className="camp-dr-label" style={{margin:'0 2px'}}>:</span>
          <input type="number" className="camp-dr-input" placeholder="0" min="0" max="99" style={{width:36}}
            value={awayScore} onChange={e => setAwayScore(e.target.value)}/>
        </div>
      </div>
      <input className="camp-input" placeholder="การแข่งขัน (AFF / AFC / Friendly)…" value={competition}
        onChange={e => setCompetition(e.target.value)}/>
      <div style={{display:'flex', gap:6, alignItems:'center'}}>
        <select className="camp-input" style={{flex:1}} value={teamLevel} onChange={e => setTeamLevel(e.target.value)}>
          <option value="Senior">🏆 Senior</option>
          <option value="U23">U23</option>
          <option value="U20">U20</option>
          <option value="U17">U17</option>
        </select>
        <label style={{display:'flex', alignItems:'center', gap:6, cursor:'pointer', whiteSpace:'nowrap',
          padding:'6px 12px', borderRadius:8, border:'1px solid var(--line)',
          background: isPrivate ? 'rgba(216,35,42,.12)' : 'transparent',
          color: isPrivate ? 'var(--accent-red)' : 'var(--fg-mute)', fontSize:13, transition:'all .15s'}}>
          <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} style={{accentColor:'var(--accent-red)'}}/>
          🔒 ปิด (Private)
        </label>
      </div>
      <div style={{display:'flex', gap:6, alignItems:'center', background: 'var(--bg-2)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)'}}>
        <div style={{fontSize: 13, color: 'var(--fg)', fontWeight: 600}}>FIFA Ranking</div>
        <input type="number" step="1" className="camp-input" style={{flex: 1, padding: '4px 8px'}} placeholder="Rank Change (e.g. +1, -2)" value={fifaRankChange} onChange={e => setFifaRankChange(e.target.value)} />
        <input type="number" step="0.01" className="camp-input" style={{flex: 1, padding: '4px 8px'}} placeholder="Pts Change (e.g. +5.2, -1.3)" value={fifaPtsChange} onChange={e => setFifaPtsChange(e.target.value)} />
      </div>
      <input className="camp-input" placeholder="หมายเหตุ…" value={notes}
        onChange={e => setNotes(e.target.value)}/>
      <div style={{display:'flex', gap:6}}>
        <button className="btn-primary sm" style={{flex:1}} onClick={submit}>
          {initial ? 'Save changes' : 'Add match'}
        </button>
        <button className="btn-ghost sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function LineupEditor({ match, players, onSave }) {
  const [lineup, setLineup] = useState(() => {
    const m = new Map();
    for (const e of (match.lineup || [])) m.set(e.playerId, { ...e });
    return m;
  });
  const [filterPos, setFilterPos] = useState('All');
  const [search, setSearch] = useState('');
  const [dirty, setDirty] = useState(false);

  const setField = (playerId, field, val) => {
    setLineup(prev => {
      const m = new Map(prev);
      const entry = m.get(playerId) || { playerId, minutesPlayed:0, goals:0, assists:0, yellowCards:0, redCard:false, isStarter:true };
      const updated = { ...entry, [field]: val };
      // Auto-mark as starter when first entering minutes
      if (field === 'minutesPlayed' && val > 0 && !entry.minutesPlayed && entry.isStarter === undefined) {
        updated.isStarter = true;
      }
      m.set(playerId, updated);
      return m;
    });
    setDirty(true);
  };

  const save = () => {
    const arr = [...lineup.values()].filter(e => e.minutesPlayed > 0 || e.goals > 0);
    onSave(arr);
    setDirty(false);
  };

  const POS_FILTERS = ['All','GK','DEF','MID','FWD'];
  const visible = players.filter(p => {
    if (filterPos === 'GK'  && p.pos !== 'GK') return false;
    if (filterPos === 'DEF' && posGroup(p.pos) !== 'Defender')   return false;
    if (filterPos === 'MID' && posGroup(p.pos) !== 'Midfielder') return false;
    if (filterPos === 'FWD' && posGroup(p.pos) !== 'Forward')    return false;
    if (search) {
      const q = search.toLowerCase();
      if (![p.name, p.nick||'', p.thaiName||''].join(' ').toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    const eA = lineup.get(a.id);
    const eB = lineup.get(b.id);
    const playedA = (eA?.minutesPlayed || 0) > 0;
    const playedB = (eB?.minutesPlayed || 0) > 0;
    const starterA = playedA && eA?.isStarter !== false;
    const starterB = playedB && eB?.isStarter !== false;

    if (starterA && !starterB) return -1;
    if (!starterA && starterB) return 1;
    if (playedA && !playedB) return -1;
    if (!playedA && playedB) return 1;
    
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="md-lineup">
      <div className="callup-cl-hd">
        <input className="callup-search" placeholder="Search player…" value={search}
          onChange={e => setSearch(e.target.value)}/>
        <div className="chips sm">
          {POS_FILTERS.map(f => (
            <button key={f} className={`chip ${filterPos===f?'on':''}`} onClick={() => setFilterPos(f)}>{f}</button>
          ))}
        </div>
        {dirty && (
          <button className="btn-primary sm" onClick={save}>💾 Save lineup</button>
        )}
      </div>
      <div className="md-lineup-table-wrap">
        <table className="md-lineup-table">
          <thead>
            <tr>
              <th></th>
              <th>Player</th>
              <th className="num" title="Starter">STR</th>
              <th className="num">MIN</th>
              <th className="num">⚽ G</th>
              <th className="num">⚽ Mins</th>
              <th className="num">🅰 A</th>
              <th className="num">🟨</th>
              <th className="num">🟥</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(p => {
              const e = lineup.get(p.id) || {};
              const played = (e.minutesPlayed || 0) > 0;
              const isStarter = played && e.isStarter !== false;
              return (
                <tr key={p.id} className={`md-lineup-row ${played?'played':''}`}>
                  <td><PosBadge pos={p.pos}/></td>
                  <td className="md-pname">
                    <PlayerPhoto playerId={p.id} name={p.name} size={28}/>
                    <span>{p.name}</span>
                    {p.nick && <span className="nm-nick">({p.nick})</span>}
                  </td>
                  <td style={{textAlign:'center'}}>
                    <input type="checkbox" className="md-rc-chk"
                      checked={isStarter}
                      disabled={!played}
                      onChange={ev => setField(p.id,'isStarter', ev.target.checked)}/>
                  </td>
                  <td>
                    <input type="number" className="md-stat-inp" min="0" max="120" placeholder="–"
                      value={e.minutesPlayed || ''}
                      onChange={ev => setField(p.id,'minutesPlayed', +ev.target.value||0)}/>
                  </td>
                  <td>
                    <input type="number" className="md-stat-inp" min="0" max="20" placeholder="–"
                      value={e.goals || ''}
                      disabled={!played}
                      onChange={ev => setField(p.id,'goals', +ev.target.value||0)}/>
                  </td>
                  <td>
                    <input type="text" className="md-stat-inp" style={{width:'100px', textAlign:'center', fontSize:'11px'}} placeholder="15, 45(P)"
                      value={e.goalMinutes || ''}
                      disabled={!played}
                      onChange={ev => setField(p.id,'goalMinutes', ev.target.value)}/>
                  </td>
                  <td>
                    <input type="number" className="md-stat-inp" min="0" max="20" placeholder="–"
                      value={e.assists || ''}
                      disabled={!played}
                      onChange={ev => setField(p.id,'assists', +ev.target.value||0)}/>
                  </td>
                  <td>
                    <input type="number" className="md-stat-inp" min="0" max="2" placeholder="–"
                      value={e.yellowCards || ''}
                      disabled={!played}
                      onChange={ev => setField(p.id,'yellowCards', +ev.target.value||0)}/>
                  </td>
                  <td>
                    <input type="checkbox" className="md-rc-chk"
                      checked={!!e.redCard}
                      disabled={!played}
                      onChange={ev => setField(p.id,'redCard', ev.target.checked)}/>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MatchReport({ match, players }) {
  const playerMap = new Map(players.map(p => [p.id, p]));
  const played = (match.lineup || []).filter(e => e.minutesPlayed > 0 || e.goals > 0 || e.assists > 0);

  const hasStarterInfo = played.some(e => e.isStarter !== undefined);
  const starters = hasStarterInfo ? played.filter(e => e.isStarter !== false) : played;
  const subs     = hasStarterInfo ? played.filter(e => e.isStarter === false)  : [];

  const byMinDesc = (a, b) => (b.minutesPlayed || 0) - (a.minutesPlayed || 0);

  const result = match.home_score > match.away_score ? 'W'
               : match.home_score < match.away_score ? 'L' : 'D';
  const resultColor = { W:'#1a8a4a', D:'var(--fg-mute)', L:'var(--accent-red)' }[result];

  const fmtDate = d => {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00');
    return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric' });
  };

  const scorers = played.filter(e => e.goals > 0);
  const assisters = played.filter(e => e.assists > 0);

  const renderRow = (e) => {
    const p = playerMap.get(e.playerId);
    if (!p) return null;
    return (
      <tr key={e.playerId}>
        <td><PosBadge pos={p.pos}/></td>
        <td className="md-pname" style={{gap:6}}>
          <PlayerPhoto playerId={p.id} name={p.name} size={24}/>
          <span style={{fontWeight:600}}>{p.nick || p.name}</span>
          {p.nick && <span className="dim" style={{fontSize:11}}>{p.name}</span>}
        </td>
        <td className="num mono">{e.minutesPlayed || 0}'</td>
        <td className="num">{e.goals   > 0 ? <>⚽ {e.goals}</>   : <span className="dim">–</span>}</td>
        <td className="num">{e.assists > 0 ? <>🅰 {e.assists}</> : <span className="dim">–</span>}</td>
        <td className="num">
          {e.yellowCards > 0 && '🟨'.repeat(Math.min(e.yellowCards, 2))}
          {e.redCard && '🟥'}
          {!e.yellowCards && !e.redCard && <span className="dim">–</span>}
        </td>
      </tr>
    );
  };

  const GroupHeader = ({ label, count }) => (
    <tr>
      <td colSpan={6} className="md-report-group-hd">
        {label} <span className="dim mono" style={{fontWeight:400}}>({count})</span>
      </td>
    </tr>
  );

  return (
    <div className="md-report">
      {/* Score header */}
      <div className="md-report-header">
        <div className="md-report-teams-row">
          <span className="md-report-team">🇹🇭 Thailand</span>
          <div className="md-report-score-block">
            <span className="md-report-score">{match.home_score} – {match.away_score}</span>
            <span className="md-report-result-badge" style={{background:resultColor}}>{result}</span>
          </div>
          <span className="md-report-team">{match.opponent}</span>
        </div>
        <div className="md-report-meta">
          {fmtDate(match.match_date)}
          {match.competition && <> · <strong>{match.competition}</strong></>}
          {match.team_level && match.team_level !== 'Senior' && <LevelBadge level={match.team_level}/>}
        </div>
        {match.notes && <div className="md-report-notes">{match.notes}</div>}
      </div>

      {/* Goal / assist summary */}
      {(scorers.length > 0 || assisters.length > 0) && (
        <div className="md-report-events">
          {scorers.length > 0 && (
            <div className="md-report-event-row">
              <span className="md-report-event-icon">⚽</span>
              {scorers.map(e => {
                const p = playerMap.get(e.playerId);
                return (
                  <span key={e.playerId} className="md-report-event-chip">
                    {p?.nick || p?.name}{e.goals > 1 && <> ×{e.goals}</>}
                  </span>
                );
              })}
            </div>
          )}
          {assisters.length > 0 && (
            <div className="md-report-event-row">
              <span className="md-report-event-icon">🅰</span>
              {assisters.map(e => {
                const p = playerMap.get(e.playerId);
                return (
                  <span key={e.playerId} className="md-report-event-chip">
                    {p?.nick || p?.name}{e.assists > 1 && <> ×{e.assists}</>}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {played.length === 0 ? (
        <div className="callup-empty" style={{marginTop:24}}>No lineup recorded for this match.</div>
      ) : (
        <table className="md-history-table md-report-table">
          <thead>
            <tr>
              <th></th><th>Player</th>
              <th className="num">MIN</th>
              <th className="num">G</th>
              <th className="num">A</th>
              <th className="num">Cards</th>
            </tr>
          </thead>
          <tbody>
            <GroupHeader label="Starting XI" count={starters.length}/>
            {[...starters].sort(byMinDesc).map(renderRow)}
          </tbody>
          {subs.length > 0 && (
            <tbody>
              <GroupHeader label="Substitutes" count={subs.length}/>
              {[...subs].sort(byMinDesc).map(renderRow)}
            </tbody>
          )}
        </table>
      )}
    </div>
  );
}

// ─── Pitch Report ─────────────────────────────────────────────────────────────

const PITCH_TOKEN_COLORS = { Goalkeeper:'#f59e0b', Defender:'#3b82f6', Midfielder:'#16a34a', Forward:'#dc2626' };
const PITCH_SORT = { LWB:0,LB:0,LCB:1,CB:2,SW:2,RCB:3,RB:4,RWB:5, LM:0,LW:0,DM:2,CM:2,RM:4,RW:5,AM:2, SS:1,CF:3,ST:2 };

function pitchYBand(pos) {
  if (pos==='GK') return 0.86;
  if (['LB','RB','LWB','RWB','CB','LCB','RCB','SW'].includes(pos)) return 0.71;
  if (pos==='DM') return 0.60;
  if (['LM','CM','RM'].includes(pos)) return 0.50;
  if (pos==='AM') return 0.38;
  return 0.22;
}

function buildPitchLayout(entries) {
  const bands = {};
  for (const e of entries) {
    const y = pitchYBand(e.pos||'CM');
    (bands[y] = bands[y]||[]).push({ id:e.id, sx: PITCH_SORT[e.pos]??2 });
  }
  const out = {};
  for (const [ys, grp] of Object.entries(bands)) {
    const y = +ys;
    grp.sort((a,b)=>a.sx-b.sx);
    const n = grp.length;
    grp.forEach((p,i) => { out[p.id] = { x: n===1?0.5:0.10+0.80/(n-1)*i, y }; });
  }
  return out;
}

// Auto-detect starters: top 11 by minutes if no isStarter flag set
function detectStartersAndSubs(played, maxMin) {
  const hasFlag = played.some(e => e.isStarter !== undefined);
  if (hasFlag) {
    return { starters: played.filter(e=>e.isStarter!==false), subs: played.filter(e=>e.isStarter===false) };
  }
  const sorted = [...played].sort((a,b) => (b.minutesPlayed||0) - (a.minutesPlayed||0));
  return { starters: sorted.slice(0,11), subs: sorted.slice(11) };
}

// Pair subs with their replaced starters: find pairs where starter_min + sub_min ≈ maxMin
function autoPairSubs(starters, subs, maxMin) {
  const candidates = starters.filter(e => (e.minutesPlayed||0) < maxMin - 2);
  const available  = [...candidates];
  const pairs = [];
  // Sort subs by minutesPlayed DESC — longer-played subs matched first (more reliable)
  for (const sub of [...subs].sort((a,b)=>(b.minutesPlayed||0)-(a.minutesPlayed||0))) {
    const target = maxMin - (sub.minutesPlayed||0);
    let bestIdx = -1, bestDiff = 25;
    for (let i=0; i<available.length; i++) {
      const diff = Math.abs((available[i].minutesPlayed||0) - target);
      if (diff < bestDiff) { bestDiff=diff; bestIdx=i; }
    }
    if (bestIdx >= 0) {
      pairs.push({ starterId:available[bestIdx].playerId, subId:sub.playerId, minute:available[bestIdx].minutesPlayed||target });
      available.splice(bestIdx,1);
    }
  }
  return pairs;
}

function PitchTimeline({ starters, subs, lineup, players, pairs, playerMap, maxMin, onPairsChange }) {
  const allPlayed = [...starters, ...subs];
  const pairedStarterIds = new Set(pairs.map(p=>p.starterId));
  const pairedSubIds     = new Set(pairs.map(p=>p.subId));

  const fullRows     = starters.filter(e=>(e.minutesPlayed||0)>=maxMin-2).map(e=>({type:'full',entry:e}));
  const pairedRows   = pairs.flatMap(pair => {
    const starter = allPlayed.find(e=>e.playerId===pair.starterId);
    const sub     = allPlayed.find(e=>e.playerId===pair.subId);
    if (!starter||!sub) return [];
    return [{ type:'sub_out',entry:starter,pair }, { type:'sub_in',entry:sub,pair }];
  });
  
  const unpaired = allPlayed.filter(e => !pairedStarterIds.has(e.playerId) && !pairedSubIds.has(e.playerId) && (e.minutesPlayed||0)<maxMin-2);
  const unpairedOut  = unpaired.filter(e => starters.some(s=>s.playerId===e.playerId)).map(e=>({type:'unpaired_out',entry:e}));
  const unpairedIn   = unpaired.filter(e => subs.some(s=>s.playerId===e.playerId)).map(e=>({type:'unpaired_in',entry:e}));
  const rows = [...fullRows,...pairedRows,...unpairedOut,...unpairedIn];
  if (!rows.length) return null;

  const LH=14, LY=18, LX=90, RX=24, TW=360-LX-RX, H=LY+rows.length*LH+22;
  const toX = min => LX + (min/maxMin)*TW;

  return (
    <div style={{marginTop:14}}>
      <div style={{fontSize:10,fontWeight:800,letterSpacing:'.07em',textTransform:'uppercase',color:'var(--fg-mute)',marginBottom:5}}>
        Player Minutes
      </div>
      <svg viewBox={`0 0 360 ${H}`} style={{width:'100%',height:'auto',display:'block'}}>
        {[45,90,120].filter(m=>m<=maxMin).map(m=>(
          <g key={m}>
            <line x1={toX(m)} y1={0} x2={toX(m)} y2={H-14} stroke="rgba(255,255,255,.15)" strokeWidth={1} strokeDasharray="3,3"/>
            <text x={toX(m)} y={H-2} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,.35)">{m}'</text>
          </g>
        ))}
        {rows.map((row,i) => {
          const p = playerMap.get(row.entry.playerId);
          if (!p) return null;
          const y = LY+i*LH;
          const col = PITCH_TOKEN_COLORS[posGroup(p.pos||'')] || '#6b7689';
          const isSub = row.type==='sub_in'||row.type==='unpaired_in';
          let startMin=0, endMin=maxMin;
          if (row.type==='full')         { startMin=0; endMin=maxMin; }
          else if (row.type==='sub_out') { startMin=0; endMin=row.pair.minute; }
          else if (row.type==='sub_in')  { startMin=row.pair.minute; endMin=maxMin; }
          else if (row.type==='unpaired_out') { startMin=0; endMin=row.entry.minutesPlayed||maxMin; }
          else { startMin=Math.max(0,maxMin-(row.entry.minutesPlayed||0)); endMin=maxMin; }
          return (
            <g key={row.entry.playerId}>
              <text x={LX-4} y={y+9} textAnchor="end" fontSize={9}
                fill={isSub?'rgba(255,255,255,.45)':'rgba(255,255,255,.82)'} fontWeight={isSub?400:600}>
                {(p.nick||p.name||'').slice(0,13)}
              </text>
              <rect x={toX(startMin)} y={y+1} width={Math.max(4,toX(endMin)-toX(startMin))} height={LH-4}
                fill={col} rx={2} opacity={isSub?.62:.87}/>
              {(row.type==='sub_out'||row.type==='unpaired_out') && endMin<maxMin && (
                <text x={toX(endMin)+2} y={y+9} textAnchor="start" fontSize={8} fill="#f87171">↓{endMin}'</text>
              )}
              {(row.type==='sub_in'||row.type==='unpaired_in') && (
                <text x={toX(startMin)-2} y={y+9} textAnchor="end" fontSize={8} fill="#4ade80">↑{startMin}'</text>
              )}
              {row.entry.goals>0 && !row.entry.goalMinutes && (
                <text x={Math.min(toX(endMin),toX(maxMin)) + ((row.type==='sub_out'||row.type==='unpaired_out') && endMin<maxMin ? 16 : 3)} y={y+9} textAnchor="start" fontSize={10}>
                  {'⚽'.repeat(row.entry.goals)}
                </text>
              )}
              {row.entry.goalMinutes && row.entry.goalMinutes.split(',').map(m => m.trim()).map((mStr, i) => {
                const num = parseInt(mStr);
                if (isNaN(num)) return null;
                const suffix = mStr.replace(/^[0-9]+/, '').trim();
                return (
                  <text key={i} x={toX(Math.min(maxMin, num))} y={y+9} textAnchor="middle" fontSize={10}>
                    ⚽{suffix && <tspan fontSize={7} dy="-4" fill="#fbbf24">{suffix}</tspan>}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Sub pairings editor */}
      {(() => {
        const starterCandidates = (lineup || []).filter(e => e.isStarter !== false);
        const starterIds = new Set(starterCandidates.map(e => e.playerId));
        const subCandidates = (players || []).filter(p => p.active !== false && !starterIds.has(p.id))
          .sort((a, b) => a.name.localeCompare(b.name));

        const getOptionLabel = (id) => {
          const p = playerMap.get(id) || players.find(x => x.id === id);
          if (!p) return id;
          return p.nick ? `${p.nick} (${p.name})` : p.name;
        };

        const starterOptions = starterCandidates.map(e => ({
          value: e.playerId,
          label: getOptionLabel(e.playerId)
        }));

        const subOptions = subCandidates.map(p => ({
          value: p.id,
          label: getOptionLabel(p.id)
        }));

        const addPair = () => {
          const usedS = new Set(pairs.map(p=>p.starterId));
          const usedU = new Set(pairs.map(p=>p.subId));
          const freeS = starterCandidates.find(e=>!usedS.has(e.playerId)) || starterCandidates[0];
          const freeU = subCandidates.find(p=>!usedU.has(p.id)) || subCandidates[0];
          if (freeS && freeU) {
            onPairsChange([...pairs, { starterId: freeS.playerId, subId: freeU.id, minute: 70 }]);
          }
        };

        return (
          <div className="sub-pairs-editor">
            <div className="sub-pairs-label" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span>Substitutions — แก้คู่และนาทีได้</span>
              {starterCandidates.length > 0 && subCandidates.length > 0 ? (
                <button className="btn-ghost sm" style={{fontSize:11,padding:'1px 8px'}} onClick={addPair}>+ Add</button>
              ) : (
                <span style={{fontSize:11,color:'var(--accent-red)',fontWeight:500}}>* ต้องมีตัวจริงอย่างน้อย 1 คนและตัวสำรองในทีม</span>
              )}
            </div>
            {pairs.map((pair,idx) => {
              const update = (field, val) => {
                const next = pairs.map(p=>({...p}));
                const clash = next.findIndex((p,i) => i!==idx && p[field]===val);
                if (clash >= 0) next[clash][field] = next[idx][field];
                next[idx][field] = val;
                onPairsChange(next);
              };
              return (
                <div key={idx} className="sub-pair-row">
                  <SearchableSelect
                    value={pair.starterId}
                    options={starterOptions}
                    onChange={val => update('starterId', val)}
                    placeholder="เลือกตัวจริง…"
                  />
                  <span className="sub-pair-arrow" style={{color:'#f87171'}}>↓</span>
                  <div style={{display:'flex',alignItems:'center',gap:1,flexShrink:0}}>
                    <input type="text" className="sub-pair-min" style={{width: '50px'}} value={pair.minute}
                      onChange={e=>update('minute', e.target.value)}/>
                    <span style={{fontSize:11,color:'var(--fg-mute)',lineHeight:1}}>'</span>
                  </div>
                  <span className="sub-pair-arrow" style={{color:'#4ade80'}}>↑</span>
                  <SearchableSelect
                    value={pair.subId}
                    options={subOptions}
                    onChange={val => update('subId', val)}
                    placeholder="เลือกตัวสำรอง…"
                  />
                  <button className="camp-del" style={{flexShrink:0}}
                    onClick={()=>onPairsChange(pairs.filter((_,i)=>i!==idx))}>✕</button>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}

function MatchTimelineList({ match, players, pairs }) {
  const lineup = match.lineup || [];
  const playerMap = new Map(players.map(p=>[p.id, p]));
  const events = [];
  
  lineup.forEach(p => {
    let goalCount = 0;
    if (p.goalMinutes) {
      p.goalMinutes.split(',').forEach(mStr => {
        const minStr = mStr.trim();
        const num = parseInt(minStr);
        if (!isNaN(num)) {
          const suffix = minStr.replace(/^[0-9]+/, '').trim();
          events.push({ min: num, type: 'goal', player: playerMap.get(p.playerId)?.name || 'Unknown', details: suffix });
          goalCount++;
        }
      });
    }
    if (p.goals > goalCount) {
      for (let i = 0; i < p.goals - goalCount; i++) {
        events.push({ min: 90, type: 'goal', player: playerMap.get(p.playerId)?.name || 'Unknown', details: '' });
      }
    }
    if (p.yellowCards > 0) {
      for (let i = 0; i < p.yellowCards; i++) {
        events.push({ min: 90, type: 'yellow', player: playerMap.get(p.playerId)?.name || 'Unknown' });
      }
    }
    if (p.redCard) events.push({ min: 90, type: 'red', player: playerMap.get(p.playerId)?.name || 'Unknown' });
  });

  pairs.forEach(pair => {
    if (pair.minute) {
      events.push({ min: pair.minute, type: 'sub', subIn: playerMap.get(pair.subId)?.name || 'Unknown', subOut: playerMap.get(pair.starterId)?.name || 'Unknown' });
    }
  });

  if (events.length === 0) return null;

  events.sort((a, b) => a.min - b.min);

  return (
    <div style={{ marginTop: 24, padding: '20px', background: 'var(--bg-3)', borderRadius: '12px', border: '1px solid var(--line-soft)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: 'var(--fg)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Match Events Timeline</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {events.map((ev, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, fontSize: 14, lineHeight: 1.4 }}>
            <div style={{ fontWeight: 800, color: 'var(--accent-blue)', width: 28, textAlign: 'right', marginTop: 1 }}>{ev.min}'</div>
            <div>
              {ev.type === 'goal' && <div>⚽ <span style={{fontWeight:600, color:'var(--fg)'}}>{ev.player}</span> {ev.details && <span style={{color:'var(--fg-mute)', fontSize:12, marginLeft:6}}>{ev.details}</span>}</div>}
              {ev.type === 'sub' && <div>🔄 <span style={{color:'#4ade80', fontWeight:600}}>{ev.subIn}</span> <span style={{color:'var(--fg-dim)', margin:'0 4px', fontSize: 12}}>In</span> <span style={{color:'var(--fg-dim)', margin:'0 6px'}}>|</span> <span style={{color:'#f87171', fontWeight:600}}>{ev.subOut}</span> <span style={{color:'var(--fg-dim)', margin:'0 4px', fontSize: 12}}>Out</span></div>}
              {ev.type === 'yellow' && <div>🟨 <span style={{fontWeight:600, color:'var(--fg)'}}>{ev.player}</span></div>}
              {ev.type === 'red' && <div>🟥 <span style={{fontWeight:600, color:'var(--fg)'}}>{ev.player}</span></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchableSelect({ value, options, onChange, placeholder = 'Search player…' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(o => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : '';

  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="search-select-container">
      <div className="search-select-trigger" onClick={() => { setOpen(!open); setSearch(''); }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'calc(100% - 14px)' }}>
          {displayLabel || placeholder}
        </span>
        <span className="search-select-arrow">▼</span>
      </div>
      {open && (
        <div className="search-select-dropdown">
          <input
            type="text"
            className="search-select-input"
            placeholder="พิมพ์เพื่อค้นหา…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className="search-select-list">
            {filteredOptions.length === 0 ? (
              <div className="search-select-empty">ไม่พบรายชื่อ</div>
            ) : (
              filteredOptions.map(o => (
                <div
                  key={o.value}
                  className={`search-select-item ${o.value === value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  {o.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function parseMinute(minStr) {
  if (typeof minStr === 'number') return minStr;
  if (!minStr) return 0;
  const parts = String(minStr).split('+');
  const base = parseInt(parts[0]) || 0;
  const extra = parseInt(parts[1]) || 0;
  return base + extra;
}

function getPlayMinute(minStr) {
  if (typeof minStr === 'number') return minStr;
  if (!minStr) return 0;
  const parts = String(minStr).split('+');
  return parseInt(parts[0]) || 0;
}

function loadPairsFromLineup(lineup, starters, subs, maxMin) {
  const pairs = [];
  for (const e of lineup) {
    if (e.replacedBy) {
      pairs.push({
        starterId: e.playerId,
        subId: e.replacedBy,
        minute: e.subOutMinute || '90'
      });
    }
  }
  if (pairs.length > 0) return pairs;
  return autoPairSubs(starters, subs, maxMin);
}

function detectMatchDuration(match) {
  let lineup = match.lineup || [];
  if (typeof lineup === 'string') {
    try { lineup = JSON.parse(lineup); } catch { lineup = []; }
  }
  const maxPlayerMin = Math.max(0, ...lineup.map(e => e.minutesPlayed || 0));
  if (maxPlayerMin > 90) return maxPlayerMin;

  const text = `${match.notes || ''} ${match.competition || ''}`.toLowerCase();
  const hasExtraTime = /penalty|penalties|a\.e\.t|aet|extra time|ต่อเวลา|จุดโทษ/.test(text);
  return hasExtraTime ? 120 : 90;
}

function PitchReport({ match, players, onUpdateLineup }) {
  const [durationOverride, setDurationOverride] = useState(null);

  const playerMap = new Map(players.map(p=>[p.id,p]));
  const lineup    = match.lineup||[];
  const played    = lineup.filter(e=>e.minutesPlayed>0||e.goals>0||e.assists>0);
  
  const currentDuration = durationOverride || Math.max(detectMatchDuration(match), ...played.map(e=>e.minutesPlayed||0));
  const maxMin = currentDuration;

  const { starters, subs } = detectStartersAndSubs(played, maxMin);

  const [pairs, setPairs]           = useState(() => loadPairsFromLineup(lineup, starters, subs, maxMin));
  const [showAfterSubs, setShowAfterSubs] = useState(false);
  const [dirty, setDirty]           = useState(false);
  const svgRef = useRef(null);

  const initPositions = () => {
    const fromSaved = played.filter(e=>e.pitchX!==undefined);
    if (fromSaved.length>0) return Object.fromEntries(fromSaved.map(e=>[e.playerId,{x:e.pitchX,y:e.pitchY}]));
    return {
      ...buildPitchLayout(starters.map(e=>({id:e.playerId,pos:playerMap.get(e.playerId)?.pos}))),
      ...buildPitchLayout(subs.map(e=>({id:e.playerId,pos:playerMap.get(e.playerId)?.pos}))),
    };
  };

  const [positions, setPositions] = useState(initPositions);
  const [dragging, setDragging]   = useState(null);

  useEffect(() => {
    const nextDuration = detectMatchDuration(match);
    const { starters:s, subs:u } = detectStartersAndSubs(played, nextDuration);
    setPositions(initPositions());
    setPairs(loadPairsFromLineup(lineup, s, u, nextDuration));
    setDurationOverride(null);
    setDirty(false);
  }, [match.id]);

  const updateLineupFromPairs = (newPairs, overrideDuration) => {
    const targetDuration = overrideDuration !== undefined ? overrideDuration : maxMin;
    let nextLineup = [...lineup].map(e => {
      const copy = { ...e };
      delete copy.replacedBy;
      delete copy.replacing;
      delete copy.subInMinute;
      delete copy.subOutMinute;
      return copy;
    });
    
    // Collect all starter IDs
    const starterIds = new Set(nextLineup.filter(e => e.isStarter !== false).map(e => e.playerId));
    
    // Ensure all subIds in pairs are present in nextLineup
    for (const pair of newPairs) {
      if (pair.starterId) starterIds.add(pair.starterId);
      if (pair.subId && !nextLineup.some(e => e.playerId === pair.subId)) {
        nextLineup.push({
          playerId: pair.subId,
          minutesPlayed: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCard: false,
          isStarter: false
        });
      }
    }
    
    // Reset starter minutes to play full targetDuration, and subs to play 0
    nextLineup = nextLineup.map(e => {
      const isStart = starterIds.has(e.playerId);
      return {
        ...e,
        minutesPlayed: isStart ? targetDuration : 0,
        isStarter: isStart
      };
    });
    
    // Apply substitution pairs and write metadata
    for (const pair of newPairs) {
      const { starterId, subId, minute } = pair;
      if (!starterId || !subId) continue;
      
      const playMin = getPlayMinute(minute);
      const starterMin = Math.min(targetDuration, playMin);
      const subMin = Math.max(0, targetDuration - starterMin);
      
      nextLineup = nextLineup.map(e => {
        if (e.playerId === starterId) {
          return {
            ...e,
            minutesPlayed: starterMin,
            isStarter: true,
            replacedBy: subId,
            subOutMinute: String(minute)
          };
        }
        if (e.playerId === subId) {
          return {
            ...e,
            minutesPlayed: subMin,
            isStarter: false,
            replacing: starterId,
            subInMinute: String(minute)
          };
        }
        return e;
      });
    }
    
    onUpdateLineup(nextLineup);
  };

  const handlePairsChange = (newPairs) => {
    setPairs(newPairs);
    updateLineupFromPairs(newPairs);
  };

  const VW=360, VH=520, PX=10, PY=10, PW=340, PH=500;
  const pcx = PX+PW/2;

  const onMouseDown = (e, id) => {
    e.preventDefault();
    const r = svgRef.current.getBoundingClientRect();
    setDragging({ id, scaleX:VW/r.width, scaleY:VH/r.height,
      startCX:e.clientX, startCY:e.clientY,
      origX:positions[id]?.x??0.5, origY:positions[id]?.y??0.5 });
  };
  const onMouseMove = e => {
    if (!dragging) return;
    const dx=(e.clientX-dragging.startCX)*dragging.scaleX;
    const dy=(e.clientY-dragging.startCY)*dragging.scaleY;
    setPositions(p=>({...p,[dragging.id]:{
      x:Math.max(.04,Math.min(.96, dragging.origX+dx/PW)),
      y:Math.max(.04,Math.min(.96, dragging.origY+dy/PH)),
    }}));
  };
  const onMouseUp = () => { if(dragging){setDirty(true);setDragging(null);} };

  const savePositions = () => {
    onUpdateLineup(lineup.map(e=>{
      const pos=positions[e.playerId];
      return pos?{...e,pitchX:+pos.x.toFixed(3),pitchY:+pos.y.toFixed(3)}:e;
    }));
    setDirty(false);
  };

  // After-subs: swap subbed starters with their paired subs
  const pairedStarterIds = new Set(pairs.map(p=>p.starterId));
  const onPitch = showAfterSubs
    ? [...starters.filter(e=>!pairedStarterIds.has(e.playerId)), ...subs]
    : starters;

  const renderToken = (e) => {
    const p = playerMap.get(e.playerId);
    if (!p) return null;
    const pos = positions[e.playerId];
    if (!pos) return null;
    const sx=PX+pos.x*PW, sy=PY+pos.y*PH;
    const col = PITCH_TOKEN_COLORS[posGroup(p.pos||'')] || '#6b7689';
    const isDrag = dragging?.id===e.playerId;
    const pair = pairs.find(pr=>pr.starterId===e.playerId);
    const subP = pair ? playerMap.get(pair.subId) : null;
    return (
      <g key={e.playerId} style={{cursor:isDrag?'grabbing':'grab'}} onMouseDown={ev=>onMouseDown(ev,e.playerId)}>
        {/* Player circle */}
        <circle cx={sx} cy={sy} r={19} fill={col} opacity={pair ? 0.75 : 0.92}
          stroke={isDrag?'#fff':'rgba(255,255,255,.55)'} strokeWidth={isDrag?2.5:1.5}/>
        <text x={sx} y={sy} textAnchor="middle" dominantBaseline="middle"
          fill="#fff" fontSize={9.5} fontWeight={700} pointerEvents="none">
          {(p.nick||p.name||'').split(' ')[0].slice(0,9)}
        </text>
        {e.goals>0 && <text x={sx-16} y={sy-16} fontSize={9} pointerEvents="none">⚽</text>}
        {e.yellowCards>0 && !pair && <text x={sx+15} y={sy-16} fontSize={9} pointerEvents="none">🟨</text>}
        {/* Sub-off badge */}
        {pair && subP && (
          <g pointerEvents="none">
            <text x={sx} y={sy-24} textAnchor="middle" fontSize={8} fill="#f87171" fontWeight={700}>↓{pair.minute}'</text>
            <circle cx={sx+19} cy={sy+19} r={13} fill="#0d2d0d" stroke="#4ade80" strokeWidth={1.5}/>
            <text x={sx+19} y={sy+19} textAnchor="middle" dominantBaseline="middle"
              fill="#4ade80" fontSize={8} fontWeight={700}>
              {(subP.nick||subP.name||'').split(' ')[0].slice(0,5)}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="pitch-report-wrap">
      <div className="pitch-controls">
        <div className="md-view-toggle">
          <button className={`md-view-btn ${!showAfterSubs?'on':''}`} onClick={()=>setShowAfterSubs(false)}>Starting XI</button>
          <button className={`md-view-btn ${showAfterSubs?'on':''}`} onClick={()=>setShowAfterSubs(true)}>After subs</button>
        </div>
        <span className="pitch-hint">Drag to reposition · Sub badge = replacement</span>
        <div className="md-view-toggle" style={{gap: '4px', marginRight: '6px'}}>
          <button className={`md-view-btn ${maxMin===90?'on':''}`} onClick={()=>{
            setDurationOverride(90);
            updateLineupFromPairs(pairs, 90);
          }}>90'</button>
          <button className={`md-view-btn ${maxMin===120?'on':''}`} onClick={()=>{
            setDurationOverride(120);
            updateLineupFromPairs(pairs, 120);
          }}>120'</button>
        </div>
        {dirty && <button className="btn-primary sm" onClick={savePositions}>💾 Save</button>}
      </div>

      <PitchTimeline
        starters={starters}
        subs={subs}
        lineup={lineup}
        players={players}
        pairs={pairs}
        playerMap={playerMap}
        maxMin={maxMin}
        onPairsChange={handlePairsChange}
      />

      <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`}
        style={{width:'100%',height:'auto',display:'block',cursor:dragging?'grabbing':'default',touchAction:'none',marginTop:'18px'}}
        onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        <rect x={0} y={0} width={VW} height={VH} fill="#121f12" rx={8}/>
        <clipPath id="pc"><rect x={PX} y={PY} width={PW} height={PH}/></clipPath>
        {Array.from({length:11},(_,i)=>(
          <rect key={i} x={PX+i*31} y={PY} width={31} height={PH}
            fill={i%2===0?'#1a4d1a':'#174417'} clipPath="url(#pc)"/>
        ))}
        <rect x={PX} y={PY} width={PW} height={PH} fill="none" stroke="rgba(255,255,255,.75)" strokeWidth={2}/>
        <line x1={PX} y1={PY+PH/2} x2={PX+PW} y2={PY+PH/2} stroke="rgba(255,255,255,.55)" strokeWidth={1.5}/>
        <circle cx={pcx} cy={PY+PH/2} r={48} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth={1.5}/>
        <circle cx={pcx} cy={PY+PH/2} r={3} fill="rgba(255,255,255,.65)"/>
        <rect x={pcx-112} y={PY} width={224} height={80} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth={1.5}/>
        <rect x={pcx-50}  y={PY} width={100} height={27} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth={1.5}/>
        <circle cx={pcx} cy={PY+57} r={2.5} fill="rgba(255,255,255,.6)"/>
        <rect x={pcx-32} y={PY-10} width={64} height={10} fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.5)" strokeWidth={1.5}/>
        <rect x={pcx-112} y={PY+PH-80} width={224} height={80} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth={1.5}/>
        <rect x={pcx-50}  y={PY+PH-27} width={100} height={27} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth={1.5}/>
        <circle cx={pcx} cy={PY+PH-57} r={2.5} fill="rgba(255,255,255,.6)"/>
        <rect x={pcx-32} y={PY+PH} width={64} height={10} fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.5)" strokeWidth={1.5}/>
        <text x={pcx} y={PY+PH*0.075} textAnchor="middle" fill="rgba(255,255,255,.2)" fontSize={10}>▲ Attack</text>
        {onPitch.map(renderToken)}
      </svg>
        
      <MatchTimelineList match={match} players={players} pairs={pairs} />
    </div>
  );
}

const LEVEL_FILTERS = ['All', 'Senior', 'U23', 'U20', 'U17'];
const LEVEL_COLORS  = { Senior:'var(--accent-blue)', U23:'#7c4dbd', U20:'#c07a18', U17:'#1a8a4a' };

// ── Video helpers (shared with video.jsx) ─────────────────────────────────────
function mdYtId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
function mdVimeoId(url) {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}
function mdThumb(url) {
  const yt = mdYtId(url);
  if (yt) return `https://img.youtube.com/vi/${yt}/mqdefault.jpg`;
  const vi = mdVimeoId(url);
  if (vi) return `https://vumbnail.com/${vi}.jpg`;
  return null;
}
function mdEmbed(url) {
  const yt = mdYtId(url);
  if (yt) return `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0`;
  const vi = mdVimeoId(url);
  if (vi) return `https://player.vimeo.com/video/${vi}?autoplay=1`;
  return url;
}

function MdVideoPlayer({ video, onClose }) {
  useEffect(() => {
    const k = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="vp-backdrop" onClick={onClose} style={{zIndex:600}}>
      <div className="vp-modal" onClick={e => e.stopPropagation()}>
        <div className="vp-modal-hd">
          <span style={{fontSize:20}}>🎬</span>
          <h2 className="vp-modal-title">{video.title}</h2>
          <button className="icon-btn close-x" onClick={onClose} style={{marginLeft:'auto'}}>✕</button>
        </div>
        <div className="vp-player-wrap">
          <iframe src={mdEmbed(video.url)} frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen className="vp-iframe"/>
        </div>
        {video.notes && <div className="vp-notes">{video.notes}</div>}
      </div>
    </div>
  );
}

function MatchVideoView({ match, videos, onVideosChange, onPlay }) {
  const matchVideos = videos.filter(v => v.match_id === match.id);
  const [url,      setUrl]      = useState('');
  const [title,    setTitle]    = useState('');
  const [notes,    setNotes]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const thumb = mdThumb(url);

  const save = async () => {
    if (!url.trim()) return;
    const t = title.trim() || `vs ${match.opponent}`;
    setSaving(true);
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: t, url, type: 'match', matchId: match.id, notes, tags: [] }),
    }).then(r => r.json()).catch(() => null);
    if (res?.id) {
      onVideosChange(vs => [{ id: res.id, title: t, url, type: 'match', match_id: match.id, notes, tags: [], created_at: new Date().toISOString() }, ...vs]);
      setUrl(''); setTitle(''); setNotes(''); setShowForm(false);
    }
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('ลบวิดีโอนี้?')) return;
    await fetch(`/api/videos/${id}`, { method: 'DELETE' }).catch(() => {});
    onVideosChange(vs => vs.filter(v => v.id !== id));
  };

  return (
    <div style={{padding:'16px 20px', display:'flex', flexDirection:'column', gap:14, overflowY:'auto', flex:1, minHeight:0}}>
      {/* Add button */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <span className="dim sm">{matchVideos.length} วิดีโอ สำหรับแมตท์นี้</span>
        <button className="btn-ghost sm" onClick={() => setShowForm(f => !f)}>
          {showForm ? '✕ ยกเลิก' : '+ เพิ่มวิดีโอ'}
        </button>
      </div>

      {/* Quick add form */}
      {showForm && (
        <div style={{background:'var(--bg-3)', border:'1px solid var(--line)', borderRadius:10, padding:14, display:'flex', flexDirection:'column', gap:8}}>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <input className="camp-input" style={{flex:1}} placeholder="YouTube / Vimeo URL…"
              value={url} onChange={e => setUrl(e.target.value)} autoFocus/>
            {thumb && <img src={thumb} style={{width:72, height:40, objectFit:'cover', borderRadius:6, flexShrink:0}} alt=""/>}
          </div>
          <input className="camp-input" placeholder={`ชื่อ (ปล่อยว่างได้ → "vs ${match.opponent}")`}
            value={title} onChange={e => setTitle(e.target.value)}/>
          <input className="camp-input" placeholder="โน้ต…"
            value={notes} onChange={e => setNotes(e.target.value)}/>
          <button className="btn-primary sm" onClick={save} disabled={!url.trim() || saving}>
            {saving ? 'กำลังบันทึก…' : '💾 บันทึก'}
          </button>
        </div>
      )}

      {/* Video list */}
      {matchVideos.length === 0 && !showForm && (
        <div className="dim sm" style={{padding:'24px 0', textAlign:'center'}}>
          ยังไม่มีวิดีโอสำหรับแมตท์นี้
        </div>
      )}
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {matchVideos.map(v => {
          const th = mdThumb(v.url);
          return (
            <div key={v.id} style={{display:'flex', gap:12, alignItems:'center', background:'var(--bg-3)', border:'1px solid var(--line)', borderRadius:10, padding:'10px 14px', cursor:'pointer'}}
              onClick={() => onPlay(v)}>
              {th
                ? <img src={th} style={{width:80, height:45, objectFit:'cover', borderRadius:6, flexShrink:0}} alt=""/>
                : <div style={{width:80, height:45, background:'var(--bg-deep)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0}}>🎬</div>
              }
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontFamily:'var(--font-display)', fontSize:14, fontWeight:600}}>{v.title}</div>
                {v.notes && <div className="dim sm" style={{marginTop:2}}>{v.notes}</div>}
              </div>
              <div style={{display:'flex', gap:6, flexShrink:0}}>
                <button className="btn-ghost sm" onClick={e => { e.stopPropagation(); onPlay(v); }}>▶ เล่น</button>
                <button className="btn-ghost sm" style={{color:'var(--accent-red)'}}
                  onClick={e => { e.stopPropagation(); del(v.id); }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LevelBadge({ level }) {
  if (!level || level === 'Senior') return null;
  return <span className="md-level-badge" style={{background: LEVEL_COLORS[level] || 'var(--fg-mute)'}}>{level}</span>;
}

function MatchdayPanel({ players, onMatchesChange, t, initialActiveId }) {
  const [matches,     setMatches]     = useState([]);
  const [activeId,    setActiveId]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [creating,    setCreating]    = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [savedAt,     setSavedAt]     = useState(null);
  const [levelFilter, setLevelFilter] = useState('All');
  const [mainView,    setMainView]    = useState('lineup'); // 'lineup' | 'pitch' | 'report'
  // Video integration
  const [videos,      setVideos]      = useState([]);
  const [playingVid,  setPlayingVid]  = useState(null);
  const [addingVid,   setAddingVid]   = useState(false);
  const [vidUrl,      setVidUrl]      = useState('');
  const [vidTitle,    setVidTitle]    = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/matches').then(r => r.ok ? r.json() : { matches: [] }),
      fetch('/api/videos').then(r => r.ok ? r.json() : { videos: [] }),
    ]).then(([md, vd]) => {
        const list = md.matches || [];
        setMatches(list);
        setVideos(vd.videos || []);
        if (initialActiveId) {
          setActiveId(initialActiveId);
        } else if (list.length) {
          setActiveId(list[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (initialActiveId) {
      setActiveId(initialActiveId);
    }
  }, [initialActiveId]);

  const activeMatch = matches.find(m => m.id === activeId) || null;

  const persist = (match) =>
    fetch(`/api/matches/${match.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opponent: match.opponent, competition: match.competition,
        matchDate: match.match_date, homeScore: match.home_score,
        awayScore: match.away_score, teamLevel: match.team_level,
        lineup: match.lineup, notes: match.notes,
        isPrivate: match.is_private || false,
        fifaRankChange: match.fifa_rank_change || 0,
        fifaPtsChange: match.fifa_pts_change || 0,
      }),
    }).then(() => setSavedAt(new Date())).catch(console.error);

  const createMatch = ({ opponent, matchDate, competition, homeScore, awayScore, teamLevel, notes, isPrivate, fifaRankChange, fifaPtsChange }) => {
    const tl = teamLevel || 'Senior';
    fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opponent, matchDate, competition, homeScore, awayScore, teamLevel: tl, lineup:[], notes, isPrivate: !!isPrivate, fifaRankChange, fifaPtsChange }),
    }).then(r => r.json()).then(({ id }) => {
      const m = { id, opponent, match_date: matchDate, competition, home_score: homeScore, away_score: awayScore, team_level: tl, lineup:[], notes, is_private: !!isPrivate, fifa_rank_change: fifaRankChange, fifa_pts_change: fifaPtsChange };
      setMatches(curr => {
        const next = [...curr, m];
        onMatchesChange?.(next);
        return next;
      });
      setActiveId(id);
      setCreating(false);
      setSavedAt(new Date());
    }).catch(console.error);
  };

  const saveMatchDetails = (id, vals) => {
    const updated = { ...matches.find(m => m.id === id), opponent: vals.opponent, match_date: vals.matchDate, competition: vals.competition, home_score: vals.homeScore, away_score: vals.awayScore, team_level: vals.teamLevel || 'Senior', notes: vals.notes, is_private: !!vals.isPrivate };
    setMatches(curr => curr.map(m => m.id === id ? updated : m));
    setEditingId(null);
    persist(updated);
  };

  const saveLineup = (matchId, lineup) => {
    const updated = { ...matches.find(m => m.id === matchId), lineup };
    const next = matches.map(m => m.id === matchId ? updated : m);
    setMatches(next);
    onMatchesChange?.(next);   // sync back to App so matchStats recomputes
    persist(updated);
  };

  const deleteMatch = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this match?')) return;
    await fetch(`/api/matches/${id}`, { method: 'DELETE' }).catch(console.error);
    setMatches(curr => curr.filter(m => m.id !== id));
    if (activeId === id) setActiveId(matches.find(m => m.id !== id)?.id || null);
  };

  const fmtDate = (d) => {
    if (!d) return null;
    const dt = new Date(d + 'T00:00:00');
    return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric' });
  };

  const calledCount = activeMatch?.lineup?.filter(e => e.minutesPlayed > 0).length || 0;

  const visibleMatches = (levelFilter === 'All'
    ? matches
    : matches.filter(m => (m.team_level || 'Senior') === levelFilter)
  ).slice().sort((a, b) => (b.match_date || '').localeCompare(a.match_date || ''));

  return (
    <>
    <div className="page-view matchday-page" style={{display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg-1)'}}>

        {/* Header */}
        <div className="callup-hd" style={{borderBottom: '1px solid var(--line-soft)', padding: '24px 32px 16px', background: 'var(--bg-1)'}}>
          <span className="callup-hd-title" style={{fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)'}}>📅 {t('matchLog') || 'Match Log'}</span>
          {savedAt && (
            <span className="callup-saved-badge">
              ✓ Saved {savedAt.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
            </span>
          )}
        </div>

        <div className="callup-body">
          {/* Sidebar — match list */}
          <aside className="callup-sidebar">
            <div className="callup-sb-hd">
              <span>Matches</span>
              <button className="btn-ghost sm" onClick={() => { setCreating(v => !v); setEditingId(null); }}>
                {creating ? '–' : '+ New'}
              </button>
            </div>

            {/* Team level filter */}
            <div className="md-level-filter">
              {LEVEL_FILTERS.map(lv => (
                <button key={lv}
                  className={`chip sm ${levelFilter === lv ? 'on' : ''}`}
                  style={levelFilter === lv && lv !== 'All' ? {background: LEVEL_COLORS[lv], borderColor: LEVEL_COLORS[lv]} : {}}
                  onClick={() => setLevelFilter(lv)}>
                  {lv}
                </button>
              ))}
            </div>

            {creating && (
              <MatchForm
                initial={{ team_level: levelFilter === 'All' ? 'Senior' : levelFilter }}
                onSave={createMatch}
                onCancel={() => setCreating(false)}/>
            )}

            {loading && <div className="callup-msg">Loading…</div>}
            {!loading && visibleMatches.length === 0 && !creating && (
              <div className="callup-msg">{levelFilter === 'All' ? 'No matches yet' : `No ${levelFilter} matches`}</div>
            )}

            {visibleMatches.map(match => (
              <div key={match.id}>
                {editingId === match.id ? (
                  <div style={{borderBottom:'1px solid var(--line)'}}>
                    <MatchForm
                      initial={match}
                      onSave={vals => saveMatchDetails(match.id, vals)}
                      onCancel={() => setEditingId(null)}/>
                  </div>
                ) : (
                  <div
                    className={`camp-item ${match.id === activeId ? 'active' : ''}`}
                    onClick={() => { setActiveId(match.id); setEditingId(null); }}>
                    <div className="camp-item-body">
                      <div className="camp-item-name">
                        <LevelBadge level={match.team_level}/>
                        {match.is_private && <span className="md-private-badge">🔒</span>}
                        {match.competition && <span className="md-comp-pill">{match.competition}</span>}
                        {' '}vs {match.opponent}
                        {(match.home_score > 0 || match.away_score > 0) && (
                          <span className="md-score-badge"> {match.home_score}–{match.away_score}</span>
                        )}
                      </div>
                      <div className="camp-item-meta">
                        {fmtDate(match.match_date) && <>{fmtDate(match.match_date)} · </>}
                        <span className="mono">{match.lineup?.filter(e=>e.minutesPlayed>0).length||0}</span> players
                        {match.notes && <> · {match.notes}</>}
                      </div>
                    </div>
                    <div className="camp-item-actions">
                      <button className="camp-del" title="Edit"
                        onClick={e => { e.stopPropagation(); setActiveId(match.id); setEditingId(match.id); }}>✎</button>
                      <button className="camp-del" title="Delete"
                        onClick={e => deleteMatch(match.id, e)}>✕</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </aside>

          {/* Main — lineup editor / report */}
          <div className="callup-checklist">
            {!activeMatch ? (
              <div className="callup-empty">Select or create a match to manage the lineup</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                {/* Horizontal top tabs */}
                <div className="md-side-tabs">
                  <button className={`md-side-tab ${mainView==='lineup'?'on':''}`}
                    onClick={() => setMainView('lineup')}>✏️ Lineup</button>
                  <button className={`md-side-tab ${mainView==='pitch'?'on':''}`}
                    onClick={() => setMainView('pitch')}>⚽ Pitch</button>
                  <button className={`md-side-tab ${mainView==='report'?'on':''}`}
                    onClick={() => setMainView('report')}>📋 Report</button>
                  <button className={`md-side-tab ${mainView==='video'?'on':''}`}
                    onClick={() => setMainView('video')}>
                    <span>🎬 Video</span>
                    {videos.filter(v=>v.match_id===activeMatch.id).length > 0 &&
                      <span className="md-vid-count">{videos.filter(v=>v.match_id===activeMatch.id).length}</span>}
                  </button>
                </div>

                {/* Content area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden', padding: '20px 24px' }}>
                  <div className="callup-camp-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-2)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line-soft)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {activeMatch.competition && <span className="md-comp-pill" style={{ background: 'var(--accent)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{activeMatch.competition}</span>}
                        <span className="dim sm" style={{ fontSize: 13 }}>
                          {fmtDate(activeMatch.match_date)}
                          {activeMatch.notes && <> · {activeMatch.notes}</>}
                        </span>
                      </div>
                      <div className="callup-cl-title" style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--fg)', marginTop: 4, letterSpacing: '-0.02em' }}>
                        Thailand <span style={{ color: 'var(--fg-dim)', fontWeight: 500, margin: '0 8px' }}>vs</span> {activeMatch.opponent}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      {(activeMatch.home_score != null && activeMatch.away_score != null) && (
                        <div style={{ background: 'var(--bg-3)', padding: '10px 24px', borderRadius: '12px', border: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          <span style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-display)', color: activeMatch.home_score > activeMatch.away_score ? '#4ade80' : activeMatch.home_score < activeMatch.away_score ? '#f87171' : 'var(--fg)' }}>
                            {activeMatch.home_score}
                          </span>
                          <span style={{ fontSize: 20, color: 'var(--fg-mute)', fontWeight: 300 }}>-</span>
                          <span style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-display)', color: activeMatch.away_score > activeMatch.home_score ? '#4ade80' : activeMatch.away_score < activeMatch.home_score ? '#f87171' : 'var(--fg)' }}>
                            {activeMatch.away_score}
                          </span>
                        </div>
                      )}
                      <div className="callup-cl-count mono" style={{ fontSize: 13, color: 'var(--fg-dim)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, background: calledCount > 0 ? '#4ade80' : 'var(--fg-mute)', borderRadius: '50%' }}></span>
                        {calledCount} Players Played
                      </div>
                    </div>
                  </div>

                  {mainView === 'lineup' ? (
                    <LineupEditor
                      key={activeMatch.id}
                      match={activeMatch}
                      players={players}
                      onSave={lineup => saveLineup(activeMatch.id, lineup)}/>
                  ) : mainView === 'pitch' ? (
                    <PitchReport
                      key={activeMatch.id}
                      match={activeMatch}
                      players={players}
                      onUpdateLineup={lineup => saveLineup(activeMatch.id, lineup)}/>
                  ) : mainView === 'report' ? (
                    <MatchReport match={activeMatch} players={players}/>
                  ) : (
                    <MatchVideoView
                      match={activeMatch}
                      videos={videos}
                      onVideosChange={setVideos}
                      addingVid={addingVid} setAddingVid={setAddingVid}
                      vidUrl={vidUrl} setVidUrl={setVidUrl}
                      vidTitle={vidTitle} setVidTitle={setVidTitle}
                      onPlay={setPlayingVid}
                    />
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>

    {playingVid && <MdVideoPlayer video={playingVid} onClose={() => setPlayingVid(null)}/>}
    </>
  );
}

window.MatchdayPanel = MatchdayPanel;
window.MatchReport = MatchReport;
window.PitchReport = PitchReport;
window.MatchTimelineList = MatchTimelineList;
