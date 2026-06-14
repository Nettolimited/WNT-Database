const fs = require('fs');
const content = fs.readFileSync('src/callup.jsx', 'utf8');

// 1. Update CallupPanel props to include matches
const updatedProps = content.replace(
  'function CallupPanel({ players, staff, camps, setCamps, onSelectPlayer, t }) {',
  'function CallupPanel({ players, staff, camps, setCamps, onSelectPlayer, matches, t }) {'
);

// 2. Add helpers right inside CallupPanel
const insertHelpers = `function CallupPanel({ players, staff, camps, setCamps, onSelectPlayer, matches, t }) {
  const getCampStatus = (s, e) => {
    const today = new Date().toISOString().split('T')[0];
    if (e && today > e) return { text: 'Completed', color: '#ef4444', dot: '🔴', bg: 'rgba(239, 68, 68, 0.1)' };
    if (s && today < s) return { text: 'Upcoming', color: '#f59e0b', dot: '🟡', bg: 'rgba(245, 158, 11, 0.1)' };
    return { text: 'Ongoing', color: '#10b981', dot: '🟢', bg: 'rgba(16, 185, 129, 0.1)' };
  };
  const getDuration = (s, e) => {
    if (!s || !e) return null;
    const diff = new Date(e) - new Date(s);
    return Math.max(1, Math.round(diff / 86400000) + 1);
  };`;

const withHelpers = updatedProps.replace(
  'function CallupPanel({ players, staff, camps, setCamps, onSelectPlayer, matches, t }) {',
  insertHelpers
);

// 3. Replace the card rendering logic
const newCardJSX = `
              ) : (
                <div key={camp.id} className="camp-card" onClick={() => setActive(camp.id)} 
                     style={{
                       background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--line-soft)', padding: 25, 
                       cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                       boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                       display: 'flex', flexDirection: 'column'
                     }}>
                  
                  {/* Decorative logos (Placeholders for Competition / Team Logo) */}
                  <div style={{position: 'absolute', top: 20, right: 20, opacity: 0.1, fontSize: 60, pointerEvents: 'none'}}>🇹🇭</div>

                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15}}>
                    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                      <div style={{background: 'var(--accent)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600}}>
                        {camp.team_level}
                      </div>
                      {(() => {
                        const st = getCampStatus(camp.camp_date, camp.camp_date_end);
                        return (
                          <div style={{background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4}}>
                            <span>{st.dot}</span> {st.text}
                          </div>
                        );
                      })()}
                    </div>
                    <div style={{display: 'flex', gap: 5}}>
                      <button className="icon-btn sm" title="Edit" onClick={e => { e.stopPropagation(); setEditingId(camp.id); }}>✎</button>
                      <button className="icon-btn sm" title="Delete" style={{color: 'var(--err)'}} onClick={e => deleteCamp(camp.id, e)}>✕</button>
                    </div>
                  </div>

                  <h3 style={{margin: '0 0 10px 0', fontSize: 22, fontFamily: 'var(--font-display)', lineHeight: 1.2}}>
                    {camp.name}
                  </h3>
                  
                  {camp.competition && (
                    <div style={{color: 'var(--fg)', fontWeight: 600, fontSize: 14, marginBottom: 10}}>🏆 {camp.competition}</div>
                  )}
                  
                  <div style={{color: 'var(--fg-dim)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 15, marginBottom: 15}}>
                    {fmtDateRange(camp.camp_date, camp.camp_date_end) && (
                      <span style={{display: 'flex', alignItems: 'center', gap: 5}}>📅 {fmtDateRange(camp.camp_date, camp.camp_date_end)}</span>
                    )}
                    {getDuration(camp.camp_date, camp.camp_date_end) && (
                      <span style={{display: 'flex', alignItems: 'center', gap: 5}}>⏱️ {getDuration(camp.camp_date, camp.camp_date_end)} Days</span>
                    )}
                  </div>
                  
                  {camp.description && (
                    <div style={{fontSize: 13, color: 'var(--fg-base)', marginBottom: 15, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic', background: 'var(--bg-1)', padding: 12, borderRadius: 8}}>
                      "{camp.description}"
                    </div>
                  )}

                  <div style={{flex: 1}}></div>
                  
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20}}>
                    <div style={{background: 'var(--bg-1)', padding: 12, borderRadius: 8}}>
                      <div style={{fontSize: 11, color: 'var(--fg-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4}}>Head Coach</div>
                      <div style={{fontSize: 14, fontWeight: 600, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {staff && staff.find(s => camp.staffRoles && camp.staffRoles[s.id] === 'Head Coach')?.name || 'Not assigned'}
                      </div>
                    </div>
                    <div style={{background: 'var(--bg-1)', padding: 12, borderRadius: 8}}>
                      <div style={{fontSize: 11, color: 'var(--fg-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4}}>Matches</div>
                      <div style={{fontSize: 14, fontWeight: 600, color: 'var(--fg)'}}>
                        ⚽️ {matches ? matches.filter(m => m.camp_id === camp.id).length : 0} Match(es)
                      </div>
                    </div>
                  </div>

                  <div style={{paddingTop: 15, borderTop: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{fontSize: 13, color: 'var(--fg-dim)', display: 'flex', gap: 12}}>
                      <div><strong style={{color: 'var(--fg)', fontSize: 16}}>{camp.playerIds?.length || 0}</strong> Players</div>
                      <div><strong style={{color: 'var(--fg)', fontSize: 16}}>{camp.staffIds?.length || 0}</strong> Staff</div>
                    </div>
                    <span style={{color: 'var(--accent)', fontSize: 14, fontWeight: 600}}>Enter Dashboard →</span>
                  </div>
                </div>
              )
            ))}
`;

const oldCardStart = ') : (';
const oldCardEnd = '            ))}';
const startIndex = withHelpers.indexOf(oldCardStart);
const endIndex = withHelpers.indexOf(oldCardEnd, startIndex) + oldCardEnd.length;

const finalContent = withHelpers.slice(0, startIndex) + newCardJSX.trim() + withHelpers.slice(endIndex);

fs.writeFileSync('src/callup.jsx', finalContent);
console.log('Replaced successfully');
