INSERT INTO t_p5815085_family_assistant_pro.calendar_events 
(family_id, title, description, date, time, category, reminder_enabled, completed)
VALUES 
('ca92a40b-8e92-4709-9dca-54f52f86d364', 'Тестовое уведомление - проверка push', 'Если вы это видите - уведомления работают!', CURRENT_DATE, TO_CHAR(NOW() + INTERVAL '7 minutes', 'HH24:MI'), 'personal', true, false);