-- Изменение типа поля value с numeric на text для поддержки строковых значений (например, давление 125/85)
ALTER TABLE vital_records ALTER COLUMN value TYPE text;