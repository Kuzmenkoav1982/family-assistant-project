-- Устанавливаем completed_date для всех уже выполненных задач
-- Используем updated_at как приблизительную дату выполнения (если она есть), иначе created_at
UPDATE "t_p5815085_family_assistant_pro".tasks_v2 
SET completed_date = COALESCE(updated_at, created_at)
WHERE completed = true 
AND completed_date IS NULL;