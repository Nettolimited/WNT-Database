// Camp Detail — Squad status + Daily wellness (AM/PM sessions)
// Matches TWNFT Readiness Form: Stress · Sleep · Appetite · Wellness · Soreness · Desire (all 1-10)
// + Post-session: RPE (1-10) · Duration (min) · Daily Load = Duration × RPE

const STATUS_OPTIONS = [
  { key: 'available', label: 'Available', emoji: '✅', color: '#10b981' },
  { key: 'modified',  label: 'Injured (Can Train)', emoji: '🩹', color: '#eab308' },
  { key: 'injured',   label: 'Injured (No Train)', emoji: '🤕', color: '#ef4444' },
  { key: 'sick',      label: 'Sick',      emoji: '🤒', color: '#f97316' },
  { key: 'resting',   label: 'Resting',   emoji: '😴', color: '#3b82f6' },
  { key: 'absent',    label: 'Absent',    emoji: '❌', color: '#6b7280' },
];

const isCanTrain = (val) => {
  if (!val) return false;
  const s = String(val).toLowerCase().trim();
  if (s.includes('ไม่ได้') || s.includes('ไม่ซ้อม') || s.includes('งดซ้อม') || s === 'no' || s === 'no train') return false;
  return s.includes('yes') || s.includes('ซ้อมได้') || s.includes('%') || s.includes('percent');
};
window.isCanTrain = isCanTrain;

// Pre-training readiness metrics (all 1-10, 10 = best)
const PRE_COLS = [
  { key: 'stress',   label: 'Stress',   emoji: '🧠', hint: '1 = very stressed  10 = no stress at all' },
  { key: 'sleep',    label: 'Sleep',    emoji: '😴', hint: '1 = no sleep  10 = great sleep' },
  { key: 'appetite', label: 'Appetite', emoji: '🍽', hint: '1 = not hungry  10 = starving' },
  { key: 'mood',     label: 'Wellness', emoji: '💊', hint: '1 = very ill  10 = 100% healthy' },
  { key: 'soreness', label: 'Soreness', emoji: '💪', hint: '1 = very sore  10 = very good (no soreness)' },
  { key: 'desire',   label: 'Desire',   emoji: '🔥', hint: '1 = no desire to train  10 = very motivated' },
];

const BODY_SILHOUETTE_PATH = "M 50,17 m -7,0 a 7,7 0 1,1 14,0 a 7,7 0 1,1 -14,0 M 47,25 L 53,25 c 2,0 4,1 5,3 l 10,11 c 2,2 2,5 0,7 l -4,14 c -1,3 -2,6 -2,10 l 0,12 c 0,4 1,8 2,12 l 0,12 c 0,2 -1,4 -3,4 l -3,0 l -4,35 l 1,15 l -6,0 l -2,-35 l -2,35 l -6,0 l 1,-15 l -4,-35 l -3,0 c -2,0 -3,-2 -3,-4 l 0,-12 c 1,-4 2,-8 2,-12 l 0,-12 c 0,-4 -1,-7 -2,-10 l -4,-14 c -2,-2 -2,-5 0,-7 l 10,-11 c 1,-2 3,-3 5,-3 z";

const detectBodyPartsFromText = (text) => {
  if (!text) return [];
  const t = text.toLowerCase();
  const detected = [];
  
  // Use regex with word boundaries for L/R in English, substring in Thai
  const hasLeft = /\b(left|lt|l|ซ้าย)\b/i.test(t) || t.includes('ซ้าย');
  const hasRight = /\b(right|rt|r|ขวา)\b/i.test(t) || t.includes('ขวา');
  const both = (!hasLeft && !hasRight) || (hasLeft && hasRight);

  // Front/Back keyword detection
  const hasBack = t.includes('back') || t.includes('หลัง') || t.includes('rear') || t.includes('posterior') || t.includes('ข้อพับ');
  const hasFront = t.includes('front') || t.includes('หน้า') || t.includes('anterior');
  
  const showBack = hasBack && !hasFront;

  if (t.includes('head') || t.includes('หัว') || t.includes('ศีรษะ') || t.includes('face') || t.includes('หน้า')) {
    if (showBack) detected.push('head_back');
    else detected.push('head');
  }
  if (t.includes('neck') || t.includes('คอ')) {
    if (showBack) detected.push('neck_back');
    else detected.push('neck');
  }
  if (t.includes('chest') || t.includes('อก') || t.includes('หน้าอก')) {
    detected.push('chest');
  }
  if (t.includes('back') || t.includes('หลัง') || t.includes('เอว')) {
    if (t.includes('upper') || t.includes('บน')) {
      detected.push('back_upper');
    } else if (t.includes('lower') || t.includes('ล่าง') || t.includes('lumbar') || t.includes('เอว')) {
      detected.push('back_lower');
    } else {
      detected.push('back_upper');
      detected.push('back_lower');
    }
  }
  if (t.includes('abs') || t.includes('abdomen') || t.includes('ท้อง')) {
    detected.push('abs');
  }
  if (t.includes('groin') || t.includes('ขาหนีบ') || t.includes('หนีบ')) {
    detected.push('groin');
  }
  if (t.includes('glute') || t.includes('ก้น') || t.includes('สะโพก') || t.includes('hip')) {
    detected.push('glutes');
  }
  if (t.includes('shoulder') || t.includes('ไหล่')) {
    if (both || hasLeft) { 
      if (showBack) detected.push('shoulder_l_back');
      else detected.push('shoulder_l'); 
    }
    if (both || hasRight) { 
      if (showBack) detected.push('shoulder_r_back');
      else detected.push('shoulder_r'); 
    }
  }
  if (t.includes('arm') || t.includes('แขน') || t.includes('elbow') || t.includes('ศอก')) {
    if (both || hasLeft) { 
      if (showBack) detected.push('arm_l_back');
      else detected.push('arm_l'); 
    }
    if (both || hasRight) { 
      if (showBack) detected.push('arm_r_back');
      else detected.push('arm_r'); 
    }
  }
  if (t.includes('hand') || t.includes('wrist') || t.includes('มือ') || t.includes('ข้อมือ')) {
    if (both || hasLeft) { 
      if (showBack) detected.push('hand_l_back');
      else detected.push('hand_l'); 
    }
    if (both || hasRight) { 
      if (showBack) detected.push('hand_r_back');
      else detected.push('hand_r'); 
    }
  }
  if (t.includes('hamstring') || t.includes('แฮมสตริง') || t.includes('ต้นขาหลัง')) {
    if (both || hasLeft) detected.push('hamstring_l');
    if (both || hasRight) detected.push('hamstring_r');
  } else if (t.includes('thigh') || t.includes('quad') || t.includes('ต้นขา') || t.includes('ขาอ่อน')) {
    if (showBack) {
      if (both || hasLeft) detected.push('hamstring_l');
      if (both || hasRight) detected.push('hamstring_r');
    } else {
      if (both || hasLeft) detected.push('thigh_l');
      if (both || hasRight) detected.push('thigh_r');
    }
  }
  if (t.includes('knee') || t.includes('เข่า') || t.includes('ข้อพับ')) {
    if (both || hasLeft) { 
      if (showBack) detected.push('knee_l_back');
      else detected.push('knee_l'); 
    }
    if (both || hasRight) { 
      if (showBack) detected.push('knee_r_back');
      else detected.push('knee_r'); 
    }
  }
  if (t.includes('shin') || t.includes('หน้าแข้ง') || t.includes('แข้ง')) {
    if (both || hasLeft) detected.push('shin_l');
    if (both || hasRight) detected.push('shin_r');
  }
  if (t.includes('calf') || t.includes('น่อง') || t.includes('น่องขา')) {
    if (both || hasLeft) detected.push('calf_l');
    if (both || hasRight) detected.push('calf_r');
  }
  if (t.includes('ankle') || t.includes('ข้อเท้า')) {
    if (both || hasLeft) { 
      if (showBack) detected.push('ankle_l_back');
      else detected.push('ankle_l'); 
    }
    if (both || hasRight) { 
      if (showBack) detected.push('ankle_r_back');
      else detected.push('ankle_r'); 
    }
  }
  if (t.includes('heel') || t.includes('ส้นเท้า')) {
    if (both || hasLeft) detected.push('heel_l');
    if (both || hasRight) detected.push('heel_r');
  } else if (t.includes('foot') || t.includes('sole') || t.includes('เท้า') || t.includes('ฝ่าเท้า')) {
    if (showBack) {
      if (both || hasLeft) detected.push('heel_l');
      if (both || hasRight) detected.push('heel_r');
    } else {
      if (both || hasLeft) detected.push('foot_l');
      if (both || hasRight) detected.push('foot_r');
    }
  }
  
  return detected;
};

