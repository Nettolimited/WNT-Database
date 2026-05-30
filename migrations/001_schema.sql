CREATE TABLE IF NOT EXISTS players (
  id          TEXT PRIMARY KEY,
  active      INTEGER DEFAULT 1,
  nick        TEXT DEFAULT '',
  name        TEXT NOT NULL,
  thai_name   TEXT DEFAULT '',
  pos         TEXT NOT NULL DEFAULT 'CM',
  alt_pos     TEXT NOT NULL DEFAULT '[]',
  dob         TEXT DEFAULT '',
  foot        TEXT DEFAULT 'R',
  height      INTEGER DEFAULT 165,
  team        TEXT DEFAULT 'Senior',
  club        TEXT DEFAULT '',
  shirt       INTEGER DEFAULT 0,
  caps        INTEGER DEFAULT 0,
  int_goals   INTEGER DEFAULT 0,
  stats       TEXT NOT NULL DEFAULT '{"apps":0,"goals":0,"assists":0,"yellows":0,"reds":0,"minutes":0}',
  int_stats   TEXT NOT NULL DEFAULT '{"apps":0,"goals":0,"assists":0,"yellows":0,"reds":0,"minutes":0}',
  radar       TEXT NOT NULL DEFAULT '{"pace":10,"shooting":10,"passing":10,"dribbling":10,"defending":10,"physical":10}',
  career      TEXT NOT NULL DEFAULT '[]',
  photo_key   TEXT DEFAULT NULL,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clubs (
  code      TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  color     TEXT DEFAULT '#888888',
  logo_key  TEXT DEFAULT NULL
);
