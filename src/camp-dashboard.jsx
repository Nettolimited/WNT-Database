// Camp Dashboard — Full-screen mini-app for managing a specific camp

// --- Dashboard Tab ---
function CampDashboardTab({ camp, campPlayers, wMap }) {
  // Compute some stats
  const totalCalled = campPlayers.length;
  // Let's assume today is the first day of the camp if it hasn't started, or today if it's ongoing.
  const today = new Date().toISOString().slice(0, 10);
  
  return (
    <div className="cd-dashboard" style={{padding: '30px', animation: 'fade-in 0.3s ease'}}>
      <h2 style={{marginTop: 0, fontFamily: 'var(--font-display)', fontSize: 28}}>Dashboard</h2>
      
      <div className="cd-stats-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px'}}>
        <div className="cd-stat-card" style={{background: 'var(--bg-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line-soft)'}}>
          <div style={{color: 'var(--fg-dim)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1}}>Total Squad</div>
          <div style={{fontSize: 36, fontWeight: 700, marginTop: 10}}>{totalCalled}</div>
        </div>
        <div className="cd-stat-card" style={{background: 'var(--bg-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line-soft)'}}>
          <div style={{color: 'var(--fg-dim)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1}}>Avg Readiness</div>
          <div style={{fontSize: 36, fontWeight: 700, marginTop: 10, color: 'var(--accent)'}}>–</div>
        </div>
      </div>
      
      <div className="cd-schedule-preview" style={{background: 'var(--bg-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line-soft)'}}>
        <h3 style={{marginTop: 0}}>Today's Schedule</h3>
        <div className="callup-msg" style={{textAlign: 'left', padding: '20px 0'}}>No schedule data for today.</div>
      </div>
    </div>
  );
}

// --- Schedule Tab ---
function CampScheduleTab({ camp }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const loadSchedules = () => {
    setLoading(true);
    fetch(`/api/camp-schedules?camp_id=${camp.id}`)
      .then(r => r.ok ? r.json() : { schedules: [] })
      .then(d => setSchedules(d.schedules || []))
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

  const types = ['Training', 'Team Meeting', 'Treatment', 'Meal', 'Travel'];
  const typeEmojis = { 'Training':'⚽️', 'Team Meeting':'🗣', 'Treatment':'🩹', 'Meal':'🍽', 'Travel':'🚌' };

  return (
    <div className="cd-schedule-wrap" style={{padding: '30px', animation: 'fade-in 0.3s ease'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <h2 style={{margin: 0, fontFamily: 'var(--font-display)', fontSize: 28}}>Camp Schedule</h2>
        <button className="btn-primary" onClick={() => setEditingItem({ schedule_date: new Date().toISOString().slice(0, 10), time_start: '09:00', time_end: '11:00', title: '', type: 'Training', notes: '', video_url: '' })}>+ Add Event</button>
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
          {schedules.length === 0 ? <div className="callup-msg">No schedule events found.</div> : (
            schedules.map(item => (
              <div key={item.id} className="cd-timeline-item" style={{display: 'flex', gap: 20, marginBottom: 20, background: 'var(--bg-2)', padding: 20, borderRadius: 12, border: '1px solid var(--line-soft)'}}>
                <div style={{width: 100, flexShrink: 0, textAlign: 'right'}}>
                  <div style={{fontWeight: 700, fontSize: 18}}>{item.time_start}</div>
                  <div style={{color: 'var(--fg-dim)', fontSize: 13}}>{item.time_end}</div>
                  <div style={{fontSize: 12, marginTop: 5, color: 'var(--accent)'}}>{item.schedule_date}</div>
                </div>
                <div style={{width: 4, background: 'var(--line)', borderRadius: 2}}></div>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div style={{fontSize: 18, fontWeight: 700}}>
                      {typeEmojis[item.type]} {item.title}
                    </div>
                    <div>
                      <button className="icon-btn" onClick={() => setEditingItem(item)}>✎</button>
                      <button className="icon-btn" onClick={() => handleDelete(item.id)} style={{color: 'var(--err)'}}>✕</button>
                    </div>
                  </div>
                  <div style={{marginTop: 4, color: 'var(--fg-dim)', fontSize: 14}}>{item.type}</div>
                  {item.notes && <div style={{marginTop: 10, fontSize: 14, whiteSpace: 'pre-wrap'}}>{item.notes}</div>}
                  {item.video_url && (
                    <a href={item.video_url} target="_blank" className="btn-ghost sm" style={{display: 'inline-block', marginTop: 15, background: 'rgba(239,68,68,0.1)', color: '#ef4444'}}>
                      ▶️ Watch Video
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// --- Staff Tab ---
function CampStaffTab({ camp }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const loadStaff = () => {
    setLoading(true);
    fetch(`/api/camp-staff?camp_id=${camp.id}`)
      .then(r => r.ok ? r.json() : { staff: [] })
      .then(d => setStaff(d.staff || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStaff(); }, [camp.id]);

  const handleSave = (item) => {
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

  return (
    <div className="cd-staff-wrap" style={{padding: '30px', animation: 'fade-in 0.3s ease'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <h2 style={{margin: 0, fontFamily: 'var(--font-display)', fontSize: 28}}>Staff & Roles</h2>
        <button className="btn-primary" onClick={() => setEditingItem({ name: '', role: 'Head Coach', notes: '' })}>+ Add Staff</button>
      </div>

      {editingItem && (
        <div className="cd-form-modal" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 9999}}>
          <div style={{background: 'var(--bg-1)', padding: 30, borderRadius: 12, width: 400, maxWidth: '90%'}}>
            <h3 style={{marginTop: 0}}>Staff Member</h3>
            <div style={{marginBottom: 15}}>
              <label style={{display:'block', fontSize:12, marginBottom:4}}>Name</label>
              <input className="camp-input" value={editingItem.name} onChange={e=>setEditingItem({...editingItem, name: e.target.value})} autoFocus />
            </div>
            <div style={{marginBottom: 15}}>
              <label style={{display:'block', fontSize:12, marginBottom:4}}>Role</label>
              <input className="camp-input" placeholder="e.g. Head Coach, Physio..." value={editingItem.role} onChange={e=>setEditingItem({...editingItem, role: e.target.value})} />
            </div>
            <div style={{marginBottom: 20}}>
              <label style={{display:'block', fontSize:12, marginBottom:4}}>Notes</label>
              <textarea className="camp-input" rows={2} value={editingItem.notes} onChange={e=>setEditingItem({...editingItem, notes: e.target.value})} />
            </div>
            <div style={{display:'flex', gap: 10, justifyContent: 'flex-end'}}>
              <button className="btn-ghost" onClick={() => setEditingItem(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => handleSave(editingItem)}>Save Staff</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="callup-msg">Loading staff...</div> : (
        <div className="cd-staff-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20}}>
          {staff.length === 0 ? <div className="callup-msg" style={{gridColumn: '1/-1'}}>No staff members added yet.</div> : (
            staff.map(item => (
              <div key={item.id} className="cd-staff-card" style={{background: 'var(--bg-2)', padding: 20, borderRadius: 12, border: '1px solid var(--line-soft)', display: 'flex', flexDirection: 'column'}}>
                <div style={{fontSize: 18, fontWeight: 700}}>{item.name}</div>
                <div style={{color: 'var(--accent)', fontSize: 14, fontWeight: 600, marginTop: 4}}>{item.role}</div>
                {item.notes && <div style={{color: 'var(--fg-dim)', fontSize: 13, marginTop: 10, flex: 1}}>{item.notes}</div>}
                <div style={{marginTop: 15, display: 'flex', gap: 5, justifyContent: 'flex-end'}}>
                  <button className="btn-ghost sm" onClick={() => setEditingItem(item)}>✎ Edit</button>
                  <button className="btn-ghost sm" style={{color: 'var(--err)'}} onClick={() => handleDelete(item.id)}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function CampDashboard({ camp, players, onClose, persistCamp, setCamps, t }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const campPlayers = players.filter(p => (camp.playerIds || []).includes(p.id));
  const campShirts = camp.playerShirts || {};
  
  const TABS = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'players',   label: '🧑‍🤝‍🧑 Players' },
    { id: 'wellness',  label: '❤️ Wellness' },
    { id: 'injury',    label: '🤕 Injury' },
    { id: 'schedule',  label: '📅 Schedule' },
    { id: 'staff',     label: '👔 Staff' },
  ];

  return (
    <div className="camp-dashboard-app" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-1)', zIndex: 9000, display: 'flex', flexDirection: 'column'}}>
      {/* Top Navigation Header */}
      <div className="cd-header" style={{display: 'flex', alignItems: 'center', padding: '0 20px', height: 70, borderBottom: '1px solid var(--line-soft)', background: 'var(--bg-2)'}}>
        <button className="btn-ghost" onClick={onClose} style={{marginRight: 20}}>← Back</button>
        <div style={{flex: 1}}>
          <div style={{fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)'}}>{camp.name}</div>
          <div style={{fontSize: 13, color: 'var(--fg-dim)'}}>{camp.team_level} {camp.competition ? `· ${camp.competition}` : ''}</div>
        </div>
        <div className="cd-nav-tabs" style={{display: 'flex', gap: 5, height: '100%', alignItems: 'center'}}>
          {TABS.map(tab => (
            <button key={tab.id} 
              className={`cd-nav-btn ${activeTab === tab.id ? 'on' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', padding: '0 15px', height: '100%', 
                fontSize: 15, fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--fg)' : 'var(--fg-dim)',
                borderBottom: activeTab === tab.id ? '3px solid var(--accent)' : '3px solid transparent',
                cursor: 'pointer', transition: '0.2s'
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
          // We can embed the old Callup checklist here, or create a new CampPlayers component.
          // For now, we will use a placeholder or port the logic. 
          // Since the user wants the Call-up view here, we will render it.
          <CampPlayersTab camp={camp} players={players} persistCamp={persistCamp} setCamps={setCamps} t={t} />
        )}
        {activeTab === 'wellness'  && window.CampSessionTab ? <window.CampSessionTab camp={camp} campPlayers={campPlayers} campShirts={campShirts} /> : null}
        {activeTab === 'injury'    && window.CampSquadTab ? <window.CampSquadTab camp={camp} campPlayers={campPlayers} campShirts={campShirts} /> : null}
        {activeTab === 'schedule'  && <CampScheduleTab camp={camp} />}
        {activeTab === 'staff'     && <CampStaffTab camp={camp} />}
      </div>
    </div>
  );
}

window.CampDashboard = CampDashboard;
