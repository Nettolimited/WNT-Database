-- BEAM (p07)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p07', '2026-06-04', 'injured', 'Lt.shoulder pain', 'tender point at acromion procress and rotator cuff muscle. limit ROM of shoulder flexion >> after treatment can improve range of motion without resistance. Analysis: muscle tigthness and AC arthritis. Pain score: 3.', '95%', 'normal training')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- Yee (p75)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p75', '2026-06-04', 'injured', '-', 'Swelling at Lt. knee joint. Analysis: Chronic knee pain. Pain score: -.', 'ซ้อมได้ 90-100%', 'Improve Strentening of VMO')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- Kaka (p24)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p24', '2026-06-04', 'injured', '30/5/26', 'Pain at Lt. knee joint. Analysis: Contusion. Pain score: 2.', 'ซ้อมได้ 100%', '-')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- Muay/MAUY (p36)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p36', '2026-06-04', 'injured', '-', 'tightness at Rt. Gastrocnemius refer pain to Achillis tendon. Analysis: Achilis tendinitis. Pain score: 3.', 'ซ้อมได้ 100%', '-')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- NATALIE OLSON (p39)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p39', '2026-06-04', 'injured', 'Posterior knee pain (2 June)', 'Tender point at medial head of gastrocnemius muscle and insertion of lateral side of hamstrings >> improve. Active movement of knee bending to end range aggravated pain. No swelling. single leg stand >> Good. single leg squat >> still pain. Analysis: Tendinitis. Pain score: 5.', 'Re-assement tomorrow', 'Rest and continue treatment. Avoid speed running')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;

-- MOOK (p35)
INSERT INTO camp_player_status (camp_id, player_id, report_date, status, symptom_date, injury_note, can_train, treatment_plan) VALUES
('c_1717390977821', 'p35', '2026-06-04', 'injured', 'Rt.sole hurt', 'Plantar fascia tigthness. Analysis: Plantar fasciitis. Pain score: 1-2.', '100%', 'taping before training')
ON CONFLICT(camp_id, player_id, report_date) DO UPDATE SET 
status=excluded.status, symptom_date=excluded.symptom_date, injury_note=excluded.injury_note, can_train=excluded.can_train, treatment_plan=excluded.treatment_plan;
