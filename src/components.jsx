// Shared UI bits: chips, badges, radar, sparkline, dropzone

function PosBadge({ pos, t }) {
  const grp = posGroup(pos);
  const cls = grp === 'Goalkeeper' ? 'pb-gk' :
              grp === 'Defender'   ? 'pb-def' :
              grp === 'Midfielder' ? 'pb-mid' : 'pb-fwd';
  return <span className={`pos-badge ${cls}`}>{pos}</span>;
}

function ClubChip({ code, small }) {
  const c = clubByCode(code);
  const logoUrl = useSlotUrl(`clublogo-${code}`);
  return (
    <span className={`club-chip ${small?'small':''}`}>
      {logoUrl
        ? <img className="club-logo-sm" src={logoUrl} alt={c.name} title={c.name}/>
        : <span className="club-dot" style={{background: c.color}}></span>
      }
      <span className="club-name">{small ? code : c.name}</span>
      {!small && c.country && (
        <span className="club-country-badge">{c.country.toUpperCase()}</span>
      )}
    </span>
  );
}

// Small player photo — pixel-perfect match with the profile image-slot crop.
// Replicates image-slot's _applyView() math exactly:
//   base = max(fw/iw, fh/ih)  →  cover at s=1
//   k    = base × s           →  total scale
//   img  = absolute, iw×k px wide, left=(50+x)% × fw, top=(50+y)% × fh
//   then translate(-50%,-50%) centres the anchor
function PlayerPhoto({ playerId, name, size = 38 }) {
  const [slot, setSlot] = useState(() => window._imageSlotGet?.(`photo-${playerId}`) || null);
  const [nat,  setNat]  = useState(null); // {w, h} natural image dimensions

  useEffect(() => {
    const id = `photo-${playerId}`;
    const check = () => setSlot(window._imageSlotGet?.(id) || null);
    check();
    const unsub = window._imageSlotSubscribe?.(check);
    return () => unsub?.();
  }, [playerId]);

  const url = slot?.u && /^data:image\//i.test(slot.u) ? slot.u : null;

  // Measure natural dimensions whenever the URL changes
  useEffect(() => {
    if (!url) { setNat(null); return; }
    const img = new Image();
    img.onload = () => setNat({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
  }, [url]);

  const initials = (name || '?')
    .split(/\s+/).filter(Boolean)
    .map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (url && nat) {
    const s  = slot.s ?? 1;
    const x  = slot.x ?? 0;
    const y  = slot.y ?? 0;
    const fw = size, fh = size;
    const base = Math.max(fw / nat.w, fh / nat.h);
    const k    = base * s;
    return (
      <div style={{
        width: fw + 'px', height: fh + 'px',
        borderRadius: '7px', overflow: 'hidden',
        flexShrink: 0, position: 'relative',
      }}>
        <img src={url} alt={name} draggable="false" style={{
          position: 'absolute',
          width:  nat.w * k + 'px',
          height: nat.h * k + 'px',
          left:   (50 + x) / 100 * fw + 'px',
          top:    (50 + y) / 100 * fh + 'px',
          transform: 'translate(-50%,-50%)',
          maxWidth: 'none',
          userSelect: 'none',
        }}/>
      </div>
    );
  }

  // Fallback: cover while natural dimensions are loading, or when no photo
  if (url) {
    return (
      <div style={{
        width: size + 'px', height: size + 'px',
        borderRadius: '7px', overflow: 'hidden', flexShrink: 0,
      }}>
        <img src={url} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
      </div>
    );
  }

  return (
    <div className="player-photo-initials"
      style={{width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.34) + 'px'}}>
      {initials}
    </div>
  );
}

function FootIcon({ foot }) {
  // L / R / B
  const left = foot === 'L' || foot === 'B';
  const right = foot === 'R' || foot === 'B';
  return (
    <span className="foot-icon" title={foot}>
      <span className={`fi-dot ${left?'on':''}`}></span>
      <span className={`fi-dot ${right?'on':''}`}></span>
    </span>
  );
}

// Animated horizontal bar — 0..20 scale
function StatBar({ value, max=20, color='var(--accent-blue)', label, t }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="statbar">
      {label && <div className="statbar-lab"><span>{label}</span><span className="num">{value}</span></div>}
      <div className="statbar-track">
        <div className="statbar-fill" style={{width: pct + '%', background: color}}></div>
      </div>
    </div>
  );
}

