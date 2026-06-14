// GPS Performance Tab for CampDetailPanel

function GPSPerformanceTab({ camp, campPlayers, campShirts }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [session, setSession] = useState('AM');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'charts'
  const [gpsSort, setGpsSort] = useState('pos');
  const [gMap, setGMap] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [outfieldSubMode, setOutfieldSubMode] = useState('core'); // 'core' or 'zones'

  const mapKey = (pid, d, s) => `${d}_${s}_${pid}`;
  const get = pid => gMap.get(mapKey(pid, date, session)) || {};

  const loadSession = (d, s) => {
    setLoading(true);
    fetch(`/api/camp-gps?camp_id=${camp.id}&session_date=${d}&session=${s}`)
      .then(r => r.ok ? r.json() : { entries: [] })
      .then(data => {
        setGMap(m => {
          const next = new Map(m);
          for (const e of (data.entries || [])) next.set(mapKey(e.player_id, e.session_date, e.session), e);
          return next;
        });
      }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadSession(date, session); }, [camp.id, date, session]);

  const patch = (pid, updates) => {
    const cur = get(pid);
    const next = { ...cur, ...updates, camp_id: camp.id, player_id: pid, session_date: date, session };
    setGMap(m => new Map(m).set(mapKey(pid, date, session), next));
    fetch('/api/camp-gps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) })
      .catch(console.error);
  };

  const addDays = (ds, n) => {
    const d = new Date(ds + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Group players
  const sortedCampPlayers = window.sortPlayersList ? window.sortPlayersList(campPlayers, gpsSort, campShirts) : campPlayers;
  const outfieldPlayers = sortedCampPlayers.filter(p => p.pos !== 'GK');
  const gkPlayers = sortedCampPlayers.filter(p => p.pos === 'GK');

  // Find max values for highlighting (top performer)
  const maxOutfield = { 
    total_dist: 0, m_per_min: 0, hsr_dist: 0, sprint_dist: 0, max_vel: 0, total_pl: 0, accel_decel_effs: 0, explosive_effs: 0,
    zone1_dist: 0, zone2_dist: 0, zone3_dist: 0, zone4_dist: 0, zone5_dist: 0, zone6_dist: 0
  };
  const maxGk = { total_dist: 0, explosive_effs: 0, gk_jumps: 0, gk_dive_total: 0, gk_accel_load: 0, total_pl: 0 };
  
  outfieldPlayers.forEach(p => {
    const w = get(p.id);
    if ((w.total_dist||0) > maxOutfield.total_dist) maxOutfield.total_dist = w.total_dist;
    if ((w.m_per_min||0) > maxOutfield.m_per_min) maxOutfield.m_per_min = w.m_per_min;
    if ((w.hsr_dist||0) > maxOutfield.hsr_dist) maxOutfield.hsr_dist = w.hsr_dist;
    if ((w.sprint_dist||0) > maxOutfield.sprint_dist) maxOutfield.sprint_dist = w.sprint_dist;
    if ((w.max_vel||0) > maxOutfield.max_vel) maxOutfield.max_vel = w.max_vel;
    if ((w.total_pl||0) > maxOutfield.total_pl) maxOutfield.total_pl = w.total_pl;
    if ((w.accel_decel_effs||0) > maxOutfield.accel_decel_effs) maxOutfield.accel_decel_effs = w.accel_decel_effs;
    if ((w.explosive_effs||0) > maxOutfield.explosive_effs) maxOutfield.explosive_effs = w.explosive_effs;
    if ((w.zone1_dist||0) > maxOutfield.zone1_dist) maxOutfield.zone1_dist = w.zone1_dist;
    if ((w.zone2_dist||0) > maxOutfield.zone2_dist) maxOutfield.zone2_dist = w.zone2_dist;
    if ((w.zone3_dist||0) > maxOutfield.zone3_dist) maxOutfield.zone3_dist = w.zone3_dist;
    if ((w.zone4_dist||0) > maxOutfield.zone4_dist) maxOutfield.zone4_dist = w.zone4_dist;
    if ((w.zone5_dist||0) > maxOutfield.zone5_dist) maxOutfield.zone5_dist = w.zone5_dist;
    if ((w.zone6_dist||0) > maxOutfield.zone6_dist) maxOutfield.zone6_dist = w.zone6_dist;
  });

  gkPlayers.forEach(p => {
    const w = get(p.id);
    if ((w.total_dist||0) > maxGk.total_dist) maxGk.total_dist = w.total_dist;
    if ((w.explosive_effs||0) > maxGk.explosive_effs) maxGk.explosive_effs = w.explosive_effs;
    if ((w.gk_jumps||0) > maxGk.gk_jumps) maxGk.gk_jumps = w.gk_jumps;
    if ((w.gk_dive_total||0) > maxGk.gk_dive_total) maxGk.gk_dive_total = w.gk_dive_total;
    if ((w.gk_accel_load||0) > maxGk.gk_accel_load) maxGk.gk_accel_load = w.gk_accel_load;
    if ((w.total_pl||0) > maxGk.total_pl) maxGk.total_pl = w.total_pl;
  });

  // Calculate Averages for Outfield
  const activeOutfield = outfieldPlayers.filter(p => get(p.id).total_dist > 0 || get(p.id).total_pl > 0);
  const avgOut = {};
  if (activeOutfield.length > 0) {
    const sumOut = (key) => activeOutfield.reduce((acc, p) => acc + (get(p.id)[key] || 0), 0);
    avgOut.total_dist = sumOut('total_dist') / activeOutfield.length;
    avgOut.max_vel = sumOut('max_vel') / activeOutfield.length;
    avgOut.hsr_dist = sumOut('hsr_dist') / activeOutfield.length;
    avgOut.sprint_dist = sumOut('sprint_dist') / activeOutfield.length;
    avgOut.total_pl = sumOut('total_pl') / activeOutfield.length;
    avgOut.accel_decel_effs = sumOut('accel_decel_effs') / activeOutfield.length;
    avgOut.m_per_min = sumOut('m_per_min') / activeOutfield.length;
    avgOut.explosive_effs = sumOut('explosive_effs') / activeOutfield.length;
    avgOut.zone1_dist = sumOut('zone1_dist') / activeOutfield.length;
    avgOut.zone2_dist = sumOut('zone2_dist') / activeOutfield.length;
    avgOut.zone3_dist = sumOut('zone3_dist') / activeOutfield.length;
    avgOut.zone4_dist = sumOut('zone4_dist') / activeOutfield.length;
    avgOut.zone5_dist = sumOut('zone5_dist') / activeOutfield.length;
    avgOut.zone6_dist = sumOut('zone6_dist') / activeOutfield.length;
  }

  // Calculate Averages for GK
  const activeGk = gkPlayers.filter(p => get(p.id).total_dist > 0 || get(p.id).total_pl > 0 || get(p.id).gk_dive_total > 0);
  const avgGk = {};
  if (activeGk.length > 0) {
    const sumGk = (key) => activeGk.reduce((acc, p) => acc + (get(p.id)[key] || 0), 0);
    avgGk.total_dist = sumGk('total_dist') / activeGk.length;
    avgGk.total_pl = sumGk('total_pl') / activeGk.length;
    avgGk.explosive_effs = sumGk('explosive_effs') / activeGk.length;
    avgGk.gk_jumps = sumGk('gk_jumps') / activeGk.length;
    avgGk.gk_dive_total = sumGk('gk_dive_total') / activeGk.length;
    avgGk.gk_accel_load = sumGk('gk_accel_load') / activeGk.length;
  }

  // Bar chart components
  const ChartBar = ({ val, max, label, color, labelColor, sideMetric }) => {
    const pct = max > 0 ? (val / max) * 100 : 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, height: 24 }}>
        <div style={{ width: 80, fontSize: 11, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--fg)' }}>{label}</div>
        <div style={{ flex: 1, height: '100%', background: 'var(--bg-3)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: color, transition: 'width 0.3s' }} />
          <div style={{ position: 'absolute', left: 6, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 10, fontWeight: 600, color: labelColor || (pct > 10 ? '#fff' : 'var(--fg)') }}>
            {val ? Number(val).toFixed(0) : ''}
          </div>
        </div>
        {sideMetric !== undefined && (
          <div style={{ width: 30, fontSize: 10, fontWeight: 700, textAlign: 'left', color: 'var(--fg-dim)' }}>{sideMetric}</div>
        )}
      </div>
    );
  };

  const TableHeader = ({ isGk }) => (
    <thead>
      <tr>
        <th className="cd-th-player">Player</th>
        <th className="cd-th-num" title="Total Distance (m)">Tot Dist<br/>(m)</th>
        <th className="cd-th-num" title="Total Player Load">Tot PL</th>
        {isGk ? (
          <React.Fragment>
            <th className="cd-th-num" title="Explosive Efforts">Expl<br/>Effs</th>
            <th className="cd-th-num" title="Total Jumps">Jumps</th>
            <th className="cd-th-num" title="Total Dive Count">Dives<br/>Total</th>
            <th className="cd-th-num" title="Dive Left Count">Dive<br/>L</th>
            <th className="cd-th-num" title="Dive Right Count">Dive<br/>R</th>
            <th className="cd-th-num" title="Dive Centre Count">Dive<br/>C</th>
            <th className="cd-th-num" title="Acceleration Load GK">Accel<br/>Load</th>
            <th className="cd-th-num" title="Dive Load Left">Load<br/>L</th>
            <th className="cd-th-num" title="Dive Load Right">Load<br/>R</th>
          </React.Fragment>
        ) : outfieldSubMode === 'zones' ? (
          <React.Fragment>
            <th className="cd-th-num" title="Zone 1: 0.00 - 5.99 km/h (Walk)">Z1 Dist<br/>(0-6 km/h)</th>
            <th className="cd-th-num" title="Zone 2: 6.00 - 11.99 km/h (Jog)">Z2 Dist<br/>(6-12 km/h)</th>
            <th className="cd-th-num" title="Zone 3: 12.00 - 15.99 km/h (Run)">Z3 Dist<br/>(12-16 km/h)</th>
            <th className="cd-th-num" title="Zone 4: 16.00 - 19.99 km/h (HSR)">Z4 Dist<br/>(16-20 km/h)</th>
            <th className="cd-th-num" title="Zone 5: 20.00 - 24.99 km/h (Sprint)">Z5 Dist<br/>(20-25 km/h)</th>
            <th className="cd-th-num" title="Zone 6: >= 25.00 km/h (Max Sprint)">Z6 Dist<br/>(>=25 km/h)</th>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <th className="cd-th-num" title="Meterage Per Minute">m/min</th>
            <th className="cd-th-num" title="High Speed Distance (m)">HSR Dist<br/>(m)</th>
            <th className="cd-th-num" title="Sprint Distance (m)">Sprint<br/>(m)</th>
            <th className="cd-th-num" title="Explosive Efforts">Expl<br/>Effs</th>
            <th className="cd-th-num" title="Accel + Decel Efforts">A+D<br/>Effs</th>
            <th className="cd-th-num" title="Max Velocity (km/h)">Max Vel<br/>(km/h)</th>
            <th className="cd-th-num" title="Percentage of Max Vel">% Max</th>
          </React.Fragment>
        )}
      </tr>
    </thead>
  );

  const TableRow = ({ p, isGk }) => {
    const w = get(p.id);
    const max = isGk ? maxGk : maxOutfield;
    // Highlights
    const hiDist = w.total_dist && w.total_dist >= max.total_dist * 0.95;
    const hiSpeed = !isGk && w.max_vel && w.max_vel >= max.max_vel * 0.95;
    const hiPL = w.total_pl && w.total_pl >= max.total_pl * 0.95;
    
    return (
      <tr className="cd-tr">
        <td className="cd-td-player">
          <window.PlayerPhoto playerId={p.id} name={p.name} size={34} />
          <div className="cd-td-names">
            <span className="cd-td-name">{p.name}</span>
            <span className="cd-td-thai">{p.nick || ''}</span>
          </div>
          {campShirts[p.id] != null && <span className="cd-td-shirt">#{campShirts[p.id]}</span>}
          <window.PosBadge pos={p.pos} />
        </td>
        <td className="cd-td-num">
          <input type="number" step="1" className="cd-metric-input" style={{ width: 60, color: hiDist ? '#16a34a' : '', fontWeight: hiDist ? 600 : 400 }}
            value={w.total_dist || ''} placeholder="–" onChange={e => patch(p.id, { total_dist: Number(e.target.value) || 0 })} />
        </td>
        <td className="cd-td-num">
          <input type="number" step="1" className="cd-metric-input" style={{ width: 55, color: hiPL ? '#dc2626' : '', fontWeight: hiPL ? 600 : 400 }}
            value={w.total_pl || ''} placeholder="–" onChange={e => patch(p.id, { total_pl: Number(e.target.value) || 0 })} />
        </td>
        {isGk ? (
          <React.Fragment>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 45 }}
                value={w.explosive_effs || ''} placeholder="–" onChange={e => patch(p.id, { explosive_effs: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 45 }}
                value={w.gk_jumps || ''} placeholder="–" onChange={e => patch(p.id, { gk_jumps: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 45, fontWeight: 600, color: '#ea580c' }}
                value={w.gk_dive_total || ''} placeholder="–" onChange={e => patch(p.id, { gk_dive_total: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 40 }}
                value={w.gk_dive_left || ''} placeholder="–" onChange={e => patch(p.id, { gk_dive_left: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 40 }}
                value={w.gk_dive_right || ''} placeholder="–" onChange={e => patch(p.id, { gk_dive_right: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 40 }}
                value={w.gk_dive_centre || ''} placeholder="–" onChange={e => patch(p.id, { gk_dive_centre: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="0.1" className="cd-metric-input" style={{ width: 55 }}
                value={w.gk_accel_load || ''} placeholder="–" onChange={e => patch(p.id, { gk_accel_load: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="0.1" className="cd-metric-input" style={{ width: 45 }}
                value={w.gk_dive_load_left || ''} placeholder="–" onChange={e => patch(p.id, { gk_dive_load_left: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="0.1" className="cd-metric-input" style={{ width: 45 }}
                value={w.gk_dive_load_right || ''} placeholder="–" onChange={e => patch(p.id, { gk_dive_load_right: Number(e.target.value) || 0 })} />
            </td>
          </React.Fragment>
        ) : outfieldSubMode === 'zones' ? (
          <React.Fragment>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 55 }}
                value={w.zone1_dist || ''} placeholder="–" onChange={e => patch(p.id, { zone1_dist: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 55 }}
                value={w.zone2_dist || ''} placeholder="–" onChange={e => patch(p.id, { zone2_dist: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 55 }}
                value={w.zone3_dist || ''} placeholder="–" onChange={e => patch(p.id, { zone3_dist: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 55 }}
                value={w.zone4_dist || ''} placeholder="–" onChange={e => patch(p.id, { zone4_dist: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 55 }}
                value={w.zone5_dist || ''} placeholder="–" onChange={e => patch(p.id, { zone5_dist: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 55 }}
                value={w.zone6_dist || ''} placeholder="–" onChange={e => patch(p.id, { zone6_dist: Number(e.target.value) || 0 })} />
            </td>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <td className="cd-td-num">
              <input type="number" step="0.1" className="cd-metric-input" style={{ width: 55 }}
                value={w.m_per_min || ''} placeholder="–" onChange={e => patch(p.id, { m_per_min: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 55 }}
                value={w.hsr_dist || ''} placeholder="–" onChange={e => patch(p.id, { hsr_dist: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 55 }}
                value={w.sprint_dist || ''} placeholder="–" onChange={e => patch(p.id, { sprint_dist: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 45 }}
                value={w.explosive_effs || ''} placeholder="–" onChange={e => patch(p.id, { explosive_effs: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="1" className="cd-metric-input" style={{ width: 45 }}
                value={w.accel_decel_effs || ''} placeholder="–" onChange={e => patch(p.id, { accel_decel_effs: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="0.1" className="cd-metric-input" style={{ width: 55, color: hiSpeed ? '#ea580c' : '', fontWeight: hiSpeed ? 600 : 400 }}
                value={w.max_vel || ''} placeholder="–" onChange={e => patch(p.id, { max_vel: Number(e.target.value) || 0 })} />
            </td>
            <td className="cd-td-num">
              <input type="number" step="0.1" className="cd-metric-input" style={{ width: 50 }}
                value={w.percent_max_vel || ''} placeholder="–" onChange={e => patch(p.id, { percent_max_vel: Number(e.target.value) || 0 })} />
            </td>
          </React.Fragment>
        )}
      </tr>
    );
  };

  return (
    <div className="cd-session-wrap">
      <div className="cd-session-bar" style={{ padding: '20px 30px' }}>
        <button className="btn-ghost sm" onClick={() => setDate(d => addDays(d, -1))}>◀</button>
        <div className="cd-date-block">
          <input type="date" className="cd-date-input" value={date} onChange={e => setDate(e.target.value)} />
          <span className="cd-date-pretty">{new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
        <button className="btn-ghost sm" onClick={() => setDate(d => addDays(d, 1))}>▶</button>

        <div className="cd-session-toggle">
          {['AM', 'PM', 'Daily'].map(s => (
            <button key={s} className={`cd-sess-btn ${session === s ? 'on' : ''}`} onClick={() => setSession(s)}>
              {s === 'AM' ? '🌅 Morning' : s === 'PM' ? '🌆 Evening' : '📊 Full Day'}
            </button>
          ))}
        </div>

        <div className="cd-session-toggle" style={{ marginLeft: 12 }}>
          <button className={`cd-sess-btn ${viewMode === 'table' ? 'on' : ''}`} onClick={() => setViewMode('table')}>📝 Data Entry</button>
          <button className={`cd-sess-btn ${viewMode === 'charts' ? 'on' : ''}`} onClick={() => setViewMode('charts')}>📊 Compare Charts</button>
        </div>
        
        <select className="btn-ghost" value={gpsSort} onChange={e => setGpsSort(e.target.value)} style={{marginLeft: 12, padding: '8px', borderRadius: 20, background: 'var(--bg-2)', border: '1px solid var(--line-soft)', color: 'var(--fg-base)'}}>
          <option value="pos">Sort: Position</option>
          <option value="shirt">Sort: Shirt #</option>
          <option value="name">Sort: Name</option>
          <option value="age">Sort: Age</option>
        </select>
        
        <span className="cd-fill-count">🏃 Tracked: {activeOutfield.length + activeGk.length}/{campPlayers.length}{loading && ' · loading…'}</span>
      </div>

      {viewMode === 'table' ? (
        <div className="cd-table-wrap" style={{ padding: '0 30px' }}>
          {/* Outfield Table */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Outfield Players</h3>
            <div className="cd-session-toggle" style={{ margin: 0 }}>
              <button className={`cd-sess-btn ${outfieldSubMode === 'core' ? 'on' : ''}`} onClick={() => setOutfieldSubMode('core')} style={{ padding: '4px 12px', fontSize: 11 }}>
                🎯 Core Metrics
              </button>
              <button className={`cd-sess-btn ${outfieldSubMode === 'zones' ? 'on' : ''}`} onClick={() => setOutfieldSubMode('zones')} style={{ padding: '4px 12px', fontSize: 11 }}>
                ⚡ Speed Zones (Z1-Z6)
              </button>
            </div>
          </div>
          <table className="cd-table" style={{ marginBottom: 40 }}>
            <TableHeader isGk={false} />
            <tbody>
              {outfieldPlayers.map(p => <TableRow key={p.id} p={p} isGk={false} />)}
              {activeOutfield.length > 0 && (
                <tr className="cd-tr-avg" style={{ borderTop: '2px solid var(--line)', background: 'var(--bg-1)' }}>
                  <td className="cd-td-player" style={{ fontWeight: 'bold' }}>Average / เฉลี่ย</td>
                  <td className="cd-td-num cd-avg-val">{(avgOut.total_dist||0).toFixed(0)}</td>
                  <td className="cd-td-num cd-avg-val">{(avgOut.total_pl||0).toFixed(0)}</td>
                  {outfieldSubMode === 'zones' ? (
                    <React.Fragment>
                      <td className="cd-td-num cd-avg-val">{(avgOut.zone1_dist||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgOut.zone2_dist||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgOut.zone3_dist||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgOut.zone4_dist||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgOut.zone5_dist||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgOut.zone6_dist||0).toFixed(0)}</td>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <td className="cd-td-num cd-avg-val">{(avgOut.m_per_min||0).toFixed(1)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgOut.hsr_dist||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgOut.sprint_dist||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgOut.explosive_effs||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgOut.accel_decel_effs||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgOut.max_vel||0).toFixed(1)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgOut.percent_max_vel||0).toFixed(1)}%</td>
                    </React.Fragment>
                  )}
                </tr>
              )}
            </tbody>
          </table>

          {/* GK Table */}
          {gkPlayers.length > 0 && (
            <React.Fragment>
              <h3 style={{ marginTop: 0, marginBottom: 10, color: 'var(--fg-dim)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Goalkeepers</h3>
              <table className="cd-table" style={{ marginBottom: 40 }}>
                <TableHeader isGk={true} />
                <tbody>
                  {gkPlayers.map(p => <TableRow key={p.id} p={p} isGk={true} />)}
                  {activeGk.length > 0 && (
                    <tr className="cd-tr-avg" style={{ borderTop: '2px solid var(--line)', background: 'var(--bg-1)' }}>
                      <td className="cd-td-player" style={{ fontWeight: 'bold' }}>Average / เฉลี่ย</td>
                      <td className="cd-td-num cd-avg-val">{(avgGk.total_dist||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgGk.total_pl||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgGk.explosive_effs||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgGk.gk_jumps||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val">{(avgGk.gk_dive_total||0).toFixed(0)}</td>
                      <td className="cd-td-num cd-avg-val" />
                      <td className="cd-td-num cd-avg-val" />
                      <td className="cd-td-num cd-avg-val" />
                      <td className="cd-td-num cd-avg-val">{(avgGk.gk_accel_load||0).toFixed(1)}</td>
                      <td className="cd-td-num cd-avg-val" />
                      <td className="cd-td-num cd-avg-val" />
                    </tr>
                  )}
                </tbody>
              </table>
            </React.Fragment>
          )}
        </div>
      ) : (
        <div style={{ padding: '0 30px 40px', overflowY: 'auto', flex: 1 }}>
          <h3 style={{ marginTop: 0, marginBottom: 20, color: 'var(--fg)', fontSize: 20 }}>Outfield Performance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 30, marginBottom: 50 }}>
            {/* Speed Zone Distribution Chart */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16, gridColumn: 'span 2' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span>SPEED ZONE DISTRIBUTION (Z1 - Z6 Meters)</span>
                <div style={{ display: 'flex', gap: 8, fontSize: 10, fontWeight: 600, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, background: '#a1a1aa', borderRadius: 2 }}/>Z1 (0-6)</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, background: '#60a5fa', borderRadius: 2 }}/>Z2 (6-12)</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, background: '#34d399', borderRadius: 2 }}/>Z3 (12-16)</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, background: '#fbbf24', borderRadius: 2 }}/>Z4 (16-20)</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, background: '#f97316', borderRadius: 2 }}/>Z5 (20-25)</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: 2 }}/>Z6 (&gt;25)</span>
                </div>
              </div>
              {activeOutfield.length === 0 || activeOutfield.every(p => !(get(p.id).zone1_dist || get(p.id).zone2_dist || get(p.id).zone3_dist || get(p.id).zone4_dist || get(p.id).zone5_dist || get(p.id).zone6_dist)) ? (
                <div style={{ fontSize: 12, color: 'var(--fg-mute)', fontStyle: 'italic', padding: '20px 0', textAlign: 'center' }}>
                  No Speed Zone data entered for this session. / ยังไม่มีข้อมูล Speed Zone ในเซสชันนี้
                </div>
              ) : (
                activeOutfield.map(p => {
                  const w = get(p.id);
                  const z1 = w.zone1_dist || 0;
                  const z2 = w.zone2_dist || 0;
                  const z3 = w.zone3_dist || 0;
                  const z4 = w.zone4_dist || 0;
                  const z5 = w.zone5_dist || 0;
                  const z6 = w.zone6_dist || 0;
                  
                  const totalZoneDist = z1 + z2 + z3 + z4 + z5 + z6;
                  if (totalZoneDist === 0) return null;
                  
                  const pct = val => totalZoneDist > 0 ? (val / totalZoneDist) * 100 : 0;
                  
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, height: 24 }}>
                      <div style={{ width: 90, fontSize: 11, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--fg)' }}>
                        {p.nick || p.name}
                      </div>
                      <div style={{ flex: 1, height: '100%', background: 'var(--bg-3)', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                        {z1 > 0 && <div style={{ width: `${pct(z1)}%`, background: '#a1a1aa', transition: 'width 0.3s' }} title={`Z1: ${z1.toFixed(0)}m`} />}
                        {z2 > 0 && <div style={{ width: `${pct(z2)}%`, background: '#60a5fa', transition: 'width 0.3s' }} title={`Z2: ${z2.toFixed(0)}m`} />}
                        {z3 > 0 && <div style={{ width: `${pct(z3)}%`, background: '#34d399', transition: 'width 0.3s' }} title={`Z3: ${z3.toFixed(0)}m`} />}
                        {z4 > 0 && <div style={{ width: `${pct(z4)}%`, background: '#fbbf24', transition: 'width 0.3s' }} title={`Z4: ${z4.toFixed(0)}m`} />}
                        {z5 > 0 && <div style={{ width: `${pct(z5)}%`, background: '#f97316', transition: 'width 0.3s' }} title={`Z5: ${z5.toFixed(0)}m`} />}
                        {z6 > 0 && <div style={{ width: `${pct(z6)}%`, background: '#ef4444', transition: 'width 0.3s' }} title={`Z6: ${z6.toFixed(0)}m`} />}
                      </div>
                      <div style={{ width: 65, fontSize: 11, fontWeight: 700, color: 'var(--fg-dim)', textAlign: 'left' }}>
                        {totalZoneDist.toFixed(0)}m
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Total Distance Chart */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                TOTAL DISTANCE (m)
                <span style={{ color: 'var(--fg-dim)', fontWeight:400 }}>Avg: {(avgOut.total_dist||0).toFixed(0)}m</span>
              </div>
              {activeOutfield.slice().sort((a,b)=>(get(b.id).total_dist||0) - (get(a.id).total_dist||0)).map(p => {
                const val = get(p.id).total_dist || 0;
                return <ChartBar key={p.id} val={val} max={maxOutfield.total_dist} label={p.nick || p.name} color="#84cc16" />;
              })}
            </div>

            {/* Meterage Per Minute Chart */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                METERAGE PER MINUTE
                <span style={{ color: 'var(--fg-dim)', fontWeight:400 }}>Avg: {(avgOut.m_per_min||0).toFixed(1)}</span>
              </div>
              {activeOutfield.slice().sort((a,b)=>(get(b.id).m_per_min||0) - (get(a.id).m_per_min||0)).map(p => {
                const val = get(p.id).m_per_min || 0;
                return <ChartBar key={p.id} val={val} max={maxOutfield.m_per_min} label={p.nick || p.name} color="#10b981" />;
              })}
            </div>

            {/* High Speed Distance Chart */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                HIGH SPEED DIST (m)
                <span style={{ color: 'var(--fg-dim)', fontWeight:400 }}>Avg: {(avgOut.hsr_dist||0).toFixed(0)}m</span>
              </div>
              {activeOutfield.slice().sort((a,b)=>(get(b.id).hsr_dist||0) - (get(a.id).hsr_dist||0)).map(p => {
                const val = get(p.id).hsr_dist || 0;
                return <ChartBar key={p.id} val={val} max={maxOutfield.hsr_dist} label={p.nick || p.name} color="#f59e0b" />;
              })}
            </div>

            {/* Sprint Distance Chart */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                SPRINT DISTANCE (m)
                <span style={{ color: 'var(--fg-dim)', fontWeight:400 }}>Avg: {(avgOut.sprint_dist||0).toFixed(0)}m</span>
              </div>
              {activeOutfield.slice().sort((a,b)=>(get(b.id).sprint_dist||0) - (get(a.id).sprint_dist||0)).map(p => {
                const val = get(p.id).sprint_dist || 0;
                return <ChartBar key={p.id} val={val} max={maxOutfield.sprint_dist} label={p.nick || p.name} color="#ef4444" />;
              })}
            </div>

            {/* Max Velocity Chart */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                MAX VELOCITY (km/h)
                <span style={{ color: 'var(--fg-dim)', fontWeight:400 }}>Avg: {(avgOut.max_vel||0).toFixed(1)}km/h</span>
              </div>
              {activeOutfield.slice().sort((a,b)=>(get(b.id).max_vel||0) - (get(a.id).max_vel||0)).map(p => {
                const val = get(p.id).max_vel || 0;
                return <ChartBar key={p.id} val={val} max={maxOutfield.max_vel} label={p.nick || p.name} color="#3b82f6" />;
              })}
            </div>

            {/* Explosive Efforts Chart */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                EXPLOSIVE EFFORTS
                <span style={{ color: 'var(--fg-dim)', fontWeight:400 }}>Avg: {(avgOut.explosive_effs||0).toFixed(0)}</span>
              </div>
              {activeOutfield.slice().sort((a,b)=>(get(b.id).explosive_effs||0) - (get(a.id).explosive_effs||0)).map(p => {
                const val = get(p.id).explosive_effs || 0;
                return <ChartBar key={p.id} val={val} max={maxOutfield.explosive_effs} label={p.nick || p.name} color="#d946ef" />;
              })}
            </div>

            {/* Accel / Decel Chart */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                ACCEL + DECEL EFFORTS
                <span style={{ color: 'var(--fg-dim)', fontWeight:400 }}>Avg: {(avgOut.accel_decel_effs||0).toFixed(0)}</span>
              </div>
              {activeOutfield.slice().sort((a,b)=>(get(b.id).accel_decel_effs||0) - (get(a.id).accel_decel_effs||0)).map(p => {
                const val = get(p.id).accel_decel_effs || 0;
                return <ChartBar key={p.id} val={val} max={maxOutfield.accel_decel_effs} label={p.nick || p.name} color="#06b6d4" />;
              })}
            </div>

            {/* Total Player Load Chart */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                TOTAL PLAYER LOAD
                <span style={{ color: 'var(--fg-dim)', fontWeight:400 }}>Avg: {(avgOut.total_pl||0).toFixed(0)}</span>
              </div>
              {activeOutfield.slice().sort((a,b)=>(get(b.id).total_pl||0) - (get(a.id).total_pl||0)).map(p => {
                const val = get(p.id).total_pl || 0;
                return <ChartBar key={p.id} val={val} max={maxOutfield.total_pl} label={p.nick || p.name} color="#a855f7" />;
              })}
            </div>
          </div>

          {/* GK Charts */}
          {gkPlayers.length > 0 && (
            <React.Fragment>
              <h3 style={{ marginTop: 0, marginBottom: 20, color: 'var(--fg)', fontSize: 20 }}>GK REPORT</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 30 }}>
                {/* GK Total Distance */}
                <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                    TOTAL DISTANCE (m)
                    <span style={{ color: 'var(--fg-dim)', fontWeight:400 }}>Avg: {(avgGk.total_dist||0).toFixed(0)}m</span>
                  </div>
                  {gkPlayers.map(p => {
                    const val = get(p.id).total_dist || 0;
                    if (!val) return null;
                    return <ChartBar key={p.id} val={val} max={maxGk.total_dist} label={p.nick || p.name} color="#f97316" />;
                  })}
                </div>

                {/* Explosive & Jumps */}
                <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                    EXPLOSIVE EFFORTS / JUMPS
                  </div>
                  {gkPlayers.map(p => {
                    const expl = get(p.id).explosive_effs || 0;
                    const jumps = get(p.id).gk_jumps || 0;
                    if (!expl && !jumps) return null;
                    const maxBoth = Math.max(maxGk.explosive_effs, maxGk.gk_jumps);
                    return (
                      <div key={p.id} style={{ marginBottom: 12 }}>
                        <ChartBar val={expl} max={maxBoth} label={p.nick || p.name} color="#ef4444" sideMetric="Explosive" />
                        <ChartBar val={jumps} max={maxBoth} label="" color="#fde047" labelColor="var(--fg)" sideMetric="Jumps" />
                      </div>
                    );
                  })}
                </div>

                {/* Dives */}
                <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                    TOTAL DIVE COUNT
                    <span style={{ color: 'var(--fg-dim)', fontWeight:400 }}>Avg: {(avgGk.gk_dive_total||0).toFixed(0)}</span>
                  </div>
                  {gkPlayers.map(p => {
                    const val = get(p.id).gk_dive_total || 0;
                    if (!val) return null;
                    return <ChartBar key={p.id} val={val} max={maxGk.gk_dive_total} label={p.nick || p.name} color="#ef4444" />;
                  })}
                </div>

                {/* Acceleration Load GK */}
                <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                    ACCELERATION LOAD GK
                    <span style={{ color: 'var(--fg-dim)', fontWeight:400 }}>Avg: {(avgGk.gk_accel_load||0).toFixed(1)}</span>
                  </div>
                  {gkPlayers.map(p => {
                    const val = get(p.id).gk_accel_load || 0;
                    if (!val) return null;
                    return <ChartBar key={p.id} val={val} max={maxGk.gk_accel_load} label={p.nick || p.name} color="#86efac" labelColor="var(--fg)" />;
                  })}
                </div>

                {/* Total Player Load */}
                <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 16, display:'flex', justifyContent:'space-between' }}>
                    TOTAL PLAYER LOAD
                    <span style={{ color: 'var(--fg-dim)', fontWeight:400 }}>Avg: {(avgGk.total_pl||0).toFixed(0)}</span>
                  </div>
                  {gkPlayers.map(p => {
                    const val = get(p.id).total_pl || 0;
                    if (!val) return null;
                    return <ChartBar key={p.id} val={val} max={maxGk.total_pl} label={p.nick || p.name} color="#84cc16" />;
                  })}
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}

window.GPSPerformanceTab = GPSPerformanceTab;
