-- Опечатка в предыдущей миграции: в описание флага попал посторонний символ.
UPDATE t_p5815085_family_assistant_pro.feature_flags
SET description = 'Технический тумблер: разрешена ли запись новых координат ВООБЩЕ (для любого сценария). Реальный допуск взрослый/ребёнок решается через geolocation_adult_self_collection_enabled и geolocation_minor_collection_enabled — они проверяются дополнительно.'
WHERE flag_key = 'geolocation_collection_enabled';
