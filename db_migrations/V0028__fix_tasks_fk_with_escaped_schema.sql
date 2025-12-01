-- Удаляем старые foreign key constraints
ALTER TABLE "t_p5815085_family_assistant_pro".tasks 
DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;

ALTER TABLE "t_p5815085_family_assistant_pro".tasks 
DROP CONSTRAINT IF EXISTS tasks_family_id_fkey;

-- Создаем заново с правильно экранированной схемой
ALTER TABLE "t_p5815085_family_assistant_pro".tasks
ADD CONSTRAINT tasks_assignee_id_fkey 
FOREIGN KEY (assignee_id) REFERENCES "t_p5815085_family_assistant_pro".family_members(id);

ALTER TABLE "t_p5815085_family_assistant_pro".tasks
ADD CONSTRAINT tasks_family_id_fkey 
FOREIGN KEY (family_id) REFERENCES "t_p5815085_family_assistant_pro".families(id);