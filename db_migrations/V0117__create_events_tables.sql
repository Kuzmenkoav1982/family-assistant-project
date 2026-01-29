-- Таблица праздников семьи
CREATE TABLE IF NOT EXISTS family_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  family_id TEXT NOT NULL,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('birthday', 'anniversary', 'holiday', 'custom')),
  event_date DATE NOT NULL,
  event_time TIME,
  member_id TEXT,
  description TEXT,
  location TEXT,
  budget DECIMAL(10,2),
  spent DECIMAL(10,2) DEFAULT 0,
  guests_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed', 'cancelled')),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_events_family_id ON family_events(family_id);
CREATE INDEX IF NOT EXISTS idx_family_events_date ON family_events(event_date);
CREATE INDEX IF NOT EXISTS idx_family_events_member_id ON family_events(member_id);

-- Таблица задач по организации праздника
CREATE TABLE IF NOT EXISTS event_tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  deadline DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_tasks_event_id ON event_tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tasks_assigned_to ON event_tasks(assigned_to);

-- Таблица гостей
CREATE TABLE IF NOT EXISTS event_guests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'confirmed', 'declined', 'maybe')),
  adults_count INTEGER DEFAULT 1,
  children_count INTEGER DEFAULT 0,
  dietary_restrictions TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_guests_event_id ON event_guests(event_id);

-- Виш-лист подарков для именинника
CREATE TABLE IF NOT EXISTS event_wishlist (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  price DECIMAL(10,2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  reserved_by TEXT,
  reserved_by_name TEXT,
  purchased BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_wishlist_event_id ON event_wishlist(event_id);

-- Виш-лист подарков ДЛЯ ГОСТЕЙ
CREATE TABLE IF NOT EXISTS guest_gifts_wishlist (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  price_per_item DECIMAL(10,2),
  quantity_needed INTEGER DEFAULT 1,
  quantity_purchased INTEGER DEFAULT 0,
  category TEXT CHECK (category IN ('kids', 'adults', 'all')),
  purchased_by TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_gifts_event_id ON guest_gifts_wishlist(event_id);

-- Таблица расходов
CREATE TABLE IF NOT EXISTS event_expenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('venue', 'food', 'decorations', 'entertainment', 'gifts', 'other')),
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_by TEXT NOT NULL,
  receipt_url TEXT,
  paid_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_expenses_event_id ON event_expenses(event_id);

-- Таблица идей
CREATE TABLE IF NOT EXISTS event_ideas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('venue', 'menu', 'decor', 'activities', 'theme')),
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  image_url TEXT,
  votes INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_ideas_event_id ON event_ideas(event_id);