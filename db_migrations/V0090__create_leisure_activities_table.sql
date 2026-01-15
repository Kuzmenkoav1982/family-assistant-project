CREATE TABLE IF NOT EXISTS leisure_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('event', 'restaurant', 'attraction', 'entertainment', 'sport', 'culture', 'other')),
  location VARCHAR(255),
  date DATE,
  time VARCHAR(10),
  price DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'RUB',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status VARCHAR(20) NOT NULL DEFAULT 'want_to_go' CHECK (status IN ('want_to_go', 'planned', 'visited')),
  notes TEXT,
  website VARCHAR(500),
  phone VARCHAR(50),
  booking_required BOOLEAN DEFAULT false,
  booking_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leisure_user_id ON leisure_activities(user_id);
CREATE INDEX idx_leisure_status ON leisure_activities(status);
CREATE INDEX idx_leisure_category ON leisure_activities(category);
CREATE INDEX idx_leisure_date ON leisure_activities(date);

COMMENT ON TABLE leisure_activities IS 'Таблица для хранения досуговых активностей пользователей';
COMMENT ON COLUMN leisure_activities.category IS 'Категория: event (мероприятие), restaurant (ресторан), attraction (достопримечательность), entertainment (развлечение), sport (спорт), culture (культура), other (другое)';
COMMENT ON COLUMN leisure_activities.status IS 'Статус: want_to_go (хочу посетить), planned (запланировано), visited (посещено)';
