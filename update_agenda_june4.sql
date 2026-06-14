DELETE FROM camp_schedules WHERE schedule_date = '2026-06-04' AND time_start >= '10:00';
INSERT INTO camp_schedules (camp_id, schedule_date, time_start, time_end, title, type, notes) VALUES
('camp_ayabank_2026', '2026-06-04', '10:30', '11:00', '🏨 Mercure Yangon hotel check in', 'Travel', 'hotel check in'),
('camp_ayabank_2026', '2026-06-04', '11:00', '12:00', '🍛 อาหารกลางวัน', 'Meal', 'lunch'),
('camp_ayabank_2026', '2026-06-04', '12:30', '13:30', '🚐 Snacks shopping', 'Travel', 'by me - need a van'),
('camp_ayabank_2026', '2026-06-04', '14:00', '14:30', '👨🏼🏫 Team meeting', 'Team Meeting', 'Team meeting'),
('camp_ayabank_2026', '2026-06-04', '14:15', '15:00', '🚐 Kit van leaves to the training', 'Travel', ''),
('camp_ayabank_2026', '2026-06-04', '15:00', '15:15', '🍌 อาหารว่าง', 'Meal', 'snacks'),
('camp_ayabank_2026', '2026-06-04', '15:15', '16:00', '🚌 Bus leave to training', 'Travel', ''),
('camp_ayabank_2026', '2026-06-04', '16:00', '18:00', '⚽️ ซ้อมเย็น', 'Training', 'training'),
('camp_ayabank_2026', '2026-06-04', '18:30', '19:30', '🍽️ อาหารเย็น', 'Meal', 'dinner');
