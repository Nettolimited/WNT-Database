DROP TABLE IF EXISTS camp_staff;

CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  thai_name TEXT,
  role_category TEXT,
  photo_url TEXT,
  personal_info TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE camp_staff (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  camp_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  role TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(camp_id) REFERENCES camps(id),
  FOREIGN KEY(staff_id) REFERENCES staff(id)
);
