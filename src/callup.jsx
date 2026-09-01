// Call-up Manager — create camps, set date ranges, track squads
// Revamped into a Dashboard Router

function fmtDateRange(start, end) {
  if (!start && !end) return null;
  const fmt = (s) => {
    const d = new Date(s + 'T00:00:00');
    return isNaN(d) ? s : d.toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric' });
  };
  if (start && !end) return fmt(start);
  if (!start && end) return `– ${fmt(end)}`;
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
    <div className="camp-form camp-form-card">
      <div className="camp-form-heading">
        <div>
          <span className="callup-eyebrow">Camp details</span>
          <h2>{initial ? 'Edit camp' : 'Create a new camp'}</h2>
        </div>
        <button className="icon-btn" aria-label="Close form" onClick={onCancel}>✕</button>
      </div>
      <label className="camp-field camp-field-wide">
        <span>Camp name</span>
        <input className="camp-input" placeholder="e.g. FIFA Window — October" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus/>
      </label>
      <div className="camp-form-grid">
        <label className="camp-field">
          <span>Start date</span>
          <input type="date" className="camp-input" value={dateStart} onChange={e => setDateStart(e.target.value)}/>
        </label>
        <label className="camp-field">
          <span>End date</span>
          <input type="date" className="camp-input" value={dateEnd} onChange={e => setDateEnd(e.target.value)}/>
        </label>
        <label className="camp-field">
          <span>Competition / event</span>
          <input className="camp-input" placeholder="Competition name" value={competition} onChange={e => setCompetition(e.target.value)}/>
        </label>
        <label className="camp-field">
          <span>Team</span>
          <select className="camp-input" value={teamLevel} onChange={e => setTeamLevel(e.target.value)}>
            {teams.map(tm => <option key={tm}>{tm}</option>)}
          </select>
        </label>
      </div>
      <div className="camp-form-actions">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={submit}>{initial ? 'Save changes' : 'Create camp'}</button>
      </div>
    </div>
  );
}

