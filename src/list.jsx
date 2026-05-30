// Player list view with filters, sort, search, keyboard nav

const CHANGELOG = [
  {
    version: '1.7', date: '2026-05-23',
    items: [
      '📊 Dashboard — หน้าหลักใหม่แบบ Overview แสดง KPI / ผลแมตท์ / Top Performers',
      '🏟 Club Logo URL — วาง URL โลโก้สโมสรได้โดยตรง',
      '📸 Player Photo URL — วาง URL รูปผู้เล่นได้โดยตรง',
      '🏕 Camp Detail — Wellness รายวัน AM/PM + Export/Import CSV',
      '🧠 Wellness Form — สเกล 1-10 ครบ: Sleep / Stress / Appetite / Mood / Soreness / Desire',
    ],
  },
  {
    version: '1.6', date: '2025-05-18',
    items: [
      '🎬 Video Analysis — บันทึก Match Film / Scouting / Highlight ลิงก์ YouTube/Vimeo',
      '🔗 Video เชื่อมกับ Match Log — ดูวิดีโอของแต่ละแมตท์ได้',
      '🔒 Private Match — แมตท์อุ่นเครื่องปิด ไม่นับสถิติทางการ',
      '🌍 Country Search — เลือกประเทศคู่แข่งจาก 200+ ชาติ FIFA',
      '⚡ Auto-fill — เลือกแมตท์ใน Video form แล้วชื่อขึ้นให้อัตโนมัติ',
    ],
  },
  {
    version: '1.5', date: '2025-05-17',
    items: [
      '📅 Match Log — บันทึกผลแมตท์ + Starting XI + สถิติผู้เล่น',
      '📊 Auto Stats — CAPS / GOALS / ASSISTS / MINS คำนวณจาก Match Log',
      '🏟 Clubs Manager — เพิ่ม/แก้ไขสโมสรได้',
      '📋 Call-up Panel — สร้างรายชื่อเรียกติดทีม',
    ],
  },
  {
    version: '1.4', date: '2025-05-15',
    items: [
      '☁️ Cloudflare D1 — ข้อมูลผู้เล่นเก็บบน cloud database',
      '📸 Player Photos — อัปโหลดรูปผู้เล่นได้',
      '🎨 Theme Tweaks — เปลี่ยนสี Palette / Font scale / Density',
    ],
  },
  {
    version: '1.0', date: '2025-05-10',
    items: [
      '👤 Player Database — เพิ่ม/แก้ไข/ลบผู้เล่น',
      '📋 Profile Panel — ข้อมูลละเอียด + Radar chart',
      '🔍 Filter & Sort — กรองตาม Position / Age / Foot',
    ],
  },
];

