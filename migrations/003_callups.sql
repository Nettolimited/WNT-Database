CREATE TABLE IF NOT EXISTS camps (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  camp_date   TEXT DEFAULT '',
  description TEXT DEFAULT '',
  team_level  TEXT DEFAULT 'Senior',
  player_ids  TEXT DEFAULT '[]',
  created_at  TEXT DEFAULT (datetime('now'))
);
