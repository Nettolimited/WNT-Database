-- BEAM (p07)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p07', '2026-06-06', 'injured', 'Lt.shoulder pain', 'Pain point at deltoid muscle. Pain due to full shoulder flexion. Analysis: Muscle strain, Rule out Bursitis. Pain score: Pain at rest = 0, Pain while shoulder flex to end range = 4.', '90%', 'Kinesiology tape for supporting')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- Yee (p75)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p75', '2026-06-06', 'injured', 'Today', 'Tenderness at Lt. Vastus medialis and vastus medial oblique m. Pain of all movement of knee action. Analysis: Pes anserinus tendinitis. Pain score: 10.', 'No run,jump', 'Rest')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- Kaka (p24)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p24', '2026-06-06', 'injured', '30/5/26', 'Patellar ligaments pain. Muscle contusion >> a little bit. Analysis: Tendinitis. Pain score: 2-3.', '90%', 'Release pain + Support')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- Noey (p41)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p41', '2026-06-06', 'injured', 'Today', 'Contusion at Lt. foot. Analysis: Bruise. Pain score: 8.', '95%', '-')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- NATALIE (p39)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p39', '2026-06-06', 'injured', 'Posterior knee pain (2 June)', 'Tender point at medial head of gastrocnemius muscle. Active movement of knee bending no aggravated pain. physical performance is good. Analysis: Tendinitis. Pain score: 2.', '95%', 'Return to play sessions')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- MOOK (p35)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p35', '2026-06-06', 'injured', '1. Rt. sole hurts 2. Left tigh pain', '1. Plantar fascia tightness 2. Muscle contusion >> a little bit. Analysis: 1. Plantar fasciitis 2. Muscle contusion. Pain score: 1-2.', '100%', 'release fascia')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- Aim/Imm (p21)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p21', '2026-06-06', 'injured', '-', 'tenderness at Rt. fibularis longus, tightness at Rt. anterior tibialis m. Analysis: Chronic ankle joint pain. Pain score: 4-5.', '90-100%', 'Rolling for release tightness muscle')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;
