// Club management panel — list, edit, logo upload for all clubs

function ClubsPanel({ clubs: propClubs, onClubsChange, onClose, t }) {
  const [clubs, setClubs] = useState(() => propClubs || [...window.TWNT_DATA.CLUBS]);
  const [editingCode, setEditingCode] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newClub, setNewClub] = useState(null); // null | {name,code,country,_codeEdited}

  // Escape closes
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  // Helper: update local state, global store, and notify parent
  const _setClubs = (newClubs) => {
    setClubs(newClubs);
    window.TWNT_DATA.CLUBS = newClubs;
    onClubsChange?.(newClubs);
  };

  const startEdit = (club) => {
    setNewClub(null);
    setEditingCode(club.code);
    setDraft({ ...club });
  };
  const cancelEdit = () => { setEditingCode(null); setDraft(null); };

  const saveEdit = async () => {
    if (!draft) return;
    setSaving(true);
    const updated = { ...draft, country: (draft.country || '').toUpperCase().slice(0, 3) };
    _setClubs(clubs.map(c => c.code === updated.code ? updated : c));
    setEditingCode(null); setDraft(null);
    try {
      await fetch('/api/clubs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const editLogo = (code) => {
    const el = document.getElementById(`clublogo-${code}`);
    if (el?.shadowRoot) {
      const inp = el.shadowRoot.querySelector('input[type=file]');
      if (inp) inp.click();
    }
  };

  // Delete club
  const deleteClub = async (code) => {
    if (!confirm(`ลบสโมสร "${clubs.find(c => c.code === code)?.name || code}" ออกจากระบบ?\n\n(ผู้เล่นที่ใช้สโมสรนี้จะยังอยู่ แต่ไม่มีข้อมูลสโมสรแล้ว)`)) return;
    _setClubs(clubs.filter(c => c.code !== code));
    try {
      await fetch(`/api/clubs/${code}`, { method: 'DELETE' });
    } catch (e) { console.error(e); }
  };

  // Add new club
  const saveNewClub = async () => {
    const code    = (newClub?.code    || '').trim().toUpperCase();
    const name    = (newClub?.name    || '').trim();
    const country = (newClub?.country || '').trim().toUpperCase().slice(0, 3);
    if (!code || !name) return;
    if (clubs.find(c => c.code === code)) { alert(`Code "${code}" already exists`); return; }

    if (window._imageSlotGet && window._imageSlotSet) {
      const logoData = window._imageSlotGet('new-club-logo-mgr');
      if (logoData) {
        window._imageSlotSet('clublogo-' + code, logoData);
        window._imageSlotSet('new-club-logo-mgr', null);
      }
    }

    const club = { code, name, color: '#2444a1', country };
    _setClubs([...clubs, club]);
    setNewClub(null);
    try {
      await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, color: '#2444a1', country }),
      });
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <div className="profile-backdrop in" onClick={onClose}></div>
      <aside className="clubs-panel in">

        {/* Header */}
        <div className="clubs-panel-head">
          <h2 className="clubs-panel-title">🏟 สโมสรทั้งหมด</h2>
          <span className="clubs-count mono">{clubs.length} clubs</span>
          <button className="icon-btn close-x" onClick={onClose}>✕</button>
        </div>

        {/* Club list */}
        <div className="clubs-list">
          {clubs.map(club => (
            <div key={club.code} className={`club-mgr-row ${editingCode === club.code ? 'editing' : ''}`}>

              {/* Logo slot */}
              <div className="club-mgr-logo">
                <image-slot
                  id={`clublogo-${club.code}`}
                  shape="rounded"
                  radius="6"
                  placeholder=""
                  style={{width:'44px', height:'44px', flex:'0 0 44px'}}
                ></image-slot>
                <button className="club-logo-edit-btn" onClick={() => editLogo(club.code)} title="เปลี่ยนโลโก้">✎</button>
              </div>

              {/* Info or Edit form */}
              {editingCode === club.code ? (
                <div className="club-mgr-edit">
                  <input className="pef-input club-mgr-name-input" value={draft.name}
                    placeholder="ชื่อสโมสร" autoFocus
                    onChange={e => setDraft(d => ({...d, name: e.target.value}))}/>
                  <div className="club-mgr-row2">
                    <span className="club-code-pill mono">{club.code}</span>
                    <input className="pef-input new-club-country" placeholder="THA" maxLength={3}
                      title="รหัสประเทศ ISO เช่น THA JPN KOR"
                      value={draft.country || ''}
                      onChange={e => setDraft(d => ({...d, country: e.target.value.replace(/[^A-Za-z]/g,'').toUpperCase().slice(0,3)}))}/>
                    <span className="club-flag-live">
                      {draft.country ? flagEmoji(draft.country) : <span className="dim">🏳</span>}
                    </span>
                    <button className="btn-primary sm" onClick={saveEdit} disabled={saving}>✓</button>
                    <button className="btn-ghost sm" onClick={cancelEdit}>✕</button>
                  </div>
                  {/* Logo URL input */}
                  <div className="club-logo-url-row">
                    <span className="club-logo-url-label">🔗 Logo URL</span>
                    <input className="pef-input club-logo-url-input"
                      placeholder="https://… (วางลิงก์รูปโลโก้แล้วกด Enter)"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          window.applyLogoFromUrl(e.target.value.trim(), `clublogo-${club.code}`);
                          e.target.value = '';
                        }
                      }}
                      onBlur={e => {
                        if (e.target.value.trim()) {
                          window.applyLogoFromUrl(e.target.value.trim(), `clublogo-${club.code}`);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="club-mgr-info">
                  <div className="club-mgr-name">{club.name}</div>
                  <div className="club-mgr-meta">
                    <span className="club-code-pill mono">{club.code}</span>
                    {club.country
                      ? <span className="club-country-badge">{club.country.toUpperCase()}</span>
                      : <span className="dim" style={{fontSize:'11px'}}>ไม่มีรหัสประเทศ</span>}
                  </div>
                </div>
              )}

              {/* Actions (read mode only) */}
              {editingCode !== club.code && (
                <div className="club-mgr-actions">
                  <button className="btn-ghost sm" onClick={() => startEdit(club)}>✎ แก้ไข</button>
                  <button className="btn-ghost sm danger" onClick={() => deleteClub(club.code)}>✕</button>
                </div>
              )}
            </div>
          ))}

          {/* Add new club row */}
          {newClub ? (
            <div className="club-mgr-row club-mgr-add-open">
              <div className="club-mgr-logo">
                <image-slot
                  id="new-club-logo-mgr"
                  shape="rounded"
                  radius="6"
                  placeholder="Logo"
                  style={{width:'44px', height:'44px', flex:'0 0 44px'}}
                ></image-slot>
              </div>
              <div className="club-mgr-edit">
                <input className="pef-input club-mgr-name-input" placeholder="ชื่อสโมสร"
                  value={newClub.name} autoFocus
                  onChange={e => {
                    const nm = e.target.value;
                    const auto = nm.split(/\s+/).map(w => w[0]||'').join('').toUpperCase().slice(0,5);
                    setNewClub(nc => ({...nc, name: nm, code: nc._codeEdited ? nc.code : auto}));
                  }}/>
                <div className="club-mgr-row2">
                  <input className="pef-input new-club-code" placeholder="CODE"
                    value={newClub.code}
                    onChange={e => setNewClub(nc => ({
                      ...nc,
                      code: e.target.value.replace(/[^A-Z0-9_]/gi,'').toUpperCase().slice(0,6),
                      _codeEdited: true,
                    }))}/>
                  <input className="pef-input new-club-country" placeholder="THA" maxLength={3}
                    value={newClub.country}
                    onChange={e => setNewClub(nc => ({
                      ...nc,
                      country: e.target.value.replace(/[^A-Za-z]/g,'').toUpperCase().slice(0,3),
                    }))}/>
                  <span className="club-flag-live">
                    {newClub.country ? flagEmoji(newClub.country) : <span className="dim">🏳</span>}
                  </span>
                  <button className="btn-primary sm" onClick={saveNewClub}>✓</button>
                  <button className="btn-ghost sm" onClick={() => {
                    if (window._imageSlotSet) window._imageSlotSet('new-club-logo-mgr', null);
                    setNewClub(null);
                  }}>✕</button>
                </div>
                {/* Logo URL input */}
                <div className="club-logo-url-row">
                  <span className="club-logo-url-label">🔗 Logo URL</span>
                  <input className="pef-input club-logo-url-input"
                    placeholder="https://… วางลิงก์รูปโลโก้แล้วกด Enter"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.target.value.trim() && newClub.code) {
                        window.applyLogoFromUrl(e.target.value.trim(), 'new-club-logo-mgr');
                        e.target.value = '';
                      }
                    }}
                    onBlur={e => {
                      if (e.target.value.trim() && newClub.code) {
                        window.applyLogoFromUrl(e.target.value.trim(), 'new-club-logo-mgr');
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <button className="club-mgr-add-btn" onClick={() => {
              setEditingCode(null); setDraft(null);
              setNewClub({name:'', code:'', country:'', _codeEdited:false});
            }}>
              ➕ เพิ่มสโมสรใหม่
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

window.ClubsPanel = ClubsPanel;
