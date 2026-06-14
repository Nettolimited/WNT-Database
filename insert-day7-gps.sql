-- 1. Update duration in camp_wellness
UPDATE camp_wellness SET duration = 50 WHERE session_date = '2026-06-07' AND player_id IN ('p09', 'p49', 'p55', 'p901', 'p06', 'p42', 'p70', 'p902', 'p04', 'p39');
UPDATE camp_wellness SET duration = 52 WHERE session_date = '2026-06-07' AND player_id IN ('p43', 'p18');

-- 2. Insert GPS data into camp_gps
-- Pitchayathida Cartoon (p09)
INSERT INTO camp_gps (camp_id, player_id, session_date, session, total_dist, m_per_min, hsr_dist, sprint_dist, explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl) VALUES
('c_1717390977821', 'p09', '2026-06-07', 'AM', 3511, 70.53, 96, 110, 10, 122, 26.9, 89.6, 437);

-- U-Raiporn Peckee (p49)
INSERT INTO camp_gps (camp_id, player_id, session_date, session, total_dist, m_per_min, hsr_dist, sprint_dist, explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl) VALUES
('c_1717390977821', 'p49', '2026-06-07', 'AM', 3438, 69.06, 104, 110, 7, 136, 26.4, 85.1, 374);

-- Parichat Pleng (p55)
INSERT INTO camp_gps (camp_id, player_id, session_date, session, total_dist, m_per_min, hsr_dist, sprint_dist, explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl) VALUES
('c_1717390977821', 'p55', '2026-06-07', 'AM', 3390, 68.10, 128, 78, 15, 138, 25.4, 81.1, 399);

-- Prichakorn Pinn (p901)
INSERT INTO camp_gps (camp_id, player_id, session_date, session, total_dist, m_per_min, hsr_dist, sprint_dist, explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl) VALUES
('c_1717390977821', 'p901', '2026-06-07', 'AM', 3358, 67.45, 105, 105, 6, 119, 27.4, 87.4, 367);

-- Janitta Baimon (p06)
INSERT INTO camp_gps (camp_id, player_id, session_date, session, total_dist, m_per_min, hsr_dist, sprint_dist, explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl) VALUES
('c_1717390977821', 'p06', '2026-06-07', 'AM', 3348, 67.25, 119, 119, 7, 134, 26.6, 88.6, 373);

-- Kanchanatutch Nong (p42)
INSERT INTO camp_gps (camp_id, player_id, session_date, session, total_dist, m_per_min, hsr_dist, sprint_dist, explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl) VALUES
('c_1717390977821', 'p42', '2026-06-07', 'AM', 3294, 66.17, 90, 147, 15, 112, 28.2, 89.9, 401);

-- Thawanrat Tongla (p70)
INSERT INTO camp_gps (camp_id, player_id, session_date, session, total_dist, m_per_min, hsr_dist, sprint_dist, explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl) VALUES
('c_1717390977821', 'p70', '2026-06-07', 'AM', 3234, 64.96, 91, 84, 4, 120, 25.3, 80.8, 436);

-- Kwanjira Tangmay (p902)
INSERT INTO camp_gps (camp_id, player_id, session_date, session, total_dist, m_per_min, hsr_dist, sprint_dist, explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl) VALUES
('c_1717390977821', 'p902', '2026-06-07', 'AM', 3211, 64.49, 138, 69, 5, 95, 25.1, 82.7, 366);

-- Natcha Aum (p04)
INSERT INTO camp_gps (camp_id, player_id, session_date, session, total_dist, m_per_min, hsr_dist, sprint_dist, explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl) VALUES
('c_1717390977821', 'p04', '2026-06-07', 'AM', 3184, 63.95, 93, 105, 7, 122, 26.7, 87.9, 387);

-- Natalie Natty (p39)
INSERT INTO camp_gps (camp_id, player_id, session_date, session, total_dist, m_per_min, hsr_dist, sprint_dist, explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl) VALUES
('c_1717390977821', 'p39', '2026-06-07', 'AM', 3101, 62.29, 72, 134, 5, 119, 28.1, 92.6, 348);

-- Panita Nong GK (p43)
INSERT INTO camp_gps (camp_id, player_id, session_date, session, total_dist, m_per_min, hsr_dist, sprint_dist, explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl, gk_jumps, gk_dive_total, gk_dive_left, gk_dive_right, gk_dive_centre, gk_dive_load_left, gk_dive_load_right, gk_dive_load_centre, gk_accel_load) VALUES
('c_1717390977821', 'p43', '2026-06-07', 'AM', 1838, 35.67, 0, 0, 18, 39, 18.6, 60.7, 223, 16, 26, 13, 13, 0, 86, 91, 0, 1047);

-- Chonticha Gam (p18)
INSERT INTO camp_gps (camp_id, player_id, session_date, session, total_dist, m_per_min, hsr_dist, sprint_dist, explosive_effs, accel_decel_effs, max_vel, percent_max_vel, total_pl, gk_jumps, gk_dive_total, gk_dive_left, gk_dive_right, gk_dive_centre, gk_dive_load_left, gk_dive_load_right, gk_dive_load_centre, gk_accel_load) VALUES
('c_1717390977821', 'p18', '2026-06-07', 'AM', 1431, 27.78, 0, 0, 22, 33, 18.1, 57.7, 191, 10, 27, 11, 16, 0, 71, 103, 0, 897);