// Hexagon radar chart for 6 attributes (FM-style)
function RadarChart({ values, size=240, t }) {
  const keys = ['pace','shooting','passing','dribbling','defending','physical'];
  const labels = keys.map(k => t(k));
  const cx = size/2, cy = size/2;
  const r = size/2 - 38;
  const angles = keys.map((_, i) => -Math.PI/2 + i * (2*Math.PI/6));

  const ringPts = (ratio) => angles.map(a => {
    const x = cx + Math.cos(a) * r * ratio;
    const y = cy + Math.sin(a) * r * ratio;
    return `${x},${y}`;
  }).join(' ');

  const dataPts = keys.map((k, i) => {
    const ratio = Math.min(1, values[k] / 20);
    const a = angles[i];
    return [cx + Math.cos(a) * r * ratio, cy + Math.sin(a) * r * ratio];
  });
  const dataStr = dataPts.map(p => p.join(',')).join(' ');

  return (
    <svg className="radar" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((r0, i) => (
        <polygon key={i} points={ringPts(r0)} className="radar-ring" />
      ))}
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a)*r} y2={cy + Math.sin(a)*r} className="radar-spoke" />
      ))}
      <polygon points={dataStr} className="radar-area">
        <animate attributeName="points" from={ringPts(0.01)} to={dataStr} dur="0.7s" fill="freeze"/>
      </polygon>
      {dataPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" className="radar-pt" />
      ))}
      {angles.map((a, i) => {
        const lx = cx + Math.cos(a) * (r + 22);
        const ly = cy + Math.sin(a) * (r + 22) + 4;
        return (
          <g key={i}>
            <text x={lx} y={ly-10} className="radar-lab" textAnchor="middle">{labels[i]}</text>
            <text x={lx} y={ly+6} className="radar-num" textAnchor="middle">{values[keys[i]]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Star rating from 0..20 attribute mean (5-star scale)
function StarRating({ value, max=20 }) {
  const v = Math.round((value / max) * 5 * 2) / 2; // half-stars
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (v >= i) stars.push('full');
    else if (v >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }
  return (
    <span className="stars">
      {stars.map((s, i) => (
        <svg key={i} viewBox="0 0 20 20" className={`star ${s}`}>
          <defs>
            <linearGradient id={`hg${i}`}>
              <stop offset="50%" stopColor="currentColor"/>
              <stop offset="50%" stopColor="transparent"/>
            </linearGradient>
          </defs>
          <polygon points="10,1 12.6,7.3 19.5,7.8 14.2,12.3 15.9,19 10,15.3 4.1,19 5.8,12.3 0.5,7.8 7.4,7.3"
            fill={s==='full'?'currentColor':s==='half'?`url(#hg${i})`:'none'} stroke="currentColor" strokeWidth="0.8"/>
        </svg>
      ))}
    </span>
  );
}

function CareerTimeline({ career, t }) {
  if (!career || !career.length) return <div className="muted">—</div>;
  const minY = Math.min(...career.map(c => c.from));
  const maxY = Math.max(...career.map(c => c.to));
  const span = Math.max(1, maxY - minY);
  return (
    <div className="career-tl">
      <div className="career-tl-track">
        {career.map((c, i) => {
          const club = clubByCode(c.club);
          const left = ((c.from - minY) / span) * 100;
          const width = ((c.to - c.from) / span) * 100;
          return (
            <div key={i} className="career-tl-bar" style={{left: left + '%', width: width + '%', background: club.color}}>
              <span className="career-tl-lab">{c.club}</span>
            </div>
          );
        })}
      </div>
      <div className="career-tl-axis">
        <span>{minY}</span>
        <span>{Math.round((minY+maxY)/2)}</span>
        <span>{maxY}</span>
      </div>
    </div>
  );
}

function CareerTable({ career, t }) {
  if (!career || !career.length) return null;
  return (
    <table className="career-tab">
      <thead>
        <tr>
          <th>{t('period')}</th>
          <th>{t('club')}</th>
          <th className="num">{t('apps')}</th>
          <th className="num">{t('goals')}</th>
        </tr>
      </thead>
      <tbody>
        {career.map((c, i) => {
          const club = clubByCode(c.club);
          return (
            <tr key={i}>
              <td className="mono">{c.from}–{c.to}</td>
              <td>
                <span className="club-chip">
                  <span className="club-dot" style={{background: club.color}}></span>
                  <span className="club-name">{club.name}</span>
                </span>
              </td>
              <td className="num mono">{c.apps}</td>
              <td className="num mono">{c.goals}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ImportDialog({ onClose, onImport, t }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      try {
        const isXml = file.name.toLowerCase().endsWith('.xml') || text.trim().startsWith('<');
        const players = isXml ? parseXml(text) : parseCsv(text);
        setPreview(players); setError(null);
      } catch (err) {
        setError('ไม่สามารถอ่านไฟล์: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <h3>{t('import')} — CSV / XML</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div
          className={`dropzone ${drag?'drag':''}`}
          onDragEnter={e => { e.preventDefault(); setDrag(true); }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current.click()}
        >
          <div className="dz-icon">⬇</div>
          <div className="dz-title">{t('drop_csv')}</div>
          <div className="dz-sub">{t('or_click')}</div>
          <input type="file" ref={inputRef} accept=".csv,.xml" style={{display:'none'}}
            onChange={e => e.target.files[0] && handleFile(e.target.files[0])}/>
        </div>
        {error && <div className="err">{error}</div>}
        {preview && (
          <div className="preview">
            <div className="preview-h">Preview — {preview.length} players</div>
            <div className="preview-list">
              {preview.slice(0, 8).map((p, i) => (
                <div key={i} className="preview-row">
                  <PosBadge pos={p.pos}/> <span className="prev-nm">{p.name}</span>
                  <span className="muted">{p.team} · {clubByCode(p.club).name}</span>
                </div>
              ))}
              {preview.length > 8 && <div className="muted">+{preview.length-8} more</div>}
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={onClose}>{t('cancel')}</button>
              <button className="btn-primary" onClick={() => { onImport(preview); onClose(); }}>
                Import {preview.length} players
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Fetch a logo URL via the CORS proxy, resize to 300px on canvas, push into an image-slot
async function applyLogoFromUrl(logoUrl, slotId) {
  if (!logoUrl || !slotId) return;
  try {
    const proxyUrl = `/api/club-logo?url=${encodeURIComponent(logoUrl)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return;
    const blob = await res.blob();
    const bmp  = await createImageBitmap(blob);
    const SIZE  = 300;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    const scale = Math.min(SIZE / bmp.width, SIZE / bmp.height);
    const w = bmp.width * scale, h = bmp.height * scale;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(bmp, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
    // prefer webp, fall back to png
    let dataUrl = canvas.toDataURL('image/webp', 0.92);
    if (!dataUrl.startsWith('data:image/webp')) dataUrl = canvas.toDataURL('image/png');
    window._imageSlotSet?.(slotId, { u: dataUrl, s: 1, x: 0, y: 0 });
  } catch (e) {
    console.warn('applyLogoFromUrl:', e);
  }
}

// Debounced club-name search input with suggestion dropdown (TheSportsDB)
function ClubSearchInput({ slotId, onSelect, initialName = '' }) {
  const [query,       setQuery]       = useState(initialName);
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [open,        setOpen]        = useState(false);
  const timerRef = useRef(null);

  const doSearch = (q) => {
    clearTimeout(timerRef.current);
    if (!q || q.length < 2) { setSuggestions([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/club-search?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        setSuggestions(d.teams || []);
        setOpen(true);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 380);
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    doSearch(v);
    // Notify parent of typed text immediately (no country / logo yet)
    onSelect({ name: v, country: '', league: '', logoUrl: '' });
  };

  const pick = async (team) => {
    setQuery(team.name);
    setOpen(false);
    setSuggestions([]);
    onSelect(team);
    if (team.logoUrl && slotId) applyLogoFromUrl(team.logoUrl, slotId);
  };

  return (
    <div className="club-search-wrap">
      <input
        className="pef-input club-search-input"
        placeholder="ชื่อสโมสร…"
        value={query}
        autoFocus
        autoComplete="off"
        onChange={handleChange}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
      />
      {loading && <span className="club-search-spin">↻</span>}
      {open && suggestions.length > 0 && (
        <div className="club-search-dropdown">
          {suggestions.map((team, i) => (
            <div key={i} className="club-search-item" onMouseDown={() => pick(team)}>
              {team.logoUrl
                ? <img className="club-search-logo"
                    src={`/api/club-logo?url=${encodeURIComponent(team.logoUrl)}`} alt=""/>
                : <span className="club-search-logo-ph"></span>
              }
              <div className="club-search-text">
                <div className="club-search-name">{team.name}</div>
                <div className="club-search-sub">
                  {team.country && <span className="club-country-badge">{team.country}</span>}
                  {team.league  && <span className="dim">{team.league}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  PosBadge, ClubChip, PlayerPhoto, FootIcon, StatBar, RadarChart, StarRating,
  CareerTimeline, CareerTable, ImportDialog,
  applyLogoFromUrl, ClubSearchInput,
});
