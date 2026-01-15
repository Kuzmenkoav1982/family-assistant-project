-- Увеличиваем размер поля budget с NUMERIC(10,2) до NUMERIC(15,2)
-- Это позволит хранить бюджеты до 9 999 999 999 999.99 (почти 10 триллионов)

ALTER TABLE trips 
ALTER COLUMN budget TYPE NUMERIC(15, 2);