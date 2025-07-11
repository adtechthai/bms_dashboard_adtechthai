-- =====================================================
-- Flexible Stripe Product Mapping Schema Update
-- Makes products independent of Stripe connection
-- =====================================================

-- Make stripe_product_id nullable to allow products without Stripe
ALTER TABLE products 
ALTER COLUMN stripe_product_id DROP NOT NULL;

-- Make stripe_price_id nullable to allow prices without Stripe
ALTER TABLE prices 
ALTER COLUMN stripe_price_id DROP NOT NULL;

-- Add linking status fields
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stripe_linked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_stripe_sync TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_link_status TEXT DEFAULT 'unlinked' CHECK (stripe_link_status IN ('linked', 'unlinked', 'error'));

ALTER TABLE prices 
ADD COLUMN IF NOT EXISTS stripe_linked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_stripe_sync TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_link_status TEXT DEFAULT 'unlinked' CHECK (stripe_link_status IN ('linked', 'unlinked', 'error'));

-- Update existing records to reflect their current Stripe status
UPDATE products 
SET 
    stripe_linked = CASE 
        WHEN stripe_product_id IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END,
    stripe_link_status = CASE 
        WHEN stripe_product_id IS NOT NULL THEN 'linked' 
        ELSE 'unlinked' 
    END;

UPDATE prices 
SET 
    stripe_linked = CASE 
        WHEN stripe_price_id IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END,
    stripe_link_status = CASE 
        WHEN stripe_price_id IS NOT NULL THEN 'linked' 
        ELSE 'unlinked' 
    END;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_products_stripe_linked ON products(stripe_linked);
CREATE INDEX IF NOT EXISTS idx_products_stripe_link_status ON products(stripe_link_status);
CREATE INDEX IF NOT EXISTS idx_prices_stripe_linked ON prices(stripe_linked);
CREATE INDEX IF NOT EXISTS idx_prices_stripe_link_status ON prices(stripe_link_status);

-- Add function to automatically update stripe_linked status when stripe_product_id changes
CREATE OR REPLACE FUNCTION update_product_stripe_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stripe_linked based on stripe_product_id
    NEW.stripe_linked = (NEW.stripe_product_id IS NOT NULL);
    NEW.stripe_link_status = CASE 
        WHEN NEW.stripe_product_id IS NOT NULL THEN 'linked'
        ELSE 'unlinked'
    END;
    
    -- Update sync timestamp if stripe_product_id changed
    IF OLD.stripe_product_id IS DISTINCT FROM NEW.stripe_product_id THEN
        NEW.last_stripe_sync = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add function to automatically update stripe_linked status when stripe_price_id changes
CREATE OR REPLACE FUNCTION update_price_stripe_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stripe_linked based on stripe_price_id
    NEW.stripe_linked = (NEW.stripe_price_id IS NOT NULL);
    NEW.stripe_link_status = CASE 
        WHEN NEW.stripe_price_id IS NOT NULL THEN 'linked'
        ELSE 'unlinked'
    END;
    
    -- Update sync timestamp if stripe_price_id changed
    IF OLD.stripe_price_id IS DISTINCT FROM NEW.stripe_price_id THEN
        NEW.last_stripe_sync = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_product_stripe_status ON products;
CREATE TRIGGER trigger_update_product_stripe_status
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stripe_status();

DROP TRIGGER IF EXISTS trigger_update_price_stripe_status ON prices;
CREATE TRIGGER trigger_update_price_stripe_status
    BEFORE UPDATE ON prices
    FOR EACH ROW
    EXECUTE FUNCTION update_price_stripe_status();

-- Update RLS policies to allow products/prices without Stripe IDs
DROP POLICY IF EXISTS "Public can view public products" ON products;
CREATE POLICY "Public can view public products" ON products
    FOR SELECT USING (public_visible = true AND active = true);

DROP POLICY IF EXISTS "Public can view public product prices" ON prices;
CREATE POLICY "Public can view public product prices" ON prices
    FOR SELECT USING (
        active = true AND
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = prices.product_id 
            AND products.public_visible = true 
            AND products.active = true
        )
    );

-- Add helpful comments
COMMENT ON COLUMN products.stripe_product_id IS 'Nullable - products can exist without Stripe';
COMMENT ON COLUMN products.stripe_linked IS 'Automatically maintained - true if stripe_product_id is not null';
COMMENT ON COLUMN products.stripe_link_status IS 'Current Stripe linking status: linked, unlinked, error';
COMMENT ON COLUMN products.last_stripe_sync IS 'Timestamp of last Stripe synchronization';

COMMENT ON COLUMN prices.stripe_price_id IS 'Nullable - prices can exist without Stripe';
COMMENT ON COLUMN prices.stripe_linked IS 'Automatically maintained - true if stripe_price_id is not null';
COMMENT ON COLUMN prices.stripe_link_status IS 'Current Stripe linking status: linked, unlinked, error';
COMMENT ON COLUMN prices.last_stripe_sync IS 'Timestamp of last Stripe synchronization';