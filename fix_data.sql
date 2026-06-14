UPDATE camp_wellness 
SET session = 'PM', duration = 40 
WHERE camp_id = 'camp_ayabank_2026' AND session_date = '2026-05-31' AND session = 'AM';

UPDATE camp_player_status 
SET symptom_date = '30/5/26' 
WHERE camp_id = 'camp_ayabank_2026' AND symptom_date = 'เมื่อวาน';
