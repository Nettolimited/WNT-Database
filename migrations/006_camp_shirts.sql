-- Per-camp shirt numbers stored as JSON object {playerId: shirtNumber}
ALTER TABLE camps ADD COLUMN player_shirts TEXT NOT NULL DEFAULT '{}';