function CallupPanel({ players, staff, camps, setCamps, onSelectPlayer, matches, t, initialCampId, initialTab, initialDate }) {
  const getCampStatus = (s, e) => {
    const today = new Date().toISOString().split('T')[0];
    if (e && today > e) return { text: 'Completed', color: '#ef4444', dot: '🔴', bg: 'rgba(239, 68, 68, 0.1)' };
    if (s && today < s) return { text: 'Upcoming', color: '#f59e0b', dot: '🟡', bg: 'rgba(245, 158, 11, 0.1)' };
    return { text: 'Ongoing', color: '#10b981', dot: '🟢', bg: 'rgba(16, 185, 129, 0.1)' };
  };
  const getDuration = (s, e) => {
    if (!s || !e) return null;
    const diff = new Date(e) - new Date(s);
    return Math.max(1, Math.round(diff / 86400000) + 1);
  };
  const [activeCampId, setActive] = useState(initialCampId || null);

  useEffect(() => {
    if (initialCampId) {
      setActive(initialCampId);
    }
  }, [initialCampId]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery]         = useState('');
  const [teamFilter, setTeamFilter] = useState('All');

  useEffect(() => {
    fetch(`/api/camps?_t=${Date.now()}`, { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`Unable to load camps (${r.status})`);
        return r.json();
      })
      .then(d => {
        if (Array.isArray(d.camps)) setCamps(d.camps);
      })
      .catch(err => console.warn('Keeping existing camp data:', err.message))
      .finally(() => setLoading(false));
  }, []);

  const persistCamp = (updated) =>
    fetch(`/api/camps/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:         updated.name,
        campDate:     updated.camp_date || updated.campDate || '',
        campDateEnd:  updated.camp_date_end || updated.campDateEnd || '',
        competition:  updated.competition || '',
        description:  updated.description || '',
        teamLevel:    updated.team_level || updated.teamLevel || 'Senior',
        playerIds:    updated.playerIds || [],
        playerShirts: updated.playerShirts || {},
        staffIds:     updated.staffIds || [],
        staffRoles:   updated.staffRoles || {},
      }),
    }).catch(console.error);

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
      setCreating(false);
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
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this camp and all its data?')) return;
    try {
      const res = await fetch(`/api/camps/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCamps(curr => curr.filter(c => c.id !== id));
      } else {
        alert('Failed to delete camp from server');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting camp');
    }
  };

  const TEAMS = ['Senior', 'U23', 'U20', 'U17', 'U15'];
  const activeCamp = camps.find(c => c.id === activeCampId) || null;
  const visibleCamps = camps.filter(camp => {
    const haystack = `${camp.name || ''} ${camp.competition || ''}`.toLowerCase();
    return (teamFilter === 'All' || camp.team_level === teamFilter) && haystack.includes(query.trim().toLowerCase());
  });
  const ongoingCount = camps.filter(c => getCampStatus(c.camp_date, c.camp_date_end).text === 'Ongoing').length;
  const upcomingCount = camps.filter(c => getCampStatus(c.camp_date, c.camp_date_end).text === 'Upcoming').length;

  // If a camp is selected, mount the Dashboard Router
  if (activeCamp) {
    if (window.CampDashboard) {
      return (
        <window.CampDashboard 
          camp={activeCamp} 
          players={players} 
          staff={staff}
          onClose={() => setActive(null)} 
          persistCamp={persistCamp} 
          setCamps={setCamps} 
          onSelectPlayer={onSelectPlayer}
          t={t} 
          initialTab={initialTab}
          initialDate={initialDate}
        />
      );
    } else {
      return <div style={{padding: 40}}>Loading Dashboard module...</div>;
    }
  }

  // Otherwise, render the Camp Grid
  return (
    <div className="page-view callup-page">
      <div className="callup-page-hd">
        <div>
          <span className="callup-eyebrow">Squad operations</span>
          <h1>National Team Camps</h1>
          <p>Create camps, organize squads and keep every call-up in one place.</p>
        </div>
        <button className="btn-primary" onClick={() => { setCreating(v => !v); setEditingId(null); }}>
          {creating ? '✕ Close form' : '+ New camp'}
        </button>
      </div>

      <div className="callup-page-body">
        <div className="callup-summary">
          <div className="callup-summary-item"><strong>{camps.length}</strong><span>Total camps</span></div>
          <div className="callup-summary-item is-live"><strong>{ongoingCount}</strong><span>Ongoing</span></div>
          <div className="callup-summary-item is-upcoming"><strong>{upcomingCount}</strong><span>Upcoming</span></div>
          <div className="callup-summary-item"><strong>{camps.reduce((sum, c) => sum + (c.playerIds?.length || 0), 0)}</strong><span>Call-ups recorded</span></div>
        </div>

        {creating && (
          <div className="camp-form-wrap">
            <CampForm teams={TEAMS} onSave={createCamp} onCancel={() => setCreating(false)} />
          </div>
        )}

        <div className="callup-toolbar">
          <div className="callup-team-filters" role="group" aria-label="Filter camps by team">
            {['All', ...TEAMS].map(team => (
              <button key={team} className={teamFilter === team ? 'active' : ''} onClick={() => setTeamFilter(team)}>{team}</button>
            ))}
          </div>
          <label className="callup-camp-search">
            <span>⌕</span>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search camps or competitions" />
          </label>
        </div>

        {loading ? <div className="callup-msg">Loading…</div> : (
          <div className="camp-card-grid">
            {camps.length === 0 && !creating && (
              <div className="callup-empty-state"><span>📋</span><h3>No camps yet</h3><p>Create your first camp to start building a squad.</p></div>
            )}
            {camps.length > 0 && visibleCamps.length === 0 && (
              <div className="callup-empty-state"><span>⌕</span><h3>No camps found</h3><p>Try another team or search term.</p></div>
            )}
            
            {visibleCamps.map(camp => (
              editingId === camp.id ? (
                <CampForm key={camp.id} initial={camp} teams={TEAMS} onSave={vals => saveCampDetails(camp.id, vals)} onCancel={() => setEditingId(null)} />
              ) : (
                <article key={camp.id} className="camp-card" onClick={() => setActive(camp.id)}>
                  <div className="camp-card-top">
                    <div className="camp-card-badges">
                      <span className="camp-team-badge">{camp.team_level}</span>
                      {(() => {
                        const st = getCampStatus(camp.camp_date, camp.camp_date_end);
                        return (
                          <span className="camp-status-badge" style={{background: st.bg, color: st.color}}><i style={{background: st.color}}></i>{st.text}</span>
                        );
                      })()}
                    </div>
                    <div className="camp-card-actions">
                      <button className="icon-btn sm" title="Edit" onClick={e => { e.stopPropagation(); setEditingId(camp.id); }}>✎</button>
                      <button className="icon-btn sm" title="Delete" style={{color: 'var(--err)'}} onClick={e => deleteCamp(camp.id, e)}>✕</button>
                    </div>
                  </div>

                  <h3>{camp.name}</h3>
                  
                  {camp.competition && (
                    <div className="camp-competition"><span>◇</span>{camp.competition}</div>
                  )}
                  
                  <div className="camp-date-row">
                    {fmtDateRange(camp.camp_date, camp.camp_date_end) && (
                      <span>🗓 {fmtDateRange(camp.camp_date, camp.camp_date_end)}</span>
                    )}
                    {getDuration(camp.camp_date, camp.camp_date_end) && (
                      <span>{getDuration(camp.camp_date, camp.camp_date_end)} days</span>
                    )}
                  </div>
                  
                  {camp.description && (
                    <p className="camp-description">{camp.description}</p>
                  )}

                  <div className="camp-card-details">
                    <div>
                      <span>Head coach</span>
                      <strong>
                        {(() => {
                          const hc = staff && staff.find(s => camp.staffRoles && (camp.staffRoles[s.id] || '').toLowerCase().includes('head coach'));
                          return hc ? (hc.nickname || hc.name || hc.thai_name) : 'Not assigned';
                        })()}
                      </strong>
                    </div>
                    <div>
                      <span>Matches</span>
                      <strong>{matches ? matches.filter(m => (!camp.camp_date || m.match_date >= camp.camp_date) && (!camp.camp_date_end || m.match_date <= camp.camp_date_end)).length : 0}</strong>
                    </div>
                  </div>

                  <div className="camp-card-footer">
                    <div className="camp-people-counts">
                      <div><strong>{camp.playerIds?.length || 0}</strong><span>Players</span></div>
                      <div><strong>{camp.staffIds?.length || 0}</strong><span>Staff</span></div>
                    </div>
                    <span className="camp-enter">Open camp <b>→</b></span>
                  </div>
                </article>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

window.CallupPanel = CallupPanel;
