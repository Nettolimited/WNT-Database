const fs = require('fs');
const { execSync } = require('child_process');

const players = JSON.parse(fs.readFileSync('tmp_players.json')).players;

// Build lineup array
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
    minutesPlayed: 45,
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
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p35',
    isStarter: true,
    minutesPlayed: 82,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p70',
    isStarter: true,
    minutesPlayed: 45,
    goals: 1,
    goalMinutes: '28',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p28',
    isStarter: true,
    minutesPlayed: 72,
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
    minutesPlayed: 62,
    goals: 0,
    goalMinutes: '',
    assists: 1,
    assistMinutes: '4',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p39',
    isStarter: true,
    minutesPlayed: 82,
    goals: 1,
    goalMinutes: '4',
    assists: 1,
    assistMinutes: '28',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  {
    playerId: 'p48',
    isStarter: true,
    minutesPlayed: 90,
    goals: 0,
    goalMinutes: '',
    assists: 1,
    assistMinutes: '73',
    yellowCards: 0,
    redCard: false,
    subPlayed: false
  },
  
  // Substitutes
  {
    playerId: 'p21',
    isStarter: false,
    minutesPlayed: 45,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: true
  },
  {
    playerId: 'p50',
    isStarter: false,
    minutesPlayed: 45,
    goals: 0,
    goalMinutes: '',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: true
  },
  {
    playerId: 'p06',
    isStarter: false,
    minutesPlayed: 28,
    goals: 1,
    goalMinutes: '73',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: true
  },
  {
    playerId: 'p46',
    isStarter: false,
    minutesPlayed: 18,
    goals: 1,
    goalMinutes: '90+1',
    assists: 0,
    assistMinutes: '',
    yellowCards: 0,
    redCard: false,
    subPlayed: true
  },
  {
    playerId: 'p49',
    isStarter: false,
    minutesPlayed: 8,
    goals: 0,
    goalMinutes: '',
    assists: 1,
    assistMinutes: '90+1',
    yellowCards: 0,
    redCard: false,
    subPlayed: true
  },
  {
    playerId: 'p57',
    isStarter: false,
    minutesPlayed: 8,
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
// Escape single quotes for SQL statement
const escapedLineupJson = lineupJson.replace(/'/g, "''");
const sqlCommand = `UPDATE matches SET lineup = '${escapedLineupJson}' WHERE id = 'm_fifa_nc';`;

console.log("Executing update on local database...");
try {
  const localOutput = execSync(`npx wrangler d1 execute twnt-players --local --command="${sqlCommand.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
  console.log("Local Database Update Completed Successfully!");
  console.log(localOutput);
} catch (error) {
  console.error("Failed to update local database:", error.message);
  process.exit(1);
}

console.log("Executing update on remote database...");
try {
  const remoteOutput = execSync(`npx wrangler d1 execute twnt-players --remote --command="${sqlCommand.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
  console.log("Remote Database Update Completed Successfully!");
  console.log(remoteOutput);
} catch (error) {
  console.error("Failed to update remote database:", error.message);
  process.exit(1);
}

console.log("All updates completed successfully!");
