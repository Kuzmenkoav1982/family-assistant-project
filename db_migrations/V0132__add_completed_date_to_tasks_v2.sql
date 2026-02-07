-- Добавляем столбец completed_date в таблицу tasks_v2 для отслеживания даты выполнения задачи
ALTER TABLE "t_p5815085_family_assistant_pro".tasks_v2 
ADD COLUMN IF NOT EXISTS completed_date TIMESTAMP;

-- Комментарий для столбца
COMMENT ON COLUMN "t_p5815085_family_assistant_pro".tasks_v2.completed_date IS 'Дата и время выполнения задачи (когда completed переключился в true)';

-- Создаём индекс для быстрого поиска задач, выполненных сегодня
CREATE INDEX IF NOT EXISTS idx_tasks_v2_completed_date ON "t_p5815085_family_assistant_pro".tasks_v2(completed_date) WHERE completed = true;