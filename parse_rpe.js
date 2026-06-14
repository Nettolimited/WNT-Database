const fs = require('fs');
const data = JSON.parse(fs.readFileSync('tmp_wellness.json', 'utf8'));
const matches = data.entries.filter(e => e.session_date === '2026-06-09' && e.session === 'AM');
matches.sort((a,b) => b.rpe - a.rpe);
matches.forEach(m => {
    console.log(`Player ID: ${m.player_id}, RPE: ${m.rpe}`);
});
