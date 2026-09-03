const API = 'https://thailand-wnt-database.pages.dev/api/camp-wellness';
const CAMP = 'camp_1787883174933';

const players = {
  Beam:'p07', Bell:'p08', Gam:'p18', View:'p73', Wiw:'p72', Packee:'p49',
  Somcheng:'p911', Aum:'p04', Fresh:'p17', Mook:'p35', Kaka:'p908',
  Tangmay:'p902', Zara:'p62', Kanoon:'p_saengrawee', Gaga:'p24', Yim:'p76',
  Tongar:'p70', Pui:'p58', Mint:'p32', Mai:'p28', Fern:'p16', Imm:'p21',
  Nong:'p42', Pa:'p46', Bimon:'p06', Yee:'p75',
};

// 2 Sep: second RPE value and Day 7 dehydration weights are the PM session.
const sep2 = {
  Beam:[6,61.70,62.60], Bell:[5,69.85,68.95], Gam:[5,65.85,64.65],
  View:[5,64.15,63.00], Wiw:[8,70.95,69.95], Packee:[7,51.50,50.85],
  Somcheng:[8,62.40,61.55], Aum:[8,56.80,55.55], Fresh:[5,55.40,55.25],
  Mook:[8,55.75,55.30], Kaka:[3,61.00,60.20], Tangmay:[8,52.50,51.55],
  Zara:[7,48.70,47.75], Kanoon:[5,58.20,57.95], Gaga:[8,48.70,48.20],
  Yim:[7,49.95,49.40], Tongar:[8,46.65,46.75], Pui:[8,64.20,63.05],
  Mint:[9,61.60,60.05], Mai:[9,59.40,59.15], Fern:[4,55.15,54.30],
  Imm:[8,51.95,51.55], Nong:[7,56.80,56.30], Pa:[1,57.80,57.30],
  Bimon:[7,54.70,54.10], Yee:[7,64.15,63.50],
};

// 3 Sep: 03/09 RPE values match Day 8 dehydration RPE and weights.
const sep3 = {
  Beam:[7,61.60,62.20], Bell:[4,69.35,69.40], Gam:[5,64.55,64.50],
  View:[3,63.95,63.30], Wiw:[7,71.30,70.10], Packee:[7,52.20,51.65],
  Somcheng:[6,62.65,61.70], Aum:[7,55.95,54.90], Fresh:[6,55.60,54.90],
  Mook:[6,55.60,55.30], Kaka:[5,60.55,60.10], Tangmay:[6,52.70,52.15],
  Zara:[6,48.35,47.65], Kanoon:[7,58.30,58.00], Gaga:[6,48.90,48.00],
  Yim:[6,49.95,49.25], Tongar:[7,46.95,46.75], Pui:[7,63.95,63.40],
  Mint:[8,61.50,60.10], Mai:[6,59.90,60.10], Fern:[5,55.95,55.35],
  Imm:[6,52.25,51.80], Nong:[7,56.40,55.75], Pa:[1,58.25,57.70],
  Bimon:[7,55.10,54.30], Yee:[5,63.95,63.25],
};

const periodSep3 = new Set(['Beam', 'Kanoon', 'Fern']);

async function upsert(date, name, values) {
  const [rpe, weightBefore, weightAfter] = values;
  const period = date === '2026-09-03' && periodSep3.has(name) ? 1 : 0;
  const notes = date === '2026-09-02'
    ? 'PM RPE and dehydration weights imported from 02/09 readiness + Day 7 dehydration; duration pending'
    : 'PM RPE and dehydration weights imported from 03/09 readiness + Day 8 dehydration; duration pending';
  const response = await fetch(API, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      camp_id:CAMP, player_id:players[name], session_date:date, session:'PM',
      rpe, duration:0, weight_before:weightBefore, weight_after:weightAfter,
      period, notes,
    }),
  });
  if (!response.ok) throw new Error(`${date} ${name}: ${response.status} ${await response.text()}`);
  return `${date} ${name}`;
}

const imported = [];
for (const [name, values] of Object.entries(sep2)) imported.push(await upsert('2026-09-02', name, values));
for (const [name, values] of Object.entries(sep3)) imported.push(await upsert('2026-09-03', name, values));
console.log(JSON.stringify({ok:true, imported:imported.length, sep2:Object.keys(sep2).length, sep3:Object.keys(sep3).length}));
