const fs = require('fs');
const { execSync } = require('child_process');

const players = JSON.parse(fs.readFileSync('tmp_players.json')).players;

function getPlayer(id) {
  const p = players.find(x => x.id === id);
  if (!p) throw new Error(`Player not found: ${id}`);
  return p;
}

const playerIds = [
  'p68', // Tiff
  'p17', // Fresh
  'p902', // Tangmay
  'p24', // Kaka
  'p35', // Mook
  'p75', // Yee
  'p28', // Mai
  'p58', // Pui
  'p41', // Noey
  'p39', // Natalia
  'p48', // Pailin
  'p21', // Aim (Wirunya)
  'p06', // Baimon
  'p70'  // Tongar
];

playerIds.forEach(id => {
  const p = getPlayer(id);
  console.log(`Verified: ${id} -> ${p.nick || p.name} (${p.thaiName || ''})`);
});

const lineup = [
  {
    playerId: 'p68',
    isStarter: true,
    minutesPlayed: 90,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p17',
    isStarter: true,
    minutesPlayed: 90,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p902',
    isStarter: true,
    minutesPlayed: 83,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p24',
    isStarter: true,
    minutesPlayed: 90,
    goals: 0,
    goalMinutes: '',
    assists: 1,
    assistMinutes: '90+4',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p35',
    isStarter: true,
    minutesPlayed: 90,
    goals: 0,
    goalMinutes: '',
    assists: 1,
    assistMinutes: '60',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p75',
    isStarter: true,
    minutesPlayed: 90,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p28',
    isStarter: true,
    minutesPlayed: 65,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p58',
    isStarter: true,
    minutesPlayed: 90,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p41',
    isStarter: true,
    minutesPlayed: 90,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p39',
    isStarter: true,
    minutesPlayed: 80,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p48',
    isStarter: true,
    minutesPlayed: 90,
    goals: 1,
    goalMinutes: '60',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  
  // Subs
  {
    playerId: 'p21',
    isStarter: false,
    minutesPlayed: 25,
    goals: 1,
    goalMinutes: '90+4',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: true
  },
  {
    playerId: 'p06',
    isStarter: false,
    minutesPlayed: 10,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: true
  },
  {
    playerId: 'p70',
    isStarter: false,
    minutesPlayed: 7,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: true
  }
];

const lineupJson = JSON.stringify(lineup);
const escapedLineupJson = lineupJson.replace(/'/g, "''");
const sqlCommand = `UPDATE matches SET lineup = '${escapedLineupJson}' WHERE id = 'm_fifa_cd';`;

console.log("Updating local database...");
try {
  const localOutput = execSync(`npx wrangler d1 execute twnt-players --local --command="${sqlCommand.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
  console.log("Local Database Update Completed Successfully!");
  console.log(localOutput);
} catch (error) {
  console.error("Failed to update local database:", error.message);
  process.exit(1);
}

console.log("Updating remote database...");
try {
  const remoteOutput = execSync(`npx wrangler d1 execute twnt-players --remote --command="${sqlCommand.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
  console.log("Remote Database Update Completed Successfully!");
  console.log(remoteOutput);
} catch (error) {
  console.error("Failed to update remote database:", error.message);
  process.exit(1);
}

console.log("All updates completed successfully!");
