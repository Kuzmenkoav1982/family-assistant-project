-- Добавляем колонку profile_data для хранения дополнительных данных профиля
ALTER TABLE t_p5815085_family_assistant_pro.family_members 
ADD COLUMN IF NOT EXISTS profile_data jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN t_p5815085_family_assistant_pro.family_members.profile_data IS 'Дополнительные данные профиля: achievements, responsibilities, foodPreferences, dreams, piggyBank и т.д.';