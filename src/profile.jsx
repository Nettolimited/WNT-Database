// Player profile slide-in panel

function ProfilePanel({ player, players, clubs: propClubs, camps, matchStats, onClubsChange, onClose, onEdit, onDelete, t, density }) {
  const [tab, setTab] = useState('nt_stats');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(player);
  const [mounted, setMounted] = useState(true);
  // Local clubs list — starts from prop (D1-loaded) or fallback to global
  const [clubs, setClubs] = useState(() => propClubs || [...window.TWNT_DATA.CLUBS]);
  const [newClub, setNewClub] = useState(null); // null | {name,code,country,_codeEdited}
  // NT match history
  const [matchHistory, setMatchHistory]       = useState(null); // null = not loaded
  const [matchHistoryErr, setMatchHistoryErr] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  // Keep local clubs in sync when parent reloads from D1
  useEffect(() => {
    if (propClubs) setClubs(propClubs);
  }, [propClubs]);

  useEffect(() => {
    // Normalize: if intStats is empty/zero but intGoals/caps have values, sync them up
    const ist = player.intStats || {};
    setDraft({
      ...player,
      intStats: {
        apps:    ist.apps    || player.caps      || 0,
        goals:   ist.goals   || player.intGoals  || 0,
        assists: ist.assists || 0,
        minutes: ist.minutes || 0,
        yellows: ist.yellows || 0,
        reds:    ist.reds    || 0,
      },
    });
    setEditing(false);
    setTab('overview');
    setMatchHistory(null);
    setMatchHistoryErr(false);
  }, [player?.id]);

  // Lazy-load match history when nt_stats tab is first opened
  useEffect(() => {
    if (tab !== 'nt_stats' || matchHistory !== null) return;
    fetch('/api/matches')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.matches) { setMatchHistoryErr(true); return; }
        // Filter to matches where this player has minutes > 0
        const rows = d.matches
          .map(m => {
            const entry = (m.lineup || []).find(e => e.playerId === player.id);
            const isPlayed = entry && ((entry.minutesPlayed || 0) > 0 || !!entry.isStarter || !!entry.subPlayed);
            if (!isPlayed) return null;
            return { ...m, playerEntry: entry };
          })
          .filter(Boolean)
          .sort((a, b) => (a.match_date || '').localeCompare(b.match_date || ''));
        setMatchHistory(rows);
      })
      .catch(() => setMatchHistoryErr(true));
  }, [tab, player?.id]);

  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  if (!player) return null;
  const club = clubByCode(player.club);
  const age = ageFromDob(player.dob);

  const save = () => { onEdit(draft); setEditing(false); };

  // Directly click the hidden file-input inside the shadow DOM
  const editClubLogo = () => {
    const el = document.getElementById(`clublogo-${player.club}`);
    if (el && el.shadowRoot) {
      const inp = el.shadowRoot.querySelector('input[type=file]');
      if (inp) inp.click();
    }
  };
  // Save a brand-new club to D1 and select it immediately
  const saveNewClub = () => {
    const code    = (newClub?.code    || '').trim().toUpperCase();
    const name    = (newClub?.name    || '').trim();
    const country = (newClub?.country || '').trim().toUpperCase().slice(0, 3);
    if (!code || !name) return;
    if (clubs.find(c => c.code === code)) { alert(`Code "${code}" already exists`); return; }

    // Move logo from the temp slot → the real club logo slot
    if (window._imageSlotGet && window._imageSlotSet) {
      const logoData = window._imageSlotGet('new-club-logo');
      if (logoData) {
        window._imageSlotSet('clublogo-' + code, logoData);
        window._imageSlotSet('new-club-logo', null);
      }
    }

    const club = { code, name, color: '#2444a1', country };
    const newClubs = [...clubs, club];
    window.TWNT_DATA.CLUBS = newClubs;
    setClubs(newClubs);
    onClubsChange?.(newClubs);
    setF('club', code);
    setNewClub(null);
    // Persist to D1 (optimistic — UI already updated)
    fetch('/api/clubs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name, color: '#2444a1', country }),
    }).catch(console.error);
  };

  const editPlayerPhoto = () => {
    const el = document.getElementById(`photo-${player.id}`);
    if (el && el.shadowRoot) {
      const inp = el.shadowRoot.querySelector('input[type=file]');
      if (inp) inp.click();
    }
  };

  const setF = (path, v) => {
    setDraft(d => {
      const c = JSON.parse(JSON.stringify(d));
      const ks = path.split('.');
      let cur = c;
      for (let i = 0; i < ks.length - 1; i++) cur = cur[ks[i]];
      cur[ks[ks.length-1]] = v;
      // Keep intGoals ↔ intStats.goals and caps ↔ intStats.apps in sync
      if (path === 'intGoals')       c.intStats = { ...c.intStats, goals: v };
      if (path === 'caps')           c.intStats = { ...c.intStats, apps:  v };
      if (path === 'intStats.goals') c.intGoals = v;
      if (path === 'intStats.apps')  c.caps     = v;
      return c;
    });
  };

  return (
    <>
      <div className={`profile-backdrop ${mounted?'in':''}`} onClick={onClose}></div>
      <aside className={`profile-panel ${mounted?'in':''}`}>
        <div className={`profile-head ${editing ? 'profile-head-editing' : ''}`} style={{'--club-color': club.color}}>
          <div className="profile-head-bg"></div>
          <button className="icon-btn close-x" onClick={onClose}>✕</button>
          {/* Club crest — top-right of header */}
          <div className="profile-club-crest">
            <image-slot
              id={`clublogo-${player.club}`}
              shape="rounded"
              radius="10"
              placeholder="Drop logo"
              style={{width:'72px', height:'72px', flex:'0 0 72px'}}
            ></image-slot>
            <button className="club-crest-edit-btn" onClick={editClubLogo}>✎ Change</button>
          </div>
          <div className="profile-id">
            {/* Photo — always visible with edit btn */}
            <div className="profile-photo-wrap">
              <image-slot
                id={`photo-${player.id}`}
                shape="rounded"
                radius="10"
                placeholder="Drop photo"
                style={{width:'88px', height:'88px', flex:'0 0 88px'}}
              ></image-slot>
              <button className="photo-edit-btn" onClick={editPlayerPhoto} title="Change photo">✎</button>
            </div>

            {/* Name/pos — switches to edit inputs */}
            {editing ? (
              <div className="pef-id-row">
                <div className="pef-id-fields">
                  <input className="pef-input pef-name-input" value={draft.name || ''} placeholder="English name"
                    onChange={e => setF('name', e.target.value)}/>
                  <input className="pef-input" value={draft.thaiName || ''} placeholder="ชื่อภาษาไทย"
                    onChange={e => setF('thaiName', e.target.value)}/>
                  <input className="pef-input" value={draft.nick || ''} placeholder="ชื่อเล่น (Nick)"
                    onChange={e => setF('nick', e.target.value)}/>
                  <div className="pef-selects-row">
                    <select className="pef-select" value={draft.pos || ''} onChange={e => setF('pos', e.target.value)}>
                      {window.TWNT_DATA.POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {/* Team — filtered to age-eligible options only */}
                    {(() => {
                      const editAge = ageFromDob(draft.dob);
                      const eligible = window.TWNT_DATA.TEAMS.filter(tm => {
                        if (tm === 'Senior') return true;
                        const lim = parseInt(tm.replace('U',''));
                        return !isNaN(lim) && editAge <= lim;
                      });
                      return (
                        <div className="pef-team-wrap">
                          <select className="pef-select" value={draft.team || 'Senior'}
                            onChange={e => setF('team', e.target.value)}>
                            {eligible.map(tm => <option key={tm} value={tm}>{tm}</option>)}
                          </select>
                          <span className="pef-team-hint">
                            อายุ {editAge} ปี — เล่นได้: {eligible.join(', ')}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="pef-altpos-row">
                    <span className="pm-lab" style={{marginRight:4}}>Alt pos:</span>
                    {window.TWNT_DATA.POSITIONS.filter(p => p !== draft.pos).map(p => (
                      <label key={p} className="pef-alt-check">
                        <input type="checkbox"
                          checked={(draft.altPos||[]).includes(p)}
                          onChange={e => {
                            const curr = draft.altPos || [];
                            setF('altPos', e.target.checked ? [...curr, p] : curr.filter(x => x !== p));
                          }}/>
                        {p}
                      </label>
                    ))}
                  </div>
                  <input
                    className="photo-url-input"
                    placeholder="🔗 วาง URL รูปผู้เล่นแล้วกด Enter"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        window.applyLogoFromUrl(e.target.value.trim(), `photo-${player.id}`);
                        e.target.value = '';
                      }
                    }}
                    onBlur={e => {
                      if (e.target.value.trim()) {
                        window.applyLogoFromUrl(e.target.value.trim(), `photo-${player.id}`);
                        e.target.value = '';
                      }
                    }}
                  />
                  {/* ── Active / Retired toggle — auto-moves club to RETIRE ── */}
                  <label className="pef-active-row">
                    <input type="checkbox"
                      checked={draft.active !== false}
                      onChange={e => {
                        const retiring = !e.target.checked;
                        setDraft(d => {
                          const c = JSON.parse(JSON.stringify(d));
                          c.active = !retiring;
                          if (retiring) {
                            // Save current club before moving to RETIRE
                            if (c.club !== 'RETIRE') c.lastClub = c.club;
                            c.club = 'RETIRE';
                          } else {
                            // Restore previous club when un-retiring
                            c.club = c.lastClub || c.club;
                            delete c.lastClub;
                          }
                          return c;
                        });
                      }}/>
                    <span className={`pef-active-badge ${draft.active !== false ? 'active' : 'retired'}`}>
                      {draft.active !== false ? '🟢 ยังเล่นอยู่ (Active)' : '⚫ เลิกเล่นแล้ว (Retired)'}
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <>
                <div className="profile-id-text">
                  <div className="profile-pos-line">
                    <PosBadge pos={player.pos} t={t}/>
                    {(player.altPos||[]).map((p,i) => <PosBadge key={i} pos={p} t={t}/>)}
                    <span className="profile-team-pill">{player.team}</span>
                  </div>
                  <h2 className="profile-name">
                    {player.name}
                    {player.nick && <span className="profile-nick">({player.nick})</span>}
                  </h2>
                  <div className="profile-name-th">{player.thaiName}</div>
                </div>
              </>
            )}
          </div>

          {/* Meta row — switches to edit inputs */}
          {editing ? (
            <div className="profile-meta pef-meta-edit">
              <div className="pm-cell">
                <span className="pm-lab">{t('dob')}</span>
                <input type="date" className="pef-input" value={draft.dob || ''}
                  onChange={e => {
                    const newDob = e.target.value;
                    const newAge = ageFromDob(newDob);
                    // If current team is now over-age, slide up to most specific eligible U
                    const currTeam = draft.team || 'Senior';
                    let newTeam = currTeam;
                    if (currTeam !== 'Senior') {
                      const lim = parseInt(currTeam.replace('U',''));
                      if (newAge > lim) {
                        newTeam = window.TWNT_DATA.TEAMS
                          .filter(tm => tm !== 'Senior')
                          .filter(tm => newAge <= parseInt(tm.replace('U','')))
                          .sort((a,b) => parseInt(a.replace('U','')) - parseInt(b.replace('U','')))
                          [0] || 'Senior';
                      }
                    }
                    setDraft(d => {
                      const c = JSON.parse(JSON.stringify(d));
                      c.dob = newDob; c.team = newTeam;
                      return c;
                    });
                  }}/>
              </div>
              <div className="pm-cell">
                <span className="pm-lab">{t('height')} (cm)</span>
                <input type="number" className="pef-input" value={draft.height || ''} placeholder="cm"
                  onChange={e => setF('height', +e.target.value)}/>
              </div>
              <div className="pm-cell">
                <span className="pm-lab">{t('foot')}</span>
                <select className="pef-select" value={draft.foot || 'R'} onChange={e => setF('foot', e.target.value)}>
                  <option value="R">R – Right</option>
                  <option value="L">L – Left</option>
                  <option value="B">B – Both</option>
                </select>
              </div>
              <div className={`pm-cell ${newClub ? 'pm-cell-full' : ''}`}>
                <span className="pm-lab">{t('club')}</span>
                <select className="pef-select"
                  value={newClub ? '__ADD__' : (draft.club || '')}
                  onChange={e => {
                    if (e.target.value === '__ADD__') {
                      setNewClub({ name:'', code:'', country:'', _codeEdited:false });
                    } else {
                      setF('club', e.target.value);
                      setNewClub(null);
                    }
                  }}>
                  {clubs.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  <option disabled>──────────</option>
                  <option value="__ADD__">➕ เพิ่มสโมสรใหม่…</option>
                </select>
                {/* Inline add-club mini-form */}
                {newClub && (
                  <div className="new-club-form">
                    {/* Row 1 — club name (full width) */}
                    <input className="pef-input" placeholder="ชื่อสโมสร" value={newClub.name} autoFocus
                      onChange={e => {
                        const nm = e.target.value;
                        const auto = nm.split(/\s+/).map(w => w[0]||'').join('').toUpperCase().slice(0,5);
                        setNewClub(nc => ({ ...nc, name: nm, code: nc._codeEdited ? nc.code : auto }));
                      }}/>
                    {/* Row 2 — small logo | CODE | TH | ✓ ✕ */}
                    <div className="new-club-row2">
                      <image-slot
                        id="new-club-logo"
                        shape="rounded"
                        radius="6"
                        placeholder="Logo"
                        style={{width:'32px', height:'32px', flex:'0 0 32px'}}
                      ></image-slot>
                      <input className="pef-input new-club-code" placeholder="CODE"
                        value={newClub.code}
                        onChange={e => setNewClub(nc => ({
                          ...nc,
                          code: e.target.value.replace(/[^A-Z0-9_]/gi,'').toUpperCase().slice(0,6),
                          _codeEdited: true
                        }))}/>
                      <input className="pef-input new-club-country" placeholder="THA" maxLength={3}
                        title="รหัสประเทศ ISO เช่น THA JPN KOR"
                        value={newClub.country}
                        onChange={e => setNewClub(nc => ({
                          ...nc,
                          country: e.target.value.replace(/[^A-Za-z]/g,'').toUpperCase().slice(0,3)
                        }))}/>
                      <button className="btn-primary sm" onClick={saveNewClub}>✓</button>
                      <button className="btn-ghost sm" onClick={() => {
                        if (window._imageSlotSet) window._imageSlotSet('new-club-logo', null);
                        setNewClub(null);
                      }}>✕</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="pm-cell">
                <span className="pm-lab">{t('caps')}</span>
                <input type="number" className="pef-input" value={draft.caps ?? 0} onChange={e => setF('caps', +e.target.value)}/>
              </div>
              <div className="pm-cell">
                <span className="pm-lab">{t('intGoals')}</span>
                <input type="number" className="pef-input" value={draft.intGoals ?? 0} onChange={e => setF('intGoals', +e.target.value)}/>
              </div>
            </div>
          ) : (
            <div className="profile-meta">
              <div className="pm-cell"><span className="pm-lab">{t('age')}</span><span className="pm-val mono">{age}</span></div>
              <div className="pm-cell"><span className="pm-lab">{t('dob')}</span><span className="pm-val mono">{player.dob}</span></div>
              <div className="pm-cell"><span className="pm-lab">{t('height')}</span><span className="pm-val mono">{player.height} cm</span></div>
              <div className="pm-cell"><span className="pm-lab">{t('foot')}</span><span className="pm-val"><FootIcon foot={player.foot}/></span></div>
              <div className="pm-cell"><span className="pm-lab">{t('club')}</span><span className="pm-val"><ClubChip code={player.club}/></span></div>
              <div className="pm-cell"><span className="pm-lab">{t('caps')}</span><span className="pm-val mono">{player.caps} · {player.intGoals}g</span></div>
              {player.active === false && (
                <div className="pm-cell pm-cell-full"><span className="pm-retired-badge">⚫ เลิกเล่นแล้ว</span></div>
              )}
            </div>
          )}
        </div>

        <div className="profile-tabs">
          <div className="tab-spacer"></div>
          {!editing ? (
            <>
              <button className="btn-ghost sm" onClick={() => setEditing(true)}>✎ {t('edit')}</button>
              {onDelete && (
                <button className="btn-ghost sm danger" style={{color:'var(--accent-red)'}}
                  onClick={() => { if(confirm(`Delete ${player.name}?`)) onDelete(player.id); }}>
                  ✕ {t('delete') || 'Delete'}
                </button>
              )}
            </>
          ) : (
            <>
              <button className="btn-ghost sm" onClick={() => { setDraft(player); setEditing(false); }}>{t('cancel')}</button>
              <button className="btn-primary sm" onClick={save}>{t('save')}</button>
            </>
          )}
        </div>

        <div className="profile-body">
          {/* ── Status toggle (edit mode) / Retired badge (view mode) ── */}
          {editing ? (
            <div className="pp-status-row">
              <span className="pp-status-label-txt">สถานะนักเตะ</span>
              <label className="pef-status-toggle">
                <input type="checkbox"
                  checked={draft.active !== false}
                  onChange={e => setF('active', e.target.checked)}/>
                <span className={`pef-status-label ${draft.active !== false ? 'active' : 'retired'}`}>
                  {draft.active !== false ? '🟢 ยังเล่นอยู่ (Active)' : '⚫ เลิกเล่นแล้ว (Retired)'}
                </span>
              </label>
            </div>
          ) : (
            player.active === false && (
              <div className="pp-status-row">
                <span className="pm-retired-badge">⚫ เลิกเล่นแล้ว — ไม่นับในภาพรวมทีม</span>
              </div>
            )
          )}

          {(() => {
            const ms = matchStats?.get(player.id);
            const ist = player.intStats || {};
            const caps    = ms?.apps    ?? ist.apps    ?? 0;
            const goals   = ms?.goals   ?? ist.goals   ?? 0;
            const assists = ms?.assists ?? ist.assists ?? 0;
            const minutes = ms?.minutes ?? ist.minutes ?? 0;
            const yellows = ms?.yellows ?? ist.yellows ?? 0;
            const reds    = ms?.reds    ?? ist.reds    ?? 0;
            const fromLog = !!ms;

            // Form from match history (newest first → left=oldest for display)
            const formList = matchHistory
              ? [...matchHistory].reverse().slice(0,8).map(m => {
                  const hs=m.home_score??0, as_=m.away_score??0;
                  return hs>as_?'W':hs===as_?'D':'L';
                })
              : [];

            const fmtDate = (d) => {
              if (!d) return '–';
              const dt = new Date(d + 'T00:00:00');
              return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric' });
            };

            const playerMap = new Map((players||[]).map(p=>[p.id,p]));

            return (
              <>
                {/* ── Stats banner ── */}
                <div className="pp-stats-banner">
                  <div className="pp-big-stat">
                    <span className="pp-big-num">{caps}</span>
                    <span className="pp-big-lab">CAPS</span>
                  </div>
                  <div className="pp-big-stat pp-big-hl">
                    <span className="pp-big-num" style={{color:'#ef4444'}}>{goals}</span>
                    <span className="pp-big-lab">GOALS</span>
                  </div>
                  <div className="pp-big-stat">
                    <span className="pp-big-num">{assists}</span>
                    <span className="pp-big-lab">ASSISTS</span>
                  </div>
                  <div className="pp-big-stat">
                    <span className="pp-big-num">{minutes}</span>
                    <span className="pp-big-lab">MINS</span>
                  </div>
                </div>

                {/* ── Discipline + source badge ── */}
                <div className="pp-disc-row">
                  {fromLog
                    ? <span className="stats-source-badge">⟳ match log</span>
                    : <span className="pp-manual-badge">✏ manual</span>}
                  {yellows > 0 && <span className="pp-disc-chip pp-yel">🟨 {yellows}</span>}
                  {reds > 0    && <span className="pp-disc-chip pp-red">🟥 {reds}</span>}
                  {caps > 0 && minutes > 0 && (
                    <span className="pp-disc-chip">⏱ {(minutes/caps).toFixed(0)}' avg</span>
                  )}
                </div>

                {/* ── Recent form ── */}
                {formList.length > 0 && (
                  <div className="pp-form-bar">
                    <span className="pp-section-lbl">FORM</span>
                    <div className="pp-form-dots">
                      {formList.map((r,i) => (
                        <span key={i} className={`pp-fdot pp-fdot-${r.toLowerCase()}`}>{r}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Match log as cards ── */}
                <div className="pp-section-lbl" style={{marginTop:4}}>MATCH LOG</div>

                {matchHistoryErr && (
                  <div className="pp-state-msg">ไม่สามารถโหลดข้อมูลได้</div>
                )}
                {!matchHistoryErr && matchHistory === null && (
                  <div className="pp-state-msg">Loading…</div>
                )}
                {!matchHistoryErr && matchHistory !== null && matchHistory.length === 0 && (
                  <div className="pp-state-msg">ยังไม่มี Appearance ที่บันทึกไว้</div>
                )}

                {!matchHistoryErr && matchHistory !== null && (
                  <div className="pp-match-list">
                    {[...matchHistory].reverse().map(m => {
                      const e = m.playerEntry;
                      const hs=m.home_score??0, as_=m.away_score??0;
                      const r = hs>as_?'w':hs===as_?'d':'l';
                      const isExp = expandedMatchId === m.id;
                      const lineup = (m.lineup || [])
                        .filter(l => (l.minutesPlayed || 0) > 0 || !!l.isStarter || !!l.subPlayed)
                        .sort((a, b) => (b.minutesPlayed || 0) - (a.minutesPlayed || 0));
                      return (
                        <div key={m.id} className={`pp-match-card pp-mc-${r} ${isExp?'expanded':''}`}
                          onClick={() => setExpandedMatchId(isExp ? null : m.id)}>

                          {/* Card main row */}
                          <div className="pp-mc-row">
                            <div className="pp-mc-left">
                              <span className={`pp-mc-badge pp-rb-${r}`}>{r.toUpperCase()}</span>
                              <div className="pp-mc-info">
                                <span className="pp-mc-opp">vs {m.opponent}</span>
                                <span className="pp-mc-meta">
                                  {fmtDate(m.match_date)}
                                  {m.competition && <> · {m.competition}</>}
                                </span>
                              </div>
                            </div>
                            <div className="pp-mc-right">
                              <span className="pp-mc-score">{hs}–{as_}</span>
                              <div className="pp-mc-events">
                                {((e.minutesPlayed || 0) > 0 || !!e.isStarter || !!e.subPlayed) && <span className="pp-mc-min">{e.minutesPlayed || 0}'</span>}
                                {e.goals > 0    && <span className="pp-mc-evt">⚽{e.goals}</span>}
                                {e.assists > 0  && <span className="pp-mc-evt">🅰{e.assists}</span>}
                                {e.yellowCards > 0 && <span className="pp-mc-evt">🟨</span>}
                                {e.redCard      && <span className="pp-mc-evt">🟥</span>}
                              </div>
                            </div>
                            <span className="pp-mc-chevron">{isExp ? '▲' : '▼'}</span>
                          </div>

                          {/* Expanded: full lineup */}
                          {isExp && (
                            <div className="pp-mc-lineup">
                              {lineup.length === 0
                                ? <span className="pp-state-msg">No lineup data</span>
                                : lineup.map(l => {
                                    const p = playerMap.get(l.playerId);
                                    const isSelf = l.playerId === player.id;
                                    return (
                                      <div key={l.playerId} className={`md-lineup-chip ${isSelf?'self':''}`}>
                                        {p && <PosBadge pos={p.pos}/>}
                                        <span className="md-lineup-chip-name">{p?.nick||p?.name||l.playerId}</span>
                                        <span className="md-lineup-chip-min mono">{l.minutesPlayed || 0}'</span>
                                        {l.goals>0     && <span className="md-lineup-chip-goal">⚽{l.goals}</span>}
                                        {l.assists>0   && <span className="md-lineup-chip-goal" style={{opacity:.7}}>🅰{l.assists}</span>}
                                        {l.yellowCards>0 && <span>🟨</span>}
                                        {l.redCard     && <span>🟥</span>}
                                      </div>
                                    );
                                  })
                              }
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* ── Camp History ── */}
                {camps && (
                  <>
                    <div className="pp-section-lbl" style={{marginTop:24, marginBottom: 8}}>CAMP HISTORY</div>
                    <div className="pp-match-list">
                      {camps.filter(c => (c.playerIds || []).includes(player.id)).length === 0 ? (
                        <div className="pp-state-msg">ยังไม่มีประวัติการเข้าแคมป์</div>
                      ) : (
                        camps.filter(c => (c.playerIds || []).includes(player.id))
                             .sort((a,b) => (b.camp_date||'').localeCompare(a.camp_date||''))
                             .map(c => (
                          <div key={c.id} className="pp-match-card" style={{display: 'flex', flexDirection: 'column', cursor: 'default'}}>
                            <div className="pp-mc-left" style={{marginBottom: 4}}>
                              <span className="pp-mc-opp">{c.name}</span>
                            </div>
                            <span className="pp-mc-meta">
                              {c.camp_date ? new Date(c.camp_date).toLocaleDateString('en-GB', {day:'2-digit', month:'2-digit', year:'numeric'}) : ''} - {c.camp_date_end ? new Date(c.camp_date_end).toLocaleDateString('en-GB', {day:'2-digit', month:'2-digit', year:'numeric'}) : ''}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </div>
      </aside>
    </>
  );
}

function Stat({ k, v, hl, color }) {
  return (
    <div className={`stat ${hl?'hl':''}`}>
      <div className="stat-v mono" style={color?{color}:null}>{v}</div>
      <div className="stat-k">{k}</div>
    </div>
  );
}

function EditableStats({ stats, editing, onChange, t }) {
  const keys = [['apps', t('apps')], ['goals', t('goals')], ['assists', t('assists')],
                ['minutes', t('minutes')], ['yellows', t('yellows')], ['reds', t('reds')]];
  return (
    <div className="stat-grid">
      {keys.map(([k, lab]) => (
        <div key={k} className="stat">
          {editing ? (
            <input type="number" value={stats[k]} onChange={e => onChange(k, +e.target.value)} className="num-input lg"/>
          ) : (
            <div className="stat-v mono">{stats[k]}</div>
          )}
          <div className="stat-k">{lab}</div>
        </div>
      ))}
    </div>
  );
}

window.ProfilePanel = ProfilePanel;
