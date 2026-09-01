const { execSync } = require('child_process');
const fs = require('fs');

const sqlStatements = [
  // 1. New Players
  `INSERT INTO players (id, nick, name, thai_name, pos, team, club, shirt, active) VALUES ('p903', 'Artima', 'ARTIMA BOONPRAKANPHAI', 'อาทิมา บุญประกันภัย', 'GK', 'Senior', '', 0, 1) ON CONFLICT(id) DO UPDATE SET nick='Artima', thai_name='อาทิมา บุญประกันภัย';`,
  `INSERT INTO players (id, nick, name, thai_name, pos, team, club, shirt, active) VALUES ('p904', 'Natasha', 'NATASHA YUANSANGIAM', 'นาตาชา หยวนเสงี่ยม', 'CB', 'Senior', '', 0, 1) ON CONFLICT(id) DO UPDATE SET nick='Natasha', thai_name='นาตาชา หยวนเสงี่ยม';`,
  `INSERT INTO players (id, nick, name, thai_name, pos, team, club, shirt, active) VALUES ('p905', 'Phatcharaporn', 'PHATCHARAPORN KOOCHUEA', 'พัชราภรณ์ คูเชื้อ', 'CM', 'Senior', '', 0, 1) ON CONFLICT(id) DO UPDATE SET nick='Phatcharaporn', thai_name='พัชราภรณ์ คูเชื้อ';`,
  `INSERT INTO players (id, nick, name, thai_name, pos, team, club, shirt, active) VALUES ('p906', 'Namthip W.', 'NAMTHIP WAENWISET', 'น้ำทิพย์ แหวนวิเศษ', 'ST', 'Senior', '', 0, 1) ON CONFLICT(id) DO UPDATE SET nick='Namthip W.', thai_name='น้ำทิพย์ แหวนวิเศษ';`,
  `INSERT INTO players (id, nick, name, thai_name, pos, team, club, shirt, active) VALUES ('p907', 'Pornthita', 'PORNTHITA SUTTHISAN', 'พรธิตา สุทธิสาร', 'LB', 'Senior', '', 0, 1) ON CONFLICT(id) DO UPDATE SET nick='Pornthita', thai_name='พรธิตา สุทธิสาร';`,
  `INSERT INTO players (id, nick, name, thai_name, pos, team, club, shirt, active) VALUES ('p908', 'Manita', 'MANITA NOIWECH', 'มานิตา น้อยเวช', 'RW', 'Senior', '', 0, 1) ON CONFLICT(id) DO UPDATE SET nick='Manita', thai_name='มานิตา น้อยเวช';`,
  `INSERT INTO players (id, nick, name, thai_name, pos, team, club, shirt, active) VALUES ('p909', 'Namthip T.', 'NAMTHIP WAENTHONGKHAM', 'น้ำทิพย์ แหวนทองคำ', 'LW', 'Senior', '', 0, 1) ON CONFLICT(id) DO UPDATE SET nick='Namthip T.', thai_name='น้ำทิพย์ แหวนทองคำ';`,
  `INSERT INTO players (id, nick, name, thai_name, pos, team, club, shirt, active) VALUES ('p910', 'Ketsirin', 'KETSIRIN MATUN', 'เกศศิรินทร์ มาตุ่น', 'RB', 'Senior', '', 0, 1) ON CONFLICT(id) DO UPDATE SET nick='Ketsirin', thai_name='เกศศิรินทร์ มาตุ่น';`,

  // 2. Camp Update
  `UPDATE camps SET player_ids = '["p903","p18","p904","p_kanyanee","p04","p70","p24","p905","p76","p21","p17","p35","p53","p42","p55","p67","p27","p46","p906","p907","p908","p901","p16","p909","p28","p05","p910"]', name = 'Training Camp (3-10 Aug 2026)', camp_date = '2026-08-03', camp_date_end = '2026-08-10', team_level = 'Senior' WHERE id = 'camp_1785133747969';`
];

const batchSql = sqlStatements.join('\n');
fs.writeFileSync('scratch/batch_update.sql', batchSql);
console.log("Wrote scratch/batch_update.sql");

console.log("Executing batch SQL on local D1...");
execSync(`npx wrangler d1 execute twnt-players --local --file=scratch/batch_update.sql`, { encoding: 'utf8' });

console.log("Executing batch SQL on remote D1...");
execSync(`npx wrangler d1 execute twnt-players --remote --file=scratch/batch_update.sql`, { encoding: 'utf8' });

console.log("Batch update executed successfully!");

// Update tmp_players.json
const rawTmp = JSON.parse(fs.readFileSync('tmp_players.json'));
const newPlayersData = [
  { id: "p903", nick: "Artima", name: "ARTIMA BOONPRAKANPHAI", thai_name: "อาทิมา บุญประกันภัย", pos: "GK" },
  { id: "p904", nick: "Natasha", name: "NATASHA YUANSANGIAM", thai_name: "นาตาชา หยวนเสงี่ยม", pos: "CB" },
  { id: "p905", nick: "Phatcharaporn", name: "PHATCHARAPORN KOOCHUEA", thai_name: "พัชราภรณ์ คูเชื้อ", pos: "CM" },
  { id: "p906", nick: "Namthip W.", name: "NAMTHIP WAENWISET", thai_name: "น้ำทิพย์ แหวนวิเศษ", pos: "ST" },
  { id: "p907", nick: "Pornthita", name: "PORNTHITA SUTTHISAN", thai_name: "พรธิตา สุทธิสาร", pos: "LB" },
  { id: "p908", nick: "Manita", name: "MANITA NOIWECH", thai_name: "มานิตา น้อยเวช", pos: "RW" },
  { id: "p909", nick: "Namthip T.", name: "NAMTHIP WAENTHONGKHAM", thai_name: "น้ำทิพย์ แหวนทองคำ", pos: "LW" },
  { id: "p910", nick: "Ketsirin", name: "KETSIRIN MATUN", thai_name: "เกศศิรินทร์ มาตุ่น", pos: "RB" }
];

for (const p of newPlayersData) {
  const existingIndex = rawTmp.players.findIndex(x => x.id === p.id);
  const playerObj = {
    id: p.id,
    active: true,
    nick: p.nick,
    name: p.name,
    thaiName: p.thai_name,
    pos: p.pos,
    altPos: [],
    dob: "2002-01-01",
    foot: "R",
    height: 165,
    team: "Senior",
    club: "",
    shirt: 0,
    caps: 0,
    intGoals: 0,
    stats: { apps:0, goals:0, assists:0, yellows:0, reds:0, minutes:0 },
    intStats: { apps:0, goals:0, assists:0, yellows:0, reds:0, minutes:0 },
    radar: { pace:10, shooting:10, passing:10, dribbling:10, defending:10, physical:10 },
    career: [],
    photoKey: null,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    rawTmp.players[existingIndex] = playerObj;
  } else {
    rawTmp.players.push(playerObj);
  }
}

fs.writeFileSync('tmp_players.json', JSON.stringify(rawTmp, null, 2));
console.log("Updated tmp_players.json successfully!");
