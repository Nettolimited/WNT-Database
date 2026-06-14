const ROLE_RANKS = {
  'Head Coach': 10,
  'Coach': 20,
  'Goalkeeper Coach': 30,
  'Fitness Coach': 40,
  'Analyst': 50,
  'Manager': 60,
  'Team Coordinator': 65,
  'Physio': 70,
  'Doctor': 72,
  'Masseuse': 75,
  'Medical': 80,
  'Kitman': 90,
  'Media Officer': 92,
  'Photographer': 95,
  'Other': 100
};

const getRoleRank = (role) => ROLE_RANKS[role] || 999;

const getStaffSection = (roleCategory) => {
  if (['Head Coach', 'Coach', 'Goalkeeper Coach', 'Fitness Coach', 'Analyst'].includes(roleCategory)) {
    return 'Technical Team';
  }
  return 'Support Team';
};

function StaffDirectory({ staff, camps, onStaffUpdated, t }) {
  const [editingStaff, setEditingStaff] = useState(null);
  const [search, setSearch] = useState('');

  const filteredStaff = staff.filter(s => {
    if (search && 
        !s.name.toLowerCase().includes(search.toLowerCase()) && 
        !(s.thai_name||'').toLowerCase().includes(search.toLowerCase()) &&
        !(s.nickname||'').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSave = (item) => {
    const slot = window._imageSlotGet?.(`photo-${item.id}`);
    const updated = {
      ...item,
      photo_url: slot?.u || item.photo_url || '',
      photo_scale: slot?.s || item.photo_scale || 1
    };
    const isNew = !updated.id || !staff.find(s => s.id === updated.id);
    fetch(isNew ? '/api/staff' : `/api/staff/${updated.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).then(async (res) => {
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        alert(errData?.error || 'Failed to save staff member');
        return;
      }
      setEditingStaff(null);
      if (onStaffUpdated) onStaffUpdated();
    });
  };

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    fetch(`/api/staff/${id}`, { method: 'DELETE' }).then(() => {
      setEditingStaff(null);
      if (onStaffUpdated) onStaffUpdated();
    });
  };

  return (
    <div className="cd-players-wrap" style={{padding: '40px 30px', animation: 'fade-in 0.3s ease', maxWidth: '1200px', width: '100%', boxSizing: 'border-box', margin: '0 auto', height: '100%', overflowY: 'auto'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <div>
          <h2 style={{margin: 0, fontFamily: 'var(--font-display)', fontSize: '38px', letterSpacing: '-0.02em', color: 'var(--fg)'}}>Staff Directory</h2>
          <div style={{color: 'var(--fg-dim)', marginTop: '6px', fontSize: '14px', fontWeight: 500}}>{staff.length} active staff members</div>
        </div>
        <button className="btn-primary" onClick={() => setEditingStaff({ id: `staff_${Date.now()}`, name: '', thai_name: '', nickname: '', role_category: 'Coach', photo_url: '', personal_info: '', active: 1, dob: '', age: null })} style={{padding: '12px 24px', fontSize: '14px', fontWeight: 600}}>
          + Add Staff
        </button>
      </div>

      <div style={{
        background: 'var(--bg-2)',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '1px solid var(--line-soft)',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <svg viewBox="0 0 24 24" width="20" height="20" style={{color: 'var(--fg-mute)', flexShrink: 0}}>
          <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input 
          placeholder="Search staff by name, nickname, or role…" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--fg)',
            fontSize: '15px',
            fontFamily: 'inherit',
            outline: 'none',
            width: '100%'
          }}
        />
      </div>

      {(() => {
        const technical = filteredStaff.filter(s => getStaffSection(s.role_category) === 'Technical Team')
          .sort((a, b) => getRoleRank(a.role_category) - getRoleRank(b.role_category) || a.name.localeCompare(b.name));
        
        const support = filteredStaff.filter(s => getStaffSection(s.role_category) === 'Support Team')
          .sort((a, b) => getRoleRank(a.role_category) - getRoleRank(b.role_category) || a.name.localeCompare(b.name));

        const renderGrid = (title, items) => {
          if (items.length === 0) return null;
          const isTech = title === 'Technical Team';
          return (
            <div style={{marginBottom: '50px'}}>
              <h3 style={{
                fontFamily: 'var(--font-display)', 
                fontSize: '24px', 
                borderBottom: '1px solid var(--line-soft)', 
                paddingBottom: '12px', 
                marginBottom: '28px', 
                color: 'var(--fg)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{width: '4px', height: '24px', background: isTech ? 'var(--accent-blue, #3b82f6)' : 'var(--accent-orange, #f59e0b)', borderRadius: '2px'}}></span>
                {title} 
                <span style={{fontSize: '14px', color: 'var(--fg-dim)', fontWeight: 600, marginLeft: 'auto', background: 'var(--bg-3)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--line-soft)'}}>
                  {items.length} members
                </span>
              </h3>
              <div className="staff-grid" style={{
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                gap: '24px', 
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {items.map(s => (
                  <div 
                    key={s.id} 
                    className="staff-card" 
                    onClick={() => setEditingStaff(s)}
                    style={{
                      background: 'var(--bg-2)', 
                      borderRadius: '16px', 
                      padding: '24px 20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      cursor: 'pointer', 
                      border: '1px solid var(--line-soft)', 
                      width: '100%', 
                      boxSizing: 'border-box',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: isTech ? 'var(--accent-blue, #3b82f6)' : 'var(--accent-orange, #f59e0b)'
                    }}></div>
                    
                    <div style={{
                      position: 'relative',
                      borderRadius: '50%',
                      padding: '4px',
                      background: 'var(--bg-3)',
                      border: '1px solid var(--line-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}>
                      <window.PlayerPhoto playerId={s.id} name={s.name} size={80} fallbackUrl={s.photo_url} fallbackScale={s.photo_scale || 1} />
                    </div>

                    <h3 style={{
                      margin: '0 0 4px 0', 
                      fontSize: '18px', 
                      textAlign: 'center', 
                      fontWeight: 700, 
                      color: 'var(--fg)',
                      fontFamily: 'var(--font-body)'
                    }}>
                      {s.nickname || s.name}
                    </h3>
                    
                    {s.nickname && s.name && (
                      <div style={{
                        color: 'var(--fg-dim)', 
                        fontSize: '13px', 
                        marginBottom: '4px', 
                        textAlign: 'center',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 500
                      }}>
                        {s.name}
                      </div>
                    )}
                    
                    {s.thai_name && (
                      <div style={{
                        color: 'var(--fg-mute)', 
                        fontSize: '12px', 
                        marginBottom: (s.dob || s.age) ? '4px' : '16px', 
                        textAlign: 'center',
                        fontFamily: 'var(--font-body)'
                      }}>
                        {s.thai_name}
                      </div>
                    )}
                    
                    {(() => {
                      if (s.dob && s.dob.length >= 4 && !isNaN(window.ageFromDob(s.dob))) {
                        return (
                          <div style={{
                            color: 'var(--fg-dim)', 
                            fontSize: '12px', 
                            marginBottom: '16px', 
                            textAlign: 'center',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 500
                          }}>
                            {window.ageFromDob(s.dob)} yrs ({s.dob.split('-')[0]})
                          </div>
                        );
                      }
                      if (s.age) {
                        return (
                          <div style={{
                            color: 'var(--fg-dim)', 
                            fontSize: '12px', 
                            marginBottom: '16px', 
                            textAlign: 'center',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 500
                          }}>
                            {s.age} yrs
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    <div style={{
                      background: isTech ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                      padding: '5px 14px', 
                      borderRadius: '30px', 
                      fontSize: '12px', 
                      color: isTech ? 'var(--accent-blue, #3b82f6)' : 'var(--accent-orange, #f59e0b)', 
                      fontWeight: 700, 
                      marginTop: 'auto',
                      border: `1px solid ${isTech ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                    }}>
                      {s.role_category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        };

        if (filteredStaff.length === 0) {
          return <div style={{padding: 40, textAlign: 'center', color: 'var(--fg-dim)', background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--line-soft)'}}>No staff found</div>;
        }

        return (
          <>
            {renderGrid('Technical Team', technical)}
            {renderGrid('Support Team', support)}
          </>
        );
      })()}

      {editingStaff && (
        <div className="cd-form-modal" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 9999}}>
          <div style={{background: 'var(--bg-1)', padding: 30, borderRadius: 16, width: 600, maxWidth: '90%', border: '1px solid var(--line)', maxHeight: '90vh', overflowY: 'auto'}}>
            <h3 style={{marginTop:0, marginBottom: 20, fontSize: 24}}>{(!editingStaff.id || !staff.find(s => s.id === editingStaff.id)) ? 'Add Staff' : 'Edit Staff'}</h3>
            
            <div style={{display: 'flex', gap: 20, marginBottom: 20}}>
              {/* Left Column: Photo Preview / Upload */}
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15, width: 140}}>
                <image-slot
                  id={`photo-${editingStaff.id}`}
                  shape="circle"
                  src={editingStaff.photo_url || undefined}
                  placeholder="Drop photo"
                  style={{width: '120px', height: '120px', flexShrink: 0, border: '1px solid var(--line-soft)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}
                ></image-slot>
                <div style={{fontSize: 11, color: 'var(--fg-dim)', textAlign: 'center', lineHeight: 1.4}}>
                  Click to upload<br/>or double-click to crop
                </div>
              </div>

              {/* Right Column: Form Fields */}
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 15}}>
                <div>
                  <label style={{fontSize: 12, color: 'var(--fg-dim)', fontWeight: 600, display: 'block', marginBottom: 4}}>Photo URL</label>
                  <input
                    className="callup-search"
                    style={{width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-soft)'}}
                    placeholder="https://example.com/photo.jpg"
                    value={editingStaff.photo_url || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingStaff({...editingStaff, photo_url: val});
                      if (val.trim()) {
                        if (window.applyLogoFromUrl) {
                          window.applyLogoFromUrl(val.trim(), `photo-${editingStaff.id}`);
                        }
                      } else {
                        window._imageSlotSet?.(`photo-${editingStaff.id}`, null);
                      }
                    }}
                  />
                </div>
                
                <div>
                  <label style={{fontSize: 12, color: 'var(--fg-dim)', fontWeight: 600, display: 'block', marginBottom: 4}}>Name (English)</label>
                  <input className="callup-search" style={{width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-soft)'}} value={editingStaff.name} onChange={e => setEditingStaff({...editingStaff, name: e.target.value})} autoFocus />
                </div>
                
                <div style={{display: 'flex', gap: 15}}>
                  <div style={{flex: 3}}>
                    <label style={{fontSize: 12, color: 'var(--fg-dim)', fontWeight: 600, display: 'block', marginBottom: 4}}>Name (Thai)</label>
                    <input className="callup-search" style={{width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-soft)'}} value={editingStaff.thai_name||''} onChange={e => setEditingStaff({...editingStaff, thai_name: e.target.value})} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{fontSize: 12, color: 'var(--fg-dim)', fontWeight: 600, display: 'block', marginBottom: 4}}>Nickname</label>
                    <input className="callup-search" style={{width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-soft)'}} value={editingStaff.nickname||''} onChange={e => setEditingStaff({...editingStaff, nickname: e.target.value})} />
                  </div>
                </div>

                <div style={{display: 'flex', gap: 15}}>
                  <div style={{flex: 1}}>
                    <label style={{fontSize: 12, color: 'var(--fg-dim)', fontWeight: 600, display: 'block', marginBottom: 4}}>Category</label>
                    <select className="callup-search" style={{width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-soft)', padding: '10px 15px'}} value={editingStaff.role_category} onChange={e => setEditingStaff({...editingStaff, role_category: e.target.value})}>
                      <optgroup label="Technical & Tactical Team">
                        <option value="Head Coach">Head Coach</option>
                        <option value="Coach">Coach</option>
                        <option value="Goalkeeper Coach">Goalkeeper Coach</option>
                        <option value="Fitness Coach">Fitness Coach</option>
                        <option value="Analyst">Analyst</option>
                      </optgroup>
                      <optgroup label="Support & Medical Team">
                        <option value="Manager">Manager</option>
                        <option value="Team Coordinator">Team Coordinator</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Physio">Physio</option>
                        <option value="Masseuse">Masseuse</option>
                        <option value="Medical">Medical</option>
                        <option value="Kitman">Kitman</option>
                        <option value="Media Officer">Media Officer (MO)</option>
                        <option value="Photographer">Photographer</option>
                        <option value="Other">Other</option>
                      </optgroup>
                    </select>
                  </div>
                  <div style={{display: 'flex', alignItems: 'flex-end', paddingBottom: 10, flex: 1}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--fg)'}}>
                      <input type="checkbox" checked={editingStaff.active !== 0} onChange={e => setEditingStaff({...editingStaff, active: e.target.checked ? 1 : 0})} />
                      Active Staff
                    </label>
                  </div>
                </div>

                <div style={{display: 'flex', gap: 15}}>
                  <div style={{flex: 1}}>
                    <label style={{fontSize: 12, color: 'var(--fg-dim)', fontWeight: 600, display: 'block', marginBottom: 4}}>Date of Birth</label>
                    <input type="date" className="callup-search" style={{width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-soft)', padding: '9px 12px'}} value={editingStaff.dob || ''} onChange={e => {
                      const newDob = e.target.value;
                      let updatedAge = editingStaff.age;
                      if (newDob && newDob.length >= 4) {
                        const calculatedAge = window.ageFromDob(newDob);
                        if (!isNaN(calculatedAge)) {
                          updatedAge = calculatedAge;
                        }
                      }
                      setEditingStaff({...editingStaff, dob: newDob, age: updatedAge});
                    }} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{fontSize: 12, color: 'var(--fg-dim)', fontWeight: 600, display: 'block', marginBottom: 4}}>Age</label>
                    <input type="number" className="callup-search" style={{width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-soft)', padding: '9px 12px'}} value={editingStaff.age !== null && editingStaff.age !== undefined ? editingStaff.age : ''} onChange={e => {
                      const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                      setEditingStaff({...editingStaff, age: val});
                    }} />
                  </div>
                </div>

                <div>
                  <label style={{fontSize: 12, color: 'var(--fg-dim)', fontWeight: 600, display: 'block', marginBottom: 4}}>Personal Info / Bio</label>
                  <textarea className="callup-search" style={{width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-soft)', minHeight: 80, resize: 'vertical'}} value={editingStaff.personal_info||''} onChange={e => setEditingStaff({...editingStaff, personal_info: e.target.value})} />
                </div>
              </div>
            </div>

            {editingStaff.id && staff.find(s => s.id === editingStaff.id) && (
              <div style={{marginTop: 10, marginBottom: 20, padding: 15, background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--line-soft)'}}>
                <h4 style={{margin: '0 0 10px 0', fontSize: 14, color: 'var(--fg-dim)'}}>Camp History</h4>
                {camps.filter(c => (c.staffIds || []).includes(editingStaff.id)).length === 0 ? (
                  <div style={{color: 'var(--fg-dim)', fontSize: 13}}>No camps attended.</div>
                ) : (
                  <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                    {camps.filter(c => (c.staffIds || []).includes(editingStaff.id)).map(c => (
                      <div key={c.id} style={{background: 'var(--bg-1)', padding: '6px 12px', borderRadius: 20, fontSize: 12, border: '1px solid var(--line-soft)', color: 'var(--fg)'}}>
                        {c.name}
                        {c.staffRoles && c.staffRoles[editingStaff.id] && <span style={{color: 'var(--accent)', marginLeft: 6, fontWeight: 600}}>• {c.staffRoles[editingStaff.id]}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div style={{display:'flex', justifyContent:'space-between', marginTop: 10}}>
              <div style={{display: 'flex', gap: 10}}>
                <button className="btn-primary" onClick={() => handleSave(editingStaff)}>Save Staff</button>
                <button className="btn-ghost" onClick={() => setEditingStaff(null)}>Cancel</button>
              </div>
              {editingStaff.id && staff.find(s => s.id === editingStaff.id) && (
                <button className="btn-danger" onClick={() => handleDelete(editingStaff.id)}>Delete</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.StaffDirectory = StaffDirectory;
