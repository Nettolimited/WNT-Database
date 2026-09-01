const { execSync } = require('child_process');
const fs = require('fs');

console.log("Fetching all players from remote D1...");
const output = execSync(`npx wrangler d1 execute twnt-players --remote --command="SELECT id, nick, name, thai_name, pos, team, club, shirt FROM players;"`, { encoding: 'utf8' });

// Extract JSON result from wrangler output
const jsonStart = output.indexOf('[');
const jsonEnd = output.lastIndexOf(']') + 1;
const parsed = JSON.parse(output.substring(jsonStart, jsonEnd));
const d1Players = parsed[0].results;

console.log(`Loaded ${d1Players.length} players from remote D1.`);

const callupNames = [
  "อาทิมา บุญประกันภัย",
  "ชลธิชา ปัญญารุ้ง",
  "นาตาชา หยวนเสงี่ยม",
  "กัญญานี ถวิลวงษ์",
  "ณัชชา แก้วอันตา",
  "ธวันรัตน์ พรมทองมี",
  "ปลื้มใจ สนธิสวัสดิ์",
  "พัชราภรณ์ คูเชื้อ",
  "ริญญาภัทร มูลดง",
  "วรัญญา แว่นกสิกรรม",
  "สุภาพร อินทร์ประสิทธิ์",
  "ชัชวัลย์ รอดทอง",
  "ภิญญาพัชญ์ กลิ่นคล้าย",
  "กาญจนธัช พุ่มศรี",
  "ปาริชาติ ทองรอง",
  "สกุลการต์ ชุมภูแสง",
  "รสิตา เถาว์เบา",
  "อลิษา รักพินิจ",
  "น้ำทิพย์ แหวนวิเศษ",
  "พรธิตา สุทธิสาร",
  "มานิตา น้อยเวช",
  "ปรีชากรณ์ เครือชื่นชม",
  "อชิรญา ยิ่งสกุล",
  "น้ำทิพย์ แหวนทองคำ",
  "ธณีกานต์ แดงดา",
  "สุนิสา สุขศรี",
  "เกศศิรินทร์ มาตุ่น"
];

const results = [];

callupNames.forEach((n, idx) => {
  const cleanName = n.replace(/[^ก-ฮะ-์\s]/g, '').trim();
  let match = d1Players.find(p => {
    if (!p.thai_name) return false;
    const t = p.thai_name.replace(/[^ก-ฮะ-์\s]/g, '').trim();
    if (t === cleanName) return true;
    const partsIn = cleanName.split(' ');
    const partsDb = t.split(' ');
    if (partsIn[0] && partsDb[0] && partsIn[0] === partsDb[0]) return true;
    if (partsIn[1] && partsDb[1] && partsIn[1] === partsDb[1]) return true;
    return false;
  });

  // Manual fallback checks for known variations
  if (!match) {
    if (n.includes("วรัญญา แว่นกสิกรรม") || n.includes("วิรัญญา")) {
      match = d1Players.find(p => p.id === 'p21');
    } else if (n.includes("สุนิสา สุขศรี")) {
      match = d1Players.find(p => p.id === 'p05');
    } else if (n.includes("รสิตา เถาว์เบา")) {
      match = d1Players.find(p => p.id === 'p27');
    }
  }

  results.push({
    index: idx + 1,
    inputName: n,
    matched: !!match,
    player: match || null
  });
});

console.log("\n=== MATCHING RESULTS ===");
results.forEach(r => {
  if (r.matched) {
    console.log(`${r.index}. ${r.inputName} -> MATCHED: [${r.player.id}] ${r.player.nick || r.player.name} (${r.player.thai_name}) | Pos: ${r.player.pos}`);
  } else {
    console.log(`${r.index}. ${r.inputName} -> MISSING IN D1`);
  }
});
