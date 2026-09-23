// Player list view with filters, sort, search, keyboard nav

const CHANGELOG = [
  {
    version: '1.3.16', date: '2026-09-23 · 14:45 ICT',
    title: 'Asian Games match-week agenda',
    items: [
      '📅 Schedule — เพิ่ม Agenda วันที่ 14–19 ก.ย. จำนวน 45 รายการตามข้อมูลทีม',
      '🏟 Match Days — คงรายการ Kick-off เดิมวันที่ 14 และ 17 ก.ย. เพื่อรักษาข้อมูลคู่แข่งขันและสนาม',
      '🚌 Relocation — บันทึกกำหนดการย้ายทีมไปโอซาก้าวันที่ 18 ก.ย. โดยแก้ปีจาก 2024 เป็น 2026 ให้ตรงกับแคมป์',
    ],
  },
  {
    version: '1.3.15', date: '2026-09-23 · 14:37 ICT',
    title: 'Asian Games camp closing data',
    items: [
      '📋 Wellness & BMI — เพิ่มข้อมูลวันที่ 20–21 ก.ย. ครบ 23 คน และคงวันที่ 22 ไว้ว่างตาม Source',
      '🏃 RPE & Hydration — เพิ่ม RPE และน้ำหนักก่อน–หลังวันที่ 19–21 ก.ย. ครบวันละ 23 คน',
      '🩺 Injury & Camp — เพิ่ม Injury วันที่ 19 ก.ย. 9 เคส วันที่ 20 ก.ย. 8 เคส และแก้วันสิ้นสุดแคมป์เป็น 22 ก.ย.',
    ],
  },
  {
    version: '1.3.14', date: '2026-09-19 · 10:34 ICT',
    title: 'Daily health data and Chinese Taipei match report',
    items: [
      '📋 Wellness & BMI — เพิ่มข้อมูลวันที่ 17 และ 19 ก.ย. ตาม Source สำหรับผู้เล่น 23 คน โดยคงช่อง Wellness ที่ต้นทางว่างไว้ 2 คน',
      '🏃 RPE & Hydration — เพิ่ม RPE และน้ำหนักก่อน–หลังวันที่ 17 ก.ย. ครบ 23 คน และไม่สร้างข้อมูลวันที่ 19 ที่ต้นทางยังไม่มี',
      '🩺 Injury & Match — เพิ่ม Injury Report วันที่ 18 ก.ย. 5 เคส พร้อมผลไทย 0–1 ไต้หวัน รายชื่อ และนาทีลงสนามจาก Match Report ทางการ',
    ],
  },
  {
    version: '1.3.13', date: '2026-09-16 · 09:26 ICT',
    title: 'Match statistics synchronization',
    items: [
      '🔄 Single Source — การแก้ผลแข่ง Lineup นาที และคู่เปลี่ยนตัวซิงก์กลับ Dashboard, Caps และ Minutes Played พร้อมกัน',
      '🧵 Ordered Save — เรียงคิวการบันทึกแต่ละนัด ป้องกันคำสั่งเก่าที่ตอบช้ากว่าเขียนทับข้อมูลล่าสุด',
      '✅ Server Verify — อ่านข้อมูลยืนยันจากเซิร์ฟเวอร์หลังบันทึก แล้วใช้ข้อมูลชุดเดียวกันอัปเดตทุกหน้าที่เปิดอยู่',
    ],
  },
  {
    version: '1.3.12', date: '2026-09-16 · 09:14 ICT',
    title: 'Japan match substitution correction',
    items: [
      '🔄 Substitutions — แก้คู่ Muay ออกนาที 58 และ Kanoon ลงนาที 58 ให้ตรงกับรายงานต้นทาง',
      '🔒 Explicit Pairing — บันทึกคู่เปลี่ยนตัวทั้ง 5 คู่โดยตรง ป้องกันระบบจับคู่จากจำนวนนาทีคลาดเคลื่อน',
      '✅ Statistics — ยืนยันตัวจริง 11 คน ตัวสำรองลง 5 คน และนาทีรวม 990 นาที',
    ],
  },
  {
    version: '1.3.11', date: '2026-09-16 · 09:05 ICT',
    title: 'Japan match result and minutes played',
    items: [
      '🏟 Match Log — อัปเดตผล Asian Games วันที่ 14 ก.ย. เป็น Thailand 0–8 Japan',
      '⏱ Minutes Played — บันทึกนาทีลงสนามผู้เล่น 23 คนจากรายงานการแข่งขัน',
      '👥 Lineup — บันทึกตัวจริง 11 คน ตัวสำรองที่ลงสนาม 5 คน และผู้เล่นไม่ได้ลงสนาม 7 คน',
    ],
  },
  {
    version: '1.3.10', date: '2026-09-16 · 08:57 ICT',
    title: 'Daily data update: 15–16 September',
    items: [
      '📋 Wellness & BMI — เพิ่มข้อมูลวันที่ 15–16 ก.ย. สำหรับผู้เล่น 23 คนตาม Google Sheets',
      '🏃 RPE & Hydration — เพิ่ม RPE และน้ำหนักก่อน–หลังซ้อมวันที่ 15 ก.ย. แยกเป็น PM',
      '🩺 Injury Report — เพิ่มรายงานวันที่ 15 ก.ย. จำนวน 15 เคส โดยไม่สร้างข้อมูลวันที่ 16 ที่ต้นทางยังไม่มี',
    ],
  },
  {
    version: '1.3.9', date: '2026-09-14 · 12:11 ICT',
    title: 'Staff category adjustment',
    items: [
      '👔 Staff & Roles — ย้ายบทบาท Manager ไปแสดงในฝั่ง Support & Medical Team',
      '🛡 Data Unchanged — คงชื่อตำแหน่งและข้อมูล Staff เดิมทั้งหมด',
    ],
  },
  {
    version: '1.3.8', date: '2026-09-14 · 12:06 ICT',
    title: 'Head Coach selector',
    items: [
      '⭐ Staff & Roles — เพิ่มตัวเลือกกำหนด Head Coach จากทีมงานในแคมป์',
      '🔄 Single Leader — เมื่อเลือกคนใหม่ ระบบเปลี่ยน Head Coach คนเดิมกลับเป็น Coach อัตโนมัติ',
      '🏕 Camp Specific — บันทึกตำแหน่งแยกตามแคมป์โดยไม่แก้ประวัติ Staff ส่วนกลาง',
    ],
  },
  {
    version: '1.3.7', date: '2026-09-14 · 06:55 ICT',
    title: 'Unique Squad Depth XI',
    items: [
      '⚽ Unique XI — ผู้เล่นหนึ่งคนแสดงได้เพียงตำแหน่งเดียวบนภาพสนาม Squad Depth',
      '🔄 Automatic Replacement — หากอันดับหนึ่งถูกใช้แล้ว ตำแหน่งถัดไปจะเลื่อนผู้เล่นอันดับต่อมาขึ้นแทน',
      '🛡 Data Unchanged — ไม่แก้ตำแหน่ง ความถนัด หรืออันดับผู้เล่นในฐานข้อมูล',
    ],
  },
  {
    version: '1.3.6', date: '2026-09-14 · 06:42 ICT',
    title: 'Asian Games group fixtures',
    items: [
      '🏟 Match Log — เพิ่ม ญี่ปุ่น 14 ก.ย., ไชนีสไทเป 17 ก.ย. และเวียดนาม 21 ก.ย. จากโปรแกรมทางการ',
      '🕘 Kick-off — บันทึกเวลาญี่ปุ่น/ไทยและสนาม พร้อมเชื่อมรายการ Kick-off เข้า Schedule ของแคมป์',
      '🔵 Upcoming — โปรแกรมที่ยังไม่แข่งขันไม่ถูกนับเป็นผลเสมอ 0–0 ในสถิติ',
    ],
  },
  {
    version: '1.3.5', date: '2026-09-13 · 21:20 ICT',
    title: 'Date-aware daily reports',
    items: [
      '📅 Daily Report — ซ่อนผู้เล่นที่ถูกตัดตัวหรือถอนตัวตั้งแต่วันถัดจากวันที่ตัด',
      '🕘 Historical View — วันตัดตัวยังแสดงผู้เล่น และรายงานย้อนหลังยังคงอยู่ครบ',
      '🔗 Data Center & Wellness — ใช้รายชื่อตามวันที่เดียวกันใน Dashboard, Daily Data Center และ Wellness Report',
    ],
  },
  {
    version: '1.3.4', date: '2026-09-13 · 21:03 ICT',
    title: 'Injury report — 13 September',
    items: [
      '🩺 Injury Report — นำเข้ารายงานวันที่ 13 กันยายนครบ 9 คนจาก Google Sheets',
      '🔎 Source Matching — จับคู่ Fern, Yee, Muay, Mook, Beam, Somcheng, Pleumjai, Mai และ Imm กับรายชื่อในแคมป์',
      '⚽ Data Preservation — ตรวจยืนยัน Match Log ยังอยู่ครบ 25 แมตช์หลังอัปเดต',
    ],
  },
  {
    version: '1.3.3', date: '2026-09-13 · 12:37 ICT',
    title: 'Clearer squad totals',
    items: [
      '👥 In Camp — แสดงยอดรวมรายชื่อแรกที่เรียกเข้าแคมป์',
      '🏁 Final Squad — แสดงจำนวนผู้เล่นที่เหลือ พร้อมยอด TOTAL, GK, DEF, MID และ FWD โดยไม่ต้องตั้งโควตา',
      '🚪 Exit Status — เอาสถานะบาดเจ็บออกจากการตัดตัว และนับข้อมูลบาดเจ็บเดิมเป็นออกจากแคมป์',
    ],
  },
  {
    version: '1.3.2', date: '2026-09-13 · 12:31 ICT',
    title: 'Automatic final squad',
    items: [
      '🏁 Auto Final Squad — เมื่อตัดตัวแบบหลายคน ผู้เล่นที่เหลือในทีมปัจจุบันจะเป็น Final Squad อัตโนมัติ',
      '🛡 Status Safety — ไม่ดึงผู้เล่นที่ตัดตัว ถอนตัว หรือบาดเจ็บอยู่แล้วกลับเข้า Final Squad',
      '🕘 Selection History — บันทึกผลผ่านการตัดตัวในประวัติของผู้เล่นที่ผ่านเข้าทีม',
    ],
  },
  {
    version: '1.3.1', date: '2026-09-13 · 12:21 ICT',
    title: 'Simpler selection decisions',
    items: [
      '✂ Selection Board — เอาช่องชื่อผู้บันทึกออกจากการเปลี่ยนสถานะทั้งรายคนและหลายคน',
      '✅ No Name Required — บันทึกได้โดยไม่จำกัดหรือบังคับชื่อผู้แก้ไข',
      '🕘 History — ยังคงเก็บวันที่ สถานะ เหตุผล และหมายเหตุของแต่ละคน',
    ],
  },
  {
    version: '1.3.0', date: '2026-09-13 · 12:17 ICT',
    title: 'Batch player selection',
    items: [
      '☑ Select Only — เลือกเฉพาะผู้เล่นที่ต้องการเปลี่ยนสถานะ โดยคนอื่นคงสถานะเดิม',
      '✂ Batch Decision — ตัดตัว ถอนตัว หรือระบุบาดเจ็บหลายคนพร้อมกันได้',
      '🕘 Audit Trail — ใช้วันที่ เหตุผล ผู้แก้ไข และหมายเหตุเดียวกัน พร้อมเก็บประวัติแยกรายคน',
    ],
  },
  {
    version: '1.2.2', date: '2026-09-13 · 12:11 ICT',
    title: 'Camp schedules — 6 to 13 September',
    items: [
      '📅 Schedule — เพิ่มกำหนดการวันที่ 6, 9, 10, 11, 12 และ 13 กันยายน รวม 48 กิจกรรม',
      '⚽ Match Preparation — เพิ่มแผน MD-3, MD-2 และ MD-1 พร้อมเวลาเดินทาง ประชุม และฝึกซ้อม',
      '🛡 Duplicate Check — ตรวจข้อมูลเดิมก่อนบันทึกและยืนยันกิจกรรมครบทุกวันที่ส่งมา',
    ],
  },
  {
    version: '1.2.1', date: '2026-09-13 · 11:58 ICT',
    title: 'Daily wellness — 13 September',
    items: [
      '📊 Wellness & BMI — นำเข้าข้อมูลวันที่ 13 กันยายนครบ 23 คนตาม Google Sheets',
      '🧭 Source Integrity — ไม่เติม RPE หรือ Injury เนื่องจากต้นทางวันที่ 13 กันยายนยังไม่มีข้อมูล',
      '⚽ Data Preservation — ตรวจยืนยัน Match Log ยังอยู่ครบ 25 แมตช์หลังอัปเดต',
    ],
  },
  {
    version: '1.2.0', date: '2026-09-12 · 21:19 ICT',
    title: 'Selection Board and final squad',
    items: [
      '📋 Selection Flow — รองรับ เรียกตัว, เข้าแคมป์, Final Squad, ตัดตัว, ถอนตัว และบาดเจ็บ',
      '🕘 Decision History — บันทึกวันที่ เหตุผล ผู้แก้ไข หมายเหตุ และเก็บประวัติทุกครั้ง',
      '🎯 Live Quotas — แสดงจำนวน Final Squad แยก GK, DEF, MID, FWD พร้อมโควตาที่แก้ไขได้',
      '🛡 Historical Safety — เก็บรายชื่อแรกและข้อมูลแคมป์เดิมไว้แม้ถูกตัดหรือถอนตัว',
    ],
  },
  {
    version: '1.1.19', date: '2026-09-12 · 20:44 ICT',
    title: 'September 12 daily data',
    items: [
      '❤️ Wellness — นำเข้าข้อมูลช่วงเช้าวันที่ 12 กันยายนครบ 23 คนตามต้นทาง',
      '⚖️ BMI — อัปเดตน้ำหนักเช้าวันที่ 12 กันยายนครบ 23 คน',
      '🤕 Injury Report — บันทึกรายงานวันที่ 12 กันยายน 7 เคส และไม่สร้างค่า RPE ที่ต้นทางยังว่าง',
      '🛡 Data Check — ตรวจยืนยัน Match Log ยังอยู่ครบ 25 แมตช์หลังอัปเดต',
    ],
  },
  {
    version: '1.1.18', date: '2026-09-12 · 06:22 ICT',
    title: 'Daily Data Center',
    items: [
      '✅ Daily Data — เพิ่มหน้าตรวจความครบของ Wellness, BMI, RPE และสถานะการแพทย์รายวันในแต่ละแคมป์',
      '📅 Schedule-aware RPE — คาดหวัง RPE เฉพาะวันที่มี Training หรือ Match และแยก AM/PM',
      '🔎 Missing Reasons — แยกข้อมูลขาด ไม่เข้าแคมป์ และไม่ได้ฝึกอย่างชัดเจนโดยไม่เติมค่าทดแทน',
    ],
  },
  {
    version: '1.1.17', date: '2026-09-12 · 06:22 ICT',
    title: 'Interactive squad formations',
    items: [
      '⚽ Formation Picker — เพิ่มแถบเลือกแผนที่เห็นชัดเหนือสนาม Squad Depth',
      '🔄 Auto Layout — ตำแหน่ง ผู้เล่น และการวิเคราะห์ความลึกปรับทันทีตามแผนที่เลือก',
      '📐 More Systems — รองรับ 4-3-3, 4-2-3-1, 3-4-3, 4-4-2 และ 3-5-2',
    ],
  },
  {
    version: '1.1.16', date: '2026-09-11 · 22:40 ICT',
    title: 'Real player wellness trend',
    items: [
      '📈 Wellness Trend — เปลี่ยนกราฟแท่งจำลองเป็นกราฟเส้นข้อมูลจริงย้อนหลัง 28 วัน',
      '🎛 Metric Filter — เลือกดู Readiness, Sleep, Stress, Soreness, Mood, Appetite และ Desire',
      '🔎 Honest Data — แสดงค่าล่าสุดพร้อมวันที่และเว้นช่องว่างในวันที่ไม่มีข้อมูล โดยไม่สร้างค่าทดแทน',
    ],
  },
  {
    version: '1.1.15', date: '2026-09-11 · 22:36 ICT',
    title: 'Camp-based team and shirt number',
    items: [
      '👤 Player Profile — นำชุดทีมชาติและหมายเลขเสื้อออกจากข้อมูลประจำตัวผู้เล่น',
      '🏕 Camp Source — ชุดทีมชาติและหมายเลขเสื้อให้อ้างอิงจากรายชื่อของแต่ละแคมป์แทน',
      '🛡 Data Preservation — ซ่อนช่องจากหน้าผู้เล่นโดยไม่ลบข้อมูลเดิมในฐานข้อมูล',
    ],
  },
  {
    version: '1.1.14', date: '2026-09-11 · 22:27 ICT',
    title: 'Accurate average age',
    items: [
      '🎂 AVG AGE — คำนวณเฉพาะผู้เล่นที่มีวันเกิดถูกต้อง ไม่ใช้ผู้เล่นที่ไม่มีอายุเป็นตัวหาร',
      '🏕 Camp Dashboard — ใช้หลักการคำนวณอายุเฉลี่ยเดียวกันในแต่ละแคมป์',
      '📊 Age Distribution — ไม่นับผู้เล่นที่ไม่มีวันเกิดเป็นกลุ่ม U18',
    ],
  },
  {
    version: '1.1.13', date: '2026-09-11 · 22:19 ICT',
    title: 'Version history',
    items: [
      '🕘 Version History — กดกล่องเวอร์ชันมุมซ้ายล่างเพื่อดูประวัติการแก้ไขทั้งหมด',
      '⌨️ Accessibility — เปิดประวัติได้ด้วยเมาส์ ปุ่ม Enter หรือ Space',
    ],
  },
  {
    version: '1.1.12', date: '2026-09-11 · 22:16 ICT',
    title: 'Dashboard header logo fit',
    items: [
      '🖼️ Header Logo — ปรับโลโก้ด้านขวาบนของ Dashboard ให้แสดงเต็มภาพเหมือนโลโก้ด้านซ้าย',
      '📐 Consistency — ใช้การแสดงผลแบบ contain ทั้งสองตำแหน่งโดยไม่ครอปขอบ',
    ],
  },
  {
    version: '1.1.11', date: '2026-09-11 · 22:12 ICT',
    title: 'Sidebar logo fit',
    items: [
      '🖼️ Logo — ปรับโลโก้ Thailand WNT ให้แสดงเต็มภาพในกรอบโดยไม่ครอปด้านล่าง',
      '📐 Layout — คงขนาดกรอบและสัดส่วนเดิมของแถบด้านข้าง',
    ],
  },
  {
    version: '1.1.10', date: '2026-09-11 · 22:05 ICT',
    title: 'Daily camp data update',
    items: [
      '❤️ Wellness — วันที่ 10 กันยายน บันทึก 11 คนตามข้อมูลที่กรอกครบในต้นทาง',
      '⚖️ BMI — วันที่ 10 กันยายน บันทึกน้ำหนักเช้าครบ 23 คน',
      '🤕 Injury Report — วันที่ 11 กันยายน บันทึก 3 เคส',
      '🔍 Data Check — ยืนยัน Match Log ยังอยู่ครบ 25 แมตช์ และไม่เติมค่าที่ต้นทางว่าง',
    ],
  },
  {
    version: '1.1.9', date: '2026-09-05 · 13:38 ICT',
    items: [
      '⚽ Match Log Resilience — ใช้ข้อมูลจาก App เป็นสำรองและไม่ล้างรายการเมื่อ API ตัวใดตัวหนึ่งสะดุด',
      '🔍 Data Check — ยืนยัน Match Log ในฐานข้อมูลยังอยู่ครบ 25 แมตช์',
    ],
  },
  {
    version: '1.1.8', date: '2026-09-04 · 00:59 ICT',
    items: [
      '🤕 Injury Report — นำเข้ารายงานคืนวันที่ 3 กันยายน 16 เคส รวมเป็น 15 รายชื่อนักกีฬา',
      '🔗 Full Local API — หน้า Dashboard, Daily Report และหน้าแคมป์ใช้ฐานข้อมูลออนไลน์เมื่อเปิดผ่าน file://',
      '📋 Source Audit — Wellness/RPE วันที่ 3 มีอยู่แล้ว; BMI ล่าสุดยังเป็นวันที่ 2 กันยายน และวันที่ 4 ยังว่าง',
    ],
  },
  {
    version: '1.1.7', date: '2026-09-03 · 19:45 ICT',
    items: [
      '⚽ Local Match Log — โหลดประวัติการแข่งขันและวิดีโอจากฐานข้อมูลออนไลน์เมื่อเปิดผ่าน file://',
      '🛡 Data Preservation — แก้เฉพาะเส้นทางเชื่อมต่อ ไม่มีการลบหรือเขียนทับ Match Log เดิม',
    ],
  },
  {
    version: '1.1.6', date: '2026-09-03 · 19:30 ICT',
    items: [
      '🔗 Local Live Data — หน้าเว็บที่เปิดจาก file:// เชื่อมฐานข้อมูลออนไลน์แทนข้อมูลสำรองเก่า',
      '🏟 Accurate Caps — Squad Depth แสดง Caps จากข้อมูลจริงและ Match Log ล่าสุด',
    ],
  },
  {
    version: '1.1.5', date: '2026-09-03 · 18:45 ICT',
    items: [
      '📊 Daily Data — นำเข้า RPE และน้ำหนักก่อน–หลังซ้อมช่วงเย็นวันที่ 2–3 กันยายน รวม 52 รายการ',
      '✅ Source Check — ตรงกันระหว่าง Readiness และ Dehydration; ข้าม Muay/Rooney ที่ยังไม่เข้าแคมป์',
      '⏱ Duration Pending — เก็บ RPE แล้วโดยไม่เดาระยะเวลาซ้อมที่ต้นทางยังไม่ระบุ',
    ],
  },
  {
    version: '1.1.4', date: '2026-09-02 · 18:00 ICT',
    items: [
      '🏕 Camp Filter — กรอง Squad Depth เฉพาะผู้เล่นที่ถูกเรียกในแต่ละแคมป์',
      '🗓 Historical Camp View — ดูขุมกำลังตามรายชื่อจริงของแคมป์ย้อนหลัง',
      '🔄 Combined Filters — เลือก Camp, Squad และ Formation ร่วมกันได้',
    ],
  },
  {
    version: '1.1.3', date: '2026-09-02 · 13:05 ICT',
    items: [
      '🖼 Squad Depth Photo Crop — ใช้สัดส่วนและตำแหน่งครอปรูปเดียวกับหน้า Profile',
      '▢ Photo Frame — ปรับรูปบนสนามและในรายชื่อเป็นสี่เหลี่ยมมุมมนโดยไม่ยืดภาพ',
    ],
  },
  {
    version: '1.1.2', date: '2026-09-02 · 12:55 ICT',
    items: [
      '🖼 Local Photo Sync — เปิดเว็บจากไฟล์ในเครื่องแล้วยังโหลดรูปจากคลังออนไลน์ได้',
      '📐 Squad Depth Cards — ปรับขนาดการ์ดและตัดชื่อยาวให้อยู่ในกรอบ',
    ],
  },
  {
    version: '1.1.1', date: '2026-09-02 · 12:35 ICT',
    items: [
      '📷 Squad Depth Photos — แสดงรูปผู้เล่นบนสนามและรายชื่อความลึกแต่ละตำแหน่ง',
      '🏆 Senior Open Age — Senior รวมผู้เล่นทุกช่วงอายุโดยไม่จำกัดทีมเยาวชนเดิม',
    ],
  },
  {
    version: '1.1.0', date: '2026-09-02 · 12:00 ICT',
    items: [
      '▦ Squad Depth — เพิ่มแท็บวิเคราะห์ความลึกของขุมกำลังจากเมนูด้านซ้าย',
      '⚽ Formation View — ดูตัวเลือกผู้เล่นบนสนามในระบบ 4-3-3, 4-2-3-1 และ 3-4-3',
      '⚠ Position Analysis — แจ้งเตือนตำแหน่งที่มีตัวเลือกคุณภาพไม่เพียงพอ',
      '👥 Depth Ranking — จัดอันดับด้วย Position Proficiency และจำนวนเกมทีมชาติ',
      '↗ Player Drill-down — กดรายชื่อเพื่อเปิดโปรไฟล์ผู้เล่นได้ทันที',
    ],
  },
  {
    version: '1.0.6', date: '2026-08-31 · 23:22 ICT',
    items: [
      '🗂 Position Groups — แยกตำแหน่งเป็น Attack, Midfield และ Defense & Goalkeeper',
      '🌐 English Position UI — เปลี่ยนคำอธิบายความถนัดเป็นภาษาอังกฤษสำหรับโค้ชต่างชาติ',
      '🎨 Clear Proficiency Labels — ใช้ Very Strong, Strong, Can Play และ Backup แทนเลข Level',
    ],
  },
  {
    version: '1.0.5', date: '2026-08-31 · 23:18 ICT',
    items: [
      '🧩 Position Level Matrix — เลือกตำแหน่งและ Level ได้ในคลิกเดียว',
      '👀 Clearer Editor — แสดงทุกตำแหน่งเป็นแถว อ่านง่ายและไม่ใช้ dropdown ซ้อน',
      '📱 Responsive Layout — ตาราง Level ปรับเป็นคอลัมน์เดียวบนหน้าจอเล็ก',
    ],
  },
  {
    version: '1.0.4', date: '2026-08-31 · 23:02 ICT',
    items: [
      '🎚 Position Levels — กำหนด Level 1–5 แยกให้แต่ละตำแหน่งได้',
      '🟢 Equal Proficiency — หลายตำแหน่งใช้ Level และสีเดียวกันได้',
      '💾 Backward Compatible — ข้อมูลตำแหน่งเดิมยังแสดงผลและแก้ไขต่อได้',
    ],
  },
  {
    version: '1.0.3', date: '2026-08-31 · 22:55 ICT',
    items: [
      '✎ Player Editor — แก้ไขข้อมูลผู้เล่นรายบุคคลจากหน้า Front-end ได้โดยตรง',
      '⚽ Position Pitch — แสดงตำแหน่งและระดับความถนัดบนสนามฟุตบอล',
      '☑ Multi-choice Position — เลือกตำแหน่งรองด้วยปุ่มและจัดอันดับตามลำดับที่กด',
      '🕘 Release Info — แสดงเวอร์ชัน วัน เวลา และประวัติการอัปเดต',
    ],
  },
  {
    version: '1.7', date: '2026-05-23',
    items: [
      '📊 Dashboard — หน้าหลักใหม่แบบ Overview แสดง KPI / ผลแมตท์ / Top Performers',
      '🏟 Club Logo URL — วาง URL โลโก้สโมสรได้โดยตรง',
      '📸 Player Photo URL — วาง URL รูปผู้เล่นได้โดยตรง',
      '🏕 Camp Detail — Wellness รายวัน AM/PM + Export/Import CSV',
      '🧠 Wellness Form — สเกล 1-10 ครบ: Sleep / Stress / Appetite / Mood / Soreness / Desire',
    ],
  },
  {
    version: '1.6', date: '2025-05-18',
    items: [
      '🎬 Video Analysis — บันทึก Match Film / Scouting / Highlight ลิงก์ YouTube/Vimeo',
      '🔗 Video เชื่อมกับ Match Log — ดูวิดีโอของแต่ละแมตท์ได้',
      '🔒 Private Match — แมตท์อุ่นเครื่องปิด ไม่นับสถิติทางการ',
      '🌍 Country Search — เลือกประเทศคู่แข่งจาก 200+ ชาติ FIFA',
      '⚡ Auto-fill — เลือกแมตท์ใน Video form แล้วชื่อขึ้นให้อัตโนมัติ',
    ],
  },
  {
    version: '1.5', date: '2025-05-17',
    items: [
      '📅 Match Log — บันทึกผลแมตท์ + Starting XI + สถิติผู้เล่น',
      '📊 Auto Stats — CAPS / GOALS / ASSISTS / MINS คำนวณจาก Match Log',
      '🏟 Clubs Manager — เพิ่ม/แก้ไขสโมสรได้',
      '📋 Call-up Panel — สร้างรายชื่อเรียกติดทีม',
    ],
  },
  {
    version: '1.4', date: '2025-05-15',
    items: [
      '☁️ Cloudflare D1 — ข้อมูลผู้เล่นเก็บบน cloud database',
      '📸 Player Photos — อัปโหลดรูปผู้เล่นได้',
      '🎨 Theme Tweaks — เปลี่ยนสี Palette / Font scale / Density',
    ],
  },
  {
    version: '1.0', date: '2025-05-10',
    items: [
      '👤 Player Database — เพิ่ม/แก้ไข/ลบผู้เล่น',
      '📋 Profile Panel — ข้อมูลละเอียด + Radar chart',
      '🔍 Filter & Sort — กรองตาม Position / Age / Foot',
    ],
  },
];

