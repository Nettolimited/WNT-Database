-- Selection Board state and immutable decision history per camp.
-- Stored as JSON keyed by player id; `_config` contains quota settings.
ALTER TABLE camps ADD COLUMN player_selections TEXT NOT NULL DEFAULT '{}';
