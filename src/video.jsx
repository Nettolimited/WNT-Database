// Video Analysis Platform — match film, scouting, player highlights

function VideoCountrySearch({ value, onChange, placeholder }) {
  const [q, setQ] = useState(value || '');
  const [open, setOpen] = useState(false);
  const nations = typeof FOOTBALL_NATIONS !== 'undefined' ? FOOTBALL_NATIONS : [];
  const filtered = q.length > 0
    ? nations.filter(n => n.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : [];
  const select = (name) => { setQ(name); onChange(name); setOpen(false); };
  return (
    <div style={{position:'relative'}}>
      <input className="camp-input" placeholder={placeholder || 'พิมพ์ชื่อประเทศ…'}
        value={q} autoFocus
        onChange={e => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"/>
      {open && filtered.length > 0 && (
        <div style={{position:'absolute',top:'100%',left:0,right:0,zIndex:300,
          background:'var(--bg-2)',border:'1px solid var(--line-soft)',borderRadius:8,
          marginTop:4,overflow:'hidden',boxShadow:'0 8px 24px rgba(0,0,0,.4)'}}>
          {filtered.map(name => (
            <div key={name} onMouseDown={() => select(name)}
              style={{padding:'8px 14px',cursor:'pointer',fontSize:14,borderBottom:'1px solid var(--line)'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg-3)'}
              onMouseLeave={e=>e.currentTarget.style.background=''}>{name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────
function ytId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
function vimeoId(url) {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}
function thumbFromUrl(url) {
  const yt = ytId(url);
  if (yt) return `https://img.youtube.com/vi/${yt}/mqdefault.jpg`;
  const vi = vimeoId(url);
  if (vi) return `https://vumbnail.com/${vi}.jpg`;
  return null;
}
function embedUrl(url) {
  const yt = ytId(url);
  if (yt) return `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0`;
  const vi = vimeoId(url);
  if (vi) return `https://player.vimeo.com/video/${vi}?autoplay=1`;
  return url;
}
function isEmbeddable(url) {
  return !!(ytId(url) || vimeoId(url));
}

const TYPE_META = {
  match:     { label: 'Match Film',   icon: '🎬', color: '#2444a1' },
  scouting:  { label: 'Scouting',     icon: '🔭', color: '#8a4fd8' },
  highlight: { label: 'Highlight',    icon: '⭐', color: '#c07a18' },
};

// ── VideoPlayer modal ─────────────────────────────────────────────────────────
function VideoPlayer({ video, onClose }) {
  useEffect(() => {
    const k = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const embed = embedUrl(video.url);
  const canEmbed = isEmbeddable(video.url);
  const meta = TYPE_META[video.type] || TYPE_META.match;

  return (
    <div className="vp-backdrop" onClick={onClose}>
      <div className="vp-modal" onClick={e => e.stopPropagation()}>
        <div className="vp-modal-hd">
          <span className="vp-type-pill" style={{background: meta.color + '33', color: meta.color, border: `1px solid ${meta.color}55`}}>
            {meta.icon} {meta.label}
          </span>
          <h2 className="vp-modal-title">{video.title}</h2>
          {video.opponent && <div className="vp-modal-sub">vs {video.opponent}</div>}
          <button className="icon-btn close-x" onClick={onClose} style={{marginLeft:'auto'}}>✕</button>
        </div>
        <div className="vp-player-wrap">
          {canEmbed ? (
            <iframe
              src={embed}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="vp-iframe"
            />
          ) : (
            <div className="vp-no-embed">
              <div style={{fontSize:48, marginBottom:16}}>🎬</div>
              <div style={{marginBottom:16, color:'var(--fg-mute)'}}>ไม่รองรับ embed โดยตรง</div>
              <a href={video.url} target="_blank" rel="noopener" className="btn-primary sm">เปิดลิงก์ภายนอก ↗</a>
            </div>
          )}
        </div>
        {video.notes && (
          <div className="vp-notes">{video.notes}</div>
        )}
        {video.tags?.length > 0 && (
          <div className="vp-tag-row">
            {video.tags.map(t => <span key={t} className="vp-tag">{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AddVideoForm ──────────────────────────────────────────────────────────────
function AddVideoForm({ matches, players, onSave, onCancel }) {
  const [title,    setTitle]    = useState('');
  const [url,      setUrl]      = useState('');
  const [type,     setType]     = useState('match');
  const [matchId,  setMatchId]  = useState('');
  const [playerId, setPlayerId] = useState('');
  const [opponent, setOpponent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags,     setTags]     = useState([]);
  const [notes,    setNotes]    = useState('');

  const thumb = thumbFromUrl(url);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(ts => [...ts, t]);
    setTagInput('');
  };

  const submit = () => {
    if (!title.trim() || !url.trim()) return;
    onSave({ title, url, type, matchId: matchId || null, playerId: playerId || null, opponent, tags, notes });
  };

  return (
    <div className="vf-form">
      <div className="vf-form-hd">
        <div className="vf-type-tabs">
          {Object.entries(TYPE_META).map(([k, m]) => (
            <button key={k} className={`vf-type-tab ${type===k?'on':''}`} onClick={() => setType(k)}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Match Film: pick match first → auto-fills title */}
      {type === 'match' && matches.length > 0 && (
        <select className="camp-input" value={matchId} autoFocus onChange={e => {
          const id = e.target.value;
          setMatchId(id);
          if (id) {
            const m = matches.find(x => x.id === id);
            if (m) setTitle(m.opponent);
          }
        }}>
          <option value="">— เลือกแมตท์ —</option>
          {[...matches].sort((a,b) => (b.match_date||'').localeCompare(a.match_date||'')).map(m => (
            <option key={m.id} value={m.id}>
              {m.match_date ? m.match_date + ' · ' : ''}{m.competition ? m.competition + ' · ' : ''}vs {m.opponent} {m.home_score}–{m.away_score}
            </option>
          ))}
        </select>
      )}

      {/* Title: auto-filled for match, country search for scouting, free text for highlight */}
      {type === 'highlight' ? (
        <input className="camp-input" placeholder="ชื่อวิดีโอ…" value={title}
          onChange={e => setTitle(e.target.value)}/>
      ) : type === 'scouting' ? (
        <VideoCountrySearch value={title}
          onChange={v => { setTitle(v); setOpponent(v); }}
          placeholder="ทีมที่สอดส่อง (เช่น Japan)…"/>
      ) : (
        <input className="camp-input" placeholder="ชื่อ (auto-fill จากแมตท์ หรือพิมพ์เอง)…"
          value={title} onChange={e => setTitle(e.target.value)}/>
      )}

      <div className="vf-url-row">
        <input className="camp-input" placeholder="YouTube / Vimeo URL…" value={url}
          onChange={e => setUrl(e.target.value)}/>
        {thumb && <img src={thumb} className="vf-thumb-preview" alt="thumbnail"/>}
      </div>

      {type === 'highlight' && players.length > 0 && (
        <select className="camp-input" value={playerId} onChange={e => setPlayerId(e.target.value)}>
          <option value="">— เลือกผู้เล่น (ไม่บังคับ) —</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>{p.name}{p.nick ? ` (${p.nick})` : ''}</option>
          ))}
        </select>
      )}

      <div className="vf-tag-row">
        <input className="camp-input" placeholder="เพิ่ม tag… (กด Enter)"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTag()}
          style={{flex:1}}/>
        <button className="btn-ghost sm" onClick={addTag}>+ Tag</button>
      </div>
      {tags.length > 0 && (
        <div className="vf-tags-preview">
          {tags.map(t => (
            <span key={t} className="vp-tag" style={{cursor:'pointer'}} onClick={() => setTags(ts => ts.filter(x=>x!==t))}>
              {t} ✕
            </span>
          ))}
        </div>
      )}

      <textarea className="camp-input" placeholder="โน้ต / รายละเอียด…" rows={3}
        value={notes} onChange={e => setNotes(e.target.value)}
        style={{resize:'vertical', fontFamily:'inherit'}}/>

      <div style={{display:'flex', gap:8}}>
        <button className="btn-primary sm" style={{flex:1}} onClick={submit} disabled={!title.trim()||!url.trim()}>
          💾 บันทึกวิดีโอ
        </button>
        <button className="btn-ghost sm" onClick={onCancel}>ยกเลิก</button>
      </div>
    </div>
  );
}

// ── VideoCard ─────────────────────────────────────────────────────────────────
function VideoCard({ video, matchMap, playerMap, onPlay, onDelete }) {
  const thumb = thumbFromUrl(video.url);
  const meta  = TYPE_META[video.type] || TYPE_META.match;
  const match  = video.match_id  ? matchMap.get(video.match_id)  : null;
  const player = video.player_id ? playerMap.get(video.player_id) : null;

  return (
    <div className="vc-card" onClick={() => onPlay(video)}>
      <div className="vc-thumb">
        {thumb
          ? <img src={thumb} alt={video.title} className="vc-thumb-img"/>
          : <div className="vc-thumb-placeholder">{meta.icon}</div>
        }
        <div className="vc-play-btn">▶</div>
        <span className="vc-type-badge" style={{background: meta.color}}>
          {meta.icon} {meta.label}
        </span>
      </div>
      <div className="vc-body">
        <div className="vc-title">{video.title}</div>
        {match && (
          <div className="vc-meta">🏟 vs {match.opponent} · {match.home_score}–{match.away_score}</div>
        )}
        {video.opponent && !match && (
          <div className="vc-meta">🔭 {video.opponent}</div>
        )}
        {player && (
          <div className="vc-meta">👤 {player.nick || player.name}</div>
        )}
        {video.tags?.length > 0 && (
          <div className="vc-tags">
            {video.tags.slice(0,3).map(t => <span key={t} className="vp-tag">{t}</span>)}
          </div>
        )}
      </div>
      <button className="vc-del" onClick={e => { e.stopPropagation(); onDelete(video.id); }} title="ลบ">✕</button>
    </div>
  );
}

// ── VideoPanel ────────────────────────────────────────────────────────────────
function VideoPanel({ players, onClose }) {
  const [videos,    setVideos]    = useState([]);
  const [matches,   setMatches]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [adding,    setAdding]    = useState(false);
  const [playing,   setPlaying]   = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    const k = e => { if (e.key === 'Escape' && !playing) onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose, playing]);

  useEffect(() => {
    Promise.all([
      fetch('/api/videos').then(r => r.ok ? r.json() : { videos: [] }),
      fetch('/api/matches').then(r => r.ok ? r.json() : { matches: [] }),
    ]).then(([vd, md]) => {
      setVideos(vd.videos || []);
      setMatches(md.matches || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const matchMap  = useMemo(() => new Map(matches.map(m => [m.id, m])),  [matches]);
  const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])),  [players]);

  const filtered = useMemo(() => {
    let list = videos;
    if (typeFilter !== 'All') list = list.filter(v => v.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.title.toLowerCase().includes(q) ||
        (v.opponent||'').toLowerCase().includes(q) ||
        (v.tags||[]).some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [videos, typeFilter, search]);

  const handleSave = async (data) => {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()).catch(() => null);
    if (res?.id) {
      const newVid = { ...data, id: res.id, tags: data.tags || [], created_at: new Date().toISOString() };
      setVideos(vs => [newVid, ...vs]);
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('ลบวิดีโอนี้?')) return;
    await fetch(`/api/videos/${id}`, { method: 'DELETE' }).catch(() => {});
    setVideos(vs => vs.filter(v => v.id !== id));
  };

  // counts
  const counts = { All: videos.length };
  Object.keys(TYPE_META).forEach(k => { counts[k] = videos.filter(v => v.type === k).length; });

  return (
    <>
      <div className="profile-backdrop in" onClick={onClose}></div>
      <aside className="profile-panel in" style={{width:'min(900px,96vw)', maxWidth:'900px'}}>

        {/* Header */}
        <div className="profile-head" style={{'--club-color': '#2444a1'}}>
          <div className="profile-head-bg"></div>
          <button className="icon-btn close-x" onClick={onClose}>✕</button>
          <div className="profile-id" style={{padding:'28px 28px 20px'}}>
            <div style={{fontSize:36}}>🎬</div>
            <div>
              <h2 style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, letterSpacing:'.03em'}}>
                Video Analysis
              </h2>
              <div style={{color:'var(--fg-mute)', fontSize:13}}>Match film · Scouting · Highlights</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'14px 20px', borderBottom:'1px solid var(--line)', flexWrap:'wrap'}}>
          {/* Type filter */}
          <div className="chips sm">
            {['All', ...Object.keys(TYPE_META)].map(k => (
              <button key={k} className={`chip ${typeFilter===k?'on':''}`} onClick={() => setTypeFilter(k)}>
                {k === 'All' ? 'All' : TYPE_META[k].icon + ' ' + TYPE_META[k].label}
                <span className="mono" style={{marginLeft:4, opacity:.6}}>{counts[k]||0}</span>
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="search-wrap" style={{flex:1, minWidth:160}}>
            <span className="search-ico">⌕</span>
            <input className="search-input" placeholder="ค้นหาวิดีโอ…" value={search}
              onChange={e => setSearch(e.target.value)}/>
            {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>
          <button className="btn-primary sm" onClick={() => setAdding(a => !a)}>
            {adding ? '✕ ยกเลิก' : '+ เพิ่มวิดีโอ'}
          </button>
        </div>

        {/* Add form */}
        {adding && (
          <div style={{padding:'16px 20px', borderBottom:'1px solid var(--line)', background:'var(--bg-2)'}}>
            <AddVideoForm
              matches={matches}
              players={players}
              onSave={handleSave}
              onCancel={() => setAdding(false)}/>
          </div>
        )}

        {/* Video grid */}
        <div style={{flex:1, overflowY:'auto', padding:20}}>
          {loading && <div className="callup-msg">กำลังโหลด…</div>}
          {!loading && filtered.length === 0 && (
            <div className="callup-msg" style={{flexDirection:'column', gap:12}}>
              <div style={{fontSize:48}}>🎬</div>
              <div>{search || typeFilter !== 'All' ? 'ไม่พบวิดีโอ' : 'ยังไม่มีวิดีโอ — กด + เพิ่มวิดีโอ เพื่อเริ่ม'}</div>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="vc-grid">
              {filtered.map(v => (
                <VideoCard
                  key={v.id}
                  video={v}
                  matchMap={matchMap}
                  playerMap={playerMap}
                  onPlay={setPlaying}
                  onDelete={handleDelete}/>
              ))}
            </div>
          )}
        </div>
      </aside>

      {playing && <VideoPlayer video={playing} onClose={() => setPlaying(null)}/>}
    </>
  );
}

window.VideoPanel = VideoPanel;
