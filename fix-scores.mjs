// Fix match dates and scores from Wikipedia / Sofascore data
const API = 'https://thailand-wnt-database.pages.dev';

// homeScore = Thailand goals, awayScore = Opponent goals
const UPDATES = [
  // ── Pink Ladies Cup (Feb 2025, Uzbekistan) ──────────────────────
  { id:'m_ru',   matchDate:'2025-02-20', homeScore:1,  awayScore:3,  notes:'' },           // Russia 3–1 Thailand
  { id:'m_kr',   matchDate:'2025-02-23', homeScore:0,  awayScore:4,  notes:'' },           // Thailand 0–4 South Korea
  { id:'m_uz',   matchDate:'2025-02-26', homeScore:0,  awayScore:0,  notes:'' },           // Uzbekistan 0–0 Thailand

  // ── Yongchuan International Tournament (Apr 2025, China) ────────
  { id:'m_zm',   matchDate:'2025-04-05', homeScore:3,  awayScore:2,  notes:'' },           // Zambia 2–3 Thailand
  { id:'m_cn',   matchDate:'2025-04-08', homeScore:1,  awayScore:5,  notes:'' },           // China 5–1 Thailand

  // ── Friendly (Jun 2025) ─────────────────────────────────────────
  { id:'m_np',   matchDate:'2025-06-02', homeScore:2,  awayScore:0,  notes:'' },           // Thailand 2–0 Nepal

  // ── AFC Women's Asian Cup Qualification (Jun–Jul 2025) ──────────
  { id:'m_tl',   matchDate:'2025-06-26', homeScore:4,  awayScore:0,  notes:'' },           // Timor-Leste 0–4 Thailand
  { id:'m_iq',   matchDate:'2025-06-29', homeScore:7,  awayScore:0,  notes:'' },           // Thailand 7–0 Iraq
  { id:'m_mn',   matchDate:'2025-07-02', homeScore:11, awayScore:0,  notes:'' },           // Mongolia 0–11 Thailand
  { id:'m_in',   matchDate:'2025-07-05', homeScore:1,  awayScore:2,  notes:'' },           // Thailand 1–2 India

  // ── ASEAN Women's Championship (Aug 2025) ───────────────────────
  { id:'m_id',   matchDate:'2025-08-06', homeScore:7,  awayScore:0,  notes:'' },           // Thailand 7–0 Indonesia (Group)
  { id:'m_kh',   matchDate:'2025-08-09', homeScore:7,  awayScore:0,  notes:'' },           // Cambodia 0–7 Thailand (Group)
  { id:'m_vn',   matchDate:'2025-08-12', homeScore:0,  awayScore:1,  notes:'' },           // Vietnam 1–0 Thailand (Group)
  { id:'m_mm',   matchDate:'2025-08-16', homeScore:1,  awayScore:2,  notes:'Semi-final' }, // Myanmar 2–1 Thailand (SF)
  { id:'m_vn3p', matchDate:'2025-08-19', homeScore:1,  awayScore:3,  notes:'3rd place match' }, // Thailand 1–3 Vietnam (3rd)

  // ── Friendlies vs Bangladesh (Oct 2025) ─────────────────────────
  { id:'m_bd1',  matchDate:'2025-10-24', homeScore:3,  awayScore:0,  notes:'1st match' },  // Thailand 3–0 Bangladesh
  { id:'m_bd2',  matchDate:'2025-10-27', homeScore:5,  awayScore:1,  notes:'2nd match' },  // Thailand 5–1 Bangladesh
];

// Fetch existing matches to merge (preserve lineup & competition)
const existing = await (await fetch(`${API}/api/matches`)).json();
const matchMap = new Map(existing.matches.map(m => [m.id, m]));

let ok = 0;
for (const u of UPDATES) {
  const m = matchMap.get(u.id);
  if (!m) { console.log(`❌ ${u.id} not found`); continue; }

  const body = {
    opponent:    m.opponent,
    competition: m.competition,
    matchDate:   u.matchDate,
    homeScore:   u.homeScore,
    awayScore:   u.awayScore,
    teamLevel:   m.team_level ?? 'Senior',
    lineup:      m.lineup ?? [],
    notes:       u.notes,
  };

  const r = await fetch(`${API}/api/matches/${u.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const label = `${m.opponent} (${u.matchDate})  ${u.homeScore}–${u.awayScore}`;
  console.log(`${r.ok ? '✅' : '❌'} ${label}`);
  if (r.ok) ok++;
}

console.log(`\nUpdated ${ok}/${UPDATES.length} matches`);
