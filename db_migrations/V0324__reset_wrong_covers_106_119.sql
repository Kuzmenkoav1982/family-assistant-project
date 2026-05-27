-- Сброс некорректных обложек обратно для повторного импорта
UPDATE t_p5815085_family_assistant_pro.public_blog_posts
SET cover_image_url = NULL
WHERE id BETWEEN 106 AND 119
  AND cover_image_url LIKE '%bucket/blog-covers/max-1%';