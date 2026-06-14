DELETE FROM camp_schedules WHERE camp_id = 'camp_ayabank_2026';

INSERT INTO camp_schedules (camp_id, schedule_date, time_start, time_end, title, type, notes, video_url) VALUES 
('camp_ayabank_2026', '2026-05-31', '14:00', '15:00', 'Player show up at Dynamic Football Camp', 'Travel', 'meet at the canteen', ''),
('camp_ayabank_2026', '2026-05-31', '16:00', '17:00', 'Team meeting', 'Team Meeting', '', ''),
('camp_ayabank_2026', '2026-05-31', '17:00', '18:30', 'Training session', 'Training', '', ''),
('camp_ayabank_2026', '2026-05-31', '19:00', '20:00', 'Dinner', 'Meal', '', '');
