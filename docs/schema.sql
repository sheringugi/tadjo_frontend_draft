-- TAJDO — Comprehensive PostgreSQL Schema
-- Run this on any PostgreSQL 15+ instance

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS & AUTH
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  locale        TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en','de','nl')),
  two_fa_secret TEXT,              -- TOTP secret for 2FA
  two_fa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. ADDRESSES
-- ============================================================
CREATE TABLE addresses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL DEFAULT 'Home',
  line1       TEXT NOT NULL,
  line2       TEXT,
  city        TEXT NOT NULL,
  state       TEXT,
  postal_code TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'CH',
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id          TEXT PRIMARY KEY,          -- e.g. 'collars', 'leashes'
  name        TEXT NOT NULL,
  description TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. PRODUCTS
-- ============================================================
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku             TEXT UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price  NUMERIC(10,2),
  category_id     TEXT NOT NULL REFERENCES categories(id),
  image_url       TEXT,
  rating          NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count    INT NOT NULL DEFAULT 0,
  badge           TEXT CHECK (badge IN ('bestseller','new','limited')),
  material        TEXT,
  color           TEXT,
  in_stock        BOOLEAN NOT NULL DEFAULT TRUE,
  shipping_days   INT NOT NULL DEFAULT 5,
  -- Cost tracking for profit-margin analytics
  manufacturing_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  transport_cost     NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category_id);

CREATE TABLE product_specifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  spec       TEXT NOT NULL
);

-- ============================================================
-- 5. PRODUCT IMAGES (multiple per product)
-- ============================================================
CREATE TABLE product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt_text   TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

