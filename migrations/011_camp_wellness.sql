CREATE TABLE IF NOT EXISTS camp_wellness (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  camp_id      TEXT NOT NULL,
  player_id    TEXT NOT NULL,
  session_date TEXT NOT NULL,
  session      TEXT NOT NULL DEFAULT 'AM',
  sleep        INTEGER NOT NULL DEFAULT 0,
  soreness     INTEGER NOT NULL DEFAULT 0,
  mood         INTEGER NOT NULL DEFAULT 0,
  rpe          INTEGER NOT NULL DEFAULT 0,
  notes        TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(camp_id, player_id, session_date, session)
);
CREATE INDEX IF NOT EXISTS idx_wellness_camp ON camp_wellness(camp_id, session_date, session);
