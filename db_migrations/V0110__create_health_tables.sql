-- Таблица профилей здоровья (один на каждого члена семьи)
CREATE TABLE IF NOT EXISTS health_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    blood_type TEXT,
    rh_factor TEXT CHECK (rh_factor IN ('+', '-')),
    allergies TEXT[],
    chronic_diseases TEXT[],
    privacy TEXT NOT NULL CHECK (privacy IN ('private', 'parents', 'family', 'selected')) DEFAULT 'private',
    shared_with TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица экстренных контактов
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    name TEXT NOT NULL,
    relation TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица медицинских записей
CREATE TABLE IF NOT EXISTS health_records (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('visit', 'analysis', 'vaccination', 'symptom', 'prescription', 'insurance')),
    date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    doctor TEXT,
    doctor_id TEXT,
    clinic TEXT,
    diagnosis TEXT,
    recommendations TEXT,
    ai_analysis_status TEXT CHECK (ai_analysis_status IN ('processing', 'completed', 'error')),
    ai_extracted_text TEXT,
    ai_interpretation TEXT,
    ai_warnings TEXT[],
    ai_processed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица вложений к записям
CREATE TABLE IF NOT EXISTS health_attachments (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf', 'document')),
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица прививок
CREATE TABLE IF NOT EXISTS vaccinations (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    next_date DATE,
    clinic TEXT NOT NULL,
    doctor TEXT,
    batch_number TEXT,
    side_effects TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица лекарств
CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    doctor TEXT,
    purpose TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица напоминаний о приеме лекарств
CREATE TABLE IF NOT EXISTS medication_reminders (
    id TEXT PRIMARY KEY,
    medication_id TEXT NOT NULL,
    time TIME NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    notification_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица показателей здоровья
CREATE TABLE IF NOT EXISTS vital_records (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('weight', 'height', 'pressure', 'pulse', 'temperature', 'glucose')),
    value NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица врачей
CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    clinic TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    rating NUMERIC CHECK (rating >= 0 AND rating <= 5),
    notes TEXT,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    last_visit DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица страховых полисов
CREATE TABLE IF NOT EXISTS insurance_policies (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('oms', 'dms', 'travel', 'life')),
    policy_number TEXT NOT NULL,
    provider TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    coverage TEXT[],
    premium NUMERIC,
    remind_before_days INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL CHECK (status IN ('active', 'expiring', 'expired')) DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица телемедицинских сессий
CREATE TABLE IF NOT EXISTS telemedicine_sessions (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    room_url TEXT,
    notes TEXT,
    recording_url TEXT,
    prescription TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_health_profiles_user_id ON health_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_profile_id ON health_records(profile_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(date);
CREATE INDEX IF NOT EXISTS idx_vaccinations_profile_id ON vaccinations(profile_id);
CREATE INDEX IF NOT EXISTS idx_medications_profile_id ON medications(profile_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(active);
CREATE INDEX IF NOT EXISTS idx_vital_records_profile_id ON vital_records(profile_id);
CREATE INDEX IF NOT EXISTS idx_vital_records_date ON vital_records(date);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_profile_id ON insurance_policies(profile_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_profile_id ON telemedicine_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_status ON telemedicine_sessions(status);
