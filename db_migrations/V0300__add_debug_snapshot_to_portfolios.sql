-- Добавляем debug_snapshot и metrics_max_measured_at в member_portfolios.
-- debug_snapshot: JSONB с explain-данными последнего aggregate (хранится всегда, отдаётся по флагу).
-- metrics_max_measured_at: MAX(measured_at) по member_portfolio_metrics на момент aggregate
--   → используется для stale-detection в action=get&debug=1.
ALTER TABLE t_p5815085_family_assistant_pro.member_portfolios
    ADD COLUMN IF NOT EXISTS debug_snapshot jsonb NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS metrics_max_measured_at timestamp without time zone NULL DEFAULT NULL;