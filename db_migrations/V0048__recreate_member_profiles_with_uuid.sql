-- Пересоздаем таблицу member_profiles с правильными типами
-- Старая таблица переименовывается в _old

ALTER TABLE t_p5815085_family_assistant_pro.member_profiles 
RENAME TO member_profiles_old;

CREATE TABLE t_p5815085_family_assistant_pro.member_profiles (
  id SERIAL PRIMARY KEY,
  member_id uuid NOT NULL UNIQUE,
  family_id uuid NOT NULL,
  birth_date date,
  birth_time time,
  birth_place varchar(255),
  height integer,
  weight numeric(5,2),
  love_languages jsonb DEFAULT '[]'::jsonb,
  triggers jsonb DEFAULT '[]'::jsonb,
  boundaries text,
  stress_relief jsonb DEFAULT '[]'::jsonb,
  personality_type varchar(50),
  good_habits jsonb DEFAULT '[]'::jsonb,
  bad_habits jsonb DEFAULT '[]'::jsonb,
  hobbies jsonb DEFAULT '[]'::jsonb,
  lifestyle varchar(50),
  energy_type varchar(50),
  communication_style text,
  favorite_things jsonb DEFAULT '[]'::jsonb,
  disliked_things jsonb DEFAULT '[]'::jsonb,
  additional_info text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_member_profiles_member_id ON t_p5815085_family_assistant_pro.member_profiles(member_id);
CREATE INDEX idx_member_profiles_family_id ON t_p5815085_family_assistant_pro.member_profiles(family_id);