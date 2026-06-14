const fs = require('fs');
const lines = fs.readFileSync('src/camp-dashboard.jsx', 'utf8').split('\n');

const beforeMinutes = lines.slice(0, 1503); // 0 to 1502
const minutesPlayed = lines.slice(1503, 1535); // 1503 to 1534 (includes the closing div at 1534)
const wellness = lines.slice(1535, 1582); // 1535 to 1581
const squadInfo = lines.slice(1582, 1691); // 1582 to 1690
const afterSquadInfo = lines.slice(1691); // 1691 to end

console.log('last line of beforeMinutes:', beforeMinutes[beforeMinutes.length-1]);
console.log('first line of minutesPlayed:', minutesPlayed[0]);
console.log('last line of minutesPlayed:', minutesPlayed[minutesPlayed.length-1]);
console.log('first line of wellness:', wellness[0]);
console.log('last line of wellness:', wellness[wellness.length-1]);
console.log('first line of squadInfo:', squadInfo[0]);
console.log('last line of squadInfo:', squadInfo[squadInfo.length-1]);
console.log('first line of afterSquadInfo:', afterSquadInfo[0]);

const newLines = [
  ...beforeMinutes,
  '          </div>', // closes Match Performance
  '',
  ...squadInfo,
  '          <div style={{marginBottom: 40}} className="cd-section-wrap">', // wrapper for Minutes Played
  ...minutesPlayed, // contains the closing div at the end
  ...wellness,
  ...afterSquadInfo
];

fs.writeFileSync('src/camp-dashboard.jsx', newLines.join('\n'));
console.log('Reordered successfully!');
