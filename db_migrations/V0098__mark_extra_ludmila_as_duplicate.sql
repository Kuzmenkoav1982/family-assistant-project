-- Помечаем лишнюю Людмилу как дубликат

UPDATE t_p5815085_family_assistant_pro.family_members
SET name = '[ДУБЛИКАТ - УДАЛИТЬ] ' || name,
    updated_at = CURRENT_TIMESTAMP
WHERE id = '1903430d-7e05-4fe8-b1dd-fbcdf63d81ce';