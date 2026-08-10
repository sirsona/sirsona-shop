-- Mctaba Shop schema
-- Mirrors the existing local database (uuid PKs, order_status enum).
-- Apply with: psql "postgresql://mctaba_user:<password>@localhost:5432/mctaba_shop" -f schema.sql

DO $$
BEGIN
  CREATE TYPE order_status AS ENUM
    ('pending', 'paid', 'failed', 'cancelled', 'shipped', 'delivered');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  image_url text,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paystack_reference text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  shipping_address text,
  payment_channel text NOT NULL
    CHECK (payment_channel IN ('card', 'mobile_money')),
  status order_status NOT NULL DEFAULT 'pending',
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS orders_phone_idx ON orders(customer_phone);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Twilio SMS webhook (server/src/routes/webhooks.js)
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  direction text,
  body text,
  order_id uuid REFERENCES orders(id),
  twilio_sid text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT NOW()
);
