const fs = require('fs');
const data = JSON.parse(fs.readFileSync('tmp_wellness.json', 'utf8'));
const matches = data.entries.filter(e => e.session_date === '2026-06-09');
const sessions = new Set(matches.map(e => e.session));
console.log('Sessions:', Array.from(sessions));

matches.forEach(m => {
    if (m.session === 'Match') {
        console.log(m.player_id, 'RPE:', m.rpe);
    }
});
