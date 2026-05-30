CREATE TABLE IF NOT EXISTS camp_staff (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  camp_id        TEXT NOT NULL,
  name           TEXT NOT NULL,
  role           TEXT NOT NULL,
  notes          TEXT DEFAULT '',
  created_at     TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_staff_camp ON camp_staff(camp_id);
