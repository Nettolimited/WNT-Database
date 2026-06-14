UPDATE OR IGNORE camp_wellness SET camp_id = 'camp_ayabank_2026' WHERE camp_id = 'c_1717390977821';
UPDATE OR IGNORE camp_gps SET camp_id = 'camp_ayabank_2026' WHERE camp_id = 'c_1717390977821';
UPDATE OR IGNORE camp_player_status SET camp_id = 'camp_ayabank_2026' WHERE camp_id = 'c_1717390977821';
UPDATE OR IGNORE camp_schedules SET camp_id = 'camp_ayabank_2026' WHERE camp_id = 'c_1717390977821';

DELETE FROM camp_wellness WHERE camp_id = 'c_1717390977821';
DELETE FROM camp_gps WHERE camp_id = 'c_1717390977821';
DELETE FROM camp_player_status WHERE camp_id = 'c_1717390977821';
DELETE FROM camp_schedules WHERE camp_id = 'c_1717390977821';
