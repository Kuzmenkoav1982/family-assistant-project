INSERT INTO t_p5815085_family_assistant_pro.feature_flags (flag_key, is_enabled, description)
VALUES
  ('family_tracker_enabled', true, 'Геолокация семьи: отслеживание координат участников и геозоны'),
  ('family_chat_enabled', true, 'Семейный чат: обмен сообщениями между участниками семьи'),
  ('push_notifications_enabled', true, 'Push-уведомления в браузере и мобильном экране'),
  ('telemedicine_enabled', true, 'Телемедицина: онлайн-консультации с врачами'),
  ('referral_program_enabled', true, 'Реферальная программа: приглашения и бонусы за друзей'),
  ('rating_campaigns_enabled', true, 'Рейтинги и акции: соревнования семей, лидерборды, призы'),
  ('data_export_enabled', true, 'Экспорт персональных данных пользователя (152-ФЗ/GDPR)'),
  ('oauth_login_enabled', true, 'Вход через внешние провайдеры (OAuth): Яндекс, VK и др.'),
  ('analytics_tracking_enabled', true, 'Сбор аналитики: просмотры страниц и пользовательские события')
ON CONFLICT (flag_key) DO NOTHING;