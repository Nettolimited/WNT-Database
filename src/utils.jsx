// Utility helpers + i18n
const { useState, useEffect, useMemo, useRef, useCallback } = React;

const I18N = {
  EN: {
    title: 'Player Database',
    subtitle: 'Thailand Women — Centralised Squad Registry',
    senior: 'Senior', u23: 'U23', u20: 'U20', u17: 'U17', u15: 'U15', all: 'All Squads',
    search: 'Search players, clubs, positions…',
    name: 'Name', pos: 'Pos', age: 'Age', dob: 'DOB', foot: 'Foot', height: 'Ht', club: 'Club',
    caps: 'Caps', intGoals: 'Int.G', apps: 'Apps', goals: 'Goals', assists: 'Asst', minutes: 'Mins',
    yellows: 'Y', reds: 'R', shirt: '#', team: 'Team',
    all_positions: 'All positions', all_foot: 'Any foot', all_ages: 'Any age',
    gk: 'GK', def: 'Defender', mid: 'Midfielder', fwd: 'Forward',
    players_found: 'players found',
    import: 'Import', exportCsv: 'Export CSV', exportXml: 'Export XML', addPlayer: 'Add player',
    edit: 'Edit', save: 'Save', cancel: 'Cancel', close: 'Close',
    overview: 'Overview', club_stats: 'Club season', nt_stats: 'National team', career: 'Career history',
    attributes: 'Attribute radar',
    pace: 'Pace', shooting: 'Shooting', passing: 'Passing', dribbling: 'Dribbling', defending: 'Defending', physical: 'Physical',
    drop_csv: 'Drop CSV / XML here', or_click: 'or click to browse',
    biography: 'Biography', from: 'From', to: 'To', period: 'Period',
    profile: 'Profile', condense: 'Condense', expand: 'Expand', sort_by: 'Sort:',
    no_players: 'No players match the current filters.',
    left: 'Left', right: 'Right', both: 'Both',
    tweaks_title: 'Tweaks',
    callup: 'Call-up Manager',
  },
  TH: {
    title: 'ฐานข้อมูลผู้เล่น',
    subtitle: 'ทีมชาติไทยหญิง — ทะเบียนนักเตะรวมศูนย์',
    senior: 'ชุดใหญ่', u23: 'U23', u20: 'U20', u17: 'U17', u15: 'U15', all: 'ทุกชุด',
    search: 'ค้นหาผู้เล่น สโมสร ตำแหน่ง…',
    name: 'ชื่อ', pos: 'ตน.', age: 'อายุ', dob: 'วันเกิด', foot: 'เท้า', height: 'สูง', club: 'สโมสร',
    caps: 'ทีมชาติ', intGoals: 'ปทศ.', apps: 'ลงสนาม', goals: 'ประตู', assists: 'แอสต์', minutes: 'นาที',
    yellows: 'เหลือง', reds: 'แดง', shirt: 'เบอร์', team: 'ชุด',
    all_positions: 'ทุกตำแหน่ง', all_foot: 'ทุกข้างเท้า', all_ages: 'ทุกอายุ',
    gk: 'ผู้รักษาประตู', def: 'กองหลัง', mid: 'กองกลาง', fwd: 'กองหน้า',
    players_found: 'คน',
    import: 'นำเข้า', exportCsv: 'ส่งออก CSV', exportXml: 'ส่งออก XML', addPlayer: 'เพิ่มผู้เล่น',
    edit: 'แก้ไข', save: 'บันทึก', cancel: 'ยกเลิก', close: 'ปิด',
    overview: 'สรุป', club_stats: 'สโมสรฤดูกาลปัจจุบัน', nt_stats: 'ทีมชาติ', career: 'ประวัติการเล่น',
    attributes: 'แผนภูมิคุณสมบัติ',
    pace: 'ความเร็ว', shooting: 'การยิง', passing: 'การจ่าย', dribbling: 'เลี้ยงบอล', defending: 'เกมรับ', physical: 'ร่างกาย',
    drop_csv: 'ลากไฟล์ CSV / XML มาวาง', or_click: 'หรือคลิกเพื่อเลือกไฟล์',
    biography: 'ข้อมูลส่วนตัว', from: 'จาก', to: 'ถึง', period: 'ช่วงเวลา',
    profile: 'โปรไฟล์', condense: 'ลด', expand: 'ขยาย', sort_by: 'เรียง:',
    no_players: 'ไม่พบผู้เล่นที่ตรงกับตัวกรองปัจจุบัน',
    left: 'ซ้าย', right: 'ขวา', both: 'ทั้งสองข้าง',
    tweaks_title: 'ปรับแต่ง',
    callup: 'แคมป์ทีมชาติ',
  },
};

