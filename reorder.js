const fs = require('fs');

const code = fs.readFileSync('src/camp-dashboard.jsx', 'utf8');
const lines = code.split('\n');

const before = lines.slice(0, 1580);
const highlight = lines.slice(1580, 1662);
const wellnessEnd = lines.slice(1662, 1663);
const squadInfo = lines.slice(1664, 1772);
const after = lines.slice(1772);

console.log('highlight length:', highlight.length);
console.log('squadInfo length:', squadInfo.length);
console.log('first line of highlight:', highlight[0]);
console.log('last line of highlight:', highlight[highlight.length-1]);
console.log('first line of squadInfo:', squadInfo[0]);
console.log('last line of squadInfo:', squadInfo[squadInfo.length-1]);

const newLines = [
  ...before,
  ...wellnessEnd,
  '',
  ...squadInfo,
  '',
  '          {/* ⚡ Player Highlights Section */}',
  '          <div style={{marginBottom: 40}} className="cd-section-wrap">',
  ...highlight,
  '          </div>',
  ...after
];

fs.writeFileSync('src/camp-dashboard.jsx', newLines.join('\n'));
console.log('Reordered successfully!');
