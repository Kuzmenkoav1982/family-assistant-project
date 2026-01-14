-- Создаём новую таблицу расходов для поездок
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.trip_expenses (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES t_p5815085_family_assistant_pro.trips(id),
  category VARCHAR(50) NOT NULL, -- 'flights', 'hotels', 'excursions', 'food', 'transport', 'other'
  title VARCHAR(255) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'RUB',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'paid', 'pending', 'on_site'
  payment_date DATE,
  booking_number VARCHAR(100),
  provider VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого получения расходов по поездке
CREATE INDEX IF NOT EXISTS idx_trip_expenses_trip_id 
ON t_p5815085_family_assistant_pro.trip_expenses(trip_id);

-- Миграция данных из trip_bookings в trip_expenses (если есть)
INSERT INTO t_p5815085_family_assistant_pro.trip_expenses 
  (trip_id, category, title, amount, currency, payment_status, booking_number, provider, notes, created_at)
SELECT 
  trip_id,
  CASE booking_type
    WHEN 'flight' THEN 'flights'
    WHEN 'hotel' THEN 'hotels'
    WHEN 'tour' THEN 'excursions'
    ELSE 'other'
  END,
  title,
  COALESCE(cost, 0),
  COALESCE(currency, 'RUB'),
  CASE status
    WHEN 'confirmed' THEN 'paid'
    WHEN 'pending' THEN 'pending'
    ELSE 'pending'
  END,
  booking_number,
  provider,
  notes,
  created_at
FROM t_p5815085_family_assistant_pro.trip_bookings
WHERE NOT EXISTS (
  SELECT 1 FROM t_p5815085_family_assistant_pro.trip_expenses 
  WHERE trip_expenses.trip_id = trip_bookings.trip_id
);