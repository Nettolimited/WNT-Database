const http = require('http');

http.get('http://localhost:8788/api/camp-wellness?camp_id=camp_ayabank_2026&session_date=2026-06-05', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const natcha = json.entries.find(e => e.player_id === 'p04');
    console.log("Natcha from API:", natcha);
  });
}).on('error', err => {
  console.log("Error:", err.message);
});
