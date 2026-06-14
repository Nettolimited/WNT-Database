UPDATE camp_player_status 
SET status = 'injured', 
    symptom_date = 'Lt.shoulder pain', 
    injury_note = 'Pain point at deltoid muscle. Pain due to full shoulder flexion. Analysis: Muscle strain / Rule out Bursitis. Pain score: Pain at rest=0, flex=4', 
    can_train = '90%', 
    treatment_plan = 'Kinesiology tape for supporting'
WHERE camp_id = 'camp_ayabank_2026' AND report_date = '2026-06-06' AND player_id = 'p07';

UPDATE camp_player_status 
SET status = 'injured', 
    symptom_date = 'Today', 
    injury_note = 'Tenderness at Lt. Vastus medialis and vastus medial oblique m. Pain of all movement of knee action. Analysis: Pes anserinus tendinitis. Pain score: 10', 
    can_train = 'No run,jump', 
    treatment_plan = 'Rest'
WHERE camp_id = 'camp_ayabank_2026' AND report_date = '2026-06-06' AND player_id = 'p75';

UPDATE camp_player_status 
SET status = 'injured', 
    symptom_date = '30/5/26', 
    injury_note = 'Patellar ligaments pain, Muscle contusion >> a little bit. Analysis: Tendinitis. Pain score: 2-3', 
    can_train = '90%', 
    treatment_plan = 'Release pain + Support'
WHERE camp_id = 'camp_ayabank_2026' AND report_date = '2026-06-06' AND player_id = 'p24';

UPDATE camp_player_status 
SET status = 'injured', 
    symptom_date = 'Today', 
    injury_note = 'Contusion at Lt. foot. Analysis: Bruise. Pain score: 8', 
    can_train = '95%', 
    treatment_plan = '-'
WHERE camp_id = 'camp_ayabank_2026' AND report_date = '2026-06-06' AND player_id = 'p41';

UPDATE camp_player_status 
SET status = 'injured', 
    symptom_date = '2 June', 
    injury_note = 'Tender point at medial head of gastrocnemius muscle. Active movement of knee bending no aggravated pain. physical performance is good. Analysis: Tendinitis. Pain score: 2', 
    can_train = '95%', 
    treatment_plan = 'Return to play sessions'
WHERE camp_id = 'camp_ayabank_2026' AND report_date = '2026-06-06' AND player_id = 'p39';

UPDATE camp_player_status 
SET status = 'injured', 
    symptom_date = '', 
    injury_note = '1. Plantar fascia tightness 2. Muscle contusion >> a little bit. Analysis: 1. Plantar fasciitis 2. Muscle contusion. Pain score: 1-2', 
    can_train = '100%', 
    treatment_plan = 'release fascia'
WHERE camp_id = 'camp_ayabank_2026' AND report_date = '2026-06-06' AND player_id = 'p35';

UPDATE camp_player_status 
SET status = 'injured', 
    symptom_date = '', 
    injury_note = 'tenderness at Rt. fibularis longus, tightness at Rt. anterior tibialis m. Analysis: Chronic ankle joint pain. Pain score: 4-5', 
    can_train = '90-100%', 
    treatment_plan = 'Rolling for release tightness muscle'
WHERE camp_id = 'camp_ayabank_2026' AND report_date = '2026-06-06' AND player_id = 'p36';
