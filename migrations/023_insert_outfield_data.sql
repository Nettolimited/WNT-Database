INSERT INTO camp_gps (
  id, camp_id, player_id, session_date, session,
  total_dist, m_per_min, hsr_dist, sprint_dist,
  explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl,
  updated_at
) VALUES 
('p75-20260601', 'camp_ayabank_2026', 'p75', '2026-06-01', 'AM', 4132, 68.33, 9, 0, 3, 68, 21.0, 69.4, 402, datetime('now')),
('p24-20260601', 'camp_ayabank_2026', 'p24', '2026-06-01', 'AM', 3954, 65.39, 39, 0, 5, 73, 21.4, 70.7, 449, datetime('now')),
('p09-20260601', 'camp_ayabank_2026', 'p09', '2026-06-01', 'AM', 3858, 63.80, 28, 0, 11, 48, 22.3, 74.4, 421, datetime('now')),
('p902-20260601', 'camp_ayabank_2026', 'p902', '2026-06-01', 'AM', 3804, 62.91, 43, 0, 3, 59, 22.3, 73.6, 395, datetime('now')),
('p70-20260601', 'camp_ayabank_2026', 'p70', '2026-06-01', 'AM', 3782, 62.55, 31, 11, 4, 84, 24.0, 76.5, 478, datetime('now')),
('p901-20260601', 'camp_ayabank_2026', 'p901', '2026-06-01', 'AM', 3782, 62.54, 16, 0, 7, 59, 23.2, 74.1, 376, datetime('now')),
('p42-20260601', 'camp_ayabank_2026', 'p42', '2026-06-01', 'AM', 3718, 61.49, 47, 8, 5, 80, 24.7, 78.8, 404, datetime('now')),
('p49-20260601', 'camp_ayabank_2026', 'p49', '2026-06-01', 'AM', 3615, 59.78, 19, 0, 5, 48, 22.3, 72.1, 369, datetime('now')),
('p21-20260601', 'camp_ayabank_2026', 'p21', '2026-06-01', 'AM', 3538, 58.51, 76, 8, 7, 87, 24.5, 80.6, 361, datetime('now')),
('p17-20260601', 'camp_ayabank_2026', 'p17', '2026-06-01', 'AM', 3495, 57.81, 7, 0, 5, 39, 21.1, 70.4, 325, datetime('now')),
('p41-20260601', 'camp_ayabank_2026', 'p41', '2026-06-01', 'AM', 3490, 57.72, 70, 12, 5, 67, 25.5, 82.4, 335, datetime('now')),
('p35-20260601', 'camp_ayabank_2026', 'p35', '2026-06-01', 'AM', 3446, 57.00, 17, 10, 8, 50, 24.9, 82.0, 346, datetime('now')),
('p58-20260601', 'camp_ayabank_2026', 'p58', '2026-06-01', 'AM', 3390, 56.06, 4, 0, 4, 35, 19.3, 62.2, 293, datetime('now')),
('p06-20260601', 'camp_ayabank_2026', 'p06', '2026-06-01', 'AM', 3277, 54.19, 71, 8, 10, 87, 24.1, 80.3, 341, datetime('now')),
('p04-20260601', 'camp_ayabank_2026', 'p04', '2026-06-01', 'AM', 3160, 52.27, 18, 0, 7, 51, 20.2, 66.5, 357, datetime('now')),
('p53-20260601', 'camp_ayabank_2026', 'p53', '2026-06-01', 'AM', 3120, 51.60, 15, 0, 3, 30, 21.9, 72.0, 297, datetime('now')),
('p55-20260601', 'camp_ayabank_2026', 'p55', '2026-06-01', 'AM', 3005, 49.69, 13, 0, 5, 46, 20.5, 65.3, 317, datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  total_dist = excluded.total_dist,
  m_per_min = excluded.m_per_min,
  hsr_dist = excluded.hsr_dist,
  sprint_dist = excluded.sprint_dist,
  explosive_effs = excluded.explosive_effs,
  accel_decel_effs = excluded.accel_decel_effs,
  max_vel = excluded.max_vel,
  percent_max_vel = excluded.percent_max_vel,
  total_pl = excluded.total_pl,
  updated_at = datetime('now');
