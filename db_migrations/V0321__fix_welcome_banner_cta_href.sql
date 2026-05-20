-- Fix welcome banner CTA: /profile не существует → /settings
UPDATE t_p5815085_family_assistant_pro.status_banners
SET cta_href = '/settings',
    updated_at = now()
WHERE id = '9aec9f8f-fc85-450a-a3c2-2e16bde454ad'
  AND cta_href = '/profile';