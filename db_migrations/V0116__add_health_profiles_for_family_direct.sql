-- Создание профилей здоровья для всех 5 членов семьи
-- Профиль 1: Алексей (админ)
INSERT INTO health_profiles (id, user_id, blood_type, rh_factor, allergies, chronic_diseases, privacy, shared_with, created_at, updated_at)
SELECT gen_random_uuid()::text, '40e4eece-5988-4133-a6bb-0aaaee4db0c2', 'O', '+', NULL, NULL, 'private', ARRAY[]::text[], NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM health_profiles WHERE user_id = '40e4eece-5988-4133-a6bb-0aaaee4db0c2');

-- Профиль 2: Член семьи 2
INSERT INTO health_profiles (id, user_id, blood_type, rh_factor, allergies, chronic_diseases, privacy, shared_with, created_at, updated_at)
SELECT gen_random_uuid()::text, '217077d4-0686-43f7-853b-dfa7465e6c51', 'A', '+', NULL, NULL, 'parents', ARRAY['40e4eece-5988-4133-a6bb-0aaaee4db0c2']::text[], NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM health_profiles WHERE user_id = '217077d4-0686-43f7-853b-dfa7465e6c51');

-- Профиль 3: Член семьи 3
INSERT INTO health_profiles (id, user_id, blood_type, rh_factor, allergies, chronic_diseases, privacy, shared_with, created_at, updated_at)
SELECT gen_random_uuid()::text, '92e96008-f2cb-4561-8cef-8f196f8561dd', 'B', '+', NULL, NULL, 'parents', ARRAY['40e4eece-5988-4133-a6bb-0aaaee4db0c2']::text[], NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM health_profiles WHERE user_id = '92e96008-f2cb-4561-8cef-8f196f8561dd');

-- Профиль 4: Член семьи 4
INSERT INTO health_profiles (id, user_id, blood_type, rh_factor, allergies, chronic_diseases, privacy, shared_with, created_at, updated_at)
SELECT gen_random_uuid()::text, 'bfe6a05d-dfa2-4c51-951d-66bd46d0f056', 'AB', '+', NULL, NULL, 'parents', ARRAY['40e4eece-5988-4133-a6bb-0aaaee4db0c2']::text[], NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM health_profiles WHERE user_id = 'bfe6a05d-dfa2-4c51-951d-66bd46d0f056');

-- Профиль 5: Член семьи 5
INSERT INTO health_profiles (id, user_id, blood_type, rh_factor, allergies, chronic_diseases, privacy, shared_with, created_at, updated_at)
SELECT gen_random_uuid()::text, 'f0b4b417-9228-4d98-a0e1-65ba92a4ea2f', 'O', '-', NULL, NULL, 'parents', ARRAY['40e4eece-5988-4133-a6bb-0aaaee4db0c2']::text[], NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM health_profiles WHERE user_id = 'f0b4b417-9228-4d98-a0e1-65ba92a4ea2f');