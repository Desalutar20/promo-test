CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INT NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  activation_limit INT NOT NULL CHECK (activation_limit > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE promo_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (promo_code_id, email)
);

CREATE INDEX idx_promo_activations_promo_code_id ON promo_activations(promo_code_id);