const BODY_PARTS_INFO = [
  { key: 'head', label: 'Head (ศีรษะ)', view: 'front', x: 50, y: 17, r: 8, type: 'circle' },
  { key: 'neck', label: 'Neck (คอ)', view: 'front', x: 47, y: 26, w: 6, h: 6, type: 'rect' },
  { key: 'chest', label: 'Chest (หน้าอก)', view: 'front', x: 40, y: 33, w: 20, h: 16, type: 'rect', rx: 2 },
  { key: 'abs', label: 'Abdomen (ท้อง)', view: 'front', x: 41, y: 50, w: 18, h: 18, type: 'rect', rx: 2 },
  { key: 'groin', label: 'Groin (ขาหนีบ)', view: 'front', x: 42, y: 69, w: 16, h: 8, type: 'rect', rx: 1 },
  
  { key: 'shoulder_l', label: 'L Shoulder (ไหล่ซ้าย)', view: 'front', x: 34, y: 35, r: 3.5, type: 'circle' },
  { key: 'shoulder_r', label: 'R Shoulder (ไหล่ขวา)', view: 'front', x: 66, y: 35, r: 3.5, type: 'circle' },
  { key: 'arm_l', label: 'L Arm (แขนซ้าย)', view: 'front', x: 29, y: 40, w: 5, h: 26, type: 'rect', rx: 1.5 },
  { key: 'arm_r', label: 'R Arm (แขนขวา)', view: 'front', x: 66, y: 40, w: 5, h: 26, type: 'rect', rx: 1.5 },
  { key: 'hand_l', label: 'L Hand (มือซ้าย)', view: 'front', x: 31, y: 68, r: 2.5, type: 'circle' },
  { key: 'hand_r', label: 'R Hand (มือขวา)', view: 'front', x: 69, y: 68, r: 2.5, type: 'circle' },
  
  { key: 'thigh_l', label: 'L Thigh (ต้นขาซ้าย)', view: 'front', x: 41, y: 80, w: 8, h: 35, type: 'rect', rx: 2 },
  { key: 'thigh_r', label: 'R Thigh (ต้นขาขวา)', view: 'front', x: 51, y: 80, w: 8, h: 35, type: 'rect', rx: 2 },
  { key: 'knee_l', label: 'L Knee (เข่าซ้าย)', view: 'front', x: 45, y: 122, r: 4, type: 'circle' },
  { key: 'knee_r', label: 'R Knee (เข่าขวา)', view: 'front', x: 55, y: 122, r: 4, type: 'circle' },
  { key: 'shin_l', label: 'L Shin (หน้าแข้งซ้าย)', view: 'front', x: 42, y: 130, w: 6, h: 34, type: 'rect', rx: 1.5 },
  { key: 'shin_r', label: 'R Shin (หน้าแข้งขวา)', view: 'front', x: 52, y: 130, w: 6, h: 34, type: 'rect', rx: 1.5 },
  { key: 'ankle_l', label: 'L Ankle (ข้อเท้าซ้าย)', view: 'front', x: 45, y: 170, r: 3, type: 'circle' },
  { key: 'ankle_r', label: 'R Ankle (ข้อเท้าขวา)', view: 'front', x: 55, y: 170, r: 3, type: 'circle' },
  { key: 'foot_l', label: 'L Foot (เท้าซ้าย)', view: 'front', x: 39, y: 176, w: 8, h: 8, type: 'rect', rx: 1.5 },
  { key: 'foot_r', label: 'R Foot (เท้าขวา)', view: 'front', x: 53, y: 176, w: 8, h: 8, type: 'rect', rx: 1.5 },

  // BACK VIEW
  { key: 'head_back', label: 'Head (หลังศีรษะ)', view: 'back', x: 50, y: 17, r: 8, type: 'circle' },
  { key: 'neck_back', label: 'Neck (คอหลัง)', view: 'back', x: 47, y: 26, w: 6, h: 6, type: 'rect' },
  { key: 'back_upper', label: 'Upper Back (หลังส่วนบน)', view: 'back', x: 40, y: 33, w: 20, h: 16, type: 'rect', rx: 2 },
  { key: 'back_lower', label: 'Lower Back (หลังส่วนล่าง)', view: 'back', x: 41, y: 50, w: 18, h: 18, type: 'rect', rx: 2 },
  { key: 'glutes', label: 'Glutes (ก้น/สะโพก)', view: 'back', x: 41, y: 69, w: 18, h: 10, type: 'rect', rx: 2 },
  
  { key: 'shoulder_l_back', label: 'L Shoulder (หลังไหล่ซ้าย)', view: 'back', x: 34, y: 35, r: 3.5, type: 'circle' },
  { key: 'shoulder_r_back', label: 'R Shoulder (หลังไหล่ขวา)', view: 'back', x: 66, y: 35, r: 3.5, type: 'circle' },
  { key: 'arm_l_back', label: 'L Arm (แขนซ้ายหลัง)', view: 'back', x: 29, y: 40, w: 5, h: 26, type: 'rect', rx: 1.5 },
  { key: 'arm_r_back', label: 'R Arm (แขนขวาหลัง)', view: 'back', x: 66, y: 40, w: 5, h: 26, type: 'rect', rx: 1.5 },
  { key: 'hand_l_back', label: 'L Hand (มือซ้ายหลัง)', view: 'back', x: 31, y: 68, r: 2.5, type: 'circle' },
  { key: 'hand_r_back', label: 'R Hand (มือขวาหลัง)', view: 'back', x: 69, y: 68, r: 2.5, type: 'circle' },
  
  { key: 'hamstring_l', label: 'L Hamstring (แฮมสตริงซ้าย)', view: 'back', x: 41, y: 80, w: 8, h: 35, type: 'rect', rx: 2 },
  { key: 'hamstring_r', label: 'R Hamstring (แฮมสตริงขวา)', view: 'back', x: 51, y: 80, w: 8, h: 35, type: 'rect', rx: 2 },
  { key: 'knee_l_back', label: 'L Knee (ข้อพับเข่าซ้าย)', view: 'back', x: 45, y: 122, r: 4, type: 'circle' },
  { key: 'knee_r_back', label: 'R Knee (ข้อพับเข่าขวา)', view: 'back', x: 55, y: 122, r: 4, type: 'circle' },
  { key: 'calf_l', label: 'L Calf (น่องซ้าย)', view: 'back', x: 42, y: 130, w: 6, h: 34, type: 'rect', rx: 1.5 },
  { key: 'calf_r', label: 'R Calf (น่องขวา)', view: 'back', x: 52, y: 130, w: 6, h: 34, type: 'rect', rx: 1.5 },
  { key: 'ankle_l_back', label: 'L Ankle (ข้อเท้าซ้ายด้านหลัง)', view: 'back', x: 45, y: 170, r: 3, type: 'circle' },
  { key: 'ankle_r_back', label: 'R Ankle (ข้อเท้าขวาด้านหลัง)', view: 'back', x: 55, y: 170, r: 3, type: 'circle' },
  { key: 'heel_l', label: 'L Heel (ส้นเท้าซ้าย)', view: 'back', x: 41, y: 176, w: 8, h: 8, type: 'rect', rx: 1.5 },
  { key: 'heel_r', label: 'R Heel (ส้นเท้าขวา)', view: 'back', x: 51, y: 176, w: 8, h: 8, type: 'rect', rx: 1.5 },
];

