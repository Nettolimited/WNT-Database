// Run: node migrations/generate-seed.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '../src/data.jsx'), 'utf8');

// Replace the final window assignment so we can capture values in context
const cleaned = src.replace(
  /window\.TWNT_DATA\s*=[\s\S]*?;/,
  'module.exports = { CLUBS, PLAYERS };'
);

const ctx = vm.createContext({ module: { exports: {} }, require });
vm.runInContext(cleaned, ctx);
const { CLUBS, PLAYERS } = ctx.module.exports;

function q(s) { return (s == null ? '' : String(s)).replace(/'/g, "''"); }

let sql = '-- Auto-generated seed data\n\n';

for (const c of CLUBS) {
  sql += `INSERT OR IGNORE INTO clubs (code, name, color) VALUES ('${q(c.code)}', '${q(c.name)}', '${q(c.color)}');\n`;
}
sql += '\n';

for (const p of PLAYERS) {
  const altPos   = JSON.stringify(p.altPos   || []);
  const stats    = JSON.stringify(p.stats    || {apps:0,goals:0,assists:0,yellows:0,reds:0,minutes:0});
  const intStats = JSON.stringify(p.intStats || {apps:0,goals:0,assists:0,yellows:0,reds:0,minutes:0});
  const radar    = JSON.stringify(p.radar    || {pace:10,shooting:10,passing:10,dribbling:10,defending:10,physical:10});
  const career   = JSON.stringify(p.career   || []);

  sql += `INSERT OR IGNORE INTO players `
       + `(id, nick, name, thai_name, pos, alt_pos, dob, foot, height, team, club, shirt, caps, int_goals, stats, int_stats, radar, career) VALUES `
       + `('${q(p.id)}', '${q(p.nick)}', '${q(p.name)}', '${q(p.thaiName)}', '${q(p.pos)}', `
       + `'${q(altPos)}', '${q(p.dob)}', '${q(p.foot)}', ${p.height||165}, '${q(p.team)}', '${q(p.club)}', `
       + `${p.shirt||0}, ${p.caps||0}, ${p.intGoals||0}, `
       + `'${q(stats)}', '${q(intStats)}', '${q(radar)}', '${q(career)}');\n`;
}

const outPath = path.join(__dirname, '002_seed.sql');
fs.writeFileSync(outPath, sql);
console.log(`Written ${CLUBS.length} clubs + ${PLAYERS.length} players → ${outPath}`);
