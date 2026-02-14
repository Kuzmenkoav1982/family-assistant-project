
CREATE TABLE IF NOT EXISTS diet_meal_ingredients (
  id SERIAL PRIMARY KEY,
  meal_id INT REFERENCES diet_meals(id),
  ingredient_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS diet_weight_log (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  profile_id INT,
  plan_id INT REFERENCES diet_plans(id),
  weight_kg DECIMAL(5,2) NOT NULL,
  wellbeing TEXT,
  measured_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diet_motivation_log (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT REFERENCES diet_plans(id) NOT NULL,
  message_type VARCHAR(20),
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diet_sos_requests (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT REFERENCES diet_plans(id) NOT NULL,
  reason VARCHAR(50) NOT NULL,
  user_comment TEXT,
  resolution VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_wallet (
  id SERIAL PRIMARY KEY,
  family_id INT UNIQUE NOT NULL,
  balance_rub DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id SERIAL PRIMARY KEY,
  wallet_id INT REFERENCES family_wallet(id),
  type VARCHAR(20) NOT NULL,
  amount_rub DECIMAL(10,2) NOT NULL,
  reason VARCHAR(100),
  description TEXT,
  user_id INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_from_products (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  family_id INT,
  input_products TEXT[] NOT NULL,
  restrictions TEXT,
  generated_recipes JSONB NOT NULL,
  selected_recipe_index INT,
  with_photo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diet_plans_user ON diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_family ON diet_plans(family_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_status ON diet_plans(status);
CREATE INDEX IF NOT EXISTS idx_diet_meals_plan ON diet_meals(plan_id);
CREATE INDEX IF NOT EXISTS idx_diet_meals_date ON diet_meals(meal_date);
CREATE INDEX IF NOT EXISTS idx_diet_weight_user ON diet_weight_log(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_weight_plan ON diet_weight_log(plan_id);
CREATE INDEX IF NOT EXISTS idx_wallet_family ON family_wallet(family_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_recipe_products_user ON recipe_from_products(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_quiz_user ON diet_quiz_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_mini_quiz_user ON diet_mini_quiz(user_id);
