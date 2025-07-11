-- Add public product visibility and SEO fields
-- Run this in your Supabase SQL editor

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS public_visible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_public_visible ON products(public_visible);

-- Update existing products with slugs (only if they don't have them)
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL AND name IS NOT NULL;

-- Create RLS policy for public product access
DROP POLICY IF EXISTS "Public can view public products" ON products;
CREATE POLICY "Public can view public products" ON products
    FOR SELECT USING (public_visible = true AND active = true);

-- Create RLS policy for public price access  
DROP POLICY IF EXISTS "Public can view public product prices" ON prices;
CREATE POLICY "Public can view public product prices" ON prices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = prices.product_id 
            AND products.public_visible = true 
            AND products.active = true
        )
    );

-- Optional: Create product categories table for future use
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add category relationship to products (optional for now)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);

-- Sample data: Make existing products public (optional)
-- UPDATE products SET public_visible = true WHERE active = true;