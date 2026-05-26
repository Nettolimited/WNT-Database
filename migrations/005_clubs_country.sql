-- Add country ISO-2 code column to clubs table
ALTER TABLE clubs ADD COLUMN country TEXT NOT NULL DEFAULT '';
