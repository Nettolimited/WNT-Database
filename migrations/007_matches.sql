CREATE TABLE IF NOT EXISTS matches (
  id          TEXT PRIMARY KEY,
  opponent    TEXT NOT NULL,
  competition TEXT NOT NULL DEFAULT '',
  match_date  TEXT NOT NULL DEFAULT '',
  home_score  INTEGER NOT NULL DEFAULT 0,
  away_score  INTEGER NOT NULL DEFAULT 0,
  team_level  TEXT NOT NULL DEFAULT 'Senior',
  lineup      TEXT NOT NULL DEFAULT '[]',
  notes       TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