function cdFmtDate(start, end) {
  const fmt = s => { const d = new Date(s+'T00:00:00'); return isNaN(d)?s:d.toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'}); };
  if (!start&&!end) return null;
  if (start&&!end) return fmt(start);
  if (!start&&end) return `– ${fmt(end)}`;
  return `${fmt(start)} – ${fmt(end)}`;
}
function todayStr()     { return new Date().toISOString().slice(0,10); }
function addDays(ds,n) { 
  const d=new Date(ds+'T00:00:00'); 
  d.setDate(d.getDate()+n); 
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; 
}
function prettyDate(ds) { const d=new Date(ds+'T00:00:00'); return isNaN(d)?ds:d.toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'}); }

// Colour for a 1-10 score (10=green, 1=red)
function scoreColor(v) {
  if (!v) return 'transparent';
  if (v >= 8) return '#16a34a';
  if (v >= 5) return '#ca8a04';
  return '#dc2626';
}

// ── Metric Input (1-10, coloured) ────────────────────────────────────────────
function MetricInput({ value, onChange }) {
  const col = scoreColor(value);
  return (
    <input
      type="number" min="0" max="10" step="1"
      className="cd-metric-input"
      style={value ? { borderColor: col, color: col, background: col+'18' } : {}}
      value={value || ''}
      placeholder="–"
      onChange={e => {
        const v = Math.min(10, Math.max(0, Number(e.target.value)||0));
        onChange(v);
      }}
    />
  );
}

// ── RPE coloured buttons ──────────────────────────────────────────────────────
function rpeColor(n) {
  if (n<=2) return '#22c55e'; if (n<=4) return '#84cc16';
  if (n<=6) return '#f59e0b'; if (n<=8) return '#f97316';
  return '#ef4444';
}
function rpeLabel(n) {
  return ['','Minimal','Very easy','Easy','Light','Medium','Almost hard','Hard','Very hard','Extremely tough','Death session'][n]||'';
}

// ── CSV helpers ───────────────────────────────────────────────────────────────
function exportCsv(camp, campPlayers, campShirts, wMap, date, session) {
  const header = [
    'Date','Session','First Name','Nickname','Position','#Shirt',
    'Stress','Sleep','Appetite','Wellness','Soreness','Desire','Total',
    'Weight Before','Weight After','Dehyd %','Compensate L',
    'Duration (min)','RPE','Daily Load','Notes'
  ];
  const rows = campPlayers.map(p => {
    const w = wMap.get(`${date}_${session}_${p.id}`) || {};
    const stress   = w.stress   || 0;
    const sleep    = w.sleep    || 0;
    const appetite = w.appetite || 0;
    const wellness = w.mood     || 0;
    const soreness = w.soreness || 0;
    const desire   = w.desire   || 0;
    const total    = stress+sleep+appetite+wellness+soreness+desire;
    const wB       = w.weight_before || 0;
    const wA       = w.weight_after  || 0;
    const dehyd    = wB && wA ? ((wA - wB)/wB*100).toFixed(2) : '';
    const comp     = wB && wA && wB > wA ? (1.5 * (wB - wA)).toFixed(2) : '';
    const rpe      = w.rpe      || 0;
    const duration = w.duration || 0;
    const load     = rpe && duration ? rpe*duration : 0;
    return [
      date, session,
      p.name, p.nick||'', p.pos,
      campShirts[p.id] || '',
      stress||'', sleep||'', appetite||'', wellness||'', soreness||'', desire||'',
      total||'',
      wB||'', wA||'', dehyd||'', comp||'',
      duration||'', rpe||'', load||'',
      w.notes||'',
    ];
  });
  const csv = [header,...rows]
    .map(r => r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿'+csv], {type:'text/csv;charset=utf-8'});
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `readiness_${date}_${session}.csv`;
  a.click();
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  return lines.map(line => {
    const fields=[]; let cur='',inQ=false;
    for (let i=0;i<line.length;i++) {
      const ch=line[i];
      if (ch==='"') { if(inQ&&line[i+1]==='"'){cur+='"';i++;}else inQ=!inQ; }
      else if (ch===','&&!inQ) { fields.push(cur.trim()); cur=''; }
      else cur+=ch;
    }
    fields.push(cur.trim());
    return fields;
  });
}

async function importCsv(file, campId, campPlayers, onImported) {
  const text  = await file.text();
  const rows  = parseCsv(text);
  if (rows.length < 2) return { ok:false, msg:'File is empty' };

  const header = rows[0].map(h=>h.toLowerCase().replace(/[^a-z_]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,''));
  const idx    = k => header.indexOf(k);

  // Build a lookup by nickname or name to find player_id
  const byNick = new Map(campPlayers.map(p=>[p.nick ? p.nick.toLowerCase() : null, p.id]).filter(([k])=>k));
  const byName = new Map(campPlayers.map(p=>[p.name ? p.name.toLowerCase() : null, p.id]));

  const entries=[];
  for (let i=1;i<rows.length;i++) {
    const r=rows[i];
    if (r.length<3) continue;

    // Try to resolve player_id from nickname or first name
    const nick = (r[idx('nickname')]||r[idx('nick')]||'').toLowerCase();
    const name = (r[idx('first_name')]||r[idx('name')]||'').toLowerCase();
    const pid  = byNick.get(nick) || byName.get(name);
    if (!pid) continue;

    const sessionDate = r[idx('date')]||'';
    const session     = (r[idx('session')]||'AM').toUpperCase();
    if (!sessionDate) continue;

    const stress   = Number(r[idx('stress')])   ||0;
    const sleep    = Number(r[idx('sleep')])    ||0;
    const appetite = Number(r[idx('appetite')]) ||0;
    const wellness = Number(r[idx('wellness')]) ||0;
    const soreness = Number(r[idx('soreness')]) ||0;
    const desire   = Number(r[idx('desire')])   ||0;
    const wB       = Number(r[idx('weight_before')]) ||0;
    const wA       = Number(r[idx('weight_after')])  ||0;
    const rpe      = Number(r[idx('rpe')])      ||0;
    const duration = Number(r[idx('duration_min')]||r[idx('duration')]||0)||0;
    const notes    = r[idx('notes')]||'';

    entries.push({ camp_id:campId, player_id:pid, session_date:sessionDate, session,
      stress, sleep, appetite, mood:wellness, soreness, desire, 
      weight_before:wB, weight_after:wA, rpe, duration, notes });
  }

  if (!entries.length) return { ok:false, msg:'No matching players found — check nicknames match your roster' };

  await Promise.all(entries.map(e =>
    fetch('/api/camp-wellness',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(e)})
  ));
  onImported(entries);
  return { ok:true, count:entries.length };
}

// ══════════════════════════════════════════════════════════════════════════════
// SESSION TAB
// ══════════════════════════════════════════════════════════════════════════════
function SessionTab({ camp, campPlayers, campShirts }) {
  const [date,       setDate]       = useState(() => {
    const today = todayStr();
    if (camp.camp_date_end && today > camp.camp_date_end) return camp.camp_date_end;
    if (camp.camp_date && today < camp.camp_date) return camp.camp_date;
    return today;
  });
  const [session,    setSession]    = useState('AM');
  const [viewMode,   setViewMode]   = useState('readiness'); // 'readiness' or 'hydration'
  const [wMap,       setWMap]       = useState(new Map());
  const [loading,    setLoading]    = useState(false);
  const [histPlayer, setHistPlayer] = useState(null);
  const [histData,   setHistData]   = useState([]);
  const [importMsg,  setImportMsg]  = useState('');
  const importRef = useRef();

  const mapKey = (pid,d,s) => `${d}_${s}_${pid}`;
  const get = pid => wMap.get(mapKey(pid,date,session)) || {};

  const loadSession = (d,s) => {
    setLoading(true);
    fetch(`/api/camp-wellness?camp_id=${camp.id}&session_date=${d}&session=${s}`)
      .then(r=>r.ok?r.json():{entries:[]})
      .then(data=>{
        setWMap(m=>{
          const next=new Map(m);
          for (const e of (data.entries||[])) next.set(mapKey(e.player_id,e.session_date,e.session),e);
          return next;
        });
      }).catch(()=>{}).finally(()=>setLoading(false));
  };

  useEffect(()=>{ loadSession(date,session); },[camp.id,date,session]);

  const patch = useCallback((pid, updates) => {
    const cur = get(pid);
    const next = {...cur,...updates, camp_id:camp.id, player_id:pid, session_date:date, session};
    setWMap(m=>new Map(m).set(mapKey(pid,date,session),next));
    fetch('/api/camp-wellness',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)})
      .catch(console.error);
  },[camp.id,date,session,wMap]);

  const openHistory = p => {
    setHistPlayer(p);
    fetch(`/api/camp-wellness?camp_id=${camp.id}&player_id=${p.id}`)
      .then(r=>r.ok?r.json():{entries:[]})
      .then(d=>setHistData(d.entries||[]))
      .catch(()=>{});
  };

  const handleImport = async e => {
    const file=e.target.files && e.target.files[0]; if(!file) return;
    e.target.value='';
    setImportMsg('Importing…');
    const result = await importCsv(file, camp.id, campPlayers, entries=>{
      setWMap(m=>{ const next=new Map(m); for(const en of entries) next.set(mapKey(en.player_id,en.session_date,en.session),en); return next; });
      loadSession(date,session);
    });
    setImportMsg(result.ok ? `✓ Imported ${result.count} rows` : `✗ ${result.msg}`);
    setTimeout(()=>setImportMsg(''),4000);
  };

  const filled = campPlayers.filter(p=>{ const w=get(p.id); return w.stress||w.sleep||w.appetite||w.mood||w.soreness||w.desire||w.rpe; }).length;
  const trained = campPlayers.filter(p=>{ const w=get(p.id); return w.rpe>0 || w.duration>0; }).length;

  return (
    <div className="cd-session-wrap">
      {/* ── Controls ── */}
      <div className="cd-session-bar">
        <button className="btn-ghost sm" onClick={()=>setDate(d=>addDays(d,-1))}>◀</button>
        <div className="cd-date-block">
          <input type="date" className="cd-date-input" value={date} onChange={e=>setDate(e.target.value)} max={camp.camp_date_end || undefined} min={camp.camp_date || undefined} />
          <span className="cd-date-pretty">{prettyDate(date)}</span>
          {date!==todayStr()&&<button className="cd-today-btn" onClick={()=>setDate(todayStr())}>Today</button>}
        </div>
        <button className="btn-ghost sm" onClick={()=>setDate(d=>addDays(d,1))}>▶</button>

        <div className="cd-session-toggle">
          {['AM','PM'].map(s=>(
            <button key={s} className={`cd-sess-btn ${session===s?'on':''}`} onClick={()=>setSession(s)}>
              {s==='AM'?'🌅 Morning':'🌆 Evening'}
            </button>
          ))}
        </div>
        
        <div className="cd-session-toggle" style={{marginLeft:12}}>
          <button className={`cd-sess-btn ${viewMode==='readiness'?'on':''}`} onClick={()=>setViewMode('readiness')}>📊 Readiness</button>
          <button className={`cd-sess-btn ${viewMode==='hydration'?'on':''}`} onClick={()=>setViewMode('hydration')}>💦 Hydration</button>
        </div>

        <span className="cd-fill-count">🏃 Trained: {trained}/{campPlayers.length}{loading&&' · loading…'}</span>

        <div className="cd-io-btns">
          <button className="btn-ghost sm" onClick={()=>exportCsv(camp,campPlayers,campShirts,wMap,date,session)}
            title="Download CSV — เปิดใน Excel กรอกแล้ว Import กลับ">
            ⬇ Export CSV
          </button>
          <button className="btn-ghost sm" onClick={()=>importRef.current.click()}
            title="Import filled CSV">
            ⬆ Import CSV
          </button>
          <input ref={importRef} type="file" accept=".csv" style={{display:'none'}} onChange={handleImport}/>
          {importMsg&&<span className="cd-import-msg">{importMsg}</span>}
        </div>
      </div>

      {/* ── Scale legend ── */}
      <div className="cd-legend-bar">
        <span className="cd-legend-title">Scale 1–10:</span>
        {PRE_COLS.map(c=>(
          <span key={c.key} className="cd-legend-item" title={c.hint}>
            {c.emoji} <span className="cd-legend-label">{c.label}</span>
          </span>
        ))}
        <span className="cd-legend-sep">|</span>
        <span className="cd-legend-item" style={{color:'#22c55e'}}>■ 8-10 Good</span>
        <span className="cd-legend-item" style={{color:'#ca8a04'}}>■ 5-7 Ok</span>
        <span className="cd-legend-item" style={{color:'#dc2626'}}>■ 1-4 Concern</span>
      </div>

      {/* ── Table ── */}
      <div className="cd-table-wrap">
        <table className="cd-table">
          <thead>
            <tr>
              <th className="cd-th-player">Player</th>
              {viewMode === 'readiness' && PRE_COLS.map(c=>(
                <th key={c.key} className="cd-th-num" title={c.hint}>{c.emoji}<br/>{c.label}</th>
              ))}
              {viewMode === 'readiness' && <th className="cd-th-total" title="Sum of 6 pre-training metrics (max 60)">Total<br/>/60</th>}
              {viewMode === 'readiness' && <th className="cd-th-num" title="Period / Menstruation">🩸<br/>Period</th>}
              {viewMode === 'readiness' && <th className="cd-th-num" title="Body Temperature">🌡️<br/>Temp</th>}

              {viewMode === 'hydration' && <th className="cd-th-num">Wt Bfr<br/>(kg)</th>}
              {viewMode === 'hydration' && <th className="cd-th-num">Wt Aft<br/>(kg)</th>}
              {viewMode === 'hydration' && <th className="cd-th-num">Dehyd<br/>(%)</th>}
              {viewMode === 'hydration' && <th className="cd-th-num" title="Fluid to compensate in L">Comp<br/>(L)</th>}
              <th className="cd-th-num" title="Duration in minutes">Min</th>
              <th className="cd-th-num" title="Rate of Perceived Exertion 1-10">RPE</th>
              <th className="cd-th-num" title="Daily Load = Duration × RPE">Load</th>
              <th className="cd-th-notes">Notes / หมายเหตุ</th>
              <th className="cd-th-hist"></th>
            </tr>
          </thead>
          <tbody>
            {campPlayers.map(p=>{
              const w=get(p.id);
              const stress=w.stress||0, sleep=w.sleep||0, appetite=w.appetite||0;
              const wellness=w.mood||0, soreness=w.soreness||0, desire=w.desire||0;
              const total = stress+sleep+appetite+wellness+soreness+desire;
              const rpe   = w.rpe||0, duration=w.duration||0;
              const load  = rpe&&duration ? rpe*duration : 0;
              const hasData = total||rpe||duration;
              const totalColor = total>=48?'#16a34a':total>=30?'#ca8a04':total>0?'#dc2626':'';
              return (
                <tr key={p.id} className={`cd-tr ${hasData?'cd-tr-filled':''}`}>
                  {/* Player */}
                  <td className="cd-td-player">
                    <PlayerPhoto playerId={p.id} name={p.name} size={34}/>
                    <div className="cd-td-names">
                      <span className="cd-td-name">{p.name}</span>
                      <span className="cd-td-thai">{p.nick||p.thaiName||''}</span>
                    </div>
                    {campShirts[p.id]!=null&&<span className="cd-td-shirt">#{campShirts[p.id]}</span>}
                    <PosBadge pos={p.pos}/>
                  </td>

                  {/* Pre-training metrics */}
                  {viewMode === 'readiness' && PRE_COLS.map(c=>(
                    <td key={c.key} className="cd-td-num">
                      <MetricInput value={w[c.key]||0} onChange={v=>patch(p.id,{[c.key]:v})}/>
                    </td>
                  ))}

                  {/* Total */}
                  {viewMode === 'readiness' && (
                    <td className="cd-td-num">
                      <span className="cd-total-badge" style={total?{color:totalColor,borderColor:totalColor+'44',background:totalColor+'12'}:{}}>
                        {total||'–'}
                      </span>
                    </td>
                  )}
                  
                  {viewMode === 'readiness' && (
                    <td className="cd-td-num">
                      <input type="checkbox" style={{width: 18, height: 18, cursor: 'pointer', accentColor: '#ec4899'}} checked={!!w.period} onChange={e=>patch(p.id,{period:e.target.checked?1:0})}/>
                    </td>
                  )}
                  {viewMode === 'readiness' && (
                    <td className="cd-td-num">
                      <input type="number" step="0.1" className="cd-metric-input" style={{width: 50, padding: 4}}
                        value={w.temperature||''} placeholder="–"
                        onChange={e=>patch(p.id,{temperature:Number(e.target.value)||null})}/>
                    </td>
                  )}

                  {viewMode === 'hydration' && (
                    <td className="cd-td-num">
                      <input type="number" step="0.01" className="cd-metric-input" style={{width: 60}}
                        value={w.weight_before||''} placeholder="–"
                        onChange={e=>patch(p.id,{weight_before:Number(e.target.value)||0})}/>
                    </td>
                  )}
                  {viewMode === 'hydration' && (
                    <td className="cd-td-num">
                      <input type="number" step="0.01" className="cd-metric-input" style={{width: 60}}
                        value={w.weight_after||''} placeholder="–"
                        onChange={e=>patch(p.id,{weight_after:Number(e.target.value)||0})}/>
                    </td>
                  )}
                  {viewMode === 'hydration' && (
                    <td className="cd-td-num">
                      <span className="cd-total-badge" style={w.weight_before && w.weight_after ? {color: w.weight_after < w.weight_before ? '#dc2626' : '#16a34a', background: w.weight_after < w.weight_before ? '#dc262612' : '#16a34a12', fontSize:11} : {}}>
                        {w.weight_before && w.weight_after ? ((w.weight_after - w.weight_before)/w.weight_before * 100).toFixed(1)+'%' : '–'}
                      </span>
                    </td>
                  )}
                  {viewMode === 'hydration' && (
                    <td className="cd-td-num">
                      <span className="cd-total-badge" style={w.weight_before && w.weight_after && w.weight_before > w.weight_after ? {color: '#ca8a04', background: '#ca8a0412', fontSize:11} : {}}>
                        {w.weight_before && w.weight_after && w.weight_before > w.weight_after ? (1.5 * (w.weight_before - w.weight_after)).toFixed(1)+' L' : '–'}
                      </span>
                    </td>
                  )}

                  {/* Duration */}
                  <td className="cd-td-num">
                    <input type="number" min="0" max="300" className="cd-metric-input"
                      value={duration||''} placeholder="–"
                      onChange={e=>patch(p.id,{duration:Number(e.target.value)||0})}/>
                  </td>

                  {/* RPE */}
                  <td className="cd-td-num">
                    <MetricInput value={rpe} onChange={v=>patch(p.id,{rpe:v})}/>
                  </td>

                  {/* Daily Load */}
                  <td className="cd-td-num">
                    <span className="cd-load-val" style={load?{color:rpeColor(rpe)}:{}}>
                      {load||'–'}
                    </span>
                  </td>

                  {/* Notes */}
                  <td className="cd-td-notes">
                    <input className="cd-notes-input" placeholder="หมายเหตุ…"
                      value={w.notes||''}
                      onChange={e=>patch(p.id,{notes:e.target.value})}/>
                  </td>

                  <td className="cd-td-hist">
                    <button className="cd-hist-btn" title="History" onClick={()=>openHistory(p)}>📈</button>
                  </td>
                </tr>
              );
            })}

            {/* Average row */}
            {campPlayers.length > 1 && (() => {
              const filled = campPlayers.filter(p=>{ const w=get(p.id); return w.stress||w.sleep||w.mood||w.soreness||w.appetite||w.desire; });
              if (!filled.length) return null;
              const avg = k => (filled.reduce((s,p)=>(s+(get(p.id)[k]||0)),0)/filled.length).toFixed(1);
              const avgTotal = PRE_COLS.reduce((s,c)=>s+Number(avg(c.key)),0).toFixed(1);
              return (
                <tr className="cd-tr-avg">
                  <td className="cd-td-player" style={{fontStyle:'italic',color:'var(--fg-dim)'}}>
                    <span style={{paddingLeft:8}}>Average (n={filled.length})</span>
                  </td>
                  {PRE_COLS.map(c=>(
                    <td key={c.key} className="cd-td-num">
                      <span className="cd-avg-val" style={{color:scoreColor(Number(avg(c.key)))}}>{avg(c.key)}</span>
                    </td>
                  ))}
                  <td className="cd-td-num"><span className="cd-avg-val">{avgTotal}</span></td>
                  <td colSpan={2}></td>
                  <td colSpan={4}></td>
                  <td></td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>

      {/* ── History drawer ── */}
      {histPlayer&&(
        <div className="cd-hist-drawer">
          <div className="cd-hist-hd">
            <PlayerPhoto playerId={histPlayer.id} name={histPlayer.name} size={30}/>
            <span className="cd-hist-name">{histPlayer.name} ({histPlayer.nick||''}) — Readiness History</span>
            <button className="btn-ghost sm" onClick={()=>setHistPlayer(null)}>✕ Close</button>
          </div>
          <div className="cd-hist-body">
            {histData.length===0 ? <div className="callup-msg">No history yet</div> : (
              <table className="cd-hist-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Sess</th>
                    <th>🧠</th><th>😴</th><th>🍽</th><th>💊</th><th>💪</th><th>🔥</th>
                    <th>Total</th><th>Min</th><th>RPE</th><th>Load</th><th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {histData.map((h,i)=>{
                    const t=(h.stress||0)+(h.sleep||0)+(h.appetite||0)+(h.mood||0)+(h.soreness||0)+(h.desire||0);
                    const load=h.rpe&&h.duration?h.rpe*h.duration:0;
                    return (
                      <tr key={i}>
                        <td className="mono">{h.session_date}</td>
                        <td><span className={`cd-sess-badge ${h.session==='AM'?'am':'pm'}`}>{h.session}</span></td>
                        {[h.stress,h.sleep,h.appetite,h.mood,h.soreness,h.desire].map((v,j)=>(
                          <td key={j} className="mono" style={{color:scoreColor(v),textAlign:'center'}}>{v||'–'}</td>
                        ))}
                        <td className="mono" style={{fontWeight:600,color:scoreColor(t/6)}}>{t||'–'}</td>
                        <td className="mono">{h.duration||'–'}</td>
                        <td className="mono" style={{color:h.rpe?rpeColor(h.rpe):''}}>{h.rpe||'–'}</td>
                        <td className="mono">{load||'–'}</td>
                        <td style={{fontSize:11,color:'var(--fg-dim)'}}>{h.notes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AnatomyMap({ selectedParts, onChange, activeColor, readOnly }) {
  const parts = selectedParts ? selectedParts.split(',').filter(Boolean) : [];
  
  const togglePart = (key) => {
    if (readOnly) return;
    const next = parts.includes(key) 
      ? parts.filter(k => k !== key) 
      : [...parts, key];
    onChange(next.join(','));
  };

  const renderPart = (p) => {
    const isSelected = parts.includes(p.key);
    const fill = isSelected ? activeColor : 'rgba(255, 255, 255, 0.08)';
    const stroke = isSelected ? activeColor : 'rgba(255, 255, 255, 0.15)';
    const cursor = readOnly ? 'default' : 'pointer';
    const titleText = p.label;

    if (p.type === 'circle') {
      return (
        <circle 
          key={p.key} 
          cx={p.x} 
          cy={p.y} 
          r={p.r} 
          fill={fill} 
          stroke={stroke} 
          strokeWidth="1" 
          style={{ cursor, transition: 'all 0.2s' }}
          onClick={() => togglePart(p.key)}
        >
          <title>{titleText}</title>
        </circle>
      );
    } else {
      return (
        <rect 
          key={p.key} 
          x={p.x} 
          y={p.y} 
          width={p.w} 
          height={p.h} 
          rx={p.rx || 0} 
          fill={fill} 
          stroke={stroke} 
          strokeWidth="1" 
          style={{ cursor, transition: 'all 0.2s' }}
          onClick={() => togglePart(p.key)}
        >
          <title>{titleText}</title>
        </rect>
      );
    }
  };

  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', background: 'var(--bg-3)', padding: 12, borderRadius: 8, border: '1px solid var(--line-soft)', width: 'fit-content', margin: '0 auto' }}>
      {/* Front View */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Front (หน้า)</div>
        <svg width="100" height="190" viewBox="0 0 100 190" style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 6 }}>
          <path d={BODY_SILHOUETTE_PATH} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          {/* Collarbones */}
          <path d="M 38,28 Q 45,31 50,30 Q 55,31 62,28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          {/* Belly button */}
          <circle cx="50" cy="60" r="1" fill="rgba(255,255,255,0.15)" />
          {BODY_PARTS_INFO.filter(p => p.view === 'front').map(renderPart)}
        </svg>
      </div>

      {/* Back View */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Back (หลัง)</div>
        <svg width="100" height="190" viewBox="0 0 100 190" style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 6 }}>
          <path d={BODY_SILHOUETTE_PATH} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          {/* Spine */}
          <line x1="50" y1="28" x2="50" y2="76" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeDasharray="3,3" />
          {/* Shoulder blades */}
          <path d="M 38,36 Q 42,40 44,48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <path d="M 62,36 Q 58,40 56,48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          {/* Glutes line */}
          <path d="M 42,76 C 45,79 50,79 50,76 C 50,79 55,79 58,76" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          {BODY_PARTS_INFO.filter(p => p.view === 'back').map(renderPart)}
        </svg>
      </div>
    </div>
  );
}

function MicroAnatomyMap({ selectedParts, activeColor }) {
  const parts = selectedParts ? selectedParts.split(',').filter(Boolean) : [];
  if (parts.length === 0) return null;

  const renderPart = (p) => {
    const isSelected = parts.includes(p.key);
    if (!isSelected) return null;
    
    const factor = 0.2;
    if (p.type === 'circle') {
      return (
        <circle 
          key={p.key} 
          cx={p.x * factor} 
          cy={p.y * factor} 
          r={p.r * factor} 
          fill={activeColor} 
        />
      );
    } else {
      return (
        <rect 
          key={p.key} 
          x={p.x * factor} 
          y={p.y * factor} 
          width={p.w * factor} 
          height={p.h * factor} 
          rx={(p.rx || 0) * factor} 
          fill={activeColor} 
        />
      );
    }
  };

  return (
    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
      {/* Front */}
      <svg width="20" height="38" viewBox="0 0 20 38" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 3 }}>
        <g transform="scale(0.2)">
          <path d={BODY_SILHOUETTE_PATH} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          {BODY_PARTS_INFO.filter(p => p.view === 'front').map(renderPart)}
        </g>
      </svg>
      {/* Back */}
      <svg width="20" height="38" viewBox="0 0 20 38" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 3 }}>
        <g transform="scale(0.2)">
          <path d={BODY_SILHOUETTE_PATH} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          {BODY_PARTS_INFO.filter(p => p.view === 'back').map(renderPart)}
        </g>
      </svg>
    </div>
  );
}

const getPartsLabels = (selectedParts) => {
  const parts = selectedParts ? selectedParts.split(',').filter(Boolean) : [];
  return parts.map(k => {
    const p = BODY_PARTS_INFO.find(info => info.key === k);
    return p ? p.label.split(' ')[0] : k;
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// SQUAD TAB
// ══════════════════════════════════════════════════════════════════════════════
function SquadTab({ camp, campPlayers, campShirts }) {
  const [statusMap,    setStatusMap]    = useState(new Map());
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading,      setLoading]      = useState(true);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  
  const getInitialReportDate = () => {
    if (!camp.camp_date) return today;
    const start = camp.camp_date;
    const end = camp.camp_date_end || start;
    if (today < start) return start;
    if (today > end) return end;
    return today;
  };

  const [reportDate, setReportDate] = useState(getInitialReportDate);

  const exportInjuryReport = () => {
    const header = ['ลำดับ', 'ชื่อ', 'วันที่มีอาการ', 'รายละเอียดอาการบาดเจ็บ', 'วันพัก', 'ซ้อมได้หรือไม่', 'แพลน'];
    let i = 1;
    const rows = campPlayers
      .map(p => ({ p, st: statusMap.get(p.id)||{} }))
      .filter(({ st }) => st.status === 'injured' || st.status === 'sick' || st.status === 'modified')
      .map(({ p, st }) => [
        i++,
        p.nick || p.name,
        st.symptom_date || '',
        st.injury_note || '',
        st.rest_days || '',
        st.can_train || '',
        st.treatment_plan || ''
      ]);
    
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `injury_report_${todayStr()}.csv`;
    a.click();
  };

  useEffect(()=>{
    setLoading(true);
    fetch(`/api/camp-status?camp_id=${camp.id}&report_date=${reportDate}`)
      .then(r=>r.ok?r.json():{statuses:[]})
      .then(d=>{ const m=new Map(); for(const s of (d.statuses||[])) m.set(s.player_id,s); setStatusMap(m); })
      .catch(()=>{}).finally(()=>setLoading(false));
  },[camp.id, reportDate]);

  const getStatus=id=>statusMap.get(id)||{status:'available',injury_note:'',notes:''};
  const resolveStatus = (sObj) => {
    if (!sObj) return 'available';
    const rawStatus = sObj.status || 'available';
    if (rawStatus === 'injured' && isCanTrain(sObj.can_train)) {
      return 'modified';
    }
    return rawStatus;
  };
  const saveStatus=(pid,upd)=>{
    const merged={...getStatus(pid),...upd,camp_id:camp.id,player_id:pid,report_date:reportDate};
    setStatusMap(m=>new Map(m).set(pid,merged));
    fetch('/api/camp-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(merged)}).catch(console.error);
  };

  const counts=STATUS_OPTIONS.reduce((a,s)=>({...a,[s.key]:0}),{});
  campPlayers.forEach(p=>{ const k=resolveStatus(getStatus(p.id)); counts[k]=(counts[k]||0)+1; });
  const visible=filterStatus==='all'?campPlayers:campPlayers.filter(p=>resolveStatus(getStatus(p.id))===filterStatus);
  const sp=s=>({injured:0,sick:1,absent:2,resting:3,available:4}[s] || 4);
  const sorted=[...visible].sort((a,b)=>{
    const pa=sp(resolveStatus(getStatus(a.id))),pb=sp(resolveStatus(getStatus(b.id)));
    if(pa!==pb) return pa-pb;
    return (campShirts[a.id]||99)-(campShirts[b.id]||99);
  });

  const watchlist = sorted.filter(p => {
    const s = resolveStatus(getStatus(p.id));
    return s === 'injured' || s === 'sick' || s === 'modified';
  });
  const watchlistOut = watchlist.filter(p => {
    const s = resolveStatus(getStatus(p.id));
    return s === 'injured' || s === 'sick';
  });
  const watchlistModified = watchlist.filter(p => {
    const s = resolveStatus(getStatus(p.id));
    return s === 'modified';
  });
  const healthyList = sorted.filter(p => {
    const s = resolveStatus(getStatus(p.id));
    return s !== 'injured' && s !== 'sick' && s !== 'modified';
  });

  return (
    <div className="cd-squad-wrap">
      <div className="cd-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 5, marginRight: 10}}>
            <button 
              className="btn-ghost"
              onClick={() => {
                const d = new Date(reportDate); d.setDate(d.getDate() - 1);
                const prev = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                if (camp.camp_date && prev < camp.camp_date) return;
                setReportDate(prev);
              }}
              style={{padding: '4px 8px', borderRadius: 20, background: 'var(--bg-2)', border: '1px solid var(--line-soft)', cursor: 'pointer', color: 'var(--fg-base)'}}>
              ◀
            </button>
            <input 
              type="date" 
              value={reportDate}
              min={camp.camp_date || undefined}
              max={camp.camp_date_end || undefined}
              onChange={e => setReportDate(e.target.value)}
              style={{padding: '6px 12px', borderRadius: 20, border: '1px solid var(--line-soft)', background: 'var(--bg-2)', color: 'var(--fg-base)', outline: 'none', fontFamily: 'var(--font-ui)'}}
            />
            <button 
              className="btn-ghost"
              onClick={() => {
                const d = new Date(reportDate); d.setDate(d.getDate() + 1);
                const next = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                if (camp.camp_date_end && next > camp.camp_date_end) return;
                setReportDate(next);
              }}
              style={{padding: '4px 8px', borderRadius: 20, background: 'var(--bg-2)', border: '1px solid var(--line-soft)', cursor: 'pointer', color: 'var(--fg-base)'}}>
              ▶
            </button>
          </div>
          <button className={`chip ${filterStatus==='all'?'on':''}`} onClick={()=>setFilterStatus('all')}>All ({campPlayers.length})</button>
          {STATUS_OPTIONS.map(s=>counts[s.key]>0&&(
            <button key={s.key} className={`chip ${filterStatus===s.key?'on':''}`}
              onClick={()=>setFilterStatus(filterStatus===s.key?'all':s.key)}>
              {s.emoji} {s.label} ({counts[s.key]})
            </button>
          ))}
        </div>
        <button className="btn-ghost sm" style={{ color: 'var(--accent)' }} onClick={exportInjuryReport}>⬇ Export Injury Report</button>
      </div>

      {/* Medical Summary Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        padding: '0 24px',
        marginTop: 14,
        marginBottom: 4
      }}>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-soft)', padding: 14, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💚</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg)' }}>{(counts.available || 0) + (counts.resting || 0)}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-dim)', fontWeight: 500 }}>Ready to Play (Available/Rest)</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-soft)', padding: 14, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🩹</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg)' }}>{counts.modified || 0}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-dim)', fontWeight: 500 }}>Monitoring (Can Train)</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-soft)', padding: 14, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤕</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg)' }}>{(counts.injured || 0) + (counts.sick || 0)}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-dim)', fontWeight: 500 }}>Out (Injured/Sick)</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="callup-msg" style={{padding:40}}>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
          {filterStatus === 'all' ? (
            <>
              {watchlistOut.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🚨 Out of Action / No Train ({watchlistOut.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 10 }}>
                    {watchlistOut.map(p => (
                      <PlayerStatusCard key={p.id} player={p} status={getStatus(p.id)} camp={camp}
                        shirtNum={campShirts[p.id]} onSave={upd=>saveStatus(p.id,upd)}/>
                    ))}
                  </div>
                </div>
              )}

              {watchlistModified.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#eab308', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🩹 Monitoring / Can Train ({watchlistModified.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 10 }}>
                    {watchlistModified.map(p => (
                      <PlayerStatusCard key={p.id} player={p} status={getStatus(p.id)} camp={camp}
                        shirtNum={campShirts[p.id]} onSave={upd=>saveStatus(p.id,upd)}/>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-dim)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ✅ Healthy & Available Squad ({healthyList.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 10 }}>
                  {healthyList.map(p => (
                    <PlayerStatusCard key={p.id} player={p} status={getStatus(p.id)} camp={camp}
                      shirtNum={campShirts[p.id]} onSave={upd=>saveStatus(p.id,upd)}/>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-dim)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Filtered: {STATUS_OPTIONS.find(s=>s.key===filterStatus)?.label} ({sorted.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 10 }}>
                {sorted.map(p => (
                  <PlayerStatusCard key={p.id} player={p} status={getStatus(p.id)} camp={camp}
                    shirtNum={campShirts[p.id]} onSave={upd=>saveStatus(p.id,upd)}/>
                ))}
              </div>
              {sorted.length === 0 && <div className="callup-msg" style={{padding:30}}>No players match filter</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerStatusCard({ player, status, shirtNum, camp, onSave }) {
  const [open,setOpen]=useState(false);
  const [local,setLocal]=useState({status:'available',injury_note:'',notes:'',symptom_date:'',rest_days:'',can_train:'',treatment_plan:'',body_parts:'',...status});
  useEffect(()=>setLocal(p=>({...p,...status})),[status]);
  const displayStatus = (local.status === 'injured' && isCanTrain(local.can_train)) ? 'modified' : local.status;
  const st=STATUS_OPTIONS.find(s=>s.key===displayStatus)||STATUS_OPTIONS[0];
  const patch=u=>{
    const n={...local,...u};
    if ('injury_note' in u || 'symptom_date' in u) {
      const combined = `${n.symptom_date || ''} ${n.injury_note || ''}`;
      const detected = detectBodyPartsFromText(combined);
      if (detected.length > 0) {
        n.body_parts = detected.join(',');
      }
    }
    setLocal(n);
    onSave(n);
  };

  const handleStatusClick = (key) => {
    if (key === 'injured') {
      patch({ status: 'injured', can_train: 'no' });
    } else if (key === 'modified') {
      const nextCanTrain = isCanTrain(local.can_train) ? local.can_train : 'yes';
      patch({ status: 'modified', can_train: nextCanTrain });
    } else {
      patch({ status: key, can_train: '' });
    }
  };

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (open && camp?.id) {
      setHistoryLoading(true);
      fetch(`/api/camp-status?camp_id=${camp.id}&player_id=${player.id}`)
        .then(r => r.ok ? r.json() : { statuses: [] })
        .then(d => {
          setHistory(d.statuses || []);
        })
        .catch(err => console.error("Error fetching status history:", err))
        .finally(() => setHistoryLoading(false));
    }
  }, [open, camp?.id, player.id]);

  return (
    <div className={`cd-card ${open?'cd-card-open':''} cd-status-${displayStatus}`}>
      <div className="cd-card-top" onClick={()=>setOpen(v=>!v)}>
        <div className="cd-photo-wrap">
          <PlayerPhoto playerId={player.id} name={player.name} size={50}/>
          {shirtNum!=null&&<span className="cd-shirt">{shirtNum}</span>}
        </div>
        <div className="cd-info">
          <div className="cd-name">{player.name}</div>
          {player.thaiName&&<div className="cd-thai">{player.thaiName}</div>}
          <div className="cd-badges"><PosBadge pos={player.pos}/><ClubChip code={player.club} small/></div>
        </div>
        <div className="cd-status-pill" style={{background:st.color+'22',color:st.color,borderColor:st.color+'66'}}>
          {st.emoji} {st.label}
        </div>
        <span className="cd-chevron">{open?'▲':'▼'}</span>
      </div>
      <div className="cd-mini" style={{ padding: '8px 14px', background: 'var(--bg-2)', borderTop: '1px solid var(--line-soft)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {local.status === 'injured' || local.status === 'sick' || local.status === 'modified' ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', width: '100%' }}>
            <MicroAnatomyMap selectedParts={local.body_parts} activeColor={st.color} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--fg)', fontSize: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                <span>🩹 {local.injury_note || 'No description yet'}</span>
                {local.body_parts && getPartsLabels(local.body_parts).map((lbl, idx) => (
                  <span key={idx} style={{ fontSize: 9, background: st.color + '22', color: st.color, border: `1px solid ${st.color}44`, padding: '1px 4px', borderRadius: 4, fontWeight: 700 }}>
                    {lbl}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', fontSize: 11, color: 'var(--fg-dim)' }}>
                {local.symptom_date && <span>📅 Symptom: <strong>{local.symptom_date}</strong></span>}
                {local.rest_days && <span>⏳ Rest: <strong>{local.rest_days}</strong></span>}
                {local.can_train && <span>🏃 Train: <strong>{local.can_train}</strong></span>}
              </div>
              {local.treatment_plan && (
                <div style={{ fontSize: 11, color: 'var(--fg-dim)', borderTop: '1px dashed var(--line-soft)', paddingTop: 4, marginTop: 2 }}>
                  💊 <strong>Plan:</strong> {local.treatment_plan}
                </div>
              )}
            </div>
          </div>
        ) : local.notes ? (
          <span style={{ fontSize: 12, color: 'var(--fg-dim)' }}>📝 {local.notes}</span>
        ) : (
          <span className="cd-no-data" style={{ fontSize: 11, color: 'var(--fg-mute)', fontStyle: 'italic' }}>No active medical issues</span>
        )}
      </div>
      {open&&(
        <div className="cd-edit">
          <div className="cd-section">
            <div className="cd-section-label">Status</div>
            <div className="cd-status-row">
              {STATUS_OPTIONS.map(s=>(
                <button key={s.key} className={`cd-status-btn ${displayStatus===s.key?'on':''}`}
                  style={displayStatus===s.key?{background:s.color+'28',borderColor:s.color,color:s.color}:{}}
                  onClick={()=>handleStatusClick(s.key)}>{s.emoji} {s.label}</button>
              ))}
            </div>
            {(local.status==='injured'||local.status==='sick'||local.status==='modified')&&(
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12, background: 'var(--bg-2)', padding: 12, borderRadius: 8, border: '1px solid var(--line-soft)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>Medical Report (Daily Injury)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginBottom: 2 }}>วันที่มีอาการ (Symptom Date)</div>
                    <input className="camp-input" value={local.symptom_date||''} onChange={e=>patch({symptom_date:e.target.value})} placeholder="e.g. เมื่อวาน, 5/5/26"/>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginBottom: 2 }}>วันพัก (Rest Days)</div>
                    <input className="camp-input" value={local.rest_days||''} onChange={e=>patch({rest_days:e.target.value})} placeholder="e.g. 2 days, -"/>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginBottom: 2 }}>รายละเอียดอาการ (Injury Details)</div>
                  <textarea 
                    className="camp-input" 
                    rows={2} 
                    style={{ resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
                    value={local.injury_note||''} 
                    onChange={e=>patch({injury_note:e.target.value})} 
                    placeholder="e.g. Pain at both knee joints"
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginBottom: 2 }}>ซ้อมได้หรือไม่ (Can Train?)</div>
                  <input className="camp-input" value={local.can_train||''} onChange={e=>patch({can_train:e.target.value})} placeholder="e.g. ซ้อมได้, งดซ้อม, ซ้อมได้แต่ติดเทป"/>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginBottom: 2 }}>แพลนการรักษา (Treatment Plan)</div>
                  <input className="camp-input" value={local.treatment_plan||''} onChange={e=>patch({treatment_plan:e.target.value})} placeholder="e.g. งดกระโดด, กายภาพบำบัด"/>
                </div>
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--fg-dim)', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>ตำแหน่งอาการเจ็บ (Anatomy Location)</span>
                    <button 
                      type="button"
                      style={{ padding: '2px 8px', fontSize: 10, background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: 4, cursor: 'pointer' }}
                      onClick={() => {
                        const combinedText = `${local.symptom_date || ''} ${local.injury_note || ''}`;
                        const detected = detectBodyPartsFromText(combinedText);
                        if (detected.length > 0) {
                          patch({ body_parts: detected.join(',') });
                        }
                      }}
                    >
                      ✨ Auto-detect from text
                    </button>
                  </div>
                  <AnatomyMap 
                    selectedParts={local.body_parts || ''} 
                    onChange={val => patch({ body_parts: val })} 
                    activeColor={st.color} 
                    readOnly={false} 
                  />
                </div>
              </div>
            )}
          </div>
          <div className="cd-section">
            <div className="cd-section-label">Notes</div>
            <textarea className="camp-input" rows={2} style={{resize:'vertical',width:'100%',boxSizing:'border-box'}}
              placeholder="Notes…" value={local.notes||''} onChange={e=>patch({notes:e.target.value})}/>
          </div>

          {/* Treatment History Section */}
          <div className="cd-section" style={{ borderTop: '1px solid var(--line-soft)', marginTop: 12, paddingTop: 12 }}>
            <div className="cd-section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              📋 Treatment & Status History
            </div>
            {historyLoading ? (
              <div style={{ fontSize: 11, color: 'var(--fg-dim)', padding: '6px 0' }}>Loading history...</div>
            ) : history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', paddingRight: 4, marginTop: 6 }}>
                {history.map((h, index) => {
                  const hSt = STATUS_OPTIONS.find(s => s.key === h.status) || STATUS_OPTIONS[0];
                  return (
                    <div 
                      key={h.report_date || index} 
                      style={{ 
                        padding: 8, 
                        background: 'var(--bg-2)', 
                        border: '1px solid var(--line-soft)', 
                        borderRadius: 6, 
                        fontSize: 11,
                        borderLeft: `3px solid ${hSt.color}`,
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start'
                      }}
                    >
                      <MicroAnatomyMap selectedParts={h.body_parts} activeColor={hSt.color} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: 3 }}>
                          <span>{hSt.emoji} {hSt.label}</span>
                          <span className="mono" style={{ color: 'var(--fg-mute)' }}>{prettyDate(h.report_date)}</span>
                        </div>
                        {h.injury_note && (
                          <div style={{ color: 'var(--fg)', fontWeight: 500, marginBottom: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                            <span>{h.injury_note}</span>
                            {h.body_parts && getPartsLabels(h.body_parts).map((lbl, idx) => (
                              <span key={idx} style={{ fontSize: 8, background: hSt.color + '22', color: hSt.color, border: `1px solid ${hSt.color}44`, padding: '1px 3px', borderRadius: 4, fontWeight: 700 }}>
                                {lbl}
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', color: 'var(--fg-dim)', fontSize: 10 }}>
                          {h.symptom_date && <span>Symptom: <strong>{h.symptom_date}</strong></span>}
                          {h.rest_days && <span>Rest: <strong>{h.rest_days}</strong></span>}
                          {h.can_train && <span>Train: <strong>{h.can_train}</strong></span>}
                        </div>
                        {h.treatment_plan && (
                          <div style={{ color: 'var(--fg-dim)', fontSize: 10, marginTop: 2, fontStyle: 'italic', borderTop: '1px dashed var(--line-soft)', paddingTop: 2 }}>
                            Plan: {h.treatment_plan}
                          </div>
                        )}
                        {h.notes && (
                          <div style={{ color: 'var(--fg-dim)', fontSize: 10, marginTop: 2, background: 'var(--bg-3)', padding: '2px 4px', borderRadius: 4 }}>
                            Note: {h.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--fg-dim)', fontStyle: 'italic', padding: '6px 0' }}>No history logged for this camp.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PANEL
// ══════════════════════════════════════════════════════════════════════════════
function CampDetailPanel({ camp, players, onClose }) {
  const [activeTab,setActiveTab]=useState('session');
  const campPlayers=players.filter(p=>(camp.playerIds||[]).includes(p.id));
  const campShirts=camp.playerShirts||{};
  const dateStr=cdFmtDate(camp.camp_date,camp.camp_date_end);

  useEffect(()=>{
    const k=e=>{ if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown',k);
    return ()=>window.removeEventListener('keydown',k);
  },[onClose]);

  return (
    <div className="cd-overlay">
      <div className="cd-panel">
        <div className="cd-hd">
          <button className="btn-ghost sm" onClick={onClose}>← Back</button>
          <div className="cd-hd-main">
            <span className="cd-hd-title">{camp.name}</span>
            <span className="cd-hd-sub">
              {camp.team_level}{camp.competition&&` · ${camp.competition}`}
              {dateStr&&` · ${dateStr}`} · <span className="mono">{campPlayers.length}</span> players
            </span>
          </div>
          <div className="cd-tabs">
            <button className={`cd-tab ${activeTab==='session'?'on':''}`} onClick={()=>setActiveTab('session')}>📊 Readiness</button>
            <button className={`cd-tab ${activeTab==='gps'?'on':''}`} onClick={()=>setActiveTab('gps')}>🏃 GPS Performance</button>
            <button className={`cd-tab ${activeTab==='squad'?'on':''}`}   onClick={()=>setActiveTab('squad')}>🧑‍🤝‍🧑 Squad Status</button>
          </div>
          <button className="icon-btn close-x" onClick={onClose}>✕</button>
        </div>

        {campPlayers.length===0?(
          <div className="callup-msg" style={{padding:'60px',textAlign:'center'}}>
            No players called up yet.<br/><span className="dim">Add players in Call-up panel.</span>
          </div>
        ):activeTab==='session'?(
          <SessionTab camp={camp} campPlayers={campPlayers} campShirts={campShirts}/>
        ):activeTab==='gps'?(
          <GPSPerformanceTab camp={camp} campPlayers={campPlayers} campShirts={campShirts}/>
        ):(
          <SquadTab camp={camp} campPlayers={campPlayers} campShirts={campShirts}/>
        )}
      </div>
    </div>
  );
}

window.CampDetailPanel = CampDetailPanel;
window.CampSessionTab = SessionTab;
window.CampSquadTab = SquadTab;
