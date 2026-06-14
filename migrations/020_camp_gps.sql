CREATE TABLE IF NOT EXISTS camp_gps (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  camp_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  session_date TEXT NOT NULL,
  session TEXT NOT NULL,
  
  total_dist REAL,
  m_per_min REAL,
  hsr_dist REAL,
  sprint_dist REAL,
  explosive_effs INTEGER,
  accel_decel_effs INTEGER,
  max_vel REAL,
  percent_max_vel REAL,
  total_pl INTEGER,
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  UNIQUE(camp_id, player_id, session_date, session)
);

CREATE INDEX IF NOT EXISTS idx_camp_gps_lookup ON camp_gps(camp_id, session_date, session);
