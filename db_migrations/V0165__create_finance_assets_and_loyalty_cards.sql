
CREATE TABLE IF NOT EXISTS finance_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) NOT NULL DEFAULT 'property',
  purchase_date DATE,
  purchase_price NUMERIC(15,2),
  current_value NUMERIC(15,2),
  description TEXT,
  location VARCHAR(255),
  icon VARCHAR(50) DEFAULT 'Package',
  color VARCHAR(20) DEFAULT '#3B82F6',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  store_name VARCHAR(255),
  card_number VARCHAR(100),
  barcode_data VARCHAR(500),
  barcode_type VARCHAR(20) DEFAULT 'ean13',
  category VARCHAR(50) DEFAULT 'other',
  discount_percent NUMERIC(5,2),
  cashback_percent NUMERIC(5,2),
  points_balance NUMERIC(15,2) DEFAULT 0,
  member_id UUID,
  icon VARCHAR(50) DEFAULT 'CreditCard',
  color VARCHAR(20) DEFAULT '#8B5CF6',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
