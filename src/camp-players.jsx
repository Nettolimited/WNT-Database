// Camp Players Tab - Squad Selection and Shirt Numbers
function CampPlayersTab({ camp, players, persistCamp, setCamps, t }) {
  const [isEditingSquad, setIsEditingSquad] = useState(false);
  const [filterPos, setFilterPos] = useState('All');
  const [search, setSearch] = useState('');

  const calledIds = new Set(camp.playerIds || []);
  const campShirts = camp.playerShirts || {};

  const POS_FILTERS = ['All', 'GK', 'DEF', 'MID', 'FWD'];
  const posGroup = (pos) => {
    if (['GK'].includes(pos)) return 'Goalkeeper';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'Defender';
    if (['CDM', 'CM', 'CAM', 'RM', 'LM'].includes(pos)) return 'Midfielder';
    if (['RW', 'LW', 'ST', 'CF'].includes(pos)) return 'Forward';
    return 'Unknown';
  };

  const visiblePlayers = players.filter(p => {
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
    return true;
  });

  const togglePlayer = (playerId) => {
    const newIds = calledIds.has(playerId)
      ? camp.playerIds.filter(id => id !== playerId)
      : [...camp.playerIds, playerId];
    const updated = { ...camp, playerIds: newIds };
    setCamps(curr => curr.map(c => c.id === camp.id ? updated : c));
    persistCamp(updated);
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
          <div style={{color: 'var(--fg-dim)', marginTop: 4}}>{calledIds.size} called · {players.length - calledIds.size} uncalled</div>
        </div>
        <button className={`btn-${isEditingSquad ? 'primary' : 'ghost'}`} onClick={() => setIsEditingSquad(!isEditingSquad)}>
          {isEditingSquad ? '✓ Done Editing' : '✎ Edit Squad'}
        </button>
      </div>

      <div className="callup-cl-hd" style={{marginBottom: 20, background: 'var(--bg-2)', padding: 15, borderRadius: 12}}>
        <input className="callup-search" placeholder="Search player…" value={search} onChange={e => setSearch(e.target.value)} style={{background: 'var(--bg-1)'}}/>
        <div className="chips sm">
          {POS_FILTERS.map(f => (
            <button key={f} className={`chip ${filterPos===f?'on':''}`} onClick={() => setFilterPos(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="callup-list" style={{display: 'grid', gridTemplateColumns: '1fr', gap: 10}}>
        {visiblePlayers.map(p => {
          const isCalled = calledIds.has(p.id);
          const campShirt = campShirts[p.id];
          return (
            <label key={p.id} className={`callup-row ${isCalled ? 'called' : ''}`} style={{background: 'var(--bg-2)', borderRadius: 12, padding: '10px 15px'}}>
              {isEditingSquad && (
                <input type="checkbox" className="callup-chk" checked={isCalled} onChange={() => togglePlayer(p.id)}/>
              )}
              <window.PlayerPhoto playerId={p.id} name={p.name} size={40}/>
              <div className="callup-name-block">
                <span className="callup-name">{p.name}</span>
                {p.thaiName && <span className="callup-thai dim">{p.thaiName}</span>}
              </div>
              <window.PosBadge pos={p.pos} t={t || (x=>x)}/>
              <window.ClubChip code={p.club} small/>
              <span className="callup-team-pill">{p.team}</span>
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
    </div>
  );
}

window.CampPlayersTab = CampPlayersTab;
