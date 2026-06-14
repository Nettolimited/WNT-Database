const fs = require('fs');
const players = JSON.parse(fs.readFileSync('tmp_players.json')).players;
const data = JSON.parse(fs.readFileSync('tmp_camps.json', 'utf8'));
const camp = data.camps.find(c => c.id === 'camp_ayabank_2026');

const campP = camp.playerIds.map(id => {
  const p = players.find(x => x.id === id);
  return { id, name: p ? (p.nick || p.name) : 'UNKNOWN' };
});

console.log(campP.map(p => `${p.id}: ${p.name}`).join('\n'));
