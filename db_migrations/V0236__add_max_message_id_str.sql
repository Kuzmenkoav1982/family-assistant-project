ALTER TABLE public_blog_posts ADD COLUMN IF NOT EXISTS max_message_id_str VARCHAR(80);
CREATE INDEX IF NOT EXISTS idx_blog_max_msg_str ON public_blog_posts(max_message_id_str);