function InfoModal({ onClose }) {
  return (
    <div className="info-backdrop" onClick={onClose}>
      <div className="info-modal" onClick={e => e.stopPropagation()}>
        <div className="info-hd">
          <span className="info-title">Thailand WNT Database</span>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="info-body">
          {CHANGELOG.map(cl => (
            <div key={cl.version} className="info-block">
              <div className="info-ver-row">
                <span className="info-ver">v{cl.version}</span>
                <span className="info-date">{cl.date}</span>
              </div>
              <ul className="info-list">
                {cl.items.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="info-foot">Thailand Women's National Team · Internal Tool</div>
      </div>
    </div>
  );
}

const SORT_KEYS = [
  { k: 'name', lab: 'name', num: false },
  { k: 'age', lab: 'age', num: true },
  { k: 'pos', lab: 'pos', num: false },
  { k: 'club', lab: 'club', num: false },
  { k: 'caps', lab: 'caps', num: true },
  { k: 'intGoals', lab: 'intGoals', num: true },
  { k: 'minutes', lab: 'minutes', num: true },
];

function valueFor(p, k, ms) {
  if (k === 'age') return ageFromDob(p.dob);
  const s = ms?.get(p.id);
  // All columns use NT data — match log first, then manual NT fields as fallback
  if (k === 'caps')     return s?.apps    ?? p.caps     ?? 0;
  if (k === 'intGoals') return s?.goals   ?? p.intGoals ?? 0;
  if (k === 'apps')     return s?.apps    ?? p.caps     ?? p.intStats?.apps    ?? 0;
  if (k === 'goals')    return s?.goals   ?? p.intGoals ?? p.intStats?.goals   ?? 0;
  if (k === 'assists')  return s?.assists ?? p.intStats?.assists ?? 0;
  if (k === 'minutes')  return s?.minutes ?? p.intStats?.minutes ?? 0;
  if (k === 'yellows')  return s?.yellows ?? p.intStats?.yellows ?? 0;
  if (k === 'reds')     return s?.reds    ?? p.intStats?.reds    ?? 0;
  return p[k];
}

function EditableSubtitle({ defaultText }) {
  const KEY = 'twnt.subtitle';
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(() => {
    try { return localStorage.getItem(KEY) || defaultText; } catch { return defaultText; }
  });
  const save = (v) => {
    try { localStorage.setItem(KEY, v); } catch {}
    setEditing(false);
  };
  if (editing) return (
    <input className="brand-sub-input"
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={() => save(value)}
      onKeyDown={e => { if (e.key === 'Enter') save(value); if (e.key === 'Escape') setEditing(false); }}
      autoFocus/>
  );
  return (
    <div className="brand-sub editable-sub" onClick={() => setEditing(true)} title="Click to edit">
      {value}<span className="sub-edit-ico">✎</span>
    </div>
  );
}

function PlayerList({ players, matchStats = new Map(), onSelect, onImport, onExportCsv, onExportXml, onAddPlayer, onCallup, onMatchday, onClubs, onVideo, onDashboard, t, lang, density, apiReady }) {
  const [filterTeam, setFilterTeam] = useState('All');
  const [filterPosGroup, setFilterPosGroup] = useState('All');
  const [filterFoot, setFilterFoot] = useState('Any');
  const [filterAge, setFilterAge] = useState('Any');
  const [search, setSearch] = useState('');
  const [sortK, setSortK] = useState('caps');
  const [sortDir, setSortDir] = useState(-1);
  const [focusIdx, setFocusIdx] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const listRef = useRef();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return players.filter(p => {
      if (filterTeam !== 'All' && p.team !== filterTeam) return false;
      if (filterPosGroup !== 'All' && posGroup(p.pos) !== filterPosGroup) return false;
      if (filterFoot !== 'Any' && p.foot !== filterFoot) return false;
      if (filterAge !== 'Any') {
        const a = ageFromDob(p.dob);
        if (filterAge === 'U18' && a >= 18) return false;
        if (filterAge === '18-23' && (a < 18 || a > 23)) return false;
        if (filterAge === '24-29' && (a < 24 || a > 29)) return false;
        if (filterAge === '30+' && a < 30) return false;
      }
      if (q) {
        const hay = [p.name, p.thaiName||'', p.nick||'', p.pos, p.club, clubByCode(p.club).name, p.team]
          .join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [players, filterTeam, filterPosGroup, filterFoot, filterAge, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = valueFor(a, sortK, matchStats), vb = valueFor(b, sortK, matchStats);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * sortDir;
      return String(va).localeCompare(String(vb)) * sortDir;
    });
    return arr;
  }, [filtered, sortK, sortDir]);

  useEffect(() => { setFocusIdx(0); }, [filterTeam, filterPosGroup, filterFoot, filterAge, search, sortK, sortDir]);

  useEffect(() => {
    const k = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(sorted.length-1, i+1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx(i => Math.max(0, i-1)); }
      else if (e.key === 'Enter' && sorted[focusIdx]) { e.preventDefault(); onSelect(sorted[focusIdx]); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [sorted, focusIdx, onSelect]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-row-idx="${focusIdx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [focusIdx]);

  const toggleSort = (k) => {
    if (sortK === k) setSortDir(d => -d);
    else { setSortK(k); setSortDir(1); }
  };

  const teams = ['All', ...window.TWNT_DATA.TEAMS];
  const posGroups = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  const ageBuckets = ['Any', 'U18', '18-23', '24-29', '30+'];
  const feet = ['Any', 'L', 'R', 'B'];

  return (
    <div className="list-view">
      {/* Header */}
      <header className="topbar">
        <div className="topbar-actions">
          <button className="btn-ghost" onClick={onAddPlayer}>+ {t('addPlayer')}</button>
          <button className="btn-ghost" onClick={() => setImportOpen(true)}>⬇ {t('import')}</button>
          <button className="btn-ghost" onClick={onExportCsv}>⬆ CSV</button>
          <button className="btn-ghost" onClick={onExportXml}>⬆ XML</button>
          <button className="btn-ghost btn-info" onClick={() => setInfoOpen(true)} title="Version info">ℹ</button>
        </div>
      </header>

      {infoOpen && <InfoModal onClose={() => setInfoOpen(false)}/>}

      {/* Team selector — large segmented control */}
      <div className="team-tabs">
        {teams.map(tm => (
          <button key={tm} className={`team-tab ${filterTeam===tm?'on':''}`} onClick={() => setFilterTeam(tm)}>
            <span className="tt-name">{tm === 'All' ? t('all') : tm === 'Senior' ? t('senior') : tm}</span>
            <span className="tt-count mono">{players.filter(p => tm === 'All' || p.team === tm).length}</span>
          </button>
        ))}
      </div>

      {/* Quick filter row */}
      <div className="filter-row">
        <div className="search-wrap">
          <span className="search-ico">⌕</span>
          <input className="search-input" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="chips">
          <ChipGroup label={t('pos')} options={posGroups} value={filterPosGroup} onChange={setFilterPosGroup}/>
          <ChipGroup label={t('foot')} options={feet} value={filterFoot} onChange={setFilterFoot}/>
          <ChipGroup label={t('age')} options={ageBuckets} value={filterAge} onChange={setFilterAge}/>
        </div>
        <div className="results-count">
          <span className="mono num lg">{sorted.length}</span>
          <span className="dim sm"> {t('players_found')}</span>
        </div>
      </div>

      {/* Table */}
      <div className={`table-wrap ${density==='compact'?'dense':''}`} ref={listRef}>
        <table className="player-table">
          <thead>
            <tr>
              <th className="col-photo"></th>
              <Th k="name" sortK={sortK} sortDir={sortDir} onClick={toggleSort}>{t('name')}</Th>
              <Th k="pos" sortK={sortK} sortDir={sortDir} onClick={toggleSort}>{t('pos')}</Th>
              <Th k="age" sortK={sortK} sortDir={sortDir} onClick={toggleSort} num>{t('age')}</Th>
              <th className="num">{t('dob')}</th>
              <th>{t('foot')}</th>
              <Th k="club" sortK={sortK} sortDir={sortDir} onClick={toggleSort}>{t('club')}</Th>
              <Th k="caps" sortK={sortK} sortDir={sortDir} onClick={toggleSort} num>{t('caps')}</Th>
              <Th k="intGoals" sortK={sortK} sortDir={sortDir} onClick={toggleSort} num>{t('intGoals')}</Th>
              <Th k="minutes" sortK={sortK} sortDir={sortDir} onClick={toggleSort} num>{t('minutes')}</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan="10" className="empty">{t('no_players')}</td></tr>
            )}
            {sorted.map((p, i) => (
              <tr key={p.id} data-row-idx={i}
                  className={`row ${i===focusIdx?'focused':''}`}
                  onClick={() => { setFocusIdx(i); onSelect(p); }}
                  onMouseEnter={() => setFocusIdx(i)}>
                <td className="col-photo">
                  <PlayerPhoto playerId={p.id} name={p.name} size={38}/>
                </td>
                <td className="nm">
                  <div className="nm-line">
                    {p.name}
                    {p.nick && <span className="nm-nick">({p.nick})</span>}
                    {p.active === false && <span className="nm-retired-tag">เลิกเล่น</span>}
                  </div>
                  <div className="nm-th">{p.thaiName}</div>
                </td>
                <td><PosBadge pos={p.pos} t={t}/></td>
                <td className="num mono">{ageFromDob(p.dob)}</td>
                <td className="num mono dim">{p.dob}</td>
                <td><FootIcon foot={p.foot}/></td>
                <td><ClubChip code={p.club}/></td>
                <td className="num mono">{valueFor(p,'caps',matchStats)}</td>
                <td className="num mono hl">{valueFor(p,'intGoals',matchStats)}</td>
                <td className="num mono dim">{valueFor(p,'minutes',matchStats)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {importOpen && <ImportDialog onClose={() => setImportOpen(false)} onImport={onImport} t={t}/>}
    </div>
  );
}

function Th({ k, sortK, sortDir, onClick, num, children }) {
  const on = sortK === k;
  return (
    <th onClick={() => onClick(k)} className={`sortable ${num?'num':''} ${on?'on':''}`}>
      <span className="th-lab">{children}</span>
      <span className={`sort-arrow ${on?(sortDir>0?'up':'down'):''}`}>{on ? (sortDir > 0 ? '▲' : '▼') : '◇'}</span>
    </th>
  );
}

function ChipGroup({ label, options, value, onChange }) {
  return (
    <div className="chip-group">
      <span className="chip-lab">{label}</span>
      {options.map(o => (
        <button key={o} className={`chip ${value===o?'on':''}`} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

window.PlayerList = PlayerList;
