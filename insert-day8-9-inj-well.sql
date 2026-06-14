-- Day 8 Injury
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p07', '2026-06-08', 'injured', 'Lt.shoulder pain', 'Pain point at deltoid muscle. Pain due to full shoulder flexion >>> improve. Medial knee pain. Pain score: 0 (rest), 2 (while shoulder flex), 7 (knee). Analysis: Muscle strain, Rule out Bursitis. Perf: 90%.', 'yes', 'Kinesiology tape for supporting'),
('c_1717390977821', 'p75', '2026-06-08', 'injured', '6/6/26', 'Tenderness at Lt. Vastus medialis and vastus medial oblique m. Pain of all movement of knee action. Pain score: 8. Analysis: MCL and LCL sprain. Perf: No run, jump.', 'no', 'Rest'),
('c_1717390977821', 'p24', '2026-06-08', 'injured', '30/5/26', 'Patellar ligaments pain >> pain improved. Muscle contusion >> a little bit. Pain score: 1. Analysis: Tendinitis. Perf: 100%.', 'yes', 'Release pain + Support'),
('c_1717390977821', 'p41', '2026-06-08', 'injured', '6/6/26', 'Contusion at Lt. foot. tightness at Lt. psoas m. Pain score: 4-5. Analysis: Bruise, Lt. satorius m. strain. Perf: 95%.', 'yes', 'Tape support and release muscle tightness'),
('c_1717390977821', 'p39', '2026-06-08', 'injured', '2 June', 'Posterior knee pain. Tender point at medial head of gastrocnemius muscle. Active movement of knee bending no aggravated pain. physical performance is good. Pain score: 2. Analysis: Tendinitis. Perf: 95%.', 'yes', 'Return to play sessions'),
('c_1717390977821', 'p35', '2026-06-08', 'injured', '', 'Rt. sole hurts. Plantar fascia tightness. Pain score: 0. Analysis: Plantar fasciitis. Perf: 100%.', 'yes', 'release fascia'),
('c_1717390977821', 'p36', '2026-06-08', 'injured', 'yesterday', 'Tenderness at Rt. Psoas and VMO m. tightness at Rt. hamstrings m. tightness at Rt. Gastrocnemius refer pain to Achilles tendon. Pain score: 3-4. Analysis: 1. Achillis tendinitis 2. Satorius m. strain. Perf: ซ้อมได้ 95%.', 'yes', 'Tape support and release muscle tightness'),
('c_1717390977821', 'p902', '2026-06-08', 'injured', '', 'Lower legs pain. swelling at above medial malleolus both side. Pain score: 2. Analysis: contusion. Perf: 100%.', 'yes', 'Continue treatment'),
('c_1717390977821', 'p21', '2026-06-08', 'injured', '', 'Rt. Sole hurt. Mild swelling laterally of Rt.foot. Pain score: 1. Analysis: Contusion. Perf: 100%.', 'yes', 'Normal'),
('c_1717390977821', 'p70', '2026-06-08', 'injured', '', 'Lt. ankle pain. tender point at below med.malleolus. Pain score: 3. Analysis: Ankle contusion. Perf: 95%.', 'yes', 'Release pain + k-tape support'),
('c_1717390977821', 'p52', '2026-06-08', 'injured', 'yesterday', 'Pain with swollen at Rt. leg. Pain score: 4-5. Analysis: Contusion at Rt. gastrocnemius. Perf: 100%.', 'yes', 'Release swell and pain');

