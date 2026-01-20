-- Добавляем поле active_until для автоархивирования тарифов
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS active_until TIMESTAMP;

COMMENT ON COLUMN subscription_plans.active_until IS 'Дата окончания действия тарифа. После этой даты тариф автоматически скрывается';