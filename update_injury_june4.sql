UPDATE camp_player_status 
SET status = 'Modified', 
    injury_note = 'tender point at acromion procress and rotator cuff muscle limit ROM of shoulder flexion >> after treatment can improve range of motion without resistance\nPain score: 3', 
    can_train = '95%', 
    treatment_plan = 'normal training' 
WHERE report_date = '2026-06-04' AND player_id = 'p07';

UPDATE camp_player_status 
SET status = 'Modified', 
    injury_note = 'Swelling at Lt. knee joint', 
    can_train = 'ซ้อมได้ 90-100%', 
    treatment_plan = 'Improve Strentening of VMO' 
WHERE report_date = '2026-06-04' AND player_id = 'p75';

UPDATE camp_player_status 
SET status = 'Modified', 
    injury_note = 'Pain at Lt. knee joint\nPain score: 2', 
    can_train = 'ซ้อมได้ 100%', 
    treatment_plan = '-' 
WHERE report_date = '2026-06-04' AND player_id = 'p24';

UPDATE camp_player_status 
SET status = 'Modified', 
    injury_note = 'tightness at Rt. Gastrocnemius refer pain to Achillis tendon\nPain score: 3', 
    can_train = 'ซ้อมได้ 100%', 
    treatment_plan = '-' 
WHERE report_date = '2026-06-04' AND player_id = 'p36';

UPDATE camp_player_status 
SET status = 'Injured', 
    injury_note = 'Tender point at medial head of gastrocnemius muscle and insertion of lateral side of hamstrings >> improve\nActive movement of knee bending to end range aggravated pain\nNo swelling\nsingle leg stand >> Good\nsingle leg squat >> still pain\nPain score: 5', 
    can_train = 'Re-assement tomorrow', 
    treatment_plan = 'Rest and continue treatment\nAvoid speed running' 
WHERE report_date = '2026-06-04' AND player_id = 'p39';

UPDATE camp_player_status 
SET status = 'Modified', 
    injury_note = 'Plantar fascia tigthness\nPain score: 1-2', 
    can_train = '100%', 
    treatment_plan = 'taping before training' 
WHERE report_date = '2026-06-04' AND player_id = 'p35';
