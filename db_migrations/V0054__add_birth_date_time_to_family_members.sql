-- Добавляем поля для даты и времени рождения членов семьи
-- Это нужно для астрологических прогнозов Домового

ALTER TABLE t_p5815085_family_assistant_pro.family_members
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS birth_time TIME;

COMMENT ON COLUMN t_p5815085_family_assistant_pro.family_members.birth_date IS 'Дата рождения члена семьи для астрологических расчетов';
COMMENT ON COLUMN t_p5815085_family_assistant_pro.family_members.birth_time IS 'Время рождения для точной карты Бацзы';