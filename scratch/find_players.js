const fs = require('fs');
const players = JSON.parse(fs.readFileSync('tmp_players.json')).players;

console.log("Searching for 'Aim', 'Aem', 'Em', 'เอม', etc...");
players.forEach(p => {
  const nick = (p.nick || "").toLowerCase();
  const name = (p.name || "").toLowerCase();
  const thaiName = (p.thaiName || "").toLowerCase();
  
  if (nick.includes("aim") || nick.includes("aem") || nick.includes("em") ||
      name.includes("aim") || name.includes("aem") || name.includes("em") ||
      thaiName.includes("เอม") || thaiName.includes("อิม")) {
    console.log(JSON.stringify(p, null, 2));
  }
});

console.log("\nAll players:");
players.forEach(p => {
  console.log(`${p.id}: ${p.nick || 'NoNick'} - ${p.name} (${p.thaiName || 'NoThaiName'})`);
});
