CREATE TABLE IF NOT EXISTS camp_player_status (
  camp_id      TEXT NOT NULL,
  player_id    TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'available',
  injury_note  TEXT NOT NULL DEFAULT '',
  sleep        INTEGER NOT NULL DEFAULT 0,
  soreness     INTEGER NOT NULL DEFAULT 0,
  mood         INTEGER NOT NULL DEFAULT 0,
  rpe          INTEGER NOT NULL DEFAULT 0,
  notes        TEXT NOT NULL DEFAULT '',
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (camp_id, player_id)
);
