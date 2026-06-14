const fs = require('fs');
const data = JSON.parse(fs.readFileSync('tmp_wellness.json', 'utf8'));
const matches = data.entries.filter(e => e.session_date === '2026-06-09');
matches.forEach(m => {
  if (!['p07', 'p43', 'p18', 'p04', 'p17', 'p49', 'p53', 'p35', 'p55', 'p58', 'p36', 'p70', 'p21', 'p24', 'p09', 'p06', 'p41', 'p42', 'p75', 'p59', 'p39', 'p901', 'p902'].includes(m.player_id)) {
    console.log(`EXTRA PLAYER IN WELLNESS: ${m.player_id}, RPE: ${m.rpe}`);
  }
});
