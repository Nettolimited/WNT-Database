CREATE TABLE IF NOT EXISTS videos (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'match',   -- 'match' | 'scouting' | 'highlight'
  match_id    TEXT,                             -- link to matches.id
  player_id   TEXT,                             -- link to players.id (highlights)
  opponent    TEXT DEFAULT '',                  -- scouting target
  tags        TEXT DEFAULT '[]',               -- JSON array
  notes       TEXT DEFAULT '',
  created_at  TEXT DEFAULT (datetime('now'))
);
