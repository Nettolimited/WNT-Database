DELETE FROM camp_schedules WHERE camp_id = 'c_1717390977821' AND schedule_date = '2026-06-07';

INSERT INTO camp_schedules (id, camp_id, schedule_date, time_start, time_end, title, type, notes) VALUES
('cs_20260607_1', 'c_1717390977821', '2026-06-07', '07:45', '', 'Activation session in the gym (substitute players only)', 'Training', ''),
('cs_20260607_2', 'c_1717390977821', '2026-06-07', '08:00', '', 'Breakfast (all players)', 'Meal', ''),
('cs_20260607_3', 'c_1717390977821', '2026-06-07', '08:30', '', 'Coaching staff meeting', 'Meeting', ''),
('cs_20260607_4', 'c_1717390977821', '2026-06-07', '09:00', '12:00', 'Visit to Shwedagon Pagoda and shopping mall (optional)', 'Other', 'Bus departs at 09:00, return at 12:00. Optional, inform staff if not going.'),
('cs_20260607_5', 'c_1717390977821', '2026-06-07', '12:30', '', 'Lunch', 'Meal', ''),
('cs_20260607_6', 'c_1717390977821', '2026-06-07', '13:30', '', 'Bus departs for the training ground', 'Other', ''),
('cs_20260607_7', 'c_1717390977821', '2026-06-07', '14:00', '', 'Training session', 'Training', ''),
('cs_20260607_8', 'c_1717390977821', '2026-06-07', '18:00', '', 'Dinner', 'Meal', '');
