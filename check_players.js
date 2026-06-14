const fs = require('fs');
const players = JSON.parse(fs.readFileSync('tmp_players.json')).players;

const rpeData = [
  {id: 'p54', rpe: 10},
  {id: 'p46', rpe: 10},
  {id: 'p48', rpe: 10},
  {id: 'p24', rpe: 10},
  {id: 'p902', rpe: 10},
  {id: 'p41', rpe: 9},
  {id: 'p30', rpe: 8},
  {id: 'p70', rpe: 8},
  {id: 'p21', rpe: 8},
  {id: 'p14', rpe: 8},
  {id: 'p07', rpe: 7},
  {id: 'p36', rpe: 7},
  {id: 'p06', rpe: 7},
  {id: 'p18', rpe: 6},
  {id: 'p39', rpe: 6},
  {id: 'p35', rpe: 5},
];

rpeData.forEach(d => {
  const p = players.find(x => x.id === d.id);
  console.log(`Player ID: ${d.id}, Name: ${p ? (p.nick || p.name) : 'UNKNOWN'}, RPE: ${d.rpe}`);
});
