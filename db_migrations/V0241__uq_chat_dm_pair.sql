CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_dm_pair ON t_p5815085_family_assistant_pro.chat_conversations(family_id, member_a_id, member_b_id) WHERE kind = 'dm';
