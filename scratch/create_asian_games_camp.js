const { execSync } = require('child_process');
const fs = require('fs');

const playerIds26 = [
  "p32",          // 1. กัญญาณัฐ เชษฐบุตร
  "p902",         // 2. ขวัญจิรา งอกวงค์
  "p07",          // 3. ทิชานันท์ สดชื่น
  "p72",          // 4. พรพิรุณ พิลาวัน
  "p62",          // 5. อรพินท์ แหวนเงิน
  "p49",          // 6. อุไรพร ยงกุล
  "p28",          // 7. ธนีกานต์ แดงดา
  "p908",         // 8. มานิตา น้อยเวช
  "p04",          // 9. ณัฐชา แก้วอันตา
  "p24",          // 10. ปลื้มใจ สนธิสวัสดิ์
  "p21",          // 11. วิรัญญา แกว่นกสิกรรม
  "p17",          // 12. สุภาพร อินทรประสิทธิ์
  "p35",          // 13. ชัชวัลย์ รอดทอง
  "p06",          // 14. จณิสตา จินันทุยา
  "p42",          // 15. กาญจนธัช พุ่มศรี
  "p18",          // 16. ชลธิชา ปัญญารุ้ง
  "p46",          // 17. อลิษา รักพินิจ
  "p73",          // 18. โชติมณี ทองมงคล
  "p58",          // 19. พิสมัย สอนไสย์
  "p75",          // 20. เสาวลักษณ์ เพ็งงาม
  "p911",         // 21. กฤติยา มูลรัง (NEW)
  "p08",          // 22. จิดาภา พารา
  "p_saengrawee", // 23. แสงรวี มีขำ
  "p76",          // 24. ริญญาภัทร์ มูลดง
  "p70",          // 25. ธวันรัตน์ พรมทองมี
  "p16"           // 26. อชิรญา ยิ่งสกุล
];

console.log("Preparing SQL script...");

const playerIdsJson = JSON.stringify(playerIds26).replace(/'/g, "''");

const sqlStatements = [
  // 1. Add new player p911
  `INSERT INTO players (id, nick, name, thai_name, pos, team, club, shirt, active)
   VALUES ('p911', 'Krittiya', 'KRITTIYA MOOLRANG', 'กฤติยา มูลรัง', 'DF', 'Senior', '', 0, 1)
   ON CONFLICT(id) DO UPDATE SET nick='Krittiya', thai_name='กฤติยา มูลรัง';`,

  // 2. Insert or Update Asian Games 2026 Camp
  `INSERT INTO camps (id, name, camp_date, camp_date_end, competition, description, team_level, player_ids)
   VALUES ('camp_asiangames_2026', 'Asian Games 2026', '2026-09-19', '2026-10-04', 'Asian Games 2026 (Aichi-Nagoya)', 'Nagoya, Aichi, Japan', 'Senior', '${playerIdsJson}')
   ON CONFLICT(id) DO UPDATE SET 
     player_ids='${playerIdsJson}',
     name='Asian Games 2026',
     competition='Asian Games 2026 (Aichi-Nagoya)';`,

  // 3. Update existing camp if named Asian game 2026 or similar
  `UPDATE camps SET player_ids = '${playerIdsJson}' WHERE LOWER(name) LIKE '%asian%' OR LOWER(competition) LIKE '%asian%';`
];

const batchSql = sqlStatements.join('\n');
fs.writeFileSync('scratch/batch_asian_camp.sql', batchSql);
console.log("Wrote scratch/batch_asian_camp.sql");

console.log("Executing batch SQL on local D1...");
execSync(`npx wrangler d1 execute twnt-players --local --file=scratch/batch_asian_camp.sql`, { encoding: 'utf8' });

console.log("Executing batch SQL on remote D1...");
execSync(`npx wrangler d1 execute twnt-players --remote --file=scratch/batch_asian_camp.sql`, { encoding: 'utf8' });

console.log("D1 databases updated successfully!");

// Update tmp_players.json
const rawTmp = JSON.parse(fs.readFileSync('tmp_players.json'));
const newP911 = {
  id: "p911",
  active: true,
  nick: "Krittiya",
  name: "KRITTIYA MOOLRANG",
  thaiName: "กฤติยา มูลรัง",
  pos: "DF",
  altPos: [],
  dob: "2003-01-01",
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

const idxP911 = rawTmp.players.findIndex(p => p.id === 'p911');
if (idxP911 >= 0) {
  rawTmp.players[idxP911] = newP911;
} else {
  rawTmp.players.push(newP911);
}

fs.writeFileSync('tmp_players.json', JSON.stringify(rawTmp, null, 2));
console.log("Updated tmp_players.json successfully!");
