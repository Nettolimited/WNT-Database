const { execSync } = require('child_process');
const fs = require('fs');

// 1. Define new players to add
const newPlayers = [
  {
    id: "p903",
    nick: "Artima",
    name: "ARTIMA BOONPRAKANPHAI",
    thai_name: "อาทิมา บุญประกันภัย",
    pos: "GK",
    team: "Senior",
    club: "",
    shirt: 0
  },
  {
    id: "p904",
    nick: "Natasha",
    name: "NATASHA YUANSANGIAM",
    thai_name: "นาตาชา หยวนเสงี่ยม",
    pos: "CB",
    team: "Senior",
    club: "",
    shirt: 0
  },
  {
    id: "p905",
    nick: "Phatcharaporn",
    name: "PHATCHARAPORN KOOCHUEA",
    thai_name: "พัชราภรณ์ คูเชื้อ",
    pos: "CM",
    team: "Senior",
    club: "",
    shirt: 0
  },
  {
    id: "p906",
    nick: "Namthip W.",
    name: "NAMTHIP WAENWISET",
    thai_name: "น้ำทิพย์ แหวนวิเศษ",
    pos: "ST",
    team: "Senior",
    club: "",
    shirt: 0
  },
  {
    id: "p907",
    nick: "Pornthita",
    name: "PORNTHITA SUTTHISAN",
    thai_name: "พรธิตา สุทธิสาร",
    pos: "LB",
    team: "Senior",
    club: "",
    shirt: 0
  },
  {
    id: "p908",
    nick: "Manita",
    name: "MANITA NOIWECH",
    thai_name: "มานิตา น้อยเวช",
    pos: "RW",
    team: "Senior",
    club: "",
    shirt: 0
  },
  {
    id: "p909",
    nick: "Namthip T.",
    name: "NAMTHIP WAENTHONGKHAM",
    thai_name: "น้ำทิพย์ แหวนทองคำ",
    pos: "LW",
    team: "Senior",
    club: "",
    shirt: 0
  },
  {
    id: "p910",
    nick: "Ketsirin",
    name: "KETSIRIN MATUN",
    thai_name: "เกศศิรินทร์ มาตุ่น",
    pos: "RB",
    team: "Senior",
    club: "",
    shirt: 0
  }
];

// The full list of 27 player IDs in exact order
const callupPlayerIds = [
  "p903",        // 1. อาทิมา บุญประกันภัย
  "p18",         // 2. ชลธิชา ปัญญารุ้ง
  "p904",        // 3. นาตาชา หยวนเสงี่ยม
  "p_kanyanee",  // 4. กัญญานี ถวิลวงษ์
  "p04",         // 5. ณัชชา แก้วอันตา
  "p70",         // 6. ธวันรัตน์ พรมทองมี
  "p24",         // 7. ปลื้มใจ สนธิสวัสดิ์
  "p905",        // 8. พัชราภรณ์ คูเชื้อ
  "p76",         // 9. ริญญาภัทร มูลดง
  "p21",         // 10. วรัญญา แว่นกสิกรรม (วิรัญญา)
  "p17",         // 11. สุภาพร อินทร์ประสิทธิ์
  "p35",         // 12. ชัชวัลย์ รอดทอง
  "p53",         // 13. ภิญญาพัชญ์ กลิ่นคล้าย
  "p42",         // 14. กาญจนธัช พุ่มศรี
  "p55",         // 15. ปาริชาติ ทองรอง
  "p67",         // 16. สกุลการต์ ชุมภูแสง
  "p27",         // 17. รสิตา เถาว์เบา
  "p46",         // 18. อลิษา รักพินิจ
  "p906",        // 19. น้ำทิพย์ แหวนวิเศษ
  "p907",        // 20. พรธิตา สุทธิสาร
  "p908",        // 21. มานิตา น้อยเวช
  "p901",        // 22. ปรีชากรณ์ เครือชื่นชม
  "p16",         // 23. อชิรญา ยิ่งสกุล
  "p909",        // 24. น้ำทิพย์ แหวนทองคำ
  "p28",         // 25. ธณีกานต์ แดงดา
  "p05",         // 26. สุนิสา สุขศรี
  "p910"         // 27. เกศศิรินทร์ มาตุ่น
];

console.log("Adding new players to D1...");

for (const p of newPlayers) {
  const sql = `INSERT INTO players (id, nick, name, thai_name, pos, team, club, shirt, active)
               VALUES ('${p.id}', '${p.nick}', '${p.name}', '${p.thai_name}', '${p.pos}', '${p.team}', '${p.club}', ${p.shirt}, 1)
               ON CONFLICT(id) DO UPDATE SET nick='${p.nick}', thai_name='${p.thai_name}';`;

  execSync(`npx wrangler d1 execute twnt-players --local --command="${sql.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
  execSync(`npx wrangler d1 execute twnt-players --remote --command="${sql.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
  console.log(`Inserted/Updated ${p.id} - ${p.nick} (${p.thai_name})`);
}

// Update camp_1785133747969 with player IDs
const playerIdsJson = JSON.stringify(callupPlayerIds).replace(/'/g, "''");
const campSql = `UPDATE camps 
                 SET player_ids = '${playerIdsJson}', 
                     name = 'Training Camp (3-10 Aug 2026)',
                     camp_date = '2026-08-03',
                     camp_date_end = '2026-08-10'
                 WHERE id = 'camp_1785133747969';`;

console.log("Updating Camp player list in local and remote D1...");
execSync(`npx wrangler d1 execute twnt-players --local --command="${campSql.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
execSync(`npx wrangler d1 execute twnt-players --remote --command="${campSql.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });

console.log("Successfully updated D1 Database!");

// Update tmp_players.json
const rawTmp = JSON.parse(fs.readFileSync('tmp_players.json'));
for (const p of newPlayers) {
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
    club: p.club,
    shirt: p.shirt,
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
console.log("Updated tmp_players.json!");
