CREATE TABLE IF NOT EXISTS camp_schedules (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  camp_id        TEXT NOT NULL,
  schedule_date  TEXT NOT NULL,
  time_start     TEXT NOT NULL,
  time_end       TEXT NOT NULL,
  title          TEXT NOT NULL,
  type           TEXT NOT NULL DEFAULT 'Training',
  notes          TEXT DEFAULT '',
  video_url      TEXT DEFAULT '',
  created_at     TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_schedules_camp ON camp_schedules(camp_id, schedule_date);
