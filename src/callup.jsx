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
    <div className="camp-form" style={{background: 'var(--bg-2)', padding: 20, borderRadius: 12, marginBottom: 20, border: '1px solid var(--line-soft)'}}>
      <input className="camp-input" placeholder="Camp name…" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus/>
      <div className="camp-daterange-box" style={{display:'flex', gap: 10, marginTop: 10, marginBottom: 10}}>
        <div style={{flex: 1}}>
          <span style={{fontSize: 12, display: 'block', marginBottom: 4}}>START</span>
          <input type="date" className="camp-input" value={dateStart} onChange={e => setDateStart(e.target.value)}/>
        </div>
        <div style={{flex: 1}}>
          <span style={{fontSize: 12, display: 'block', marginBottom: 4}}>END</span>
          <input type="date" className="camp-input" value={dateEnd} onChange={e => setDateEnd(e.target.value)}/>
        </div>
      </div>
      <input className="camp-input" style={{marginBottom: 10}} placeholder="Competition / event…" value={competition} onChange={e => setCompetition(e.target.value)}/>
      <select className="camp-input" style={{marginBottom: 15}} value={teamLevel} onChange={e => setTeamLevel(e.target.value)}>
        {teams.map(tm => <option key={tm}>{tm}</option>)}
      </select>
      <div style={{display:'flex', gap:6}}>
        <button className="btn-primary" style={{flex:1}} onClick={submit}>{initial ? 'Save changes' : 'Create camp'}</button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function CallupPanel({ players, staff, camps, setCamps, onSelectPlayer, matches, t }) {
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
  const [activeCampId, setActive] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch('/api/camps')
      .then(r => r.ok ? r.json() : { camps: [] })
      .then(d => {
        const list = d.camps || [];
        setCamps(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    e.stopPropagation();
    if (!confirm('Delete this camp and its call-up list?')) return;
    await fetch(`/api/camps/${id}`, { method: 'DELETE' }).catch(console.error);
    setCamps(curr => curr.filter(c => c.id !== id));
  };

  const TEAMS = ['Senior', 'U23', 'U20', 'U17', 'U15'];
  const activeCamp = camps.find(c => c.id === activeCampId) || null;

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
        />
      );
    } else {
      return <div style={{padding: 40}}>Loading Dashboard module...</div>;
    }
  }

  // Otherwise, render the Camp Grid
  return (
    <div className="page-view callup-page" style={{display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg-1)'}}>
      <div className="callup-hd" style={{borderBottom: '1px solid var(--line-soft)', padding: '24px 32px 16px', background: 'var(--bg-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span className="callup-hd-title" style={{fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)'}}>🇹🇭 National Team Camps</span>
        <button className="btn-primary" onClick={() => { setCreating(v => !v); setEditingId(null); }}>
          {creating ? '– Cancel' : '+ Create Camp'}
        </button>
      </div>

      <div className="callup-body" style={{padding: '30px', overflowY: 'auto', flex: 1}}>
        {creating && (
          <div style={{maxWidth: 500, margin: '0 auto 40px auto'}}>
            <CampForm teams={TEAMS} onSave={createCamp} onCancel={() => setCreating(false)} />
          </div>
        )}

        {loading ? <div className="callup-msg">Loading…</div> : (
          <div className="camp-card-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', alignItems: 'start'}}>
            {camps.length === 0 && !creating && (
              <div className="callup-msg" style={{gridColumn: '1/-1'}}>No camps yet — create one above</div>
            )}
            
            {camps.map(camp => (
              editingId === camp.id ? (
                <CampForm key={camp.id} initial={camp} teams={TEAMS} onSave={vals => saveCampDetails(camp.id, vals)} onCancel={() => setEditingId(null)} />
              ) : (
                <div key={camp.id} className="camp-card" onClick={() => setActive(camp.id)} 
                     style={{
                       background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--line-soft)', padding: 25, 
                       cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                       boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                       display: 'flex', flexDirection: 'column'
                     }}>
                  
                  {/* Decorative logos (Placeholders for Competition / Team Logo) */}
                  <div style={{position: 'absolute', top: 20, right: 20, opacity: 0.1, fontSize: 60, pointerEvents: 'none'}}>🇹🇭</div>

                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15}}>
                    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                      <div style={{background: 'var(--accent)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600}}>
                        {camp.team_level}
                      </div>
                      {(() => {
                        const st = getCampStatus(camp.camp_date, camp.camp_date_end);
                        return (
                          <div style={{background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4}}>
                            <span>{st.dot}</span> {st.text}
                          </div>
                        );
                      })()}
                    </div>
                    <div style={{display: 'flex', gap: 5}}>
                      <button className="icon-btn sm" title="Edit" onClick={e => { e.stopPropagation(); setEditingId(camp.id); }}>✎</button>
                      <button className="icon-btn sm" title="Delete" style={{color: 'var(--err)'}} onClick={e => deleteCamp(camp.id, e)}>✕</button>
                    </div>
                  </div>

                  <h3 style={{margin: '0 0 10px 0', fontSize: 22, fontFamily: 'var(--font-display)', lineHeight: 1.2}}>
                    {camp.name}
                  </h3>
                  
                  {camp.competition && (
                    <div style={{color: 'var(--fg)', fontWeight: 600, fontSize: 14, marginBottom: 10}}>🏆 {camp.competition}</div>
                  )}
                  
                  <div style={{color: 'var(--fg-dim)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 15, marginBottom: 15}}>
                    {fmtDateRange(camp.camp_date, camp.camp_date_end) && (
                      <span style={{display: 'flex', alignItems: 'center', gap: 5}}>📅 {fmtDateRange(camp.camp_date, camp.camp_date_end)}</span>
                    )}
                    {getDuration(camp.camp_date, camp.camp_date_end) && (
                      <span style={{display: 'flex', alignItems: 'center', gap: 5}}>⏱️ {getDuration(camp.camp_date, camp.camp_date_end)} Days</span>
                    )}
                  </div>
                  
                  {camp.description && (
                    <div style={{fontSize: 13, color: 'var(--fg-base)', marginBottom: 15, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic', background: 'var(--bg-1)', padding: 12, borderRadius: 8}}>
                      "{camp.description}"
                    </div>
                  )}

                  <div style={{flex: 1}}></div>
                  
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20}}>
                    <div style={{background: 'var(--bg-1)', padding: 12, borderRadius: 8}}>
                      <div style={{fontSize: 11, color: 'var(--fg-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4}}>Head Coach</div>
                      <div style={{fontSize: 14, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {(() => {
                          const hc = staff && staff.find(s => camp.staffRoles && camp.staffRoles[s.id] === 'Head Coach');
                          return hc ? (hc.nickname || hc.name || hc.thai_name) : 'Not assigned';
                        })()}
                      </div>
                    </div>
                    <div style={{background: 'var(--bg-1)', padding: 12, borderRadius: 8}}>
                      <div style={{fontSize: 11, color: 'var(--fg-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4}}>Matches</div>
                      <div style={{fontSize: 14, fontWeight: 600, color: 'var(--fg)'}}>
                        ⚽️ {matches ? matches.filter(m => (!camp.camp_date || m.match_date >= camp.camp_date) && (!camp.camp_date_end || m.match_date <= camp.camp_date_end)).length : 0} Match(es)
                      </div>
                    </div>
                  </div>

                  <div style={{paddingTop: 15, borderTop: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{fontSize: 13, color: 'var(--fg-dim)', display: 'flex', gap: 12}}>
                      <div><strong style={{color: 'var(--fg)', fontSize: 16}}>{camp.playerIds?.length || 0}</strong> Players</div>
                      <div><strong style={{color: 'var(--fg)', fontSize: 16}}>{camp.staffIds?.length || 0}</strong> Staff</div>
                    </div>
                    <span style={{color: 'var(--accent)', fontSize: 14, fontWeight: 600}}>Enter Dashboard →</span>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

window.CallupPanel = CallupPanel;
