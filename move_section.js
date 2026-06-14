const fs = require('fs');

const code = fs.readFileSync('src/camp-dashboard.jsx', 'utf8');
const lines = code.split('\n');

// Find Player Highlights start and end
const highlightStart = lines.findIndex(l => l.includes('{/* OVERALL */}')) - 4; // up to <div className="exec-card"
let highlightEnd = -1;
let openDivs = 0;
for (let i = highlightStart; i < lines.length; i++) {
  if (lines[i].includes('<div')) openDivs += (lines[i].match(/<div/g) || []).length;
  if (lines[i].includes('</div')) openDivs -= (lines[i].match(/<\/div/g) || []).length;
  if (openDivs === 0 && i > highlightStart) {
    highlightEnd = i;
    break;
  }
}

// Find Squad Details end
let squadEnd = -1;
openDivs = 0;
const squadStart = lines.findIndex(l => l.includes('{/* 📋 Squad Information Section */}'));
for (let i = squadStart; i < lines.length; i++) {
  if (lines[i].includes('<div')) openDivs += (lines[i].match(/<div/g) || []).length;
  if (lines[i].includes('</div')) openDivs -= (lines[i].match(/<\/div/g) || []).length;
  if (openDivs === 0 && i > squadStart) {
    squadEnd = i;
    break;
  }
}

console.log('Highlight:', highlightStart, 'to', highlightEnd);
console.log('Squad:', squadStart, 'to', squadEnd);

// Extract Highlight
const highlightLines = lines.slice(highlightStart, highlightEnd + 1);

// Remove Highlight from old position
lines.splice(highlightStart, highlightEnd - highlightStart + 1);

// Recalculate Squad Details end because array length changed
const newSquadEnd = squadEnd - (highlightEnd - highlightStart + 1);

// Insert Highlight after Squad Details
lines.splice(newSquadEnd + 1, 0, '', '          {/* 🏃‍♂️ Player Highlights Section */}', '          <div style={{marginBottom: 40}} className="cd-section-wrap">', ...highlightLines, '          </div>');

fs.writeFileSync('src/camp-dashboard.jsx', lines.join('\n'));
console.log('Moved successfully!');
