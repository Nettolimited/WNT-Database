-- BEAM (p07)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p07', '2026-06-07', 'injured', 'Lt.shoulder pain', 'Pain point at deltoid muscle. Pain due to full shoulder flexion. Analysis: Muscle strain, Rule out Bursitis. Pain score: Pain at rest = 0, Pain while shoulder flex to end range = 2.', '95%', 'Kinesiology tape for supporting')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- Yee (p75)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p75', '2026-06-07', 'injured', 'Yesterday', 'Tenderness at Lt. Vastus medialis and vastus medial oblique m. Pain of all movement of knee action. Analysis: MCL and LCL sprain. Pain score: 8.', 'No run,jump', 'Rest')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- Kaka (p24)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p24', '2026-06-07', 'injured', '30/5/26', 'Patellar ligaments pain. Muscle contusion >> a little bit. Analysis: Tendinitis. Pain score: 2-3.', '90%', 'Release pain + Support')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- Noey (p41)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p41', '2026-06-07', 'injured', 'yesterday', 'Contusion at Lt. foot. Analysis: Bruise. Pain score: 5-6.', '100%', '-')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- NATALIE OLSON (p39)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p39', '2026-06-07', 'injured', 'Posterior knee pain (2 June)', 'Tender point at medial head of gastrocnemius muscle. Active movement of knee bending no aggravated pain. physical performance is good. Analysis: Tendinitis. Pain score: 2.', '95%', 'Return to play sessions')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- MOOK (p35)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p35', '2026-06-07', 'injured', '1. Rt. sole hurts 2. Left tigh pain', '1. Plantar fascia tightness 2. Muscle contusion >> a little bit. Analysis: 1. Plantar fasciitis 2. Muscle contusion. Pain score: 0.', '100%', 'release fascia')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- Muay/MAUY (p36)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p36', '2026-06-07', 'injured', 'Today', 'Tenderness at Rt. Psoas and VMO m. tightness at Rt. hamstraings m. tightness at Rt. Gastrocnemius refer pain to Achillis tendon. Analysis: 1.Achilis tendinitis 2.Satorius m. strain. Pain score: 3-4.', 'ซ้อมได้ 90%', 'Tape support and release muscle tightness')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- TangMay (p902)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p902', '2026-06-07', 'injured', 'Lower legs pain', 'swelling at above medial malleolus both side. Analysis: contusion. Pain score: 5.', '95%', 'Continue treatment')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- IMM (p21)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p21', '2026-06-07', 'injured', 'Rt. Sole hurt', 'Mild swelling laterally of Rt.foot. Analysis: Contusion. Pain score: 1.', '100%', 'Normal')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- Tongar (p70)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p70', '2026-06-07', 'injured', 'Lt. ankle pain', 'tender point at below med.malleolus. Analysis: Ankle contusion. Pain score: 4.', '95%', 'Release pain + k-tape support')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;
