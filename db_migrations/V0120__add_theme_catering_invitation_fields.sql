ALTER TABLE family_events 
ADD COLUMN IF NOT EXISTS theme TEXT,
ADD COLUMN IF NOT EXISTS catering_type TEXT CHECK (catering_type IN ('catering', 'restaurant', 'none')),
ADD COLUMN IF NOT EXISTS catering_details TEXT,
ADD COLUMN IF NOT EXISTS invitation_image_url TEXT,
ADD COLUMN IF NOT EXISTS invitation_text TEXT;