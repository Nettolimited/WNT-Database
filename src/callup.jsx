// Call-up Manager — create camps, set date ranges, track squads

function fmtDateRange(start, end) {
  if (!start && !end) return null;
  if (start && !end) return start;
  if (!start && end) return `– ${end}`;
  // e.g. "2026-05-18" → "18 May 2026"
  const fmt = (s) => {
    const d = new Date(s + 'T00:00:00');
    return isNaN(d) ? s : d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

function CampForm({ initial, onSave, onCancel, teams }) {
  const [name,        setName]        = useState(initial?.name        || '');
  const [dateStart,   setDateStart]   = useState(initial?.camp_date    || '');
  const [dateEnd,     setDateEnd]     = useState(initial?.camp_date_end || '');
  const [competition, setCompetition] = useState(initial?.competition  || '');
  const [teamLevel,   setTeamLevel]   = useState(initial?.team_level   || 'Senior');

  const submit = () => {
    if (!name.trim()) return;
    onSave({ name, dateStart, dateEnd, competition, teamLevel });
  };

  return (
    <div className="camp-form">
      <input className="camp-input" placeholder="Camp name…" value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()} autoFocus/>
      <div className="camp-daterange-box">
        <div className="camp-dr-half">
          <span className="camp-dr-label">START</span>
          <input type="date" className="camp-dr-input" value={dateStart}
            onChange={e => setDateStart(e.target.value)}/>
        </div>
        <div className="camp-dr-divider">→</div>
        <div className="camp-dr-half">
          <span className="camp-dr-label">END</span>
          <input type="date" className="camp-dr-input" value={dateEnd}
            onChange={e => setDateEnd(e.target.value)}/>
        </div>
      </div>
      <input className="camp-input" placeholder="Competition / event…" value={competition}
        onChange={e => setCompetition(e.target.value)}/>
      <select className="camp-input" value={teamLevel} onChange={e => setTeamLevel(e.target.value)}>
        {teams.map(tm => <option key={tm}>{tm}</option>)}
      </select>
      <div style={{display:'flex', gap:6}}>
        <button className="btn-primary sm" style={{flex:1}} onClick={submit}>
          {initial ? 'Save changes' : 'Create camp'}
        </button>
        <button className="btn-ghost sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function CallupPanel({ players, onClose, t }) {
  const [camps, setCamps]         = useState([]);
  const [activeCampId, setActive] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [savedAt, setSavedAt]     = useState(null);
  const [filterPos, setFilterPos] = useState('All');
  const [search, setSearch]       = useState('');
  const [detailCamp, setDetailCamp] = useState(null);

  useEffect(() => {
    fetch('/api/camps')
      .then(r => r.ok ? r.json() : { camps: [] })
      .then(d => {
        const list = d.camps || [];
        setCamps(list);
        if (list.length) setActive(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const k = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const activeCamp  = camps.find(c => c.id === activeCampId) || null;
  const calledIds   = new Set(activeCamp?.playerIds || []);
  const campShirts  = activeCamp?.playerShirts || {}; // {playerId: shirtNumber}

  const visiblePlayers = players.filter(p => {
    if (p.active === false) return false;
    if (filterPos === 'GK'  && p.pos !== 'GK') return false;
    if (filterPos === 'DEF' && posGroup(p.pos) !== 'Defender')   return false;
    if (filterPos === 'MID' && posGroup(p.pos) !== 'Midfielder') return false;
    if (filterPos === 'FWD' && posGroup(p.pos) !== 'Forward')    return false;
    if (search) {
      const q = search.toLowerCase();
      if (![p.name, p.thaiName||'', p.nick||'', p.club].join(' ').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const persistCamp = (updated) =>
    fetch(`/api/camps/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:         updated.name,
        campDate:     updated.camp_date,
        campDateEnd:  updated.camp_date_end,
        competition:  updated.competition,
        description:  updated.description,
        teamLevel:    updated.team_level,
        playerIds:    updated.playerIds,
        playerShirts: updated.playerShirts ?? {},
      }),
    }).then(() => setSavedAt(new Date())).catch(console.error);

  // Set shirt number for a player in the active camp
  const setPlayerShirt = (playerId, shirt) => {
    if (!activeCamp) return;
    const shirts = { ...(activeCamp.playerShirts || {}), [playerId]: shirt === '' ? undefined : Number(shirt) };
    if (shirt === '') delete shirts[playerId];
    const updated = { ...activeCamp, playerShirts: shirts };
    setCamps(curr => curr.map(c => c.id === activeCampId ? updated : c));
    persistCamp(updated);
  };

  const togglePlayer = (playerId) => {
    if (!activeCamp) return;
    const newIds = calledIds.has(playerId)
      ? activeCamp.playerIds.filter(id => id !== playerId)
      : [...activeCamp.playerIds, playerId];
    const updated = { ...activeCamp, playerIds: newIds };
    setCamps(curr => curr.map(c => c.id === activeCampId ? updated : c));
    persistCamp(updated);
  };

  const createCamp = ({ name, dateStart, dateEnd, competition, teamLevel }) => {
    fetch('/api/camps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, campDate: dateStart, campDateEnd: dateEnd, competition, teamLevel }),
    }).then(r => r.json()).then(({ id }) => {
      const camp = {
        id, name, camp_date: dateStart, camp_date_end: dateEnd,
        competition, team_level: teamLevel, description: '',
        playerIds: [], playerShirts: {},
      };
      setCamps(curr => [camp, ...curr]);
      setActive(id);
      setCreating(false);
      setSavedAt(new Date());
    }).catch(console.error);
  };

  const saveCampDetails = (id, { name, dateStart, dateEnd, competition, teamLevel }) => {
    const updated = {
      ...camps.find(c => c.id === id),
      name, camp_date: dateStart, camp_date_end: dateEnd,
      competition, team_level: teamLevel,
    };
    setCamps(curr => curr.map(c => c.id === id ? updated : c));
    setEditingId(null);
    persistCamp(updated);
  };

  const deleteCamp = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this camp and its call-up list?')) return;
    await fetch(`/api/camps/${id}`, { method: 'DELETE' }).catch(console.error);
    setCamps(curr => curr.filter(c => c.id !== id));
    if (activeCampId === id) setActive(camps.find(c => c.id !== id)?.id || null);
  };

  const TEAMS      = ['Senior', 'U23', 'U20', 'U17', 'U15'];
  const POS_FILTERS = ['All', 'GK', 'DEF', 'MID', 'FWD'];

  return (
    <>
    <div className="callup-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="callup-panel">

        {/* ── Header ── */}
        <div className="callup-hd">
          <span className="callup-hd-title">📋 Call-up Manager</span>
          {savedAt && (
            <span className="callup-saved-badge">
              ✓ Saved {savedAt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
            </span>
          )}
          <button className="btn-primary callup-done-btn" onClick={onClose}>✓ Done</button>
          <button className="icon-btn close-x" onClick={onClose}>✕</button>
        </div>

        <div className="callup-body">
          {/* ── Left: camp list ── */}
          <aside className="callup-sidebar">
            <div className="callup-sb-hd">
              <span>Camps</span>
              <button className="btn-ghost sm" onClick={() => { setCreating(v => !v); setEditingId(null); }}>
                {creating ? '–' : '+ New'}
              </button>
            </div>

            {creating && (
              <CampForm
                teams={TEAMS}
                onSave={createCamp}
                onCancel={() => setCreating(false)}
              />
            )}

            {loading && <div className="callup-msg">Loading…</div>}
            {!loading && camps.length === 0 && !creating && (
              <div className="callup-msg">No camps yet — create one above</div>
            )}

            {camps.map(camp => (
              <div key={camp.id}>
                {editingId === camp.id ? (
                  <div style={{borderBottom:'1px solid var(--line)'}}>
                    <CampForm
                      initial={camp}
                      teams={TEAMS}
                      onSave={vals => saveCampDetails(camp.id, vals)}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <div
                    className={`camp-item ${camp.id === activeCampId ? 'active' : ''}`}
                    onClick={() => { setActive(camp.id); setEditingId(null); }}>
                    <div className="camp-item-body">
                      <div className="camp-item-name">{camp.name}</div>
                      <div className="camp-item-meta">
                        <span>{camp.team_level}</span>
                        {fmtDateRange(camp.camp_date, camp.camp_date_end) && (
                          <> · {fmtDateRange(camp.camp_date, camp.camp_date_end)}</>
                        )}
                        {camp.competition && <> · {camp.competition}</>}
                        <> · <span className="mono">{camp.playerIds?.length || 0}</span> players</>
                      </div>
                    </div>
                    <div className="camp-item-actions">
                      <button className="camp-del camp-view-btn" title="View camp detail"
                        onClick={e => { e.stopPropagation(); setDetailCamp(camp); }}>👁</button>
                      <button className="camp-del" title="Edit"
                        onClick={e => { e.stopPropagation(); setActive(camp.id); setEditingId(camp.id); }}>✎</button>
                      <button className="camp-del" title="Delete"
                        onClick={e => deleteCamp(camp.id, e)}>✕</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </aside>

          {/* ── Right: player checklist ── */}
          <div className="callup-checklist">
            {!activeCamp ? (
              <div className="callup-empty">Select or create a camp to manage call-ups</div>
            ) : (
              <>
                {/* Camp info bar */}
                <div className="callup-camp-info">
                  <div>
                    <div className="callup-cl-title">{activeCamp.name}</div>
                    <div className="callup-cl-sub dim">
                      {activeCamp.team_level}
                      {fmtDateRange(activeCamp.camp_date, activeCamp.camp_date_end) && (
                        <> · {fmtDateRange(activeCamp.camp_date, activeCamp.camp_date_end)}</>
                      )}
                      {activeCamp.competition && (
                        <> · <strong>{activeCamp.competition}</strong></>
                      )}
                    </div>
                  </div>
                  <div className="callup-cl-count mono">
                    {calledIds.size} called · {players.length - calledIds.size} uncalled
                  </div>
                </div>

                {/* Filter bar */}
                <div className="callup-cl-hd">
                  <input className="callup-search" placeholder="Search player…" value={search}
                    onChange={e => setSearch(e.target.value)}/>
                  <div className="chips sm">
                    {POS_FILTERS.map(f => (
                      <button key={f} className={`chip ${filterPos===f?'on':''}`}
                        onClick={() => setFilterPos(f)}>{f}</button>
                    ))}
                  </div>
                </div>

                {/* Player rows */}
                <div className="callup-list">
                  {visiblePlayers.map(p => {
                    const isCalled = calledIds.has(p.id);
                    const campShirt = campShirts[p.id];
                    return (
                      <label key={p.id} className={`callup-row ${isCalled ? 'called' : ''}`}>
                        <input type="checkbox" className="callup-chk"
                          checked={isCalled}
                          onChange={() => togglePlayer(p.id)}/>
                        <PlayerPhoto playerId={p.id} name={p.name} size={40}/>
                        <div className="callup-name-block">
                          <span className="callup-name">{p.name}</span>
                          {p.thaiName && <span className="callup-thai dim">{p.thaiName}</span>}
                        </div>
                        <PosBadge pos={p.pos} t={t}/>
                        <ClubChip code={p.club} small/>
                        <span className="callup-team-pill">{p.team}</span>
                        {/* Shirt number input — only shown when called up */}
                        {isCalled && (
                          <span className="callup-shirt-wrap" onClick={e => e.preventDefault()}>
                            <span className="callup-shirt-hash">#</span>
                            <input
                              type="number" min="1" max="99"
                              className="callup-shirt-input"
                              placeholder="–"
                              value={campShirt ?? ''}
                              onChange={e => setPlayerShirt(p.id, e.target.value)}/>
                          </span>
                        )}
                      </label>
                    );
                  })}
                  {visiblePlayers.length === 0 && (
                    <div className="callup-msg" style={{padding:'30px 20px'}}>No players match filter</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    {detailCamp && (
      <CampDetailPanel
        camp={detailCamp}
        players={players}
        onClose={() => setDetailCamp(null)}
      />
    )}
    </>
  );
}

window.CallupPanel = CallupPanel;
