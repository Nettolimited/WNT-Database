// Find Nancy / Ned / Natalia in DB and set their nicks
const API = 'https://thailand-wnt-database.pages.dev';

const res = await fetch(`${API}/api/players`);
const { players } = await res.json();

// What we know about each player
const targets = [
  { csvNick: 'Nancy',   hint: 'sunisa srangthaisong',   club: 'aerion' },
  { csvNick: 'Ned',     hint: 'กาญจนา สังข์เงิน',       club: 'bangkok' },
  { csvNick: 'Natalia', hint: 'natalia',                 club: 'lion' },
];

for (const t of targets) {
  const hintLow = t.hint.toLowerCase();
  const matches = players.filter(p => {
    const hay = [p.name||'', p.thaiName||'', p.nick||'', p.club||''].join(' ').toLowerCase();
    return hintLow.split(' ').some(word => word.length > 2 && hay.includes(word));
  });

  if (matches.length === 0) {
    console.log(`❌ "${t.csvNick}" — ไม่พบในฐานข้อมูล (hint: ${t.hint})`);
    continue;
  }
  if (matches.length > 1) {
    console.log(`⚠️  "${t.csvNick}" — พบหลายคน:`);
    matches.forEach(p => console.log(`   ${p.id} | ${p.name} | ${p.thaiName} | nick:${p.nick} | club:${p.club}`));
    continue;
  }

  const p = matches[0];
  console.log(`✅ "${t.csvNick}" → ${p.id} | ${p.name} | ${p.thaiName} | nick:${p.nick}`);

  if (p.nick === t.csvNick) {
    console.log(`   (nick already correct, skipping update)`);
    continue;
  }

  // Update nick
  const body = {
    ...p,
    altPos:   p.altPos  ?? [],
    career:   p.career  ?? [],
    nick:     t.csvNick,
  };
  const r = await fetch(`${API}/api/players/${p.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  console.log(`   → set nick="${t.csvNick}" | ${r.ok ? '✅ saved' : '❌ failed: ' + await r.text()}`);
}
