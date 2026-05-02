-- Система рейтингов, призовых акций и реферальной программы

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.rating_campaigns (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  banner_text TEXT,
  period_type VARCHAR(20) NOT NULL DEFAULT 'monthly',
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  weight_progress NUMERIC(5,2) NOT NULL DEFAULT 1.00,
  weight_activity NUMERIC(5,2) NOT NULL DEFAULT 0.50,
  weight_engagement NUMERIC(5,2) NOT NULL DEFAULT 0.30,
  weight_referrals NUMERIC(5,2) NOT NULL DEFAULT 0.20,
  min_members INTEGER NOT NULL DEFAULT 2,
  min_progress INTEGER NOT NULL DEFAULT 0,
  is_payout_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rating_campaigns_status ON t_p5815085_family_assistant_pro.rating_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_rating_campaigns_period ON t_p5815085_family_assistant_pro.rating_campaigns(starts_at, ends_at);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.rating_prizes (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  place_from INTEGER NOT NULL,
  place_to INTEGER NOT NULL,
  amount_rub NUMERIC(10,2) NOT NULL DEFAULT 0,
  prize_type VARCHAR(20) NOT NULL DEFAULT 'wallet',
  description TEXT,
  badge_slug VARCHAR(64),
  promo_code_id INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rating_prizes_campaign ON t_p5815085_family_assistant_pro.rating_prizes(campaign_id);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.rating_leaderboard (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  family_id UUID NOT NULL,
  place INTEGER NOT NULL DEFAULT 0,
  score NUMERIC(10,2) NOT NULL DEFAULT 0,
  progress_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  activity_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  engagement_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  referral_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  members_count INTEGER NOT NULL DEFAULT 0,
  overall_progress INTEGER NOT NULL DEFAULT 0,
  is_disqualified BOOLEAN NOT NULL DEFAULT FALSE,
  disqualified_reason TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campaign_id, family_id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_campaign_place ON t_p5815085_family_assistant_pro.rating_leaderboard(campaign_id, place);
CREATE INDEX IF NOT EXISTS idx_leaderboard_family ON t_p5815085_family_assistant_pro.rating_leaderboard(family_id);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.rating_payouts (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  family_id UUID NOT NULL,
  place INTEGER NOT NULL,
  amount_rub NUMERIC(10,2) NOT NULL DEFAULT 0,
  prize_type VARCHAR(20) NOT NULL DEFAULT 'wallet',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  wallet_transaction_id INTEGER,
  paid_at TIMESTAMP,
  paid_by UUID,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campaign_id, family_id, place)
);

CREATE INDEX IF NOT EXISTS idx_payouts_campaign ON t_p5815085_family_assistant_pro.rating_payouts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_payouts_family ON t_p5815085_family_assistant_pro.rating_payouts(family_id);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.rating_score_history (
  id BIGSERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  family_id UUID NOT NULL,
  score NUMERIC(10,2) NOT NULL DEFAULT 0,
  overall_progress INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_score_history_campaign_family ON t_p5815085_family_assistant_pro.rating_score_history(campaign_id, family_id, recorded_at);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.referral_program_settings (
  id SERIAL PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reward_inviter_on_signup NUMERIC(10,2) NOT NULL DEFAULT 500.00,
  reward_inviter_on_active NUMERIC(10,2) NOT NULL DEFAULT 1500.00,
  reward_invitee_welcome NUMERIC(10,2) NOT NULL DEFAULT 300.00,
  rating_bonus_percent NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  active_min_members INTEGER NOT NULL DEFAULT 3,
  active_min_progress INTEGER NOT NULL DEFAULT 30,
  active_window_days INTEGER NOT NULL DEFAULT 7,
  max_rewards_per_inviter INTEGER NOT NULL DEFAULT 0,
  updated_by UUID,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p5815085_family_assistant_pro.referral_program_settings (id, is_enabled)
VALUES (1, TRUE) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.referral_codes (
  id SERIAL PRIMARY KEY,
  family_id UUID NOT NULL UNIQUE,
  code VARCHAR(32) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  uses_count INTEGER NOT NULL DEFAULT 0,
  successful_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_family ON t_p5815085_family_assistant_pro.referral_codes(family_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON t_p5815085_family_assistant_pro.referral_codes(code);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.referral_invites (
  id SERIAL PRIMARY KEY,
  inviter_family_id UUID NOT NULL,
  inviter_user_id UUID,
  invitee_family_id UUID,
  invitee_user_id UUID,
  code VARCHAR(32) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  signup_reward_paid BOOLEAN NOT NULL DEFAULT FALSE,
  signup_reward_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  active_reward_paid BOOLEAN NOT NULL DEFAULT FALSE,
  active_reward_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  welcome_reward_paid BOOLEAN NOT NULL DEFAULT FALSE,
  welcome_reward_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  signed_up_at TIMESTAMP,
  activated_at TIMESTAMP,
  source VARCHAR(64),
  ip_address VARCHAR(64),
  device_fingerprint VARCHAR(128),
  fraud_flag BOOLEAN NOT NULL DEFAULT FALSE,
  fraud_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_invites_inviter ON t_p5815085_family_assistant_pro.referral_invites(inviter_family_id);
CREATE INDEX IF NOT EXISTS idx_referral_invites_invitee ON t_p5815085_family_assistant_pro.referral_invites(invitee_family_id);
CREATE INDEX IF NOT EXISTS idx_referral_invites_status ON t_p5815085_family_assistant_pro.referral_invites(status);
CREATE INDEX IF NOT EXISTS idx_referral_invites_code ON t_p5815085_family_assistant_pro.referral_invites(code);

INSERT INTO t_p5815085_family_assistant_pro.rating_campaigns
  (slug, title, description, banner_text, period_type, starts_at, ends_at, status,
   weight_progress, weight_activity, weight_engagement, weight_referrals, min_members, min_progress)
VALUES
  ('may-2026',
   'Семья месяца — Май 2026',
   'Топ-3 самых активных семей получают призы на семейный кошелёк.',
   'До конца месяца осталось чуть-чуть! Заполняй разделы и обгоняй соседей.',
   'monthly',
   date_trunc('month', CURRENT_TIMESTAMP),
   (date_trunc('month', CURRENT_TIMESTAMP) + INTERVAL '1 month' - INTERVAL '1 second'),
   'active',
   1.00, 0.50, 0.30, 0.20, 2, 0)
ON CONFLICT (slug) DO NOTHING;

WITH c AS (SELECT id FROM t_p5815085_family_assistant_pro.rating_campaigns WHERE slug = 'may-2026')
INSERT INTO t_p5815085_family_assistant_pro.rating_prizes
  (campaign_id, place_from, place_to, amount_rub, prize_type, description, position)
SELECT c.id, 1, 1, 10000, 'wallet', 'Главный приз — Семья месяца', 0 FROM c
UNION ALL SELECT c.id, 2, 2, 5000, 'wallet', '2-е место', 1 FROM c
UNION ALL SELECT c.id, 3, 3, 3000, 'wallet', '3-е место', 2 FROM c;
