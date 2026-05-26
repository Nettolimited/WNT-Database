// Import 2025 Thailand WNT match data from CSV files
import { readFileSync } from 'fs';

const API = 'https://thailand-wnt-database.pages.dev';

// ── Match definitions (chronological order) ────────────────────────
const MATCHES = [
  { id:'m_ru',   opponent:'Russia',         competition:'Friendly', matchDate:'2025-02-01' },
  { id:'m_zm',   opponent:'Zambia',          competition:'Friendly', matchDate:'2025-04-01' },
  { id:'m_cn',   opponent:'China',           competition:'Friendly', matchDate:'2025-04-01' },
  { id:'m_np',   opponent:'Nepal',           competition:'Friendly', matchDate:'2025-05-01' },
  { id:'m_uz',   opponent:'Uzbekistan',      competition:'Friendly', matchDate:'2025-06-01' },
  { id:'m_kr',   opponent:'South Korea',     competition:'Friendly', matchDate:'2025-06-01' },
  { id:'m_bd1',  opponent:'Bangladesh',      competition:'Friendly', matchDate:'2025-07-01', notes:'1st match' },
  { id:'m_bd2',  opponent:'Bangladesh',      competition:'Friendly', matchDate:'2025-07-02', notes:'2nd match' },
  { id:'m_in',   opponent:'India',           competition:'AFC',      matchDate:'2025-08-01' },
  { id:'m_mn',   opponent:'Mongolia',        competition:'AFC',      matchDate:'2025-08-01' },
  { id:'m_iq',   opponent:'Iraq',            competition:'AFC',      matchDate:'2025-08-01' },
  { id:'m_tl',   opponent:'Timor-Leste',    competition:'AFC',      matchDate:'2025-08-01' },
  { id:'m_vn',   opponent:'Vietnam',         competition:'AFF',      matchDate:'2025-10-01' },
  { id:'m_mm',   opponent:'Myanmar',         competition:'AFF',      matchDate:'2025-10-01' },
  { id:'m_kh',   opponent:'Cambodia',        competition:'AFF',      matchDate:'2025-10-01' },
  { id:'m_id',   opponent:'Indonesia',       competition:'AFF',      matchDate:'2025-10-01' },
  { id:'m_vn3p', opponent:'Vietnam',         competition:'AFF',      matchDate:'2025-10-31', notes:'3rd place match' },
];

// MNP column index → match id (columns start at 4)
const MNP_COLS = [
  [4,'m_bd2'],[5,'m_bd1'],[6,'m_vn3p'],[7,'m_mm'],[8,'m_vn'],[9,'m_kh'],
  [10,'m_id'],[11,'m_in'],[12,'m_mn'],[13,'m_iq'],[14,'m_tl'],[15,'m_np'],
  [16,'m_cn'],[17,'m_zm'],[18,'m_uz'],[19,'m_kr'],[20,'m_ru'],
];

// Goal column index → match id (columns start at 3)
const GOAL_COLS = [
  [3,'m_bd2'],[4,'m_bd1'],[5,'m_vn3p'],[6,'m_mm'],[7,'m_vn'],[8,'m_kh'],
  [9,'m_id'],[10,'m_in'],[11,'m_mn'],[12,'m_iq'],[13,'m_tl'],[14,'m_np'],
  [15,'m_cn'],[16,'m_zm'],[17,'m_ru'],
  // Uzbekistan & South Korea have no goals column
];

// ── CSV parser (handles quoted fields) ─────────────────────────────
function parseCsv(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cols = []; let cur = ''; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i+1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else {
        if (c === ',') { cols.push(cur); cur = ''; }
        else if (c === '"') inQ = true;
        else cur += c;
      }
    }
    cols.push(cur);
    rows.push(cols);
  }
  return rows;
}

// ── Read CSVs (new format: col0=nick, col1=thaiName, col2=pos/total, col3+=matches)
const mnpRows  = parseCsv(readFileSync('C:/Users/NettoLimited/Downloads/Table 1-Minutes Played(1).csv', 'utf-8'));
const goalRows = parseCsv(readFileSync('C:/Users/NettoLimited/Downloads/Table 1-Goal(1).csv', 'utf-8'));

console.log(`MNP rows: ${mnpRows.length - 1} | Goal rows: ${goalRows.length - 1}`);

// ── Fetch DB players & build 3-tier lookup ─────────────────────────
const res     = await fetch(`${API}/api/players`);
const players = (await res.json()).players;

// 1st: Thai name (exact) — most unique, handles duplicate nicks like 3× Pleng
const thaiMap = new Map(players.filter(p => p.thaiName?.trim()).map(p => [p.thaiName.trim(), p.id]));
// 2nd: English name (case-insensitive)
const nameMap = new Map(players.map(p => [p.name?.trim().toLowerCase(), p.id]));
// 3rd: nick (case-insensitive)
const nickMap = new Map(players.filter(p => p.nick).map(p => [p.nick.trim().toLowerCase(), p.id]));

// Resolver: thaiName → name → nick
// Note: use thaiMap.get(csvThai) directly — empty string returns undefined, not ""
const resolve = (csvNick, csvThai) =>
  thaiMap.get(csvThai) ??
  nameMap.get(csvNick.toLowerCase()) ??
  nickMap.get(csvNick.toLowerCase());

