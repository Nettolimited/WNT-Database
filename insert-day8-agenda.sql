-- Insert Day 8 (8 June 2026) Agenda for AYA Bank Camp
DELETE FROM camp_schedules WHERE camp_id = 'camp_ayabank_2026' AND schedule_date = '2026-06-08';

INSERT INTO camp_schedules (camp_id, schedule_date, time_start, time_end, title, type, notes, video_url) VALUES
('camp_ayabank_2026', '2026-06-08', '07:45', '08:30', 'Activation Session in gym', 'Custom', 'ในยิม', ''),
('camp_ayabank_2026', '2026-06-08', '08:30', '09:20', 'อาหารเช้า', 'Meal', 'breakfast', ''),
('camp_ayabank_2026', '2026-06-08', '09:20', '10:20', 'รถตู้ออกไปประชุมทีม', 'Travel', '(Van leaves for MCM - Palmy & Queen) @👑', ''),
('camp_ayabank_2026', '2026-06-08', '10:30', '11:30', 'รถตู้ออกไปแถลงข่าว', 'Travel', '(Van leaved for PMPAC - Coach Alfred and Captain Puii) @ALFRED', ''),
('camp_ayabank_2026', '2026-06-08', '12:30', '13:30', 'อาหารกลางวัน', 'Meal', 'lunch', ''),
('camp_ayabank_2026', '2026-06-08', '13:30', '15:00', 'ประชุมทีม', 'Team Meeting', 'team meeting', ''),
('camp_ayabank_2026', '2026-06-08', '15:00', '15:30', 'อาหารว่าง', 'Meal', 'snacks', ''),
('camp_ayabank_2026', '2026-06-08', '16:30', '17:00', 'รถบัสออกไปซ้อม', 'Travel', 'bus leaves to training', ''),
('camp_ayabank_2026', '2026-06-08', '17:00', '18:30', 'Official Training', 'Training', 'at Thuwanna Stadium', ''),
('camp_ayabank_2026', '2026-06-08', '18:30', '20:00', 'อาหารเย็น', 'Meal', 'dinner', '');
