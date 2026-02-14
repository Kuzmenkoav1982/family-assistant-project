
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_wallet_id_fkey;
ALTER TABLE family_wallet DROP CONSTRAINT IF EXISTS family_wallet_pkey;

ALTER TABLE family_wallet ALTER COLUMN family_id TYPE UUID USING NULL;
ALTER TABLE family_wallet ADD PRIMARY KEY (id);
ALTER TABLE family_wallet ADD CONSTRAINT fk_wallet_family FOREIGN KEY (family_id) REFERENCES families(id);
ALTER TABLE family_wallet ADD CONSTRAINT uq_wallet_family UNIQUE (family_id);

ALTER TABLE wallet_transactions ALTER COLUMN user_id TYPE UUID USING NULL;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES family_wallet(id);
ALTER TABLE wallet_transactions ADD CONSTRAINT fk_wallet_tx_user FOREIGN KEY (user_id) REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON wallet_transactions(created_at DESC);
