-- Добавляем поле exchange_rate для хранения курса валют
ALTER TABLE t_p5815085_family_assistant_pro.trip_expenses 
ADD COLUMN exchange_rate NUMERIC(10, 4) DEFAULT 1.0;

-- Комментарий к полю
COMMENT ON COLUMN t_p5815085_family_assistant_pro.trip_expenses.exchange_rate IS 'Курс валюты относительно валюты поездки на момент добавления расхода';
