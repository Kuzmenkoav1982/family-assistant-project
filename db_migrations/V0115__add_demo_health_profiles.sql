-- Создание демо-профилей здоровья для первых трех членов семьи
INSERT INTO health_profiles (id, user_id, blood_type, rh_factor, allergies, chronic_diseases, privacy, shared_with, created_at, updated_at)
VALUES 
    (gen_random_uuid()::text, 'c0e043ce-8f71-45df-999e-f76bf696d4c9', 'O', '+', NULL, NULL, 'parents', ARRAY[]::text[], NOW(), NOW()),
    (gen_random_uuid()::text, '7659b675-d649-4927-9e15-010f3735e75d', 'A', '+', NULL, NULL, 'parents', ARRAY[]::text[], NOW(), NOW()),
    (gen_random_uuid()::text, 'c7367832-cc29-4520-92d1-e02dac3d2cbd', 'B', '-', NULL, NULL, 'private', ARRAY[]::text[], NOW(), NOW());