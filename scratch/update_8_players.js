const { execSync } = require('child_process');
const fs = require('fs');

const sqlStatements = [
  // 1. อาทิมา บุญประกันภัย (p903) -> nick: "อ้อม" (Aom), pos: "GK"
  `UPDATE players SET nick = 'Aom', pos = 'GK' WHERE id = 'p903';`,

  // 2. นาตาชา หยวนเสงี่ยม (p904) -> pos: "GK"
  `UPDATE players SET pos = 'GK' WHERE id = 'p904';`,

  // 3. พัชราภรณ์ คูเชื้อ (p905) -> nick: "มะนาว" (Manow), pos: "RW"
  `UPDATE players SET nick = 'Manow', pos = 'RW' WHERE id = 'p905';`,

  // 6. มานิตา น้อยเวช (p908) -> nick: "กาก้า" (Kaka), pos: "CB"
  `UPDATE players SET nick = 'Kaka', pos = 'CB' WHERE id = 'p908';`
];

const batchSql = sqlStatements.join('\n');
fs.writeFileSync('scratch/update_8_players.sql', batchSql);
console.log("Wrote scratch/update_8_players.sql");

console.log("Updating local D1...");
execSync(`npx wrangler d1 execute twnt-players --local --file=scratch/update_8_players.sql`, { encoding: 'utf8' });

console.log("Updating remote D1...");
execSync(`npx wrangler d1 execute twnt-players --remote --file=scratch/update_8_players.sql`, { encoding: 'utf8' });

console.log("Updated D1 databases successfully!");

// Update tmp_players.json
const rawTmp = JSON.parse(fs.readFileSync('tmp_players.json'));

const updateMap = {
  p903: { nick: "Aom", pos: "GK" },
  p904: { pos: "GK" },
  p905: { nick: "Manow", pos: "RW" },
  p908: { nick: "Kaka", pos: "CB" }
};

for (const p of rawTmp.players) {
  if (updateMap[p.id]) {
    Object.assign(p, updateMap[p.id]);
    p.updatedAt = new Date().toISOString();
  }
}

fs.writeFileSync('tmp_players.json', JSON.stringify(rawTmp, null, 2));
console.log("Updated tmp_players.json successfully!");
