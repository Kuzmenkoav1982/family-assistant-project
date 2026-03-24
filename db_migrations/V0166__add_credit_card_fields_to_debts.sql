ALTER TABLE t_p5815085_family_assistant_pro.finance_debts
  ADD COLUMN credit_limit numeric(15,2) NULL,
  ADD COLUMN grace_period_days integer NULL,
  ADD COLUMN grace_period_end date NULL,
  ADD COLUMN grace_amount numeric(15,2) NULL,
  ADD COLUMN min_payment_pct numeric(5,2) NULL,
  ADD COLUMN bank_name character varying(100) NULL;