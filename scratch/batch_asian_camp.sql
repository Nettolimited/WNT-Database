INSERT INTO players (id, nick, name, thai_name, pos, team, club, shirt, active)
   VALUES ('p911', 'Krittiya', 'KRITTIYA MOOLRANG', 'กฤติยา มูลรัง', 'DF', 'Senior', '', 0, 1)
   ON CONFLICT(id) DO UPDATE SET nick='Krittiya', thai_name='กฤติยา มูลรัง';
INSERT INTO camps (id, name, camp_date, camp_date_end, competition, description, team_level, player_ids)
   VALUES ('camp_asiangames_2026', 'Asian Games 2026', '2026-09-19', '2026-10-04', 'Asian Games 2026 (Aichi-Nagoya)', 'Nagoya, Aichi, Japan', 'Senior', '["p32","p902","p07","p72","p62","p49","p28","p908","p04","p24","p21","p17","p35","p06","p42","p18","p46","p73","p58","p75","p911","p08","p_saengrawee","p76","p70","p16"]')
   ON CONFLICT(id) DO UPDATE SET 
     player_ids='["p32","p902","p07","p72","p62","p49","p28","p908","p04","p24","p21","p17","p35","p06","p42","p18","p46","p73","p58","p75","p911","p08","p_saengrawee","p76","p70","p16"]',
     name='Asian Games 2026',
     competition='Asian Games 2026 (Aichi-Nagoya)';
UPDATE camps SET player_ids = '["p32","p902","p07","p72","p62","p49","p28","p908","p04","p24","p21","p17","p35","p06","p42","p18","p46","p73","p58","p75","p911","p08","p_saengrawee","p76","p70","p16"]' WHERE LOWER(name) LIKE '%asian%' OR LOWER(competition) LIKE '%asian%';