-- Обновление constraint для payment_method в domovoy_donations
-- Добавляем 'yookassa' как валидный способ оплаты

-- Сначала удаляем старый constraint
ALTER TABLE t_p5815085_family_assistant_pro.domovoy_donations 
DROP CONSTRAINT IF EXISTS domovoy_donations_payment_method_check;

-- Создаём новый constraint с 'yookassa'
ALTER TABLE t_p5815085_family_assistant_pro.domovoy_donations 
ADD CONSTRAINT domovoy_donations_payment_method_check 
CHECK (payment_method IN ('sbp', 'card', 'yumoney', 'yookassa'));