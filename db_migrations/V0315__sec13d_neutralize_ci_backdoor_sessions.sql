-- SEC-1.3d: нейтрализация CI backdoor sessions.
-- Принудительно ревокируем и делаем невалидными все тестовые сессии.
UPDATE admin_sessions
SET revoked_at = '2000-01-01 00:00:00+00',
    expires_at = '2000-01-01 00:00:00+00',
    token_hash = concat('NEUTRALIZED_', id)
WHERE admin_email = 'ci-test@admin.local'
   OR admin_email = 'sanity@test.local';
