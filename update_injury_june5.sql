UPDATE camp_player_status 
SET status = 'Modified', 
    injury_note = 'tender point at acromion procress and rotator cuff muscle\nPain at end range of shoulder bending\nPain score: 3', 
    can_train = '95%', 
    treatment_plan = 'normal training' 
WHERE report_date = '2026-06-05' AND player_id = 'p07';

UPDATE camp_player_status 
SET status = 'Modified', 
    injury_note = 'Swelling at Lt. knee joint\nTenderness at Lt. Hamstrings m.', 
    can_train = 'ซ้อมได้ 90-100%', 
    treatment_plan = 'Improve Strentening of VMO' 
WHERE report_date = '2026-06-05' AND player_id = 'p75';

UPDATE camp_player_status 
SET status = 'Modified', 
    injury_note = 'Pain at Lt. knee joint\nTender point at Patellar ligment\nsingle leg stand test >> Good\njump test >> Good\nAgility test >> Good\nPain score: 1', 
    can_train = '90%', 
    treatment_plan = 'Kinesiotape support\nco-codination training' 
WHERE report_date = '2026-06-05' AND player_id = 'p24';

UPDATE camp_player_status 
SET status = 'Modified', 
    injury_note = 'tightness at Rt. Gastrocnemius refer pain to Achillis tendon\nPain score: 3', 
    can_train = 'ซ้อมได้ 100%', 
    treatment_plan = '-' 
WHERE report_date = '2026-06-05' AND player_id = 'p36';

UPDATE camp_player_status 
SET status = 'Modified', 
    injury_note = 'Tender point at medial head of gastrocnemius muscle and insertion of lateral side of hamstrings >> improve\nActive movement of knee bending to end range aggravated pain >> no pain\nNo swelling\nsingle leg stand >> Good\nsingle leg squat >> pain improve\nAgility test >> Fair to good >> a little bit pain while change direction\nPain score: 3-4', 
    can_train = '90%', 
    treatment_plan = 'Kinesiotape support\nco-codination training' 
WHERE report_date = '2026-06-05' AND player_id = 'p39';

UPDATE camp_player_status 
SET status = 'Modified', 
    injury_note = 'Plantar fascia tigthness\nPain score: 1-2', 
    can_train = '100%', 
    treatment_plan = 'taping before training' 
WHERE report_date = '2026-06-05' AND player_id = 'p35';

UPDATE camp_player_status 
SET status = 'Modified', 
    symptom_date = '2026-06-05',
    injury_note = 'Pain at Rt. anterior of shoulder joint\nPain score: 7-8', 
    can_train = 'ซ้อมได้ 100%', 
    treatment_plan = 'continue Observation for analysis' 
WHERE report_date = '2026-06-05' AND player_id = 'p06';
