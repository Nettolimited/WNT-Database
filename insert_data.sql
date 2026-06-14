-- Set camp_id to current camp
-- Wellness
INSERT INTO camp_wellness (camp_id, player_id, session_date, session, weight_before, weight_after, rpe, duration) VALUES 
('camp_ayabank_2026', 'p07', '2026-05-31', 'AM', 63.75, 63.90, 5, 90),
('camp_ayabank_2026', 'p43', '2026-05-31', 'AM', 67.60, 67.20, 6, 90),
('camp_ayabank_2026', 'p04', '2026-05-31', 'AM', 54.30, 54.55, 4, 90),
('camp_ayabank_2026', 'p17', '2026-05-31', 'AM', 56.35, 56.60, 2, 90),
('camp_ayabank_2026', 'p49', '2026-05-31', 'AM', 50.95, 50.70, 2, 90),
('camp_ayabank_2026', 'p53', '2026-05-31', 'AM', 60.05, 59.90, 3, 90),
('camp_ayabank_2026', 'p55', '2026-05-31', 'AM', 54.10, 54.25, 2, 90),
('camp_ayabank_2026', 'p58', '2026-05-31', 'AM', 64.60, 64.30, 5, 90),
('camp_ayabank_2026', 'p70', '2026-05-31', 'AM', 46.20, 46.10, 3, 90),
('camp_ayabank_2026', 'p21', '2026-05-31', 'AM', 49.80, 49.90, 3, 90),
('camp_ayabank_2026', 'p24', '2026-05-31', 'AM', 48.35, 48.45, 3, 90),
('camp_ayabank_2026', 'p901', '2026-05-31', 'AM', 57.65, 57.80, 3, 90),
('camp_ayabank_2026', 'p902', '2026-05-31', 'AM', 50.95, 51.85, 5, 90),
('camp_ayabank_2026', 'p41', '2026-05-31', 'AM', 53.15, 53.25, 3, 90),
('camp_ayabank_2026', 'p42', '2026-05-31', 'AM', 53.55, 53.60, 2, 90),
('camp_ayabank_2026', 'p75', '2026-05-31', 'AM', 60.95, 60.75, 5, 90)
ON CONFLICT(camp_id, player_id, session_date, session) DO UPDATE SET 
weight_before=excluded.weight_before, weight_after=excluded.weight_after, rpe=excluded.rpe, duration=excluded.duration;

-- Status / Injury
INSERT INTO camp_player_status (camp_id, player_id, status, symptom_date, injury_note, rest_days, can_train, treatment_plan, updated_at) VALUES 
('camp_ayabank_2026', 'p07', 'injured', '5/5/26', 'มีอาการปวดบริเวณด้านในข้อเข่าข้างขวา / ปวดไหล่ซ้ายร้าวถึงสะบัก', '-', 'ซ้อมได้และต้องติดเทปเพื่อป้องกันการบาดเจ็บเพิ่ม', 'แพลนออกกำลังกายเพิ่มกำลังกล้ามเนื้อต้นขาด้านใน', datetime('now')),
('camp_ayabank_2026', 'p41', 'injured', 'เมื่อวาน', 'Contusion at Lt. External oblique', '-', 'ซ้อมได้', '-', datetime('now')),
('camp_ayabank_2026', 'p75', 'injured', '-', 'Swelling at Lt. knee joint', '-', 'ซ้อมได้ แต่งดกระโดดหนัก', '-', datetime('now')),
('camp_ayabank_2026', 'p24', 'injured', 'เมื่อวาน', 'Pain at both knee joints', '-', 'ซ้อมได้', '-', datetime('now')),
('camp_ayabank_2026', 'p42', 'injured', 'เมื่อวาน', 'Pain and swelling at Rt. ankle', '-', 'ซ้อมได้และต้องติดเทปเพื่อป้องกันการบาดเจ็บเพิ่ม', 'งดกระโดด', datetime('now'))
ON CONFLICT(camp_id, player_id) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, rest_days=excluded.rest_days, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan, updated_at=excluded.updated_at;
