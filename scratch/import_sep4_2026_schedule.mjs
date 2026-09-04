const base = 'https://thailand-wnt-database.pages.dev/api/camp-schedules';
const camp_id = 'camp_1787883174933';
const schedule_date = '2026-09-04';
const events = [
  ['06:30', 'Snack', 'Meal'],
  ['06:45', 'Pre-Warm-Up', 'Training'],
  ['07:00', 'Training Session', 'Training'],
  ['08:30', 'Breakfast', 'Meal'],
  ['12:30', 'Lunch', 'Meal'],
  ['15:00', 'Snack', 'Meal'],
  ['15:45', 'Pre-Warm-Up', 'Training'],
  ['16:00', 'Training Session', 'Training'],
  ['18:30', 'Dinner', 'Meal'],
  ['20:30', 'Laundry Drop-Off', 'Custom'],
];
async function read() {
  const r = await fetch(`${base}?camp_id=${camp_id}`);
  if (!r.ok) throw new Error(`Read failed: ${r.status}`);
  return (await r.json()).schedules.filter(x => x.schedule_date === schedule_date);
}
const existing = await read();
let added = 0;
for (const [time_start, title, type] of events) {
  if (existing.some(x => x.time_start === time_start && x.title === title)) continue;
  // API requires an end time. Equal start/end denotes an event with unknown duration.
  const r = await fetch(base, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({camp_id, schedule_date, time_start, time_end: time_start,
      title, type, notes: 'Dynamic Football Camp · ระบุเฉพาะเวลาเริ่ม; ยังไม่ระบุเวลาสิ้นสุดหรือ Duration', video_url: ''}),
  });
  if (!r.ok) throw new Error(`${title}: ${r.status} ${await r.text()}`);
  added++;
}
const verified = await read();
for (const [time, title] of events) {
  if (verified.filter(x => x.time_start === time && x.title === title).length !== 1)
    throw new Error(`Verification failed: ${time} ${title}`);
}
console.log(JSON.stringify({added, skipped: events.length - added, verified: verified.length}));
