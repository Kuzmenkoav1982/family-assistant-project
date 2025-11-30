-- Add missing columns to children_medication_schedule if they don't exist
ALTER TABLE t_p5815085_family_assistant_pro.children_medication_schedule 
ADD COLUMN IF NOT EXISTS time_of_day TIME;

-- Add missing columns to children_medication_intake if it exists
-- First we need to check if the table exists with the old structure
-- If date column exists, add scheduled_date
ALTER TABLE t_p5815085_family_assistant_pro.children_medication_intake
ADD COLUMN IF NOT EXISTS schedule_id INTEGER,
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS scheduled_time TIME,
ADD COLUMN IF NOT EXISTS taken_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS notes TEXT;