function useI18n(lang) {
  return useCallback((k) => (I18N[lang] && I18N[lang][k]) || I18N.EN[k] || k, [lang]);
}

function ageFromDob(dob) {
  const d = new Date(dob);
  const now = new Date('2026-05-12');
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

// Hook — reactively reads a slot image URL, updates when any slot changes
function useSlotUrl(id) {
  const [url, setUrl] = useState(() => {
    const s = window._imageSlotGet?.(id);
    return (s?.u && /^data:image\//i.test(s.u)) ? s.u : null;
  });
  useEffect(() => {
    if (!id) return;
    const check = () => {
      const s = window._imageSlotGet?.(id);
      setUrl((s?.u && /^data:image\//i.test(s.u)) ? s.u : null);
    };
    check(); // initial read (slots may have loaded since mount)
    const unsub = window._imageSlotSubscribe?.(check);
    return () => unsub?.();
  }, [id]);
  return url;
}

function clubByCode(code) {
  return (window.TWNT_DATA.CLUBS).find(c => c.code === code) || { code, name: code, color: '#888', country: '' };
}

// ISO 3166-1 alpha-3 (+ football federation codes) → alpha-2 for flag emoji
const _A3_MAP = {
  // Football-federation codes (not ISO-3166, but TheSportsDB / common usage)
  ENG:'GB', SCO:'GB', WAL:'GB', NIR:'GB', IRL:'IE',
  // ISO-3166-1 alpha-3
  THA:'TH', JPN:'JP', KOR:'KR', CHN:'CN', USA:'US', GBR:'GB', TPE:'TW',
  PHL:'PH', IDN:'ID', SWE:'SE', DNK:'DK', SGP:'SG', MYS:'MY', VNM:'VN',
  AUS:'AU', FRA:'FR', DEU:'DE', BRA:'BR', ARG:'AR', ESP:'ES',
  ITA:'IT', NLD:'NL', POR:'PT', NOR:'NO',
  FIN:'FI', BEL:'BE', AUT:'AT', CHE:'CH', POL:'PL', CZE:'CZ',
  HUN:'HU', ROU:'RO', HRV:'HR', SRB:'RS', SVK:'SK', SVN:'SI',
  NZL:'NZ', CAN:'CA', MEX:'MX', COL:'CO', CHL:'CL', PER:'PE',
  URY:'UY', VEN:'VE', ECU:'EC', BOL:'BO', PRY:'PY',
  NGA:'NG', ZAF:'ZA', CMR:'CM', GHA:'GH', CIV:'CI', MAR:'MA',
  EGY:'EG', TUN:'TN', DZA:'DZ', SEN:'SN',
  MMR:'MM', LAO:'LA', KHM:'KH', BRN:'BN', TLS:'TL',
  IND:'IN', PAK:'PK', IRN:'IR', IRQ:'IQ', SAU:'SA', ARE:'AE',
  QAT:'QA', KWT:'KW', JOR:'JO', LBN:'LB', SYR:'SY', ISR:'IL',
  RUS:'RU', UKR:'UA', TUR:'TR', GRC:'GR',
  ISL:'IS', LUX:'LU', ALB:'AL', MKD:'MK', BIH:'BA', MNE:'ME',
  BLR:'BY', MDA:'MD', LTU:'LT', LVA:'LV', EST:'EE',
  ARM:'AM', AZE:'AZ', GEO:'GE', KAZ:'KZ', UZB:'UZ',
  TWN:'TW', HKG:'HK', PRK:'KP',
};
function flagEmoji(country) {
  if (!country) return '';
  let c = country.toUpperCase().trim();
  if (c.length === 3) c = _A3_MAP[c] || c.slice(0, 2);
  if (c.length !== 2) return '';
  // Regional indicator letters: A=0x1F1E6 … Z=0x1F1FF
  return String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65) +
         String.fromCodePoint(0x1F1E6 + c.charCodeAt(1) - 65);
}

function posGroup(pos) {
  return window.TWNT_DATA.POSITION_GROUPS[pos] || 'Other';
}

// CSV serialization (simple, quote-escaped)
function toCsv(players) {
  const headers = ['id','name','thaiName','pos','altPos','dob','foot','height','team','club','shirt','caps','intGoals',
    'apps','goals','assists','yellows','reds','minutes',
    'intApps','intG','intA','intY','intR','intMin',
    'pace','shooting','passing','dribbling','defending','physical'];
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g,'""') + '"';
    return s;
  };
  const rows = players.map(p => [
    p.id, p.name, p.thaiName, p.pos, (p.altPos||[]).join('|'), p.dob, p.foot, p.height,
    p.team, p.club, p.shirt, p.caps, p.intGoals,
    p.stats.apps, p.stats.goals, p.stats.assists, p.stats.yellows, p.stats.reds, p.stats.minutes,
    p.intStats.apps, p.intStats.goals, p.intStats.assists, p.intStats.yellows, p.intStats.reds, p.intStats.minutes,
    p.radar.pace, p.radar.shooting, p.radar.passing, p.radar.dribbling, p.radar.defending, p.radar.physical
  ].map(esc).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const parseLine = (line) => {
    const out = []; let cur = ''; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i+1] === '"') { cur += '"'; i++; }
        else if (c === '"') { inQ = false; }
        else { cur += c; }
      } else {
        if (c === ',') { out.push(cur); cur = ''; }
        else if (c === '"') { inQ = true; }
        else { cur += c; }
      }
    }
    out.push(cur);
    return out;
  };
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line, idx) => {
    const cells = parseLine(line);
    const r = {}; headers.forEach((h, i) => r[h] = cells[i] || '');
    return {
      id: r.id || ('imp_' + Date.now() + '_' + idx),
      name: r.name, thaiName: r.thaiName,
      pos: r.pos, altPos: (r.altPos || '').split('|').filter(Boolean),
      dob: r.dob, foot: r.foot || 'R', height: +r.height || 165,
      team: r.team || 'Senior', club: r.club || 'BG',
      shirt: +r.shirt || 0, caps: +r.caps || 0, intGoals: +r.intGoals || 0,
      stats: { apps:+r.apps||0, goals:+r.goals||0, assists:+r.assists||0, yellows:+r.yellows||0, reds:+r.reds||0, minutes:+r.minutes||0 },
      intStats: { apps:+r.intApps||0, goals:+r.intG||0, assists:+r.intA||0, yellows:+r.intY||0, reds:+r.intR||0, minutes:+r.intMin||0 },
      radar: { pace:+r.pace||10, shooting:+r.shooting||10, passing:+r.passing||10, dribbling:+r.dribbling||10, defending:+r.defending||10, physical:+r.physical||10 },
      career: [],
    };
  });
}

