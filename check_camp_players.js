const fs = require('fs');
const data = JSON.parse(fs.readFileSync('tmp_camps.json', 'utf8'));
const camp = data.camps.find(c => c.id === 'camp_ayabank_2026');
console.log('Player IDs in camp:', camp.playerIds);
