// Camp Players Tab - Squad Selection and Shirt Numbers
function CampPlayersTab({ camp, players, persistCamp, setCamps, onSelectPlayer, t }) {
  const [isEditingSquad, setIsEditingSquad] = useState(false);
  const [filterPos, setFilterPos] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('pos');
  const [selectionFilter, setSelectionFilter] = useState('active');
  const [decisionPlayer, setDecisionPlayer] = useState(null);
  const [batchMode, setBatchMode] = useState(false);
  const [batchSelected, setBatchSelected] = useState([]);
  const [decision, setDecision] = useState({status:'in_camp', date:'', reason:'', notes:''});

  const calledIds = new Set(camp.playerIds || []);
  const campShirts = camp.playerShirts || {};
  const playerSelections = camp.playerSelections || {};
  const config = playerSelections._config || {quotas:{TOTAL:23,GK:3,DEF:8,MID:7,FWD:5}};
  const STATUS_META = {
    called:{label:'เรียกตัว',color:'#60a5fa'}, in_camp:{label:'เข้าแคมป์',color:'#22c55e'},
    final:{label:'Final Squad',color:'#a78bfa'}, cut:{label:'ตัดตัว',color:'#f59e0b'},
    withdrawn:{label:'ถอนตัว',color:'#ef4444'}, injured:{label:'บาดเจ็บ',color:'#fb7185'},
  };
  const getSelection = id => playerSelections[id] || {status:'called',history:[]};
  const isCurrent = id => !['cut','withdrawn'].includes(getSelection(id).status);

  const POS_FILTERS = ['All', 'GK', 'DEF', 'MID', 'FWD'];
  const posGroup = (pos) => {
    if (['GK'].includes(pos)) return 'Goalkeeper';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'Defender';
    if (['CDM', 'CM', 'CAM', 'RM', 'LM'].includes(pos)) return 'Midfielder';
    if (['RW', 'LW', 'ST', 'CF'].includes(pos)) return 'Forward';
    return 'Unknown';
  };

  const visiblePlayers = window.sortPlayersList(players.filter(p => {
    if (p.active === false) return false;
    if (filterPos === 'GK' && p.pos !== 'GK') return false;
    if (filterPos === 'DEF' && posGroup(p.pos) !== 'Defender') return false;
    if (filterPos === 'MID' && posGroup(p.pos) !== 'Midfielder') return false;
    if (filterPos === 'FWD' && posGroup(p.pos) !== 'Forward') return false;
    if (search) {
      const q = search.toLowerCase();
      if (![p.name, p.thaiName||'', p.nick||'', p.club].join(' ').toLowerCase().includes(q)) return false;
    }
    // If not editing, only show called players
    if (!isEditingSquad && !calledIds.has(p.id)) return false;
    if (!isEditingSquad && selectionFilter === 'active' && !isCurrent(p.id)) return false;
    if (!isEditingSquad && !['active','all'].includes(selectionFilter) && getSelection(p.id).status !== selectionFilter) return false;
    return true;
  }), sortBy, campShirts);

  const togglePlayer = (playerId) => {
    const currentIds = camp.playerIds || [];
    const newIds = calledIds.has(playerId)
      ? currentIds.filter(id => id !== playerId)
      : [...currentIds, playerId];
    const selections = {...playerSelections};
    if (!calledIds.has(playerId)) selections[playerId] = {status:'called',date:new Date().toISOString().slice(0,10),reason:'',notes:'',history:[]};
    const updated = { ...camp, playerIds: newIds, playerSelections: selections };
    setCamps(curr => curr.map(c => c.id === camp.id ? updated : c));
    persistCamp(updated);
  };

  const calledPlayers = players.filter(p => calledIds.has(p.id) && p.active !== false);
  const counts = calledPlayers.reduce((all,p) => { const status=getSelection(p.id).status; all[status]=(all[status]||0)+1; return all; },{});
  const groupKey = pos => pos==='GK'?'GK':(['CB','LB','RB','LWB','RWB'].includes(pos)?'DEF':(['CDM','DM','CM','CAM','AM','RM','LM'].includes(pos)?'MID':'FWD'));
  const finalCounts = calledPlayers.filter(p=>getSelection(p.id).status==='final').reduce((all,p)=>{const key=groupKey(p.pos);all[key]=(all[key]||0)+1;all.TOTAL=(all.TOTAL||0)+1;return all;},{TOTAL:0});
  const openDecision = player => { const current=getSelection(player.id); setDecisionPlayer(player); setDecision({status:current.status||'called',date:new Date().toISOString().slice(0,10),reason:'',notes:''}); };
  const toggleBatchPlayer = playerId => setBatchSelected(ids => ids.includes(playerId) ? ids.filter(id=>id!==playerId) : [...ids,playerId]);
  const openBatchDecision = status => {
    if (!batchSelected.length) return alert('กรุณาเลือกผู้เล่นอย่างน้อย 1 คน');
    setDecisionPlayer({batch:true});
    setDecision({status,date:new Date().toISOString().slice(0,10),reason:'',notes:''});
  };
  const saveDecision = () => {
    if (!decisionPlayer || !decision.date) return alert('กรุณาระบุวันที่');
    const targetIds=decisionPlayer.batch?batchSelected:[decisionPlayer.id];
    const event={...decision,updatedAt:new Date().toISOString()};
    const selections={...playerSelections};
    targetIds.forEach(id=>{const current=getSelection(id);selections[id]={...event,history:[...(current.history||[]),event]};});
    if (decisionPlayer.batch && decision.status === 'cut') {
      const targetSet=new Set(targetIds);
      const finalEvent={status:'final',date:decision.date,reason:'ผ่านการตัดตัว',notes:'',updatedAt:new Date().toISOString()};
      calledPlayers.forEach(player=>{
        const current=getSelection(player.id);
        if (!targetSet.has(player.id) && !['cut','withdrawn','injured','final'].includes(current.status)) {
          selections[player.id]={...finalEvent,history:[...(current.history||[]),finalEvent]};
        }
      });
    }
    const updated={...camp,playerSelections:selections}; setCamps(curr=>curr.map(c=>c.id===camp.id?updated:c)); persistCamp(updated); setDecisionPlayer(null);
    if (decisionPlayer.batch) { setBatchSelected([]); setBatchMode(false); }
  };
  const setQuota = (key,value) => {
    const selections={...playerSelections,_config:{...config,quotas:{...config.quotas,[key]:Math.max(0,Number(value)||0)}}};
    const updated={...camp,playerSelections:selections}; setCamps(curr=>curr.map(c=>c.id===camp.id?updated:c)); persistCamp(updated);
  };

  const setPlayerShirt = (playerId, shirt) => {
    const shirts = { ...(camp.playerShirts || {}), [playerId]: shirt === '' ? undefined : Number(shirt) };
    if (shirt === '') delete shirts[playerId];
    const updated = { ...camp, playerShirts: shirts };
    setCamps(curr => curr.map(c => c.id === camp.id ? updated : c));
    persistCamp(updated);
  };

  return (
    <div className="cd-players-wrap" style={{padding: '30px', animation: 'fade-in 0.3s ease', maxWidth: 1000, margin: '0 auto'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <div>
          <h2 style={{margin: 0, fontFamily: 'var(--font-display)', fontSize: 28}}>Camp Squad</h2>
          <div style={{color: 'var(--fg-dim)', marginTop: 4}}>
            เรียก {calledPlayers.length} · เข้าแคมป์ {counts.in_camp||0} · Final {counts.final||0} · ตัด/ถอน {(counts.cut||0)+(counts.withdrawn||0)}
          </div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}>
          <button className={`btn-${batchMode ? 'primary' : 'ghost'}`} onClick={() => { setBatchMode(!batchMode); setBatchSelected([]); setIsEditingSquad(false); }}>
            {batchMode ? 'ยกเลิกเลือกหลายคน' : '☑ เลือกคนตัดออก'}
          </button>
          <button className={`btn-${isEditingSquad ? 'primary' : 'ghost'}`} onClick={() => { setIsEditingSquad(!isEditingSquad); setBatchMode(false); setBatchSelected([]); }}>
            {isEditingSquad ? '✓ Done Editing' : '✎ Edit Squad'}
          </button>
        </div>
      </div>

      <div className="selection-summary">
        {[['Called',calledPlayers.length,'#60a5fa'],['In Camp',counts.in_camp||0,'#22c55e'],['Final Squad',counts.final||0,'#a78bfa'],['Cut / Withdrawn',(counts.cut||0)+(counts.withdrawn||0),'#f59e0b'],['Injured',counts.injured||0,'#fb7185']].map(([label,value,color])=><div key={label}><span>{label}</span><strong style={{color}}>{value}</strong></div>)}
      </div>
      <div className="selection-quota"><div><strong>Final Squad Quota</strong><small>จำนวนจะอัปเดตทันทีเมื่อเปลี่ยนสถานะเป็น Final Squad</small></div>{['TOTAL','GK','DEF','MID','FWD'].map(key=><label key={key}><span>{key}</span><b className={finalCounts[key]>(config.quotas[key]||0)?'over':''}>{finalCounts[key]||0}</b><i>/</i><input type="number" min="0" value={config.quotas[key]||0} onChange={e=>setQuota(key,e.target.value)}/></label>)}</div>

      <div className="callup-cl-hd" style={{marginBottom: 20, background: 'var(--bg-2)', padding: 15, borderRadius: 12, display: 'flex', gap: 15, flexWrap: 'wrap', alignItems: 'center'}}>
        <input className="callup-search" placeholder="Search player…" value={search} onChange={e => setSearch(e.target.value)} style={{background: 'var(--bg-1)', flex: 1, minWidth: 200}}/>
        <div className="chips sm">
          {POS_FILTERS.map(f => (
            <button key={f} className={`chip ${filterPos===f?'on':''}`} onClick={() => setFilterPos(f)}>{f}</button>
          ))}
        </div>
        {!isEditingSquad && <select className="btn-ghost" value={selectionFilter} onChange={e=>setSelectionFilter(e.target.value)}><option value="active">ทีมปัจจุบัน</option><option value="all">เรียกทั้งหมด</option>{Object.entries(STATUS_META).map(([key,meta])=><option key={key} value={key}>{meta.label}</option>)}</select>}
        <select className="btn-ghost" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{marginLeft: 'auto'}}>
          <option value="pos">Sort: Position</option>
          <option value="shirt">Sort: Shirt #</option>
          <option value="name">Sort: Name</option>
          <option value="age">Sort: Age</option>
        </select>
      </div>

      {batchMode && <div className="selection-batch-bar">
        <strong>เลือกแล้ว {batchSelected.length} คน</strong>
        <span>คนที่ไม่ได้เลือกจะคงสถานะเดิม</span>
        <button className="btn-ghost" disabled={!batchSelected.length} onClick={()=>openBatchDecision('cut')}>ตัดตัว + Final ที่เหลือ</button>
        <button className="btn-ghost" disabled={!batchSelected.length} onClick={()=>openBatchDecision('withdrawn')}>ถอนตัว</button>
        <button className="btn-ghost" disabled={!batchSelected.length} onClick={()=>openBatchDecision('injured')}>บาดเจ็บ</button>
      </div>}

      <div className="callup-list" style={{display: 'grid', gridTemplateColumns: '1fr', gap: 10}}>
        {visiblePlayers.map(p => {
          const isCalled = calledIds.has(p.id);
          const campShirt = campShirts[p.id];
          const selection = getSelection(p.id); const statusMeta=STATUS_META[selection.status]||STATUS_META.called;
          return (
            <label key={p.id} className={`callup-row ${isCalled ? 'called' : ''} ${batchSelected.includes(p.id)?'batch-selected':''}`}
                   style={{background: 'var(--bg-2)', borderRadius: 12, padding: '10px 15px', cursor: !isEditingSquad ? 'pointer' : 'default'}}
                   onClick={(e) => {
                     if (batchMode) {
                       e.preventDefault();
                       toggleBatchPlayer(p.id);
                     } else if (!isEditingSquad && onSelectPlayer) {
                       e.preventDefault();
                       onSelectPlayer(p);
                     }
                   }}>
              {isEditingSquad && (
                <input type="checkbox" className="callup-chk" checked={isCalled} onChange={() => togglePlayer(p.id)}/>
              )}
              {batchMode && <input
                type="checkbox" className="callup-chk" checked={batchSelected.includes(p.id)}
                onChange={()=>toggleBatchPlayer(p.id)} onClick={e=>e.stopPropagation()}
              />}
              <window.PlayerPhoto playerId={p.id} name={p.name} size={40}/>
              <div className="callup-name-block">
                <span className="callup-name">{p.name}</span>
                {p.thaiName && <span className="callup-thai dim">{p.thaiName}</span>}
              </div>
              <window.PosBadge pos={p.pos} t={t || (x=>x)}/>
              <window.ClubChip code={p.club} small/>
              <span className="callup-team-pill">{p.team}</span>
              {isCalled && !isEditingSquad && !batchMode && <button type="button" className="selection-status-btn" style={{'--status-color':statusMeta.color}} onClick={e=>{e.preventDefault();e.stopPropagation();openDecision(p)}}>{statusMeta.label}</button>}
              {isCalled && (
                <span className="callup-shirt-wrap" onClick={e => e.preventDefault()}>
                  <span className="callup-shirt-hash">#</span>
                  <input type="number" min="1" max="99" className="callup-shirt-input" placeholder="–" value={campShirt ?? ''} disabled={!isEditingSquad} onChange={e => setPlayerShirt(p.id, e.target.value)}/>
                </span>
              )}
            </label>
          );
        })}
        {visiblePlayers.length === 0 && (
          <div className="callup-msg" style={{padding:'30px 20px'}}>No players match filter</div>
        )}
      </div>
      {decisionPlayer && <div className="selection-modal" onClick={()=>setDecisionPlayer(null)}><div className="selection-dialog" onClick={e=>e.stopPropagation()}><h3>Selection Decision</h3><p>{decisionPlayer.batch?`เปลี่ยนสถานะผู้เล่นที่เลือก ${batchSelected.length} คน — คนอื่นไม่เปลี่ยนแปลง`:`${decisionPlayer.name} (${decisionPlayer.nick||'-'})`}</p><div className="selection-fields"><label>สถานะ<select className="camp-input" value={decision.status} onChange={e=>setDecision({...decision,status:e.target.value})}>{Object.entries(STATUS_META).map(([key,meta])=><option key={key} value={key}>{meta.label}</option>)}</select></label><label>วันที่<input type="date" className="camp-input" value={decision.date} onChange={e=>setDecision({...decision,date:e.target.value})}/></label><label>เหตุผล<select className="camp-input" value={decision.reason} onChange={e=>setDecision({...decision,reason:e.target.value})}><option value="">— ไม่ระบุ —</option><option>ด้านเทคนิค</option><option>บาดเจ็บ</option><option>สโมสรไม่ปล่อย</option><option>เหตุผลส่วนตัว</option><option>เอกสาร/สิทธิ์แข่งขัน</option><option>อื่น ๆ</option></select></label><label className="wide">หมายเหตุ<textarea className="camp-input" rows="3" value={decision.notes} onChange={e=>setDecision({...decision,notes:e.target.value})}/></label></div>{!decisionPlayer.batch&&(getSelection(decisionPlayer.id).history||[]).length>0&&<div className="selection-history"><strong>ประวัติการเปลี่ยนสถานะ</strong>{[...getSelection(decisionPlayer.id).history].reverse().map((item,index)=><div key={index}><span>{STATUS_META[item.status]?.label||item.status}</span><time>{item.date}</time><small>{item.reason||''}</small></div>)}</div>}<div className="selection-dialog-actions"><button className="btn-ghost" onClick={()=>setDecisionPlayer(null)}>ยกเลิก</button><button className="btn-primary" onClick={saveDecision}>บันทึกสถานะ{decisionPlayer.batch?` ${batchSelected.length} คน`:''}</button></div></div></div>}
    </div>
  );
}

window.CampPlayersTab = CampPlayersTab;
