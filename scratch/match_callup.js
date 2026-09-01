const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('tmp_players.json')).players;

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

console.log(`Total input players: ${callupNames.length}`);

callupNames.forEach((n, idx) => {
  const cleanName = n.replace(/[^ก-ฮะ-์\s]/g, '').trim();
  const match = raw.find(p => {
    if (!p.thaiName) return false;
    const t = p.thaiName.replace(/[^ก-ฮะ-์\s]/g, '').trim();
    // Direct match or partial match on first or last name
    if (t === cleanName) return true;
    const partsIn = cleanName.split(' ');
    const partsDb = t.split(' ');
    if (partsIn[0] && partsDb[0] && partsIn[0] === partsDb[0]) return true;
    if (partsIn[1] && partsDb[1] && partsIn[1] === partsDb[1]) return true;
    return false;
  });

  if (match) {
    console.log(`${idx + 1}. ${n} -> MATCHED: [${match.id}] ${match.nick || match.name} (${match.thaiName})`);
  } else {
    console.log(`${idx + 1}. ${n} -> NOT FOUND IN TMP_PLAYERS`);
  }
});
