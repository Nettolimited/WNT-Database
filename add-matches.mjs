// Add SEA Games 2025 + FIFA Series 2026 matches
const API = 'https://thailand-wnt-database.pages.dev';

const NEW_MATCHES = [
  // ── SEA Games 2025 (Dec, Chonburi) ──────────────────────────────
  { id:'m_seag_id1', opponent:'Indonesia',    competition:'SEA Games', matchDate:'2025-12-04', homeScore:8,  awayScore:0, teamLevel:'Senior', notes:'Group stage' },
  { id:'m_seag_sg',  opponent:'Singapore',    competition:'SEA Games', matchDate:'2025-12-10', homeScore:2,  awayScore:0, teamLevel:'Senior', notes:'Group stage' },
  { id:'m_seag_ph',  opponent:'Philippines',  competition:'SEA Games', matchDate:'2025-12-14', homeScore:1,  awayScore:1, teamLevel:'Senior', notes:'Semi-final · lost 2-4 on penalties' },
  { id:'m_seag_id2', opponent:'Indonesia',    competition:'SEA Games', matchDate:'2025-12-17', homeScore:2,  awayScore:0, teamLevel:'Senior', notes:'Bronze medal match' },

  // ── FIFA Series 2026 (Apr, Ratchaburi) ──────────────────────────
  { id:'m_fifa_nc',  opponent:'New Caledonia', competition:'FIFA Series', matchDate:'2026-04-12', homeScore:4,  awayScore:0, teamLevel:'Senior', notes:'Semi-final' },
  { id:'m_fifa_cd',  opponent:'DR Congo',      competition:'FIFA Series', matchDate:'2026-04-15', homeScore:2,  awayScore:0, teamLevel:'Senior', notes:'Final' },
];

let ok = 0;
for (const m of NEW_MATCHES) {
  const r = await fetch(`${API}/api/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...m, lineup: [] }),
  });
  const d = await r.json();
  console.log(`${r.ok ? '✅' : '❌'} ${m.opponent} (${m.matchDate}) ${m.homeScore}–${m.awayScore}  | ${JSON.stringify(d)}`);
  if (r.ok) ok++;
}

console.log(`\nAdded ${ok}/${NEW_MATCHES.length} matches`);
