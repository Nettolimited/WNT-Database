const baseUrl = 'https://thailand-wnt-database.pages.dev';
const campId = 'camp_1787883174933';
const reportDate = '2026-09-03';

const cases = [
  ['p24', 'Knee pain both side (Lt.>Rt.)', '- tender point at pattellar ligament\n- Full ROM of knee joint\n- Pain improved', '3', 'Arthritis', 'Appointment/ symptom are the same', '90%', 'Both knees'],
  ['p06', 'Pain at middle back', '- Tenderness at Lower trapezius and rhomboid muscle', '8', 'Muscle guarding', 'Appointment', '90%', 'Middle back'],
  ['p35', '1. Sore foot both side\n2. Rt. leg contusion', '1. plantar fascia tightness — improved\n2. Rt. leg contusion — same', '1. plantar foot: no pain/tightness\n2. Rt. leg: 2', '1. Plantar fasciitis\n2. Lower leg contusion', 'Appointment', '90%', 'Both feet; right lower leg'],
  ['p58', 'Low back pain', '- tender point at paravertebral muscle both sides\n- Trunk extension aggravated local pain\n- No referred pain or numbness', '1', 'General low back pain', 'Follow up', '95%', 'Lower back'],
  ['p28', 'Lt. abrasion / superficial injury', '- Hamstrings muscle tightness\n- Knee skin abrasion', '3', 'Abrasion / superficial injury', 'Follow up', '90%', 'Left knee; hamstring'],
  ['p08', 'Rt. V metacarpal bone pain (repeat ball attack)', '- Limit V finger movement in all directions due to pain', '4', 'Jammed finger; muscle tendinitis', 'Appointment', '90%', 'Right fifth metacarpal; finger'],
  ['p908', '1. Knee joint pain\n2. Rt. thigh muscle pain', '1. Tenderness at hamstrings and gastrocnemius muscle\n2. Tender point at middle quadriceps muscle', '1. Knee: 5\n2. Right thigh: 7', '1. Patellofemoral arthritis\n2. Muscle strain', 'Appointment', '80%', 'Knee; hamstrings; gastrocnemius; right thigh; quadriceps'],
  ['p75', 'Lt. knee joint pain\nLt. psoas muscle pain', '- Tenderness at Lt. popliteal muscle; dull pain\n- Tenderness at psoas muscle', '7', 'Chronic knee joint pain; proximal one-third gracilis muscle tear', 'Appointment', '80%', 'Left knee; left psoas; gracilis'],
  ['p_saengrawee', 'Lt. shoulder pain', '- Full active ROM all directions\n- Passive triceps extension aggravated posterior deltoid pain\n- Supraspinatus muscle spasm', '7', 'Muscle strain', 'Appointment', '80%', 'Left shoulder; posterior deltoid; supraspinatus'],
  ['p72', 'Lt. psoas tightness', '- Tenderness and tender point at psoas muscle', 'Before: rest 0 / trigger point 8\nAfter: rest 0 / trigger point 3', 'Muscle tendinitis', 'Follow up', '90-100%', 'Left psoas'],
  ['p18', 'Rt. upper trapezius muscle pain', '- Tender point at upper trapezius muscle\n- Swelling', '6', 'Muscle contusion', 'Appointment + Tape', '100%', 'Right upper trapezius'],
  ['p46', 'Lt. knee pain', '- Tenderness at hamstrings and tibialis anterior muscle', '5', 'Knee joint pain caused by muscle tightness', 'Follow up + release muscle tightness', '70%', 'Left knee; hamstrings; tibialis anterior'],
  ['p911', 'Rt. knee pain', '- No clear tender point\n- Popliteal fossa tightness', '2', 'DOMS', 'Follow up', '90%', 'Right knee; popliteal fossa'],
  ['p07', 'Rt. wrist joint pain', '- Tender point at flexor pollicis longus tendon', '2', 'Tendinitis', 'Follow up', '95%', 'Right wrist; flexor pollicis longus'],
  ['p62', 'Rt. thigh muscle pain', '- Tender point at middle hamstrings muscle — improved', 'No pain at rest; sharp pain 3/10 during fast running', 'Muscle strain', 'Follow up', '90%', 'Right thigh; hamstrings'],
];

for (const [player_id, subjective, objective, pain, analysis, treatment_plan, can_train, body_parts] of cases) {
  const response = await fetch(`${baseUrl}/api/camp-status`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      camp_id: campId,
      player_id,
      report_date: reportDate,
      status: 'modified',
      injury_note: subjective,
      notes: `O: Objective exam: ${objective}\nPain score (0-10): ${pain}\nA: Analysis: ${analysis}`,
      symptom_date: '',
      rest_days: '',
      can_train,
      treatment_plan,
      body_parts,
    }),
  });
  if (!response.ok) throw new Error(`${player_id}: ${response.status} ${await response.text()}`);
  console.log(player_id, await response.text());
}
