// FM-inspired squad depth view for Thailand WNT

const SD_PROFICIENCY = {
  1: { label: 'Best Position', color: '#22c55e' },
  2: { label: 'Very Strong', color: '#84cc16' },
  3: { label: 'Strong', color: '#facc15' },
  4: { label: 'Can Play', color: '#fb923c' },
  5: { label: 'Backup', color: '#94a3b8' },
};

const SD_FORMATIONS = {
  '4-3-3': {
    label: '4-3-3 DM Wide',
    slots: [
      { id:'gk', pos:'GK', x:50, y:89 },
      { id:'lb', pos:'LB', x:15, y:72 }, { id:'lcb', pos:'CB', x:37.5, y:75 },
      { id:'rcb', pos:'CB', x:62.5, y:75 }, { id:'rb', pos:'RB', x:85, y:72 },
      { id:'dm', pos:'DM', x:50, y:57 },
      { id:'lcm', pos:'CM', x:33, y:43 }, { id:'rcm', pos:'CM', x:67, y:43 },
      { id:'lw', pos:'LW', x:17, y:21 }, { id:'st', pos:'ST', x:50, y:13 }, { id:'rw', pos:'RW', x:83, y:21 },
    ],
  },
  '4-2-3-1': {
    label: '4-2-3-1 Wide',
    slots: [
      { id:'gk', pos:'GK', x:50, y:89 },
      { id:'lb', pos:'LB', x:15, y:72 }, { id:'lcb', pos:'CB', x:37.5, y:75 },
      { id:'rcb', pos:'CB', x:62.5, y:75 }, { id:'rb', pos:'RB', x:85, y:72 },
      { id:'ldm', pos:'DM', x:37, y:56 }, { id:'rdm', pos:'DM', x:63, y:56 },
      { id:'lw', pos:'LW', x:17, y:33 }, { id:'am', pos:'AM', x:50, y:35 }, { id:'rw', pos:'RW', x:83, y:33 },
      { id:'st', pos:'ST', x:50, y:13 },
    ],
  },
  '3-4-3': {
    label: '3-4-3',
    slots: [
      { id:'gk', pos:'GK', x:50, y:89 },
      { id:'lcb', pos:'CB', x:28, y:73 }, { id:'cb', pos:'CB', x:50, y:77 }, { id:'rcb', pos:'CB', x:72, y:73 },
      { id:'lb', pos:'LB', x:14, y:50 }, { id:'lcm', pos:'CM', x:38, y:50 },
      { id:'rcm', pos:'CM', x:62, y:50 }, { id:'rb', pos:'RB', x:86, y:50 },
      { id:'lw', pos:'LW', x:18, y:22 }, { id:'st', pos:'ST', x:50, y:13 }, { id:'rw', pos:'RW', x:82, y:22 },
    ],
  },
};

function sdPositionLevels(player) {
  const saved = player?.stats?.positionLevels;
  if (saved && typeof saved === 'object' && Object.keys(saved).length) {
    return Object.fromEntries(Object.entries(saved).map(([pos, level]) => [pos, Number(level)]));
  }
  const levels = {};
  if (player?.pos) levels[player.pos] = 1;
  (player?.altPos || []).forEach((pos, index) => { levels[pos] = Math.min(index + 2, 5); });
  return levels;
}

function sdShortName(player) {
  if (player.nick) return player.nick;
  const parts = (player.name || '').trim().split(/\s+/);
  return parts[parts.length - 1] || player.name;
}