-- Day 9 Wellness
INSERT INTO camp_wellness (camp_id, player_id, session_date, stress, sleep, appetite, mood, soreness, desire, period, weight_before, weight_after, rpe, duration, notes) VALUES
('c_1717390977821', 'p07', '2026-06-09', 10, 5, 10, 10, 10, 10, 0, 63.10, 62.70, 7, 0, 'เข้านอน 23.00 แอบงีบตื่นมาเช้ามีอาการดีขึ้น pain point 2-3'),
('c_1717390977821', 'p43', '2026-06-09', 5, 10, 5, 10, 10, 10, 0, 66.30, 65.85, 1, 0, 'เครียดเล็กน้อย/มีเบื่ออาหารโดยรวม(เที่ยง+เย็น)'),
('c_1717390977821', 'p10', '2026-06-09', 10, 10, 10, 10, 10, 10, 0, 62.35, 62.25, 1, 0, 'เข้านอน 22.30'),
('c_1717390977821', 'p30', '2026-06-09', 10, 10, 5, 10, 10, 10, 1, 54.30, 53.35, 8, 0, 'Period 5th เข้านอน 22.30/เบื่ออาหารเที่ยง+เย็น'),
('c_1717390977821', 'p54', '2026-06-09', 10, 10, 10, 10, 10, 10, 0, 55.05, 55.50, 10, 0, 'เข้านอน 22.30'),
('c_1717390977821', 'p71', '2026-06-09', 10, 10, 10, 10, 10, 10, 0, 50.90, 50.95, 1, 0, 'เข้านอน 22.00/ตื่นตี3'),
('c_1717390977821', 'p46', '2026-06-09', 5, 10, 10, 10, 10, 10, 1, 60.90, 59.75, 10, 0, 'Period 5th พะอืดพะอม/ปล่อยใจไม่เครียด/เข้านอน 23.00/ตึงขัดก้นซ้าย'),
('c_1717390977821', 'p35', '2026-06-09', 10, 10, 10, 10, 10, 10, 0, 56.75, 56.35, 5, 0, 'เข้านอน 23.00/ปวดก้นซ้าย'),
('c_1717390977821', 'p45', '2026-06-09', 10, 10, 5, 10, 10, 10, 0, 55.50, 54.85, 1, 0, 'เข้านอน 23.00/เบื่ออาหารโดยรวม'),
('c_1717390977821', 'p48', '2026-06-09', 10, 10, 5, 10, 10, 10, 1, 65.95, 63.55, 10, 0, 'Period 3rd มีหน่วงท้อง+นอนมีเหงื่อ เข้านอน 00.00/นอนพลิกไปมา+ร้อน /เบื่ออาหารเล็กน้อย'),
('c_1717390977821', 'p36', '2026-06-09', 10, 10, 10, 10, 10, 10, 0, 63.50, 62.00, 7, 0, 'เข้านอน 23.00/ส้นเท้า pain point 5'),
('c_1717390977821', 'p70', '2026-06-09', 10, 10, 10, 10, 10, 10, 0, 47.00, 45.90, 8, 0, 'เข้านอน 23.00/ตึงน่องด้านข้างขวาเล็กน้อย'),
('c_1717390977821', 'p21', '2026-06-09', 10, 10, 10, 10, 10, 10, 0, 50.90, 49.45, 8, 0, 'เข้านอน 22.30'),
('c_1717390977821', 'p24', '2026-06-09', 10, 10, 10, 10, 10, 10, 0, 48.55, 47.30, 10, 0, 'เข้านอน 22.50 หลับตาไม่รู้ลึกตัว /เข่าซ้าย pain point 1'),
('c_1717390977821', 'p51', '2026-06-09', 10, 10, 10, 10, 10, 10, 0, 56.75, 56.55, 1, 0, 'เข้านอน 22.30'),
('c_1717390977821', 'p902', '2026-06-09', 5, 5, 5, 5, 10, 5, 1, 51.45, 50.95, 10, 0, 'Period 2nd เครียดเล็กน้อยเรื่องส่วนตัว+เรื่องเรียน/นอนไม่สบาย/ข้าวไม่ค่อยอยากทาน/ปวดหัวข้างขวาลงท้ายทอย'),
('c_1717390977821', 'p52', '2026-06-09', 10, 10, 10, 10, 10, 10, 1, 55.50, 54.85, 1, 0, 'Period 5th เข้านอน 23.00/มีเบื่ออาหารมื้อเที่ยง'),
('c_1717390977821', 'p06', '2026-06-09', 10, 10, 10, 10, 10, 10, 0, 53.75, 53.00, 7, 0, 'เข้านอน 23.30/ตึงหน้าขา 2 ข้าง'),
('c_1717390977821', 'p41', '2026-06-09', 10, 10, 10, 10, 10, 10, 1, 52.30, 51.85, 9, 0, 'Period 6th เข้านอน 23.00/ตึงขาหนีบซ้ายเล็กน้อย'),
('c_1717390977821', 'p18', '2026-06-09', 10, 10, 5, 10, 10, 10, 1, 55.80, 55.85, 6, 0, 'Period 4th เข้านอน 23.30/เบื่ออาหารเที่ยง+เย็น'),
('c_1717390977821', 'p75', '2026-06-09', 5, 5, 5, 10, 10, 10, 0, 63.15, 63.10, 1, 0, 'เข้านอน 23.0/หลับๆตื่นๆ/เบื่ออาหารโดยรวม/เข่าซ้าย pain point 5-6'),
('c_1717390977821', 'p14', '2026-06-09', 10, 10, 10, 10, 10, 10, 0, 53.50, 53.35, 8, 0, 'เข้านอน 22.30'),
('c_1717390977821', 'p39', '2026-06-09', 10, 10, 10, 10, 10, 10, 0, 57.15, 56.35, 6, 0, 'เข้านอน 22.30/วันนี้รู้สึกดีเพราะเป็นวันแข่ง');
