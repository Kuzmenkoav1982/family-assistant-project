-- Feature flags для модуля «Портфолио развития»
-- portfolio_compare_enabled: семейный обзор (сравнение участников). Чувствительная функция, по умолчанию off
-- portfolio_ai_insights: AI-инсайты через YandexGPT. По умолчанию on
-- portfolio_pdf_export: экспорт портфолио в PDF. По умолчанию on

INSERT INTO t_p5815085_family_assistant_pro.feature_flags (flag_key, is_enabled, description)
VALUES
  ('portfolio_compare_enabled', false, 'Семейный обзор: сравнение профилей участников семьи (только для взрослых)'),
  ('portfolio_ai_insights', true, 'AI-инсайты в портфолио (YandexGPT)'),
  ('portfolio_pdf_export', true, 'Экспорт портфолио ребёнка в PDF')
ON CONFLICT (flag_key) DO NOTHING;