-- Очистка QA smoke-теста после проверки фикса useDietQuiz (баг №3: сохранение AI-диеты в diet_plans/family_meal_plans)
UPDATE t_p5815085_family_assistant_pro.diet_plans SET status = 'completed' WHERE id = 7;
UPDATE t_p5815085_family_assistant_pro.ai_diet_plans SET is_active = false WHERE user_id = 'bbeab726-0fa0-4a55-b469-36ff3a86ad08';
UPDATE t_p5815085_family_assistant_pro.family_wallet SET balance_rub = 1000 WHERE family_id = '00000000-0000-0000-0000-000000000001';