-- ============================================================
-- 6. WISHLIST
-- ============================================================
CREATE TABLE wishlists (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

-- ============================================================
-- 7. CART
-- ============================================================
CREATE TABLE cart_items (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

-- ============================================================
-- 8. ORDERS
-- ============================================================
CREATE TYPE order_status AS ENUM (
  'pending','confirmed','processing','shipped','in_transit','delivered','cancelled','returned'
);

CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      TEXT UNIQUE NOT NULL,    -- human-readable e.g. ORD-A1B2C3
  user_id           UUID NOT NULL REFERENCES users(id),
  shipping_address_id UUID REFERENCES addresses(id),
  status            order_status NOT NULL DEFAULT 'pending',
  subtotal          NUMERIC(10,2) NOT NULL,
  shipping_cost     NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax               NUMERIC(10,2) NOT NULL DEFAULT 0,
  total             NUMERIC(10,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'CHF',
  payment_method    TEXT CHECK (payment_method IN ('twint','card','klarna','stripe')),
  payment_intent_id TEXT,                     -- Stripe/Twint reference
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user   ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,       -- snapshot at time of order
  unit_price   NUMERIC(10,2) NOT NULL,
  quantity     INT NOT NULL CHECK (quantity > 0),
  total        NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- 9. ORDER STATUS HISTORY & NOTIFICATIONS
-- ============================================================
CREATE TABLE order_status_history (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status order_status,
  new_status order_status NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id   UUID REFERENCES orders(id) ON DELETE SET NULL,
  type       TEXT NOT NULL,          -- 'order_placed','shipped','delivered', etc.
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ============================================================
-- 10. SUPPLIERS
-- ============================================================
CREATE TYPE supplier_type AS ENUM ('alibaba','handmade');

CREATE TABLE suppliers (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  type                supplier_type NOT NULL,
  location            TEXT,
  contact_email       TEXT,
  contact_phone       TEXT,
  default_lead_time   INT NOT NULL DEFAULT 14,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Which supplier provides which product
CREATE TABLE product_suppliers (
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  unit_cost   NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_primary  BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (product_id, supplier_id)
);

-- ============================================================
-- 11. SUPPLIER ORDERS
-- ============================================================
CREATE TYPE supplier_order_status AS ENUM (
  'pending','confirmed','in_production','shipped','received','cancelled'
);

CREATE TABLE supplier_orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number          TEXT UNIQUE NOT NULL,     -- e.g. SO-001
  supplier_id           TEXT NOT NULL REFERENCES suppliers(id),
  customer_order_id     UUID REFERENCES orders(id),
  status                supplier_order_status NOT NULL DEFAULT 'pending',
  total_cost            NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency              TEXT NOT NULL DEFAULT 'USD',
  estimated_delivery_days INT NOT NULL DEFAULT 14,
  tracking_number       TEXT,
  notes                 TEXT,
  -- Timestamps per status
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at          TIMESTAMPTZ,
  in_production_at      TIMESTAMPTZ,
  shipped_at            TIMESTAMPTZ,
  received_at           TIMESTAMPTZ
);

CREATE INDEX idx_supplier_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX idx_supplier_orders_status   ON supplier_orders(status);

CREATE TABLE supplier_order_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_order_id UUID NOT NULL REFERENCES supplier_orders(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES products(id),
  product_name      TEXT NOT NULL,
  quantity          INT NOT NULL CHECK (quantity > 0),
  unit_cost         NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- ============================================================
-- 12. SUPPLIER PAYMENTS
-- ============================================================
CREATE TABLE supplier_payments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id       TEXT NOT NULL REFERENCES suppliers(id),
  supplier_order_id UUID REFERENCES supplier_orders(id),
  amount            NUMERIC(10,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',
  method            TEXT,             -- 'bank_transfer','paypal', etc.
  reference         TEXT,             -- payment reference / receipt
  paid_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_supplier_payments_supplier ON supplier_payments(supplier_id);

-- ============================================================
-- 13. CUSTOMER COMPLAINTS & RETURNS
-- ============================================================
CREATE TYPE complaint_status AS ENUM ('open','investigating','resolved','closed');
CREATE TYPE return_status    AS ENUM ('requested','approved','received','refunded','rejected');

CREATE TABLE complaints (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id),
  order_id   UUID REFERENCES orders(id),
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     complaint_status NOT NULL DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE returns (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  reason      TEXT NOT NULL,
  status      return_status NOT NULL DEFAULT 'requested',
  refund_amount NUMERIC(10,2),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 14. REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id),
  rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title      TEXT,
  body       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

-- ============================================================
-- 15. TAJDO RESCUE CONTRIBUTIONS
-- ============================================================
CREATE TABLE rescue_contributions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES orders(id),
  amount     NUMERIC(10,2) NOT NULL,   -- 5% of order total
  currency   TEXT NOT NULL DEFAULT 'CHF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 16. ANALYTICS HELPERS (materialized views)
-- ============================================================

-- Daily revenue snapshot
CREATE MATERIALIZED VIEW mv_daily_revenue AS
SELECT
  date_trunc('day', o.created_at)::DATE AS day,
  COUNT(*)                              AS order_count,
  SUM(o.total)                          AS revenue,
  SUM(oi.quantity * p.manufacturing_cost + oi.quantity * p.transport_cost) AS total_cost,
  SUM(o.total) - SUM(oi.quantity * p.manufacturing_cost + oi.quantity * p.transport_cost) AS profit
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
WHERE o.status NOT IN ('cancelled','returned')
GROUP BY 1
ORDER BY 1 DESC;

-- Supplier payment totals
CREATE MATERIALIZED VIEW mv_supplier_payment_totals AS
SELECT
  s.id          AS supplier_id,
  s.name        AS supplier_name,
  s.type        AS supplier_type,
  date_trunc('month', sp.paid_at)::DATE AS month,
  SUM(sp.amount) AS total_paid,
  COUNT(*)       AS payment_count
FROM supplier_payments sp
JOIN suppliers s ON s.id = sp.supplier_id
GROUP BY 1,2,3,4
ORDER BY 4 DESC;

-- ============================================================
-- 17. UTILITY FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated   BEFORE UPDATE ON orders    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_returns_updated  BEFORE UPDATE ON returns   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_status_log
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- Auto-calculate rescue contribution (5% of order total)
CREATE OR REPLACE FUNCTION auto_rescue_contribution()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO rescue_contributions (order_id, amount, currency)
  VALUES (NEW.id, ROUND(NEW.total * 0.05, 2), NEW.currency);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rescue_contribution
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION auto_rescue_contribution();
