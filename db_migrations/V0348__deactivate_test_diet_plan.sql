-- Деактивация тестового плана диеты (создан при технической проверке фикса, не должен считаться активным планом пользователя)
UPDATE t_p5815085_family_assistant_pro.ai_diet_plans
SET is_active = false
WHERE family_id = '17f14a7e-85eb-4333-b7cb-fdd34272bc28'
  AND operation_id = 'd7qrtkqbcu7kjk7as4dp';