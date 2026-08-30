-- Пополнение кошелька семьи Юлии (компенсация за баг с правами доступа)
UPDATE t_p5815085_family_assistant_pro.family_wallet
SET balance_rub = balance_rub + 500.00,
    updated_at = now()
WHERE family_id = '7d1fed00-7a06-4786-acdf-1046b1ca6d2f';

INSERT INTO t_p5815085_family_assistant_pro.wallet_transactions
  (wallet_id, type, amount_rub, reason, description, user_id)
VALUES (
  82,
  'topup',
  500.00,
  'support_compensation',
  'Компенсация за ошибку с правами доступа (обращение #36)',
  'c8cb3686-fee5-44a0-8a6c-785e745cf2ce'
);

-- Уведомление Юлии в системе
INSERT INTO t_p5815085_family_assistant_pro.notifications
  (user_id, family_id, type, title, message, target_url, channel, status)
VALUES (
  'c8cb3686-fee5-44a0-8a6c-785e745cf2ce',
  '7d1fed00-7a06-4786-acdf-1046b1ca6d2f',
  'support_reply',
  'Ответ от поддержки',
  'Юлия, добрый день! Уже всё починили: теперь у Вас полные права администратора, попробуйте, пожалуйста, снова добавить второго ребёнка — лимитов на количество детей нет, должно получиться. Извините за неудобство и спасибо, что написали! В качестве извинения пополнили семейный кошелёк на 500 ₽.',
  '/settings?section=family',
  'in_app',
  'sent'
);