function InfoModal({ onClose }) {
  return (
    <div className="info-backdrop" onClick={onClose}>
      <div className="info-modal" onClick={e => e.stopPropagation()}>
        <div className="info-hd">
          <span className="info-title">ประวัติการแก้ไข · Version History</span>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="info-body">
          {CHANGELOG.map(cl => (
            <div key={cl.version} className="info-block">
              <div className="info-ver-row">
                <span className="info-ver">v{cl.version}</span>
                <span className="info-date">{cl.date}</span>
              </div>
              <ul className="info-list">
                {cl.items.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="info-foot">Thailand Women's National Team · Internal Tool</div>
      </div>
    </div>
  );
}

const SORT_KEYS = [
  { k: 'name', lab: 'name', num: false },
  { k: 'age', lab: 'age', num: true },
  { k: 'pos', lab: 'pos', num: false },
  { k: 'club', lab: 'club', num: false },
  { k: 'caps', lab: 'caps', num: true },
  { k: 'intGoals', lab: 'intGoals', num: true },
  { k: 'minutes', lab: 'minutes', num: true },
];

function valueFor(p, k, ms) {
  if (k === 'age') return ageFromDob(p.dob);
  const s = ms?.get(p.id);
  // All columns use NT data — match log first, then manual NT fields as fallback
  if (k === 'caps')     return s?.apps    ?? p.caps     ?? 0;
  if (k === 'intGoals') return s?.goals   ?? p.intGoals ?? 0;
  if (k === 'apps')     return s?.apps    ?? p.caps     ?? p.intStats?.apps    ?? 0;
  if (k === 'goals')    return s?.goals   ?? p.intGoals ?? p.intStats?.goals   ?? 0;
  if (k === 'assists')  return s?.assists ?? p.intStats?.assists ?? 0;
  if (k === 'minutes')  return s?.minutes ?? p.intStats?.minutes ?? 0;
  if (k === 'yellows')  return s?.yellows ?? p.intStats?.yellows ?? 0;
  if (k === 'reds')     return s?.reds    ?? p.intStats?.reds    ?? 0;
  return p[k];
}

function EditableSubtitle({ defaultText }) {
  const KEY = 'twnt.subtitle';
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(() => {
    try { return localStorage.getItem(KEY) || defaultText; } catch { return defaultText; }
  });
  const save = (v) => {
    try { localStorage.setItem(KEY, v); } catch {}
    setEditing(false);
  };
  if (editing) return (
    <input className="brand-sub-input"
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={() => save(value)}
      onKeyDown={e => { if (e.key === 'Enter') save(value); if (e.key === 'Escape') setEditing(false); }}
      autoFocus/>
  );
  return (
    <div className="brand-sub editable-sub" onClick={() => setEditing(true)} title="Click to edit">
      {value}<span className="sub-edit-ico">✎</span>
    </div>
  );
}

function PlayerList({ players, matchStats = new Map(), onSelect, onImport, onExportCsv, onExportXml, onAddPlayer, onCallup, onMatchday, onClubs, onVideo, onDashboard, t, lang, density, apiReady }) {
  const [filterTeam, setFilterTeam] = useState('All');
  const [filterPosGroup, setFilterPosGroup] = useState('All');
  const [filterFoot, setFilterFoot] = useState('Any');
  const [filterAge, setFilterAge] = useState('Any');
  const [search, setSearch] = useState('');
  const [sortK, setSortK] = useState('caps');
  const [sortDir, setSortDir] = useState(-1);
  const [focusIdx, setFocusIdx] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const listRef = useRef();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return players.filter(p => {
      // Senior is open age: youth-team tags must not hide eligible players.
      if (filterTeam !== 'All' && filterTeam !== 'Senior' && p.team !== filterTeam) return false;
      if (filterPosGroup !== 'All' && posGroup(p.pos) !== filterPosGroup) return false;
      if (filterFoot !== 'Any' && p.foot !== filterFoot) return false;
      if (filterAge !== 'Any') {
        const a = ageFromDob(p.dob);
        if (filterAge === 'U18' && a >= 18) return false;
        if (filterAge === '18-23' && (a < 18 || a > 23)) return false;
        if (filterAge === '24-29' && (a < 24 || a > 29)) return false;
        if (filterAge === '30+' && a < 30) return false;
      }
      if (q) {
        const hay = [p.name, p.thaiName||'', p.nick||'', p.pos, p.club, clubByCode(p.club).name, p.team]
          .join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [players, filterTeam, filterPosGroup, filterFoot, filterAge, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = valueFor(a, sortK, matchStats), vb = valueFor(b, sortK, matchStats);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * sortDir;
      return String(va).localeCompare(String(vb)) * sortDir;
    });
    return arr;
  }, [filtered, sortK, sortDir]);

  useEffect(() => { setFocusIdx(0); }, [filterTeam, filterPosGroup, filterFoot, filterAge, search, sortK, sortDir]);

  useEffect(() => {
    const k = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(sorted.length-1, i+1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx(i => Math.max(0, i-1)); }
      else if (e.key === 'Enter' && sorted[focusIdx]) { e.preventDefault(); onSelect(sorted[focusIdx]); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [sorted, focusIdx, onSelect]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-row-idx="${focusIdx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [focusIdx]);

  const toggleSort = (k) => {
    if (sortK === k) setSortDir(d => -d);
    else { setSortK(k); setSortDir(1); }
  };

  const teams = ['All', ...window.TWNT_DATA.TEAMS];
  const posGroups = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  const ageBuckets = ['Any', 'U18', '18-23', '24-29', '30+'];
  const feet = ['Any', 'L', 'R', 'B'];

  return (
    <div className="list-view">
      {/* Header */}
      <header className="topbar">
        <div className="topbar-actions">
          <button className="btn-ghost" onClick={onAddPlayer}>+ {t('addPlayer')}</button>
          <button className="btn-ghost" onClick={() => setImportOpen(true)}>⬇ {t('import')}</button>
          <button className="btn-ghost" onClick={onExportCsv}>⬆ CSV</button>
          <button className="btn-ghost" onClick={onExportXml}>⬆ XML</button>
          <button className="btn-ghost btn-info" onClick={() => setInfoOpen(true)} title="Version info">ℹ</button>
        </div>
      </header>

      {infoOpen && <InfoModal onClose={() => setInfoOpen(false)}/>}

      {/* Team selector — large segmented control */}
      <div className="team-tabs">
        {teams.map(tm => (
          <button key={tm} className={`team-tab ${filterTeam===tm?'on':''}`} onClick={() => setFilterTeam(tm)}>
            <span className="tt-name">{tm === 'All' ? t('all') : tm === 'Senior' ? t('senior') : tm}</span>
            <span className="tt-count mono">{players.filter(p => tm === 'All' || tm === 'Senior' || p.team === tm).length}</span>
          </button>
        ))}
      </div>

      {/* Quick filter row */}
      <div className="filter-row">
        <div className="search-wrap">
          <span className="search-ico">⌕</span>
          <input className="search-input" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="chips">
          <ChipGroup label={t('pos')} options={posGroups} value={filterPosGroup} onChange={setFilterPosGroup}/>
          <ChipGroup label={t('foot')} options={feet} value={filterFoot} onChange={setFilterFoot}/>
          <ChipGroup label={t('age')} options={ageBuckets} value={filterAge} onChange={setFilterAge}/>
        </div>
        <div className="results-count">
          <span className="mono num lg">{sorted.length}</span>
          <span className="dim sm"> {t('players_found')}</span>
        </div>
      </div>

      {/* Table */}
      <div className={`table-wrap ${density==='compact'?'dense':''}`} ref={listRef}>
        <table className="player-table">
          <thead>
            <tr>
              <th className="col-photo"></th>
              <Th k="name" sortK={sortK} sortDir={sortDir} onClick={toggleSort}>{t('name')}</Th>
              <Th k="pos" sortK={sortK} sortDir={sortDir} onClick={toggleSort}>{t('pos')}</Th>
              <Th k="age" sortK={sortK} sortDir={sortDir} onClick={toggleSort} num>{t('age')}</Th>
              <th className="num">{t('dob')}</th>
              <th>{t('foot')}</th>
              <Th k="club" sortK={sortK} sortDir={sortDir} onClick={toggleSort}>{t('club')}</Th>
              <Th k="caps" sortK={sortK} sortDir={sortDir} onClick={toggleSort} num>{t('caps')}</Th>
              <Th k="intGoals" sortK={sortK} sortDir={sortDir} onClick={toggleSort} num>{t('intGoals')}</Th>
              <Th k="minutes" sortK={sortK} sortDir={sortDir} onClick={toggleSort} num>{t('minutes')}</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan="10" className="empty">{t('no_players')}</td></tr>
            )}
            {sorted.map((p, i) => (
              <tr key={p.id} data-row-idx={i}
                  className={`row ${i===focusIdx?'focused':''}`}
                  onClick={() => { setFocusIdx(i); onSelect(p); }}
                  onMouseEnter={() => setFocusIdx(i)}>
                <td className="col-photo">
                  <PlayerPhoto playerId={p.id} name={p.name} size={38}/>
                </td>
                <td className="nm">
                  <div className="nm-line">
                    {p.name}
                    {p.nick && <span className="nm-nick">({p.nick})</span>}
                    {p.active === false && <span className="nm-retired-tag">เลิกเล่น</span>}
                  </div>
                  <div className="nm-th">{p.thaiName}</div>
                </td>
                <td><PosBadge pos={p.pos} t={t}/></td>
                <td className="num mono">{ageFromDob(p.dob)}</td>
                <td className="num mono dim">{p.dob}</td>
                <td><FootIcon foot={p.foot}/></td>
                <td><ClubChip code={p.club}/></td>
                <td className="num mono">{valueFor(p,'caps',matchStats)}</td>
                <td className="num mono hl">{valueFor(p,'intGoals',matchStats)}</td>
                <td className="num mono dim">{valueFor(p,'minutes',matchStats)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {importOpen && <ImportDialog onClose={() => setImportOpen(false)} onImport={onImport} t={t}/>}
    </div>
  );
}

function Th({ k, sortK, sortDir, onClick, num, children }) {
  const on = sortK === k;
  return (
    <th onClick={() => onClick(k)} className={`sortable ${num?'num':''} ${on?'on':''}`}>
      <span className="th-lab">{children}</span>
      <span className={`sort-arrow ${on?(sortDir>0?'up':'down'):''}`}>{on ? (sortDir > 0 ? '▲' : '▼') : '◇'}</span>
    </th>
  );
}

function ChipGroup({ label, options, value, onChange }) {
  return (
    <div className="chip-group">
      <span className="chip-lab">{label}</span>
      {options.map(o => (
        <button key={o} className={`chip ${value===o?'on':''}`} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

window.PlayerList = PlayerList;
