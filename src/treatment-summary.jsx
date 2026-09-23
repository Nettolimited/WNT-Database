function TreatmentSummary({ camp, campPlayers }) {
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [area, setArea] = React.useState('All');
  const [openId, setOpenId] = React.useState(null);

  const AREAS = ['Knee','Back','Ankle','Foot / Heel','Thigh / Hamstring','Calf','Hip / Groin','Shoulder','Wrist / Hand','Head / Face','Neck','Other'];
  const areaFor = (r) => {
    const text = `${r.body_parts || ''} ${r.injury_note || ''} ${r.notes || ''}`.toLowerCase();
    const tests = [
      ['Knee', /knee|เข่า/], ['Back', /back|หลัง|lumbar/], ['Ankle', /ankle|ข้อเท้า/],
      ['Foot / Heel', /foot|feet|heel|เท้า|ส้น/], ['Thigh / Hamstring', /thigh|hamstring|ต้นขา/],
      ['Calf', /calf|น่อง/], ['Hip / Groin', /hip|groin|สะโพก|ขาหนีบ/],
      ['Shoulder', /shoulder|ไหล่/], ['Wrist / Hand', /wrist|hand|finger|ข้อมือ|มือ|นิ้ว/],
      ['Head / Face', /head|face|jaw|ศีรษะ|หน้า|กราม/], ['Neck', /neck|คอ/]
    ];
    const found = tests.filter(([, re]) => re.test(text)).map(([name]) => name);
    return found.length ? found : ['Other'];
  };
  const isTreatment = (r) => Boolean(
    String(r.injury_note || '').trim() || String(r.treatment_plan || '').trim() ||
    String(r.body_parts || '').trim() || ['modified','injured','sick'].includes(String(r.status || '').toLowerCase())
  );

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/camp-status?camp_id=${camp.id}&all=1`, { credentials: 'include', cache: 'no-store' })
      .then(async r => { if (!r.ok) throw new Error('Unable to load treatment data'); return r.json(); })
      .then(d => setRecords((d.statuses || []).filter(isTreatment)))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [camp.id]);

  const playersById = React.useMemo(() => new Map(campPlayers.map(p => [String(p.id), p])), [campPlayers]);
  const summary = React.useMemo(() => {
    const map = new Map();
    records.forEach(r => {
      const p = playersById.get(String(r.player_id));
      const row = map.get(String(r.player_id)) || {
        id: String(r.player_id), name: p?.name || r.player_name || 'Unknown', nick: p?.nick || r.player_nick || '',
        total: 0, areas: {}, records: [], lastDate: ''
      };
      row.total += 1;
      areaFor(r).forEach(a => { row.areas[a] = (row.areas[a] || 0) + 1; });
      row.records.push(r);
      if (!row.lastDate || r.report_date > row.lastDate) row.lastDate = r.report_date;
      map.set(row.id, row);
    });
    return [...map.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  }, [records, playersById]);

  const filtered = summary.filter(row => {
    const q = search.trim().toLowerCase();
    return (!q || `${row.name} ${row.nick}`.toLowerCase().includes(q)) && (area === 'All' || row.areas[area]);
  });
  const areaTotals = records.reduce((acc, r) => { areaFor(r).forEach(a => { acc[a] = (acc[a] || 0) + 1; }); return acc; }, {});
  const topArea = Object.entries(areaTotals).sort((a,b) => b[1]-a[1])[0];

  const excelSafe = v => {
    const s = String(v ?? '');
    return /^[=+\-@]/.test(s) ? `'${s}` : s;
  };
  const xml = v => excelSafe(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const exportExcel = () => {
    const sheet = (name, rows) => `<Worksheet ss:Name="${xml(name)}"><Table>${rows.map(row => `<Row>${row.map(c => `<Cell><Data ss:Type="String">${xml(c)}</Data></Cell>`).join('')}</Row>`).join('')}</Table></Worksheet>`;
    const symptomSummary = row => row.records
      .map(r => `${r.report_date}: ${r.injury_note || r.notes || '-'}`)
      .filter((v, i, all) => all.indexOf(v) === i).join(' | ');
    const summaryRows = [
      ['Player','Nickname','Treatment records', ...AREAS.map(a => `${a} (times)`), 'Injury symptoms by date','Last treatment'],
      ...filtered.map(r => [r.name,r.nick,r.total, ...AREAS.map(a => r.areas[a] || 0), symptomSummary(r), r.lastDate])
    ];
    const detailRows = [
      ['Date','Player','Nickname','Status','Categorized body area','Recorded body part','Injury symptom / note','Treatment plan','Can train'],
      ...filtered.flatMap(p => p.records.sort((a,b)=>a.report_date.localeCompare(b.report_date)).map(r => [r.report_date,p.name,p.nick,r.status,areaFor(r).join(', '),r.body_parts || '',r.injury_note || r.notes || '',r.treatment_plan || '',r.can_train || '']))
    ];
    const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${sheet('Summary', summaryRows)}${sheet('Treatment Details', detailRows)}</Workbook>`;
    const url = URL.createObjectURL(new Blob([workbook], {type:'application/vnd.ms-excel'}));
    const a = document.createElement('a'); a.href = url; a.download = `${camp.name.replace(/[^a-z0-9_-]+/gi,'-')}-treatment-summary.xls`; a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{padding:40,color:'var(--fg-dim)'}}>Loading treatment records…</div>;
  return <div style={{padding:24,maxWidth:1500,margin:'0 auto'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',flexWrap:'wrap',marginBottom:20}}>
      <div><h2 style={{margin:0}}>🩺 Treatment Summary</h2><div style={{color:'var(--fg-dim)',marginTop:4}}>Daily care records in {camp.name}</div></div>
      <button className="btn-primary" onClick={exportExcel}>⬇ Export Excel</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginBottom:18}}>
      {[['Players treated',summary.length],['Treatment records',records.length],['Most common area',topArea ? `${topArea[0]} · ${topArea[1]}` : '—']].map(([k,v])=><div key={k} className="card" style={{padding:18}}><div style={{color:'var(--fg-dim)',fontSize:13}}>{k}</div><div style={{fontSize:26,fontWeight:800,marginTop:6}}>{v}</div></div>)}
    </div>
    <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search player…" style={{minWidth:250,padding:'10px 12px',borderRadius:8,background:'var(--bg-2)',color:'var(--fg)',border:'1px solid var(--line-soft)'}} />
      <select value={area} onChange={e=>setArea(e.target.value)} style={{padding:'10px 12px',borderRadius:8,background:'var(--bg-2)',color:'var(--fg)',border:'1px solid var(--line-soft)'}}><option>All</option>{AREAS.map(a=><option key={a}>{a}</option>)}</select>
    </div>
    <div className="card" style={{overflow:'hidden'}}>
      {filtered.length === 0 && <div style={{padding:30,textAlign:'center',color:'var(--fg-dim)'}}>No treatment records found</div>}
      {filtered.map(row => <div key={row.id} style={{borderBottom:'1px solid var(--line-soft)'}}>
        <button onClick={()=>setOpenId(openId===row.id?null:row.id)} style={{width:'100%',display:'grid',gridTemplateColumns:'minmax(220px,2fr) 100px minmax(260px,3fr) 120px 32px',gap:12,alignItems:'center',padding:'15px 18px',background:'transparent',border:0,color:'var(--fg)',textAlign:'left',cursor:'pointer'}}>
          <span style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>{window.PlayerPhoto ? <window.PlayerPhoto playerId={row.id} name={row.name} size={46}/> : null}<span style={{minWidth:0}}><strong style={{display:'block',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{row.name}</strong><small style={{display:'block',color:'var(--fg-dim)'}}>{row.nick}</small></span></span><strong>{row.total} ครั้ง</strong><span>{Object.entries(row.areas).sort((a,b)=>b[1]-a[1]).map(([a,n])=><span key={a} style={{display:'inline-block',padding:'3px 8px',margin:'2px',borderRadius:12,background:'rgba(59,130,246,.13)',color:'#60a5fa',fontSize:12}}>{a} {n}</span>)}</span><span>{row.lastDate}</span><span>{openId===row.id?'▲':'▼'}</span>
        </button>
        {openId===row.id && <div style={{padding:'0 18px 16px 32px'}}>{row.records.sort((a,b)=>b.report_date.localeCompare(a.report_date)).map((r,i)=><div key={`${r.report_date}-${i}`} style={{display:'grid',gridTemplateColumns:'110px 150px 1fr',gap:14,padding:'11px 0',borderTop:'1px solid var(--line-soft)'}}><strong>{r.report_date}</strong><span>{areaFor(r).join(', ')}</span><span><b>{r.injury_note || r.notes || 'Treatment record'}</b>{r.treatment_plan && <small style={{display:'block',color:'var(--fg-dim)',marginTop:3}}>Treatment: {r.treatment_plan}</small>}</span></div>)}</div>}
      </div>)}
    </div>
  </div>;
}

window.TreatmentSummary = TreatmentSummary;
