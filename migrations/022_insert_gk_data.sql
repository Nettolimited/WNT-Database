INSERT INTO camp_gps (
  id, camp_id, player_id, session_date, session,
  total_dist, total_pl, explosive_effs, gk_jumps, gk_dive_total,
  gk_dive_left, gk_dive_right, gk_dive_centre,
  gk_dive_load_left, gk_dive_load_right, gk_dive_load_centre, gk_accel_load, updated_at
) VALUES 
('p18-20260601', 'camp_ayabank_2026', 'p18', '2026-06-01', 'AM', 1487, 172, 13, 9, 25, 11, 14, 0, 50, 69, 0, 822.0, datetime('now')),
('p43-20260601', 'camp_ayabank_2026', 'p43', '2026-06-01', 'AM', 1482, 166, 4, 12, 18, 6, 12, 0, 31, 51, 0, 713.0, datetime('now')),
('p07-20260601', 'camp_ayabank_2026', 'p07', '2026-06-01', 'AM', 1278, 153, 2, 11, 16, 11, 5, 0, 50, 27, 0, 670.0, datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  total_dist = excluded.total_dist,
  total_pl = excluded.total_pl,
  explosive_effs = excluded.explosive_effs,
  gk_jumps = excluded.gk_jumps,
  gk_dive_total = excluded.gk_dive_total,
  gk_dive_left = excluded.gk_dive_left,
  gk_dive_right = excluded.gk_dive_right,
  gk_dive_centre = excluded.gk_dive_centre,
  gk_dive_load_left = excluded.gk_dive_load_left,
  gk_dive_load_right = excluded.gk_dive_load_right,
  gk_dive_load_centre = excluded.gk_dive_load_centre,
  gk_accel_load = excluded.gk_accel_load,
  updated_at = datetime('now');
