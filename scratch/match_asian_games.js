const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('tmp_players.json')).players;
console.log(`Loaded ${raw.length} players from tmp_players.json.`);

const namesList = [
  "กัญญาณัฐ เชษฐบุตร",
  "ขวัญจิรา งอกวงค์",
  "ทิชานันท์ สดชื่น",
  "พรพิรุณ พิลาวัน",
  "อรพินท์ แหวนเงิน",
  "อุไรพร ยงกุล",
  "ธนีกานต์ แดงดา",
  "มานิตา น้อยเวช",
  "ณัฐชา แก้วอันตา",
  "ปลื้มใจ สนธิสวัสดิ์",
  "วิรัญญา แกว่นกสิกรรม",
  "สุภาพร อินทรประสิทธิ์",
  "ชัชวัลย์ รอดทอง",
  "จณิสตา จินันทุยา",
  "กาญจนธัช พุ่มศรี",
  "ชลธิชา ปัญญารุ้ง",
  "อลิษา รักพินิจ",
  "โชติมณี ทองมงคล",
  "พิสมัย สอนไสย์",
  "เสาวลักษณ์ เพ็งงาม",
  "กฤติยา มูลรัง",
  "จิดาภา พารา",
  "แสงรวี มีขำ",
  "ริญญาภัทร์ มูลดง",
  "ธวันรัตน์ พรมทองมี",
  "อชิรญา ยิ่งสกุล"
];

const matchedIds = [];
const missing = [];

namesList.forEach((n, idx) => {
  const cleanName = n.replace(/[^ก-ฮะ-์\s]/g, '').trim();
  let match = raw.find(p => {
    if (!p.thaiName) return false;
    const t = p.thaiName.replace(/[^ก-ฮะ-์\s]/g, '').trim();
    if (t === cleanName) return true;
    const partsIn = cleanName.split(' ');
    const partsDb = t.split(' ');
    if (partsIn[0] && partsDb[0] && partsIn[0] === partsDb[0]) return true;
    if (partsIn[1] && partsDb[1] && partsIn[1] === partsDb[1]) return true;
    return false;
  });

  if (match) {
    console.log(`${idx + 1}. ${n} -> MATCHED [${match.id}] ${match.nick || match.name} (${match.thaiName})`);
    matchedIds.push(match.id);
  } else {
    console.log(`${idx + 1}. ${n} -> NOT FOUND!`);
    missing.push({ idx: idx + 1, name: n });
  }
});

console.log(`\nMatched: ${matchedIds.length} / ${namesList.length}`);
console.log("Missing players:", missing);
console.log("Matched IDs JSON:", JSON.stringify(matchedIds));
