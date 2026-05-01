-- Перевязываем разделы на реально заполненные таблицы

-- Бюджет → finance_transactions (26 записей, family_id)
UPDATE t_p5815085_family_assistant_pro.dashboard_sections SET auto_table='finance_transactions', auto_user_field='family_id', auto_min_count=5 WHERE slug='budget';

-- Финансовые цели → family_goals (9 записей)
UPDATE t_p5815085_family_assistant_pro.dashboard_sections SET auto_table='family_goals', auto_user_field='family_id', auto_min_count=1 WHERE slug='goals_fin';

-- Долги — finance_debts (15 записей) уже верно
-- Аналитика — finance_transactions (26) уже верно

-- Здоровье → Чекапы → children_doctor_visits + health_records (есть family_id?)
-- Проверим лучше: используем health_profiles (user_id)
UPDATE t_p5815085_family_assistant_pro.dashboard_sections SET auto_table='health_profiles', auto_user_field='user_id', auto_min_count=1, auto_supported=TRUE WHERE slug='checkups';

-- Лекарства → children_medications (9 записей, family_id)  
UPDATE t_p5815085_family_assistant_pro.dashboard_sections SET auto_table='children_medications', auto_user_field='family_id', auto_min_count=1, auto_supported=TRUE WHERE slug='medications';

-- Карты здоровья → health_profiles (user_id) — оставим
-- Активность → health_profiles
UPDATE t_p5815085_family_assistant_pro.dashboard_sections SET auto_table='health_profiles', auto_user_field='user_id', auto_min_count=1, auto_supported=TRUE WHERE slug='activity';
