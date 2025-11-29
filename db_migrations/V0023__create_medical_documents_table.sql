-- Создание таблицы для хранения медицинских документов (рецепты, анализы, справки)
CREATE TABLE IF NOT EXISTS children_medical_documents (
    id VARCHAR(100) PRIMARY KEY,
    child_id VARCHAR(100) NOT NULL,
    family_id VARCHAR(100),
    
    -- Тип документа
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('prescription', 'analysis', 'doctor_visit', 'vaccination', 'other')),
    
    -- Информация о файле
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    
    -- Связь с записями
    related_id VARCHAR(100),
    related_type VARCHAR(50),
    
    -- Метаданные
    title VARCHAR(255),
    description TEXT,
    uploaded_by VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Временные метки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_medical_docs_child ON children_medical_documents(child_id);
CREATE INDEX IF NOT EXISTS idx_medical_docs_family ON children_medical_documents(family_id);
CREATE INDEX IF NOT EXISTS idx_medical_docs_type ON children_medical_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_medical_docs_related ON children_medical_documents(related_id, related_type);
CREATE INDEX IF NOT EXISTS idx_medical_docs_uploaded ON children_medical_documents(uploaded_at DESC);

-- Добавление столбцов для файлов в существующие таблицы
ALTER TABLE children_prescriptions ADD COLUMN IF NOT EXISTS file_urls TEXT[];
ALTER TABLE children_analyses ADD COLUMN IF NOT EXISTS file_urls TEXT[];
ALTER TABLE children_doctor_visits ADD COLUMN IF NOT EXISTS file_urls TEXT[];
ALTER TABLE children_vaccinations ADD COLUMN IF NOT EXISTS file_urls TEXT[];

COMMENT ON TABLE children_medical_documents IS 'Хранение медицинских документов детей (рецепты, анализы, справки)';
COMMENT ON COLUMN children_medical_documents.document_type IS 'Тип документа: prescription, analysis, doctor_visit, vaccination, other';
COMMENT ON COLUMN children_medical_documents.related_id IS 'ID связанной записи (рецепта, анализа и т.д.)';
COMMENT ON COLUMN children_medical_documents.related_type IS 'Тип связанной записи (prescription, analysis и т.д.)';
