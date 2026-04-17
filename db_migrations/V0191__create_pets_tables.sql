-- Питомцы семьи
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL,
  name varchar(120) NOT NULL,
  species varchar(60),
  breed varchar(120),
  gender varchar(20),
  birth_date date,
  weight numeric(6,2),
  color varchar(80),
  chip_number varchar(80),
  photo_url text,
  notes text,
  allergies text,
  responsible_member_id uuid,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pets_family ON t_p5815085_family_assistant_pro.pets(family_id);

-- Вакцинация
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.pet_vaccines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  family_id uuid NOT NULL,
  vaccine_name varchar(200) NOT NULL,
  vaccination_date date,
  next_date date,
  clinic varchar(200),
  vet_name varchar(200),
  notes text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_vaccines_pet ON t_p5815085_family_assistant_pro.pet_vaccines(pet_id);

-- Визиты к ветеринару
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.pet_vet_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  family_id uuid NOT NULL,
  visit_date date,
  clinic varchar(200),
  vet_name varchar(200),
  reason varchar(300),
  diagnosis text,
  recommendations text,
  cost numeric(10,2),
  next_visit date,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_vet_visits_pet ON t_p5815085_family_assistant_pro.pet_vet_visits(pet_id);

-- Лекарства и витамины
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.pet_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  family_id uuid NOT NULL,
  name varchar(200) NOT NULL,
  dosage varchar(100),
  frequency varchar(100),
  start_date date,
  end_date date,
  is_active boolean DEFAULT TRUE,
  notes text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_meds_pet ON t_p5815085_family_assistant_pro.pet_medications(pet_id);

-- Питание
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.pet_food (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  family_id uuid NOT NULL,
  food_name varchar(200),
  food_type varchar(80),
  brand varchar(150),
  portion varchar(80),
  meals_per_day int,
  feeding_time varchar(150),
  notes text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_food_pet ON t_p5815085_family_assistant_pro.pet_food(pet_id);

-- Груминг и уход
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.pet_grooming (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  family_id uuid NOT NULL,
  procedure_type varchar(100) NOT NULL,
  procedure_date date,
  next_date date,
  salon varchar(200),
  cost numeric(10,2),
  notes text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_grooming_pet ON t_p5815085_family_assistant_pro.pet_grooming(pet_id);

-- Активность
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.pet_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  family_id uuid NOT NULL,
  activity_type varchar(80),
  activity_date date DEFAULT CURRENT_DATE,
  duration_minutes int,
  distance_km numeric(6,2),
  location varchar(200),
  notes text,
  member_id uuid,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_activities_pet ON t_p5815085_family_assistant_pro.pet_activities(pet_id);

-- Расходы
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.pet_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  family_id uuid NOT NULL,
  category varchar(80),
  title varchar(200),
  amount numeric(10,2),
  expense_date date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_expenses_pet ON t_p5815085_family_assistant_pro.pet_expenses(pet_id);

-- Показатели здоровья
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.pet_health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  family_id uuid NOT NULL,
  measured_at date DEFAULT CURRENT_DATE,
  weight numeric(6,2),
  temperature numeric(4,1),
  pulse int,
  mood varchar(50),
  appetite varchar(50),
  notes text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_health_pet ON t_p5815085_family_assistant_pro.pet_health_metrics(pet_id);

-- Вещи и игрушки
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.pet_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  family_id uuid NOT NULL,
  item_name varchar(200) NOT NULL,
  category varchar(80),
  quantity int DEFAULT 1,
  cost numeric(10,2),
  purchased_at date,
  notes text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_items_pet ON t_p5815085_family_assistant_pro.pet_items(pet_id);

-- Ответственные (распределение обязанностей)
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.pet_responsibilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  family_id uuid NOT NULL,
  member_id uuid,
  member_name varchar(150),
  responsibility varchar(100),
  schedule varchar(200),
  notes text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_responsibilities_pet ON t_p5815085_family_assistant_pro.pet_responsibilities(pet_id);

-- Фотоальбом
CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.pet_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  family_id uuid NOT NULL,
  photo_url text NOT NULL,
  caption varchar(300),
  photo_date date DEFAULT CURRENT_DATE,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_photos_pet ON t_p5815085_family_assistant_pro.pet_photos(pet_id);
