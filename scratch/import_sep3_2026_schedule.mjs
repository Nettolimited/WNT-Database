const baseUrl = 'https://thailand-wnt-database.pages.dev';
const campId = 'camp_1787883174933';

const events = [
  ['08:30', '09:30', 'Breakfast', 'Meal', 'อาหารเช้า · Dynamic Football Camp'],
  ['12:30', '14:30', 'Lunch', 'Meal', 'อาหารกลางวัน · Dynamic Football Camp'],
  ['14:30', '15:45', 'Snack', 'Meal', 'อาหารว่าง · Dynamic Football Camp'],
  ['15:45', '16:00', 'Pre-Warm-Up', 'Training', 'เตรียมร่างกายก่อนฝึกซ้อมช่วงเย็น · Dynamic Football Camp'],
  ['16:00', '18:30', 'Training Session', 'Training', 'ฝึกซ้อมช่วงเย็น · Dynamic Football Camp'],
  ['18:30', '20:30', 'Dinner', 'Meal', 'อาหารเย็น · Dynamic Football Camp'],
  ['20:30', '21:00', 'Laundry Drop-Off', 'Custom', 'ส่งผ้าซัก · Dynamic Football Camp'],
];

for (const [time_start, time_end, title, type, notes] of events) {
  const response = await fetch(`${baseUrl}/api/camp-schedules`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      camp_id: campId,
      schedule_date: '2026-09-03',
      time_start,
      time_end,
      title,
      type,
      notes,
      video_url: '',
    }),
  });
  if (!response.ok) throw new Error(`${title}: ${response.status} ${await response.text()}`);
  console.log(title, await response.text());
}
