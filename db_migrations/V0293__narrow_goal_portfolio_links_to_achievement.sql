-- Этап 3.3.2 follow-up: сужаем контракт до item_type = 'achievement'.
-- Variant A: убираем 'development_plan' до полной симметричной поддержки.
-- Пересоздаём CHECK constraint. Если в данных уже есть строки с development_plan,
-- этот ALTER упадёт — но на этапе разработки этого не должно быть.

ALTER TABLE goal_portfolio_links
    DROP CONSTRAINT IF EXISTS goal_portfolio_links_item_type_check;

ALTER TABLE goal_portfolio_links
    ADD CONSTRAINT goal_portfolio_links_item_type_check
    CHECK (item_type IN ('achievement'));
