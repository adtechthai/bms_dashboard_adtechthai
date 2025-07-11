-- =====================================================
-- Stripe Connect Integration Database Schema
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Create stripe_accounts table to store admin's Stripe connection
CREATE TABLE IF NOT EXISTS public.stripe_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    stripe_account_id TEXT UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    livemode BOOLEAN DEFAULT FALSE NOT NULL,
    scope TEXT,
    stripe_publishable_key TEXT,
    account_type TEXT, -- 'standard', 'express', 'custom'
    country TEXT,
    default_currency TEXT,
    business_profile JSONB,
    capabilities JSONB,
    charges_enabled BOOLEAN DEFAULT FALSE,
    payouts_enabled BOOLEAN DEFAULT FALSE,
    details_submitted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create products table for admin's products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_product_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    images TEXT[],
    metadata JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create prices table for product pricing
CREATE TABLE IF NOT EXISTS public.prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    stripe_price_id TEXT UNIQUE NOT NULL,
    unit_amount INTEGER NOT NULL, -- amount in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    type TEXT NOT NULL CHECK (type IN ('one_time', 'recurring')),
    interval TEXT, -- 'month', 'year', etc. (for recurring)
    interval_count INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create transactions table to track payments
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    customer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    price_id UUID REFERENCES public.prices(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- amount in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL, -- 'succeeded', 'failed', 'canceled', etc.
    payment_method_types TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_purchases table to track what users have purchased
CREATE TABLE IF NOT EXISTS public.user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    access_granted BOOLEAN DEFAULT FALSE,
    access_expires_at TIMESTAMP WITH TIME ZONE, -- for subscriptions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id, transaction_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS stripe_accounts_admin_user_id_idx ON public.stripe_accounts(admin_user_id);
CREATE INDEX IF NOT EXISTS products_admin_user_id_idx ON public.products(admin_user_id);
CREATE INDEX IF NOT EXISTS products_stripe_product_id_idx ON public.products(stripe_product_id);
CREATE INDEX IF NOT EXISTS prices_product_id_idx ON public.prices(product_id);
CREATE INDEX IF NOT EXISTS prices_stripe_price_id_idx ON public.prices(stripe_price_id);
CREATE INDEX IF NOT EXISTS transactions_admin_user_id_idx ON public.transactions(admin_user_id);
CREATE INDEX IF NOT EXISTS transactions_customer_user_id_idx ON public.transactions(customer_user_id);
CREATE INDEX IF NOT EXISTS transactions_stripe_payment_intent_id_idx ON public.transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS user_purchases_user_id_idx ON public.user_purchases(user_id);
CREATE INDEX IF NOT EXISTS user_purchases_product_id_idx ON public.user_purchases(product_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS on_stripe_accounts_updated ON public.stripe_accounts;
CREATE TRIGGER on_stripe_accounts_updated
    BEFORE UPDATE ON public.stripe_accounts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_products_updated ON public.products;
CREATE TRIGGER on_products_updated
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_prices_updated ON public.prices;
CREATE TRIGGER on_prices_updated
    BEFORE UPDATE ON public.prices
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_transactions_updated ON public.transactions;
CREATE TRIGGER on_transactions_updated
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_user_purchases_updated ON public.user_purchases;
CREATE TRIGGER on_user_purchases_updated
    BEFORE UPDATE ON public.user_purchases
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stripe_accounts
CREATE POLICY "Admins can manage their own stripe account" ON public.stripe_accounts
    FOR ALL USING (admin_user_id = auth.uid());

-- Create RLS policies for products
CREATE POLICY "Admins can manage their own products" ON public.products
    FOR ALL USING (admin_user_id = auth.uid());

CREATE POLICY "Users can view active products" ON public.products
    FOR SELECT USING (active = true);

-- Create RLS policies for prices
CREATE POLICY "Admins can manage prices for their products" ON public.prices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE id = prices.product_id AND admin_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view active prices" ON public.prices
    FOR SELECT USING (
        active = true AND EXISTS (
            SELECT 1 FROM public.products 
            WHERE id = prices.product_id AND active = true
        )
    );

-- Create RLS policies for transactions
CREATE POLICY "Admins can view their transactions" ON public.transactions
    FOR SELECT USING (admin_user_id = auth.uid());

CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (customer_user_id = auth.uid());

-- Create RLS policies for user_purchases
CREATE POLICY "Users can view their own purchases" ON public.user_purchases
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view purchases of their products" ON public.user_purchases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE id = user_purchases.product_id AND admin_user_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stripe_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_purchases TO authenticated;