-- Add images array column to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';