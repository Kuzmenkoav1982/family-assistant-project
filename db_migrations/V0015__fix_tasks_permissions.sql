-- Устанавливаем права по умолчанию для всех будущих таблиц в схеме
ALTER DEFAULT PRIVILEGES IN SCHEMA t_p5815085_family_assistant_pro 
GRANT SELECT, INSERT, UPDATE ON TABLES TO PUBLIC;

ALTER DEFAULT PRIVILEGES IN SCHEMA t_p5815085_family_assistant_pro 
GRANT USAGE, SELECT ON SEQUENCES TO PUBLIC;