function toXml(players) {
  const esc = (s) => String(s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'})[c]);
  const out = ['<?xml version="1.0" encoding="UTF-8"?>', '<players>'];
  for (const p of players) {
    out.push(`  <player id="${esc(p.id)}">`);
    out.push(`    <name>${esc(p.name)}</name>`);
    out.push(`    <thaiName>${esc(p.thaiName||'')}</thaiName>`);
    out.push(`    <position primary="${esc(p.pos)}" alt="${esc((p.altPos||[]).join('|'))}"/>`);
    out.push(`    <dob>${esc(p.dob)}</dob>`);
    out.push(`    <foot>${esc(p.foot)}</foot>`);
    out.push(`    <height>${p.height}</height>`);
    out.push(`    <team>${esc(p.team)}</team>`);
    out.push(`    <club>${esc(p.club)}</club>`);
    out.push(`    <shirt>${p.shirt}</shirt>`);
    out.push(`    <caps>${p.caps}</caps>`);
    out.push(`    <intGoals>${p.intGoals}</intGoals>`);
    out.push(`    <club_stats apps="${p.stats.apps}" goals="${p.stats.goals}" assists="${p.stats.assists}" yellows="${p.stats.yellows}" reds="${p.stats.reds}" minutes="${p.stats.minutes}"/>`);
    out.push(`    <nt_stats apps="${p.intStats.apps}" goals="${p.intStats.goals}" assists="${p.intStats.assists}" yellows="${p.intStats.yellows}" reds="${p.intStats.reds}" minutes="${p.intStats.minutes}"/>`);
    out.push(`    <radar pace="${p.radar.pace}" shooting="${p.radar.shooting}" passing="${p.radar.passing}" dribbling="${p.radar.dribbling}" defending="${p.radar.defending}" physical="${p.radar.physical}"/>`);
    out.push(`  </player>`);
  }
  out.push('</players>');
  return out.join('\n');
}

function parseXml(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const nodes = doc.querySelectorAll('player');
  const out = [];
  nodes.forEach((n, idx) => {
    const q = (sel) => n.querySelector(sel);
    const attr = (sel, name) => { const e = q(sel); return e ? e.getAttribute(name) : ''; };
    const txt = (sel) => { const e = q(sel); return e ? e.textContent : ''; };
    const posEl = q('position');
    out.push({
      id: n.getAttribute('id') || ('imp_' + idx),
      name: txt('name'),
      thaiName: txt('thaiName'),
      pos: posEl?.getAttribute('primary') || 'CM',
      altPos: (posEl?.getAttribute('alt') || '').split('|').filter(Boolean),
      dob: txt('dob'), foot: txt('foot') || 'R', height: +txt('height') || 165,
      team: txt('team') || 'Senior', club: txt('club') || 'BG',
      shirt: +txt('shirt') || 0, caps: +txt('caps') || 0, intGoals: +txt('intGoals') || 0,
      stats: { apps:+attr('club_stats','apps')||0, goals:+attr('club_stats','goals')||0, assists:+attr('club_stats','assists')||0, yellows:+attr('club_stats','yellows')||0, reds:+attr('club_stats','reds')||0, minutes:+attr('club_stats','minutes')||0 },
      intStats: { apps:+attr('nt_stats','apps')||0, goals:+attr('nt_stats','goals')||0, assists:+attr('nt_stats','assists')||0, yellows:+attr('nt_stats','yellows')||0, reds:+attr('nt_stats','reds')||0, minutes:+attr('nt_stats','minutes')||0 },
      radar: { pace:+attr('radar','pace')||10, shooting:+attr('radar','shooting')||10, passing:+attr('radar','passing')||10, dribbling:+attr('radar','dribbling')||10, defending:+attr('radar','defending')||10, physical:+attr('radar','physical')||10 },
      career: [],
    });
  });
  return out;
}

function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const POS_ORDER = { 'GK': 1, 'CB': 2, 'LB': 3, 'RB': 4, 'LWB': 5, 'RWB': 6, 'CDM': 7, 'CM': 8, 'CAM': 9, 'RM': 10, 'LM': 11, 'RW': 12, 'LW': 13, 'ST': 14, 'CF': 15 };

function sortPlayersList(players, sortBy, shirts = {}) {
  return [...players].sort((a, b) => {
    if (sortBy === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }
    if (sortBy === 'age') {
      return (a.dob || '9999').localeCompare(b.dob || '9999'); 
    }
    if (sortBy === 'shirt') {
      const sA = shirts[a.id] || 999;
      const sB = shirts[b.id] || 999;
      if (sA !== sB) return sA - sB;
      return (a.name || '').localeCompare(b.name || '');
    }
    // Default is 'pos'
    const posA = POS_ORDER[a.pos] || 99;
    const posB = POS_ORDER[b.pos] || 99;
    if (posA !== posB) return posA - posB;
    return (a.name || '').localeCompare(b.name || '');
  });
}

Object.assign(window, {
  useI18n, ageFromDob, clubByCode, posGroup, flagEmoji, useSlotUrl,
  toCsv, parseCsv, toXml, parseXml, downloadFile, sortPlayersList,
});