console.log(`DB players: ${players.length} | thaiMap: ${thaiMap.size} | nickMap: ${nickMap.size}`);

// ── Delete all existing matches first ──────────────────────────────
console.log('\nDeleting existing matches…');
const existingRes = await fetch(`${API}/api/matches`);
const existingData = await existingRes.json();
for (const m of (existingData.matches || [])) {
  await fetch(`${API}/api/matches/${m.id}`, { method: 'DELETE' });
  process.stdout.write(`  ✕ deleted ${m.id}\n`);
}
console.log('Done.\n');

// ── Build per-match lineups ────────────────────────────────────────
// matchId → Map<playerId, {minutesPlayed, goals}>
const matchData = new Map(MATCHES.map(m => [m.id, new Map()]));

// Process MNP — iterate rows directly (avoids Map deduplication losing duplicate nicks)
const mnpMissed = [];
for (const row of mnpRows.slice(1)) {
  const csvNick = row[0]?.trim() || '';
  const csvThai = row[1]?.trim() || '';
  if (!csvNick) continue;
  const playerId = resolve(csvNick, csvThai);
  if (!playerId) { mnpMissed.push(csvNick + (csvThai ? ` (${csvThai})` : '')); continue; }
  for (const [col, matchId] of MNP_COLS) {
    const v = parseInt(row[col] || '', 10);
    if (!v) continue;
    const entry = matchData.get(matchId).get(playerId) || { minutesPlayed:0, goals:0 };
    entry.minutesPlayed = v;
    matchData.get(matchId).set(playerId, entry);
  }
}

// Process Goals — same approach
const goalMissed = [];
for (const row of goalRows.slice(1)) {
  const csvNick = row[0]?.trim() || '';
  const csvThai = row[1]?.trim() || '';
  if (!csvNick) continue;
  const playerId = resolve(csvNick, csvThai);
  if (!playerId) { goalMissed.push(csvNick + (csvThai ? ` (${csvThai})` : '')); continue; }
  for (const [col, matchId] of GOAL_COLS) {
    const v = parseInt(row[col] || '', 10);
    if (!v) continue;
    const entry = matchData.get(matchId).get(playerId) || { minutesPlayed:0, goals:0 };
    entry.goals = v;
    matchData.get(matchId).set(playerId, entry);
  }
}

if (mnpMissed.length)  console.log(`\n⚠️  MNP  unmatched (${mnpMissed.length}):`,  mnpMissed.join(', '));
if (goalMissed.length) console.log(`⚠️  Goal unmatched (${goalMissed.length}):`, goalMissed.join(', '));
if (!mnpMissed.length && !goalMissed.length) console.log('\n✅ All players matched!');

// ── POST matches to API ────────────────────────────────────────────
let mOk = 0;
for (const match of MATCHES) {
  const playersInMatch = [...matchData.get(match.id).entries()]
    .map(([playerId, d]) => ({ playerId, minutesPlayed: d.minutesPlayed, goals: d.goals, assists: 0, yellowCards: 0, redCard: false }));

  const r = await fetch(`${API}/api/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: match.id, opponent: match.opponent, competition: match.competition,
      matchDate: match.matchDate, homeScore: 0, awayScore: 0,
      teamLevel: 'Senior',
      lineup: playersInMatch,
      notes: match.notes || '',
    }),
  });
  const d = await r.json();
  console.log(`${r.ok ? '✅' : '❌'} ${match.opponent} (${match.competition}) — ${playersInMatch.length} players  | ${JSON.stringify(d)}`);
  if (r.ok) mOk++;
}

// ── Update player intStats from match data ─────────────────────────
// Aggregate per player across all matches
const playerAgg = new Map(); // playerId → {apps, goals, minutes}
for (const [matchId, lineupMap] of matchData) {
  for (const [playerId, d] of lineupMap) {
    const agg = playerAgg.get(playerId) || { apps:0, goals:0, minutes:0 };
    if (d.minutesPlayed > 0) agg.apps++;
    agg.goals   += d.goals;
    agg.minutes += d.minutesPlayed;
    playerAgg.set(playerId, agg);
  }
}

let pOk = 0;
for (const player of players) {
  const agg = playerAgg.get(player.id);
  if (!agg) continue; // no match data → leave as 0
  const bodyObj = {
    ...player,
    altPos:   player.altPos   ?? [],
    career:   player.career   ?? [],
    caps:     agg.apps,
    intGoals: agg.goals,
    intStats: { apps: agg.apps, goals: agg.goals, assists: 0, minutes: agg.minutes, yellows: 0, reds: 0 },
  };
  const bodyBytes = Buffer.from(JSON.stringify(bodyObj), 'utf-8');
  const r = await fetch(`${API}/api/players/${player.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: bodyBytes,
  });
  if (r.ok) { pOk++; console.log(`👤 ${player.nick} — caps:${agg.apps} goals:${agg.goals} min:${agg.minutes}`); }
}

console.log(`\n✅ Matches imported: ${mOk}/${MATCHES.length}`);
console.log(`✅ Players updated: ${pOk}`);
