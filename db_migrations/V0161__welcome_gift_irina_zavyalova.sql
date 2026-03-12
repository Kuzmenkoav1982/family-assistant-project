
-- Подарочная премиум-подписка на 1 месяц для Ирины Завьяловой (irina1509@yahoo.com)
INSERT INTO t_p5815085_family_assistant_pro.subscriptions (
  family_id, plan_type, status, amount, currency, start_date, end_date, auto_renew, payment_method, payment_provider
) VALUES (
  '92472192-75b5-4b39-95c2-cb1493a4a3ca',
  'premium_1m',
  'active',
  0.00,
  'RUB',
  NOW(),
  NOW() + INTERVAL '1 month',
  false,
  'gift',
  'admin_gift'
);

-- Начисление 1000 бонусов на кошелёк
UPDATE t_p5815085_family_assistant_pro.family_wallet
SET balance_rub = balance_rub + 1000.00, updated_at = NOW()
WHERE family_id = '92472192-75b5-4b39-95c2-cb1493a4a3ca';

-- Транзакция начисления
INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions (
  wallet_id, type, amount_rub, reason, description, user_id
) VALUES (
  9,
  'income',
  1000.00,
  'welcome_bonus',
  'Приветственный бонус за регистрацию — подарок от команды платформы 🎁',
  '8d4e4dce-2ec3-4953-b93b-5b8631bd5312'
);

-- Приветственное уведомление
INSERT INTO t_p5815085_family_assistant_pro.notifications (
  user_id, family_id, type, title, message, target_url, channel, status, sent_at
) VALUES (
  '8d4e4dce-2ec3-4953-b93b-5b8631bd5312',
  '92472192-75b5-4b39-95c2-cb1493a4a3ca',
  'welcome',
  '🎉 Добро пожаловать в семейный помощник!',
  'Дорогая Ирина! Мы очень рады видеть вас на нашей платформе! В честь вашей регистрации дарим вам месяц Премиум-подписки и 1000 бонусов на кошелёк 🎁 Премиум открывает доступ ко всем функциям: ИИ-ассистент, расширенная аналитика, неограниченные рецепты и многое другое. Желаем уюта и радости в вашей семье! 💛 С теплом, команда «Семейный помощник»',
  '/notifications',
  'push',
  'sent',
  NOW()
);

-- Лог действия администратора
INSERT INTO t_p5815085_family_assistant_pro.admin_actions_log (
  admin_email, action_type, target_type, target_id, details
) VALUES (
  'admin',
  'welcome_gift',
  'user',
  '8d4e4dce-2ec3-4953-b93b-5b8631bd5312',
  '{"action": "welcome_gift", "user_email": "irina1509@yahoo.com", "gifts": ["premium_1m_subscription", "1000_wallet_bonus"], "note": "Приветственный подарок для нового пользователя"}'::jsonb
);
