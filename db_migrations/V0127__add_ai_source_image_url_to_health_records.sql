-- Добавление поля для хранения URL исходного изображения ИИ-анализа
ALTER TABLE health_records 
ADD COLUMN ai_source_image_url text NULL;

COMMENT ON COLUMN health_records.ai_source_image_url IS 'URL исходного изображения или документа для ИИ-анализа';