function SquadDepth({ players, camps = [], matchStats = new Map(), onSelectPlayer }) {
  const [formationKey, setFormationKey] = useState('4-3-3');
  const [team, setTeam] = useState('Senior');
  const [campId, setCampId] = useState('all');
  const [selectedSlotId, setSelectedSlotId] = useState('st');
  const formation = SD_FORMATIONS[formationKey];
  const sortedCamps = useMemo(() => [...camps].sort((a, b) =>
    (b.camp_date || b.campDate || '').localeCompare(a.camp_date || a.campDate || '')
  ), [camps]);
  const selectedCamp = sortedCamps.find(camp => camp.id === campId);

  const campPlayerIds = useMemo(() => {
    if (!selectedCamp) return null;
    if (Array.isArray(selectedCamp.playerIds)) return selectedCamp.playerIds;
    if (Array.isArray(selectedCamp.player_ids)) return selectedCamp.player_ids;
    try { return JSON.parse(selectedCamp.player_ids || '[]'); } catch { return []; }
  }, [selectedCamp]);

  useEffect(() => {
    if (!formation.slots.some(slot => slot.id === selectedSlotId)) setSelectedSlotId(formation.slots[0].id);
  }, [formationKey]);

  const pool = useMemo(() => players.filter(player => {
    if (campPlayerIds && !campPlayerIds.includes(player.id)) return false;
    if (!campPlayerIds && player.active === false) return false;
    return team === 'All' || team === 'Senior' || player.team === team;
  }), [players, team, campPlayerIds]);

  const candidatesFor = (position) => pool
    .map(player => ({ player, level: sdPositionLevels(player)[position] }))
    .filter(item => item.level >= 1 && item.level <= 5)
    .sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      const aApps = matchStats.get(a.player.id)?.apps ?? a.player.intStats?.apps ?? a.player.caps ?? 0;
      const bApps = matchStats.get(b.player.id)?.apps ?? b.player.intStats?.apps ?? b.player.caps ?? 0;
      return bApps - aApps || (a.player.name || '').localeCompare(b.player.name || '');
    });

  const slotDepth = useMemo(() => formation.slots.map(slot => {
    const candidates = candidatesFor(slot.pos);
    const strongCount = candidates.filter(item => item.level <= 3).length;
    const status = strongCount >= 3 ? 'strong' : strongCount === 2 ? 'okay' : 'warning';
    return { ...slot, candidates, strongCount, status };
  }), [formation, pool, matchStats]);

  const selectedSlot = slotDepth.find(slot => slot.id === selectedSlotId) || slotDepth[0];
  const warnings = slotDepth.filter(slot => slot.status === 'warning');
  const healthy = slotDepth.filter(slot => slot.status === 'strong').length;
  const topChoiceCounts = new Map();
  slotDepth.forEach(slot => {
    const id = slot.candidates[0]?.player.id;
    if (id) topChoiceCounts.set(id, (topChoiceCounts.get(id) || 0) + 1);
  });
  const overloaded = [...topChoiceCounts.entries()].filter(([, count]) => count > 1);

  return (
    <div className="sd-page">
      <header className="sd-header">
        <div>
          <div className="sd-eyebrow">SQUAD PLANNING</div>
          <h1>Squad Depth</h1>
          <p>Position coverage based on each player's saved proficiency.</p>
        </div>
        <div className="sd-controls">
          <label>Camp
            <select className="sd-camp-select" value={campId} onChange={e => {
              setCampId(e.target.value);
              if (e.target.value !== 'all') setTeam('All');
            }}>
              <option value="all">All Camps · Full Player Pool</option>
              {sortedCamps.map(camp => {
                const date = camp.camp_date || camp.campDate || '';
                return <option key={camp.id} value={camp.id}>{date ? `${date} · ` : ''}{camp.name}</option>;
              })}
            </select>
          </label>
          <label>Squad
            <select value={team} onChange={e => setTeam(e.target.value)}>
              {['All','Senior','U23','U20','U17','U15'].map(value => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label>Formation
            <select value={formationKey} onChange={e => setFormationKey(e.target.value)}>
              {Object.entries(SD_FORMATIONS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
            </select>
          </label>
        </div>
      </header>

      <div className="sd-kpis">
        <div className="sd-kpi"><span>Player Pool</span><strong>{pool.length}</strong><small>{selectedCamp ? selectedCamp.name : (team === 'All' ? 'All active squads' : team === 'Senior' ? 'Senior open-age players' : `${team} active players`)}</small></div>
        <div className="sd-kpi sd-kpi-good"><span>Strong Depth</span><strong>{healthy}/{slotDepth.length}</strong><small>3+ strong options</small></div>
        <div className={`sd-kpi ${warnings.length ? 'sd-kpi-warn' : 'sd-kpi-good'}`}><span>Needs Attention</span><strong>{warnings.length}</strong><small>Fewer than 2 strong options</small></div>
        <div className={`sd-kpi ${overloaded.length ? 'sd-kpi-caution' : 'sd-kpi-good'}`}><span>First-choice Load</span><strong>{overloaded.length}</strong><small>Players leading multiple slots</small></div>
      </div>

      <div className="sd-workspace">
        <section className="sd-pitch-card">
          <div className="sd-card-head">
            <div><strong>{formation.label}</strong><span>Top three options per position · click to inspect the full list</span></div>
            <div className="sd-legend"><span className="strong">● Strong</span><span className="okay">● 2 options</span><span className="warning">● Thin</span></div>
          </div>
          <div className="sd-pitch">
            <div className="sd-pitch-half"></div><div className="sd-pitch-circle"></div>
            <div className="sd-pitch-box sd-pitch-box-top"></div><div className="sd-pitch-box sd-pitch-box-bottom"></div>
            {slotDepth.map(slot => (
              <button key={slot.id} className={`sd-slot sd-slot-${slot.status} ${slot.id === selectedSlot?.id ? 'selected' : ''}`}
                style={{left:`${slot.x}%`,top:`${slot.y}%`}} onClick={() => setSelectedSlotId(slot.id)}>
                <span className="sd-slot-pos">{slot.pos}</span>
                {slot.candidates[0] && <span className="sd-slot-photo"><window.PlayerPhoto playerId={slot.candidates[0].player.id} name={slot.candidates[0].player.name} size={28} /></span>}
                <span className="sd-slot-first">{slot.candidates[0] ? `1. ${sdShortName(slot.candidates[0].player)}` : 'No option'}</span>
                <span className="sd-slot-depth">{slot.candidates.length > 1
                  ? slot.candidates.slice(1,3).map((item,index) => `${index + 2}. ${sdShortName(item.player)}`).join(' · ')
                  : `${slot.strongCount} strong · ${slot.candidates.length} total`}</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="sd-detail-card">
          <div className="sd-detail-title">
            <div className={`sd-position-badge sd-position-${selectedSlot.status}`}>{selectedSlot.pos}</div>
            <div><h2>{selectedSlot.pos} Depth</h2><p>{selectedSlot.strongCount} strong options · {selectedSlot.candidates.length} total</p></div>
          </div>
          <div className="sd-depth-list">
            {selectedSlot.candidates.length ? selectedSlot.candidates.slice(0, 10).map((item, index) => {
              const ms = matchStats.get(item.player.id);
              const apps = ms?.apps ?? item.player.intStats?.apps ?? item.player.caps ?? 0;
              const proficiency = SD_PROFICIENCY[item.level];
              const duplicate = (topChoiceCounts.get(item.player.id) || 0) > 1 && index === 0;
              return (
                <button className="sd-player-row" key={item.player.id} onClick={() => onSelectPlayer?.(item.player)}>
                  <span className="sd-rank">{index + 1}</span>
                  <span className="sd-player-avatar"><window.PlayerPhoto playerId={item.player.id} name={item.player.name} size={30} /></span>
                  <span className="sd-player-info"><strong>{item.player.name}</strong><small>{item.player.nick ? `${item.player.nick} · ` : ''}{clubByCode(item.player.club).name || item.player.club || 'No club'}</small></span>
                  <span className="sd-player-caps"><strong>{apps}</strong><small>Caps</small></span>
                  <span className="sd-proficiency" style={{'--prof-color':proficiency.color}}>{proficiency.label}</span>
                  {duplicate && <span className="sd-duplicate" title="First choice in multiple positions">!</span>}
                </button>
              );
            }) : <div className="sd-empty"><strong>No suitable player</strong><span>Set position proficiency from the player's profile.</span></div>}
          </div>
          <div className="sd-detail-note">Ranking uses position proficiency first, then international appearances.</div>
        </aside>
      </div>

      <section className="sd-analysis">
        <div className="sd-analysis-head"><div><span>⚠</span><strong>Position Analysis</strong></div><small>FM-inspired depth warnings</small></div>
        {warnings.length ? (
          <div className="sd-warning-grid">{warnings.map(slot => (
            <button key={slot.id} onClick={() => setSelectedSlotId(slot.id)}>
              <span className="sd-warning-pos">{slot.pos}</span>
              <span><strong>Depth needs attention</strong><small>{slot.strongCount === 0 ? 'No strong option available' : 'Only one strong option available'}</small></span>
              <span>Review →</span>
            </button>
          ))}</div>
        ) : <div className="sd-all-covered">✓ Every position has at least two strong options.</div>}
      </section>
    </div>
  );
}

window.SquadDepth = SquadDepth;
