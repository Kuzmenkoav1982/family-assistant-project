
-- Помечаем неоплаченные pending-подписки как cancelled
UPDATE t_p5815085_family_assistant_pro.subscriptions
SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  '47a458b2-cb42-4708-96d6-639a2b8a5351',
  '231b2189-3638-4edb-be3a-db64c22df4b1',
  'b755f42c-eb6c-4fa0-a141-d25e67a3eb9e',
  '4dd08986-0517-4feb-bdb6-eeedc0487f93',
  '2f03f941-9aa3-4f07-b2c4-7b0fa34f7004',
  '9d5e85d7-9c72-41ab-a99d-f953cb84d7ef',
  '82323c2d-b299-46b4-94b2-c4e50c86592b',
  'f9eb4741-7eff-4f8d-9a66-5ad6552c940d'
)
AND status = 'pending';

-- Помечаем соответствующие платежи как cancelled
UPDATE t_p5815085_family_assistant_pro.payments
SET status = 'cancelled'
WHERE subscription_id IN (
  '47a458b2-cb42-4708-96d6-639a2b8a5351',
  '231b2189-3638-4edb-be3a-db64c22df4b1',
  'b755f42c-eb6c-4fa0-a141-d25e67a3eb9e',
  '4dd08986-0517-4feb-bdb6-eeedc0487f93',
  '2f03f941-9aa3-4f07-b2c4-7b0fa34f7004',
  '9d5e85d7-9c72-41ab-a99d-f953cb84d7ef',
  '82323c2d-b299-46b4-94b2-c4e50c86592b',
  'f9eb4741-7eff-4f8d-9a66-5ad6552c940d'
)
AND status = 'pending';

-- Деактивируем дублирующуюся подписку (та же дата что и основная)
UPDATE t_p5815085_family_assistant_pro.subscriptions
SET status = 'expired', updated_at = CURRENT_TIMESTAMP
WHERE id = 'aec4d3db-faed-405b-b72d-eaefa74887ce';

-- Деактивируем старую подписку до 02.05 (есть новая до 01.06)
UPDATE t_p5815085_family_assistant_pro.subscriptions
SET status = 'expired', updated_at = CURRENT_TIMESTAMP
WHERE id = '83420a35-4b55-4e06-be2a-3dcb8132d3be';

-- Помечаем старую истёкшую подписку
UPDATE t_p5815085_family_assistant_pro.subscriptions
SET status = 'expired', updated_at = CURRENT_TIMESTAMP
WHERE id = '75a15a08-e390-422b-ae18-c5130339e169';
