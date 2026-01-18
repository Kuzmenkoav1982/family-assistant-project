-- Отвязка зависшего члена семьи от удалённого пользователя
UPDATE t_p5815085_family_assistant_pro.family_members 
SET user_id = NULL
WHERE user_id = '40fb0525-5ec7-4693-bb7b-d63ac1879e8b';